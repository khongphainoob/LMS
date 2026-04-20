#!/usr/bin/env python3
"""Simple CLI to test AI providers in LMS.

Usage examples:
- python test.py --provider kyma
- python test.py --provider openai --model gpt-4o-mini
- python test.py --provider all --prompt "Say hello in Vietnamese"
"""

from __future__ import annotations

import argparse
import os
import sys
import traceback
from pathlib import Path
from typing import Any, Dict, List

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

from lms.services.ai_provider import AIProviderFactory


# Demo Chandra OCR
try:
    import chandra_ocr as chandra
    CHANDRA_AVAILABLE = True
except ImportError:
    CHANDRA_AVAILABLE = False


DEFAULT_MODELS = {
    "openai": "gpt-3.5-turbo",
    "gemini": "gemini-1.5-flash",
    "anthropic": "claude-3-haiku-20240307",
    "kyma": "llama-3.3-70b",
}


def load_dotenv_file(path: str = ".env") -> None:
    env_path = Path(path)
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if value and ((value[0] == value[-1]) and value[0] in ('"', "'")):
            value = value[1:-1]

        os.environ.setdefault(key, value)


def get_env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name)
    return value if value not in (None, "") else default


def build_config(provider: str, model_override: str | None, base_url_override: str | None) -> Dict[str, Any]:
    if provider == "openai":
        return {
            "api_key": get_env("OPENAI_API_KEY"),
            "model_name": model_override or get_env("OPENAI_MODEL", DEFAULT_MODELS["openai"]),
        }

    if provider == "gemini":
        return {
            "api_key": get_env("GEMINI_API_KEY"),
            "model_name": model_override or get_env("GEMINI_MODEL", DEFAULT_MODELS["gemini"]),
        }

    if provider == "anthropic":
        return {
            "api_key": get_env("ANTHROPIC_API_KEY"),
            "model_name": model_override or get_env("ANTHROPIC_MODEL", DEFAULT_MODELS["anthropic"]),
        }

    if provider == "kyma":
        return {
            "api_key": get_env("KYMA_API_KEY"),
            "api_url": base_url_override or get_env("KYMA_BASE_URL", "https://kymaapi.com/v1"),
            "model_name": model_override or get_env("KYMA_MODEL", DEFAULT_MODELS["kyma"]),
        }

    raise ValueError(f"Unsupported provider: {provider}")


def validate_config(provider: str, config: Dict[str, Any]) -> List[str]:
    missing: List[str] = []
    if not config.get("api_key"):
        key_map = {
            "openai": "OPENAI_API_KEY",
            "gemini": "GEMINI_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY",
            "kyma": "KYMA_API_KEY",
        }
        missing.append(key_map[provider])

    if not config.get("model_name"):
        model_map = {
            "openai": "OPENAI_MODEL",
            "gemini": "GEMINI_MODEL",
            "anthropic": "ANTHROPIC_MODEL",
            "kyma": "KYMA_MODEL",
        }
        missing.append(model_map[provider])

    return missing


def run_single_test(provider: str, prompt: str, model_override: str | None, base_url_override: str | None, list_models: bool) -> bool:
    print(f"\n=== Testing provider: {provider} ===")
    config = build_config(provider, model_override, base_url_override)
    missing = validate_config(provider, config)
    if missing:
        print(f"SKIP: Missing env/config: {', '.join(missing)}")
        return False

    try:
        instance = AIProviderFactory.get_provider(
            provider_name=provider,
            api_key=config.get("api_key"),
            model_name=config.get("model_name"),
            api_url=config.get("api_url"),
            config=config,
        )

        print(f"Model: {config.get('model_name')}")
        if provider == "kyma":
            print(f"Base URL: {config.get('api_url')}")

        result = instance.complete(prompt=prompt, model=config.get("model_name"))
        print("Complete: OK")
        print(f"Response text: {result.get('text', '')[:300]}")
        print(f"Usage: {result.get('usage')}")
        with open('test_output.txt', 'w', encoding='utf-8') as f:
            f.write(str(result))
        if list_models:
            models = instance.list_models()
            if isinstance(models, list):
                print(f"list_models: OK ({len(models)} models)")
                if models:
                    first = models[0]
                    if isinstance(first, dict):
                        print(f"First model: {first.get('id') or first.get('name') or str(first)[:80]}")
                    else:
                        print(f"First model: {str(first)[:80]}")
            else:
                print("list_models: Not implemented or returned non-list")

        return True

    except Exception as exc:
        print(f"ERROR: {exc}")
        print(traceback.format_exc(limit=1).strip())
        return False


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Test LMS AI providers and OCR")
    parser.add_argument(
        "--provider",
        choices=["all", "openai", "gemini", "anthropic", "kyma"],
        default="all",
        help="Provider to test",
    )
    parser.add_argument(
        "--prompt",
        default="Say hello in one short sentence.",
        help="Prompt sent to the provider",
    )
    parser.add_argument("--model", default=None, help="Override model for selected provider")
    parser.add_argument("--base-url", default=None, help="Override base URL (mainly for kyma)")
    parser.add_argument("--list-models", action="store_true", help="Also call list_models()")
    parser.add_argument("--ocr", type=str, help="Path to image file for OCR demo with Chandra (use 'sample' to download test image)")
    parser.add_argument("--ocr-method", choices=["hf", "vllm"], default="hf", help="OCR method: hf (HuggingFace) or vllm (server)")
    return parser.parse_args()


def main() -> int:
    load_dotenv_file()
    args = parse_args()

    # Nếu có --ocr, chạy demo OCR
    if args.ocr:
        demo_ocr(args.ocr, args.ocr_method)
        return 0

    providers = [args.provider] if args.provider != "all" else ["openai", "gemini", "anthropic", "kyma"]

    passed = 0
    for provider in providers:
        if run_single_test(
            provider=provider,
            prompt=args.prompt,
            model_override=args.model if args.provider != "all" else None,
            base_url_override=args.base_url,
            list_models=args.list_models,
        ):
            passed += 1

    total = len(providers)
    print(f"\nSummary: {passed}/{total} provider test(s) succeeded")
    return 0 if passed == total else 1


def demo_ocr(image_path: str, method: str = "hf") -> None:
    """Demo Chandra OCR trên ảnh sample."""
    if not CHANDRA_AVAILABLE:
        print("ERROR: chandra-ocr not installed. Run: pip install chandra-ocr[hf]")
        return

    # Nếu image_path là "sample", download ảnh sample
    if image_path == "sample":
        if not REQUESTS_AVAILABLE:
            print("ERROR: requests not installed. Run: pip install requests")
            return
        image_path = "sample_image.png"
        if not os.path.exists(image_path):
            print("Downloading sample image...")
            url = "https://raw.githubusercontent.com/datalab-to/chandra/master/assets/examples/math/handwritten_math.png"  # Từ README
            response = requests.get(url)
            with open(image_path, "wb") as f:
                f.write(response.content)
            print(f"Downloaded to {image_path}")

    if not os.path.exists(image_path):
        print(f"ERROR: Image file not found: {image_path}")
        return

    print(f"Processing image: {image_path} with method: {method}")

    try:
        # Tạo thư mục output tạm
        output_dir = "ocr_output"
        os.makedirs(output_dir, exist_ok=True)

        # Process với Chandra (dựa trên README, dùng CLI hoặc API)
        # Giả sử có function process_image, nếu không thì dùng subprocess
        import subprocess
        cmd = ["chandra", image_path, output_dir, "--method", method]
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            print(f"ERROR: Chandra CLI failed: {result.stderr}")
            return

        # Đọc output
        md_file = os.path.join(output_dir, os.path.splitext(os.path.basename(image_path))[0] + ".md")
        if os.path.exists(md_file):
            with open(md_file, "r", encoding="utf-8") as f:
                markdown = f.read()
            print("\n=== OCR Result ===")
            print("Markdown Output:")
            print(markdown)
        else:
            print("No markdown output found")

        print(f"\nOutput files saved to: {output_dir}")

    except Exception as e:
        print(f"ERROR processing image: {e}")
        print(traceback.format_exc())


if __name__ == "__main__":
    sys.exit(main())
