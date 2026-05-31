import frappe
from frappe import _

@frappe.whitelist()
def generate_rubric(assessment_description=None, file_url=None, grading_scale="10-point", max_score=10.0, subject=None, level="High School"):
    """Generate a rubric automatically using AI, from text or file (Async)."""
    frappe.only_for(["Moderator", "Course Creator", "Instructor", "Batch Evaluator"])
    
    if not assessment_description and not file_url:
        frappe.throw("Cần cung cấp nội dung mô tả đề bài hoặc đính kèm file.")
        
    title = f"AI Rubric - {subject or 'General'} - {frappe.utils.now_datetime().strftime('%Y-%m-%d %H:%M:%S')}"
    
    doc = frappe.get_doc({
        "doctype": "LMS Rubric Template",
        "title": title,
        "description": "Đang khởi tạo (Generating...)",
        "source_content": assessment_description or "",
        "grading_scale": grading_scale,
        "max_score": float(max_score),
        "is_active": 0
    })
    
    # Add a dummy criterion to bypass validation `A rubric must have at least one criterion.`
    doc.append("criteria", {
        "criterion_name": "Generating...",
        "max_score": float(max_score)
    })
    
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    
    frappe.enqueue(
        "lms.lms.services.rubric_builder.api._run_rubric_generation_job",
        queue="long",
        timeout=600,
        rubric_name=doc.name,
        assessment_description=assessment_description,
        file_url=file_url,
        grading_scale=grading_scale,
        max_score=max_score,
        subject=subject,
        level=level
    )
    
    return {"name": doc.name, "status": "Generating"}

def _run_rubric_generation_job(rubric_name, assessment_description, file_url, grading_scale, max_score, subject, level):
    from lms.lms.services.rubric_builder.rubric_builder_service import RubricBuilderService
    from lms.lms.agents.utils.file_parser import get_content_from_file
    
    context_text = assessment_description or ""
    if file_url:
        try:
            file_doc = frappe.get_doc("File", {"file_url": file_url})
            file_content = get_content_from_file(file_doc.get_full_path())
            context_text += f"\n\n--- NỘI DUNG FILE ĐÍNH KÈM ---\n{file_content}"
        except Exception as e:
            frappe.db.set_value("LMS Rubric Template", rubric_name, "description", f"Lỗi đọc file: {str(e)}")
            frappe.db.commit()
            return
            
    try:
        service = RubricBuilderService()
        rubric_data = service.generate_rubric(
            assessment_description=context_text,
            grading_scale=grading_scale,
            max_score=float(max_score),
            subject=subject,
            level=level
        )
        
        doc = frappe.get_doc("LMS Rubric Template", rubric_name)
        doc.title = rubric_data.get("rubric_title") or doc.title
        doc.description = rubric_data.get("description", "Đã khởi tạo thành công.")
        doc.is_active = 1
        
        doc.tokens_used = rubric_data.get("usage_data", {}).get("tokens_used", 0)
        doc.input_tokens = rubric_data.get("usage_data", {}).get("input_tokens", 0)
        doc.output_tokens = rubric_data.get("usage_data", {}).get("output_tokens", 0)
        doc.total_cost_usd = rubric_data.get("usage_data", {}).get("total_cost_usd", 0.0)
        
        # Clear the dummy criteria
        doc.set("criteria", [])
        
        for crit in rubric_data.get("criteria", []):
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
            
        doc.save(ignore_permissions=True)
        frappe.db.commit()
    except Exception as e:
        frappe.db.set_value("LMS Rubric Template", rubric_name, "description", f"Lỗi sinh AI: {str(e)}")
        frappe.db.commit()

@frappe.whitelist()
def delete_rubric(name):
    """Xóa Rubric Template."""
    frappe.only_for(["Moderator", "Course Creator", "Instructor", "Batch Evaluator", "System Manager"])
    frappe.delete_doc("LMS Rubric Template", name, ignore_permissions=True)
    return "ok"

@frappe.whitelist()
def retry_generate_rubric(name):
    """Thử lại sinh Rubric nếu bị lỗi."""
    frappe.only_for(["Moderator", "Course Creator", "Instructor", "Batch Evaluator"])
    doc = frappe.get_doc("LMS Rubric Template", name)
    
    if doc.is_active == 1:
        frappe.throw("Rubric này đã hoàn thành, không thể thử lại.")
        
    frappe.db.set_value("LMS Rubric Template", name, "description", "Đang khởi tạo (Generating...)")
    frappe.db.commit()
    
    frappe.enqueue(
        "lms.lms.services.rubric_builder.api._run_rubric_generation_job",
        queue="long",
        timeout=600,
        rubric_name=doc.name,
        assessment_description=doc.get("source_content") or "",
        file_url=None,
        grading_scale=doc.grading_scale,
        max_score=doc.max_score,
        subject=None,
        level="High School"
    )
    
    return {"name": doc.name, "status": "Generating"}
