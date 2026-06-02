from ..provider import get_llm as get_model
import logging

logger = logging.getLogger(__name__)

def run_essay_grading(context, image_reports):
    """
    Chuyên gia về bài luận (Essay) sẽ phân tích văn bản dài và chấm điểm theo rubric.
    """
    model, _, _ = get_model("logic")

    
    combined_text = "\n".join([r.get('extracted_text', '') for r in image_reports])
    
    prompt = f"""
    Bạn là một chuyên gia chấm điểm bài luận. Hãy phân tích nội dung bài làm của học sinh dựa trên Rubric và Answer Key.
    
    Rubric: {context.get('rubric_summary')}
    Answer Key: {context.get('answer_key')}
    
    Nội dung bài làm trích xuất từ ảnh:
    {combined_text}
    
    Hãy đưa ra nhận xét chi tiết về:
    1. Cấu trúc bài viết.
    2. Nội dung và kiến thức.
    3. Các điểm cần cải thiện.
    
    Trả về kết quả dưới dạng JSON phù hợp với GradingCriterion schema.
    """
    
    try:
        response = model.invoke(prompt)
        return response.content
    except Exception as e:
        logger.error(f"Essay grading failed: {e}")
        return None