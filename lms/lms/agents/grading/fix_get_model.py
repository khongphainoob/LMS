import os
import re

files_to_fix = [
    'aggregator.py',
    'essay_grader.py',
    'logic_specialist.py',
    'mcq_grader.py',
    'reviewer.py',
    'rubric_analyzer.py',
    'rubric_generator.py',
    'stem_grader.py',
    'visual_specialist.py'
]

for f in files_to_fix:
    if not os.path.exists(f):
        continue
    with open(f, 'r') as fp:
        content = fp.read()
    
    # fix 'model = get_model(...)' to 'model, _, _ = get_model(...)'
    content = re.sub(r'^(\s*)model\s*=\s*get_model\((.*?)\)$', r'\1model, _, _ = get_model(\2)', content, flags=re.MULTILINE)
    
    # fix 'self.model = get_model(...).with_structured_output(...)' to 'self.model = get_model(...)[0].with_structured_output(...)'
    content = re.sub(r'get_model\((.*?)\)\.with_structured_output', r'get_model(\1)[0].with_structured_output', content)
    
    # fix 'return get_model(...)' to 'return get_model(...)[0]'
    content = re.sub(r'^(\s*)return\s*get_model\((.*?)\)$', r'\1return get_model(\2)[0]', content, flags=re.MULTILINE)
    
    with open(f, 'w') as fp:
        fp.write(content)
        
print('Fixes applied successfully!')
