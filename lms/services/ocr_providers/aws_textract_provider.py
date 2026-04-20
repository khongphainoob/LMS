"""AWS Textract OCR Provider"""

from .base_ocr_provider import BaseOCRProvider, OCRProviderResult


class AWSTextractProvider(BaseOCRProvider):
    """Amazon AWS Textract OCR provider"""

    def _validate_config(self):
        """Validate AWS credentials"""
        if not self.api_key:
            raise ValueError("AWSTextractProvider: AWS_ACCESS_KEY_ID is required")
        if not self.config.get("secret_key"):
            raise ValueError("AWSTextractProvider: AWS_SECRET_ACCESS_KEY is required")
        self.region = self.config.get("region", "us-east-1")

    def extract_text(self, image_data: bytes, language: str = "auto") -> OCRProviderResult:
        """
        Extract text using AWS Textract.
        
        Supports both inline image (base64) and S3 object references.
        """
        try:
            import boto3
        except ImportError:
            raise ImportError("boto3 is required for AWSTextractProvider. Install with: pip install boto3")

        # Initialize Textract client
        textract = boto3.client(
            "textract",
            region_name=self.region,
            aws_access_key_id=self.api_key,
            aws_secret_access_key=self.config.get("secret_key"),
        )

        # Call Textract API
        response = textract.detect_document_text(Document={"Bytes": image_data})

        # Parse response
        text_blocks = [block for block in response.get("Blocks", []) if block["BlockType"] == "LINE"]
        extracted_text = "\n".join([block["Text"] for block in text_blocks])

        # Calculate average confidence
        confidences = [block.get("Confidence", 0) / 100 for block in text_blocks if block.get("Confidence")]
        avg_confidence = sum(confidences) / len(confidences) if confidences else None

        return OCRProviderResult(
            text=extracted_text,
            confidence=avg_confidence,
            language=language,
            raw_response=response,
            metadata={"provider": "aws_textract", "region": self.region},
        )

    def extract_text_with_boxes(self, image_data: bytes, language: str = "auto") -> dict:
        """Extract text with bounding boxes using AWS Textract"""
        try:
            import boto3
        except ImportError:
            raise ImportError("boto3 is required. Install with: pip install boto3")

        textract = boto3.client(
            "textract",
            region_name=self.region,
            aws_access_key_id=self.api_key,
            aws_secret_access_key=self.config.get("secret_key"),
        )

        response = textract.detect_document_text(Document={"Bytes": image_data})

        text_blocks = [block for block in response.get("Blocks", []) if block["BlockType"] == "LINE"]
        boxes = []
        full_text = []

        for block in text_blocks:
            geometry = block.get("Geometry", {}).get("BoundingBox", {})
            bbox = [
                geometry.get("Left", 0),
                geometry.get("Top", 0),
                geometry.get("Left", 0) + geometry.get("Width", 0),
                geometry.get("Top", 0) + geometry.get("Height", 0),
            ]

            boxes.append({
                "text": block["Text"],
                "confidence": block.get("Confidence", 0) / 100,
                "bbox": bbox,
            })
            full_text.append(block["Text"])

        return {
            "text": "\n".join(full_text),
            "boxes": boxes,
            "provider": "aws_textract",
        }

    def list_supported_languages(self) -> list[str]:
        """AWS Textract supports multiple languages"""
        return ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh"]
