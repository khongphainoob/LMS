"""Microsoft Azure Computer Vision OCR Provider"""

from .base_ocr_provider import BaseOCRProvider, OCRProviderResult


class AzureVisionProvider(BaseOCRProvider):
    """Microsoft Azure Computer Vision API OCR provider"""

    def _validate_config(self):
        """Validate Azure credentials"""
        if not self.api_key:
            raise ValueError("AzureVisionProvider: api_key is required")
        if not self.config.get("endpoint"):
            raise ValueError("AzureVisionProvider: endpoint is required")

    def extract_text(self, image_data: bytes, language: str = "auto") -> OCRProviderResult:
        """Extract text using Azure Computer Vision"""
        try:
            from azure.cognitiveservices.vision.computervision import ComputerVisionClient
            from msrest.authentication import CognitiveServicesCredentials
        except ImportError:
            raise ImportError(
                "azure-cognitiveservices-vision-computervision is required. "
                "Install with: pip install azure-cognitiveservices-vision-computervision msrest"
            )

        # Initialize client
        credentials = CognitiveServicesCredentials(self.api_key)
        client = ComputerVisionClient(endpoint=self.config["endpoint"], credentials=credentials)

        # Send request
        results = client.read_in_stream(image_data, language=language if language != "auto" else None)

        # Parse response
        extracted_text = ""
        confidences = []

        # Poll for results
        import time

        while results.status not in ["succeeded", "failed"]:
            time.sleep(1)
            results = client.get_read_result(results.operation_id)

        if results.status == "succeeded":
            for page in results.analyze_result.read_results:
                for line in page.lines:
                    extracted_text += line.text + "\n"
                    # Azure provides word-level confidence
                    for word in line.words:
                        if hasattr(word, "confidence"):
                            confidences.append(word.confidence)

        avg_confidence = sum(confidences) / len(confidences) if confidences else None

        return OCRProviderResult(
            text=extracted_text.strip(),
            confidence=avg_confidence,
            language=language,
            raw_response={"operation_id": results.operation_id if results else None},
            metadata={"provider": "azure_vision", "endpoint": self.config["endpoint"]},
        )

    def extract_text_with_boxes(self, image_data: bytes, language: str = "auto") -> dict:
        """Extract text with bounding boxes using Azure Vision"""
        try:
            from azure.cognitiveservices.vision.computervision import ComputerVisionClient
            from msrest.authentication import CognitiveServicesCredentials
        except ImportError:
            raise ImportError(
                "azure-cognitiveservices-vision-computervision is required. "
                "Install with: pip install azure-cognitiveservices-vision-computervision msrest"
            )

        credentials = CognitiveServicesCredentials(self.api_key)
        client = ComputerVisionClient(endpoint=self.config["endpoint"], credentials=credentials)

        results = client.read_in_stream(image_data, language=language if language != "auto" else None)

        boxes = []
        full_text = []

        import time

        while results.status not in ["succeeded", "failed"]:
            time.sleep(1)
            results = client.get_read_result(results.operation_id)

        if results.status == "succeeded":
            for page in results.analyze_result.read_results:
                for line in page.lines:
                    # Get bounding box from line
                    bbox = line.bounding_box if hasattr(line, "bounding_box") else []
                    if bbox:
                        boxes.append({
                            "text": line.text,
                            "confidence": getattr(line, "confidence", 0),
                            "bbox": bbox,
                        })
                    full_text.append(line.text)

        return {
            "text": "\n".join(full_text),
            "boxes": boxes,
            "provider": "azure_vision",
        }

    def list_supported_languages(self) -> list[str]:
        """Azure Vision supports 70+ languages"""
        return [
            "en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh", "ar",
            "ru", "hi", "vi", "th", "id", "tl", "tr", "pl", "nl", "uk",
            "cs", "da", "fi", "sv", "et", "hu", "lt", "lv", "ro", "sk"
        ]
