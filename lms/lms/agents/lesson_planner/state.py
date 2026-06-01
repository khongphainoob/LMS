from typing import TypedDict, Optional, Literal, List

class LessonPlanState(TypedDict):
    # ===== INPUT =====
    thread_id: Optional[str]             # Session/thread ID for logging
    plan_doc_name: Optional[str]         # Frappe DocType name
    teacher: str                         # Frappe user ID
    subject: str                         # Môn học
    grade_level: str                     # Khối/lớp
    topic: str                           # Chủ đề bài dạy
    duration_minutes: int                # Thời lượng tiết dạy (default 45)
    reference_content: Optional[str]     # Nội dung tham khảo (file upload raw text)
    custom_requirements: Optional[str]   # Yêu cầu riêng của GV
    custom_format_text: Optional[str]
    output_format: Literal["markdown", "docx", "latex", "lms_native"]
    target_course: Optional[str]         # LMS Course name (cho lms_native)
    
    # ===== RAG =====
    retrieved_curriculum: Optional[str]  # Chunks từ vector DB (chuẩn KT-KN)
    curriculum_standards: Optional[List[str]] # List chuẩn KT-KN matched
    
    # ===== INTERNAL =====
    lesson_outline: Optional[dict]       # Khung giáo án JSON từ Planner
    lesson_content: Optional[str]        # Nội dung Markdown từ Writer
    assessment_items: Optional[List[dict]] # Câu hỏi đánh giá
    
    # Visuals & Diagrams
    diagram_method: Optional[str]
    diagrams: Optional[List[str]]
    illustration_plan: Optional[str]
    
    # ===== HITL =====
    review_status: Optional[str]         # "pending" / "approved" / "revised"
    review_feedback: Optional[str]       # GV feedback text (nếu có)
    review_count: Optional[int]          # Số lần đã review
    
    # ===== OUTPUT =====
    final_markdown: Optional[str]
    file_url: Optional[str]              # URL file đã xuất (.docx/.tex)
    lms_lesson_name: Optional[str]       # DocType name nếu push LMS
    status: str                          # Draft / Processing / Review / Completed / Failed
    error: Optional[str]
    # ===== COST =====
    tokens_used: int
    input_tokens: int
    output_tokens: int
    total_cost_usd: float
