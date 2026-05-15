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
    """
    if not text:
        return None

    text_stripped = text.strip()
    try:
        return json.loads(text_stripped)
    except (json.JSONDecodeError, ValueError):
        pass

    code_block_pattern = r"```(?:json)?\s*([\s\S]*?)```"
    matches = re.findall(code_block_pattern, text)
    for match in matches:
        try:
            return json.loads(match.strip())
        except (json.JSONDecodeError, ValueError):
            continue

    opener = "{" if expected_type == "object" else "["
    closer = "}" if expected_type == "object" else "]"

    candidates = _find_balanced_structures(text, opener, closer)
    for candidate in candidates:
        try:
            return json.loads(candidate)
        except (json.JSONDecodeError, ValueError):
            continue

    pattern = r"\{.*?\}" if expected_type == "object" else r"\[.*?\]"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except (json.JSONDecodeError, ValueError):
            pass

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


def extract_and_validate(text: str, model: Type[T], expected_type: str = "object") -> Optional[T]:
    """
    Extract JSON from text and validate against a Pydantic model.
    """
    from pydantic import ValidationError

    raw = extract_json(text, expected_type)
    if raw is None:
        return None

    try:
        return model.model_validate(raw)
    except ValidationError as e:
        logger.warning(f"Pydantic validation failed for {model.__name__}: {e}")
        return None
