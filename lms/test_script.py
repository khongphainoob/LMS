import frappe
from lms.lms.agents.exam.orchestrator import process_phase_1, process_phase_2
from lms.lms.agents.exam.schemas import ExamBlueprintSchema

def test_run():
    print("Running Phase 1: Analysis & Blueprint...")
    blueprint_dict = process_phase_1(
        topic="Dao động cơ học",
        subject="Vật lý",
        grade_level="12",
        curriculum="GDPT 2018",
        exam_type="15 Phút",
        duration_minutes=15,
        difficulty_distribution="50% Nhận biết, 50% Thông hiểu",
        instructions="Cho 4 câu trắc nghiệm khách quan",
        reference_text="Dao động cơ học là sự chuyển động qua lại quanh vị trí cân bằng..."
    )
    print("Blueprint generated successfully!")
    print(blueprint_dict)
    
    print("\nRunning Phase 2: Generating Questions...")
    blueprint = ExamBlueprintSchema(**blueprint_dict)
    exam_dict = process_phase_2(
        blueprint=blueprint,
        knowledge_map="Dao động cơ học",
        language="Vietnamese"
    )
    print("Questions generated successfully!")
    print(exam_dict)
