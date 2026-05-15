import frappe
import os
import chromadb
from chromadb.utils import embedding_functions
from lms.lms.agents.provider import get_agent_config

def get_vector_client():
    """Khởi tạo ChromaDB client."""
    db_path = os.path.join(frappe.get_site_path(), "chatbot_vector_db")
    if not os.path.exists(db_path):
        os.makedirs(db_path)
    
    return chromadb.PersistentClient(path=db_path)

def get_embedding_fn():
    """Sử dụng Google Gemini Embeddings."""
    config = get_agent_config("chatbot")
    api_key = config.get("api_key") or frappe.conf.get("google_api_key")
    
    return embedding_functions.GooglePalmEmbeddingFunction(
        api_key=api_key,
        model_name="models/embedding-001"
    )

def index_all_documents():
    """Hàm quét toàn bộ tài liệu và đưa vào Vector DB."""
    client = get_vector_client()
    embedding_fn = get_embedding_fn()
    collection = client.get_or_create_collection(
        name="lms_documents", 
        embedding_function=embedding_fn
    )

    # 1. Index LMS Documents
    documents = frappe.get_all("LMS Document", fields=["name", "title", "file"])
    for doc in documents:
        if not doc.file: continue
        
        # Đọc nội dung file
        try:
            file_doc = frappe.get_doc("File", {"file_url": doc.file})
            content = file_doc.get_content()
            if isinstance(content, bytes):
                content = content.decode('utf-8', errors='ignore')
            
            # Chunking đơn giản (có thể cải thiện sau)
            chunks = [content[i:i+1000] for i in range(0, len(content), 800)]
            
            for idx, chunk in enumerate(chunks):
                collection.upsert(
                    documents=[chunk],
                    metadatas=[{"source": doc.name, "title": doc.title, "type": "document"}],
                    ids=[f"doc_{doc.name}_{idx}"]
                )
        except Exception:
            continue

    # 2. Index Course Lessons
    lessons = frappe.get_all("Course Lesson", fields=["name", "title", "content"])
    for lesson in lessons:
        if not lesson.content: continue
        
        chunks = [lesson.content[i:i+1000] for i in range(0, len(lesson.content), 800)]
        for idx, chunk in enumerate(chunks):
            collection.upsert(
                documents=[chunk],
                metadatas=[{"source": lesson.name, "title": lesson.title, "type": "lesson"}],
                ids=[f"lesson_{lesson.name}_{idx}"]
            )

    return "Indexing Complete"

def query_vector_db(query_text, n_results=3, filters=None):
    """Tìm kiếm nội dung liên quan."""
    try:
        client = get_vector_client()
        embedding_fn = get_embedding_fn()
        collection = client.get_collection(name="lms_documents", embedding_function=embedding_fn)
        
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=filters
        )
        
        formatted_results = []
        for i in range(len(results['documents'][0])):
            formatted_results.append({
                "content": results['documents'][0][i],
                "metadata": results['metadatas'][0][i]
            })
        return formatted_results
    except Exception:
        return []

def index_single_document(doc, method=None):
    """Hook để index một tài liệu ngay khi nó được tạo hoặc cập nhật."""
    try:
        # Chỉ index nếu là LMS Document hoặc Course Lesson
        if doc.doctype not in ["LMS Document", "Course Lesson"]:
            return

        client = get_vector_client()
        embedding_fn = get_embedding_fn()
        collection = client.get_or_create_collection(
            name="lms_documents", 
            embedding_function=embedding_fn
        )

        content = ""
        if doc.doctype == "LMS Document":
            if not doc.file: return
            file_doc = frappe.get_doc("File", {"file_url": doc.file})
            content = file_doc.get_content()
            if isinstance(content, bytes):
                content = content.decode('utf-8', errors='ignore')
            prefix = "doc"
        else: # Course Lesson
            content = doc.content or ""
            prefix = "lesson"

        if not content: return

        chunks = [content[i:i+1000] for i in range(0, len(content), 800)]
        for idx, chunk in enumerate(chunks):
            collection.upsert(
                documents=[chunk],
                metadatas=[{"source": doc.name, "title": doc.title, "type": doc.doctype.lower()}],
                ids=[f"{prefix}_{doc.name}_{idx}"]
            )
        print(f"--- [RAG] Indexed {doc.doctype}: {doc.name} ---")
    except Exception as e:
        frappe.log_error(f"RAG Indexing Error: {str(e)}", "Chatbot RAG")
