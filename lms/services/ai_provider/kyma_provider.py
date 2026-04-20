from typing import Any, Dict, List, Optional

import json
import importlib
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .base_provider import BaseAIProvider


class KymaAIProvider(BaseAIProvider):
    def __init__(self, config: Optional[Dict[str, Any]] = None, model_name: Optional[str] = None):
        self._config = config or {}
        self._api_url = self._config.get("api_url") or self._config.get("base_url") or "https://kymaapi.com/v1"
        self._api_key = self._config.get("api_key")
        self._model_name = model_name or self._config.get("model_name") or self._config.get("kymaapi_model")
        self._token_usage = 0
        self._request_count = 0

        if not self._api_key:
            raise ValueError("Kyma API key must be provided.")

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

    def _normalize_base_url(self) -> str:
        return self._api_url.rstrip("/")

    def _resolve_model(self, model: Optional[str]) -> str:
        target_model = model or self._model_name
        if not target_model:
            raise ValueError("Model name must be provided.")
        return target_model

    def _build_llm(self, model: str) -> Any:
        # Kyma exposes an OpenAI-compatible endpoint, so ChatOpenAI can be used directly.
        try:
            chat_openai_module = importlib.import_module("langchain_openai")
            chat_openai_cls = getattr(chat_openai_module, "ChatOpenAI")
        except ImportError as error:
            raise ValueError(
                "langchain-openai is required for KymaAIProvider. Install it with: pip install langchain-openai"
            ) from error

        return chat_openai_cls(
            model=model,
            api_key=self._api_key,
            base_url=self._normalize_base_url(),
            temperature=0,
        )

    @staticmethod
    def _extract_usage(response: Any) -> Dict[str, int]:
        usage_meta = getattr(response, "usage_metadata", None) or {}
        response_meta = getattr(response, "response_metadata", None) or {}
        token_usage = response_meta.get("token_usage", {}) if isinstance(response_meta, dict) else {}

        prompt_tokens = usage_meta.get("input_tokens") or token_usage.get("prompt_tokens") or 0
        completion_tokens = usage_meta.get("output_tokens") or token_usage.get("completion_tokens") or 0
        total_tokens = usage_meta.get("total_tokens") or token_usage.get("total_tokens") or 0

        return {
            "prompt_tokens": int(prompt_tokens),
            "completion_tokens": int(completion_tokens),
            "total_tokens": int(total_tokens),
        }

    def complete(self, prompt: str, model: str = None, schema: dict = None) -> dict:
        target_model = self._resolve_model(model)
        llm = self._build_llm(target_model)

        invoke_kwargs: Dict[str, Any] = {}
        if schema:
            invoke_kwargs = {"response_format": {"type": "json_object"}}

        response = llm.invoke(prompt, **invoke_kwargs)
        usage = self._extract_usage(response)

        self._token_usage += usage["total_tokens"]
        self._request_count += 1

        return {
            "text": getattr(response, "content", "") or "",
            "usage": usage,
            "model": target_model,
        }

    def get_token_usage(self) -> int:
        return self._token_usage

    def get_request_count(self) -> int:
        return self._request_count

    def get_model_name(self) -> Optional[str]:
        return self._model_name

    def get_model_info(self, model: str) -> dict:
        for item in self.list_models():
            if item.get("id") == model or item.get("name") == model:
                return item
        raise ValueError(f"Model not found: {model}")

    def list_models(self) -> List[dict]:
        data = self._request_json("GET", "/models")

        if isinstance(data, dict):
            if isinstance(data.get("data"), list):
                return data["data"]
            if isinstance(data.get("models"), list):
                return data["models"]
        if isinstance(data, list):
            return data
        return []

    def OCR(self, image_data: bytes) -> str:
        raise NotImplementedError("Kyma provider does not implement OCR directly.")

    def _request_json(self, method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self._normalize_base_url()}{path}"
        body = None
        headers = self._headers()

        if payload is not None:
            body = json.dumps(payload).encode("utf-8")

        request = Request(url, data=body, headers=headers, method=method)

        try:
            with urlopen(request, timeout=60) as response:
                response_body = response.read().decode("utf-8")
        except HTTPError as error:
            error_body = error.read().decode("utf-8", errors="ignore")
            raise ValueError(f"Kyma API request failed with status {error.code}: {error_body}") from error
        except URLError as error:
            raise ValueError(f"Kyma API request failed: {error.reason}") from error

        if not response_body:
            return {}
        return json.loads(response_body)
    