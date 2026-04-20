import requests # [cite: 1]
import os


def load_env():
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('#') or not line.strip():
                continue
            key, value = line.strip().split('=', 1)
            os.environ[key] = value
def test_ocr():
    load_env()
    api_key = os.environ.get('OCR_SPACE_API_KEY', 'aa1324c22688957')
    url = 'https://api.ocr.space/parse/image'
    
    # Cấu hình tham số [cite: 1]
    payload = {
        'apikey': api_key,
        'language': 'auto',     # Docs: Engine 2/3 hỗ trợ tự nhận diện ngôn ngữ
        'OCREngine': 3,         # Engine 2 hỗ trợ ngôn ngữ rộng hơn
        'filetype': 'JPG',      # Ép định dạng để sửa lỗi E216 
    }
    
    # Đường dẫn file ảnh cần test (đảm bảo file này tồn tại cùng thư mục)
    file_path = '/mnt/d/PROJECTS/startup/test_high_2.jpg'
    try:
        with open(file_path, 'rb') as image_file:
            response = requests.post(
                url,
                files={'file': image_file},
                data=payload,
                timeout=60,
            )

# Kiểm tra nếu phản hồi thành công (Status Code 200)
        if response.status_code == 200:
            try:
                result = response.json() # Chuyển sang JSON
                
                # Kiểm tra nếu result là dictionary trước khi dùng .get()
                if isinstance(result, dict):
                    if result.get('OCRExitCode') == 1:
                        print("--- Văn bản nhận diện ---")
                        print(result['ParsedResults'][0]['ParsedText'])
                    else:
                        print("API báo lỗi:", result.get('ErrorMessage'))
                else:
                    print("Kết quả không phải định dạng JSON mong đợi:", result)
                    
            except Exception as e:
                print("Không thể parse JSON. Nội dung phản hồi thô:")
                print(response.text) # In ra nội dung thô để debug
        else:
            print(f"Lỗi HTTP {response.status_code}:")
            print(response.text)
    except Exception as e:
        print("Lỗi hệ thống:", str(e))

if __name__ == "__main__":
    test_ocr()