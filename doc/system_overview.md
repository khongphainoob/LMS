# Hệ Thống LMS - Tổng Quan & Các Tùy Chỉnh

Tài liệu này mô tả các thay đổi và tính năng mới đã được triển khai trong hệ thống LMS, bao gồm tùy chỉnh giao diện (UI), cấu trúc cơ sở dữ liệu và cấu hình AI trong Admin.

## 1. Tùy Chỉnh Giao Diện (UI Customization)

Hệ thống đã được hiện đại hóa với các thay đổi sau:

- **Typography**: Chuyển đổi sang các font chữ hiện đại như **Inter** và **Outfit** để cải thiện khả năng đọc và thẩm mỹ chung.
- **Language Switcher (Bộ chuyển đổi ngôn ngữ)**: Tích hợp trình chuyển đổi ngôn ngữ (Tiếng Anh & Tiếng Việt) tại sidebar, cho phép người dùng thay đổi ngôn ngữ hiển thị một cách nhanh chóng.
- **Custom Sidebar & User Dropdown**: Tối ưu hóa thanh điều hướng bên và menu người dùng để nâng cao trải nghiệm người dùng (UX).
- **AIGrading Dashboard (Statistics)**: Thêm trang thống kê chuyên sâu cho tính năng Chấm điểm bằng AI, cung cấp cái nhìn tổng quan về kết quả và hiệu suất chấm điểm.

## 2. Thay Đổi Cơ Sở Dữ Liệu (Database Changes)

Các bảng (Doctypes) mới đã được thêm vào để hỗ trợ tính năng Chấm điểm bằng AI (AI Grading):

- **AI Grading Session**: Quản lý các phiên chấm điểm, bao gồm thông tin về môn học, cấp độ, khóa học và đợt học (batch).
- **AI Grading Member**: Quản lý danh sách người dùng tham gia vào phiên chấm điểm với các vai trò như Người chấm (Grader) hoặc Người xem (Viewer).
- **AI Grading Submission**: Lưu trữ các bài làm của học sinh, điểm số do AI chấm, phản hồi từ AI và giáo viên, cùng với các tệp đính kèm (hình ảnh bài làm).

## 3. Quản Trị & Cấu Hình AI (Admin & AI Config)

- **AI Configuration**: Hệ thống Admin đã được tùy chỉnh để thêm các mục cấu hình cho AI, cho phép quản trị viên thiết lập các tham số, API key và ghi chú cho quá trình chấm điểm tự động.
- **Permission Management**: Thiết lập phân quyền chi tiết cho các tính năng AI, đảm bảo chỉ những người dùng có vai trò phù hợp (System Manager, Moderator, Course Creator) mới có quyền tạo và quản lý phiên chấm điểm.

---
*Tài liệu này được cập nhật vào ngày 27/03/2026 bởi Antigravity.*
