# -*- coding: utf-8 -*-
"""
AI Provider Adapter Module

Provides a unified interface for interacting with different AI providers
including OpenAI, Google Gemini, Anthropic, and Ollama.

Uses the Adapter pattern to allow easy switching between providers.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import frappe
import time
import hashlib
import json


class BaseAIProvider(ABC):
    """
    Abstract base class for AI provider adapters.

    All AI provider implementations must inherit from this class
    and implement the required abstract methods.
    """

    # Provider configuration
    PROVIDER_NAME = ""
    DEFAULT_MODEL = ""
    TOKEN_COSTS = {}  # {model: {"input": 0.00001, "output": 0.00002}}

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, **config):
        """
        Initialize AI provider.

        Args:
            api_key: API key for the provider (optional, will fetch from settings)
            model: Model name to use (optional, uses default)
            config: Additional provider-specific configuration
        """
        self.api_key = api_key or self._get_api_key()
        self.model = model or self.DEFAULT_MODEL
        self.config = config

    @abstractmethod
    def grade(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Grade a submission using the AI provider.

        Args:
            prompt: User prompt containing the content to grade
            system_prompt: Optional system prompt for context
            **kwargs: Additional parameters (temperature, max_tokens, json_mode, etc.)

        Returns:
            Dict with keys:
            - content: str - AI response text
            - usage: Dict - {"prompt_tokens", "completion_tokens", "total_tokens"}
            - model: str - Model used
            - finish_reason: str - "stop", "length", "error"
            - error: Optional[str] - Error message if failed
            - latency_seconds: float - Request time
        """
        pass

    @abstractmethod
    def estimate_cost(self, prompt: str) -> float:
        """
        Estimate the cost of grading this prompt (in USD).

        Args:
            prompt: Text to be sent to AI

        Returns:
            Estimated cost in USD
        """
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """
        Check if the provider is available and healthy.

        Returns:
            Dict with status and details
        """
        pass

    def _get_api_key(self) -> str:
        """Get API key from LMS AI Settings."""
        try:
            from lms.lms.doctype.lms_ai_settings.lms_ai_settings import get_ai_settings
            settings = get_ai_settings()
            key_field = f"{self.PROVIDER_NAME}_api_key"
            return settings.get(key_field, "")
        except Exception:
            return ""

    def count_tokens(self, text: str) -> int:
        """
        Estimate token count for a given text.

        This is a rough approximation. For accurate counting,
        use provider-specific tokenizers.

        Args:
            text: Input text

        Returns:
            Estimated token count
        """
        if not text:
            return 0
        # Approximation: 1 token ≈ 4 characters for English
        # For Vietnamese, use 1 token ≈ 2-3 characters
        # A simple heuristic based on character count
        return len(text) // 3

    def calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """
        Calculate actual cost based on token usage.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens

        Returns:
            Cost in USD
        """
        model_costs = self.TOKEN_COSTS.get(self.model, {"input": 0, "output": 0})
        input_cost = input_tokens * model_costs.get("input", 0)
        output_cost = output_tokens * model_costs.get("output", 0)
        return input_cost + output_cost

    def hash_prompt(self, prompt: str) -> str:
        """Generate SHA256 hash of prompt for caching/logging."""
        return hashlib.sha256(prompt.encode()).hexdigest()


class OpenAIProvider(BaseAIProvider):
    """OpenAI provider adapter using GPT models."""

    PROVIDER_NAME = "openai"
    DEFAULT_MODEL = "gpt-4o-mini"
    TOKEN_COSTS = {
        "gpt-4o-mini": {"input": 0.00015 / 1000, "output": 0.0006 / 1000},
        "gpt-4": {"input": 0.03 / 1000, "output": 0.06 / 1000},
        "gpt-4-turbo": {"input": 0.01 / 1000, "output": 0.03 / 1000},
        "gpt-3.5-turbo": {"input": 0.0015 / 1000, "output": 0.002 / 1000},
    }

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, **config):
        super().__init__(api_key, model, **config)
        try:
            import openai
            base_url = config.get("base_url", None)
            self.client = openai.OpenAI(api_key=self.api_key, base_url=base_url)
        except ImportError:
            frappe.throw("OpenAI package not installed. Run: pip install openai")

    def grade(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Grade submission using OpenAI API."""
        start_time = time.time()

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=kwargs.get("temperature", 0.3),
                max_tokens=kwargs.get("max_tokens", 2000),
                response_format={"type": "json_object"} if kwargs.get("json_mode") else None,
                timeout=kwargs.get("timeout", 60),
            )

            content = response.choices[0].message.content
            usage = response.usage

            return {
                "content": content,
                "usage": {
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                    "total_tokens": usage.total_tokens
                },
                "model": response.model,
                "finish_reason": response.choices[0].finish_reason,
                "error": None,
                "latency_seconds": time.time() - start_time
            }

        except Exception as e:
            frappe.log_error(
                message=f"OpenAI API Error: {str(e)}",
                title="AI Grading Error"
            )
            return {
                "content": None,
                "usage": None,
                "model": self.model,
                "finish_reason": "error",
                "error": str(e),
                "latency_seconds": time.time() - start_time
            }

    def estimate_cost(self, prompt: str) -> float:
        """Estimate cost before calling API."""
        input_tokens = self.count_tokens(prompt)
        # Estimate output tokens as 30% of input
        output_tokens = int(input_tokens * 0.3)
        return self.calculate_cost(input_tokens, output_tokens)

    def health_check(self) -> Dict[str, Any]:
        """Check if OpenAI is available."""
        try:
            response = self.client.models.list(limit=1)
            return {
                "status": "healthy",
                "provider": self.PROVIDER_NAME,
                "model": self.model
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "provider": self.PROVIDER_NAME,
                "error": str(e)
            }


class GeminiProvider(BaseAIProvider):
    """Google Gemini provider adapter."""

    PROVIDER_NAME = "gemini"
    DEFAULT_MODEL = "gemini-1.5-flash"
    TOKEN_COSTS = {
        "gemini-1.5-flash": {"input": 0.000075 / 1000, "output": 0.0003 / 1000},
        "gemini-1.5-pro": {"input": 0.00125 / 1000, "output": 0.005 / 1000},
    }

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, **config):
        super().__init__(api_key, model, **config)
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.genai = genai
        except ImportError:
            frappe.throw("Google Generative AI package not installed")

    def grade(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Grade submission using Gemini API."""
        start_time = time.time()

        try:
            full_prompt = system_prompt + "\n\n" + prompt if system_prompt else prompt

            model = self.genai.GenerativeModel(self.model)

            config = self.genai.types.GenerationConfig(
                temperature=kwargs.get("temperature", 0.3),
                max_output_tokens=kwargs.get("max_tokens", 2000),
            )

            response = model.generate_content(
                full_prompt,
                generation_config=config
            )

            content = response.text

            # Estimate token usage (Gemini doesn't provide exact counts)
            input_tokens = self.count_tokens(full_prompt)
            output_tokens = self.count_tokens(content)

            return {
                "content": content,
                "usage": {
                    "prompt_tokens": input_tokens,
                    "completion_tokens": output_tokens,
                    "total_tokens": input_tokens + output_tokens
                },
                "model": self.model,
                "finish_reason": "stop" if content else "length",
                "error": None,
                "latency_seconds": time.time() - start_time
            }

        except Exception as e:
            frappe.log_error(
                message=f"Gemini API Error: {str(e)}",
                title="AI Grading Error"
            )
            return {
                "content": None,
                "usage": None,
                "model": self.model,
                "finish_reason": "error",
                "error": str(e),
                "latency_seconds": time.time() - start_time
            }

    def estimate_cost(self, prompt: str) -> float:
        """Estimate cost before calling API."""
        input_tokens = self.count_tokens(prompt)
        output_tokens = int(input_tokens * 0.3)
        return self.calculate_cost(input_tokens, output_tokens)

    def health_check(self) -> Dict[str, Any]:
        """Check if Gemini is available."""
        try:
            model = self.genai.GenerativeModel(self.model)
            response = model.generate_content("Hello", generation_config=self.genai.types.GenerationConfig(max_output_tokens=10))
            return {
                "status": "healthy",
                "provider": self.PROVIDER_NAME,
                "model": self.model
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "provider": self.PROVIDER_NAME,
                "error": str(e)
            }


class AnthropicProvider(BaseAIProvider):
    """Anthropic Claude provider adapter."""

    PROVIDER_NAME = "anthropic"
    DEFAULT_MODEL = "claude-3-haiku-20240307"
    TOKEN_COSTS = {
        "claude-3-haiku-20240307": {"input": 0.00025 / 1000, "output": 0.00125 / 1000},
        "claude-3-sonnet-20240229": {"input": 0.003 / 1000, "output": 0.015 / 1000},
        "claude-3-opus-20240229": {"input": 0.015 / 1000, "output": 0.075 / 1000},
    }

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, **config):
        super().__init__(api_key, model, **config)
        try:
            import anthropic
            base_url = config.get("base_url", None)
            self.client = anthropic.Anthropic(api_key=self.api_key, base_url=base_url)
        except ImportError:
            frappe.throw("Anthropic package not installed")

    def grade(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Grade submission using Anthropic API."""
        start_time = time.time()

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=kwargs.get("max_tokens", 2000),
                temperature=kwargs.get("temperature", 0.3),
                system=system_prompt,
                messages=[{"role": "user", "content": prompt}]
            )

            content = response.content[0].text

            return {
                "content": content,
                "usage": {
                    "prompt_tokens": response.usage.input_tokens,
                    "completion_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens
                },
                "model": self.model,
                "finish_reason": response.stop_reason,
                "error": None,
                "latency_seconds": time.time() - start_time
            }

        except Exception as e:
            frappe.log_error(
                message=f"Anthropic API Error: {str(e)}",
                title="AI Grading Error"
            )
            return {
                "content": None,
                "usage": None,
                "model": self.model,
                "finish_reason": "error",
                "error": str(e),
                "latency_seconds": time.time() - start_time
            }

    def estimate_cost(self, prompt: str) -> float:
        """Estimate cost before calling API."""
        input_tokens = self.count_tokens(prompt)
        output_tokens = int(input_tokens * 0.3)
        return self.calculate_cost(input_tokens, output_tokens)

    def health_check(self) -> Dict[str, Any]:
        """Check if Anthropic is available."""
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=10,
                messages=[{"role": "user", "content": "Hello"}]
            )
            return {
                "status": "healthy",
                "provider": self.PROVIDER_NAME,
                "model": self.model
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "provider": self.PROVIDER_NAME,
                "error": str(e)
            }


class OllamaProvider(BaseAIProvider):
    """Ollama provider for local/open-source models."""

    PROVIDER_NAME = "ollama"
    DEFAULT_MODEL = "llama3.2"
    TOKEN_COSTS = {}  # Free for local models

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, **config):
        super().__init__(api_key, model, **config)
        self.base_url = config.get(
            "base_url",
            frappe.get_value("LMS AI Settings", "LMS AI Settings", "ollama_base_url") or "http://localhost:11434"
        )

    def grade(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Grade submission using local Ollama model."""
        import requests

        start_time = time.time()

        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "system": system_prompt,
                "stream": False,
                "options": {
                    "temperature": kwargs.get("temperature", 0.3),
                    "num_predict": kwargs.get("max_tokens", 2000)
                }
            }

            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=kwargs.get("timeout", 120)
            )
            response.raise_for_status()

            data = response.json()

            return {
                "content": data.get("response"),
                "usage": {
                    "prompt_tokens": data.get("prompt_eval_count", 0),
                    "completion_tokens": data.get("eval_count", 0),
                    "total_tokens": data.get("prompt_eval_count", 0) + data.get("eval_count", 0)
                },
                "model": self.model,
                "finish_reason": "stop" if data.get("done") else "length",
                "error": None,
                "latency_seconds": time.time() - start_time
            }

        except Exception as e:
            frappe.log_error(
                message=f"Ollama API Error: {str(e)}",
                title="AI Grading Error"
            )
            return {
                "content": None,
                "usage": None,
                "model": self.model,
                "finish_reason": "error",
                "error": str(e),
                "latency_seconds": time.time() - start_time
            }

    def estimate_cost(self, prompt: str) -> float:
        """Ollama is free for local models."""
        return 0.0

    def health_check(self) -> Dict[str, Any]:
        """Check if Ollama is available."""
        try:
            import requests
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            response.raise_for_status()
            return {
                "status": "healthy",
                "provider": self.PROVIDER_NAME,
                "model": self.model
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "provider": self.PROVIDER_NAME,
                "error": str(e)
            }


class KymaProvider(BaseAIProvider):
    """
    Kyma provider using OpenAI-compatible API.

    Can be used as a fallback or alternative to OpenAI.
    """

    PROVIDER_NAME = "kyma"
    DEFAULT_MODEL = "gpt-4o-mini"
    TOKEN_COSTS = {
        "gpt-4o-mini": {"input": 0.00015 / 1000, "output": 0.0006 / 1000},
    }

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, **config):
        super().__init__(api_key, model, **config)
        self.base_url = config.get(
            "base_url",
            frappe.get_value("LMS AI Settings", "LMS AI Settings", "kyma_api_base_url")
        )
        if not self.api_key:
            self.api_key = frappe.get_value("LMS AI Settings", "LMS AI Settings", "kyma_api_key")

        try:
            import openai
            self.client = openai.OpenAI(api_key=self.api_key, base_url=self.base_url)
        except ImportError:
            frappe.throw("OpenAI package not installed. Run: pip install openai")

    def grade(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Grade submission using Kyma API."""
        start_time = time.time()

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=kwargs.get("temperature", 0.3),
                max_tokens=kwargs.get("max_tokens", 2000),
                response_format={"type": "json_object"} if kwargs.get("json_mode") else None,
                timeout=kwargs.get("timeout", 60),
            )

            content = response.choices[0].message.content
            usage = response.usage

            return {
                "content": content,
                "usage": {
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                    "total_tokens": usage.total_tokens
                },
                "model": response.model,
                "finish_reason": response.choices[0].finish_reason,
                "error": None,
                "latency_seconds": time.time() - start_time
            }

        except Exception as e:
            frappe.log_error(
                message=f"Kyma API Error: {str(e)}",
                title="AI Grading Error"
            )
            return {
                "content": None,
                "usage": None,
                "model": self.model,
                "finish_reason": "error",
                "error": str(e),
                "latency_seconds": time.time() - start_time
            }

    def estimate_cost(self, prompt: str) -> float:
        """Estimate cost before calling API."""
        input_tokens = self.count_tokens(prompt)
        output_tokens = int(input_tokens * 0.3)
        return self.calculate_cost(input_tokens, output_tokens)

    def health_check(self) -> Dict[str, Any]:
        """Check if Kyma is available."""
        try:
            response = self.client.models.list(limit=1)
            return {
                "status": "healthy",
                "provider": self.PROVIDER_NAME,
                "model": self.model
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "provider": self.PROVIDER_NAME,
                "error": str(e)
            }


def get_provider(
    provider_name: str,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    **config
) -> BaseAIProvider:
    """
    Factory function to get the appropriate AI provider.

    Args:
        provider_name: Name of the provider (openai, gemini, anthropic, ollama, kyma)
        api_key: Optional API key
        model: Optional model name
        config: Additional configuration

    Returns:
        Provider instance

    Raises:
        ValueError: If provider name is unknown
    """
    providers = {
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
        "anthropic": AnthropicProvider,
        "ollama": OllamaProvider,
        "kyma": KymaProvider,
    }

    provider_class = providers.get(provider_name.lower())
    if not provider_class:
        raise ValueError(
            f"Unknown provider: {provider_name}. "
            f"Available providers: {', '.join(providers.keys())}"
        )

    return provider_class(api_key=api_key, model=model, **config)
