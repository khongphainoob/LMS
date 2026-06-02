from typing import TypedDict, List, Optional, Literal, Any
import logging

try:
    from langfuse import observe
except ImportError:
    try:
        from langfuse import observe
    except ImportError:
        logging.warning("langfuse observe not found. Using fallback observe.")
        def observe(*args, **kwargs):
            def decorator(func):
                return func
            return decorator

ExamType = Literal['mcq_only', 'stem_visual', 'essay_only', 'mixed']

class CalculationError(TypedDict):
    step: int
    original_expression: str
    student_value: str
    correct_value: str
    error_type: Literal['arithmetic', 'unit', 'sign', 'logic']
    impact: Literal['minor', 'major', 'fatal']

class VisualPageReport(TypedDict):
    page_no: int
    page_type: Literal['mcq', 'stem_visual', 'essay_layout']
    detected_marks: List[str]
    has_solution_text: bool
    raw_ocr_text: Optional[str]
    visual_feedback: str
    confidence_score: float
    ambiguous_regions: List[str]
    needs_manual_review: bool

class LogicReport(TypedDict):
    was_run: bool
    calculation_errors: List[CalculationError]
    consistency_issues: List[str]
    logical_feedback: str
    severity: Literal['none', 'low', 'medium', 'high']

class GradingContext(TypedDict):
    session_id: str
    exam_type: ExamType
    max_score: float
    rubric_context: str
    visual_reports: List[VisualPageReport]
    logic_report: Optional[LogicReport]
    has_logic_been_run: bool
    final_score: Optional[float]
    final_feedback: str

def new_grading_context(session_id: str, exam_type: ExamType, rubric: str, max_score: float = 10.0) -> GradingContext:
    return {
        "session_id": session_id,
        "exam_type": exam_type,
        "max_score": max_score,
        "rubric_context": rubric,
        "visual_reports": [],
        "logic_report": None,
        "has_logic_been_run": False,
        "final_score": None,
        "final_feedback": ""
    }
