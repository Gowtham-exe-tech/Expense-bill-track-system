import os
import re
import uuid
from datetime import datetime

import pytesseract
from PIL import Image

try:
    import cv2
except ImportError:
    cv2 = None

try:
    import fitz
except ImportError:
    fitz = None

TESSERACT_CMD = os.getenv('TESSERACT_CMD', '').strip()
if TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD


CATEGORY_KEYWORDS = {
    'Travel': ['uber', 'ola', 'taxi', 'bus', 'train', 'flight', 'airline', 'hotel'],
    'Fuel': ['fuel', 'petrol', 'diesel', 'pump', 'gas station'],
    'Repair': ['repair', 'service center', 'garage', 'mechanic', 'maintenance'],
    'Courier': ['courier', 'delivery', 'dispatch', 'shipment', 'bluedart', 'dhl', 'fedex'],
    'Office Supplies': ['stationery', 'paper', 'notebook', 'pen', 'printer', 'toner', 'office supplies'],
}


def _preprocess_image(image):
    """Enhance image for OCR."""
    if cv2 is None:
        return Image.open(image)
    img = cv2.imread(image) if isinstance(image, str) else image
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    denoise = cv2.fastNlMeansDenoising(gray, None, 30, 7, 21)
    thresh = cv2.adaptiveThreshold(
        denoise, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 9
    )
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
    sharpen = cv2.filter2D(thresh, -1, kernel)
    return sharpen


def _ocr_image(image_path):
    """Perform OCR on image using pytesseract."""
    try:
        img = _preprocess_image(image_path)
        text1 = pytesseract.image_to_string(img, config='--oem 3 --psm 6')
        text2 = pytesseract.image_to_string(img, config='--oem 3 --psm 11')
        return f"{text1}\n{text2}".strip()
    except Exception:
        try:
            img = Image.open(image_path)
            return pytesseract.image_to_string(img)
        except Exception:
            return ""


def _extract_text_from_pdf(pdf_path):
    """Extract text from PDF; fallback to OCR if needed."""
    if fitz is None:
        return ""
    chunks = []
    with fitz.open(pdf_path) as pdf:
        for page in pdf:
            text = (page.get_text("text") or "").strip()
            if text:
                chunks.append(text)
            if len(text) < 30:
                # Fallback OCR
                pix = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5))
                tmp_file = os.path.join(os.path.dirname(pdf_path), f"_ocr_{uuid.uuid4().hex}.png")
                pix.save(tmp_file)
                chunks.append(_ocr_image(tmp_file))
                if os.path.exists(tmp_file):
                    os.remove(tmp_file)
    return "\n".join(c for c in chunks if c)


def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return _extract_text_from_pdf(file_path)
    return _ocr_image(file_path)


def extract_text_from_image(file_path):
    """Compatibility wrapper for existing integrations."""
    return extract_text(file_path)


def _parse_date(text):
    patterns = [
        r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b',
        r'\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b'
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            raw = m.group(1).replace('/', '-')
            for fmt in ("%d-%m-%Y", "%d-%m-%y", "%Y-%m-%d", "%m-%d-%Y", "%m-%d-%y"):
                try:
                    return datetime.strptime(raw, fmt).date().isoformat()
                except ValueError:
                    continue
    return None


def _parse_amount(text):
    text = text.lower().replace(',', '')
    currency_pat = r'(?:₹|rs\.?|inr|amount|total)\s*[:\-]?\s*(\d+(\.\d{1,2})?)'
    m = re.search(currency_pat, text)
    if m:
        return float(m.group(1))
    # fallback: take largest number in text
    nums = re.findall(r'\b\d{1,7}(?:\.\d{1,2})?\b', text)
    if nums:
        return max(float(n) for n in nums)
    return None


def _extract_vendor(text):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for line in lines[:6]:
        alpha_ratio = sum(c.isalpha() for c in line) / max(len(line), 1)
        if alpha_ratio > 0.35 and not re.search(r'invoice|bill no|gst|tax|date', line, re.I):
            return line[:255]
    return lines[0][:255] if lines else None


def _detect_category(text):
    text = (text or "").lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(k in text for k in keywords):
            return cat
    return "Other"


def parse_ocr_text(text):
    return {
        "vendor_name": _extract_vendor(text),
        "amount": _parse_amount(text),
        "price": _parse_amount(text),
        "bill_date": _parse_date(text),
        "category": _detect_category(text)
    }
