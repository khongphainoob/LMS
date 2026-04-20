"""Chandra OCR Service Provider"""

import requests
from .base_ocr_provider import BaseOCRProvider, OCRProviderResult


class ChandraProvider(BaseOCRProvider):
    """Chandra OCR service provider (Vietnamese-focused OCR service)"""

    def _validate_config(self):
        """Validate Chandra API credentials"""
        if not self.api_key:
            raise ValueError("ChandraProvider: api_key is required")
        if not self.api_url:
            self.api_url = "https://api.chandra.ai/v1/ocr"

    def extract_text(self, image_data: bytes, language: str = "auto") -> OCRProviderResult:
        """Extract text using Chandra OCR API"""
        try:
            import base64
        except ImportError:
            raise ImportError("base64 is part of Python standard library")

        # Prepare request
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        # Convert image bytes to base64
        image_base64 = base64.b64encode(image_data).decode("utf-8")

        payload = {
            "image": image_base64,
            "language": language if language != "auto" else "vi_en",  # Default to Vietnamese + English
            "api_version": self.config.get("api_version", "1.0"),
        }

        if self.config.get("include_confidence"):
            payload["return_confidence"] = True

        # Make request
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=self.config.get("timeout", 30),
            )
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Chandra API request failed: {e}")

        # Parse response
        result_data = response.json()

        extracted_text = result_data.get("text", "")
        confidence = result_data.get("confidence", None)
        raw_response = result_data

        return OCRProviderResult(
            text=extracted_text,
            confidence=confidence,
            language=language,
            raw_response=raw_response,
            metadata={
                "provider": "chandra",
                "api_endpoint": self.api_url,
                "request_id": result_data.get("request_id"),
            },
        )

    def extract_text_with_boxes(self, image_data: bytes, language: str = "auto") -> dict:
        """Extract text with bounding boxes using Chandra OCR API"""
        try:
            import base64
        except ImportError:
            raise ImportError("base64 is part of Python standard library")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        image_base64 = base64.b64encode(image_data).decode("utf-8")

        payload = {
            "image": image_base64,
            "language": language if language != "auto" else "vi_en",
            "return_boxes": True,
            "return_confidence": True,
            "api_version": self.config.get("api_version", "1.0"),
        }

        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=self.config.get("timeout", 30),
            )
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Chandra API request failed: {e}")

        result_data = response.json()

        boxes = []
        full_text = []

        # Parse bounding box data from Chandra response
        for item in result_data.get("items", []):
            text = item.get("text", "")
            if text.strip():
                bbox = item.get("bbox", [])  # Expected: [x1, y1, x2, y2]
                confidence = item.get("confidence", 0)

                boxes.append({
                    "text": text,
                    "confidence": confidence,
                    "bbox": bbox,
                })
                full_text.append(text)

        return {
            "text": " ".join(full_text),
            "boxes": boxes,
            "provider": "chandra",
            "request_id": result_data.get("request_id"),
        }

    def list_supported_languages(self) -> list[str]:
        """Chandra supports Vietnamese and English primarily"""
        return ["vi", "en", "vi_en"]
