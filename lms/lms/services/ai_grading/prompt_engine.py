# -*- coding: utf-8 -*-
"""
Prompt Engine Module

Provides Chain-of-Thought (CoT) prompt templates and builders
for AI-powered grading. The prompt engine ensures consistent,
structured prompts that guide the AI to provide accurate
and fair grading with detailed feedback.
"""

from typing import Dict, Any, Optional, List
import json
import re


class PromptEngine:
    """
    Chain-of-Thought prompt engine for AI grading.

    Uses structured prompts with step-by-step reasoning instructions
    to improve grading accuracy and consistency.
    """

    # Default system prompts for different languages
    DEFAULT_SYSTEM_PROMPTS = {
        "english": """You are an expert teacher and grader with years of experience in educational assessment.

Your task is to grade student submissions fairly, accurately, and constructively.

Grading Guidelines:
1. Read the rubric criteria carefully
2. Analyze each criterion against the student's answer
3. Provide specific evidence from the answer for each score
4. Calculate the total score accurately
5. Give constructive feedback that helps the student improve

IMPORTANT:
- Be fair and consistent in grading
- Provide specific, actionable feedback
- Highlight both strengths and areas for improvement
- Return ONLY valid JSON in the specified format
- Do not make assumptions beyond what's in the student's answer""",

        "vietnamese": """Bạn là một giáo viên và chuyên gia chấm điểm có nhiều năm kinh nghiệm trong đánh giá giáo dục.

Nhiệm vụ của bạn là chấm điểm bài làm của học sinh một cách công bằng, chính xác và mang tính xây dựng.

Hướng dẫn chấm điểm:
1. Đọc kỹ các tiêu chí trong bảng điểm
2. Phân tích từng tiêu chí dựa trên câu trả lời của học sinh
3. Cung cấp bằng chứng cụ thể từ câu trả lời cho mỗi điểm số
4. Tính toán tổng điểm chính xác
5. Đưa ra phản hồi mang tính xây dựng giúp học sinh cải thiện

QUAN TRỌNG:
- Công bằng và nhất quán trong chấm điểm
- Cung cấp phản hồi cụ thể và có thể hành động
- Nhấn mạnh cả điểm mạnh và các lĩnh vực cần cải thiện
- Chỉ trả về JSON hợp lệ theo định dạng đã chỉ định
- Đừng đưa ra giả định vượt quá nội dung trong câu trả lời của học sinh""",

        "mixed": """You are an expert teacher and grader with years of experience in educational assessment.

Bạn là một giáo viên và chuyên gia chấm điểm có nhiều năm kinh nghiệm trong đánh giá giáo dục.

Your task is to grade student submissions fairly, accurately, and constructively.
Nhiệm vụ của bạn là chấm điểm bài làm của học sinh một cách công bằng, chính xác và mang tính xây dựng.

IMPORTANT / QUAN TRỌNG:
- Be fair and consistent in grading / Công bằng và nhất quán trong chấm điểm
- Provide specific, actionable feedback / Cung cấp phản hồi cụ thể và có thể hành động
- Return ONLY valid JSON / Chỉ trả về JSON hợp lệ
"""
    }

    # Default output format for grading responses
    DEFAULT_OUTPUT_FORMAT = {
        "total_score": "float - The total score",
        "max_score": "float - The maximum possible score",
        "percentage": "float - Score as percentage (0-100)",
        "overall_feedback": "string - Summary feedback for the student",
        "criteria": [
            {
                "criterion_id": "string - Unique identifier",
                "criterion_name": "string - Name of the criterion",
                "score": "float - Score for this criterion",
                "max_score": "float - Maximum score for this criterion",
                "weight": "float - Weight of this criterion (0-1)",
                "badge": "string - 'correct', 'partial', 'wrong'",
                "feedback": "string - Specific feedback for this criterion",
                "evidence": "string - Quote or reference from student answer",
                "confidence": "float - AI confidence level (0-1)"
            }
        ],
        "strengths": ["array of strings - Things the student did well"],
        "areas_for_improvement": ["array of strings - Things to improve"],
        "suggested_grade": "string - Letter grade or equivalent (A+, A, B+, etc.)",
        "metadata": {
            "word_count": "int - Number of words in answer",
            "language_detected": "string - Detected language",
            "grading_model": "string - Model used for grading",
            "provider": "string - AI provider"
        }
    }

    def __init__(self, default_language: str = "english"):
        """
        Initialize prompt engine.

        Args:
            default_language: Default language for prompts (english, vietnamese, mixed)
        """
        self.default_language = default_language

    def get_default_system_prompt(self, language: Optional[str] = None) -> str:
        """
        Get default system prompt for a language.

        Args:
            language: Language code (defaults to instance default)

        Returns:
            System prompt string
        """
        lang = language or self.default_language
        return self.DEFAULT_SYSTEM_PROMPTS.get(lang.lower(), self.DEFAULT_SYSTEM_PROMPTS["english"])

    def build_grading_prompt(
        self,
        submission_text: str,
        rubric_data: Optional[Dict[str, Any]] = None,
        question_text: Optional[str] = None,
        additional_instructions: Optional[str] = None,
        output_format: Optional[Dict] = None,
        language: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Build a complete grading prompt with system and user messages.

        Args:
            submission_text: The student's answer/submission
            rubric_data: Optional rubric with criteria
            question_text: Optional original question text
            additional_instructions: Any additional grading instructions
            output_format: Custom output format (uses default if None)
            language: Language for the response

        Returns:
            Dict with 'system' and 'user' prompt strings
        """
        system_prompt = self.get_default_system_prompt(language)

        # Build user prompt
        user_prompt_parts = []

        # Add question if provided
        if question_text:
            user_prompt_parts.append("## Question / Câu hỏi")
            user_prompt_parts.append(question_text)
            user_prompt_parts.append("")

        # Add rubric if provided
        if rubric_data:
            user_prompt_parts.append("## Grading Rubric / Bảng điểm")
            user_prompt_parts.append(self._format_rubric(rubric_data))
            user_prompt_parts.append("")

        # Add student answer
        user_prompt_parts.append("## Student Answer / Câu trả lời của học sinh")
        user_prompt_parts.append(submission_text)
        user_prompt_parts.append("")

        # Add additional instructions
        if additional_instructions:
            user_prompt_parts.append("## Additional Instructions / Hướng dẫn thêm")
            user_prompt_parts.append(additional_instructions)
            user_prompt_parts.append("")

        # Add output format specification
        user_prompt_parts.append("## Required Output Format / Định dạng đầu ra yêu cầu")
        output_format = output_format or self.DEFAULT_OUTPUT_FORMAT
        user_prompt_parts.append("```json")
        user_prompt_parts.append(json.dumps(output_format, indent=2, ensure_ascii=False))
        user_prompt_parts.append("```")

        # Add final instructions
        final_note = self._get_final_instruction(language or self.default_language)
        user_prompt_parts.append(final_note)

        user_prompt = "\n".join(user_prompt_parts)

        return {
            "system": system_prompt,
            "user": user_prompt
        }

    def build_chain_of_thought_prompt(
        self,
        submission_text: str,
        rubric_data: Optional[Dict[str, Any]] = None,
        question_text: Optional[str] = None,
        language: Optional[str] = None
    ) -> str:
        """
        Build a Chain-of-Thought prompt for step-by-step reasoning.

        This version explicitly asks the AI to show its reasoning process
        before providing the final score.

        Args:
            submission_text: Student's answer
            rubric_data: Rubric criteria
            question_text: Original question
            language: Response language

        Returns:
            Complete prompt string
        """
        lang = language or self.default_language

        if lang == "vietnamese":
            return self._build_vietnamese_cot_prompt(submission_text, rubric_data, question_text)
        else:
            return self._build_english_cot_prompt(submission_text, rubric_data, question_text)

    def _build_english_cot_prompt(
        self,
        submission_text: str,
        rubric_data: Optional[Dict[str, Any]],
        question_text: Optional[str]
    ) -> str:
        """Build English Chain-of-Thought prompt."""
        prompt_parts = [
            "You are grading a student submission. Follow these steps precisely:",
            "",
            "Step 1: Analyze the Question",
            "  - Understand what is being asked",
            "  - Identify key concepts and requirements",
            "",
            "Step 2: Review the Rubric",
            "  - Study each criterion carefully",
            "  - Understand the scoring scale for each criterion",
            "",
            "Step 3: Analyze the Student's Answer",
            "  - Read through the entire answer",
            "  - Identify key points and arguments",
            "  - Note any missing elements",
            "",
            "Step 4: Evaluate Each Criterion",
            "  - For each criterion in the rubric:",
            "    * Determine if the student meets the requirement",
            "    * Find specific evidence from the answer",
            "    * Assign a score based on the rubric",
            "    * Write constructive feedback",
            "",
            "Step 5: Calculate Total Score",
            "  - Sum up all criterion scores",
            "  - Calculate the final percentage",
            "",
            "Step 6: Provide Final Feedback",
            "  - Summarize overall performance",
            "  - List strengths",
            "  - List areas for improvement",
            "",
        ]

        if question_text:
            prompt_parts.extend([
                "--- QUESTION ---",
                question_text,
                ""
            ])

        if rubric_data:
            prompt_parts.extend([
                "--- RUBRIC ---",
                self._format_rubric(rubric_data),
                ""
            ])

        prompt_parts.extend([
            "--- STUDENT ANSWER ---",
            submission_text,
            "",
            "--- YOUR RESPONSE (JSON FORMAT) ---",
            "Show your reasoning briefly, then provide the final JSON output:"
        ])

        return "\n".join(prompt_parts)

    def _build_vietnamese_cot_prompt(
        self,
        submission_text: str,
        rubric_data: Optional[Dict[str, Any]],
        question_text: Optional[str]
    ) -> str:
        """Build Vietnamese Chain-of-Thought prompt."""
        prompt_parts = [
            "Bạn đang chấm điểm bài làm của học sinh. Hãy làm theo các bước sau chính xác:",
            "",
            "Bước 1: Phân tích Câu hỏi",
            "  - Hiểu rõ yêu cầu của câu hỏi",
            "  - Xác định các khái niệm và yêu cầu chính",
            "",
            "Bước 2: Xem xét Bảng điểm",
            "  - Đọc kỹ từng tiêu chí",
            "  - Hiểu thang điểm cho từng tiêu chí",
            "",
            "Bước 3: Phân tích Câu trả lời của học sinh",
            "  - Đọc toàn bộ câu trả lời",
            "  - Xác định các ý chính và lập luận",
            "  - Ghi chú các phần còn thiếu",
            "",
            "Bước 4: Đánh giá từng Tiêu chí",
            "  - Đối với từng tiêu chí trong bảng điểm:",
            "    * Xác định xem học sinh đã đạt yêu cầu chưa",
            "    * Tìm bằng chứng cụ thể từ câu trả lời",
            "    * Chấm điểm dựa trên bảng điểm",
            "    * Viết phản hồi mang tính xây dựng",
            "",
            "Bước 5: Tính Tổng điểm",
            "  - Cộng tất cả điểm từng tiêu chí",
            "  - Tính tổng phần trăm",
            "",
            "Bước 6: Cung cấp Phản hồi cuối cùng",
            "  - Tóm tắt kết quả tổng thể",
            "  - Liệt kê điểm mạnh",
            "  - Liệt kê các lĩnh vực cần cải thiện",
            "",
        ]

        if question_text:
            prompt_parts.extend([
                "--- CÂU HỎI ---",
                question_text,
                ""
            ])

        if rubric_data:
            prompt_parts.extend([
                "--- BẢNG ĐIỂM ---",
                self._format_rubric(rubric_data),
                ""
            ])

        prompt_parts.extend([
            "--- CÂU TRẢ LỜI CỦA HỌC SINH ---",
            submission_text,
            "",
            "--- CÂU TRẢ LỜI CỦA BẠN (ĐỊNH DẠNG JSON) ---",
            "Trình bày suy luận ngắn gọn, sau đó cung cấp kết quả JSON:"
        ])

        return "\n".join(prompt_parts)

    def _format_rubric(self, rubric_data: Dict[str, Any]) -> str:
        """Format rubric data for inclusion in prompt."""
        if not rubric_data:
            return "No rubric provided / Không có bảng điểm"

        rubric_parts = []

        # Add rubric info if available
        if rubric_data.get("rubric_name"):
            rubric_parts.append(f"Rubric: {rubric_data['rubric_name']}")

        if rubric_data.get("total_max_score"):
            rubric_parts.append(f"Total Score: {rubric_data['total_max_score']}")

        if rubric_parts:
            rubric_parts.append("")

        # Add criteria
        criteria = rubric_data.get("criteria", [])
        if criteria:
            rubric_parts.append("Criteria:")
            for i, criterion in enumerate(criteria, 1):
                rubric_parts.append(f"  {i}. {criterion.get('criterion_name', 'N/A')}")
                rubric_parts.append(f"     Max Score: {criterion.get('max_score', 0)}")
                if criterion.get("description"):
                    rubric_parts.append(f"     Description: {criterion['description']}")
                if criterion.get("scoring_guide"):
                    rubric_parts.append(f"     Scoring Guide: {criterion['scoring_guide']}")
                rubric_parts.append("")

        return "\n".join(rubric_parts)

    def _get_final_instruction(self, language: str) -> str:
        """Get final instruction based on language."""
        if language == "vietnamese":
            return "\nQUAN TRỌNG: Trả về JSON hợp lệ, không có văn bản bổ sung."
        else:
            return "\nIMPORTANT: Return ONLY valid JSON with no additional text."

    def sanitize_submission_text(self, text: str) -> str:
        """
        Sanitize student submission text to prevent prompt injection.

        Removes potentially malicious patterns that could affect grading.

        Args:
            text: Raw submission text

        Returns:
            Sanitized text
        """
        if not text:
            return ""

        # List of injection patterns to detect and handle
        injection_patterns = [
            (r"ignore\s+(previous|above|all)\s+instructions", "[PATTERN FILTERED]"),
            (r"you\s+are\s+now\s+a\s+", "[PATTERN FILTERED]"),
            (r"system\s*:\s*", "[PATTERN FILTERED]"),
            (r"<\|im_start\|>", "[PATTERN FILTERED]"),
            (r"```s*system", "[PATTERN FILTERED]"),
            (r"ADMIN\s+MODE", "[PATTERN FILTERED]"),
            (r"override\s+scoring", "[PATTERN FILTERED]"),
            (r"give\s+(me|us)\s+(full|maximum)\s+score", "[PATTERN FILTERED]"),
        ]

        sanitized = text
        for pattern, replacement in injection_patterns:
            sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)

        return sanitized

    def detect_injection_attempt(self, text: str) -> bool:
        """
        Detect if text contains potential prompt injection attempts.

        Args:
            text: Text to check

        Returns:
            True if injection patterns detected
        """
        injection_patterns = [
            r"ignore\s+(previous|above|all)\s+instructions",
            r"you\s+are\s+now\s+a\s+",
            r"system\s*:\s*",
            r"<\|im_start\|>",
            r"```s*system",
            r"ADMIN\s+MODE",
            r"override\s+scoring",
            r"give\s+(me|us)\s+(full|maximum)\s+score",
        ]

        for pattern in injection_patterns:
            if re.search(pattern, text, flags=re.IGNORECASE):
                return True

        return False

    def calculate_word_count(self, text: str) -> int:
        """
        Calculate word count for submission text.

        Handles both English and Vietnamese text.

        Args:
            text: Input text

        Returns:
            Word count
        """
        if not text:
            return 0

        # For Vietnamese, split by spaces and filter empty strings
        words = text.split()
        return len([w for w in words if w.strip()])

    def detect_language(self, text: str) -> str:
        """
        Detect language of submission text.

        Simple heuristic detection.

        Args:
            text: Input text

        Returns:
            Language code (en, vi, or mixed)
        """
        if not text:
            return "unknown"

        # Check for Vietnamese characters
        vietnamese_chars = set("àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ")

        has_vietnamese = any(char in vietnamese_chars for char in text)

        # Check for English-only characters
        english_only = all(ord(c) < 128 for c in text) and not has_vietnamese

        if has_vietnamese and english_only:
            return "mixed"
        elif has_vietnamese:
            return "vi"
        else:
            return "en"

    def parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse AI response into structured grading data.

        Handles both JSON and text responses.

        Args:
            response_text: Raw AI response text

        Returns:
            Parsed grading result
        """
        # Try to parse as JSON first
        try:
            # Find JSON in the response (may have markdown code blocks)
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)

            return json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback: create structured response from text
            return {
                "total_score": 0,
                "max_score": 100,
                "percentage": 0,
                "overall_feedback": "Unable to parse AI response properly",
                "criteria": [],
                "strengths": [],
                "areas_for_improvement": ["Response could not be parsed"],
                "suggested_grade": "N/A",
                "metadata": {
                    "parse_error": True,
                    "raw_response": response_text[:500]  # Truncate for storage
                }
            }

    def build_feedback_summary(
        self,
        criteria_feedback: List[Dict[str, Any]],
        strengths: List[str],
        improvements: List[str],
        language: str = "english"
    ) -> str:
        """
        Build a comprehensive feedback summary from criteria results.

        Args:
            criteria_feedback: List of individual criterion feedback
            strengths: List of identified strengths
            improvements: List of areas for improvement
            language: Feedback language

        Returns:
            Formatted feedback string
        """
        summary_parts = []

        if language == "vietnamese":
            # Vietnamese feedback
            if strengths:
                summary_parts.append("### Điểm mạnh / Strengths")
                for strength in strengths:
                    summary_parts.append(f"  • {strength}")
                summary_parts.append("")

            if criteria_feedback:
                summary_parts.append("### Đánh giá từng tiêu chí / Criteria Feedback")
                for feedback in criteria_feedback:
                    summary_parts.append(
                        f"  **{feedback.get('criterion_name', 'N/A')}:** "
                        f"{feedback.get('score', 0)}/{feedback.get('max_score', 0)}\n"
                        f"    {feedback.get('feedback', '')}"
                    )
                summary_parts.append("")

            if improvements:
                summary_parts.append("### Cần cải thiện / Areas for Improvement")
                for improvement in improvements:
                    summary_parts.append(f"  • {improvement}")
        else:
            # English feedback
            if strengths:
                summary_parts.append("### Strengths")
                for strength in strengths:
                    summary_parts.append(f"  • {strength}")
                summary_parts.append("")

            if criteria_feedback:
                summary_parts.append("### Criteria Feedback")
                for feedback in criteria_feedback:
                    summary_parts.append(
                        f"  **{feedback.get('criterion_name', 'N/A')}:** "
                        f"{feedback.get('score', 0)}/{feedback.get('max_score', 0)}\n"
                        f"    {feedback.get('feedback', '')}"
                    )
                summary_parts.append("")

            if improvements:
                summary_parts.append("### Areas for Improvement")
                for improvement in improvements:
                    summary_parts.append(f"  • {improvement}")

        return "\n".join(summary_parts)
