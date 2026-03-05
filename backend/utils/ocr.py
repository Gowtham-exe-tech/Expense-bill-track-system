import pytesseract
from PIL import Image
import re
from datetime import datetime

# Windows tesseract path - Needs to be configured by the user if it's not in PATH
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_from_image(image_path):
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text
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
    amount_match = re.search(r'(?:Rs\.?\s*|\$\s*|Amount:?\s*)([\d,]+\.\d{2})', text, re.IGNORECASE)
    if amount_match:
        data['amount'] = float(amount_match.group(1).replace(',', ''))
    else:
        # Fallback to finding the largest number that looks like an amount
        amounts = re.findall(r'\b\d+\.\d{2}\b', text)
        if amounts:
            data['amount'] = max([float(a) for a in amounts])

    # Simple regex for date (DD/MM/YYYY, YYYY-MM-DD, etc)
    date_match = re.search(r'\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b', text)
    if date_match:
        # We won't parse it fully to a datetime object here, just suggest the string
        # Let frontend/user adjust it. Or parse using basic formats.
        data['bill_date'] = date_match.group(1)

    # Vendor name: typically first or second non-empty line
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        data['vendor_name'] = lines[0] # Very naive approach, best for simple receipts
        
    return data
