"""Node 1: Preprocess – extract text from user input."""
import frappe


def preprocess_node(state: dict) -> dict:
    """Transform raw user_message into processed_content.
    If image_data is provided, note it for future OCR integration.
    """
    frappe.logger("socratic").info("=== [preprocess] START ===")
    
    user_message = state.get("user_message", "")
    image_data = state.get("image_data")
    
    processed = user_message
    if image_data and not user_message:
        # Placeholder for future OCR/Vision API
        processed = f"[Ảnh bài làm đã tải lên: {image_data}]"
    
    frappe.logger("socratic").info(f"[preprocess] processed_content length: {len(processed)}")
    
    return {
        "processed_content": processed,
        "current_status": "preprocessed"
    }
