# -*- coding: utf-8 -*-
"""
AI Provider Facade — SHIM (re-exports from core/provider.py)

This file exists for backward compatibility. All imports are delegated to
lms.lms.agents.core.provider. New code should import directly from core.

Migration path:
    OLD: from lms.lms.agents.provider import get_llm
    NEW: from lms.lms.agents.core.provider import get_llm
          or simply keep existing import — both work.
"""

# Re-export everything from the canonical location
from lms.lms.agents.core.provider import (
    get_llm,
    extract_usage,
    generate_image,
    get_agent_config,
    AICostCallbackHandler,
)

__all__ = [
    "get_llm",
    "extract_usage",
    "generate_image",
    "get_agent_config",
    "AICostCallbackHandler",
]
