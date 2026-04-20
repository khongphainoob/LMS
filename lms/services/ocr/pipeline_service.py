from __future__ import annotations

from typing import Any, Dict, Optional

from .base_ocr_service import OCRRequest, OCRResult
from .postprocess_service import OCRPostprocessService
from .preprocess_service import OCRPreprocessService
from .provider_ocr_service import ProviderOCRService


class OCRPipelineService:
    """Orchestrates OCR services in sequence: preprocess -> provider -> postprocess."""

    def __init__(
        self,
        provider_name: str,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        api_url: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ):
        self.preprocess_service = OCRPreprocessService()
        self.provider_service = ProviderOCRService(
            provider_name=provider_name,
            api_key=api_key,
            model_name=model_name,
            api_url=api_url,
            config=config,
        )
        self.postprocess_service = OCRPostprocessService()

    def execute(self, request: OCRRequest) -> OCRResult:
        image_data = request.image_data

        if request.preprocess:
            image_data = self.preprocess_service.preprocess(image_data)

        provider_request = OCRRequest(
            image_data=image_data,
            language=request.language,
            mime_type=request.mime_type,
            preprocess=False,
            postprocess=request.postprocess,
            metadata=request.metadata,
        )

        result = self.provider_service.execute(provider_request)

        if request.postprocess:
            result.text = self.postprocess_service.clean_text(result.text)

        return result
