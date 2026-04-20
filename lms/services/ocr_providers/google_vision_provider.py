"""Google Cloud Vision OCR Provider"""

from .base_ocr_provider import BaseOCRProvider, OCRProviderResult


class GoogleVisionProvider(BaseOCRProvider):
    """Google Cloud Vision API OCR provider"""

    def _validate_config(self):
        """Validate Google credentials"""
        if not self.api_key:
            raise ValueError("GoogleVisionProvider: api_key (service account JSON path or key) is required")

    def extract_text(self, image_data: bytes, language: str = "auto") -> OCRProviderResult:
        """Extract text using Google Cloud Vision OCR"""
        try:
            from google.cloud import vision
        except ImportError:
            raise ImportError(
                "google-cloud-vision is required. Install with: pip install google-cloud-vision"
            )

        # Initialize client with service account key if provided
        if self.config.get("service_account_path"):
            import os

            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.config["service_account_path"]

        client = vision.ImageAnnotatorClient()

        # Prepare image
        image = vision.Image(content=image_data)

        # Call Vision API
        response = client.document_text_detection(image=image)
        full_annotation = response.full_text_annotation

        # Extract text
        extracted_text = full_annotation.text if full_annotation else ""

        # Calculate average confidence from pages
        confidences = []
        for page in full_annotation.pages if full_annotation else []:
            for block in page.blocks:
                for paragraph in block.paragraphs:
                    for word in paragraph.words:
                        if word.confidence:
                            confidences.append(word.confidence)

        avg_confidence = sum(confidences) / len(confidences) if confidences else None

        return OCRProviderResult(
            text=extracted_text,
            confidence=avg_confidence,
            language=language,
            raw_response={"pages": len(full_annotation.pages) if full_annotation else 0},
            metadata={"provider": "google_vision", "request_id": response.request_id if response else None},
        )

    def extract_text_with_boxes(self, image_data: bytes, language: str = "auto") -> dict:
        """Extract text with bounding boxes using Google Vision"""
        try:
            from google.cloud import vision
        except ImportError:
            raise ImportError("google-cloud-vision is required. Install with: pip install google-cloud-vision")

        if self.config.get("service_account_path"):
            import os

            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.config["service_account_path"]

        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_data)
        response = client.document_text_detection(image=image)

        boxes = []
        full_text = []

        full_annotation = response.full_text_annotation
        if full_annotation:
            for page in full_annotation.pages:
                for block in page.blocks:
                    for paragraph in block.paragraphs:
                        for word in paragraph.words:
                            word_text = "".join(symbol.text for symbol in word.symbols)
                            vertices = word.bounding_box.vertices

                            bbox = [
                                min(v.x for v in vertices),
                                min(v.y for v in vertices),
                                max(v.x for v in vertices),
                                max(v.y for v in vertices),
                            ]

                            boxes.append({
                                "text": word_text,
                                "confidence": word.confidence or 0,
                                "bbox": bbox,
                            })
                            full_text.append(word_text)

        return {
            "text": " ".join(full_text),
            "boxes": boxes,
            "provider": "google_vision",
        }

    def list_supported_languages(self) -> list[str]:
        """Google Vision supports 40+ languages including Vietnamese"""
        return [
            "en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh", "ar",
            "ru", "hi", "vi", "th", "id", "tl", "tr", "pl", "nl", "uk"
        ]
