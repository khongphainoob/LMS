import frappe
from lms.lms.utils import get_lesson_count

def get_course_structure(course_name):
    """Returns the list of chapters and lessons in a course."""
    chapters = frappe.get_all("Course Chapter", 
        filters={"parent": course_name}, 
        fields=["name", "title"],
        order_by="idx"
    )
    for chapter in chapters:
        chapter.lessons = frappe.get_all("Course Lesson",
            filters={"chapter": chapter.name},
            fields=["name", "title", "lesson_type"],
            order_by="idx"
        )
    return chapters

def get_course_details(course_name):
    """Fetches overview, description and syllabus of a course."""
    if not course_name:
        return "No course specified."
    
    if not frappe.db.exists("LMS Course", course_name):
        return f"Course '{course_name}' does not exist."

    course = frappe.get_doc("LMS Course", course_name)
    structure = get_course_structure(course_name)
    
    syllabus = []
    for chap in structure:
        lessons = [f"- {l.title} ({l.name})" for l in chap.lessons]
        syllabus.append(f"Chapter: {chap.title}\n" + "\n".join(lessons))

    return {
        "title": course.title,
        "description": course.description,
        "short_introduction": course.short_introduction,
        "syllabus": "\n\n".join(syllabus)
    }

def get_lesson_content(lesson_name):
    """Fetches the full content/body of a specific lesson (text, video, or quiz)."""
    if not lesson_name:
        return "No lesson specified or found in current context."
        
    if not frappe.db.exists("Course Lesson", lesson_name):
        return f"Lesson '{lesson_name}' does not exist."

    lesson = frappe.get_doc("Course Lesson", lesson_name)
    
    details = {
        "title": lesson.title,
        "content": lesson.body or lesson.content or "",
        "video_url": lesson.youtube,
        "assignment_question": lesson.question,
        "quiz_id": lesson.quiz_id
    }
    
    # Format a summary for the agent
    res = f"Lesson: {lesson.title}\n"
    if details['content']:
        res += f"Text Content: {details['content']}\n"
    if details['video_url']:
        res += f"Video URL: {details['video_url']}\n"
    if details['assignment_question']:
        res += f"Assignment: {details['assignment_question']}\n"
    if details['quiz_id']:
        res += f"This lesson has a quiz (ID: {details['quiz_id']})\n"
        
    return res
