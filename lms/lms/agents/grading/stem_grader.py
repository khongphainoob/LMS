from ..provider import get_llm as get_model
import logging

logger = logging.getLogger(__name__)

def run_stem_grading(context, image_reports):
    """
    Chuyên gia STEM sẽ tập trung vào độ chính xác của công thức, đơn vị và các bước giải bài tập.
    """
    model = get_model("logic")

    
    # Gom tất cả các phân tích visual có liên quan đến công thức/hình vẽ
    stem_context = []
    for report in image_reports:
        if report.get('has_formula') or report.get('has_diagram'):
            stem_context.append(report.get('extracted_content', ''))

    prompt = f"""
    Bạn là một giảng viên chuyên ngành STEM. Hãy chấm điểm bài làm của học sinh dựa trên các bước giải và đáp án.
    
    Rubric chấm điểm: {context.get('rubric_summary')}
    Đáp án đúng (Answer Key): {context.get('answer_key')}
    
    Dữ liệu bài làm trích xuất:
    {" ".join(stem_context)}
    
    Yêu cầu:
    1. Kiểm tra từng bước giải có đúng logic không.
    2. Kiểm tra đơn vị và kết quả cuối cùng.
    3. Nếu sai, hãy chỉ rõ sai ở bước nào.
    
    Trả về kết quả JSON theo GradingCriterion schema.
    """
    
    try:
        response = model.invoke(prompt)
        return response.content
    except Exception as e:
        logger.error(f"STEM grading failed: {e}")
        return None