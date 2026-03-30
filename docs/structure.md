# Cấu trúc Hệ thống LMS (System Architecture & Workspace Structure)

## 1. Tổng quan Kiến trúc (Architecture Overview)
Hệ thống Frappe Learning (LMS) được xây dựng theo kiến trúc Client-Server hiện đại:
- **Backend**: Được phát triển dựa trên **Frappe Framework** (ngôn ngữ Python, sử dụng cơ sở dữ liệu MariaDB, hệ thống cache Redis). Cung cấp các RESTful APIs, quản lý đối tượng (Doctype) cấu trúc dữ liệu, và phân quyền.
- **Frontend**: Single Page Application (SPA) xây dựng bằng **Vue.js** (Vite + TailwindCSS + Frappe UI component library). Giao tiếp hoàn toàn với Backend qua hệ thống API của Frappe.

## 2. Sơ đồ Cây Thư mục (Directory Tree)

Dưới đây là sơ đồ tổng quan của toàn bộ thư mục mã nguồn:

```text
lms/
├── .github/
│   └── workflows/          # Nơi chứa các pipelines CI/CD (GitHub Actions)
├── cypress/                # Kịch bản kiểm thử End-to-End (E2E) với Cypress
├── docker/                 # Cấu hình container hóa môi trường
│   ├── common/             # Container cơ bản dùng chung
│   ├── dev/                # Môi trường phát triển (Local)
│   ├── production/         # Môi trường thực tế (Live Server)
│   └── staging/            # Môi trường chạy thử (Pre-production)
├── docs/                   # Tài liệu phân tích hệ thống (structure.md, setup.md)
├── frontend/               # Mã nguồn Frontend (Vue.js + Vite + Tailwind)
│   ├── public/             # Tài nguyên tĩnh của frontend (favicon, images...)
│   ├── src/                # Core logic, UI components, state management
│   ├── package.json        # Dependencies của NodeJS
│   ├── tailwind.config.js  # Cấu hình UI Framework
│   └── vite.config.js      # Cấu hình Build system 
├── lms/                    # Mã nguồn Backend (Frappe Module)
│   ├── lms/                # Chứa cấu trúc Doctype/Models tạo Database
│   ├── public/             # File assets đã build sẵn hoặc tĩnh từ backend
│   ├── templates/          # Giao diện viết bằng Jinja templates
│   ├── www/                # Các trang Portal (web truyền thống)
│   ├── auth.py             # Logic xác thực người dùng
│   ├── hooks.py            # Event/API đăng ký vào hệ thống Frappe
│   ├── install.py          # Script chạy lúc initial project
│   └── plugins.py          # Config tích hợp mở rộng
├── scripts/                # Script bash tự động hóa thao tác (CI/Dev)
│   ├── backup.sh           # Sao lưu dữ liệu
│   ├── setup-dev.sh        # Khởi tạo Development
│   └── setup-prod.sh       # Khởi động Production
├── Makefile                # Alias command linh hoạt hỗ trợ lệnh ngắn gọn
├── pyproject.toml          # Khai báo cấu hình/Dependencies Python
└── README.md               # Tổng quan dự án & Guide
```

## 3. Phân tích Chức năng Thư mục (Directory Analysis)

Dưới đây là phân tích chi tiết chức năng cụ thể của từng phần:

### `frontend/` (Chứa Frontend App)
Là khối xử lý giao diện người dùng chính:
- `src/`: Bao gồm toàn bộ Vue components, pages, stores (quản lý trạng thái), router và các hàm tiện ích gọi API (thường dùng `frappe-ui`).
- `tailwind.config.js`: Định cấu hình các biến màu sắc, plugin về typography, giao diện của TailwindCSS phù hợp với Frappe/LMS.
- `vite.config.js`: Cấu hình build tool Vite cho Vue3 app. Đảm nhiệm việc đóng gói source code để push vào thư mục assets của Frappe backend.
- `package.json`: Quản lý dependencies Javascript (Node.js).

### `lms/` (Chứa Backend App - Frappe Module)
Đây là "trái tim" backend chứa toàn bộ logic ứng dụng LMS trong kiến trúc Frappe:
- `hooks.py`: File cốt lõi định nghĩa tất cả các hooks, API endpoints (whitelisted methods), scheduled jobs, và tích hợp các ứng dụng/plugin Frappe khác.
- `auth.py`, `plugins.py`, `activation.py`, `sqlite.py`: Các file Python xử lý business logic về xác thực người dùng, tích hợp bên thứ ba, hay truy vấn dữ liệu cụ thể.
- `lms/` (Thư mục con cùng tên): Chứa khai báo cấu trúc DocType của Frappe như (Course, Chapter, Lesson, Quiz, v.v.) quyết định việc tạo các bảng trong Database.
- `public/`: Lưu trữ các file hình ảnh, CSS, JS tĩnh (thường được build ra từ `frontend/`).
- `templates/` & `www/`: Chứa các tệp Jinja/HTML dùng cho việc render trang Web truyền thống chuẩn SEO, portal nếu không sử dụng SPA hoàn toàn.

### `docker/` (Cấu hình Containerization)
Tách rời môi trường để đảm bảo độ ổn định khi build và deploy:
- `common/`: Các service dùng chung cho Docker.
- `dev/`, `staging/`, `production/`: Cấu hình `.yml` tương ứng với mỗi môi trường để giả lập và mount volume, setup variables.

### `scripts/` (Scripts Tự động hóa)
Hỗ trợ developer thao tác với hệ thống nhanh hơn:
- `setup-dev.sh`: Script cấu hình nhanh cho môi trường local.
- `setup-prod.sh`: Script phục vụ việc spin-up hoặc cập nhật môi trường thực tế.
- `backup.sh` / `migrate.sh`: Tự động nén database / backup thư mục site.

### `.github/workflows/` (Hành lang CI/CD)
Định nghĩa sẵn các kịch bản tích hợp liên tục và phát hành liên tục bằng GitHub Actions:
- Các file như `ci.yml`, `ui-tests.yml`, `linters.yml`: Đảm nhiệm việc Test và kiểm tra chất lượng code tự động.
- `build.yml`, `release_notes.yml`: Đảm nhiệm việc tạo Docker Image tự động đưa lên Registry (ghcr.io) mỗi khi có tag/release mới.

### `cypress/`
Chứa các kịch bản kiểm thử End-to-End (E2E) mô phỏng các thao tác của người dùng thật trực tiếp trên trình duyệt, đảm bảo chất lượng giao diện (ví dụ click giỏ hàng, nộp quiz).

### Các file config chính ở Root:
- `README.md`, `bench-installation.md`, `docker-installation.md`: Tài liệu dự án.
- `Makefile`: Lối tắt để chạy các câu lệnh hệ thống (thay vì gõ dài).
- `pyproject.toml` / `requirements.txt`: Khai báo package Python mà app LMS cần cài đặt.
