from __future__ import annotations

import re


class OCRPostprocessService:
    """Post-process raw OCR text for readability and grading downstream."""

    _multi_space = re.compile(r"[ \t]+")
    _multi_newline = re.compile(r"\n{3,}")

    def clean_text(self, text: str) -> str:
        if not text:
            return ""

        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = self._multi_space.sub(" ", text)
        text = self._multi_newline.sub("\n\n", text)
        return text.strip()
