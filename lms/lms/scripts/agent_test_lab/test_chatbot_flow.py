import os
import sys
import json
from pathlib import Path

# Setup Path to include apps/lms
# In Frappe context, apps/lms is already in sys.path
# But we add it for standalone runs
ROOT_DIR = Path(__file__).resolve().parents[4] # Go up to apps/lms
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

# Import chatbot graph (Sử dụng đường dẫn lms.lms...)
try:
    from lms.lms.agents.chatbot.graph import chatbot_graph
except ImportError:
    # Fallback if structure is different
    from lms.agents.chatbot.graph import chatbot_graph

def get_test_context(search_name=None):
    if IS_MOCK:
        return {
            "student": search_name or "TestStudent",
            "lesson": "LMS-LES-001",
            "course": "LMS-CRS-001",
            "documents": []
        }
    
    try:
        # Đường dẫn chuẩn lms.lms...
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
    
    # Initial State
    initial_state = {
        "user_message": query,
        "student_name": student_name or "TestStudent",
        "lesson_name": lesson_name,
        "session_key": "test_session_123",
        "chat_history": []
    }

    # Invoke Graph
    try:
        print(f"Invoking Chatbot Graph (Student: {initial_state['student_name']}, Lesson: {initial_state['lesson_name']})...")
        final_state = chatbot_graph.invoke(initial_state)
        
        print("\n--- TEST RESULT ---")
        print(f"Message Type: {final_state.get('message_type')}")
        print(f"Response:\n{final_state.get('response')}")
        print("-" * 20)
        
    except Exception as e:
        print(f"Error during flow: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    search_name = sys.argv[1] if len(sys.argv) > 1 else "Hoàng"
    
    print(f"--- FINDING DATA FOR STUDENT: {search_name} ---")
    context = get_test_context(search_name=search_name)
    
    print(f"Found Student: {context.get('student')}")
    print(f"Found Course: {context.get('course')}")
    print(f"Found Lesson: {context.get('lesson')}")
    print("-" * 40)
    
    # Test cases
    test_flow("Chào bạn, bạn là ai?", student_name=context['student'])
    
    if context['lesson']:
        test_flow(f"Giải thích cho mình bài học {context['lesson']} này có nội dung gì?", 
                  lesson_name=context['lesson'], 
                  student_name=context['student'])
