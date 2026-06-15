"""
Reusable JSON extraction utilities for LangGraph nodes.

Copied from utils/json_utils.py — canonical location for new code.
The original at utils/json_utils.py is kept for backward compatibility.

Usage:
    from lms.lms.agents.shared_nodes import extract_json, extract_and_validate

    parsed = extract_json(llm_response, expected_type="object")
    validated = extract_and_validate(llm_response, MyPydanticModel)
"""

import json
import re
import logging
from typing import TypeVar, Type, Optional, Union

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=Union[dict, list])


def extract_json(text: str, expected_type: str = "object") -> Optional[Union[dict, list]]:
    """
    Robustly extract JSON from LLM response text.

    Strategy (ordered by priority):
    1. Try direct json.loads (if text is pure JSON)
    2. Try extracting from ```json ... ``` code blocks
    3. Use brace/bracket matching to find the first complete JSON structure
    4. Fallback: use a non-greedy regex as last resort

    Args:
        text: Raw LLM response text
        expected_type: "object" for {...} or "array" for [...]

    Returns:
        Parsed dict/list or None
    """
    def _try_parse(t: str):
        try:
            return json.loads(t)
        except (json.JSONDecodeError, ValueError):
            pass

        # Try cleaning trailing commas
        cleaned = re.sub(r',\s*([\]}])', r'\1', t)
        try:
            return json.loads(cleaned)
        except (json.JSONDecodeError, ValueError):
            pass

        # Try escaping literal newlines (common in Vietnamese LLM output)
        try:
            cleaned_newlines = cleaned.replace('\n', '\\n')
            return json.loads(cleaned_newlines)
        except (json.JSONDecodeError, ValueError):
            return None

    if not text:
        return None

    text_stripped = text.strip()
    res = _try_parse(text_stripped)
    if res is not None:
        return res

    # Try extracting from ```json ... ``` blocks
    code_block_pattern = r"```(?:json)?\s*([\s\S]*?)```"
    matches = re.findall(code_block_pattern, text)
    for match in matches:
        res = _try_parse(match.strip())
        if res is not None:
            return res

    # Balanced brace/bracket matching
    opener = "{" if expected_type == "object" else "["
    closer = "}" if expected_type == "object" else "]"
    candidates = _find_balanced_structures(text, opener, closer)
    for candidate in candidates:
        res = _try_parse(candidate)
        if res is not None:
            return res

    # Last resort: non-greedy regex
    pattern = r"\{.*?\}" if expected_type == "object" else r"\[.*?\]"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        res = _try_parse(match.group(0))
        if res is not None:
            return res

    logger.warning(f"JSON extraction failed for text (first 200 chars): {text[:200]}")
    return None


def _find_balanced_structures(text: str, opener: str, closer: str) -> list[str]:
    """Find all balanced brace/bracket structures in text. Returns longest first."""
    candidates = []
    depth = 0
    in_string = False
    escape_next = False
    start_idx = -1

    for i, ch in enumerate(text):
        if escape_next:
            escape_next = False
            continue
        if ch == '\\' and in_string:
            escape_next = True
            continue
        if ch == '"' and not escape_next:
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == opener:
            if depth == 0:
                start_idx = i
            depth += 1
        elif ch == closer:
            depth -= 1
            if depth == 0 and start_idx >= 0:
                candidates.append(text[start_idx:i + 1])
                start_idx = -1

    candidates.sort(key=len, reverse=True)
    return candidates


def extract_and_validate(
    text: str,
    model: Optional[Type[T]] = None,
    expected_type: str = "object",
) -> Optional[Union[T, dict, list]]:
    """
    Extract JSON from text and optionally validate against a Pydantic model.

    Args:
        text: Raw LLM response text
        model: Optional Pydantic BaseModel subclass for validation
        expected_type: "object" or "array"

    Returns:
        Validated model instance, raw dict/list, or None
    """
    raw = extract_json(text, expected_type)
    if raw is None:
        return None

    if model is None:
        return raw

    from pydantic import ValidationError
    try:
        return model.model_validate(raw)
    except ValidationError as e:
        logger.warning(f"Pydantic validation failed for {model.__name__}: {e}")
        return None
