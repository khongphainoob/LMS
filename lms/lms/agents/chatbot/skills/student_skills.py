from langchain_core.tools import tool
import frappe
from typing import Optional

@tool
def get_student_course_info(student_name: str, course_name: Optional[str] = None) -> str:
	"""
	Tra cuu thong tin co ban cua hoc sinh trong pham vi mot khoa hoc cu the.
	Thong tin bao gom: Ho ten, ngay tham gia khoa hoc, va tien do hoan thanh khoa hoc.
	Su dung tool nay khi ban can biet hoc sinh la ai hoac ho dang hoc den dau de tra loi than thien hon.
	"""
	info_parts = []
	
	# 1. Basic Student Info
	user_id = None
	try:
		if frappe.db.exists("User", student_name):
			user_id = student_name
		else:
			user_id = frappe.db.get_value("User", {"full_name": ["like", f"%{student_name}%"]}, "name")
			
		if not user_id:
			 return f"Khong tim thay thong tin cho hoc sinh: {student_name}"

		user = frappe.get_doc("User", user_id)
		info_parts.append(f"Student Name: {user.full_name or user.name}")
		student_name = user.name
	except Exception as e:
		return f"Loi khi tra cuu hoc sinh: {str(e)}"

	# 2. If course is provided, get course specific info
	if course_name:
		info_parts.append(f"Current Context Course: {course_name}")
		
		if frappe.db.exists("DocType", "LMS Enrollment"):
			enrollments = frappe.get_all(
				"LMS Enrollment", 
				filters={"member": student_name, "course": course_name},
				fields=["name", "creation"],
				limit=1
			)
			if enrollments:
				creation = enrollments[0].creation
				date_str = creation.strftime('%Y-%m-%d') if hasattr(creation, 'strftime') else str(creation).split(' ')[0]
				info_parts.append(f"Enrollment Status: Enrolled since {date_str}")
			else:
				info_parts.append("Enrollment Status: Not enrolled in this course.")
				
		if frappe.db.exists("DocType", "LMS Course Progress"):
			# Count completed vs total lessons for this course
			total = frappe.db.count(
				"LMS Course Progress",
				{"member": student_name, "course": course_name}
			)
			completed = frappe.db.count(
				"LMS Course Progress",
				{"member": student_name, "course": course_name, "status": "Complete"}
			)
			if total:
				pct = round(completed / total * 100)
				info_parts.append(f"Course Progress: {pct}% ({completed}/{total} lessons completed).")

	else:
		info_parts.append("No specific course context provided.")

	return "\n".join(info_parts)


@tool
def get_course_documents(search: str, course_name: Optional[str] = None) -> str:
	"""
	Tim kiem tai lieu (LMS Document) hoac tra loi cau hoi dua tren kho tai lieu cua he thong.
	Su dung tool nay MỖI KHI hoc sinh hoi ve mot kien thuc, chu de (VD: "he dieu hanh chuong 1", "AI la gi").
	Tham so:
	- search: (BAT BUOC) Tu khoa hoac cau hoi can tim (VD: "he dieu hanh chuong 1").
	- course_name: (Tuy chon) ID khoa hoc hien tai.
	"""
	from ..utils_rag import query_vector_db
	try:
		if not search:
			return "Vui long cung cap tham so 'search' de tim kiem."
			
		filters = {"course_id": course_name} if course_name else None
		results = query_vector_db(search, n_results=5, filters=filters)
		
		if not results:
			return f"Khong tim thay tai lieu nao lien quan den '{search}'."
		
		res = [f"Ket qua tim kiem vector cho '{search}':"]
		for r in results:
			title = r.get('document_title', 'Khong ro')
			doc_id = r.get('document_id', 'Khong ro')
			text_preview = r.get('text', '')[:200].replace('\n', ' ')
			res.append(f"- {title} (ID: {doc_id}): \"{text_preview}...\"")
		return "\n".join(res)
	except Exception as e:
		return f"Loi khi truy van tai lieu: {str(e)}"


@tool
def read_course_document(document_id: str) -> str:
	"""
	Doc noi dung chi tiet cua mot tai lieu (LMS Document) bang ID.
	Su dung tool nay sau khi da co ID tu get_course_documents de tra loi cau hoi chi tiet ve noi dung.
	Luu y: Chi doc duoc cac tai lieu dang van ban (Markdown, Text, HTML).
	"""
	try:
		doc = frappe.get_doc("LMS Document", document_id)
		if not doc.file:
			return "Tai lieu nay khong co file dinh kem."
		
		file_doc = frappe.get_doc("File", {"file_url": doc.file})
		content = file_doc.get_content()
		
		# Neu la binary, thu decode
		if isinstance(content, bytes):
			try:
				content = content.decode('utf-8')
			except:
				return "Khong the doc noi dung file nay (co the la file nhi phan nhu PDF/Docx)."
		
		# Gioi han 2000 ky tu de tranh tran context
		if len(content) > 2000:
			content = content[:2000] + "\n...(Con tiep)..."
			
		return f"Noi dung tai lieu '{doc.title}':\n\n{content}"
	except Exception as e:
		return f"Loi khi doc tai lieu: {str(e)}"
