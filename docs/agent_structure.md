# Cấu Trúc Hệ Thống Agentic AI (LangGraph)

Tài liệu này ghi lại cấu trúc thư mục và các thành phần đã thiết lập cho hệ thống Agentic AI trong dự án Frappe LMS.

## 1. Tổng Quan
Hệ thống sử dụng **LangGraph** để xây dựng các Agent có khả năng duy trì trạng thái (stateful) và thực hiện các chuỗi suy luận phức tạp thông qua đồ thị (Graph).

## 2. Cấu Trúc Thư Mục

```text
lms/lms/agents/                 # Root của AI Agents
├── README.md                   # Hướng dẫn phát triển Agent
├── state.py                    # Định nghĩa cấu trúc dữ liệu State của Graph
├── nodes/                      # Các hàm xử lý (Nodes)
│   └── __init__.py
├── graphs/                     # Định nghĩa quy trình đồ thị (Graphs)
│   └── __init__.py
└── tools/                      # Các công cụ Agent có thể gọi
    └── __init__.py
```

## 3. Các Thành Phần Đã Thiết Lập

### 3.1 Dependencies
Đã thêm `langgraph` vào:
- `requirements/base.txt`
- `pyproject.toml`

### 3.2 State Definition (`state.py`)
Sử dụng `TypedDict` và `Annotated` để quản lý danh sách tin nhắn (`messages`) theo cơ chế cộng dồn (`operator.add`).

### 3.3 Tài Liệu Documentation
- `agents/README.md`: Cung cấp hướng dẫn cho nhà phát triển về cách tạo Node, Graph và Tool.
- `docs/AI_module.md`: Bản kế hoạch tổng thể đã có từ trước.

## 4. Các Bước Tiếp Theo
1. Triển khai các Tool cơ bản trong `agents/tools/lms_tools.py` để truy cập dữ liệu LMS.
2. Thiết lập Graph đầu tiên tại `agents/graphs/tutor_graph.py`.
3. Kiểm thử khả năng suy luận và gọi tool của Agent.
