def predict_category(vendor_name, ocr_text):
    """
    Smart category prediction using simple keyword matching.
    """
    vendor_name = (vendor_name or "").lower()
    ocr_text = (ocr_text or "").lower()
    
    combined_text = vendor_name + " " + ocr_text

    categories = {
        'Fuel': ['petrol', 'diesel', 'fuel', 'pump', 'gas station', 'shell', 'indian oil', 'hp'],
        'Travel': ['uber', 'ola', 'flight', 'indigo', 'hotel', 'makemytrip', 'irctc', 'train', 'bus'],
        'Repair': ['service', 'repair', 'mechanic', 'garage', 'spare parts', 'hardware'],
        'Courier': ['fedex', 'dhl', 'bluedart', 'post', 'delivery', 'courier', 'shipping'],
    }

    for category, keywords in categories.items():
        if any(keyword in combined_text for keyword in keywords):
            return category
            
    return 'Other'
