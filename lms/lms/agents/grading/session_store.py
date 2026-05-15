import threading
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class PipelineStep:
    def __init__(self, step: str, status: str, duration: float, meta: Dict[str, Any] = None):
        self.step = step
        self.status = status
        self.duration = duration
        self.meta = meta or {}
        self.timestamp = datetime.now()

class GradingSession:
    """
    In-memory typed session store for a single grading job.
    Thread-safe to support potential parallel processing in the future.
    """
    def __init__(self, session_id: str):
        self.session_id = session_id
        self._lock = threading.Lock()
        
        # Core data
        self.grading_type: str = "mixed"
        self.rubric_context: str = ""
        self.exam_context: str = ""
        self.answer_key: Dict[str, Any] = {}
        self.image_paths: List[str] = []
        
        # State data
        self.pages_meta: List[Dict[str, Any]] = []
        self.visual_reports: List[Dict[str, Any]] = []
        self.logic_report: Optional[Dict[str, Any]] = None
        
        # Feedback Loop data
        self.final_result: Optional[Dict[str, Any]] = None
        self.corrections: List[Dict[str, str]] = []
        self.reanalysis_count: int = 0
        self.confidence: float = 0.0
        
        # Auditing
        self.steps: List[PipelineStep] = []

    def log_step(self, step: str, status: str, duration: float, meta: Dict[str, Any] = None):
        with self._lock:
            self.steps.append(PipelineStep(step, status, duration, meta))
            
    def to_manifest(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "session_id": self.session_id,
                "exam_type": self.grading_type,
                "rubric_context": self.rubric_context,
                "exam_context": self.exam_context,
                "answer_key": self.answer_key,
                "image_paths": self.image_paths,
                "visual_reports": self.visual_reports,
                "logic_report": self.logic_report,
                "corrections": self.corrections,
                "reanalysis_count": self.reanalysis_count,
                "confidence": self.confidence
            }
            
    def get_summary(self) -> str:
        with self._lock:
            return f"Session: {self.session_id} | Type: {self.grading_type} | Confidence: {self.confidence:.2f} | Re-analyzed: {self.reanalysis_count}"

    def save_to_disk(self):
        """Fallback persist for debugging or async job tracking."""
        import frappe
        import os
        base_path = frappe.get_site_path("private", "ai_grading", self.session_id)
        os.makedirs(base_path, exist_ok=True)
        
        manifest = self.to_manifest()
        # Convert objects to string for JSON serialization
        manifest['steps'] = [{"step": s.step, "status": s.status, "duration": s.duration} for s in self.steps]
        
        with open(os.path.join(base_path, "session_state.json"), "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=4)