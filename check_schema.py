import frappe
frappe.init(site='lms.localhost', sites_path='/home/huyhoang/frappe-bench/sites')
frappe.connect()

tables = frappe.db.sql("SHOW TABLES LIKE 'tabLMS%'", as_list=True)
print('LMS tables:', [t[0] for t in tables])

# Check enrollment table
try:
    enroll_cols = frappe.db.get_table_columns('LMS Enrollment')
    print('LMS Enrollment cols:', enroll_cols)
    enrolls = frappe.db.sql("SELECT name, member, batch FROM `tabLMS Enrollment` LIMIT 5", as_dict=True)
    print('Sample enrollments:', enrolls)
except Exception as e:
    print('Enrollment error:', e)
