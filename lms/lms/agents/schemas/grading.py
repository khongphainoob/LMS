"""
Grading schemas for TOMOSA AI grading pipeline.

Migrated from agents/schemas.py (original). Contains all schemas
used by the multi-expert grading pipeline: Visual Specialist,
Logic Specialist, MCQ Grader, Essay Grader, Aggregator, and Reviewer.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class GradingCriterion(BaseModel):
    criterion: str = Field(description="Tên tiêu chí chấm điểm")
    score: float = Field(description="Điểm số đạt được", ge=0.0)
    max_score: float = Field(description="Điểm số tối đa", gt=0.0)
    reasoning: str = Field(description="Giải thích lý do chấm điểm")


class PageAnalysis(BaseModel):
    page_number: int
    type: str = Field(description="Loại trang: mcq, essay, stem")
    content_summary: str
    is_handwritten: bool


class FinalGrade(BaseModel):
    total_score: float
    total_max_score: float
    summary: str
    criteria_breakdown: List[GradingCriterion]


class PageClassificationSchema(BaseModel):
    page_no: int
    page_type: str = Field(description="mcq, stem_visual, essay_layout, or ignore")
    confidence: float


class VisualPageReportSchema(BaseModel):
    page_no: int
    page_type: str
    detected_marks: List[str] = Field(default_factory=list)
    has_solution_text: bool = False
    raw_ocr_text: str = ""
    visual_feedback: str = ""
    confidence_score: float = Field(ge=0.0, le=1.0)
    ambiguous_regions: List[str] = Field(default_factory=list)
    needs_manual_review: bool = False


class LogicReportSchema(BaseModel):
    exam_type: str
    has_formula: bool = False
    logic_issues_found: List[str] = Field(default_factory=list)
    extracted_answers: Dict[str, Any] = Field(default_factory=dict)
    reasoning: str = ""


class MCQDetailSchema(BaseModel):
    label: str
    student_choice: str
    correct_answer: str
    is_correct: bool
    score: float = Field(ge=0.0)
    max_score: float = Field(gt=0.0)
    feedback: str


class MCQResultSchema(BaseModel):
    question_no: str
    score: float = Field(ge=0.0)
    max_score: float = Field(gt=0.0)
    details: List[MCQDetailSchema] = Field(default_factory=list)


class SolutionResultSchema(BaseModel):
    question_no: str
    score: float = Field(ge=0.0)
    max_score: float = Field(gt=0.0)
    feedback: str
    is_correct: bool = False


class MCQGraderResultSchema(BaseModel):
    total_score: float = Field(ge=0.0)
    overall_feedback: str
    mcq_results: List[MCQResultSchema] = Field(default_factory=list)


class AggregatorResultSchema(BaseModel):
    total_score: float = Field(ge=0.0)
    summary: str
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    mcq_results: List[MCQResultSchema] = Field(default_factory=list)
    solution_results: List[SolutionResultSchema] = Field(default_factory=list)


class CorrectionSchema(BaseModel):
    question: str
    reason: str


class ReviewerResultSchema(BaseModel):
    total_score: float = Field(ge=0.0)
    overall_feedback: str
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    mcq_results: List[MCQResultSchema] = Field(default_factory=list)
    solution_results: List[SolutionResultSchema] = Field(default_factory=list)
    needs_reanalysis: bool = False
    corrections: List[CorrectionSchema] = Field(default_factory=list)


class AnswerKeyVerificationSchema(BaseModel):
    is_valid: bool
    confidence: float = Field(ge=0.0, le=1.0)
    missing_keys: List[str] = Field(default_factory=list)
    corrected_key: Dict[str, Any] = Field(default_factory=dict)
    feedback: str
