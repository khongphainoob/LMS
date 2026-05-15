from typing import TypedDict, Annotated, Optional, Literal
from langgraph.graph.message import add_messages


class ChatbotState(TypedDict):
    # --- Input ---
    user_message: str                    # Original student question
    student_name: str                    # Frappe user name
    lesson_name: Optional[str]           # Current lesson name
    session_key: str                     # Redis key for history
    course_name: Optional[str]
    batch_name: Optional[str]
    category: Optional[str]

    # --- LMS Context ---
    lesson_content: Optional[str]
    lesson_title: Optional[str]
    course_title: Optional[str]
    student_progress: Optional[float]
    last_quiz_score: Optional[float]
    student_display_name: Optional[str]
    student_profile: Optional[str]

    # --- Internal processing ---
    is_blocked: bool                     # Safety flag
    block_reason: Optional[str]
    message_type: Optional[Literal["qa", "quiz", "hint", "blocked"]]
    chat_history: list                   # Historical messages

    # --- Output ---
    response: Optional[str]              # AI's answer
    tokens_used: int
    latency_ms: int
    model_used: str
