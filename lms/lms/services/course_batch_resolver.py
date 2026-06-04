import frappe
from frappe import _

@frappe.whitelist()
def get_selection_context():
    """
    Trả về danh sách Courses + Batches cho frontend selector.
    Mỗi batch kèm danh sách courses bên trong.
    Chỉ lấy những khóa/lớp mà user đang tham gia hoặc sở hữu/giảng dạy.
    """
    user = frappe.session.user
    if user == "Guest":
        return {"courses": [], "batches": []}

    # Lấy danh sách khóa học mà user sở hữu (host/tạo)
    owned_courses = frappe.get_all("LMS Course", filters={"owner": user}, pluck="name")
    
    # Lấy danh sách khóa học user là giảng viên (Instructor)
    instructed_courses = frappe.get_all("Course Instructor", filters={"instructor": user, "parenttype": "LMS Course"}, pluck="parent")
    
    # Lấy danh sách khóa học mà user đang tham gia trực tiếp (học viên)
    enrolled_courses = frappe.get_all("LMS Enrollment", filters={"member": user}, pluck="course")
    
    # Lấy danh sách khóa học thông qua Lớp học (Batch)
    enrolled_batches_only = frappe.get_all("LMS Batch Enrollment", filters={"member": user}, pluck="batch")
    batch_courses = []
    if enrolled_batches_only:
        batch_courses = frappe.get_all("Batch Course", filters={"parent": ["in", enrolled_batches_only]}, pluck="course")
        
    # Thêm khóa học từ Program
    enrolled_programs_only = frappe.get_all("LMS Program Member", filters={"member": user}, pluck="parent")
    program_courses = []
    if enrolled_programs_only:
        program_courses = frappe.get_all("LMS Program Course", filters={"parent": ["in", enrolled_programs_only]}, pluck="course")
    
    # Gộp danh sách khóa học hợp lệ
    valid_course_names = list(set(owned_courses + instructed_courses + enrolled_courses + batch_courses + program_courses))
    
    courses = []
    if valid_course_names or user == "Administrator":
        filters = {}
        if user != "Administrator":
            filters = {"name": ["in", valid_course_names]}
        courses = frappe.get_all("LMS Course", 
            filters=filters,
            fields=["name", "title"],
            order_by="title asc"
        )
    
    # Tương tự cho Batches
    owned_batches = frappe.get_all("LMS Batch", filters={"owner": user}, pluck="name")
    instructed_batches = frappe.get_all("Course Instructor", filters={"instructor": user, "parenttype": "LMS Batch"}, pluck="parent")
    enrolled_batches = frappe.get_all("LMS Batch Enrollment", filters={"member": user}, pluck="batch")
    
    valid_batch_names = list(set(owned_batches + instructed_batches + enrolled_batches))
    
    batches = []
    if valid_batch_names or user == "Administrator":
        filters = {}
        if user != "Administrator":
            filters = {"name": ["in", valid_batch_names]}
        batches = frappe.get_all("LMS Batch", 
            filters=filters,
            fields=["name", "title"],
            order_by="title asc"
        )
        
        # Attach courses to each batch via child table "Batch Course"
        for batch in batches:
            batch_courses = frappe.get_all("Batch Course",
                filters={"parent": batch.name},
                fields=["course"],
                order_by="idx asc"
            )
            batch["courses"] = []
            for bc in batch_courses:
                if (user == "Administrator" or bc.course in valid_course_names) and frappe.db.exists("LMS Course", bc.course):
                    c = frappe.db.get_value("LMS Course", bc.course, 
                        ["name", "title"], as_dict=True)
                    if c:
                        batch["courses"].append(c)
    
    return {"courses": courses, "batches": batches}

@frappe.whitelist()
def get_courses_by_batch(batch_name):
    """Trả về danh sách courses trong 1 batch cụ thể."""
    if not batch_name or not frappe.db.exists("LMS Batch", batch_name):
        frappe.throw(_("Batch không tồn tại"))
    
    user = frappe.session.user
    if user == "Guest":
        return []

    # Get valid courses for user
    valid_courses = []
    if user != "Administrator":
        owned = frappe.get_all("LMS Course", filters={"owner": user}, pluck="name")
        instructed = frappe.get_all("Course Instructor", filters={"instructor": user, "parenttype": "LMS Course"}, pluck="parent")
        enrolled = frappe.get_all("LMS Enrollment", filters={"member": user}, pluck="course")
        
        # Thêm khóa học từ Batch
        enrolled_batches_only = frappe.get_all("LMS Batch Enrollment", filters={"member": user}, pluck="batch")
        batch_courses_user = []
        if enrolled_batches_only:
            batch_courses_user = frappe.get_all("Batch Course", filters={"parent": ["in", enrolled_batches_only]}, pluck="course")
            
        # Thêm khóa học từ Program
        enrolled_programs_only = frappe.get_all("LMS Program Member", filters={"member": user}, pluck="parent")
        program_courses_user = []
        if enrolled_programs_only:
            program_courses_user = frappe.get_all("LMS Program Course", filters={"parent": ["in", enrolled_programs_only]}, pluck="course")
            
        valid_courses = list(set(owned + instructed + enrolled + batch_courses_user + program_courses_user))
    
    batch_courses = frappe.get_all("Batch Course",
        filters={"parent": batch_name},
        fields=["course"],
        order_by="idx asc"
    )
    
    courses = []
    for bc in batch_courses:
        if user == "Administrator" or (bc.course in valid_courses):
            if bc.course and frappe.db.exists("LMS Course", bc.course):
                c = frappe.db.get_value("LMS Course", bc.course,
                    ["name", "title"], as_dict=True)
                if c:
                    courses.append(c)
    return courses

@frappe.whitelist()
def get_courses_query(doctype, txt, searchfield, start, page_len, filters):
    """Server-side query cho Frappe desk form — filter courses theo batch và isolation."""
    user = frappe.session.user
    
    orm_filters = []
    
    # Isolation filter clause
    if user != "Administrator":
        owned = frappe.get_all("LMS Course", filters={"owner": user}, pluck="name")
        instructed = frappe.get_all("Course Instructor", filters={"instructor": user, "parenttype": "LMS Course"}, pluck="parent")
        enrolled = frappe.get_all("LMS Enrollment", filters={"member": user}, pluck="course")
        
        # Thêm khóa học từ Batch
        enrolled_batches_only = frappe.get_all("LMS Batch Enrollment", filters={"member": user}, pluck="batch")
        batch_courses_user = []
        if enrolled_batches_only:
            batch_courses_user = frappe.get_all("Batch Course", filters={"parent": ["in", enrolled_batches_only]}, pluck="course")
            
        # Thêm khóa học từ Program
        enrolled_programs_only = frappe.get_all("LMS Program Member", filters={"member": user}, pluck="parent")
        program_courses_user = []
        if enrolled_programs_only:
            program_courses_user = frappe.get_all("LMS Program Course", filters={"parent": ["in", enrolled_programs_only]}, pluck="course")
            
        valid_courses = list(set(owned + instructed + enrolled + batch_courses_user + program_courses_user))
        if not valid_courses:
            return []
        
        orm_filters.append(["name", "in", valid_courses])
        
    batch = filters.get("batch")
    
    if batch:
        batch_courses = frappe.get_all("Batch Course", filters={"parent": batch}, pluck="course")
        if not batch_courses:
            return []
        orm_filters.append(["name", "in", batch_courses])
        
    or_filters = None
    if txt:
        or_filters = [
            ["name", "like", f"%{txt}%"],
            ["title", "like", f"%{txt}%"]
        ]
        
    return frappe.get_all("LMS Course",
        filters=orm_filters,
        or_filters=or_filters,
        fields=["name", "title"],
        order_by="title asc",
        limit_start=start,
        limit_page_length=page_len,
        as_list=True
    )

def validate_course_batch(course, batch):
    """Kiểm tra course có thuộc batch không."""
    if not batch:
        return True
    return bool(frappe.db.exists("Batch Course", {
        "parent": batch, "course": course
    }))
