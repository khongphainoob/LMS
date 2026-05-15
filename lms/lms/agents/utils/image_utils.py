import base64
import os
import frappe
from frappe.utils import get_site_path, get_files_path
from PIL import Image
import io

def get_image_base64(file_url):
    """
    Given a Frappe file URL, returns the base64 encoded string and mime type.
    """
    if not file_url:
        return None, None

    # Resolve the physical path
    file_path = None
    if file_url.startswith("/files/"):
        file_path = get_site_path("public", file_url.lstrip("/"))
    elif file_url.startswith("/private/files/"):
        file_path = get_site_path(file_url.lstrip("/"))
    
    if not file_path or not os.path.exists(file_path):
        # Fallback: check if it's a File doc name
        file_doc = frappe.db.exists("File", {"file_url": file_url})
        if file_doc:
            file_doc = frappe.get_doc("File", file_doc)
            file_path = get_site_path("public", file_doc.file_url.lstrip("/")) if not file_doc.is_private else get_site_path(file_doc.file_url.lstrip("/"))

    if not file_path or not os.path.exists(file_path):
        frappe.log_error(f"Image file not found: {file_url}", "AI Grading Image Utils")
        return None, None

    # Get mime type
    import mimetypes
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "image/jpeg" # Default

    with open(file_path, "rb") as f:
        # Optional: Resize image if too large (to save tokens/cost)
        # For now, we just read and encode
        image_data = f.read()
        
        # If image is > 2MB, compress it
        if len(image_data) > 2 * 1024 * 1024:
            image_data = compress_image(image_data, mime_type)
            
        return base64.b64encode(image_data).decode("utf-8"), mime_type

def compress_image(image_bytes, mime_type, max_size=(2048, 2048), quality=85):
    """
    Resizes and compresses image to reduce payload size.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary (e.g. RGBA -> RGB for JPEG)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        # Resize maintaining aspect ratio
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        output = io.BytesIO()
        format = "JPEG" if "jpeg" in mime_type.lower() or "jpg" in mime_type.lower() else "PNG"
        img.save(output, format=format, quality=quality, optimize=True)
        return output.getvalue()
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Image Compression Error")
        return image_bytes # Return original if compression fails

def get_gemini_vision_part(file_url):
    """
    Formats the image for Google Gemini API payload.
    """
    b64_data, mime_type = get_image_base64(file_url)
    if not b64_data:
        return None
        
    return {
        "inline_data": {
            "mime_type": mime_type,
            "data": b64_data
        }
    }
