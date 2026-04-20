# 🚀 Hướng dẫn Cài đặt Chandra OCR trên Google Colab

## Quy trình nhanh (3 phút)

### 1. **Tạo Colab Notebook mới**
- Truy cập [colab.research.google.com](https://colab.research.google.com)
- Tạo notebook mới: `File → New notebook`

### 2. **Enable GPU** (bắt buộc)
- Click: `Runtime → Change runtime type`
- Chọn: `GPU` (T4, V100, or A100)
- Click: `Save`

### 3. **Chạy 7 cells trong notebook**
Notebook đã chuẩn bị tại: `ocr_test.ipynb`

**Cell 1: Setup & Install**
```python
pip install -q chandra-ocr[hf] requests
```

**Cell 2: Download sample ảnh**
- Tự động lấy ảnh từ repo Chandra (handwritten math, tables, forms)

**Cell 3: Process với Chandra**
```bash
chandra sample_images/handwritten_math.png ocr_output --method hf
```

**Cell 4: Hiển thị output (Markdown)**
- In 1000 ký tự đầu của kết quả

**Cell 5: So sánh với PaddleOCR** (optional)
- Cài PaddleOCR
- So sánh accuracy & speed

**Cell 6: Visualization**
- Hiển thị input image vs OCR output

**Cell 7: Tips & Troubleshooting**
- Benchmarks, memory tips, troubleshooting

---

## Chi tiết từng bước

### **Step 1: Setup Environment**
```python
import torch
print(f"GPU: {torch.cuda.is_available()}")
# Expected: GPU: True (nếu T4, V100, etc.)

# Cài Chandra
!pip install -q chandra-ocr[hf] requests
```

### **Step 2: Download Sample Images** 
```python
import requests
from pathlib import Path

samples = {
    "handwritten_math": "https://...",  # từ repo Chandra
    "financial_table": "https://...",
    "form": "https://..."
}

for name, url in samples.items():
    resp = requests.get(url)
    with open(f"sample_images/{name}.png", "wb") as f:
        f.write(resp.content)
```

### **Step 3: Run Chandra OCR**
```bash
# HuggingFace method (local, trên GPU)
!chandra sample_images/handwritten_math.png ocr_output --method hf --max-output-tokens 4096

# vLLM method (nếu có server)
!chandra sample_images/handwritten_math.png ocr_output --method vllm
```

### **Step 4: Read Output**
```python
# Markdown output
with open("ocr_output/handwritten_math.md") as f:
    print(f.read())

# JSON metadata
import json
with open("ocr_output/handwritten_math_metadata.json") as f:
    metadata = json.load(f)
    print(metadata)
```

### **Step 5: Upload Custom Images** (for testing)
```python
from google.colab import files

# Upload local files
uploaded = files.upload()

# Process uploaded file
!chandra uploaded_file.png my_output --method hf
```

---

## Benchmark Performance trên Colab-T4

| Metric | Chandra 2 | PaddleOCR | Notes |
|--------|-----------|-----------|-------|
| **Accuracy (multilingual)** | 77.8% | ~70% | Chandra cao hơn |
| **Tiếng Việt** | 80.4% | ~72% | +8.4% |
| **Speed (1 page)** | ~2-5s | 1-2s | PaddleOCR nhanh, nhưng kém accuracy |
| **Tables** | Xuất sắc | Kém | Chandra tốt |
| **Math** | Tốt | Kém | Chandra specialized |
| **Handwriting** | Tốt | Tốt | Cả 2 ok |
| **Memory** | ~8GB | ~2GB | Chandra cần GPU |

---

## Troubleshooting

### ❌ "CUDA out of memory"
```python
import torch
torch.cuda.empty_cache()

# Reduce batch size
!chandra input.pdf output --batch-size 4 --method hf
```

### ❌ "Model download stuck"
```bash
# Set cache directory
export HF_HOME=/tmp/hf_cache
pip install -q chandra-ocr[hf] --upgrade
```

### ❌ "chandra command not found"
```bash
pip show chandra-ocr  # Check if installed
which chandra  # Find location
# Reinstall
pip uninstall chandra-ocr -y
pip install -q chandra-ocr[hf]
```

### ❌ GPU not detected
- Verify: `Runtime → Change runtime type → select GPU`
- Check: `!nvidia-smi`
- Colab restart if still not showing

---

## Copy Notebook to GDrive (Save Progress)

```python
from google.colab import drive
drive.mount('/content/gdrive')

# Save notebook
!cp ocr_test.ipynb /content/gdrive/MyDrive/
```

---

## Integrate với LMS

### Export outputs:
```python
from google.colab import files

# Download results
files.download('ocr_output/handwritten_math.md')
files.download('ocr_output/handwritten_math_metadata.json')
```

### Parsing cho LMS:
```python
import json

# Load OCR output
with open("ocr_output/result.md") as f:
    markdown_text = f.read()

with open("ocr_output/result_metadata.json") as f:
    metadata = json.load(f)

# Map to grading state
grading_state = {
    "raw_text": markdown_text,
    "metadata": metadata,
    "source": "chandra_ocr",
    "timestamp": metadata.get("created_at")
}

# Send to LMS API hoặc save to file
```

---

## Gợi ý tiếp theo

1. **Test trên bộ bài thi thực tế**: Upload 20-50 file PDF bài học sinh
2. **So sánh accuracy**: Đo lỗi OCR vs text gốc
3. **Optimize for LMS**: Tuning model, batch processing
4. **Deploy**:
   - Local: vLLM server + Frappe integration
   - Cloud: Hosted API từ DataLab (datalab.to)

---

**📚 Docs & Resources:**
- [Chandra OCR GitHub](https://github.com/datalab-to/chandra)
- [DataLab Hosted API](https://www.datalab.to/)
- [DataLab Playground](https://www.datalab.to/playground)
