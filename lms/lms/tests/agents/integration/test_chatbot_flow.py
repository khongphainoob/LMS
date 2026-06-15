import os
import sys
import json
from pathlib import Path

# Setup Path to include apps/lms
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Try to import real frappe, otherwise use Mock
try:
    import frappe
    # Check if frappe is actually initialized (has a db connection)
    if not frappe.db:
        raise ImportError
    IS_MOCK = False
except (ImportError, AttributeError):
    # Mock Frappe for standalone testing
    class MockFrappe:
        def __init__(self):
            self.conf = {
                "google_api_key": os.getenv("GOOGLE_API_KEY", ""),
                "openrouter_api_key": os.getenv("OPENROUTER_API_KEY", ""),
                "chatbot_model": "gemini-2.0-flash"
            }
        
        def throw(self, msg):
            print(f"FRAPPE THROW: {msg}")
            sys.exit(1)
            
        def log_error(self, msg, title=None):
            print(f"FRAPPE LOG ERROR [{title}]: {msg}")

        def get_doc(self, doctype, name):
            class MockDoc:
                def __init__(self, dt, n):
                    self.name = n
                    self.title = f"Mock {dt} Title"
                    self.content = "Đây là nội dung giả lập của bài học về AI và Machine Learning."
                    self.course = "Course-001"
            return MockDoc(doctype, name)
        
        def exists(self, dt, name):
            return True

    frappe = MockFrappe()
    sys.modules['frappe'] = frappe
    IS_MOCK = True

from lms.lms.agents.chatbot.graph import chatbot_graph

def get_test_context(search_name=None):
    if IS_MOCK:
        return {
            "student": search_name or "TestStudent",
            "lesson": "LMS-LES-001",
            "course": "LMS-CRS-001",
            "documents": []
        }
    
    try:
        from lms.lms.services.ai_grading.find_student_test import find_test_data
        return find_test_data(search_name=search_name)
    except Exception as e:
        print(f"Error finding real test data: {e}")
        return {
            "student": "Administrator",
            "lesson": None,
            "course": None,
            "documents": []
        }

def test_flow(query, lesson_name=None, student_name=None):
    print(f"\n>>> TESTING QUERY: {query}")
    
    # 1. Setup API Keys
    google_key = os.getenv("GOOGLE_API_KEY", "").strip()
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    
    if IS_MOCK:
        frappe.conf["google_api_key"] = google_key
        frappe.conf["openrouter_api_key"] = openrouter_key

    # 2. Initial State
    initial_state = {
        "user_message": query,
        "student_name": student_name or "TestStudent",
        "lesson_name": lesson_name,
        "session_key": "test_session_123",
        "chat_history": []
    }

    # 3. Invoke Graph
    try:
        print(f"Invoking Chatbot Graph (Student: {initial_state['student_name']}, Lesson: {initial_state['lesson_name']})...")
        final_state = chatbot_graph.invoke(initial_state)
        
        print("\n--- TEST RESULT ---")
        print(f"Message Type: {final_state.get('message_type')}")
        print(f"Model Used: {final_state.get('model_used')}")
        print(f"Tokens Used: {final_state.get('tokens_used')}")
        print(f"Response:\n{final_state.get('response')}")
        print("-" * 20)
        
    except Exception as e:
        print(f"Error during flow: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Example: python scripts/agent_test_lab/test_chatbot_flow.py "Hoàng"
    search_name = sys.argv[1] if len(sys.argv) > 1 else "Hoàng"
    
    print(f"--- FINDING DATA FOR STUDENT: {search_name} ---")
    context = get_test_context(search_name=search_name)
    
    print(f"Found Student: {context.get('student')}")
    print(f"Found Course: {context.get('course')}")
    print(f"Found Lesson: {context.get('lesson')}")
    print(f"Found Documents: {len(context.get('documents', []))} files")
    for doc in context.get('documents', []):
        print(f"  - {doc.get('file_name')} ({doc.get('source_doctype')}: {doc.get('source_name')})")
    print("-" * 40)
    
    # Test cases
    test_flow("Chào bạn, bạn là ai?", student_name=context['student'])
    
    if context['lesson']:
        test_flow(f"Giải thích cho mình bài học {context['lesson']} này có nội dung gì?", 
                  lesson_name=context['lesson'], 
                  student_name=context['student'])
    else:
        test_flow("Giải thích cho mình khái niệm Machine Learning là gì?")

