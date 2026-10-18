# Demo Frappe LMS bằng Docker (miễn phí, cho 1 người xem)

Dựng LMS **từ code của repo này** (không phải bản gốc của Frappe), gồm web, worker chấm bài (queue `long`), Socket.IO, MariaDB, Redis và Qdrant. Chỉ cần Docker.

## Chạy

```bash
git clone https://github.com/khongphainoob/LMS.git && cd LMS && git checkout feature/AI-Integration
cd docker
cp .env.example .env        # sửa DB_ROOT_PASSWORD; ADMIN_PASSWORD để trống cũng được
docker compose up -d
docker compose logs -f frappe
```

Lần đầu mất khoảng 10–20 phút (đo thực tế khoảng 9 phút trên máy 4 lõi, mạng tốt). Xong khi log hiện khung `READY. Đăng nhập: Administrator / <mật khẩu>`.
Mở http://localhost:8080/lms. Quên mật khẩu: `docker compose exec frappe cat /home/frappe/data/admin_password.txt`.

Chạy lại hoặc khởi động lại máy: `docker compose up -d`, vài chục giây là xong vì dữ liệu nằm trong volume.

## Cho thầy xem qua Internet

Cổng 8080 chỉ mở trên `127.0.0.1`. Có hai cách tạo link công khai:

- **Tunnel trong compose** (không cần tài khoản): `docker compose --profile tunnel up -d`, rồi `docker compose logs tunnel | grep trycloudflare` để lấy link `https://xxxx.trycloudflare.com`. Link đổi mỗi lần chạy lại tunnel.
- **GitHub Codespaces** (không cần máy riêng): vào repo trên GitHub → Code → Codespaces → Create (nhánh `feature/AI-Integration`). `.devcontainer` tự chạy compose này. Khi cổng 80 hiện ở tab Ports, đổi Visibility thành Public và gửi link. Codespace tự tắt khi không thao tác, nên giữ tab mở lúc demo.

Trước khi gửi link: đăng nhập, vào `LMS AI Settings` nhập API key Gemini, tạo khóa học và bài làm **giả**, chạy thử cả luồng nộp bài → chấm → xem điểm.

## Cập nhật code

Code được chép vào volume lúc cài, nên `git pull` chưa đổi gì cho đến khi chép lại:

```bash
git pull && RESYNC=1 docker compose up -d --force-recreate frappe
```

## Xóa sạch làm lại

```bash
docker compose down -v      # xóa cả dữ liệu
```

## Xử lý lỗi

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `429 Too Many Requests` khi kéo image | Docker Hub giới hạn người dùng ẩn danh | `docker login` (tài khoản Docker Hub miễn phí) rồi chạy lại |
| `error getting credentials ... docker-credential-desktop.exe: executable file not found` (WSL) | `~/.docker/config.json` trỏ tới helper của Docker Desktop mà WSL không thấy | Mở Docker Desktop và bật Settings → Resources → WSL integration cho distro đang dùng; hoặc nếu dùng Docker cài thẳng trong WSL thì xóa khóa `credsStore` khỏi file đó (xem lệnh bên dưới) |
| `bind: address already in use` | Cổng 8080 đang bị chiếm | Đổi `LMS_PORT` trong `.env` |
| Link ra `502 Bad Gateway` | App còn đang cài/khởi động | Đợi tới khi log hiện `READY` |
| `$'\r': command not found` | Windows đổi dòng sang CRLF | Compose đã tự bỏ `\r`; nếu vẫn lỗi: `git config core.autocrlf false` rồi clone lại |
| Log `!! Lỗi ở dòng N` | Một bước cài đặt thất bại | Đọc dòng lỗi ngay phía trên; `docker compose up -d` chạy lại sẽ tiếp tục từ bước dở |
| `Cannot resolve ... langchain-google-genai` hoặc `deepagents` | Xung đột phiên bản trong `pyproject.toml` | Đã sửa ở nhánh này (`langchain-google-genai>=4.2.1,<5.0`); nếu sửa lại thì giữ khớp với `deepagents` |
| Máy chậm, container bị kill (`Exited (137)`) | Hết RAM | Đo ở trạng thái chạy ổn định khoảng 2,7 GB, lúc build cao hơn; cần khoảng 6 GB RAM trống. Tăng RAM cho Docker Desktop/WSL (`.wslconfig`) |
| `Access denied for user root` | Đổi `DB_ROOT_PASSWORD` sau lần chạy đầu | Đặt lại mật khẩu cũ, hoặc `docker compose down -v` để làm lại |
| Chấm bài treo ở "đang chờ" | Worker không chạy | `docker compose logs frappe \| grep worker`; worker nằm trong tiến trình `bench start`, restart bằng `docker compose restart frappe` |
| Realtime (tiến độ chấm) không cập nhật | Socket.IO không qua được proxy | Mở qua cổng 8080 (hoặc link tunnel), đừng mở thẳng cổng 8000 |
| Link tunnel không ra | Mạng chặn `trycloudflare.com` | Thử mạng khác, hoặc dùng Codespaces |

## Ghi chú bảo mật

- Web chạy bằng gunicorn (không bật Werkzeug debugger) và chỉ nghe trên `127.0.0.1`.
- Mật khẩu Administrator mặc định là chuỗi ngẫu nhiên, không phải `admin`.
- Chỉ dùng dữ liệu giả. Free tier của Gemini có thể dùng nội dung gửi lên để cải thiện sản phẩm của Google.

Xóa `credsStore` trên WSL (có sao lưu trước):

```bash
cp ~/.docker/config.json ~/.docker/config.json.bak
python3 -c "import json,os; p=os.path.expanduser('~/.docker/config.json'); c=json.load(open(p)); c.pop('credsStore',None); json.dump(c,open(p,'w'),indent=2)"
```
