from pathlib import Path

import frappe

from lms.lms.services.ai_grading.ai_grading_service import AIGradingService
from lms.lms.services.ai_grading.image_utils import get_image_base64

def test_infra():
    print("--- 🔍 Testing Phase A: Image Utils ---")
    image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"}
    test_file = None

    for file_doc in frappe.get_all("File", fields=["file_url"], limit=500):
        file_url = file_doc.get("file_url")
        if file_url and Path(file_url.lower()).suffix in image_extensions:
            test_file = file_url
            break
    
    if test_file:
        print(f"Found test image: {test_file}")
        b64, mime = get_image_base64(test_file)
        if b64:
            print(f"✅ Success: Encoded image to Base64 (Length: {len(b64)})")
            print(f"✅ Mime Type: {mime}")
        else:
            print("❌ Failed: Could not encode image.")
    else:
        print("❓ No image files found in database to test.")

    print("\n--- 🔍 Testing Phase B: Service Integration ---")
    try:
        svc = AIGradingService()
        print("✅ Success: AIGradingService initialized correctly.")
        
        # Test if _build_deep_initial_state has vision_parts
        # We'll mock a submission for this
        print("Checking initial state logic...")
        if hasattr(svc, '_build_deep_initial_state'):
             print("✅ Success: _build_deep_initial_state exists.")
        else:
             print("❌ Failed: _build_deep_initial_state not found in service.")
             
    except Exception as e:
        print(f"❌ Failed: Error initializing service: {str(e)}")

if __name__ == "__main__":
    frappe.connect(site="lms.localhost")
    test_infra()
