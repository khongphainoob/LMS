"""
Reusable safety guard node — generalized from chatbot/nodes/guard.py.

Any agent can use this node as a pre-processing or pre-delivery gate.
Configurable: custom block rules, custom response messages, custom bypass logic.

Usage:
    from lms.lms.agents.shared_nodes import safety_guard_node, SafetyGuardConfig

    config = SafetyGuardConfig(
        agent_name="chatbot",
        block_rules=["Ngôn ngữ thô tục", "Làm bài hộ"],
    )
    result = safety_guard_node(state, config)
    if result["is_blocked"]:
        return END
"""

import json
import frappe
from typing import Optional, List, Callable
from dataclasses import dataclass, field
from langchain_core.messages import HumanMessage, SystemMessage


@dataclass
class SafetyGuardConfig:
    """Configuration for the safety guard node.

    Customize per-agent: chatbot uses student-facing rules,
    lesson planner might check for curriculum violations, etc.
    """
    agent_name: str = "default"
    temperature: float = 0.0
    block_reason_field: str = "block_reason"
    is_blocked_field: str = "is_blocked"
    message_type_field: str = "message_type"

    # Custom override for the system prompt (if None, uses DEFAULT_GUARD_SYSTEM)
    custom_system_prompt: Optional[str] = None

    # Custom rules appended to the default prompt
    extra_block_rules: List[str] = field(default_factory=list)
    extra_allow_rules: List[str] = field(default_factory=list)

    # Response template when blocked
    blocked_response_template: str = (
        "⚠️ Chào {student_name}, mình không thể hỗ trợ yêu cầu này vì: {reason}."
    )

    # Function to extract user message text from state
    # Default: state["user_message"]
    get_user_message: Optional[Callable[[dict], str]] = None

    # Function to extract user display name from state
    get_user_display_name: Optional[Callable[[dict], str]] = None


DEFAULT_GUARD_SYSTEM = """Bạn là chuyên gia kiểm duyệt nội dung cho chatbot giáo dục.
Phân tích tin nhắn của học sinh và trả về JSON:
{"blocked": true/false, "reason": "lý do ngắn gọn"}

BLOCK nếu:
- Ngôn ngữ thô tục, bạo lực, hoặc không phù hợp lứa tuổi.
- Yêu cầu làm bài tập hộ hoàn toàn (ví dụ: "viết hộ tớ bài văn 500 chữ về...").
- Câu hỏi hoàn toàn không liên quan đến giáo dục (mua sắm, yêu đương, chính trị).

KHÔNG BLOCK nếu:
- Học sinh hỏi để hiểu bản chất vấn đề.
- Học sinh hỏi xin gợi ý cách làm.
- Học sinh chào hỏi hoặc hỏi về khả năng của chatbot.

Chỉ trả về JSON thuần túy."""


def safety_guard_node(state: dict, config: SafetyGuardConfig = None) -> dict:
    """
    Reusable safety guard node for any LangGraph agent.

    Checks user input (or any content field) against configurable
    safety rules. Returns {"is_blocked": True/False, ...} updates.

    Args:
        state: Agent state dict (any TypedDict)
        config: SafetyGuardConfig (uses defaults if None)

    Returns:
        Dict with is_blocked, block_reason, response (if blocked)
    """
    config = config or SafetyGuardConfig()

    from lms.lms.agents.core.provider import get_llm

    # Resolve user message
    if config.get_user_message:
        user_message = config.get_user_message(state)
    else:
        user_message = state.get("user_message", "")

    # Resolve display name
    if config.get_user_display_name:
        display_name = config.get_user_display_name(state)
    else:
        display_name = state.get("student_display_name", "học sinh")

    # Build system prompt
    system_prompt = config.custom_system_prompt or DEFAULT_GUARD_SYSTEM
    if config.extra_block_rules:
        system_prompt += "\n\nBLOCK THÊM:\n" + "\n".join(
            f"- {r}" for r in config.extra_block_rules
        )
    if config.extra_allow_rules:
        system_prompt += "\n\nKHÔNG BLOCK THÊM:\n" + "\n".join(
            f"- {r}" for r in config.extra_allow_rules
        )

    llm, _, _ = get_llm(config.agent_name, temperature=config.temperature)

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Học sinh: {display_name}\nTin nhắn: {user_message}"),
    ]

    updates = {}

    try:
        result = llm.invoke(messages)
        clean = result.content.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean)

        if data.get("blocked"):
            updates[config.is_blocked_field] = True
            updates[config.block_reason_field] = data.get(
                "reason", "Nội dung không phù hợp"
            )
            updates["response"] = config.blocked_response_template.format(
                student_name=display_name,
                reason=data.get("reason", "Nội dung không phù hợp cho môi trường học tập"),
            )
            updates[config.message_type_field] = "blocked"
            return updates
    except Exception:
        pass

    updates[config.is_blocked_field] = False
    return updates
