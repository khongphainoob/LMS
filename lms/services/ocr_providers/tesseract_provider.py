"""Tesseract OCR Provider (Open Source)"""

from .base_ocr_provider import BaseOCRProvider, OCRProviderResult


class TesseractProvider(BaseOCRProvider):
    """Tesseract OCR provider - open source, runs locally"""

    def _validate_config(self):
        """Tesseract doesn't require API key"""
        # Tesseract is open source, no API key needed
        # But we check if it's installed
        try:
            import pytesseract

            pytesseract.get_tesseract_version()
        except Exception as e:
            raise RuntimeError(
                f"Tesseract is not properly installed: {e}. "
                "Install with: pip install pytesseract && apt-get install tesseract-ocr"
            )

    def extract_text(self, image_data: bytes, language: str = "auto") -> OCRProviderResult:
        """Extract text using Tesseract OCR"""
        try:
            import pytesseract
            from PIL import Image
            import io
        except ImportError:
            raise ImportError(
                "pytesseract and Pillow are required. Install with: pip install pytesseract pillow"
            )

        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_data))

        # Map language code to Tesseract lang
        lang_map = {
            "auto": None,  # Tesseract auto-detects
            "en": "eng",
            "vi": "vie",
            "es": "spa",
            "fr": "fra",
            "de": "deu",
            "zh": "chi_sim",
            "ja": "jpn",
            "ko": "kor",
        }
        tess_lang = lang_map.get(language, None)

        # Extract text
        extracted_text = pytesseract.image_to_string(image, lang=tess_lang)

        # Get detailed data for confidence
        data = pytesseract.image_to_data(image, lang=tess_lang, output_type=pytesseract.Output.DICT)

        # Calculate average confidence
        confidences = [int(conf) / 100 for conf in data["conf"] if int(conf) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else None

        return OCRProviderResult(
            text=extracted_text,
            confidence=avg_confidence,
            language=language,
            raw_response=None,
            metadata={"provider": "tesseract", "language": tess_lang},
        )

    def extract_text_with_boxes(self, image_data: bytes, language: str = "auto") -> dict:
        """Extract text with bounding boxes using Tesseract"""
        try:
            import pytesseract
            from PIL import Image
            import io
        except ImportError:
            raise ImportError(
                "pytesseract and Pillow are required. Install with: pip install pytesseract pillow"
            )

        image = Image.open(io.BytesIO(image_data))

        lang_map = {
            "auto": None,
            "en": "eng",
            "vi": "vie",
            "es": "spa",
            "fr": "fra",
            "de": "deu",
            "zh": "chi_sim",
            "ja": "jpn",
            "ko": "kor",
        }
        tess_lang = lang_map.get(language, None)

        # Get detailed data with bounding boxes
        data = pytesseract.image_to_data(image, lang=tess_lang, output_type=pytesseract.Output.DICT)

        boxes = []
        full_text = []

        n_boxes = len(data["level"])
        for i in range(n_boxes):
            # Only include word-level boxes
            if data["level"][i] == 5:  # level 5 = word
                text = data["text"][i]
                if text.strip():
                    bbox = [
                        data["left"][i],
                        data["top"][i],
                        data["left"][i] + data["width"][i],
                        data["top"][i] + data["height"][i],
                    ]
                    conf = int(data["conf"][i]) / 100 if int(data["conf"][i]) > 0 else 0

                    boxes.append({
                        "text": text,
                        "confidence": conf,
                        "bbox": bbox,
                    })
                    full_text.append(text)

        return {
            "text": " ".join(full_text),
            "boxes": boxes,
            "provider": "tesseract",
        }

    def list_supported_languages(self) -> list[str]:
        """Tesseract supports 100+ languages (returns common ones)"""
        return [
            "en", "vi", "es", "fr", "de", "it", "pt", "ja", "ko", "zh",
            "ar", "ru", "hi", "th", "id", "tl", "tr", "pl", "nl", "uk"
        ]
