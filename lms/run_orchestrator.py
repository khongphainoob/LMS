import frappe
from lms.lms.agents.exam.orchestrator import process_exam_generation
import traceback

def run_it():
    frappe.init(site="lms.localhost")
    frappe.connect()
    
    # We will just run the job synchronously and see what it prints
    try:
        process_exam_generation(exam_name="EXAM-2026-00031")
        print("Success!")
    except Exception as e:
        print(f"FAILED WITH ERROR: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    run_it()
