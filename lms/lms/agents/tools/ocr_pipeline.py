import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)


class OCRResult:
    __slots__ = ("text", "confidence", "engine")

    def __init__(self, text: str, confidence: float, engine: str):
        self.text = text
        self.confidence = confidence
        self.engine = engine


def preprocess_image(image_path: str):
    """Preprocess image for better OCR accuracy on handwritten text."""
    import cv2
    import numpy as np

    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Cannot read image: {image_path}")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    binary = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )
    denoised = cv2.fastNlMeansDenoising(binary, h=10)
    return denoised


def _ocr_rapidocr(image_path: str) -> OCRResult:
    """RapidOCR: fast ONNX-based engine."""
    try:
        from rapidocr_onnxruntime import RapidOCR
        engine = RapidOCR()
        result, _ = engine(image_path)

        if not result:
            return OCRResult("", 0.0, "rapidocr_empty")

        texts = [r[1] for r in result]
        confidences = [r[2] for r in result]
        full_text = "\n".join(texts)
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
        return OCRResult(full_text, avg_conf, "rapidocr")
    except Exception as e:
        logger.debug(f"RapidOCR failed: {e}")
        return OCRResult("", 0.0, "rapidocr_error")


def _ocr_easyocr(image_path: str) -> OCRResult:
    """EasyOCR: best for Vietnamese handwriting."""
    try:
        import easyocr
        reader = easyocr.Reader(['vi', 'en'], gpu=False, verbose=False)
        results = reader.readtext(image_path)

        if not results:
            return OCRResult("", 0.0, "easyocr_empty")

        lines = []
        current_line = []
        last_y = None

        for bbox, text, conf in results:
            y_center = (bbox[0][1] + bbox[2][1]) / 2
            if last_y is not None and abs(y_center - last_y) > 10:
                lines.append(" ".join(current_line))
                current_line = [text]
            else:
                current_line.append(text)
            last_y = y_center

        if current_line:
            lines.append(" ".join(current_line))

        full_text = "\n".join(lines)
        avg_conf = sum(r[2] for r in results) / len(results)
        return OCRResult(full_text, avg_conf, "easyocr")
    except Exception as e:
        logger.debug(f"EasyOCR failed: {e}")
        return OCRResult("", 0.0, "easyocr_error")


def _ocr_tesseract(image_path: str) -> OCRResult:
    """Tesseract OCR with Vietnamese language support."""
    try:
        import pytesseract

        img = preprocess_image(image_path)

        for lang in ['vie', 'eng']:
            try:
                text = pytesseract.image_to_string(img, lang=lang, config='--psm 6')
                if text.strip():
                    data = pytesseract.image_to_data(img, lang=lang, output_type=pytesseract.Output.DICT)
                    confidences = [int(c) for c in data['conf'] if int(c) > 0]
                    avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
                    return OCRResult(text.strip(), avg_conf / 100.0, f"tesseract_{lang}")
            except pytesseract.TesseractError:
                continue

        return OCRResult("", 0.0, "tesseract_failed")
    except Exception as e:
        logger.debug(f"Tesseract failed: {e}")
        return OCRResult("", 0.0, "tesseract_error")


# Cache for EasyOCR reader (expensive to initialize)
_easyocr_reader = None


def run_ocr_pipeline(image_path: str, confidence_threshold: float = 0.5) -> str:
    """
    Multi-engine OCR pipeline.

    Strategy: rapidocr (fast) → easyocr (best for Vietnamese) → tesseract (backup).
    Stops early if confidence >= threshold.
    """
    results = []

    for engine_fn in [_ocr_rapidocr, _ocr_easyocr, _ocr_tesseract]:
        try:
            result = engine_fn(image_path)
            if result.text.strip():
                results.append(result)
                if result.confidence >= confidence_threshold:
                    logger.debug(f"OCR pipeline: {result.engine} OK (conf={result.confidence:.2f})")
                    return result.text
        except Exception as e:
            logger.debug(f"OCR engine {engine_fn.__name__} error: {e}")

    if results:
        best = max(results, key=lambda r: r.confidence)
        logger.debug(f"OCR pipeline: best={best.engine} conf={best.confidence:.2f}")
        return best.text

    logger.warning(f"All OCR engines failed for {image_path}")
    return ""


def ocr_with_vision_fallback(image_path: str) -> str:
    """Local OCR first, Vision model fallback if all engines fail."""
    text = run_ocr_pipeline(image_path)

    if text.strip():
        return text

    from .document_tools import _cheap_ocr
    logger.info(f"Local OCR failed, falling back to Vision model for {image_path}")
    return _cheap_ocr(image_path)
