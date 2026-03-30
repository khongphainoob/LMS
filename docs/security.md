# Kiến trúc Hạ tầng & Bảo mật Hệ thống (Infrastructure & Security Analysis)

Tài liệu này đánh giá tổng quan về hạ tầng, cơ chế đảm bảo an ninh bảo mật hiện tại của hệ thống (LMS), hệ thống phân quyền (RBAC), những rủi ro đi kèm và đề xuất chiến lược phòng vệ an ninh mạng tương lai.

---

## 1. Phân tích Hạ tầng Kỹ thuật & Bảo mật Hiện tại

Hệ thống dựa trên cấu hình Containerisation (Docker) và nền tảng Frappe, với các vách ngăn bảo vệ tự nhiên:
- **Kiến trúc Cô lập Dịch vụ (Service Isolation):** Các thành phần cốt lõi (Gunicorn Backend chạy Python, Frontend đục lỗ API, Database MariaDB, Redis Cache) được giao tiếp thông qua một Docker Private Network. Database (Port 3306) và Cache (Port 6379) hoàn toàn đóng kín với thế giới bên ngoài.
- **Nginx Reverse Proxy & SSL:** Mọi kết nối đi qua cửa ngõ duy nhất là Nginx. Tại Nginx sẽ ép buộc kết nối an toàn (HTTPS / SSL Certificates) bằng Let's Encrypt, mã hóa mọi gói tin tránh nguy cơ khứu hơi gói tin (Packet Sniffing) qua Wifi.
- **Phòng chống Tấn công dò mật khẩu (Brute-Force Limit):** Cổng đăng nhập của Frappe có hỗ trợ tính năng Rate Limit (Khóa IP đăng nhập lặp lại quá N lần liên tiếp trong khoảng thời gian nhất định).

---

## 2. Hệ thống Phân quyền Người dùng Hiện Tại (User Roles & RBAC)

Frappe là nền tảng tối ưu cực sâu về việc quản trị danh tính và vai trò, đáp ứng đủ các tiêu chuẩn bảo mật nghiệp vụ B2B/B2C thông qua Role-Based Access Control (RBAC).

1. **Phân quyền đa cấp (DocType Permissions):**
   - **Administrator (Root):** Toàn quyền kiểm soát Server, module, code (System Manager). 
   - **LMS Instructor / Moderator:** Quyền soạn thảo Khóa học (CRUD Course/Chapter), duyệt điểm tự luận sinh viên.
   - **LMS Student:** Quyền Read-only với Khóa học được gán, có quyền tạo (Write) các bản ghi Quiz/Bài tập tương ứng với Account của người đó.
   - **Guest:** Chỉ được phép đọc (Read) các trang tĩnh cơ bản (Landing Page, Liên hệ).
2. **Kiểm soát Phiên truy cập (Session Management):**
   - Phiên đăng nhập được quản lý bằng Token hoặc Cookie `sid` có thiết lập HTTPOnly, ngăn không cho script chạy bằng JavaScript trên trình duyệt đánh cắp `sid` (Chống đánh cắp phiên qua XSS).

---

## 3. Các Rủi ro Tiềm Ẩn & Biện pháp Khắc phục (Risks & Mitigations)

Dù Frappe Core bảo mật rất chặt chẽ, do đây là một phần mềm tự viết logic riêng, các rủi ro vẫn có mặt liên tục theo tiến độ phát triển:

### 3.1. Truyền thông trái phép Đặc quyền (IDOR - Insecure Direct Object References)
- **Rủi ro:** Một Developer vô tình xây dựng API trả về bảng điểm bài thi mà quên kiểm tra đối sánh ID chủ sở hữu (Context User). 
  - *Ví dụ:* Một Sinh viên gọi API `GET /api/method/lms.get_quiz_result?id=102` thay vì `101`, sinh viên này xem được luôn điểm thi và kết quả báo cáo của bạn bè.
- **Khắc phục:** Mọi lệnh Database Fetch (Lấy dữ liệu) đều bắt buộc phải đính kèm điều kiện `owner = frappe.session.user` thay vì chỉ sử dụng Primary Key ID truyền tự do.

### 3.2. Rủi ro Tệp Đính kèm (Malicious File Uploads)
- **Rủi ro:** Mô hình LMS sinh viên nộp bài làm file docx/pdf dẫn dễ bị lợi dụng để tung Web Shell script (mã độc đuôi `.py`, `.php` trá hình). 
- **Khắc phục:** Ép White-list (danh sách tệp đuôi mở rộng minh bạch được upload) và đặt Max Size Limit (chặn nén bom ZIP file > 500MB gây treo Database MariaDB). File Public cần được cấm thực thi (Execution forbidden) trên Nginx.

### 3.3. SQL Injection (Qua Raw Queries)
- **Rủi ro:** Khi tạo ra tính năng thống kê Analytics Dashboard phức tạp (như phân tích AI Grading), nếu sử dụng `frappe.db.sql(f"SELECT * FROM tabStudent WHERE name = {user_input}")` sẽ bị tấn công nhúng SQL (DROP Tables).
- **Khắc phục:** Sử dụng String Placeholder (Parameterized query: `%s` hoặc `%(name)s`) cho 100% Raw SQL. Tránh tuyệt đối F-Strings Python ở tầng SQL.

---

## 4. Định hướng Nâng Cấp Tương Lai Cho Sự Phát Triển Bền Vững

Để sẵn sàng đón hàng rào nhiều người dùng hoặc triển khai vào chuỗi Trường Đại Học khép kín lớn, chuẩn hóa an ninh là điều kiện tiên quyết:

1. **Tuân thủ Chuẩn Bảo mật Cloud (WAF & DDoS Protection):**
   - Điều hướng toàn bộ kết nối đi ngang qua tường lửa ứng dụng web (WAF) như **Cloudflare Proxy**. WAF tự động phân loại lưu lượng BOT rác và thách thức (CAPTCHA/Challenge) nếu phát hiện hành vi DDoS băng thông.
   
2. **Lưu vết và Theo dõi Hành vi (Audit Trails & Logging):**
   - Kính hoạt `Track Changes` triệt để ở level hệ thống. Các thao tác nâng điểm (từ Trượt sang Đỗ), xóa hóa đơn người dùng đóng tiền mua khóa học... CẦN LƯU VẾT log chính xác về Nhân viên nào đã thực hiện vào giờ nào. Cảnh báo lên Nhóm chat Telegram ngay khi có Log dạng DELETE nguy hiểm.

3. **Cơ chế Phân quyền Thông minh Mới (SSO / 2FA):**
   - Hướng tới bảo mật tối giản mật khẩu. Người dùng tương lai sẽ login bằng Google Workspace (Đối với học sinh sinh viên), hoặc Microsoft Entra ID (nhân viên doanh nghiệp) qua chuẩn OAUTH2 / SSO.
   - Thêm xác thực hai yếu tố (2FA) bắt buộc nếu người Login mang role là Giáo Viên / Quản trị.

4. **Kiểm thử Liên tục (Continuous Security Testing DAST/SAST):**
   - Thêm Bot quét kiểm tra thư viện gốc cài trên server: Dependabot hoặc Snyk. Mã backend Python thường bị lỗ hổng nếu dùng một thư viện Version cũ. Bot sẽ tự động soi mã (SAST) ngay trong quá trình CI/CD. Ghi nhận lỗi báo rủi ro lập tức từ lúc Code ở mức độ Pull Request.
