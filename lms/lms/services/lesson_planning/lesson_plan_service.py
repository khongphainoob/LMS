# -*- coding: utf-8 -*-
import frappe
import json
from typing import Dict, Any, Optional
from lms.lms.services.base_service import BaseService



class LessonPlanService(BaseService):
    def __init__(self):
        super().__init__("LMS Lesson Plan")

    def generate_lesson_plan(
        self,
        course: str,
        chapter: str = None,
        lesson: str = None,
        objectives: str = None,
        duration_minutes: int = 45,
        plan_type: str = "Single Lesson",
        additional_instructions: str = None,
        language: str = "vietnamese"
    ) -> Dict[str, Any]:
        context = self._build_course_context(course, chapter, lesson)
        prompt = self._build_generation_prompt(
            context, objectives, duration_minutes, plan_type, additional_instructions, language
        )

        from lms.lms.agents.provider import get_llm
        from langchain_core.messages import SystemMessage, HumanMessage
        
        llm = get_llm("lesson_planner")
        
        try:
            messages = [
                SystemMessage(content=self._get_system_prompt(language)),
                HumanMessage(content=prompt)
            ]
            response = llm.invoke(messages)
            return self._parse_plan_response(response.content)
        except Exception as e:
            frappe.throw(f"AI Lesson Plan generation failed: {str(e)}")

    def _build_course_context(self, course, chapter=None, lesson=None):
        context = {}
        course_doc = frappe.get_doc("LMS Course", course)
        context["course_title"] = course_doc.title
        context["course_description"] = course_doc.description or ""

        if chapter:
            chapter_doc = frappe.get_doc("Course Chapter", chapter)
            context["chapter_title"] = chapter_doc.title
        if lesson:
            lesson_doc = frappe.get_doc("Course Lesson", lesson)
            context["lesson_title"] = lesson_doc.title
            context["lesson_body"] = lesson_doc.body or ""
            if lesson_doc.instructor_content:
                context["lesson_content"] = lesson_doc.instructor_content

        return context

    def _build_generation_prompt(self, context, objectives, duration, plan_type, extra, language):
        parts = [
            f"Create a detailed {plan_type.lower()} for the following course:",
            f"",
            f"Course: {context.get('course_title', 'N/A')}",
        ]
        if context.get("course_description"):
            parts.append(f"Course Description: {context['course_description']}")
        if context.get("chapter_title"):
            parts.append(f"Chapter: {context['chapter_title']}")
        if context.get("lesson_title"):
            parts.append(f"Lesson: {context['lesson_title']}")
        if context.get("lesson_body"):
            parts.append(f"Lesson Content Preview: {context['lesson_body'][:500]}")

        parts.extend([
            f"",
            f"Duration: {duration} minutes",
            f"Plan Type: {plan_type}",
        ])

        if objectives:
            parts.append(f"Learning Objectives: {objectives}")
        if extra:
            parts.append(f"Additional Instructions: {extra}")

        parts.extend([
            f"",
            f'Return JSON: {{"title": "string", "learning_objectives": "string", "content": "string (HTML or markdown)", "activities": [{{"name": "string", "duration_min": number, "description": "string"}}]}}',
            f'IMPORTANT: Return ONLY valid JSON. Use {"Vietnamese" if language == "vietnamese" else "English"} for all content.'
        ])
        return "\n".join(parts)

    def _get_system_prompt(self, language):
        if language == "vietnamese":
            return "Bạn là chuyên gia sư phạm có kinh nghiệm thiết kế kế hoạch bài giảng. Tạo kế hoạch chi tiết, thực tế và phù hợp với cấp độ học sinh. Nội dung cần cụ thể, có thể áp dụng ngay vào lớp học."
        return "You are an expert educator experienced in designing lesson plans. Create detailed, practical, and level-appropriate lesson plans."

    def _parse_plan_response(self, content):
        import re
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
        if json_match:
            content = json_match.group(1)
        return json.loads(content)

    def export_plan(self, plan_name: str, format: str = "json") -> str:
        doc = frappe.get_doc("LMS Lesson Plan", plan_name)
        data = doc.as_dict()
        if format == "json":
            return json.dumps(data, indent=2, default=str)
        return str(data)

    def import_plan(self, data: Dict, course: str) -> str:
        data.pop("name", None)
        data["course"] = course
        data["ai_generated"] = 0
        doc = frappe.get_doc({"doctype": "LMS Lesson Plan", **data})
        doc.insert()
        return doc.name

    def get_plan_stats(self) -> Dict[str, Any]:
        total = self.count()
        ai_count = self.count(filters={"ai_generated": 1})
        published = self.count(filters={"status": "Published"})
        return {
            "total_plans": total,
            "ai_generated_count": ai_count,
            "published_count": published,
        }
