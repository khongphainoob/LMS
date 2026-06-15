import frappe
from lms.lms.agents.quiz.orchestrator import generate_quiz_orchestrator

def test_quiz_flow(quiz_id=None):
    """
    Test script for AI Quiz Agent (LangGraph Orchestrator).
    Run with: bench execute lms.lms.scripts.agent_test_lab.test_quiz_flow.test_quiz_flow
    """
    if not quiz_id:
        print("🔍 Searching for the most recent quiz with a source file...")
        # Try to find the latest quiz with a source file to ensure real data test
        quiz = frappe.db.get_value("AI Quiz", {"source_file": ["!=", ""]}, "name", order_by="creation desc")
        if not quiz:
            print("⚠️ No quiz with source file found. Falling back to any quiz...")
            quiz = frappe.db.get_value("AI Quiz", {}, "name", order_by="creation desc")
        
        if not quiz:
            print("❌ No AI Quiz found in database.")
            return
        quiz_id = quiz

    quiz_doc = frappe.get_doc("AI Quiz", quiz_id)
    print(f"--- Starting Test for Quiz Flow: {quiz_id} ---")
    print(f"Title: {quiz_doc.title}")
    print(f"File:  {quiz_doc.source_file or 'None'}")
    
    if not quiz_doc.config:
        print("🚨 WARNING: This quiz has NO saved configuration (questions count/points).")
        print("   It might have been created before the 'config' field was added.")
        print("   Please create a NEW quiz on the Web Dashboard first!")
    
    # Use the real config stored in the document from FE
    config = None 
    
    try:
        print("Executing LangGraph Orchestrator using Real Config from DB...")
        generate_quiz_orchestrator(quiz_id, config)
        
        # Reload to get latest status
        quiz_doc = frappe.get_doc("AI Quiz", quiz_id)
        print(f"Final Status: {quiz_doc.status}")
        print(f"Total Questions: {quiz_doc.total_questions}")
        
        if quiz_doc.status == "Completed":
            print("SUCCESS: Quiz flow completed successfully!")
            for i, q in enumerate(quiz_doc.questions):
                print(f"  [{i+1}] {q.type}: {q.question[:50]}...")
        else:
            print(f"FAILURE: Quiz status is {quiz_doc.status}")
            print("Please check the 'AI Quiz' document timeline or Frappe Error Log for details.")
            
    except Exception as e:
        print(f"TEST EXECUTION ERROR: {str(e)}")
        print(frappe.get_traceback())
    
    print("--- Test Finished ---")

if __name__ == "__main__":
    test_quiz_flow()
