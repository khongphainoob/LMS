import os
import re
import json

def contains_vietnamese(text):
    vn_chars = re.compile(r'[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]')
    return bool(vn_chars.search(text))

def extract_strings_from_vue(filepath):
    strings = set()
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract text between HTML tags
    text_nodes = re.findall(r'>([^<]+)<', content)
    for node in text_nodes:
        clean_node = node.strip()
        if clean_node and contains_vietnamese(clean_node) and not clean_node.startswith('{{'):
            strings.add(clean_node)
            
    # Extract strings in quotes (single or double or backticks)
    quoted_strings = re.findall(r'["\'`]+([^"\'`]+)["\'`]+', content)
    for qs in quoted_strings:
        clean_qs = qs.strip()
        if clean_qs and contains_vietnamese(clean_qs):
            strings.add(clean_qs)

    return strings

def main():
    src_dir = '/home/huyhoang/frappe-bench/apps/lms/frontend/src'
    all_vn_strings = set()
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                vn_strings = extract_strings_from_vue(filepath)
                all_vn_strings.update(vn_strings)
                
    output = list(all_vn_strings)
    with open('/home/huyhoang/frappe-bench/apps/lms/vn_strings.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
        
    print(f"Extracted {len(output)} unique Vietnamese strings.")

if __name__ == '__main__':
    main()
