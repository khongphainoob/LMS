"""
Rubric schemas for TOMOSA rubric builder and grading.

Migrated from agents/schemas.py (original). Used by the rubric generator
graph (validate-and-fix retry loop) and the grading pipeline for
structured scoring criteria.
"""

from pydantic import BaseModel, Field
from typing import List


class RubricCondition(BaseModel):
    condition: str = Field(description="Điều kiện để đạt điểm")
    points: float = Field(description="Số điểm tương ứng")


class RubricCriterion(BaseModel):
    item_id: str = Field(description="ID của tiêu chí hoặc câu hỏi")
    description: str = Field(description="Mô tả tiêu chí")
    max_points: float = Field(description="Điểm tối đa cho tiêu chí này")
    scoring_rules: List[RubricCondition] = Field(
        description="Các quy tắc và điều kiện chấm điểm"
    )


class RubricAnalysis(BaseModel):
    criteria: List[RubricCriterion] = Field(
        description="Danh sách các tiêu chí đã bóc tách từ Rubric"
    )
