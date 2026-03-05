try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
except Exception:
    TfidfVectorizer = None
    MultinomialNB = None


TRAINING_TEXTS = [
    "uber trip airport taxi train bus flight hotel booking",  # Travel
    "indigo airline ticket metro ticket cab fare",
    "petrol diesel fuel station pump shell hp iocl",  # Fuel
    "car fuel refill petrol bill fuel surcharge",
    "service center mechanic garage spare parts maintenance",  # Repair
    "bike repair labor workshop maintenance charge",
    "courier shipment tracking fedex dhl bluedart dispatch",  # Courier
    "parcel delivery logistics shipping post office",
    "printer paper pen notebook stapler toner office stationary",  # Office Supplies
    "office supplies cleaning material marker files stationery",
]

TRAINING_LABELS = [
    "Travel",
    "Travel",
    "Fuel",
    "Fuel",
    "Repair",
    "Repair",
    "Courier",
    "Courier",
    "Office Supplies",
    "Office Supplies",
]


_MODEL = None
_VECTORIZER = None


def _train_model():
    global _MODEL, _VECTORIZER
    if TfidfVectorizer is None or MultinomialNB is None:
        return False

    _VECTORIZER = TfidfVectorizer(ngram_range=(1, 2))
    X_train = _VECTORIZER.fit_transform(TRAINING_TEXTS)
    _MODEL = MultinomialNB()
    _MODEL.fit(X_train, TRAINING_LABELS)
    return True


def predict_category(vendor_name, ocr_text):
    combined_text = f"{vendor_name or ''} {ocr_text or ''}".strip().lower()
    if not combined_text:
        return "Other"

    if _MODEL is None and not _train_model():
        # Fallback when sklearn is unavailable.
        keyword_map = {
            "Fuel": ["petrol", "diesel", "fuel", "pump", "shell", "iocl", "hp"],
            "Travel": ["uber", "ola", "flight", "hotel", "indigo", "train", "bus", "taxi"],
            "Repair": ["service", "repair", "mechanic", "garage", "maintenance"],
            "Courier": ["courier", "fedex", "dhl", "bluedart", "shipping", "delivery"],
            "Office Supplies": ["stationery", "paper", "notebook", "pen", "printer", "toner", "office supplies"],
        }
        for category, keywords in keyword_map.items():
            if any(word in combined_text for word in keywords):
                return category
        return "Other"

    features = _VECTORIZER.transform([combined_text])
    predicted = _MODEL.predict(features)[0]
    return predicted if predicted else "Other"
