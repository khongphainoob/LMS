
import sys
import os

file_path = '/home/huyhoang/frappe-bench/apps/lms/frontend/src/pages/AI/AIIntegration.vue'
if not os.path.exists(file_path):
    print(f'File not found: {file_path}')
    sys.exit(1)

with open(file_path, 'r') as f:
    content = f.read()

new_item = '''  {
    label: 'Quiz Creator',
    description: 'Tạo bộ câu h�