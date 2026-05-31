import frappe

def execute():
    doctypes = [
        "AI Exam", 
        "AI Exam Section", 
        "AI Exam Question",
        "LMS AI Tier",
        "LMS AI Tier Limit",
        "LMS Gamification Question Bank",
        "LMS Class Game",
        "LMS Game",
        "LMS Game Leaderboard Entry",
        "LMS Game Progress",
        "LMS Game Session",
        "LMS Lesson",
        "LMS Certification",
        "LMS Exercise"
    ]
    
    for dt in doctypes:
        if frappe.db.exists("DocType", dt):
            doc = frappe.get_doc("DocType", dt)
            
            # If we need to update LMS AI Tier Limit options
            if dt == "LMS AI Tier Limit":
                for field in doc.fields:
                    if field.fieldname == "service":
                        options = (field.options or "").split("\n")
                        options = [o.strip() for o in options if o.strip()]
                        if "Exam Gen" not in options:
                            options.append("Exam Gen")
                            field.options = "\n".join(options)
                            print("Added 'Exam Gen' to LMS AI Tier Limit service options.")
            
            # Ensure custom = 0 to allow export
            doc.custom = 0
            doc.module = "LMS"
            
            try:
                # In developer_mode, saving a non-custom DocType automatically writes the JSON
                doc.save()
                print(f"Saved {dt} - JSON should be generated.")
            except Exception as e:
                print(f"Error saving {dt}: {e}")
            
    frappe.db.commit()

execute()
