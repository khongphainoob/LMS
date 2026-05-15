from ...tools import get_course_structure, get_course_details, get_lesson_content, search_web, search_documents

def tool_executor_node(state):
    """
    Executes the tool selected by the reasoner node.
    """
    reasoning = state.get("reasoning", {})
    tool_name = reasoning.get("tool_to_use")
    tool_input = reasoning.get("tool_input")
    
    print(f"--- EXECUTING TOOL: {tool_name} ---")
    
    output = None
    if tool_name == "get_course_details":
        course = tool_input if (tool_input and tool_input != "none") else state.get("course")
        output = get_course_details(course)
    elif tool_name == "get_course_material":
        # If lesson_name is in input, use it, otherwise use current session lesson
        lesson = tool_input if (tool_input and tool_input != "none") else state.get("lesson_name")
        if lesson:
            output = get_lesson_content(lesson)
        else:
            output = "I'm sorry, I don't know which lesson you're referring to. Could you please specify?"
    elif tool_name == "search_documents":
        output = search_documents(tool_input)
    elif tool_name == "search_web":
        output = search_web(tool_input)
    
    return {
        "tool_outputs": [{"tool": tool_name, "output": output}] if output else []
    }
