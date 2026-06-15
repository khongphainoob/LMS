"""
Centralized Pydantic schemas for TOMOSA multi-agent architecture.

All agent schemas are organized by domain. Import from here or directly
from submodule for granular control.

Usage:
    # Import all grading schemas
    from lms.lms.agents.schemas import GradingCriterion, FinalGrade, AggregatorResultSchema

    # Import evaluation schemas
    from lms.lms.agents.schemas import EvaluationResult, ConfidenceScore, ValidatorConfig

    # Import base schemas
    from lms.lms.agents.schemas import UsageMetrics, ErrorInfo, AgentExecutionMeta
"""

from .base import UsageMetrics, ErrorInfo, AgentExecutionMeta

from .grading import (
    GradingCriterion,
    PageAnalysis,
    FinalGrade,
    PageClassificationSchema,
    VisualPageReportSchema,
    LogicReportSchema,
    MCQDetailSchema,
    MCQResultSchema,
    SolutionResultSchema,
    MCQGraderResultSchema,
    AggregatorResultSchema,
    CorrectionSchema,
    ReviewerResultSchema,
    AnswerKeyVerificationSchema,
)

from .quiz import QuizQuestionSchema, QuizSchema

from .exam import (
    OptionSchema,
    MediaAssetSchema,
    ExamQuestionSchema,
    ExamSectionSchema,
    ExamBlueprintSchema,
    ExamSchema,
    EvaluatorFeedbackSchema,
)

from .rubric import RubricCondition, RubricCriterion, RubricAnalysis

from .lesson_plan import (
    LessonSection,
    LessonOutline,
    AssessmentItem,
    AssessmentSet,
    DiagramSpec,
    LessonPlanOutput,
)

from .evaluation import (
    DimensionScore,
    EvaluationResult,
    ConfidenceScore,
    ContentFlag,
    ValidatorConfig,
)

__all__ = [
    # Base
    "UsageMetrics",
    "ErrorInfo",
    "AgentExecutionMeta",
    # Grading
    "GradingCriterion",
    "PageAnalysis",
    "FinalGrade",
    "PageClassificationSchema",
    "VisualPageReportSchema",
    "LogicReportSchema",
    "MCQDetailSchema",
    "MCQResultSchema",
    "SolutionResultSchema",
    "MCQGraderResultSchema",
    "AggregatorResultSchema",
    "CorrectionSchema",
    "ReviewerResultSchema",
    "AnswerKeyVerificationSchema",
    # Quiz
    "QuizQuestionSchema",
    "QuizSchema",
    # Exam
    "OptionSchema",
    "MediaAssetSchema",
    "ExamQuestionSchema",
    "ExamSectionSchema",
    "ExamBlueprintSchema",
    "ExamSchema",
    "EvaluatorFeedbackSchema",
    # Rubric
    "RubricCondition",
    "RubricCriterion",
    "RubricAnalysis",
    # Lesson Plan
    "LessonSection",
    "LessonOutline",
    "AssessmentItem",
    "AssessmentSet",
    "DiagramSpec",
    "LessonPlanOutput",
    # Evaluation
    "DimensionScore",
    "EvaluationResult",
    "ConfidenceScore",
    "ContentFlag",
    "ValidatorConfig",
]
