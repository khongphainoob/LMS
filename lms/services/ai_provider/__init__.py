from .base_provider import BaseAIProvider

__all__ = [
    "BaseAIProvider",
    "AIProviderFactory",
]

class AIProviderFactory:
    @staticmethod
    def get_provider(
        provider_name: str,
        api_key: str = None,
        model_name: str = None,
        api_url: str = None,
        config: dict = None,
    ) -> BaseAIProvider:
        provider_config = config or {}
        if api_key is not None:
            provider_config.setdefault("api_key", api_key)
        if api_url is not None:
            provider_config.setdefault("api_url", api_url)
        if model_name is not None:
            provider_config.setdefault("model_name", model_name)

        if provider_name == "gemini":
            from .gemini_provider import GeminiProvider

            return GeminiProvider(provider_config.get("api_key"), provider_config.get("model_name"))
        elif provider_name == "openai":
            from .openai_provider import OpenAIProvider

            return OpenAIProvider(provider_config.get("api_key"), provider_config.get("model_name"))
        elif provider_name == "anthropic":
            from .anthropic_provider import AnthropicProvider

            return AnthropicProvider(provider_config.get("api_key"), provider_config.get("model_name"))
        elif provider_name == "kyma":
            from .kyma_provider import KymaAIProvider

            return KymaAIProvider(provider_config, provider_config.get("model_name"))
        else:
            raise ValueError(f"Unknown AI provider: {provider_name}")