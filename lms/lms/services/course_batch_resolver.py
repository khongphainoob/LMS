import frappe
from frappe import _

@frappe.whitelist()
def get_selection_context():
    """
    Trả về danh sách Courses + Batches cho frontend selector.
    Mỗi batch kèm danh sách courses bên trong.
    """
    courses = []
    if frappe.db.exists("DocType", "LMS Course"):
        courses = frappe.get_all("LMS Course", 
            fields=["name", "title"],
            order_by="title asc"
        )
    
    batches = []
    if frappe.db.exists("DocType", "LMS Batch"):
        batches = frappe.get_all("LMS Batch", 
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
                if bc.course and frappe.db.exists("LMS Course", bc.course):
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
    
    batch_courses = frappe.get_all("Batch Course",
        filters={"parent": batch_name},
        fields=["course"],
        order_by="idx asc"
    )
    
    courses = []
    for bc in batch_courses:
        if bc.course and frappe.db.exists("LMS Course", bc.course):
            c = frappe.db.get_value("LMS Course", bc.course,
                ["name", "title"], as_dict=True)
            if c:
                courses.append(c)
    return courses

@frappe.whitelist()
def get_courses_query(doctype, txt, searchfield, start, page_len, filters):
    """Server-side query cho Frappe desk form — filter courses theo batch."""
    batch = filters.get("batch")
    if batch:
        return frappe.db.sql("""
            SELECT c.name, c.title
            FROM `tabLMS Course` c
            INNER JOIN `tabBatch Course` bc ON bc.course = c.name
            WHERE bc.parent = %(batch)s
              AND (c.name LIKE %(txt)s OR c.title LIKE %(txt)s)
            ORDER BY c.title
            LIMIT %(start)s, %(page_len)s
        """, {"batch": batch, "txt": f"%{txt}%", 
              "start": start, "page_len": page_len})
    else:
        return frappe.db.sql("""
            SELECT name, title FROM `tabLMS Course`
            WHERE name LIKE %(txt)s OR title LIKE %(txt)s
            ORDER BY title
            LIMIT %(start)s, %(page_len)s
        """, {"txt": f"%{txt}%", "start": start, "page_len": page_len})

def validate_course_batch(course, batch):
    """Kiểm tra course có thuộc batch không."""
    if not batch:
        return True
    return bool(frappe.db.exists("Batch Course", {
        "parent": batch, "course": course
    }))
