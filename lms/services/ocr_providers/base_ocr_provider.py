"""
Base OCR Provider Interface

All OCR providers should inherit from this class and implement the required methods.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class OCRProviderResult:
    """Standard result structure for OCR operations"""
    text: str
    confidence: Optional[float] = None
    language: Optional[str] = None
    raw_response: Optional[dict] = None
    metadata: Optional[dict] = None


class BaseOCRProvider(ABC):
    """Abstract base class for OCR providers"""

    def __init__(self, config: dict = None):
        """
        Initialize OCR provider with configuration.
        
        Args:
            config: Dictionary containing provider-specific configuration
                   (api_key, api_url, model_name, etc.)
        """
        self.config = config or {}
        self.api_key = self.config.get("api_key")
        self.model_name = self.config.get("model_name")
        self.api_url = self.config.get("api_url")
        self._validate_config()

    def _validate_config(self):
        """Validate required configuration. Override in subclass if needed."""
        if not self.api_key:
            raise ValueError(f"{self.__class__.__name__}: api_key is required")

    @abstractmethod
    def extract_text(self, image_data: bytes, language: str = "auto") -> OCRProviderResult:
        """
        Extract text from image.
        
        Args:
            image_data: Image bytes (PNG, JPEG, etc.)
            language: Language hint (e.g., "en", "vi", "auto")
            
        Returns:
            OCRProviderResult with extracted text and metadata
        """
        pass

    @abstractmethod
    def extract_text_with_boxes(self, image_data: bytes, language: str = "auto") -> dict:
        """
        Extract text with bounding boxes (if supported).
        
        Args:
            image_data: Image bytes
            language: Language hint
            
        Returns:
            dict with text and bounding box information:
            {
                "text": "...",
                "boxes": [
                    {"text": "...", "confidence": 0.9, "bbox": [x1, y1, x2, y2]},
                    ...
                ]
            }
        """
        pass

    @abstractmethod
    def list_supported_languages(self) -> list[str]:
        """Return list of supported language codes"""
        pass

    def get_provider_name(self) -> str:
        """Get provider name"""
        return self.__class__.__name__

    def get_provider_info(self) -> dict:
        """Get provider information"""
        return {
            "name": self.get_provider_name(),
            "api_key_required": True,
            "supported_languages": self.list_supported_languages(),
            "config": {k: v for k, v in self.config.items() if k != "api_key"},
        }
