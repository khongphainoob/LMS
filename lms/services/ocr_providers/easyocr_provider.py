"""EasyOCR Provider (AI-based local OCR)"""

from .base_ocr_provider import BaseOCRProvider, OCRProviderResult


class EasyOCRProvider(BaseOCRProvider):
    """EasyOCR provider - AI-powered, runs locally, supports 80+ languages"""

    def __init__(self, config: dict = None):
        """Initialize EasyOCR provider"""
        super().__init__(config)
        self._reader = None

    def _validate_config(self):
        """EasyOCR doesn't require API key"""
        try:
            import easyocr

            # Check if model can be downloaded/loaded
            self._get_reader()
        except Exception as e:
            raise RuntimeError(
                f"EasyOCR is not properly installed: {e}. "
                "Install with: pip install easyocr"
            )

    def _get_reader(self):
        """Lazy load EasyOCR reader"""
        if self._reader is None:
            try:
                import easyocr
            except ImportError:
                raise ImportError("easyocr is required. Install with: pip install easyocr")

            # Get language config
            languages = self.config.get("languages", ["vi", "en"])
            gpu = self.config.get("gpu", False)

            self._reader = easyocr.Reader(languages, gpu=gpu)

        return self._reader

    def extract_text(self, image_data: bytes, language: str = "auto") -> OCRProviderResult:
        """Extract text using EasyOCR"""
        try:
            from PIL import Image
            import io
        except ImportError:
            raise ImportError("Pillow is required. Install with: pip install pillow")

        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_data))

        reader = self._get_reader()

        # Perform OCR
        results = reader.readtext(image, detail=1)

        # Extract text
        extracted_text = "\n".join([result[1] for result in results])

        # Calculate average confidence
        confidences = [result[2] for result in results if result[2] > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else None

        return OCRProviderResult(
            text=extracted_text,
            confidence=avg_confidence,
            language=language,
            raw_response=None,
            metadata={
                "provider": "easyocr",
                "model_languages": self.config.get("languages", ["vi", "en"]),
            },
        )

    def extract_text_with_boxes(self, image_data: bytes, language: str = "auto") -> dict:
        """Extract text with bounding boxes using EasyOCR"""
        try:
            from PIL import Image
            import io
        except ImportError:
            raise ImportError("Pillow is required. Install with: pip install pillow")

        image = Image.open(io.BytesIO(image_data))

        reader = self._get_reader()

        # Perform OCR with detailed results
        results = reader.readtext(image, detail=1)

        boxes = []
        full_text = []

        for detection in results:
            bbox_points = detection[0]  # List of 4 corner points
            text = detection[1]
            confidence = detection[2]

            # Convert quad points to axis-aligned bbox
            xs = [point[0] for point in bbox_points]
            ys = [point[1] for point in bbox_points]
            bbox = [min(xs), min(ys), max(xs), max(ys)]

            boxes.append({
                "text": text,
                "confidence": confidence,
                "bbox": bbox,
            })
            full_text.append(text)

        return {
            "text": " ".join(full_text),
            "boxes": boxes,
            "provider": "easyocr",
        }

    def list_supported_languages(self) -> list[str]:
        """EasyOCR supports 80+ languages including Vietnamese"""
        return [
            "en", "vi", "es", "fr", "de", "it", "pt", "ja", "ko", "zh",
            "ar", "ru", "hi", "th", "id", "tl", "tr", "pl", "nl", "uk",
            "cs", "da", "sv", "fi", "et", "hu", "lt", "lv", "ro", "sk",
            "bg", "hr", "sr", "sl", "mk", "be", "ky", "kk", "mn", "ta",
            "te", "kn", "ml", "bn", "ur", "pa", "gu", "or", "as", "fa"
        ]
