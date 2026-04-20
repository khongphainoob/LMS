import langchain_openai
from .base_provider import BaseAIProvider
class PromptEngine:
    """Chain-of-Thought (CoT) prompting for grading accuracy."""
    
    SYSTEM_PROMPT = """
    You are an expert teacher grading student work. 
    Follow these steps precisely:
    1. Read the rubric criteria carefully
    2. Analyze each criterion against the student's answer
    3. Provide specific evidence from the answer for each score
    4. Calculate the total score
    5. Provide constructive feedback
    
    IMPORTANT: Return ONLY valid JSON in the specified format.
    """
    
    def build_prompt(self, submission, rubric, student_answer):
        return {
            "system": self.SYSTEM_PROMPT,
            "user": f"""
            ## Rubric
            {self._format_rubric(rubric)}
            
            ## Student Answer
            {student_answer}
            
            ## Required Output Format
            {{
                "criteria": [
                    {{
                        "name": "<criterion name>",
                        "max_score": <max>,
                        "given_score": <score>,
                        "badge": "correct|partial|wrong",
                        "evidence": "<specific quote from answer>",
                        "feedback": "<constructive feedback>"
                    }}
                ],
                "total_score": <float>,
                "overall_feedback": "<summary>",
                "confidence": <0.0-1.0>
            }}
            """
        }