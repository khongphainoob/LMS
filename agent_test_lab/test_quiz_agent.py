import frappe
from lms.lms.agents.quiz.orchestrator import generate_quiz_orchestrator

def test_quiz_generation(quiz_id=None):
    """
    Test script for AI Quiz Agent (LangGraph Orchestrator).
    """
    frappe.connect()
    
    if not quiz_id:
        # Try to find the latest quiz
        quiz = frappe.db.get_value("AI Quiz", {}, "name", order_by="creation desc")
        if not quiz:
            print("No AI Quiz found to test.")
            return
        quiz_id = quiz

    print(f"--- Starting Test for Quiz: {quiz_id} ---")
    
    # Mock config
    config = {
        "questions": {
            "choices": {"count": 2, "points": 1},
            "input": {"count": 1, "points": 2},
            "open": {"count": 1, "points": 5}
        }
    }
    
    try:
        print("Executing LangGraph Orchestrator...")
        generate_quiz_orchestrator(quiz_id, config)
        
        # Verify
        quiz_doc = frappe.get_doc("AI Quiz", quiz_id)
        print(f"Status: {quiz_doc.status}")
        print(f"Total Questions: {quiz_doc.total_questions}")
        
        if quiz_doc.status == "Completed" and quiz_doc.questions:
            print("SUCCESS: Quiz generated successfully!")
            for i, q in enumerate(quiz_doc.questions):
                print(f"  [{i+1}] {q.question_type}: {q.question[:50]}...")
        else:
            print(f"FAILURE: Status is {quiz_doc.status}")
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
    
    print("--- Test Finished ---")

if __name__ == "__main__":
    test_quiz_generation()
