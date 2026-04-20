# AI Grading Backend Service Architecture

> **Comprehensive backend service architecture design** for AI-powered grading system based on research from open-source systems and modern software patterns.
>
> **Last Updated:** 2026-04-13

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Service Layer Structure](#service-layer-structure)
3. [AI Provider Adapters](#ai-provider-adapters)
4. [Grading Orchestration](#grading-orchestration)
5. [Background Job Processing](#background-job-processing)
6. [API Design](#api-design)
7. [Security & Rate Limiting](#security--rate-limiting)
8. [Error Handling & Retries](#error-handling--retries)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Architecture Overview

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Vue.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Submission   │  │ Rubric       │  │ Analytics    │           │
│  │ UI           │  │ Builder      │  │ Dashboard    │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                            │ HTTPS
┌───────────────────────────▼──────────────────────────────────────┐
│                    API Gateway (Nginx/Frappe)                  │
│                    /api/v1/lms/ai-grading/*                    │
└───────────────────────────┬──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                      Service Layer (Python)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │ AI Grading  │  │ Rubric      │  │ Analytics            │    │
│  │ Service     │  │ Service     │  │ Service              │    │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘    │
│         │                │                     │                 │
│  ┌──────▼──────┐  ┌──────▼──────┐   ┌─────────▼─────────┐    │
│  │ AI Provider │  │ Validation  │   │ Cost Tracking     │    │
│  │ Adapter     │  │ Service     │   │ Service           │    │
│  └──────┬──────┘  └─────────────┘   └───────────────────┘    │
└─────────┼──────────────────────────────────────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────────────┐
│                  External AI Providers                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ OpenAI   │ │ Gemini   │ │Anthropic │ │  Ollama  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Background Jobs (RQ)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Grading Queue│  │ OCR Queue    │  │ Analysis     │          │
│  │ (long)       │  │ (default)    │  │ Queue        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │MariaDB   │ │  Redis   │ │   Files  │ │   Cache  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Service Layer Pattern** | Decouples business logic from API endpoints | Additional abstraction layer |
| **Adapter Pattern for AI Providers** | Easy to add new providers | Slight overhead |
| **Async Background Jobs** | Non-blocking grading for scalability | Eventual consistency |
| **Repository Pattern** | Easier testing and mocking | More boilerplate |
| **DTO/Response Models** | Type-safe API responses | Extra serialization step |

---

## Service Layer Structure

### Directory Structure

```
lms/lms/services/
├── __init__.py
├── base_service.py                    # Base service with common methods
├── ai_grading/
│   ├── __init__.py
│   ├── ai_grading_service.py         # Main grading orchestrator
│   ├── provider_adapter.py           # AI provider adapters
│   ├── rubric_service.py             # Rubric CRUD operations
│   ├── submission_service.py          # Submission management
│   ├── cost_tracking_service.py      # AI cost calculation
│   ├── similarity_service.py         # Submission similarity detection
│   └── prompt_engine.py              # Prompt template management
├── ocr/
│   ├── __init__.py
│   ├── base_ocr_service.py           # OCR DTOs + service interface
│   ├── preprocess_service.py         # Image payload normalization
│   ├── provider_ocr_service.py       # Provider-facing OCR execution
│   ├── postprocess_service.py        # Text cleanup and normalization
│   ├── pipeline_service.py           # End-to-end OCR orchestration
│   └── batch_ocr_service.py          # Multi-page / multi-file OCR flow
├── ocr_providers/
│   ├── __init__.py
│   ├── base_ocr_provider.py          # Base OCR provider interface
│   ├── aws_textract_provider.py      # AWS Textract OCR provider
│   ├── google_vision_provider.py     # Google Cloud Vision provider
│   ├── azure_vision_provider.py      # Microsoft Azure Vision provider
│   ├── tesseract_provider.py         # Open-source Tesseract OCR
│   ├── easyocr_provider.py           # EasyOCR provider (80+ languages)
│   ├── chandra_provider.py           # Chandra Vietnamese OCR service
│   └── factory.py                    # OCR provider factory pattern
├── validation/
│   ├── __init__.py
│   ├── ai_grading_validator.py       # Input validation schemas
│   └── rubric_validator.py           # Rubric validation
└── analytics/
    ├── __init__.py
    └── ai_grading_analytics.py       # Statistics and reporting
```

### Base Service Class

```python
# lms/lms/services/base_service.py
"""
Base service class with common CRUD operations and caching.
"""
from typing import Optional, List, Dict, Any
import frappe
from functools import wraps
import json


class BaseService:
    """Base service with common operations for all services."""

    def __init__(self, doctype: str):
        self.doctype = doctype
        self.cache_prefix = f"lms:{doctype.lower().replace(' ', '_')}"

    def get(self, name: str, fields: Optional[List[str]] = None) -> Dict[str, Any]:
        """Get a document by name with caching."""
        cache_key = f"{self.cache_prefix}:{name}"
        cached = frappe.cache().get_value(cache_key)

        if cached:
            return cached

        doc = frappe.get_doc(self.doctype, name)
        result = doc.as_dict() if not fields else doc.as_dict(include=fields)

        # Cache for 5 minutes
        frappe.cache().set_value(cache_key, result, expires_in_sec=300)
        return result

    def get_list(
        self,
        filters: Optional[Dict] = None,
        fields: Optional[List[str]] = None,
        limit: int = 20,
        start: int = 0,
        order_by: str = "creation desc"
    ) -> List[Dict[str, Any]]:
        """Get list of documents with optional caching."""
        return frappe.get_all(
            self.doctype,
            filters=filters,
            fields=fields,
            limit=limit,
            start=start,
            order_by=order_by
        )

    def create(self, data: Dict[str, Any]) -> str:
        """Create a new document."""
        doc = frappe.new_doc(self.doctype)
        doc.update(data)
        doc.insert()
        return doc.name

    def update(self, name: str, data: Dict[str, Any]) -> str:
        """Update a document."""
        doc = frappe.get_doc(self.doctype, name)
        doc.update(data)
        doc.save()

        # Invalidate cache
        cache_key = f"{self.cache_prefix}:{name}"
        frappe.cache().delete_value(cache_key)

        return doc.name

    def delete(self, name: str) -> bool:
        """Delete a document."""
        frappe.delete_doc(self.doctype, name)

        # Invalidate cache
        cache_key = f"{self.cache_prefix}:{name}"
        frappe.cache().delete_value(cache_key)

        return True

    @staticmethod
    def clear_cache_pattern(pattern: str):
        """Clear all cache entries matching a pattern."""
        # Note: Redis pattern deletion requires raw Redis client
        pass


def cache_result(ttl: int = 300):
    """Decorator to cache service method results."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"

            # Try to get from cache
            cached = frappe.cache().get_value(cache_key)
            if cached:
                return cached

            # Execute function and cache result
            result = func(*args, **kwargs)
            frappe.cache().set_value(cache_key, result, expires_in_sec=ttl)

            return result
        return wrapper
    return decorator
```

---

## AI Provider Adapters

### Adapter Pattern Implementation

```python
# lms/lms/services/ai_grading/provider_adapter.py
"""
AI Provider Adapters - Abstract interface for different AI providers.
Supports OpenAI, Gemini, Anthropic, and Ollama.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import frappe
import time


class BaseAIProvider(ABC):
    """Abstract base class for AI provider adapters."""

    # Provider configuration
    PROVIDER_NAME = ""
    DEFAULT_MODEL = ""
    TOKEN_COSTS = {}  # {model: {"input": 0.00001, "output": 0.00002}}

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or self._get_api_key()
        self.model = model or self.DEFAULT_MODEL

    @abstractmethod
    def grade(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """
        Grade a submission using the AI provider.

        Returns:
            Dict with keys:
            - content: str - AI response text
            - usage: Dict - {"prompt_tokens", "completion_tokens", "total_tokens"}
            - model: str - Model used
            - finish_reason: str - "stop", "length", "error"
            - error: Optional[str] - Error message if failed
        """
        pass

    @abstractmethod
    def estimate_cost(self, prompt: str) -> float:
        """Estimate the cost of grading this prompt (in USD)."""
        pass

    def _get_api_key(self) -> str:
        """Get API key from LMS settings."""
        from lms.lms.doctype.lms_ai_settings.lms_ai_settings import get_ai_settings

        settings = get_ai_settings()
        key_field = f"{self.PROVIDER_NAME}_api_key"
        return settings.get(key_field)

    def count_tokens(self, text: str) -> int:
        """
        Estimate token count for a given text.
        Approximation: 1 token ≈ 4 characters for English text.
        """
        return len(text) // 4

    def calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Calculate actual cost based on token usage."""
        model_costs = self.TOKEN_COSTS.get(self.model, {})
        input_cost = input_tokens * model_costs.get("input", 0)
        output_cost = output_tokens * model_costs.get("output", 0)
        return input_cost + output_cost


class OpenAIProvider(BaseAIProvider):
    """OpenAI provider adapter using GPT-4 and GPT-3.5."""

    PROVIDER_NAME = "openai"
    DEFAULT_MODEL = "gpt-4o-mini"
    TOKEN_COSTS = {
        "gpt-4o-mini": {"input": 0.00015 / 1000, "output": 0.0006 / 1000},
        "gpt-4": {"input": 0.03 / 1000, "output": 0.06 / 1000},
        "gpt-3.5-turbo": {"input": 0.0015 / 1000, "output": 0.002 / 1000},
    }

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        super().__init__(api_key, model)
        try:
            import openai
            self.client = openai.OpenAI(api_key=self.api_key)
        except ImportError:
            frappe.throw("OpenAI package not installed. Run: pip install openai")

    def grade(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> Dict[str, Any]:
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
                response_format={"type": "json_object"} if kwargs.get("json_mode") else None
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


class GeminiProvider(BaseAIProvider):
    """Google Gemini provider adapter."""

    PROVIDER_NAME = "gemini"
    DEFAULT_MODEL = "gemini-1.5-flash"
    TOKEN_COSTS = {
        "gemini-1.5-flash": {"input": 0.000075 / 1000, "output": 0.0003 / 1000},
        "gemini-1.5-pro": {"input": 0.00125 / 1000, "output": 0.005 / 1000},
    }

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        super().__init__(api_key, model)
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.genai = genai
        except ImportError:
            frappe.throw("Google Generative AI package not installed")

    def grade(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Grade submission using Gemini API."""
        start_time = time.time()

        try:
            model = self.genai.GenerativeModel(
                self.model,
                system_instruction=system_prompt
            )

            config = self.genai.types.GenerationConfig(
                temperature=kwargs.get("temperature", 0.3),
                max_output_tokens=kwargs.get("max_tokens", 2000),
            )

            response = model.generate_content(
                prompt,
                generation_config=config
            )

            # Parse response
            content = response.text

            # Estimate token usage (Gemini doesn't provide exact counts)
            input_tokens = self.count_tokens(prompt + (system_prompt or ""))
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


class AnthropicProvider(BaseAIProvider):
    """Anthropic Claude provider adapter."""

    PROVIDER_NAME = "anthropic"
    DEFAULT_MODEL = "claude-3-haiku-20240307"
    TOKEN_COSTS = {
        "claude-3-haiku-20240307": {"input": 0.00025 / 1000, "output": 0.00125 / 1000},
        "claude-3-sonnet-20240229": {"input": 0.003 / 1000, "output": 0.015 / 1000},
        "claude-3-opus-20240229": {"input": 0.015 / 1000, "output": 0.075 / 1000},
    }

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        super().__init__(api_key, model)
        try:
            import anthropic
            self.client = anthropic.Anthropic(api_key=self.api_key)
        except ImportError:
            frappe.throw("Anthropic package not installed")

    def grade(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> Dict[str, Any]:
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


class OllamaProvider(BaseAIProvider):
    """Ollama provider for local/open-source models."""

    PROVIDER_NAME = "ollama"
    DEFAULT_MODEL = "llama3.2"
    TOKEN_COSTS = {}  # Free for local models

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        super().__init__(api_key, model)
        self.base_url = frappe.get_value("LMS AI Settings", "LMS AI Settings", "ollama_base_url") or "http://localhost:11434"

    def grade(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> Dict[str, Any]:
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


def get_provider(provider_name: str, api_key: Optional[str] = None, model: Optional[str] = None) -> BaseAIProvider:
    """Factory function to get the appropriate AI provider."""
    providers = {
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
        "anthropic": AnthropicProvider,
        "ollama": OllamaProvider,
        "kyma": OpenAIProvider,  # Kyma can use OpenAI-compatible endpoint
    }

    provider_class = providers.get(provider_name.lower())
    if not provider_class:
        raise ValueError(f"Unknown provider: {provider_name}")

    return provider_class(api_key=api_key, model=model)
```

---

## OCR Providers

### Overview

The OCR module supports multiple OCR providers with a unified interface, allowing document text extraction before grading:

| Provider | Type | Languages | Cost | Deployment |
|----------|------|-----------|------|-----------|
| **AWS Textract** | Cloud (REST API) | 15+ | Pay-per-page | AWS |
| **Google Vision** | Cloud (REST API) | 40+ | Pay-per-request | Google Cloud |
| **Azure Vision** | Cloud (REST API) | 70+ | Pay-per-request | Microsoft Azure |
| **Tesseract** | Local OCR | 100+ | Free | Local/Self-hosted |
| **EasyOCR** | Local AI-OCR | 80+ | Free | Local/Self-hosted |
| **Chandra** | Cloud (REST API) | Vietnamese + English | Custom | Vietnam-based |

### Base OCR Provider Interface

All providers inherit from `BaseOCRProvider` and implement:

```python
class BaseOCRProvider(ABC):
    @abstractmethod
    def extract_text(self, image_data: bytes, language: str = "auto") -> OCRProviderResult:
        """Extract text from image"""
        pass

    @abstractmethod
    def extract_text_with_boxes(self, image_data: bytes, language: str = "auto") -> dict:
        """Extract text with bounding boxes for detailed analysis"""
        pass

    @abstractmethod
    def list_supported_languages(self) -> list[str]:
        """Return supported language codes"""
        pass
```

### OCR Provider Factory

Use the factory pattern to instantiate providers:

```python
from lms.services.ocr_providers import OCRProviderFactory

# Create provider instance
provider = OCRProviderFactory.get_provider(
    provider_name="google",  # or "aws", "azure", "tesseract", "easyocr", "chandra"
    api_key="your_api_key",
    config={"service_account_path": "/path/to/creds.json"}
)

# Extract text
result = provider.extract_text(image_data)
print(result.text)
print(result.confidence)

# Extract with bounding boxes
result_with_boxes = provider.extract_text_with_boxes(image_data)
for box in result_with_boxes["boxes"]:
    print(f"{box['text']} @ {box['bbox']}")
```

### Supported Providers

#### 1. AWS Textract Provider

Cloud-based OCR using Amazon AWS Textract service:

```python
provider = OCRProviderFactory.get_provider(
    "aws",
    api_key="AWS_ACCESS_KEY_ID",
    config={
        "secret_key": "AWS_SECRET_ACCESS_KEY",
        "region": "us-east-1"
    }
)
```

**Requirements:** `pip install boto3`

#### 2. Google Cloud Vision Provider

Google's powerful vision API supporting 40+ languages:

```python
provider = OCRProviderFactory.get_provider(
    "google",
    api_key="service_account_key_json",
    config={
        "service_account_path": "/path/to/service_account.json"
    }
)
```

**Requirements:** `pip install google-cloud-vision`

#### 3. Azure Computer Vision Provider

Microsoft's enterprise cloud vision API:

```python
provider = OCRProviderFactory.get_provider(
    "azure",
    api_key="AZURE_API_KEY",
    config={
        "endpoint": "https://<region>.api.cognitive.microsoft.com"
    }
)
```

**Requirements:** `pip install azure-cognitiveservices-vision-computervision msrest`

#### 4. Tesseract Provider

Open-source OCR engine for local/on-premises deployment:

```python
provider = OCRProviderFactory.get_provider(
    "tesseract",
    config={"languages": ["vi", "en"]}
)
```

**Requirements:** `pip install pytesseract pillow` + `apt-get install tesseract-ocr`

#### 5. EasyOCR Provider

AI-powered local OCR supporting 80+ languages:

```python
provider = OCRProviderFactory.get_provider(
    "easyocr",
    config={
        "languages": ["vi", "en"],
        "gpu": False
    }
)
```

**Requirements:** `pip install easyocr pillow`

#### 6. Chandra Provider

Vietnamese-focused OCR service:

```python
provider = OCRProviderFactory.get_provider(
    "chandra",
    api_key="CHANDRA_API_KEY",
    config={
        "api_url": "https://api.chandra.ai/v1/ocr"
    }
)
```

**Requirements:** `pip install requests`

### OCR Pipeline Service

The OCR pipeline orchestrates preprocessing → OCR → postprocessing:

```python
from lms.services.ocr.pipeline_service import OCRPipelineService

pipeline = OCRPipelineService(
    provider_name="google",
    api_key="your_key"
)

request = OCRRequest(
    image_data=image_bytes,
    language="vi",
    preprocess=True,
    postprocess=True
)

result = pipeline.execute(request)
print(result.text)  # Clean, normalized text
```

### Batch OCR Service

Process multiple images in batch:

```python
from lms.services.ocr.batch_ocr_service import BatchOCRService

batch_service = BatchOCRService(pipeline)

results = batch_service.execute(
    [image1_bytes, image2_bytes, image3_bytes],
    continue_on_error=True
)

for result in results:
    print(f"Page OCR: {result.text}")
```

## Grading Orchestration

### Main AI Grading Service

```python
# lms/lms/services/ai_grading/ai_grading_service.py
"""
Main AI Grading Service - Orchestrates the grading workflow.
Handles submission processing, AI calls, logging, and cost tracking.
"""
import json
import hashlib
from typing import Dict, Any, Optional, List
import frappe
from datetime import datetime

from .provider_adapter import get_provider
from .rubric_service import RubricService
from .cost_tracking_service import CostTrackingService
from .prompt_engine import PromptEngine
from .similarity_service import SimilarityService


class AIGradingService:
    """Main service for AI-powered grading."""

    def __init__(self):
        self.rubric_service = RubricService()
        self.cost_service = CostTrackingService()
        self.prompt_engine = PromptEngine()
        self.similarity_service = SimilarityService()

    def grade_submission(
        self,
        submission_name: str,
        retry_count: int = 0,
        triggered_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Grade a single submission using AI.

        Args:
            submission_name: Name of the AI Grading Submission
            retry_count: Current retry attempt number
            triggered_by: User who triggered the grading (if manual)

        Returns:
            Dict with grading result
        """
        # Get submission document
        submission = frappe.get_doc("AI Grading Submission", submission_name)
        session = frappe.get_doc("AI Grading Session", submission.session)

        # Update submission status
        submission.status = "Grading"
        submission.grading_started_at = datetime.now()
        submission.ai_provider = session.ai_provider
        submission.ai_model = session.ai_model
        submission.retry_count = retry_count
        submission.save()

        # Log start
        self._log_action(
            submission=submission_name,
            session=session.name,
            action="Grading Started",
            ai_provider=session.ai_provider,
            ai_model=session.ai_model,
            triggered_by=triggered_by
        )

        try:
            # Get rubric if configured
            rubric_data = None
            if session.rubric:
                rubric_data = self.rubric_service.get_rubric_for_grading(session.rubric)

            # Build prompt
            prompt = self.prompt_engine.build_grading_prompt(
                submission=submission,
                session=session,
                rubric=rubric_data
            )

            # Get system prompt
            system_prompt = session.custom_system_prompt or self.prompt_engine.get_default_system_prompt(
                language=rubric_data.get("language", "English") if rubric_data else "English"
            )

            # Get AI provider
            provider = get_provider(session.ai_provider, model=session.ai_model)

            # Estimate cost before calling
            estimated_cost = provider.estimate_cost(prompt)

            # Call AI
            result = provider.grade(
                prompt=prompt,
                system_prompt=system_prompt,
                json_mode=True,
                temperature=0.3,
                max_tokens=2000
            )

            if result.get("error"):
                raise Exception(result["error"])

            # Parse AI response
            grading_result = self._parse_ai_response(result["content"])

            # Update submission with results
            submission.score = grading_result.get("total_score")
            submission.ai_feedback = json.dumps(grading_result, ensure_ascii=False)
            submission.ai_confidence = grading_result.get("confidence", 0)
            submission.criterion_scores = json.dumps(grading_result.get("criteria", []), ensure_ascii=False)
            submission.grading_completed_at = datetime.now()
            submission.grading_time_seconds = result["latency_seconds"]
            submission.input_tokens = result["usage"]["prompt_tokens"]
            submission.output_tokens = result["usage"]["completion_tokens"]
            submission.total_tokens = result["usage"]["total_tokens"]
            submission.estimated_cost = estimated_cost
            submission.status = "Done"

            # Check similarity if threshold set
            if session.similarity_threshold:
                similarity = self.similarity_service.check_similarity(
                    submission_name=submission_name,
                    session_name=session.name
                )
                submission.similarity_score = similarity["score"]
                if similarity["score"] > session.similarity_threshold:
                    submission.is_flagged = 1
                    submission.flag_reason = f"High similarity ({similarity['score']:.2f}) to other submissions"

            # Enable annotations if configured
            if session.enable_annotations and grading_result.get("annotations"):
                self._add_annotations(submission, grading_result["annotations"])

            submission.save()

            # Log completion
            self._log_action(
                submission=submission_name,
                session=session.name,
                action="Grading Completed",
                ai_provider=session.ai_provider,
                ai_model=session.ai_model,
                input_tokens=result["usage"]["prompt_tokens"],
                output_tokens=result["usage"]["completion_tokens"],
                total_tokens=result["usage"]["total_tokens"],
                estimated_cost=estimated_cost,
                new_score=submission.score,
                grading_time_seconds=result["latency_seconds"],
                triggered_by=triggered_by
            )

            # Track cost
            self.cost_service.track_grading_cost(
                session=session.name,
                submission=submission_name,
                provider=session.ai_provider,
                model=session.ai_model,
                cost=estimated_cost,
                tokens=result["usage"]["total_tokens"]
            )

            return {
                "success": True,
                "submission": submission_name,
                "score": submission.score,
                "confidence": submission.ai_confidence,
                "feedback": grading_result.get("overall_feedback"),
                "cost": estimated_cost,
                "tokens": result["usage"]["total_tokens"],
                "time": result["latency_seconds"]
            }

        except Exception as e:
            # Handle error
            submission.status = "Flagged" if retry_count >= (session.max_retries or 3) else "Pending"
            submission.last_error = str(e)
            submission.save()

            # Log error
            self._log_action(
                submission=submission_name,
                session=session.name,
                action="Grading Failed",
                error_message=str(e),
                triggered_by=triggered_by
            )

            # Retry if under max attempts
            if retry_count < (session.max_retries or 3):
                # Schedule retry
                frappe.enqueue(
                    "lms.lms.services.ai_grading.ai_grading_service.AIGradingService.grade_submission",
                    submission_name=submission_name,
                    retry_count=retry_count + 1,
                    queue="long",
                    timeout=300
                )

            return {
                "success": False,
                "submission": submission_name,
                "error": str(e),
                "retry_count": retry_count
            }

    def grade_batch(
        self,
        session_name: str,
        triggered_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Grade all pending submissions in a session.

        Returns:
            Dict with batch grading results
        """
        # Get pending submissions
        submissions = frappe.get_all(
            "AI Grading Submission",
            filters={
                "session": session_name,
                "status": "Pending"
            },
            pluck="name"
        )

        # Enqueue grading jobs
        job_ids = []
        for submission_name in submissions:
            job_id = frappe.enqueue(
                "lms.lms.services.ai_grading.ai_grading_service.AIGradingService.grade_submission",
                submission_name=submission_name,
                triggered_by=triggered_by,
                queue="long",
                timeout=300
            )
            job_ids.append(job_id)

        return {
            "success": True,
            "session": session_name,
            "queued_count": len(submissions),
            "job_ids": job_ids
        }

    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse AI response into structured grading data."""
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback parsing if AI didn't return valid JSON
            return {
                "total_score": 0,
                "overall_feedback": "Unable to parse AI response",
                "criteria": [],
                "confidence": 0
            }

    def _log_action(self, **kwargs):
        """Log AI grading action."""
        log = frappe.new_doc("AI Grading Log")
        log.update(kwargs)

        # Add hashes for auditing
        if "request_payload" in kwargs:
            log.prompt_hash = hashlib.sha256(
                json.dumps(kwargs["request_payload"]).encode()
            ).hexdigest()
        if "response_payload" in kwargs:
            log.response_hash = hashlib.sha256(
                json.dumps(kwargs["response_payload"]).encode()
            ).hexdigest()

        log.insert()

    def _add_annotations(self, submission, annotations: List[Dict]):
        """Add annotations to submission from AI response."""
        from lms.lms.doctype.ai_grading_annotation.ai_grading_annotation import AIAnnotation

        for ann_data in annotations:
            annotation = AIAnnotation({
                "parent": submission.name,
                "parenttype": "AI Grading Submission",
                "parentfield": "annotations",
                "annotation_type": ann_data.get("type", "Suggestion"),
                "comment": ann_data.get("comment"),
                "source": "AI Generated"
            })

            if "text_excerpt" in ann_data:
                annotation.text_excerpt = ann_data["text_excerpt"]
            if "suggested_fix" in ann_data:
                annotation.suggested_fix = ann_data["suggested_fix"]

            annotation.insert()
```

---

## Background Job Processing

### RQ Configuration

```python
# lms/lms/ai_grading_jobs.py
"""
Background job configuration for AI grading.
Uses Redis Queue (RQ) for async processing.
"""
import frappe
from rq import Queue


def get_ai_grading_queue():
    """Get the long-running queue for AI grading jobs."""
    redis_conn = frappe.cache()
    return Queue("ai_grading_long", connection=redis_conn, default_timeout=300)


def enqueue_grading_job(submission_name: str, triggered_by: str = None):
    """Enqueue a grading job for a submission."""
    queue = get_ai_grading_queue()

    job = queue.enqueue(
        "lms.lms.services.ai_grading.ai_grading_service.AIGradingService.grade_submission",
        submission_name=submission_name,
        triggered_by=triggered_by,
        job_timeout=300,
        result_ttl=3600  # Keep results for 1 hour
    )

    return job.id


def enqueue_batch_grading(session_name: str, triggered_by: str = None):
    """Enqueue batch grading for a session."""
    from .services.ai_grading.ai_grading_service import AIGradingService

    service = AIGradingService()
    result = service.grade_batch(session_name, triggered_by)

    return result
```

---

## API Design

### New API Endpoints

```python
# lms/lms/api/ai_grading_api.py
"""
AI Grading API endpoints following RESTful v1 pattern.
All endpoints use /api/v1/lms/ai-grading/ prefix.
"""
import frappe
from frappe import _
from lms.lms.services.ai_grading.ai_grading_service import AIGradingService
from lms.lms.services.ai_grading.rubric_service import RubricService


# ============================================================================
# RUBRIC MANAGEMENT ENDPOINTS
# ============================================================================

@frappe.whitelist(methods=["GET"])
def get_rubrics(rubric_type: str = None, start: int = 0, limit: int = 20):
    """Get list of rubrics with optional filtering."""
    filters = {}
    if rubric_type:
        filters["grading_type"] = rubric_type

    service = RubricService()
    rubrics = service.get_list(
        filters=filters,
        start=start,
        limit=limit
    )

    return {
        "success": True,
        "data": rubrics,
        "count": len(rubrics)
    }


@frappe.whitelist(methods=["POST"])
def create_rubric(data: str):
    """Create a new grading rubric."""
    import json

    data = json.loads(data) if isinstance(data, str) else data

    # Validate required fields
    if not data.get("rubric_name"):
        frappe.throw("Rubric name is required")

    service = RubricService()
    rubric_name = service.create(data)

    return {
        "success": True,
        "name": rubric_name,
        "message": _("Rubric created successfully")
    }


@frappe.whitelist(methods=["GET"])
def get_rubric_detail(rubric: str):
    """Get detailed rubric with criteria and performance levels."""
    service = RubricService()
    rubric_data = service.get_with_criteria(rubric)

    return {
        "success": True,
        "data": rubric_data
    }


@frappe.whitelist(methods=["PUT"])
def update_rubric(rubric: str, data: str):
    """Update an existing rubric."""
    import json

    data = json.loads(data) if isinstance(data, str) else data

    service = RubricService()
    service.update(rubric, data)

    return {
        "success": True,
        "name": rubric,
        "message": _("Rubric updated successfully")
    }


# ============================================================================
# GRADING EXECUTION ENDPOINTS
# ============================================================================

@frappe.whitelist(methods=["POST"])
def start_grading(submission: str, triggered_by: str = None):
    """
    Start AI grading for a submission.

    This endpoint is non-blocking and returns immediately.
    The actual grading happens in a background job.
    """
    service = AIGradingService()

    # Enqueue grading job
    result = service.grade_submission(
        submission_name=submission,
        triggered_by=triggered_by
    )

    return {
        "success": True,
        "submission": submission,
        "status": "queued",
        "result": result
    }


@frappe.whitelist(methods=["POST"])
def start_batch_grading(session: str, triggered_by: str = None):
    """
    Start AI grading for all pending submissions in a session.

    Returns immediately with count of queued jobs.
    """
    service = AIGradingService()
    result = service.grade_batch(
        session_name=session,
        triggered_by=triggered_by
    )

    return {
        "success": True,
        "session": session,
        "queued_count": result["queued_count"],
        "message": _("{0} submissions queued for grading").format(result["queued_count"])
    }


@frappe.whitelist(methods=["GET"])
def get_grading_status(submission: str):
    """Get the current grading status of a submission."""
    submission_doc = frappe.get_doc("AI Grading Submission", submission)

    return {
        "success": True,
        "submission": submission,
        "status": submission_doc.status,
        "score": submission_doc.score,
        "confidence": submission_doc.ai_confidence,
        "grading_time": submission_doc.grading_time_seconds,
        "retry_count": submission_doc.retry_count,
        "error": submission_doc.last_error
    }


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@frappe.whitelist(methods=["GET"])
def get_grading_analytics(session: str):
    """
    Get analytics for an AI grading session.

    Includes:
    - Submission status breakdown
    - Score distribution
    - Average grading time
    - Total cost
    - AI confidence distribution
    """
    # Get session submissions
    submissions = frappe.get_all(
        "AI Grading Submission",
        filters={"session": session},
        fields=[
            "status", "score", "ai_confidence",
            "grading_time_seconds", "estimated_cost",
            "is_flagged", "similarity_score"
        ]
    )

    # Calculate analytics
    total = len(submissions)
    completed = [s for s in submissions if s["status"] == "Done"]
    pending = [s for s in submissions if s["status"] in ["Pending", "Grading"]]
    flagged = [s for s in submissions if s.get("is_flagged")]

    # Score statistics
    scores = [s["score"] for s in completed if s["score"] is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    max_score = max(scores) if scores else 0
    min_score = min(scores) if scores else 0

    # Time and cost
    total_time = sum(s["grading_time_seconds"] or 0 for s in completed)
    total_cost = sum(s["estimated_cost"] or 0 for s in completed)

    # Confidence
    confidences = [s["ai_confidence"] or 0 for s in completed]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0

    return {
        "success": True,
        "session": session,
        "summary": {
            "total_submissions": total,
            "completed": len(completed),
            "pending": len(pending),
            "flagged": len(flagged),
            "completion_rate": (len(completed) / total * 100) if total > 0 else 0
        },
        "scores": {
            "average": avg_score,
            "maximum": max_score,
            "minimum": min_score
        },
        "performance": {
            "average_grading_time": total_time / len(completed) if completed else 0,
            "total_grading_time": total_time,
            "total_cost": total_cost,
            "average_cost_per_submission": total_cost / len(completed) if completed else 0
        },
        "ai_metrics": {
            "average_confidence": avg_confidence,
            "high_confidence_rate": len([c for c in confidences if c > 0.8]) / len(confidences) * 100 if confidences else 0
        }
    }


@frappe.whitelist(methods=["GET"])
def get_grading_logs(submission: str = None, session: str = None, limit: int = 50, start: int = 0):
    """Get audit logs for AI grading."""
    filters = {}
    if submission:
        filters["submission"] = submission
    elif session:
        filters["session"] = session

    logs = frappe.get_all(
        "AI Grading Log",
        filters=filters,
        fields=[
            "name", "action", "ai_provider", "ai_model",
            "new_score", "grading_time_seconds",
            "estimated_cost", "error_message", "created"
        ],
        order_by="created desc",
        limit=limit,
        start=start
    )

    return {
        "success": True,
        "data": logs,
        "count": len(logs)
    }


@frappe.whitelist(methods=["GET"])
def get_cost_tracking(date_from: str = None, date_to: str = None, provider: str = None):
    """Get cost tracking data for AI grading."""
    filters = {}

    if date_from:
        filters["cost_date"] = [">=", date_from]
    if date_to:
        filters["cost_date"] = ["<=", date_to] if "cost_date" not in filters else ["between", [date_from, date_to]]
    if provider:
        filters["ai_provider"] = provider

    cost_tracks = frappe.get_all(
        "AI Grading Cost Track",
        filters=filters,
        order_by="cost_date desc"
    )

    # Calculate totals
    total_submissions = sum(ct["submission_count"] for ct in cost_tracks)
    total_tokens = sum(ct["total_tokens"] for ct in cost_tracks)
    total_cost = sum(ct["total_cost_usd"] for ct in cost_tracks)

    return {
        "success": True,
        "data": cost_tracks,
        "summary": {
            "total_submissions": total_submissions,
            "total_tokens": total_tokens,
            "total_cost_usd": total_cost
        }
    }
```

---

## Security & Rate Limiting

### Rate Limiting Decorator

```python
# lms/lms/security/rate_limiting.py
"""
Rate limiting implementation for AI grading API endpoints.
Uses Redis-based sliding window algorithm.
"""
import frappe
from functools import wraps
import time


class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded."""
    pass


def rate_limit(
    key: str,
    limit: int = 30,
    period: int = 60,
    per_user: bool = True
):
    """
    Rate limiting decorator.

    Args:
        key: Base key for rate limiting (e.g., "ai_grading")
        limit: Maximum number of requests allowed
        period: Time period in seconds
        per_user: If True, limit is per-user; if False, it's global
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            redis = frappe.cache().redis_conn

            # Get user-specific or global key
            if per_user and frappe.session.user:
                user_key = f"{key}:{frappe.session.user}"
            else:
                user_key = f"{key}:global"

            # Get current timestamp
            now = time.time()

            # Add current request to sorted set
            pipe = redis.pipeline()
            pipe.zadd(user_key, {str(now): now})
            pipe.zremrangebyscore(user_key, "-inf", now - period)
            pipe.expire(user_key, period)

            results = pipe.execute()
            count = results[2]  # Count after removing old entries

            if count > limit:
                raise RateLimitExceeded(
                    f"Rate limit exceeded: {limit} requests per {period} seconds"
                )

            return func(*args, **kwargs)

        return wrapper
    return decorator


def get_rate_limit_remaining(key: str, limit: int, period: int = 60, per_user: bool = True) -> int:
    """Get remaining requests before rate limit is reached."""
    redis = frappe.cache().redis_conn

    if per_user and frappe.session.user:
        user_key = f"{key}:{frappe.session.user}"
    else:
        user_key = f"{key}:global"

    now = time.time()

    # Clean old entries and get count
    redis.zremrangebyscore(user_key, "-inf", now - period)
    count = redis.zcard(user_key)

    return max(0, limit - count)
```

### Rate Limited API Endpoints

```python
from lms.lms.security.rate_limiting import rate_limit, RateLimitExceeded


@frappe.whitelist(methods=["POST"])
@rate_limit(key="ai_grading_start", limit=10, period=60)
def start_grading(submission: str, triggered_by: str = None):
    """Start AI grading with rate limiting."""
    try:
        # ... existing code ...
        pass
    except RateLimitExceeded as e:
        frappe.throw(str(e), frappe.TooManyRequestsError)


@frappe.whitelist(methods=["POST"])
@rate_limit(key="ai_grading_batch", limit=3, period=300)  # 3 batch requests per 5 minutes
def start_batch_grading(session: str, triggered_by: str = None):
    """Start batch grading with rate limiting."""
    try:
        # ... existing code ...
        pass
    except RateLimitExceeded as e:
        frappe.throw(str(e), frappe.TooManyRequestsError)
```

---

## Error Handling & Retries

### Retry Mechanism

```python
# lms/lms/services/ai_grading/retry_handler.py
"""
Retry handler for AI grading operations.
Implements exponential backoff with jitter.
"""
import time
import random
import logging


class RetryableError(Exception):
    """Error that should trigger a retry."""
    pass


class NonRetryableError(Exception):
    """Error that should NOT trigger a retry."""
    pass


def retry_with_backoff(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True
):
    """
    Retry decorator with exponential backoff.

    Args:
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay in seconds
        max_delay: Maximum delay between retries
        exponential_base: Base for exponential backoff
        jitter: Add random jitter to prevent thundering herd
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)

                except RetryableError as e:
                    last_exception = e

                    if attempt == max_retries:
                        raise NonRetryableError(f"Max retries ({max_retries}) exceeded") from e

                    # Calculate delay with exponential backoff
                    delay = min(
                        initial_delay * (exponential_base ** attempt),
                        max_delay
                    )

                    # Add jitter if enabled
                    if jitter:
                        delay = delay * (0.5 + random.random())

                    # Log retry
                    logging.warning(
                        f"Retry {attempt + 1}/{max_retries} after {delay:.2f}s: {str(e)}"
                    )

                    time.sleep(delay)

                except NonRetryableError as e:
                    raise  # Don't retry non-retryable errors

            raise last_exception

        return wrapper
    return decorator
```

---

## Implementation Roadmap

### Week 1-2: Foundation
- [ ] Create service layer directory structure
- [ ] Implement base service class
- [ ] Create AI provider adapters (OpenAI, Gemini)
- [ ] Implement prompt engine with templates
- [ ] Unit tests for provider adapters

### Week 3-4: Core Services
- [ ] Implement AI Grading Service
- [ ] Implement Rubric Service
- [ ] Implement Cost Tracking Service
- [ ] Implement Similarity Service
- [ ] Create database indexes

### Week 5-6: Background Processing
- [ ] Configure RQ queues
- [ ] Implement background job handlers
- [ ] Add retry mechanism
- [ ] Implement rate limiting
- [ ] Test concurrent grading

### Week 7-8: API Layer
- [ ] Create new API endpoints
- [ ] Add rate limiting to endpoints
- [ ] Implement validation schemas
- [ ] Add error handling
- [ ] API documentation (OpenAPI)

### Week 9-10: Integration & Testing
- [ ] Integrate with existing frontend
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Load testing (100+ concurrent submissions)
- [ ] Security audit

---

## Summary

### Service Layer: 8 Services
| Service | Purpose | Priority |
|---------|---------|----------|
| Base Service | Common CRUD + caching | **P0** |
| AI Grading Service | Main grading orchestrator | **P0** |
| Provider Adapter | AI provider abstraction | **P0** |
| Rubric Service | Rubric management | **P0** |
| Cost Tracking Service | AI cost calculation | **P1** |
| Similarity Service | Plagiarism detection | **P2** |
| Prompt Engine | Prompt template management | **P0** |
| Analytics Service | Statistics & reporting | **P1** |

### AI Providers: 4 Supported
| Provider | Status | Models |
|----------|--------|--------|
| OpenAI | ✅ Ready | GPT-4, GPT-3.5, GPT-4o |
| Gemini | ✅ Ready | Gemini 1.5 Pro/Flash |
| Anthropic | ✅ Ready | Claude 3 Opus/Sonnet/Haiku |
| Ollama | ✅ Ready | Llama 3.2, Mistral, etc. |

### Estimated Development Time: 10 weeks

---

## References

1. **Adapter Pattern** - Gang of Four Design Patterns
2. **Frappe Service Layer** - frappeframework.com/docs
3. **OpenAI API** - platform.openai.com/docs
4. **Gemini API** - ai.google.dev/docs
5. **Anthropic API** - docs.anthropic.com
6. **Redis Queue (RQ)** - rq.readthedocs.io
7. **Rate Limiting Patterns** - blog.cloudflare.com/rate-limiting

---

*Prepared by AI Development Assistant - Based on open-source research and modern software architecture patterns*
