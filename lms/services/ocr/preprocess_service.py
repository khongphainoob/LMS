from __future__ import annotations

import base64


class OCRPreprocessService:
    """Lightweight image preprocessing/normalization before OCR provider call."""

    def normalize_image_bytes(self, image_data) -> bytes:
        if isinstance(image_data, bytes):
            return image_data

        if isinstance(image_data, str):
            payload = image_data
            if image_data.startswith("data:") and "," in image_data:
                payload = image_data.split(",", 1)[1]
            return base64.b64decode(payload)

        raise ValueError("Unsupported image payload for OCR. Expected bytes or base64 string.")

    def preprocess(self, image_data) -> bytes:
        # Place for future image denoise/deskew pipeline.
        return self.normalize_image_bytes(image_data)
