import frappe
import json
import os
import operator
from typing import List, Annotated, TypedDict, Union
from langgraph.graph import StateGraph, END, START
from lms.lms.agents.provider import get_llm
from lms.lms.agents.schemas import QuizSchema, QuizQuestionSchema
from lms.lms.agents.utils.file_parser import get_content_from_file
from langfuse import observe

# --- 1. State Definition ---
class QuizState(TypedDict):
    quiz_id: str
    source_content: str
    language: str
    bloom_level: str
    additional_prompt: str
    requirements: dict
    questions: Annotated[List[QuizQuestionSchema], operator.add]
    error: str
    frappe_config: dict # To store pre-fetched AI settings

# --- 2. Specialist Nodes ---
@observe(as_type="generation")
def generate_questions_node(state: QuizState, q_type: str, frappe_type: str):
    """Generic node for specialist question generation."""
    # No DB access in thread
    pass
        
    settings = state["requirements"].get(q_type, {})
    count = settings.get("count", 0)
    points = settings.get("points", 1)
    
    if count <= 0:
        return {"questions": []}
    
    system_prompt = f"""You are a Specialist Assessment Designer for {frappe_type} questions.
    
### CONTEXT
{state["source_content"] or "General knowledge."}

### INSTRUCTIONS
Generate exactly {count} questions of type "{frappe_type}".
Each question is worth {points} points.
Language: {state["language"]}
Bloom Level: {state["bloom_level"]}
{f"Additional Requirements: {state['additional_prompt']}" if state['additional_prompt'] else ""}

### SCHEMA RULES
- If Choices: 4 options, 1 correct.
- If User Input: use possibility_1.
- If Open Ended: use scoring_rubric.

### OUTPUT REQUIREMENT
You MUST return a JSON object with:
1. "title": A specialist label (e.g. "{frappe_type} Specialist Output")
2. "questions": The list of generated {frappe_type} questions. Each question must have a "type" field matching "{frappe_type}".
"""


    print(f"DEBUG: Node {frappe_type} starting for {count} questions...")
    
    try:
        # 2. Setup LLM (Use pre-fetched config to avoid parallel DB calls)
        llm, _, _ = get_llm(f"Quiz {frappe_type}", override_config=state.get("frappe_config", {}).get("override_config"))
        # Ensure the model knows it needs to fill QuizSchema
        response = llm.with_structured_output(QuizSchema).invoke([
            ("system", system_prompt),
            ("user", f"Generate {count} {frappe_type} questions now.")
        ])
        
        q_list = response.questions if response else []
        print(f"DEBUG: Node {frappe_type} finished. Produced {len(q_list)} questions.")
        
        if not response or not response.questions:
            print(f"Specialist {frappe_type} returned empty")
            return {"questions": []}
        return {"questions": q_list}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Specialist {frappe_type} Exception: {str(e)}")
        return {"questions": []}

def choices_node(state: QuizState):
    return generate_questions_node(state, "choices", "Choices")

def input_node(state: QuizState):
    return generate_questions_node(state, "input", "User Input")

def open_ended_node(state: QuizState):
    return generate_questions_node(state, "open", "Open Ended")

# --- 3. Orchestration Logic ---
def create_quiz_graph():
    workflow = StateGraph(QuizState)
    
    # Add Nodes
    workflow.add_node("choices_agent", choices_node)
    workflow.add_node("input_agent", input_node)
    workflow.add_node("open_ended_agent", open_ended_node)
    
    # Enable Parallel Execution (Fan-out)
    workflow.add_edge(START, "choices_agent")
    workflow.add_edge(START, "input_agent")
    workflow.add_edge(START, "open_ended_agent")
    
    # Combine results (Fan-in happens automatically at END due to state merging)
    workflow.add_edge("choices_agent", END)
    workflow.add_edge("input_agent", END)
    workflow.add_edge("open_ended_agent", END)
    
    return workflow.compile()

@observe(as_type="generation", name="AI Quiz Generation")
def generate_quiz_orchestrator(quiz_id, config=None):
    """
    LangGraph-based AI Quiz Orchestrator with detailed logging.
    """
    logger = frappe.logger("AI Quiz")
    try:
        quiz_doc = frappe.get_doc("AI Quiz", quiz_id)
        
        # 0. Load config from doc if not provided
        if not config and quiz_doc.config:
            config = quiz_doc.config

        # 0. Parse Config if string
        if isinstance(config, str):
            try:
                import json
                config = json.loads(config)
            except:
                logger.error(f"[{quiz_id}] Failed to parse config JSON: {config}")
                config = {}
        quiz_doc.status = "Processing"
        quiz_doc.add_comment("Comment", "🚀 Bắt đầu quy trình khởi tạo bộ đề AI...")
        quiz_doc.save(ignore_permissions=True)
        frappe.db.commit()

        # 1. Prepare Initial State (Pre-fetch config to avoid parallel DB calls)
        from lms.lms.agents.provider import get_agent_config
        ai_config = get_agent_config("Quiz Generator")
        
        # Thêm cấu hình Provider để tránh gọi DB trong thread
        ai_settings_doc = frappe.get_doc("LMS AI Settings")
        ai_settings = ai_settings_doc.as_dict()
        override_config = {
            "provider_name": ai_settings.get("default_provider"),
            "model_name": ai_settings.get("default_model"),
            "api_key": ai_settings_doc.get_password("default_api_key", raise_exception=False),
            "base_url": ai_settings.get("default_base_url")
        }
        for row in ai_settings_doc.agent_configs:
            if row.agent_name == "Quiz Generator" and row.enabled:
                if row.provider and row.provider != "(inherit)":
                    override_config["provider_name"] = row.provider
                if row.model:
                    override_config["model_name"] = row.model
                if row.temperature is not None and row.temperature != "":
                    override_config["temperature"] = float(row.temperature)
                if row.max_tokens:
                    override_config["max_tokens"] = int(row.max_tokens)
                break
        
        # Luôn đảm bảo max_tokens đủ lớn để sinh nhiều câu hỏi
        if override_config.get("max_tokens", 2048) < 8192:
            override_config["max_tokens"] = 8192
            
        ai_config["override_config"] = override_config

        print(f"DEBUG: Extracting context for {quiz_id}...")
        logger.info(f"[{quiz_id}] Extracting context...")
        source_content = ""
        if quiz_doc.source_file:
            try:
                file_doc = frappe.get_doc("File", {"file_url": quiz_doc.source_file})
                source_content = get_content_from_file(file_doc.get_full_path())
                quiz_doc.add_comment("Comment", f"📄 Đã đọc nội dung từ file: {file_doc.file_name}")
            except Exception as fe:
                logger.error(f"[{quiz_id}] File extraction failed: {str(fe)}")
                quiz_doc.add_comment("Comment", f"⚠️ Không thể đọc file nguồn: {str(fe)}. AI sẽ sử dụng kiến thức chung.")
        
        # Ensure requirements exists
        requirements = {}
        if config and isinstance(config, dict):
            # Support both { "questions": {...} } and direct { "choices": {...} }
            requirements = config.get("questions", config)
        
        print(f"DEBUG: Raw config detected: {frappe.as_json(config)}")
        print(f"DEBUG: Final requirements used: {frappe.as_json(requirements)}")

        initial_state = {
            "quiz_id": quiz_id,
            "source_content": source_content,
            "language": quiz_doc.language or "Tiếng Việt",
            "bloom_level": quiz_doc.bloom_level or "Remember",
            "additional_prompt": quiz_doc.additional_prompt or "",
            "requirements": requirements,
            "questions": [],
            "error": "",
            "frappe_config": ai_config
        }
        
        # 2. Run LangGraph Workflow
        print("DEBUG: Starting LangGraph workflow...")
        logger.info(f"[{quiz_id}] Starting LangGraph workflow...")
        quiz_doc.add_comment("Comment", "🧠 Đang kích hoạt đội ngũ Agent chuyên gia (Choices, Input, Open Ended)...")
        
        graph = create_quiz_graph()
        final_state = graph.invoke(initial_state)
        
        # 3. Aggregation Phase
        # IMPORTANT: Parallel threads may have closed the shared DB connection. Reconnect now.
        print("DEBUG: Refreshing DB connection after parallel workflow...")
        frappe.db.connect()
        
        generated_questions = final_state.get("questions", [])
        print(f"DEBUG: Workflow finished. Generated {len(generated_questions)} questions.")
        logger.info(f"[{quiz_id}] Workflow completed. Questions generated: {len(generated_questions)}")
        
        if not generated_questions:
            msg = "⚠️ Cảnh báo: Không có câu hỏi nào được sinh ra từ các Agent chuyên gia."
            quiz_doc.add_comment("Comment", msg)
            raise Exception(msg)

        quiz_doc.add_comment("Comment", f"✅ Đã tạo thành công {len(generated_questions)} câu hỏi. Đang tiến hành lưu trữ...")

        quiz_doc.set("questions", [])
        for q in generated_questions:
            quiz_doc.append("questions", {
                "question": q.question,
                "type": q.type,
                "points": q.points,
                "option_1": q.option_1,
                "option_2": q.option_2,
                "option_3": q.option_3,
                "option_4": q.option_4,
                "is_correct_1": q.is_correct_1,
                "is_correct_2": q.is_correct_2,
                "is_correct_3": q.is_correct_3,
                "is_correct_4": q.is_correct_4,
                "explanation_1": q.explanation_1,
                "explanation_2": q.explanation_2,
                "explanation_3": q.explanation_3,
                "explanation_4": q.explanation_4,
                "possibility_1": q.possibility_1,
                "possibility_2": q.possibility_2,
                "possibility_3": q.possibility_3,
                "possibility_4": q.possibility_4,
                "scoring_rubric": q.scoring_rubric,
                "sample_answer": q.sample_answer
            })
        
        quiz_doc.status = "Completed"
        quiz_doc.total_questions = len(generated_questions)
        quiz_doc.add_comment("Comment", "🏁 Hoàn tất! Bộ đề đã sẵn sàng.")
        quiz_doc.save(ignore_permissions=True)
        frappe.db.commit()
        frappe.publish_realtime("ai_quiz_update", {"quiz_id": quiz_id, "status": "Completed"}, user=quiz_doc.owner)

    except Exception as e:
        error_msg = f"❌ Lỗi hệ thống: {str(e)}"
        frappe.log_error(frappe.get_traceback(), "LangGraph Quiz Orchestrator Error")
        if frappe.db.exists("AI Quiz", quiz_id):
            quiz_doc = frappe.get_doc("AI Quiz", quiz_id)
            quiz_doc.status = "Failed"
            quiz_doc.add_comment("Comment", error_msg)
            quiz_doc.save(ignore_permissions=True)
            frappe.db.commit()
            frappe.publish_realtime("ai_quiz_update", {"quiz_id": quiz_id, "status": "Failed"}, user=quiz_doc.owner)
    finally:
        try:
            from langfuse import Langfuse
            Langfuse().flush()
        except Exception:
            pass
