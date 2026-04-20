from __future__ import annotations

import time
from typing import Any, Dict, Optional

from lms.services.ocr_providers import OCRProviderFactory

from .base_ocr_service import BaseOCRService, OCRRequest, OCRResult


class ProviderOCRService(BaseOCRService):
    """Adapter for OCR provider services"""

    def __init__(
        self,
        provider_name: str,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        api_url: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ):
        """
        Initialize OCR provider service adapter.
        
        Args:
            provider_name: Name of OCR provider (aws, google, azure, tesseract, easyocr, chandra)
            api_key: API key for the provider
            model_name: Model name if applicable
            api_url: API URL if applicable
            config: Additional configuration dictionary
        """
        self.provider_name = provider_name
        self.model_name = model_name
        self.provider = OCRProviderFactory.get_provider(
            provider_name=provider_name,
            api_key=api_key,
            model_name=model_name,
            api_url=api_url,
            config=config,
        )

    def execute(self, request: OCRRequest) -> OCRResult:
        """Execute OCR using provider"""
        start = time.time()

        # Call provider's extract_text method
        result = self.provider.extract_text(request.image_data, language=request.language)

        elapsed_ms = int((time.time() - start) * 1000)

        return OCRResult(
            text=result.text,
            provider=self.provider_name,
            model=self.model_name,
            confidence=result.confidence,
            elapsed_ms=elapsed_ms,
            raw_response=result.raw_response,
        )
