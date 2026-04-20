from __future__ import annotations

from typing import Iterable, List

from .base_ocr_service import OCRRequest, OCRResult
from .pipeline_service import OCRPipelineService


class BatchOCRService:
    """Batch OCR execution helper for multi-page or multi-file workflows."""

    def __init__(self, pipeline_service: OCRPipelineService):
        self.pipeline_service = pipeline_service

    def execute(self, requests: Iterable[OCRRequest], continue_on_error: bool = True) -> List[OCRResult]:
        results: List[OCRResult] = []

        for request in requests:
            try:
                results.append(self.pipeline_service.execute(request))
            except Exception as error:
                if not continue_on_error:
                    raise
                results.append(
                    OCRResult(
                        text="",
                        provider=self.pipeline_service.provider_service.provider_name,
                        model=self.pipeline_service.provider_service.model_name,
                        raw_response=None,
                        warnings=[str(error)],
                    )
                )

        return results
