import os
import re
import json
import urllib.request
import urllib.parse
import time

def translate_vi_to_en(text):
    text = text.strip()
    if not text: return text
    
    # Simple cache to avoid redundant calls
    if hasattr(translate_vi_to_en, "cache") and text in translate_vi_to_en.cache:
        return translate_vi_to_en.cache[text]
        
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=" + urllib.parse.quote(text)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            translated = "".join([t[0] for t in result[0]])
            # Clean up some weird translations
            translated = translated.replace("'", "\\'")
            
            if not hasattr(translate_vi_to_en, "cache"):
                translate_vi_to_en.cache = {}
            translate_vi_to_en.cache[text] = translated
            
            time.sleep(0.1) # Rate limit
            return translated
    except Exception as e:
        print(f"Error translating: {text[:20]}... - {e}")
        return text

def contains_vietnamese(text):
    vn_chars = re.compile(r'[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]')
    return bool(vn_chars.search(text))

def process_vue_file(filepath, csv_dict):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes_made = 0

    # 1. Text nodes: > Nội dung < -> > {{ __('Content') }} <
    text_node_pattern = re.compile(r'>([^<>{}]*?[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ][^<>{}]*?)<')
    
    def repl_text_node(match):
        nonlocal changes_made
        vi_text = match.group(1).strip()
        if not vi_text or len(vi_text) > 200 or '\n' in vi_text: 
            return match.group(0)
            
        en_text = translate_vi_to_en(vi_text)
        csv_dict[en_text] = vi_text
        changes_made += 1
        return match.group(0).replace(vi_text, f"{{{{ __('{en_text}') }}}}")

    content = text_node_pattern.sub(repl_text_node, content)

    # 2. Attributes: placeholder="Nhập tên" -> :placeholder="__('Enter name')"
    attr_pattern = re.compile(r' (\w+)="([^"{}]*?[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ][^"{}]*?)"')
    
    def repl_attr(match):
        nonlocal changes_made
        attr_name = match.group(1)
        vi_text = match.group(2).strip()
        
        # Skip if it's already bound (starts with :)
        if attr_name.startswith(':'): return match.group(0)
        
        if not vi_text or len(vi_text) > 100: return match.group(0)
        
        en_text = translate_vi_to_en(vi_text)
        csv_dict[en_text] = vi_text
        changes_made += 1
        return f" :{attr_name}=\"__('{en_text}')\""

    content = attr_pattern.sub(repl_attr, content)

    # 3. JS Strings inside single quotes (simple heuristic, avoids imports)
    # We look for 'Nội dung' but only if it has Vietnamese chars, and we wrap with __('Content')
    js_string_pattern = re.compile(r"(?<!__\()(?<!__\(\s)'([^'\n{}<>]*?[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ][^'\n{}<>]*?)'")

    def repl_js_string(match):
        nonlocal changes_made
        vi_text = match.group(1).strip()
        if not vi_text or len(vi_text) > 100: return match.group(0)
        
        en_text = translate_vi_to_en(vi_text)
        csv_dict[en_text] = vi_text
        changes_made += 1
        return f"__('{en_text}')"

    content = js_string_pattern.sub(repl_js_string, content)

    if changes_made > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath} ({changes_made} changes)")
        return True
    return False

def main():
    src_dir = '/home/huyhoang/frappe-bench/apps/lms/frontend/src'
    csv_file = '/home/huyhoang/frappe-bench/apps/lms/lms/translations/vi.csv'
    
    csv_dict = {}
    
    total_files = 0
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.vue'):
                filepath = os.path.join(root, file)
                if process_vue_file(filepath, csv_dict):
                    total_files += 1

    # Append to CSV
    if csv_dict:
        print(f"Adding {len(csv_dict)} translations to {csv_file}")
        with open(csv_file, 'a', encoding='utf-8') as f:
            for en, vi in csv_dict.items():
                f.write(f"\n{en},{vi},")
                
    print(f"Done. Processed {total_files} files.")

if __name__ == '__main__':
    translate_vi_to_en.cache = {}
    main()
