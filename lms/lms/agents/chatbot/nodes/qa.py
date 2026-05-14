import time
import frappe
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from ..state import ChatbotState
from ..prompts.system import build_system_prompt


def qa_node(state: ChatbotState) -> dict:
	from lms.lms.agents.provider import get_llm, get_agent_config
	from ..skills.student_skills import get_student_course_info, get_course_documents, read_course_document
	
	start_ms = int(time.time() * 1000)
	
	# Sử dụng model hỗ trợ gọi tool
	llm = get_llm("chatbot", temperature=0)
	model_name = get_agent_config("chatbot").get("model", "unknown")
	
	# Bind tool
	llm_with_tools = llm.bind_tools([get_student_course_info, get_course_documents, read_course_document])

	system_prompt = build_system_prompt(state)
	print(f"--- [DEBUG] Full System Prompt Sent to AI ---\n{system_prompt}\n---")
	messages = [SystemMessage(content=system_prompt)]

	# History
	history = state.get("chat_history", [])[-10:]
	for msg in history:
		role = msg.get("role", "").lower()
		if role == "user":
			messages.append(HumanMessage(content=msg["content"]))
		elif role in ["assistant", "ai"]:
			messages.append(AIMessage(content=msg["content"]))

	messages.append(HumanMessage(content=state["user_message"]))
	print(f"--- [NODE: QA] Sending Message to AI: {state['user_message']} ---")
	print(f"--- [NODE: QA] Agent is thinking and deciding tools... ---")
	
	from langchain_core.messages import ToolMessage
	
	# Vòng lặp xử lý tool (Cho phép gọi nhiều tool liên tục)
	max_iterations = 5
	iterations = 0
	
	response = llm_with_tools.invoke(messages)
	
	while response.tool_calls and iterations < max_iterations:
		iterations += 1
		available_tools = {
			"get_student_course_info": get_student_course_info,
			"get_course_documents": get_course_documents,
			"read_course_document": read_course_document
		}
		
		# Thêm lời gọi tool của AI vào lịch sử
		messages.append(response)
		
		for tool_call in response.tool_calls:
			tool_name = tool_call["name"]
			tool_call_id = tool_call["id"]
			print(f"--- [AGENT ACTION] Using tool: {tool_name} ---")
			
			if tool_name in available_tools:
				tool_func = available_tools[tool_name]
				tool_result = tool_func.invoke(tool_call["args"])
				
				# BẮT BUỘC dùng ToolMessage kèm tool_call_id
				messages.append(ToolMessage(
					content=str(tool_result),
					tool_call_id=tool_call_id
				))
		
		# Gọi lại AI với ngữ cảnh chuẩn
		response = llm_with_tools.invoke(messages)

	latency = int(time.time() * 1000) - start_ms
	usage = getattr(response, "usage_metadata", {})

	return {
		"response": response.content,
		"tokens_used": (usage.get("total_token_count") or usage.get("total_tokens", 0)) if usage else 0,
		"latency_ms": latency,
		"model_used": model_name
	}
