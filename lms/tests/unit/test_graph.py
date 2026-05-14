import frappe
from lms.lms.services.ai_grading.ai_grading_service import AIGradingService
import json
import logging
import sys
import traceback

def run_test(submission_name=None):
    # Cấu hình logging để xem chi tiết luồng chạy của Agent
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Bật debug cho các module của chúng ta
    logging.getLogger("lms").setLevel(logging.DEBUG)
    
    if not submission_name:
        # Tự động lấy Submission mới nhất trong DB
        submissions = frappe.get_all("AI Grading Submission", order_by="creation desc", limit=1, pluck="name")
        if not submissions:
            print("❌ LỖI: Không tìm thấy bất kỳ 'AI Grading Submission' nào trong database.")
            print("Vui lòng tạo một bài nộp trên giao diện trước khi test.")
            return
        submission_name = submissions[0]
    
    print(f"--- 🚀 Starting Deep Agents Grading Test for {submission_name} ---")
    
    try:
        service = AIGradingService()
        # Chạy luồng chấm điểm qua LangGraph
        result = service.grade_submission_graph(
            submission_name,
            provider_override="google",
            model_override="gemini-2.0-flash"
        )
        
        if not result.get("success"):
            doc = frappe.get_doc("AI Grading Submission", submission_name)
            print(f"\n❌ SERVICE ERROR: {doc.last_error}")
            return
            
        print("\n--- ✅ GRADING RESULT ---")
        print(f"Status: {result.get('status')}")
        print(f"Total Score: {result.get('score')}")
        print(f"Time Taken: {result.get('time'):.2f}s")
        
        print("\n--- 📝 RAW FEEDBACK (SUMMARY) ---")
        print(result.get('feedback'))
            
        print("\n--- 📊 DETAILED CRITERIA SCORES (JSON) ---")
        doc = frappe.get_doc("AI Grading Submission", submission_name)
        if doc.criteria_scores:
            try:
                criteria = json.loads(doc.criteria_scores)
                # In ra nguyên vẹn cấu trúc JSON để User kiểm tra mcq_results và solution_results
                print(json.dumps(criteria, indent=4, ensure_ascii=False))
                
                print("\n--- 📌 DANG GỌN ---")
                if isinstance(criteria, list):
                    for item in criteria:
                        q_no = item.get('question_no') or item.get('q_no', '?')
                        score = item.get('score', 0)
                        max_score = item.get('max_score', '?')
                        correct = item.get('is_correct', 'N/A')
                        feedback = item.get('feedback', '')
                        print(f" {q_no}: score={score}/{max_score} correct={correct} fb={feedback}")
            except Exception as e:
                print(f"Error parsing JSON: {str(e)}")
                print(doc.criteria_scores)
        else:
            print("  (no criteria_scores saved)")
            
    except Exception as e:
        print(f"❌ ERROR DURING TEST: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    # Kết nối vào site
    site_name = "lms.localhost"
    frappe.init(site=site_name)
    frappe.connect()
    
    target_submission = sys.argv[1] if len(sys.argv) > 1 else None
    run_test(target_submission)