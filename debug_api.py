import frappe
frappe.init(site='lms.localhost', sites_path='/home/huyhoang/frappe-bench/sites')
frappe.connect()

# Simulate API call as lyyeuhuong0909
frappe.set_user('lyyeuhuong0909@gmail.com')
member = frappe.session.user
print(f"User: {member}")
print(f"Roles: {frappe.get_roles(member)}")

# Check enrollment
enrolled_batches = frappe.get_all("LMS Batch Enrollment",
    filters={"member": member},
    pluck="batch",
    ignore_permissions=True,
)
print(f"Enrolled batches: {enrolled_batches}")

# Get class games for enrolled batches
if enrolled_batches:
    class_games = frappe.get_all("LMS Class Game",
        filters={"batch": ["in", enrolled_batches]},
        fields=["name", "game", "batch", "max_attempts"],
        ignore_permissions=True,
    )
    print(f"Class games found: {len(class_games)}")
    for cg in class_games:
        game = frappe.db.get_value("LMS Game", cg.game, ["title", "is_active", "game_type"], as_dict=True)
        print(f"  - {cg.name}: {game}")
