# Hướng dẫn Cài đặt, Triển khai và CI/CD (Setup & DevOps)

Tài liệu này tổng hợp cách thức thiếp lập môi trường phát triển (Development), môi trường ứng dụng thực tế (Production), cách deploy và quy trình CI/CD của hệ thống LMS.

---

## 1. Thiết lập Môi trường Phát triển (Development Setup)

Bạn có hai cách tiếp cận chính: sử dụng Frappe Bench truyền thống (được ưu tiên nếu code backend thường xuyên) hoặc qua Docker.

### Cách 1: Sử dụng Frappe Bench (Local Native)
1. Hãy chắc chắn máy tính đã cài đặt [Frappe Bench](https://frappeframework.com/docs/user/en/installation).
2. Khởi tạo một site mới:
   ```bash
   bench new-site lms.test
   ```
3. Lấy source app (LMS App) qua URL git:
   ```bash
   bench get-app https://github.com/frappe/lms.git
   ```
4. Cài LMS app vào site vừa mới tạo:
   ```bash
   bench --site lms.test install-app lms
   ```
5. Đưa website vào hosts file để trình duyệt có thể truy cập qua domain ảo:
   ```bash
   bench --site lms.test add-to-hosts
   ```
6. Bật server (bench start) và truy cập `http://lms.test:8000/`.
7. **Đối lưu Frontend:** Bạn có thể vào thư mục `frontend/`, chạy `yarn install` và `yarn run dev` để khởi động Vite Development Server. Cổng Frontend sẽ hot-reload linh hoạt.

### Cách 2: Sử dụng Docker
Từ root dự án, bạn có thể gọi thẳng script bash cung cấp mặc định:
```bash
./scripts/setup-dev.sh
```
Hoặc truy cập thư mục docker và chạy thủ công:
```bash
cd docker
docker-compose up
```

---

## 2. Thiết lập Môi trường Thực tế (Production Setup)

Việc chạy production đòi hỏi các service như Nginx (Reverse Proxy), Gunicorn, Redis Cache, và Worker được thiết lập tách biệt, tối ưu hiệu năng.

### Lựa chọn 1: Managed Hosting qua Frappe Cloud
Ứng dụng có thể dễ dàng host trên [Frappe Cloud](https://frappecloud.com). Nền tảng này sẽ quản lý tự động CI/CD pull, database backup, nginx và scale.

### Lựa chọn 2: Self Host bằng Docker Easy Install Script
(Khuyến nghị trên các VPS trống)
Frappe LMS hỗ trợ easy-install script, đẩy môi trường Production lên bằng Container images (từ `ghcr.io/frappe/lms`).
```bash
wget https://frappe.io/easy-install.py

python3 ./easy-install.py deploy \
    --project=learning_prod_setup \
    --email=your_email.example.com \
    --image=ghcr.io/frappe/lms \
    --version=stable \
    --app=lms \
    --sitename subdomain.domain.tld
```
*Lưu ý: Bạn phải điều hướng A Record của tên miền trỏ về IP Public của VPS.*

---

## 3. Quy trình Triển khai Cập nhật mới (Deployment)

Quá trình deploy (cập nhật khi có code mới) khá chuẩn hóa theo luồng Frappe:
- **Nếu đang dùng Docker/Easy-Install:** Chạy script docker lấy image LMS phiên bản mới nhất từ git container registry và recreate container thay thế (không mất database vì volume đã cô lập data).
- **Nếu đang duy trì trên VPS bằng Frappe Bench:** Lên terminal, di chuyển vào `frappe-bench` và chạy:
  ```bash
  bench --site lms.com pull     # Kéo source mới nhất từ git
  bench --site lms.com migrate  # Dịch chuyển và áp dụng cấu trúc Database mới (nếu có)
  bench --site lms.com build    # Đóng gói lại thư viện JS/CSS của VueJS
  bench restart                 # Khởi động lại background jobs và gunicorn
  ```

---

## 4. Pipeline CI/CD (Continuous Integration / Continuous Deployment)

Hệ thống được thiết kế hoàn thiện qua GitHub Actions. Các file Workflow nằm tại thư mục `.github/workflows/`.

### 4.1. Integration & Testing (CI)
Chạy tự động khi team push code vào branch lớn hoặc submit Pull Request. Đảm bảo bugs không lọt vào main:
- **`ci.yml`**: Khởi động instance test Frappe, setup site giả và chạy danh sách Python Unit Tests của Backend backend.
- **`ui-tests.yml`**: Dựng môi trường giao diện và kích hoạt trình duyệt headless duyệt Cypress End-to-End Tests. Đóng vai user thật tương tác để kiểm tra.
- **`linters.yml`**: Cảnh giác chất lượng mã nguồn: quét lỗi syntax bằng Flake8 / Black đối với Python (Backend) và Prettier / Eslint cho VueJS (Frontend).

### 4.2. Delivery & Deployment (CD)
- **`build.yml`**: Ngay khi codebase qua hết bài test trên CI và merge vào develop/main, workflow sẽ đóng gói Image Docker Backend app, rồi PUSH thẳng lên kho GitHub Container Registry (`ghcr.io/frappe/lms`). Bản cập nhật này sẽ được các server setup dễ dàng kéo về update.
- **`semantic.yml` / `release_notes.yml`**: Hệ thống sẽ tự động tổng hợp nội dung Commit thành Changelogs đẹp đẽ và tự động tag version release (ví dụ `v1.2.3`), giảm tải sức người quản lý phiên bản. Trang thái public release được kích hoạt tại repo.
