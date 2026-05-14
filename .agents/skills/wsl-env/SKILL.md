# WSL Environment Skill

> Quy tắc bắt buộc khi làm việc với codebase trên WSL từ Windows.

---

## ⚡ Quy tắc #1 — Sử dụng đúng Path

### Path mapping

| Path | Trỏ tới | Dùng cho |
|---|---|---|
| `//wsl.localhost/Ubuntu/home/huyhoang/...` | ✅ WSL filesystem thật | **File edit tools** (`view_file`, `replace_file_content`, `write_to_file`) |
| `\\wsl.localhost\Ubuntu\home\huyhoang\...` | ✅ Giống trên (UNC format) | Windows Explorer, user mở file |
| `/Ubuntu/home/huyhoang/...` | ❌ **BẢN COPY RIÊNG** — không phải WSL filesystem | **KHÔNG DÙNG** |
| `/home/huyhoang/...` | ✅ Path bên trong WSL | Dùng trong `wsl -d Ubuntu -e bash -c "..."` |

### Quy tắc bắt buộc

1. **LUÔN dùng `//wsl.localhost/Ubuntu/...`** khi gọi `view_file`, `replace_file_content`, `write_to_file`, `multi_replace_file_content`.
2. **KHÔNG BAO GIỜ dùng `/Ubuntu/home/...`** — path này trỏ tới một bản copy tách biệt, edit sẽ KHÔNG ảnh hưởng tới server.
3. Khi chạy command qua `wsl -d Ubuntu -e bash -c "..."`, dùng path Linux `/home/huyhoang/...`.

### Ví dụ đúng

```
# Đọc file
view_file("//wsl.localhost/Ubuntu/home/huyhoang/frappe-bench/apps/lms/lms/lms/agents/chatbot/nodes/context.py")

# Edit file
replace_file_content(TargetFile="//wsl.localhost/Ubuntu/home/huyhoang/frappe-bench/apps/lms/...")

# Chạy command trong WSL
wsl -d Ubuntu -e bash -c "cat /home/huyhoang/frappe-bench/apps/lms/..."
```

### Ví dụ SAI ❌

```
# SAI — trỏ tới bản copy, không phải WSL filesystem
view_file("/Ubuntu/home/huyhoang/frappe-bench/apps/lms/...")
replace_file_content(TargetFile="/Ubuntu/home/huyhoang/...")
```

---

## ⚡ Quy tắc #2 — Chạy command trong WSL

### PowerShell escaping

PowerShell sẽ phá hỏng các ký tự đặc biệt (`$`, `()`, `"`, backtick) khi pass qua `wsl -d Ubuntu -e bash -c "..."`.

**Giải pháp khi cần ghi file phức tạp:**
1. Dùng **base64 encode** qua Python:
   ```
   wsl -d Ubuntu -e bash -c "python3 -c 'import base64,sys; sys.stdout.buffer.write(base64.b64decode(sys.argv[1]))' '<base64_content>' > /path/to/file"
   ```
2. Hoặc dùng **file edit tools** với path `//wsl.localhost/Ubuntu/...` (recommended).

### Lưu ý quan trọng
- `2>/dev/null` sẽ bị PowerShell parse thành `C:\dev\null` → Phải wrap trong `bash -c "..."`.
- Path với `*` hoặc glob patterns cũng bị PowerShell expand → Wrap trong bash.

---

## ⚡ Quy tắc #3 — Restart Server

1. Sau khi edit code Python backend, **luôn nhắc user restart `bench start`**.
2. Đặc biệt khi thay đổi:
   - Module-level singletons (vd: `chatbot_graph = build_chatbot_graph()`)
   - `@tool` decorated functions (Pydantic schema bị freeze lúc import)
   - `__init__.py` files
3. Nhắc user chạy: `Ctrl+C` rồi `bench start` trong terminal WSL.
4. Nếu nghi `.pyc` cache cũ:
   ```
   wsl -d Ubuntu -e bash -c "find /home/huyhoang/frappe-bench/apps/lms -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null"
   ```

---

## ⚡ Quy tắc #4 — Không CP / Không mount ảo

1. **TUYỆT ĐỐI KHÔNG** dùng `wsl cp` để copy file giữa Windows và WSL.
2. **KHÔNG** dùng thư mục `/mnt/c/Ubuntu/...` — đây là Windows filesystem, không phải WSL.
3. Nếu phát hiện file edit không có hiệu lực → kiểm tra lại path, đảm bảo đang dùng `//wsl.localhost/Ubuntu/...`.

---

## Workspace Context

```
Bench root:     /home/huyhoang/frappe-bench/
LMS app:        /home/huyhoang/frappe-bench/apps/lms/
Python env:     /home/huyhoang/frappe-bench/env/
Site:           lms.localhost (hoặc lms.local)
WSL Distro:     Ubuntu
```
