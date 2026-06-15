"""
Centralized agent configuration loader for TOMOSA.

Extracts agent config resolution logic from provider.py:87-132
into a dedicated module with caching, validation, and defaults.

Usage:
    from lms.lms.agents.core.config import get_agent_config, AgentConfig

    config = get_agent_config("chatbot")
    llm = config.build_llm()
"""

import frappe
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class AgentConfig:
    """
    Resolved configuration for a single agent's LLM access.

    Combines LMS AI Settings defaults, per-agent overrides,
    and runtime override_config into a single resolved object.
    """
    agent_name: str
    provider_name: str = "openai"
    model_name: str = "gpt-4o-mini"
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    temperature: float = 0.3
    max_tokens: int = 2048
    cost_input: float = 0.0   # $ per input token
    cost_output: float = 0.0  # $ per output token

    def build_llm(self, **extra_kwargs):
        """
        Build a LangChain ChatModel from this config.
        Uses provider_adapter to create the correct provider type.
        """
        from lms.lms.agents.provider import get_llm  # Avoid circular import
        return get_llm(
            self.agent_name,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            override_config={
                "provider_name": self.provider_name,
                "model_name": self.model_name,
                "api_key": self.api_key,
                "base_url": self.base_url,
                "temperature": self.temperature,
                "max_tokens": self.max_tokens,
            },
            **extra_kwargs,
        )


def get_agent_config(
    agent_name: str,
    override_config: Optional[Dict[str, Any]] = None,
) -> AgentConfig:
    """
    Resolve agent configuration from LMS AI Settings.

    Resolution order (later wins):
    1. System defaults (provider.py hardcoded)
    2. LMS AI Settings default provider/model
    3. Per-agent config rows in LMS AI Settings (if enabled)
    4. Runtime override_config (caller-provided)

    Args:
        agent_name: Task/agent name matching agent_configs rows (e.g., "chatbot")
        override_config: Optional runtime overrides

    Returns:
        Resolved AgentConfig dataclass
    """
    config = AgentConfig(agent_name=agent_name)
    override_config = override_config or {}

    try:
        from lms.lms.doctype.lms_ai_settings.lms_ai_settings import get_ai_settings
        settings = get_ai_settings()

        # Layer 2: System defaults
        config.provider_name = settings.get("default_provider", "openai").lower()
        config.model_name = settings.get("default_model", "gpt-4o-mini")
        config.api_key = settings.get("default_api_key")
        config.base_url = settings.get("default_base_url") or None

        # Layer 3: Per-agent overrides
        for row in settings.get("agent_configs", []):
            if row.get("agent_name") == agent_name and row.get("enabled"):
                if row.get("provider") and row.get("provider") != "(inherit)":
                    config.provider_name = row.get("provider").lower()
                if row.get("model"):
                    config.model_name = row.get("model")
                if row.get("temperature") is not None and row.get("temperature") != "":
                    config.temperature = float(row.get("temperature"))
                if row.get("max_tokens"):
                    config.max_tokens = int(row.get("max_tokens"))
                break

        # Layer 4: Runtime overrides
        if override_config.get("provider_name"):
            config.provider_name = override_config["provider_name"].lower()
        if override_config.get("model_name"):
            config.model_name = override_config["model_name"]
        if override_config.get("api_key"):
            config.api_key = override_config["api_key"]
        if override_config.get("base_url"):
            config.base_url = override_config["base_url"]
        if override_config.get("temperature") is not None:
            config.temperature = float(override_config["temperature"])
        if override_config.get("max_tokens"):
            config.max_tokens = int(override_config["max_tokens"])

        # Clean up
        if config.base_url == "":
            config.base_url = None

    except Exception as e:
        logger.error(f"Error reading AI Settings for {agent_name}: {e}")
        # Fall back to Layer 4 overrides or hard defaults
        if override_config.get("provider_name"):
            config.provider_name = override_config["provider_name"].lower()
        if override_config.get("model_name"):
            config.model_name = override_config["model_name"]

    # Load token costs
    try:
        from lms.lms.agents.provider_adapter import get_provider as get_raw_provider
        raw = get_raw_provider(
            config.provider_name,
            model=config.model_name,
            api_key=config.api_key,
            base_url=config.base_url,
        )
        config.cost_input = raw.TOKEN_COSTS.get(config.model_name, {}).get("input", 0)
        config.cost_output = raw.TOKEN_COSTS.get(config.model_name, {}).get("output", 0)
    except Exception:
        pass

    return config


def get_agent_thread_config(agent_name: str) -> dict:
    """
    Return the {'configurable': {...}} dict for LangGraph invoke().
    Shortcut for the most common usage pattern.

    Args:
        agent_name: Agent identifier

    Returns:
        Config dict suitable for graph.invoke(state, config)
    """
    return {
        "configurable": {
            "thread_id": frappe.generate_hash(length=8),
            "agent_name": agent_name,
        }
    }
