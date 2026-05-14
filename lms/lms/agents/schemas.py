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


class QuizQuestionSchema(BaseModel):
    question: str = Field(..., description="The content of the question")
    type: str = Field(..., description="Choices, User Input, or Open Ended")
    points: int = Field(1, description="Point value")
    
    # MCQ Fields
    option_1: Optional[str] = Field(None)
    option_2: Optional[str] = Field(None)
    option_3: Optional[str] = Field(None)
    option_4: Optional[str] = Field(None)
    is_correct_1: bool = Field(False)
    is_correct_2: bool = Field(False)
    is_correct_3: bool = Field(False)
    is_correct_4: bool = Field(False)
    explanation_1: Optional[str] = Field(None)
    explanation_2: Optional[str] = Field(None)
    explanation_3: Optional[str] = Field(None)
    explanation_4: Optional[str] = Field(None)
    
    # User Input Fields
    possibility_1: Optional[str] = Field(None)
    possibility_2: Optional[str] = Field(None)
    possibility_3: Optional[str] = Field(None)
    possibility_4: Optional[str] = Field(None)
    
    # Open Ended
    scoring_rubric: Optional[str] = Field(None)
    sample_answer: Optional[str] = Field(None)

class QuizSchema(BaseModel):
    title: str = Field(..., description="A concise title for the quiz")
    questions: List[QuizQuestionSchema] = Field(..., description="The generated questions")