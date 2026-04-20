"""OCR Providers Package

This package contains multiple OCR provider implementations:
- AWS Textract: AWS cloud-based OCR service
- Google Vision: Google Cloud Vision API for OCR
- Azure Vision: Microsoft Azure Computer Vision API
- Tesseract: Open-source OCR engine (local)
- EasyOCR: AI-powered local OCR supporting 80+ languages
- Chandra: Vietnamese-focused OCR service

Usage:
    from lms.services.ocr_providers import OCRProviderFactory
    
    provider = OCRProviderFactory.get_provider(
        "google",
        api_key="your_api_key",
        config={"service_account_path": "/path/to/service_account.json"}
    )
    
    result = provider.extract_text(image_data)
    print(result.text)
    
    result_with_boxes = provider.extract_text_with_boxes(image_data)
    print(result_with_boxes["boxes"])
"""

from .base_ocr_provider import BaseOCRProvider, OCRProviderResult
from .factory import OCRProviderFactory
from .aws_textract_provider import AWSTextractProvider
from .google_vision_provider import GoogleVisionProvider
from .azure_vision_provider import AzureVisionProvider
from .tesseract_provider import TesseractProvider
from .easyocr_provider import EasyOCRProvider
from .chandra_provider import ChandraProvider

__all__ = [
    "BaseOCRProvider",
    "OCRProviderResult",
    "OCRProviderFactory",
    "AWSTextractProvider",
    "GoogleVisionProvider",
    "AzureVisionProvider",
    "TesseractProvider",
    "EasyOCRProvider",
    "ChandraProvider",
]
