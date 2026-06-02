import re

with open('prompts.py', 'r', encoding='utf-8') as f:
    content = f.read()

known_vars = [
    'subject', 'grade_level', 'instructions', 'context', 'knowledge_map',
    'curriculum', 'exam_type', 'duration_minutes', 'difficulty_distribution',
    'exam_format', 'custom_format_template', 'section_configs',
    'section_blueprint', 'num_questions', 'draft_questions', 'visual_description'
]

new_content = content.replace('{', '{{').replace('}', '}}')
for var in known_vars:
    new_content = new_content.replace(f'{{{{{var}}}}}', f'{{{var}}}')

with open('prompts.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done fixing prompts.py')
