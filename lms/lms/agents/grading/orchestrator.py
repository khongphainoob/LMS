import json
import logging
import time
import os
from .session_store import GradingSession
from .visual_specialist import run_visual_analysis
from .logic_specialist import run_logic_analysis
from .aggregator import aggregate_final_grade
from .mcq_grader import run_mcq_grading
from .reviewer import run_review_analysis
from ..tools.document_tools import skill_load_context, skill_classify_pages, skill_extract_answer_key, verify_answer_key
from ..utils.filesystem import _read_filesystem, _write_to_filesystem

logger = logging.getLogger(__name__)

def run_grading_session(session_id: str, image_paths: list[str], text_content: str = None) -> dict:
    try:
        logger.info(f"--- STARTING TIER 4 MULTI-EXPERT PIPELINE: {session_id} ---")
        
        session = GradingSession(session_id)
        session.image_paths = image_paths
        
        if text_content:
            _write_to_filesystem(session_id, "student_text_submission.txt", text_content)
            session.text_content = text_content
        else:
            session.text_content = ""
        
        # 1. Khởi tạo Context & Load tài liệu (Rubric)
        start_time = time.time()
        skill_load_context.invoke({"session_id": session_id})
        
        exam_context_full = _read_filesystem(session_id, "exam_context.txt") or ""
        session.exam_context = exam_context_full
        session.rubric_context = exam_context_full
        
        skill_extract_answer_key.invoke({"session_id": session_id})
        
        answer_key_str = _read_filesystem(session_id, "answer_key.json")
        session.answer_key = json.loads(answer_key_str) if answer_key_str else {}
        
        # Xác minh Answer Key
        verified_key = verify_answer_key(session_id, session.answer_key, session.exam_context)

        if verified_key:
            session.answer_key = verified_key.get("corrected_key", session.answer_key)
            _write_to_filesystem(session_id, "answer_key_verified.json", session.answer_key)
            
        session.log_step("Context Initialization", "Success", time.time() - start_time)

        # 2. Phân loại trang
        start_time = time.time()
        skill_classify_pages.invoke({"session_id": session_id, "image_paths": image_paths})
        
        pages_meta_str = _read_filesystem(session_id, "pages_meta.json")
        if pages_meta_str:
            session.pages_meta = json.loads(pages_meta_str)
            page_types = []
            for p in session.pages_meta:
                ptype = p.get("type", "stem_visual")
                if ptype == "mcq":
                    page_types.append("mcq")
                elif ptype in ["has_formula", "has_diagram", "stem_visual"]:
                    page_types.append("stem_visual")
                else:
                    page_types.append("essay_layout")
        else:
            page_types = ["stem_visual"] * len(image_paths)
            
        # Set exam_type
        if all(pt == "mcq" for pt in page_types):
            session.grading_type = "mcq_only"
        elif all(pt == "stem_visual" for pt in page_types):
            session.grading_type = "stem_visual"
        elif all(pt == "essay_layout" for pt in page_types):
            session.grading_type = "essay_only"
        else:
            session.grading_type = "mixed"
            
        session.log_step("Page Classification", "Success", time.time() - start_time)

        # 3. Vòng lặp Feedback (Tối đa 2 lần)
        max_attempts = 2
        threshold = float(os.environ.get("GRADING_REVIEW_THRESHOLD", "0.8"))
        
        for attempt in range(max_attempts):
            logger.info(f"--- GRADING ATTEMPT {attempt + 1}/{max_attempts} ---")
            context = session.to_manifest()
            
            if hasattr(session, 'text_content') and session.text_content:
                context['text_content'] = session.text_content
            
            if image_paths and len(image_paths) > 0:
                # Visual Analysis
                logger.info("Phase 1: Visual Specialist is observing...")
                start_time = time.time()
                session.visual_reports = run_visual_analysis(context, image_paths, page_types)
                session.log_step(f"Visual Analysis (Attempt {attempt+1})", "Success", time.time() - start_time)
            else:
                logger.info("Phase 1: Visual Specialist skipped (No images)")
                session.visual_reports = []
                # Inject text_content as a mock visual report so Logic/MCQ grader can parse it if needed
                if hasattr(session, 'text_content') and session.text_content:
                    session.visual_reports = [{
                        "page_no": 1,
                        "raw_ocr_text": session.text_content,
                        "has_solution_text": True,
                        "extracted_text": session.text_content
                    }]
            
            # Update context for logic
            context = session.to_manifest()
            if hasattr(session, 'text_content') and session.text_content:
                context['text_content'] = session.text_content
            
            # Logic / MCQ Analysis
            if session.grading_type == "mcq_only":
                logger.info("Phase 2: MCQ Grader is matching answers...")
                start_time = time.time()
                # Tổng hợp toàn bộ OCR text từ Visual Reports
                combined_ocr = "\n".join([r.get('raw_ocr_text', '') for r in session.visual_reports])
                session.logic_report = run_mcq_grading(combined_ocr, session.answer_key, session.rubric_context)
                session.log_step(f"MCQ Analysis (Attempt {attempt+1})", "Success", time.time() - start_time)
            elif any(r.get('has_solution_text') for r in session.visual_reports) or session.grading_type in ["stem_visual", "mixed", "essay_only"]:
                logger.info("Phase 2: Logic Specialist is thinking...")
                start_time = time.time()
                session.logic_report = run_logic_analysis(context)
                session.log_step(f"Logic Analysis (Attempt {attempt+1})", "Success", time.time() - start_time)
            else:
                logger.info("Phase 2: Logic Specialist skipped")
                
            # Update context for aggregator
            context = session.to_manifest()
                
            # Aggregator
            logger.info("Phase 3: Aggregator is finalizing the grade...")
            start_time = time.time()
            session.final_result = aggregate_final_grade(context)
            session.confidence = session.final_result.get("confidence", 0.9)
            session.log_step(f"Aggregation (Attempt {attempt+1})", "Success", time.time() - start_time)
            
            # Check if review is needed
            if session.confidence < threshold:
                logger.info(f"Confidence {session.confidence} < {threshold}. Invoking Reviewer...")
                start_time = time.time()
                reviewed_result = run_review_analysis(context, session.final_result)
                session.log_step(f"Review Analysis (Attempt {attempt+1})", "Success", time.time() - start_time)
                
                # Check for re-analysis
                if reviewed_result.get("needs_reanalysis") and attempt < max_attempts - 1:
                    logger.warning("Reviewer requested RE-ANALYSIS. Restarting loop...")
                    session.corrections = reviewed_result.get("corrections", [])
                    session.reanalysis_count += 1
                    continue # Vòng lặp tiếp tục
                else:
                    session.final_result = reviewed_result # Chấp nhận bản sửa lỗi của Reviewer
                    break # Dừng vòng lặp
            else:
                logger.info(f"Confidence {session.confidence} >= {threshold}. Passing without review.")
                break # Dừng vòng lặp
                
        # 4. Save debug info and return
        session.save_to_disk()
        logger.info(session.get_summary())
        
        # Đảm bảo format đầu ra giống AggregatorResultSchema/ReviewerResultSchema
        return session.final_result
        
    except Exception as e:
        logger.error(f"Sequential Grading Pipeline failed: {str(e)}", exc_info=True)
        return {"error": str(e)}