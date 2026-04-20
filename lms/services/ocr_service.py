from __future__ import annotations

from importlib import import_module
from typing import Iterable


class OCRService:
    """Backward-compatible facade for OCR pipeline services."""

    def __init__(
        self,
        provider_name: str,
        api_key: str = None,
        model_name: str = None,
        api_url: str = None,
        config: dict = None,
    ):
        # Lazy import to avoid hard import dependency at module load time.
        batch_service_cls = self._load_class("lms.services.ocr.batch_ocr_service", "BatchOCRService")
        pipeline_service_cls = self._load_class("lms.services.ocr.pipeline_service", "OCRPipelineService")
        self._ocr_request_cls = self._load_class("lms.services.ocr.base_ocr_service", "OCRRequest")

        self.pipeline = pipeline_service_cls(
            provider_name=provider_name,
            api_key=api_key,
            model_name=model_name,
            api_url=api_url,
            config=config,
        )
        self.batch_service = batch_service_cls(self.pipeline)

    @staticmethod
    def _load_class(module_path: str, class_name: str):
        module = import_module(module_path)
        return getattr(module, class_name)

    def _build_request(self, image_data: bytes, **kwargs):
        return self._ocr_request_cls(image_data=image_data, **kwargs)

    def perform_ocr(self, image_data: bytes) -> str:
        """Legacy API: return only extracted text."""
        request = self._build_request(image_data=image_data)
        result = self.pipeline.execute(request)
        return result.text

    def perform_ocr_with_meta(
        self,
        image_data: bytes,
        language: str = "auto",
        preprocess: bool = True,
        postprocess: bool = True,
    ):
        request = self._build_request(
            image_data=image_data,
            language=language,
            preprocess=preprocess,
            postprocess=postprocess,
        )
        return self.pipeline.execute(request)

    def perform_batch_ocr(self, images: Iterable[bytes], continue_on_error: bool = True):
        requests = [self._build_request(image_data=image) for image in images]
        return self.batch_service.execute(requests, continue_on_error=continue_on_error)


# Usage example:
# ocr_service = OCRService(provider_name="kyma", api_key="your_kyma_api_key", model_name="gemini-2.5-flash")
# text_result = ocr_service.perform_ocr(image_data)
# meta_result = ocr_service.perform_ocr_with_meta(image_data)
