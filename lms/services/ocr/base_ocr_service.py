from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class OCRRequest:
    image_data: bytes
    language: str = "auto"
    mime_type: Optional[str] = None
    preprocess: bool = True
    postprocess: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class OCRResult:
    text: str
    provider: str
    model: Optional[str] = None
    confidence: Optional[float] = None
    elapsed_ms: Optional[int] = None
    raw_response: Any = None
    warnings: list[str] = field(default_factory=list)


class BaseOCRService:
    def execute(self, request: OCRRequest) -> OCRResult:
        raise NotImplementedError
