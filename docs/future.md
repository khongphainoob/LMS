# Chiến lược Định hướng & Phát triển Tương lai (Future Strategy & Analysis)

Dựa trên cấu trúc phần mềm hiện tại (Vue.js SPA + Frappe Backend) và các công nghệ đang được áp dụng, dưới đây là bản phân tích và đề xuất chiến lược phát triển kiến trúc, quy trình và tính năng để chuẩn bị cho việc mở rộng quy mô (scaling) dự án LMS trong tương lai.

---

## 1. Đề xuất Mô hình Phát triển Phần mềm

Hiện tại, kiến trúc đang được tách biệt khá chuẩn giữa Client (Frontend) và Server (Backend qua hệ thống chuẩn Frappe API). Để tối ưu cho đội ngũ phát triển và duy trì tính ổn định của hệ thống, mô hình đề xuất sẽ là **Hybrid (Agile Scrum + Component-Based) kết hợp CI/CD Plan-driven.**

### Tại sao lại chọn Hybrid?
- **Agile Scrum (Quản trị tiến độ):** Phát triển tính năng theo các Sprint (2 tuần/lần). Linh hoạt thay đổi yêu cầu thị trường nhanh chóng, đặc biệt khi ứng dụng đang ở giai đoạn thêm nhiều tính năng mới như AI Grading, Cổng thanh toán, Ngôn ngữ.
- **Component-Based Development (Kiến trúc mã nguồn):** Cả phía Vue.js (dùng thư viện Vue UI/Tailwind) và hệ thống Frappe Backend (dựa trên Frappe DocType) đều có thiết kế *component* (mô-đun) cực kỳ tốt. Việc đóng gói các tính năng thành phân hệ Độc lập (Modules) là giải pháp giúp hệ thống không bị "nghẽn" (tight coupling) khi có quá nhiều người cùng gắn code.
- **Plan-driven (Cho Cơ sở hạ tầng - DevOps):** Quá trình CI/CD (GitHub Actions) và các hệ thống lõi về Bảo mật, Database, Docker cần được lên kế hoạch và có tài liệu chặt chẽ (Design Documents) trước khi xây dựng. Không thể vận dụng Agile ở hạ tầng mạng.

---

## 2. Các Chức năng Cần Phát triển (Future Feature Roadmap)

Dự án cung cấp luồng học trực tuyến rất tốt (khóa học, chương, live class, phân quyền quản trị), tiếp theo nên là các chức năng tạo giá trị gia tăng (Value-Added Services):

1. **Hệ sinh thái AI / Khâu chấm điểm (AI Analytics & Grading)**
   - Nâng cấp sâu hệ thống chấm điểm tự động tích hợp AI (AI Grading) mà dự án đang thử nghiệm, tự động xử lý essay/tự luận của sinh viên, giảm thiểu sức lực của Instructor.
   - Thêm AI trợ giảng (Chatbot) gán quyền truy cập riêng biệt cho từng course context.
2. **Dashboard Phân tích Dữ liệu Nâng cao (Advanced Analytics)**
   - Hệ thống tracking chi tiết quá trình học của Học viên (Drop-off rate ở module nào, thời lượng xem video là bao nhiêu).
   - Tích hợp Metabase hoặc Superset hoặc xây dựng cụm Dashboard Vue riêng để trực quan hóa dữ liệu theo thời gian thực (Real-time).
3. **Gamification (Game hóa)**
   - Cơ chế tặng điểm (Point System), cúp biểu trưng (Badges), Bảng xếp hạng thi đua (Leaderboard) theo Batch class để kích thích học tập.
4. **Hệ thống Đa ngôn ngữ và Bản địa hóa (i18n)**
   - Chuyển đổi ngôn ngữ trơn tru liền mạch ngay tại runtime (chức năng Switcher cho tiếng Việt / tiếng Anh).
5. **Ứng dụng Mobile (Mobile App / PWA)**
   - Mặc dù giao diện web Responsive tốt, tương lai cần biến nó thành định dạng Mobile PWA thực thụ với khả năng offline hóa hoặc dựng ứng dụng đa nền tảng bằng React Native / Flutter sử dụng lại core Frappe APIs.

---

## 3. Các Điểm Bất cập Cần Nâng cấp (Tech Debt & Refactoring)

Để tiến được tới một hệ thống quy mô lớn, một số điểm trong mã nguồn cần dọn dẹp (Refactor):
- **Phân tách State Management:** Trong Vue, nếu Logic quản lý giỏ hàng/Phiên người dùng/Token được đặt dàn trải, cần quy hoạch chặt chẽ lại qua Pinia Stores để tối ưu re-render.
- **Tách tải API quá nặng (Heavy Queries):** Frappe đôi lúc khá chậm do mô hình ORM tự sinh. Đối với các trang như Tóm tắt Analytics dành cho Admin tải dữ liệu ngàn bản ghi, cần nâng cấp lên viết Custom SQL Queries hoặc lưu sẵn kết quả qua `Redis Caching` thay vì Query tươi liên tục mỗi khi tải trang.
- **Lưu trữ Media/File:** Thay vì lưu video/file bài tập sinh viên nộp cục bộ trong hệ thống Frappe (làm phình to ổ cứng Server chính), nên tích hợp (S3 Bucket của AWS / MinIO) ngay lập tức để chuyển gánh nặng lưu trữ ra tài nguyên băng thông ngoài.
- **Quản lý quyền (Session/Permission RBAC):** Module quyền (Permissons) API cần test kĩ các lỗi rò rỉ dữ liệu (Broken Access Control) phòng trường hợp User thường vô tình query được dữ liệu của User khác thông qua Backend.

---

## 4. Định hướng Mở rộng Quy mô (Scaling for 1M+ Users)

Khi hệ thống gặp số lượng Traffic cực lớn (CCU cao, học viên thi quiz đồng thời):

### 4.1. Kiến Trúc Database (Data Scaling)
- Thiết lập **MariaDB Master-Slave Replication**: Một máy chủ MariaDB chỉ làm nhiệm vụ "Ghi – Add/Update" dữ liệu (Quizzes submitted, User Profile), trong khi các máy chủ Database khác được thiết lập Read-Replica chỉ phục vụ "Đọc – Select" dữ liệu (Load bài học, câu hỏi).
- **Phân mảnh dữ liệu (Partitioning/Archiving):** Các bảng lịch sử hệ thống truy cập (Logs, History) nên được tự động dọn hoặc chuyển snag cold storage sau 6 tháng.

### 4.2. Cấu trúc Application (Horizontal Scaling)
- Phía Frontend: Build tĩnh hoàn toàn (`dist/`) và đẩy lên các nền tảng Content Delivery Network (CDN) số một toàn cầu như **Cloudflare** hoặc **AWS CloudFront**. Khi đó, chi phí xử lý frontend của Server gốc giảm về 0. Server chỉ phục vụ JSON API.
- Phía Backend (Frappe): Chạy Frappe theo mô hình K8S (Kubernetes), với cấu hình tự động co giãn số lượng `gunicorn workers`. Khi tới khung giờ sinh viên thi học kỳ tải tăng thì auto-scale tạo thêm pod xử lý CPU/RAM.
- Cân bằng tải dự phòng (Load-Balancer): Sử dụng `Nginx` chuyên dụng hoặc AWS ELB bọc phía ngoài.

### 4.3. Kiến trúc Event-Driven (Tương lai Xa)
- Nếu quy mô tới vài cụm trường học khác nhau, có thể tách một phần hệ thống học (LMS Core) với hệ thống Video streaming/AI Grading ra thành kiến trúc **Microservices**. Giao tiếp qua lại thông qua Webhook / Redis Queue / RabbitMQ nhằm tránh việc 1 module sập (VD: AI bị quá tải) kéo theo toàn trang Web không mở được.
