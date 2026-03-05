import pytesseract
from PIL import Image
try:
    import cv2
except Exception:
    cv2 = None
try:
    import fitz
except Exception:
    fitz = None
import re
from datetime import datetime
import os
import uuid

# Windows tesseract path - Needs to be configured by the user if it's not in PATH
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def _ocr_image_with_cv2(image_path):
    if cv2 is None:
        img = Image.open(image_path)
        return pytesseract.image_to_string(img)

    image = cv2.imread(image_path)
    if image is None:
        img = Image.open(image_path)
        return pytesseract.image_to_string(img)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresholded = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return pytesseract.image_to_string(thresholded, config='--oem 3 --psm 6')


def _extract_text_from_pdf(pdf_path):
    if fitz is None:
        return ""

    text_chunks = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            native_text = page.get_text("text") or ""
            text_chunks.append(native_text)
            if len(native_text.strip()) < 20:
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                temp_image = os.path.join(os.path.dirname(pdf_path), f"_ocr_temp_{uuid.uuid4().hex}.png")
                pix.save(temp_image)
                text_chunks.append(_ocr_image_with_cv2(temp_image))
                if os.path.exists(temp_image):
                    os.remove(temp_image)
    return "\n".join(text_chunks)


def extract_text_from_image(image_path):
    try:
        extension = os.path.splitext(image_path)[1].lower()
        if extension == ".pdf":
            return _extract_text_from_pdf(image_path)
        return _ocr_image_with_cv2(image_path)
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

def parse_ocr_text(text):
    """
    Attempts to extract vendor name, amount, and date from OCR text.
    """
    data = {
        'vendor_name': None,
        'amount': None,
        'bill_date': None
    }
    
    # Simple regex for amount (e.g., $100.50, 100.50, Rs. 500)
    amount_match = re.search(r'(?:Rs\.?\s*|INR\s*|\$\s*|Amount:?\s*)([\d,]+(?:\.\d{1,2})?)', text, re.IGNORECASE)
    if amount_match:
        data['amount'] = float(amount_match.group(1).replace(',', ''))
    else:
        amounts = re.findall(r'\b\d+(?:\.\d{1,2})\b', text)
        if amounts:
            data['amount'] = max([float(a) for a in amounts])

    # Simple regex for date (DD/MM/YYYY, YYYY-MM-DD, etc)
    date_match = re.search(r'\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b', text)
    if date_match:
        raw_date = date_match.group(1).replace('/', '-')
        for fmt in ("%d-%m-%Y", "%d-%m-%y", "%Y-%m-%d", "%m-%d-%Y", "%m-%d-%y"):
            try:
                parsed = datetime.strptime(raw_date, fmt)
                data['bill_date'] = parsed.date().isoformat()
                break
            except ValueError:
                continue

    # Vendor name: typically first or second non-empty line
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        data['vendor_name'] = lines[0]
        
    return data
