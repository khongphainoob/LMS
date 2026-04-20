"""OCR Provider Factory"""

from .base_ocr_provider import BaseOCRProvider


class OCRProviderFactory:
    """Factory for creating OCR provider instances"""

    @staticmethod
    def get_provider(
        provider_name: str,
        api_key: str = None,
        model_name: str = None,
        api_url: str = None,
        config: dict = None,
    ) -> BaseOCRProvider:
        """
        Get OCR provider instance.
        
        Args:
            provider_name: Name of OCR provider (aws, google, azure, tesseract, easyocr, chandra)
            api_key: API key for the provider
            model_name: Model name if applicable
            api_url: API URL if applicable
            config: Additional configuration dictionary
            
        Returns:
            BaseOCRProvider instance
            
        Raises:
            ValueError: If provider_name is not recognized
        """
        provider_config = config or {}
        
        # Merge parameters into config
        if api_key is not None:
            provider_config.setdefault("api_key", api_key)
        if api_url is not None:
            provider_config.setdefault("api_url", api_url)
        if model_name is not None:
            provider_config.setdefault("model_name", model_name)

        provider_name_lower = provider_name.lower().strip()

        if provider_name_lower in ["aws", "aws_textract"]:
            from .aws_textract_provider import AWSTextractProvider

            return AWSTextractProvider(provider_config)

        elif provider_name_lower in ["google", "google_vision"]:
            from .google_vision_provider import GoogleVisionProvider

            return GoogleVisionProvider(provider_config)

        elif provider_name_lower in ["azure", "azure_vision"]:
            from .azure_vision_provider import AzureVisionProvider

            return AzureVisionProvider(provider_config)

        elif provider_name_lower in ["tesseract"]:
            from .tesseract_provider import TesseractProvider

            return TesseractProvider(provider_config)

        elif provider_name_lower in ["easyocr", "easy_ocr"]:
            from .easyocr_provider import EasyOCRProvider

            return EasyOCRProvider(provider_config)

        elif provider_name_lower in ["chandra"]:
            from .chandra_provider import ChandraProvider

            return ChandraProvider(provider_config)

        else:
            available = ["aws", "google", "azure", "tesseract", "easyocr", "chandra"]
            raise ValueError(
                f"Unknown OCR provider: {provider_name}. "
                f"Available providers: {', '.join(available)}"
            )

    @staticmethod
    def list_providers() -> list[str]:
        """List all available OCR providers"""
        return ["aws", "google", "azure", "tesseract", "easyocr", "chandra"]

    @staticmethod
    def get_provider_info(provider_name: str) -> dict:
        """Get information about a provider"""
        provider = OCRProviderFactory.get_provider(provider_name)
        return provider.get_provider_info()
