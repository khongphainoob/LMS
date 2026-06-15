"""
Quiz schemas for TOMOSA AI Quiz Generator.

Migrated from agents/schemas.py (original). Used by the quiz orchestrator
with parallel fan-out specialist agents (Choices, User Input, Open Ended).
"""

from pydantic import BaseModel, Field
from typing import List, Optional


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
