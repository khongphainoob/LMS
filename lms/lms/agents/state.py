from typing import Dict, List, Literal, NotRequired, TypedDict


class QuestionChunk(TypedDict):
    question_id: str
    header: str
    answer_text: str
    rubric_key: NotRequired[str]
    split_method: Literal["regex", "heuristic", "manual"]


class GradeResult(TypedDict):
    question_id: str
    score: float
    max_score: float
    feedback: str
    confidence: float
    model: str


class ReviewDecision(TypedDict):
    action: Literal["approved", "rejected", "partial_edit"]
    note: NotRequired[str]
    edited_scores: NotRequired[Dict[str, float]]


class AgentState(TypedDict):
    # Session + submission identity
    thread_id: str
    session_id: str
    submission_id: str
    student_id: NotRequired[str]

    # Input payload
    provider: str
    model: str
    prompt_template: NotRequired[str]
    rubric: NotRequired[Dict]
    source_text: NotRequired[str]

    # Pipeline outputs
    question_chunks: NotRequired[List[QuestionChunk]]
    grade_results: NotRequired[List[GradeResult]]
    total_score: NotRequired[float]
    final_feedback: NotRequired[str]

    # Human-in-the-loop
    requires_review: NotRequired[bool]
    review_decision: NotRequired[ReviewDecision]

    # Flow control / errors
    status: Literal["queued", "running", "waiting_review", "completed", "failed"]
    current_node: NotRequired[str]
    retry_count: NotRequired[int]
    error_message: NotRequired[str]