import json
from langchain_core.tools import tool
from ..utils.filesystem import _write_to_filesystem, _read_filesystem, _b64
from ..utils.json_utils import extract_json
from ..provider import get_llm as get_model


# Helper placeholders (In a real implementation, these would interact with Frappe DB and APIs)
def _get_session_files(session_id: str):
    import frappe
    import os
    from frappe.utils import get_site_path
    
    context_files = []
    try:
        submission = frappe.get_doc("AI Grading Submission", session_id)
        grading_session = None
        if getattr(submission, "session", None):
            try:
                grading_session = frappe.get_doc("AI Grading Session", submission.session)
            except Exception:
                grading_session = None

        
        # 1. Get Rubric Text
        rubric_text = ""
        rubric_id = getattr(grading_session, "rubric", None) if grading_session else None
        if rubric_id:
            rubric = frappe.get_doc("AI Grading Rubric", rubric_id)
            rubric_text = f"RUBRIC: {rubric.rubric_name}\nDescription: {rubric.description}\n"
            for crit in rubric.get("criteria", []):
                rubric_text += f"- {crit.criterion_name} (Max {crit.max_score}): {crit.description}\n"
        
        if rubric_text:
            context_files.append({"type": "rubric", "content": rubric_text})
            
        # 2. Get Attached Documents (PDF, Word, etc.)
        attachments = frappe.get_all("File", filters={
            "attached_to_doctype": "AI Grading Submission",
            "attached_to_name": session_id

        }, fields=["file_name", "file_url"])
        
        for att in attachments:
            file_path = _resolve_path(att.file_url)
            if not os.path.exists(file_path):
                # Try private path if public fails
                file_path = frappe.get_site_path(att.file_url.lstrip("/"))
                if not os.path.exists(file_path):
                    continue

            ext = att.file_name.split(".")[-1].lower()
            content = ""
            
            try:
                from lms.lms.agents.utils.file_parser import get_content_from_file
                if ext in ["pdf", "docx", "doc", "txt", "md"]:
                    content = get_content_from_file(file_path)
                elif ext in ["xlsx", "xls", "csv"]:
                    try:
                        import pandas as pd
                        if ext == "csv":
                            df = pd.read_csv(file_path)
                        else:
                            df = pd.read_excel(file_path)
                        content = df.to_string()
                    except ImportError:
                        content = f"[Warning: pandas/openpyxl not installed. Cannot parse {att.file_name}]"
                
                if content:
                    context_files.append({
                        "type": "document",
                        "file_name": att.file_name,
                        "content": f"DOCUMENT: {att.file_name}\n---\n{content}\n---"
                    })
            except Exception as e:
                context_files.append({
                    "type": "error",
                    "content": f"ERROR parsing {att.file_name}: {str(e)}"
                })

        return context_files
    except Exception as e:
        frappe.log_error(f"Error loading session files: {str(e)}")
        return context_files

def _resolve_path(file_url: str) -> str:
    import frappe
    if file_url.startswith("/private/"):
        return frappe.get_site_path(file_url.lstrip("/"))
    return frappe.get_site_path("public", file_url.lstrip("/"))

def _detect_formula(text: str) -> bool:
    return "\\" in text or "frac" in text

def _resize_256px(path: str) -> str:
    import logging
    import os
    from PIL import Image

    logger = logging.getLogger(__name__)
    try:
        full_path = _resolve_path(path)
        if not os.path.exists(full_path):
             # Try private path fallback
             import frappe
             full_path = frappe.get_site_path(path.lstrip("/"))
             
        if not os.path.exists(full_path):
            return path

        img = Image.open(full_path)
        img.thumbnail((256, 256), Image.Resampling.LANCZOS)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        base, ext = os.path.splitext(full_path)
        resized_path = f"{base}_256px{ext}"
        img.save(resized_path, "JPEG", quality=75)
        
        # Return the URL-like path (relative to site public or private)
        if "_256px" in resized_path:
             return path.replace(ext, f"_256px{ext}")
        return path
    except Exception as e:
        logger.warning(f"Resize failed for {path}: {e}")
        return path

def _get_vision_model():
    """Lấy model Vision tập trung từ model_router."""
    return get_model("ocr")[0]


def _classify_batch(thumbnails: list[str]) -> list[dict]:
    import logging
    from langchain_core.messages import HumanMessage
    
    logger = logging.getLogger(__name__)
    logger.debug(f"[DEBUG] _classify_batch: Đang GỘP {len(thumbnails)} ảnh vào 1 lần gọi API để tăng tốc...")
    
    if not thumbnails:
        return []

    try:
        model = _get_vision_model()
        # Xây dựng nội dung tin nhắn chứa tất cả ảnh
        content = [{"type": "text", "text": f"Dưới đây là {len(thumbnails)} bức ảnh bài làm. Hãy phân loại từng ảnh theo thứ tự vào 1 trong 4 loại: text_only, has_formula, has_diagram, mcq. Trả về kết quả dưới dạng JSON array của các string. Ví dụ: ['text_only', 'has_formula', ...]"}]
        
        for p in thumbnails:
            content.append({
                "type": "image_url", 
                "image_url": {"url": f"data:image/jpeg;base64,{_b64(p)}", "detail": "low"}
            })
            
        msg = HumanMessage(content=content)
        resp = model.invoke([msg])
        
        # Parse JSON kết quả
        parsed = extract_json(resp.content, expected_type="array")
        if parsed and isinstance(parsed, list):
            classifications = parsed
        else:
            # Fallback nếu AI trả về text thuần
            classifications = [ans.strip().lower() for ans in resp.content.split(",")]

        results = []
        for i, p in enumerate(thumbnails):
            ans = classifications[i] if i < len(classifications) else "text_only"
            if "formula" in ans: ans = "has_formula"
            elif "diagram" in ans: ans = "has_diagram"
            elif "mcq" in ans: ans = "mcq"
            else: ans = "text_only"
            results.append({"image_path": p, "type": ans})
            
        logger.debug(f"[DEBUG] Kết quả phân loại gộp: {results}")
        return results

    except Exception as e:
        logger.error(f"[ERROR] Lỗi khi batch classify: {e}")
        return [{"image_path": p, "type": "text_only"} for p in thumbnails]

def _cheap_ocr(image_path: str) -> str:
    """OCR via Vision model (used as fallback by ocr_pipeline)."""
    import logging
    from langchain_core.messages import HumanMessage

    logger = logging.getLogger(__name__)
    logger.debug(f"[DEBUG] _cheap_ocr (Vision fallback) for {image_path}...")

    try:
        model = _get_vision_model()
        b64_str = _b64(image_path)
        msg = HumanMessage(content=[
            {"type": "text", "text": "Trích xuất toàn bộ văn bản (OCR) từ bức ảnh này. Giữ nguyên cấu trúc dòng, định dạng, bảng biểu nếu có. Nếu có công thức toán học, hãy dùng LaTeX. Không thêm bình luận gì cả, chỉ in ra nội dung."},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_str}"}}
        ])
        resp = model.invoke([msg])
        return resp.content.strip()
    except Exception as e:
        logger.error(f"[ERROR] Lỗi OCR {image_path}: {e}")
        return f"[Lỗi OCR: {e}]"

@tool
def skill_load_context(session_id: str) -> str:
    """
    Đọc tất cả file đính kèm (.docx, .pdf) hoặc rubric của phiên chấm.
    Ghi kết quả ra /exam_context.txt để subagent đọc lại.
    Trả về summary ngắn.
    """
    files = _get_session_files(session_id)
    context_parts = []
    
    for f in files:
        if "content" in f:
            context_parts.append(f["content"])

    full_context = "\n\n".join(context_parts)
    if not full_context:
        full_context = "No context provided."
        
    _write_to_filesystem(session_id, "exam_context.txt", full_context)
    return f"Loaded {len(full_context)} chars. has_formula={_detect_formula(full_context)}"

@tool
def skill_extract_answer_key(session_id: str) -> str:
    """
    Tìm và phân tích các file đính kèm (.docx, .pdf, .txt) hoặc Rubric 
    để trích xuất danh sách đáp án chuẩn cho phần trắc nghiệm.
    Trả về kết quả dưới dạng JSON string chứa mapping câu hỏi - đáp án.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # 1. Đọc context hiện có (đã được load bởi skill_load_context)
    full_context = _read_filesystem(session_id, "exam_context.txt")
    if not full_context:
        # Nếu chưa có thì thử load lại
        skill_load_context.invoke({"session_id": session_id})
        full_context = _read_filesystem(session_id, "exam_context.txt")

    if not full_context or full_context == "No context provided.":
        return "ERROR: Không tìm thấy nội dung đề bài hoặc đáp án trong hệ thống."

    # 2. Sử dụng LLM để trích xuất đáp án
    try:
        model = _get_vision_model()
        prompt = f"""
        BẠN LÀ CHUYÊN GIA TRÍCH XUẤT ĐÁP ÁN.
        NHIỆM VỤ: Phân tích nội dung sau và trích xuất danh sách đáp án đúng cho các câu hỏi trắc nghiệm.
        
        NỘI DUNG:
        {full_context}
        
        YÊU CẦU:
        - Trả về JSON object với key là số câu (ví dụ: "1", "2", "3a") và value là đáp án đúng.
        - Với câu đúng/sai, trả về "Đúng" hoặc "Sai".
        - Chỉ trả về JSON, không thêm văn bản khác.
        """
        resp = model.invoke(prompt)

        answer_key = extract_json(resp.content, expected_type="object")
        if answer_key:
            _write_to_filesystem(session_id, "answer_key.json", answer_key)
            return f"SUCCESS: Đã trích xuất được {len(answer_key)} đáp án và lưu vào answer_key.json."
        else:
            return "ERROR: Không thể parse được cấu trúc đáp án từ nội dung tài liệu."
            
    except Exception as e:
        logger.error(f"[ERROR] Lỗi extract answer key: {e}")
        return f"ERROR: Lỗi xử lý AI: {str(e)}"


def verify_answer_key(session_id: str, answer_key: dict, exam_context: str) -> dict:
    """Verify extracted answer key by cross-referencing with exam context."""
    import logging
    from ..utils.json_utils import extract_and_validate
    from ..schemas import AnswerKeyVerificationSchema

    log = logging.getLogger(__name__)
    model = _get_vision_model()

    verification_prompt = f"""Verify this answer key against the exam content.

EXAM CONTENT:
{exam_context[:3000]}

ANSWER KEY TO VERIFY:
{json.dumps(answer_key, ensure_ascii=False)}

Check:
1. Every question number in the exam has a corresponding entry in the answer key
2. Each answer is in valid format (A/B/C/D for MCQ, "Đúng"/"Sai" for True/False)
3. No duplicate or missing entries

Return JSON:
{{
    "is_valid": true/false,
    "confidence": 0.0-1.0,
    "missing_keys": ["Câu X", ...],
    "corrected_key": {{...}},
    "feedback": "Detailed explanation of findings"
}}"""

    try:
        resp = model.invoke(verification_prompt)
        result = extract_and_validate(resp.content, AnswerKeyVerificationSchema)
        if result:
            if result.is_valid:
                log.info(f"Answer key verified OK for {session_id}")
                return answer_key
            elif result.corrected_key:
                log.warning(f"Answer key corrected: missing={result.missing_keys}")
                return result.corrected_key
    except Exception as e:
        log.error(f"Answer key verification failed: {e}")

    return answer_key

@tool
def skill_classify_pages(session_id: str, image_paths: list[str]) -> str:
    """
    Gửi thumbnail 256px của tất cả trang -> gemini-flash-lite phân loại.
    Phân loại 4 loại: text_only | has_formula | has_diagram | mcq
    Ghi metadata ra /pages_meta.json.
    Lưu ý: Bạn phải truyền thêm session_id làm tham số đầu tiên.
    """
    thumbnails = [_resize_256px(p) for p in image_paths]
    result = _classify_batch(thumbnails)
    _write_to_filesystem(session_id, "pages_meta.json", result)
    
    summary = {t: sum(1 for p in result if p["type"]==t) 
               for t in ["text_only", "has_formula", "has_diagram", "mcq"]}
    return f"Classified {len(result)} pages: {summary}"

def _cheap_ocr_batch(image_paths: list[str]) -> list[str]:
    """OCR batch using multi-engine pipeline with Vision fallback."""
    import logging
    logger = logging.getLogger(__name__)

    if not image_paths:
        return []

    logger.debug(f"[DEBUG] _cheap_ocr_batch: Processing {len(image_paths)} images via OCR pipeline...")

    try:
        from .ocr_pipeline import ocr_with_vision_fallback
        results = []
        for p in image_paths:
            results.append(ocr_with_vision_fallback(p))
        return results
    except Exception as e:
        logger.error(f"[ERROR] Lỗi batch OCR: {e}")
        return [f"Lỗi OCR cho {p}: {str(e)}" for p in image_paths]

@tool
def skill_build_package(session_id: str) -> str:
    """
    Lắp ráp context package từ exam_context + pages_meta.
    Sử dụng Batch OCR để tối ưu hiệu năng.
    """
    exam_context = _read_filesystem(session_id, "exam_context.txt")
    pages_meta_raw = _read_filesystem(session_id, "pages_meta.json")
    
    pages_meta = json.loads(pages_meta_raw) if pages_meta_raw else []
    
    # Gom các trang cần OCR
    ocr_targets = [p["image_path"] for p in pages_meta if p["type"] in ["text_only", "mcq"]]
    ocr_results = _cheap_ocr_batch(ocr_targets)
    
    ocr_map = dict(zip(ocr_targets, ocr_results))
    
    pages = []
    for meta in pages_meta:
        if meta["image_path"] in ocr_map:
            pages.append({"type": meta["type"], "text": ocr_map[meta["image_path"]], "image": None})
        else:
            # Các trang phức tạp (STEM) thì gửi ảnh Base64
            pages.append({"type": meta["type"], "text": None, "image": _b64(meta["image_path"])})

    package = {
        "exam_context": exam_context, 
        "pages": pages,
        "has_vision": any(p["image"] is not None for p in pages)
    }
    _write_to_filesystem(session_id, "context.json", package)
    
    # Also return the package as string for direct consumption by the agent
    return f"BUILD_SUCCESS: context.json has been prepared. Content: {json.dumps(package, ensure_ascii=False)}"
@tool
def search_documents(query: str):
    """Searches the LMS Document library for relevant content."""
    import frappe
    docs = frappe.get_all("LMS Document", 
        filters={
            "title": ["like", f"%{query}%"],
            "published": 1
        },
        fields=["name", "title", "description"],
        limit=5
    )
    results = []
    for d in docs:
        results.append(f"Document: {d.title}. Description: {d.description}")
    
    if not results:
        return "No relevant documents found in the library."
    return "\n".join(results)
