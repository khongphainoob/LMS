# -*- coding: utf-8 -*-
"""
AI Provider Adapter Module — SHIM (re-exports from core/provider_adapter.py)

This file exists for backward compatibility. All imports are delegated to
lms.lms.agents.core.provider_adapter. New code should import directly from core.

Migration path:
    OLD: from lms.lms.agents.provider_adapter import get_provider
    NEW: from lms.lms.agents.core.provider_adapter import get_provider
          or simply keep existing import — both work.
"""

# Re-export everything from the canonical location
from lms.lms.agents.core.provider_adapter import (
    BaseAIProvider,
    OpenAIProvider,
    OpenRouterProvider,
    GeminiProvider,
    AnthropicProvider,
    OllamaProvider,
    KymaProvider,
    get_provider,
)

__all__ = [
    "BaseAIProvider",
    "OpenAIProvider",
    "OpenRouterProvider",
    "GeminiProvider",
    "AnthropicProvider",
    "OllamaProvider",
    "KymaProvider",
    "get_provider",
]
