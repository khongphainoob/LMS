import frappe
from lms.lms.agents.provider import get_llm
from lms.lms.agents.grading.orchestrator import run_grading_session
from lms.lms.services.observability import record_trace
import time

@frappe.whitelist()
def run_all_tests():
    print("--- STARTING AI SERVICES TEST LAB ---")
    results = {}
    
    # 1. Test LLM Provider Connection
    try:
        model = get_llm("test_agent")
        res = model.invoke("Reply with the exact word 'OK'")
        results["LLM_Provider"] = "PASS" if "OK" in res.content else f"FAIL (Unexpected response: {res.content})"
    except Exception as e:
        results["LLM_Provider"] = f"FAIL ({str(e)})"
        
    # 2. Test Observability Traps
    try:
        with record_trace("test_trace", "test_session", {"input": "test"}):
            time.sleep(0.1)
        results["Observability"] = "PASS"
    except Exception as e:
        results["Observability"] = f"FAIL ({str(e)})"
        
    # 3. Print Results
    print("\n--- TEST RESULTS ---")
    for k, v in results.items():
        print(f"{k}: {v}")
        
    return results
