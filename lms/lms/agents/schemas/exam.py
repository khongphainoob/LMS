"""
Exam schemas for TOMOSA AI Exam Generator.

Migrated from exam/schemas.py (original). Used by the exam orchestrator
with blueprint generation, parallel section processing (Send() mapper),
and MOET 2025 scoring format.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class OptionSchema(BaseModel):
    label: str = Field(description="Option label (A, B, C, D)")
    text: str = Field(description="The text content of the option")
    is_correct: bool = Field(description="True if this is the correct option")


class MediaAssetSchema(BaseModel):
    asset_type: Literal["latex", "plot", "geometry", "image"] = Field(
        description="Type of media asset"
    )
    content: str = Field(
        description="The actual content: LaTeX string, Base64 image, or SVG string"
    )
    caption: Optional[str] = Field(description="Optional caption for the asset")


class ExamQuestionSchema(BaseModel):
    question_type: str = Field(description="Type of question (Multiple Choice, Essay, etc.)")
    question_text: str = Field(
        description="The question content. Should include placeholder [MEDIA_1] if media is attached."
    )
    options: Optional[List[OptionSchema]] = Field(
        default=None, description="Options for Multiple Choice questions"
    )
    correct_answer: str = Field(description="The correct answer text")
    explanation: str = Field(description="Detailed step-by-step solution")
    difficulty_level: Literal["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"] = Field(
        description="Difficulty level"
    )
    bloom_level: str = Field(description="Bloom's taxonomy level")
    topic: str = Field(description="The specific curriculum topic covered")
    points: float = Field(default=1.0, description="Points awarded for this question")
    needs_visual: bool = Field(
        default=False,
        description="True if this question requires geometric figures, data plots, or complex statistical charts",
    )
    visual_description: Optional[str] = Field(
        default=None,
        description="Detailed description of the visual needed (if needs_visual is True)",
    )
    media_assets: Optional[List[MediaAssetSchema]] = Field(
        default=None, description="Generated media assets"
    )


class ExamSectionSchema(BaseModel):
    section_name: str = Field(description="Name of the section (e.g., Phần I: Trắc nghiệm)")
    section_type: str = Field(description="Type of section (e.g., Multiple Choice, Subjective)")
    instructions: str = Field(description="Instructions for this section")
    questions: List[ExamQuestionSchema] = Field(description="List of questions in this section")


class ExamBlueprintSchema(BaseModel):
    title: str = Field(description="Title of the exam")
    instructions: str = Field(description="General instructions for the exam")
    sections_blueprint: List[dict] = Field(
        description="Outline of sections and number of questions per section"
    )


class ExamSchema(BaseModel):
    title: str = Field(description="Title of the exam")
    instructions: str = Field(description="General instructions for the exam")
    sections: List[ExamSectionSchema] = Field(
        description="List of sections containing the final questions"
    )


# ===== Evaluator Schemas =====

class EvaluatorFeedbackSchema(BaseModel):
    """Evaluation feedback for exam section generation.

    Used by the exam orchestrator's section processing loop:
    generate → evaluate → pass? deliver : retry.
    Migrated from exam/orchestrator.py inline schema.
    """
    is_passed: bool = Field(description="Whether the section meets quality requirements")
    feedback: str = Field(description="Detailed feedback for improvement or confirmation")
