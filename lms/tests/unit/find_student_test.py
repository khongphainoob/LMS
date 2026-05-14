import frappe
from typing import Dict, List, Optional

def find_test_data(search_name: Optional[str] = None) -> Dict:
    """
    Finds a student, their course, batch, and related documents for testing.
    Returns a dictionary with the found data.
    """
    data = {
        "student": None,
        "course": None,
        "batch": None,
        "lesson": None,
        "documents": []
    }

    # 1. Find a Student Enrollment
    enrollment = None
    if frappe.db.exists("DocType", "LMS Enrollment"):
        filters = {}
        if search_name:
            # Try to find user by name first
            matching_users = frappe.get_all("User", filters=["or", [["full_name", "like", f"%{search_name}%"]], [["name", "like", f"%{search_name}%"]]]], fields=["name"])
            if matching_users:
                user_names = [u.name for u in matching_users]
                filters["member"] = ["in", user_names]
            else:
                print(f"Warning: No student found matching name '{search_name}'")
        
        enrollment = frappe.db.get_value("LMS Enrollment", filters, ["member", "course", "batch"], as_dict=True)
    
    if enrollment:
        data["student"] = enrollment.member
        data["course"] = enrollment.course
        data["batch"] = enrollment.batch
    else:
        # Fallback to Administrator if no specific student found
        data["student"] = "Administrator"
        if frappe.db.exists("DocType", "LMS Course"):
            data["course"] = frappe.db.get_value("LMS Course", {"published": 1}, "name")

    # 2. Find a Lesson in that course
    if data["course"] and frappe.db.exists("DocType", "LMS Lesson"):
        data["lesson"] = frappe.db.get_value("LMS Lesson", {"course": data["course"]}, "name")

    # 3. Find Uploaded Documents (Files)
    search_targets = []
    if data["course"]:
        search_targets.append(("LMS Course", data["course"]))
    if data["batch"]:
        search_targets.append(("LMS Batch", data["batch"]))
    if data["lesson"]:
        search_targets.append(("LMS Lesson", data["lesson"]))
        
    if data["course"]:
        other_lessons = frappe.get_all("LMS Lesson", filters={"course": data["course"]}, fields=["name"], limit=5)
        for l in other_lessons:
            if l.name != data["lesson"]:
                search_targets.append(("LMS Lesson", l.name))

    for doctype, name in search_targets:
        files = frappe.get_all("File", 
            filters={
                "attached_to_doctype": doctype,
                "attached_to_name": name
            },
            fields=["file_name", "file_url", "is_private"]
        )
        for f in files:
            f["source_doctype"] = doctype
            f["source_name"] = name
            data["documents"].append(f)

    return data

if __name__ == "__main__":
    # If run as a script, initialize frappe
    import sys
    import os
    
    # Path to frappe-bench/apps
    sys.path.append(os.path.join(os.getcwd(), "..", "..", "..", ".."))
    
    # This script needs to be run via `bench execute` or similar to have frappe context
    # But for demonstration, we just define the logic.
    print("This script should be run within a Frappe environment.")
    # data = find_test_data()
    # print(data)
