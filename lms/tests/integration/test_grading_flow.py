import os
import sys
import json
from pathlib import Path

# Setup Path to include apps/lms
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    import frappe
except ImportError:
    pass

from lms.lms.agents.graphs.grading_graph import build_grading_graph

def test_grading_flow():
    print("Building Grading Graph...")
    graph = build_grading_graph()
    
    initial_state = {
        "thread_id": "test_thread_001",
        "session_id": "test_session",
        "submission_id": "test_sub",
        "student_id": "test_student",
        "provider": "openai",
        "model": "gpt-4o-mini",
        "rubric": [
            {"name": "Accuracy", "max_score": 10.0}
        ],
        "source_text": "Cầu vồng có 7 màu: đỏ, cam, vàng, lục, lam, chàm, tím.",
        "prompt_template": "Chấm điểm bài làm của học sinh",
        "status": "running"
    }

    print("Running Graph...")
    final_state = graph.invoke(initial_state)
    
    print("\n--- GRADING RESULT ---")
    print(json.dumps(final_state.get("final_feedback", {}), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    test_grading_flow()