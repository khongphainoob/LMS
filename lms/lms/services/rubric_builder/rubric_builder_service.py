# -*- coding: utf-8 -*-
import frappe
import json
import re
from typing import Dict, Any, List, Optional
from lms.lms.services.base_service import BaseService
from lms.lms.agents.grading.graph import build_rubric_graph

class RubricBuilderService(BaseService):
    def __init__(self):
        super().__init__("LMS Rubric Template")

    def generate_rubric(
        self,
        assessment_description: str,
        criteria_descriptions: List[str] = None,
        grading_scale: str = "10-point",
        max_score: float = 10.0,
        subject: str = None,
        level: str = "High School",
        language: str = "vietnamese"
    ) -> Dict[str, Any]:
        """Use the LangGraph pipeline to analyze content and create a rubric structure."""
        
        from lms.lms.services.ai_rate_limit import check_and_record_usage
        check_and_record_usage(frappe.session.user, "Rubric Gen", increment=1)
        
        full_context = assessment_description
        if criteria_descriptions:
            if isinstance(criteria_descriptions, list):
                full_context += "\n\nInitial Criteria Suggestions:\n" + "\n".join(criteria_descriptions)
            else:
                full_context += f"\n\nInitial Criteria Suggestions:\n{criteria_descriptions}"
            
        initial_state = {
            "input_text": full_context,
            "grading_scale": grading_scale,
            "max_score": float(max_score),
            "subject": subject,
            "level": level,
            "knowledge_map": "",
            "analysis_topics": [],
            "criteria": [],
            "tokens_used": 0,
            "input_tokens": 0,
            "output_tokens": 0,
            "total_cost_usd": 0.0,
            "error": None
        }
        
        graph = build_rubric_graph()
        
        from lms.lms.services.observability import get_unified_config_dict, flush_langfuse
        config = get_unified_config_dict(agent_name="rubric_builder", session_id=f"rubric_{frappe.generate_hash(length=8)}", tags=["RubricBuilder"])
        
        final_state = graph.invoke(initial_state, config)
        flush_langfuse()
        
        if final_state.get("error") or not final_state.get("criteria"):
            frappe.throw(final_state.get("error", "AI failed to generate rubric criteria."))
            
        # Map generator output to the expected format for saving
        result = {
            "rubric_title": f"AI Rubric - {subject or 'General'}",
            "description": "Đã khởi tạo thành công.",
            "grading_scale": grading_scale,
            "max_score": max_score,
            "subject": subject,
            "level": level,
            "assessment_description": assessment_description,
            "criteria": final_state.get("criteria"),
            "usage_data": {
                "tokens_used": final_state.get("tokens_used", 0),
                "input_tokens": final_state.get("input_tokens", 0),
                "output_tokens": final_state.get("output_tokens", 0),
                "total_cost_usd": final_state.get("total_cost_usd", 0.0)
            }
        }
        
        return result

    def save_rubric_template(self, rubric_data: Dict, course: str = None) -> Dict:
        """Save a generated rubric to the database."""
        # Check if rubric with same title exists to avoid unique constraint error
        title = rubric_data.get("rubric_title") or rubric_data.get("title") or "Untitled Rubric"
        if frappe.db.exists("LMS Rubric Template", {"title": title}):
            title = f"{title} ({frappe.utils.now_datetime().strftime('%Y-%m-%d %H:%M')})"
            
        doc = frappe.get_doc({
            "doctype": "LMS Rubric Template",
            "title": title,
            "description": rubric_data.get("description", ""),
            "grading_scale": rubric_data.get("grading_scale", "10-point"),
            "max_score": rubric_data.get("max_score", 10.0),
            "course": course,
            "is_active": 1,
            "tokens_used": rubric_data.get("usage_data", {}).get("tokens_used", 0),
            "input_tokens": rubric_data.get("usage_data", {}).get("input_tokens", 0),
            "output_tokens": rubric_data.get("usage_data", {}).get("output_tokens", 0),
            "total_cost_usd": rubric_data.get("usage_data", {}).get("total_cost_usd", 0.0)
        })
        
        # Add criteria child table
        for crit in rubric_data.get("criteria", []):
            # The generator might return performance_levels_json or individual level fields
            # We map them to our schema
            doc.append("criteria", {
                "criterion_name": crit.get("criterion_name", crit.get("name", "")),
                "max_score": crit.get("max_score", 1.0),
                "weight": crit.get("weight", 1.0),
                "description": crit.get("description", ""),
                "level_excellent": crit.get("level_excellent", ""),
                "level_good": crit.get("level_good", ""),
                "level_adequate": crit.get("level_adequate", ""),
                "level_poor": crit.get("level_poor", "")
            })
            
        doc.insert()
        return doc.as_dict()

    def get_rubric_detail(self, name: str) -> Dict:
        doc = frappe.get_doc("LMS Rubric Template", name)
        result = doc.as_dict()
        result["criteria"] = [c.as_dict() for c in doc.get("criteria", [])]
        return result

    def get_rubric_stats(self) -> Dict[str, Any]:
        return {
            "total_rubrics": frappe.db.count("LMS Rubric Template"),
            "ai_generated_count": frappe.db.count("LMS Rubric Template"), # Simplified
            "linked_to_sessions": frappe.db.count("AI Grading Session", filters={"rubric_template": ["is", "set"]})
        }

    def export_rubric(self, name: str) -> str:
        """Exports a rubric to a Word document using Pandoc (with MathJax) and returns the file URL."""
        import os
        import tempfile
        import pypandoc
        from frappe.utils.file_manager import save_file

        doc_data = self.get_rubric_detail(name)
        
        # 1. Generate Markdown content (Professional Educational Report Format)
        title = doc_data.get('title', 'Rubric')
        scale = doc_data.get('grading_scale', '10-point')
        max_score = doc_data.get('max_score', 0)
        desc = doc_data.get('description', '')

        md_text = f"**BỘ GIÁO DỤC VÀ ĐÀO TẠO / SỞ GD&ĐT**  \n"
        md_text += f"**TRƯỜNG / ĐƠN VỊ: .......................................**  \n\n"
        md_text += f"# ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHÍNH THỨC\n\n"
        md_text += f"### **Môn / Bài thi:** {title}\n\n"
        
        md_text += f"> **Thông tin chung:**\n"
        md_text += f"> - **Thang điểm:** {scale}\n"
        md_text += f"> - **Tổng điểm tối đa:** {max_score}\n"
        
        if desc:
            md_text += f"> - **Ghi chú/Mô tả:** {desc}\n"
            
        md_text += "\n---\n\n"
        
        # Table Header (Standard Vietnamese Exam Rubric Format)
        md_text += "| Tiêu chí / Câu hỏi | Hướng dẫn chấm (Nội dung / Ý chi tiết) | Điểm |\n"
        md_text += "|:---|:---|:---:|\n"
        
        for crit in doc_data.get("criteria", []):
            name_cell = str(crit.get('criterion_name', '')).replace('\n', ' ')
            max_score = crit.get('max_score', 0)
            
            # Build the content cell intelligently
            content_parts = []
            desc = str(crit.get('description', '')).strip()
            if desc:
                content_parts.append(desc.replace('\n', '<br>'))
                
            exc = str(crit.get('level_excellent', '')).strip()
            good = str(crit.get('level_good', '')).strip()
            adeq = str(crit.get('level_adequate', '')).strip()
            poor = str(crit.get('level_poor', '')).strip()
            
            # If it's a simple exam answer key (only one level populated)
            if exc and not good and not adeq and not poor:
                content_parts.append(exc.replace('\n', '<br>'))
            else:
                # If it's a full proficiency rubric
                if exc: content_parts.append(f"**Xuất sắc:** {exc.replace(chr(10), '<br>')}")
                if good: content_parts.append(f"**Khá/Giỏi:** {good.replace(chr(10), '<br>')}")
                if adeq: content_parts.append(f"**Đạt:** {adeq.replace(chr(10), '<br>')}")
                if poor: content_parts.append(f"**Chưa đạt:** {poor.replace(chr(10), '<br>')}")
                
            content_cell = "<br><br>".join(content_parts) if content_parts else "N/A"
            
            md_text += f"| **{name_cell}** | {content_cell} | **{max_score}** |\n"
            
        md_text += "\n"

        # 2. Convert using pypandoc
        with tempfile.NamedTemporaryFile(suffix=".md", delete=False) as temp_md:
            temp_md.write(md_text.encode('utf-8'))
            md_path = temp_md.name
            
        docx_path = md_path.replace(".md", ".docx")
        try:
            pypandoc.convert_file(md_path, 'docx', outputfile=docx_path, extra_args=["--mathjax"])
            with open(docx_path, 'rb') as f:
                docx_bytes = f.read()
        finally:
            if os.path.exists(md_path): os.remove(md_path)
            if os.path.exists(docx_path): os.remove(docx_path)
            
        # 3. Save to Frappe Files
        file_name = f"Rubric_{name}.docx"
        file_doc = save_file(
            file_name,
            docx_bytes,
            "LMS Rubric Template",
            name,
            is_private=1,
            decode=False
        )
        
        return file_doc.file_url