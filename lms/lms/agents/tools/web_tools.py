import frappe
import requests
import json 
import os
from langchain_core.tools import tool

@tool
def search_web(query: str) -> str:
    """
    Tim kiem tren mang Internet (Web Search) de lay thong tin moi nhat.
    Su dung tool nay khi ban can cap nhat kien thuc, tim kiem tin tuc hoac giai dap nhung cau hoi ma tai lieu noi bo khong co.
    Tham so: query - Tu khoa can tim kiem bang tieng Viet hoac tieng Anh.
    """
    # Fetch API key from Global LMS AI Settings
    api_key = frappe.db.get_single_value("LMS AI Settings", "tavily_api_key") or os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Web search is currently disabled (API key missing)."
    
    try:
        response = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": api_key,
                "query": query,
                "search_depth": "advanced",
                "include_answer": True
            }
        )
        return response.json()
    except Exception as e:
        return f"Error during web search: {str(e)}"
