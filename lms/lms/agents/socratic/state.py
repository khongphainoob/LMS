"""Socratic Tutor State definition for LangGraph."""
from typing import TypedDict, Optional, List, Dict, Any


class SocraticState(TypedDict, total=False):
    """State passed through the Socratic Tutor graph.
    Uses TypedDict for LangGraph compatibility.
    """
    # --- Input from API ---
    user_message: str
    student_name: str
    lesson_name: Optional[str]
    session_key: str
    chat_history: List[Dict[str, str]]
    scaffolding_level: int
    lesson_content: str
    image_data: Optional[str]
    rubric_data: Optional[str]

    # --- Internal state (set by nodes) ---
    processed_content: str
    context: str
    evaluation: Dict[str, Any]
    mistake_count: int
    current_status: str

    # --- Output ---
    response: str
    message_type: str
    tokens_used: int
    model_used: str
