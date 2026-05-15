import logging
import os
import json
import requests
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


def _ocr_mathpix(image_path: str) -> OCRResult:
    """Mathpix Convert API for OCR."""
    from ..provider import get_mathpix_credentials
    
    app_id, app_key = get_mathpix_credentials()
    if not app_id or not app_key:
        logger.debug("Mathpix credentials not found, skipping Mathpix OCR.")
        return OCRResult("", 0.0, "mathpix_error")
        
    try:
        url = "https://api.mathpix.com/v3/text"
        headers = {
            "app_id": app_id,
            "app_key": app_key
        }
        with open(image_path, "rb") as f:
            files = {"file": f}
            options = {
                "math_inline_delimiters": ["\\(", "\\)"],
                "rm_spaces": True
            }
            data = {"options_json": json.dumps(options)}
            response = requests.post(url, headers=headers, files=files, data=data)
            response.raise_for_status()
            
            result = response.json()
            text = result.get("text", "")
            
            # Estimate confidence as 0.95 for Mathpix if successful
            return OCRResult(text, 0.95, "mathpix")
    except Exception as e:
        logger.debug(f"Mathpix API failed: {e}")
        return OCRResult("", 0.0, "mathpix_error")

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
    Multi-engine OCR pipeline with Post-Processing.
    Strategy: Mathpix -> LLM Cleaner (GPT-4o-mini).
    Fallback to RapidOCR -> EasyOCR -> Tesseract if Mathpix fails.
    """
    from ..provider import get_llm
    
    # 1. Try Mathpix first
    mathpix_res = _ocr_mathpix(image_path)
    raw_text = mathpix_res.text
    
    # 2. Fallback to local engines
    if not raw_text.strip():
        logger.debug("Falling back to local OCR engines...")
        results = []
        for engine_fn in [_ocr_rapidocr, _ocr_easyocr, _ocr_tesseract]:
            try:
                res = engine_fn(image_path)
                if res.text.strip():
                    results.append(res)
                    if res.confidence >= confidence_threshold:
                        raw_text = res.text
                        break
            except Exception as e:
                logger.debug(f"OCR engine {engine_fn.__name__} error: {e}")
                
        if not raw_text.strip() and results:
            best = max(results, key=lambda r: r.confidence)
            raw_text = best.text
            
    if not raw_text.strip():
        logger.warning(f"All OCR engines failed for {image_path}")
        return ""
        
    # 3. Post-Processing Pipeline: LLM Cleaner (Data Cleaning + Entity Extraction)
    try:
        cleaner_llm = get_llm("ocr_cleaner")
        prompt = f"""
        Hệ thống: Bạn là một chuyên gia chấm bài. Nhiệm vụ của bạn là nhận văn bản thô từ công cụ OCR, sửa các lỗi chính tả do chữ viết tay của học sinh xấu hoặc bị quét lỗi dựa vào ngữ cảnh đoạn văn. Giữ nguyên các công thức toán học trong thẻ \\(\\) hoặc \\[\\] và không tự ý sáng tạo thêm nội dung.
        
        Văn bản OCR đầu vào: 
        {raw_text}
        """
        response = cleaner_llm.invoke(prompt)
        return response.content
    except Exception as e:
        logger.error(f"OCR Post-processing failed: {e}")
        return raw_text # Return raw text if cleaning fails


def ocr_with_vision_fallback(image_path: str) -> str:
    """Local OCR first, Vision model fallback if all engines fail."""
    text = run_ocr_pipeline(image_path)

    if text.strip():
        return text

    from .document_tools import _cheap_ocr
    logger.info(f"Local OCR failed, falling back to Vision model for {image_path}")
    return _cheap_ocr(image_path)
