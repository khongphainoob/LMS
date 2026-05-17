import os
import re
import json

def contains_vietnamese(text):
    vn_chars = re.compile(r'[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]')
    return bool(vn_chars.search(text))

def main():
    src_dir = '/home/huyhoang/frappe-bench/apps/lms/frontend/src/pages/AI'
    pattern = re.compile(r"__\(['\"]([^'\"]+)['\"]\)")
    
    extracted = set()
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    matches = pattern.findall(f.read())
                    for match in matches:
                        if contains_vietnamese(match):
                            extracted.add(match)

    output = list(extracted)
    with open('/home/huyhoang/frappe-bench/apps/lms/ai_vn_strings.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
        
    print(f"Found {len(output)} Vietnamese strings in AI folder.")

if __name__ == '__main__':
    main()
