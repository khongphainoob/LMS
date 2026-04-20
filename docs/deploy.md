# 🚀 Hướng Dẫn Deploy — Frappe LMS

> **Dành cho**: Sinh viên muốn deploy thử nghiệm  
> **Quy mô**: ~10 giáo viên, 4-5 lớp, ~100-150 học sinh  
> **Cập nhật**: 2026-04-05

---

## Mục lục

1. [Đánh giá mức độ sẵn sàng deploy](#1-đánh-giá-mức-độ-sẵn-sàng-deploy)
2. [So sánh các phương án deploy](#2-so-sánh-các-phương-án-deploy)
3. [Option A: Frappe Cloud (Managed Hosting)](#option-a-frappe-cloud)
4. [Option B: VPS giá rẻ (Self-hosted)](#option-b-vps-giá-rẻ)
5. [Option C: Oracle Cloud Free Tier](#option-c-oracle-cloud-free-tier)
6. [Quy trình deploy chi tiết](#3-quy-trình-deploy-chi-tiết)
7. [Sizing & Performance](#4-sizing--performance)
8. [Bảo mật cơ bản](#5-bảo-mật-cơ-bản)
9. [Backup & Recovery](#6-backup--recovery)
10. [Chi phí tổng hợp](#7-chi-phí-tổng-hợp)

---

## 1. Đánh giá mức độ sẵn sàng deploy

### ✅ Đã sẵn sàng

| Thành phần | Trạng thái | Ghi chú |
|---|---|---|
| Backend (Python/Frappe) | ✅ Hoạt động | API đầy đủ, CRUD courses/batches/quizzes |
| Frontend (Vue 3 + Vite) | ✅ Hoạt động | SPA với routing, responsive |
| Database Schema | ✅ Ổn định | MariaDB với Frappe ORM |
| Docker config | ✅ Có sẵn | `docker/production/` đã setup |
| CI/CD Pipeline | ✅ GitHub Actions | Test, lint, build đều có |
| PWA Support | ✅ Có | InstallPrompt component |

### ⚠️ Cần kiểm tra trước khi production

| Thành phần | Trạng thái | Hành động cần làm |
|---|---|---|
| SSL/HTTPS | ⚠️ Chưa config | Cần Let's Encrypt certificate |
| Email Service | ⚠️ Chưa config | Cần SMTP cho forgot password, notifications |
| Backup tự động | ⚠️ Script có, chưa schedule | Cần setup cron job |
| Rate Limiting | ⚠️ Chỉ có qua Frappe | OK cho quy mô nhỏ |
| Monitoring | ❌ Chưa có | Nên có basic uptime monitor |

### 📊 Kết luận

> **App ĐÃ SẴN SÀNG deploy** cho mục đích thử nghiệm / production nhỏ. Những thiếu sót đều là config/infrastructure, không phải code.

---

## 2. So sánh các phương án deploy

| Tiêu chí | 🅰️ Frappe Cloud | 🅱️ VPS (DigitalOcean/Vultr/Hetzner) | 🅲 Oracle Cloud Free |
|---|---|---|---|
| **Chi phí/tháng** | $25-50 | $5-12 | **$0** |
| **Khó khăn setup** | ⭐ Dễ nhất | ⭐⭐⭐ Trung bình | ⭐⭐⭐⭐ Khó nhất |
| **Quản lý** | Tự động hoàn toàn | Tự quản lý | Tự quản lý |
| **SSL** | Tự động | Tự cài (Let's Encrypt) | Tự cài |
| **Backup** | Tự động | Tự setup | Tự setup |
| **Uptime** | 99.9% SLA | Tùy nhà cung cấp | 99.9% SLA |
| **Custom domain** | ✅ | ✅ | ✅ |
| **Scale** | Dễ dàng | Phải tự làm | Giới hạn free tier |
| **Support** | Email support | Tự xử lý | Community |
| **RAM** | 2-4GB | 1-2GB | **24GB ARM** |
| **Storage** | 5-50GB | 25-50GB | **200GB** |

### 🎯 Khi nào nên dùng phương án nào?

#### 🅰️ Frappe Cloud — "Không muốn quản lý server"
- ✅ Không biết Linux/Docker
- ✅ Muốn deploy trong 10 phút
- ✅ Có budget $25-50/tháng
- ✅ Muốn auto backup, auto SSL, auto update
- ❌ Đắt nhất cho sinh viên

#### 🅱️ VPS giá rẻ — "Cân bằng giữa giá và convenience"
- ✅ Biết cơ bản Linux terminal
- ✅ Muốn full control
- ✅ Budget $5-12/tháng
- ✅ Nhiều tutorial online
- ❌ Phải tự quản lý security, backup

#### 🅲 Oracle Cloud Free — "Miễn phí hoàn toàn" ⭐ KHUYẾN NGHỊ
- ✅ **$0/tháng** — hoàn toàn miễn phí, không giới hạn thời gian
- ✅ ARM instance mạnh: 4 OCPU + 24GB RAM
- ✅ 200GB storage
- ✅ Đủ mạnh cho 150+ users
- ❌ Setup phức tạp hơn VPS
- ❌ Sign up có thể bị reject (dependent on region)

---

## Option A: Frappe Cloud

### Quy trình

1. **Đăng ký** tại [frappecloud.com](https://frappecloud.com)
2. **Tạo site mới** → chọn app "Frappe Learning (LMS)"
3. **Chọn plan** → $25/month (Basic)
4. **Kết nối domain** → Cấu hình DNS A record
5. **Done!** SSL tự động, backup tự động

### Chi phí ước tính

```
Frappe Cloud Basic:     $25/tháng
Domain (.com):          $12/năm ≈ $1/tháng
────────────────────────────────────────
Tổng:                   ~$26/tháng ≈ 650.000 VNĐ/tháng
```

---

## Option B: VPS giá rẻ

### Nhà cung cấp đề xuất

| Nhà cung cấp | Plan | RAM | CPU | Storage | Giá/tháng |
|---|---|---|---|---|---|
| **Hetzner** (EU) | CX22 | 4GB | 2 vCPU | 40GB | **€4.35** ≈ $5 |
| **Vultr** | Cloud Compute | 2GB | 1 vCPU | 50GB | $6 |
| **DigitalOcean** | Basic | 2GB | 1 vCPU | 50GB | $12 |
| **Contabo** (EU) | VPS S | 8GB | 4 vCPU | 200GB | $6.49 |

### Quy trình setup

```bash
# 1. Tạo VPS với Ubuntu 22.04

# 2. SSH vào server
ssh root@your_server_ip

# 3. Cài đặt bằng Easy Install Script (CÁCH DỄ NHẤT)
wget https://frappe.io/easy-install.py

python3 ./easy-install.py deploy \
    --project=lms_production \
    --email=your_email@example.com \
    --image=ghcr.io/frappe/lms \
    --version=stable \
    --app=lms \
    --sitename=lms.yourdomain.com

# 4. Cấu hình DNS
# Trỏ A record: lms.yourdomain.com → Server IP

# 5. SSL tự động bằng Let's Encrypt (easy-install đã lo)
```

### Chi phí ước tính (Hetzner)

```
VPS Hetzner CX22:       $5/tháng (€4.35)
Domain (.com):          $12/năm ≈ $1/tháng
────────────────────────────────────────
Tổng:                   ~$6/tháng ≈ 150.000 VNĐ/tháng
```

---

## Option C: Oracle Cloud Free Tier ⭐

### Tại sao khuyến nghị?

Oracle Cloud có **Always Free** tier (không hết hạn):
- **4 ARM OCPU** (tương đương 4 vCPU)
- **24 GB RAM** — cực kỳ mạnh!
- **200 GB Block Storage**
- **10TB Outbound Data**
- Đủ để chạy Frappe LMS + MariaDB + Redis cho 500+ users

### Quy trình setup

#### Bước 1: Đăng ký Oracle Cloud
1. Truy cập [cloud.oracle.com/free](https://cloud.oracle.com/free)
2. Đăng ký tài khoản (cần credit card để verify, **KHÔNG bị trừ tiền**)
3. Chọn region gần nhất (ap-singapore-1 hoặc ap-seoul-1)

#### Bước 2: Tạo ARM Instance
```
Compute → Create Instance
- Image: Ubuntu 22.04
- Shape: VM.Standard.A1.Flex (ARM)
- OCPU: 4
- Memory: 24 GB
- Boot volume: 100 GB
- Thêm Block volume: 100 GB
```

#### Bước 3: Cấu hình Security List
```
Mở ports:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 8000 (Frappe dev - optional)
```

#### Bước 4: SSH và cài đặt

```bash
# SSH vào instance
ssh -i ~/oracle_key ubuntu@your_public_ip

# Update system
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Logout và login lại
exit
ssh -i ~/oracle_key ubuntu@your_public_ip

# Deploy Frappe LMS bằng Easy Install
wget https://frappe.io/easy-install.py

python3 ./easy-install.py deploy \
    --project=lms_prod \
    --email=your_email@example.com \
    --image=ghcr.io/frappe/lms \
    --version=stable \
    --app=lms \
    --sitename=lms.yourdomain.com
```

#### Bước 5: Domain & SSL
```bash
# 1. Mua domain rẻ tại Namecheap (~$8/năm cho .xyz hoặc .site)
# 2. Trỏ A record → Oracle Public IP
# 3. SSL đã được easy-install setup tự động
```

### Chi phí Oracle Cloud

```
Oracle Free Tier:       $0/tháng (MIỄN PHÍ VĨNH VIỄN)
Domain (.xyz):          $3/năm ≈ $0.25/tháng
────────────────────────────────────────
Tổng:                   ~$0.25/tháng ≈ 6.000 VNĐ/tháng 🎉
```

---

## 3. Quy trình Deploy Chi Tiết

### Flowchart tổng quát

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Code trên   │───→│  Push lên    │───→│  CI/CD chạy  │
│  Local Dev   │    │  GitHub      │    │  Tests/Lint   │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Users truy  │←───│  SSL/Domain  │←───│  Deploy lên  │
│  cập LMS     │    │  config      │    │  Server/VPS  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Cập nhật khi có code mới

```bash
# Nếu dùng Easy Install / Docker:
cd ~/lms_prod
docker-compose pull
docker-compose up -d

# Nếu dùng Frappe Bench trực tiếp:
cd ~/frappe-bench
bench pull          # Kéo code mới
bench migrate       # Update database
bench build         # Build frontend
bench restart       # Restart services
```

---

## 4. Sizing & Performance

### Ước tính cho quy mô 10 GV + 4-5 lớp

```
Users đồng thời tối đa:  ~30-50 (giờ cao điểm)
Total users:              ~150-200
Courses:                  ~20
Quizzes:                  ~50
Database size:            ~500MB - 2GB
File uploads:             ~5-10GB
```

### Cấu hình tối thiểu

| Tài nguyên | Tối thiểu | Khuyến nghị |
|---|---|---|
| **CPU** | 1 vCPU | 2+ vCPU |
| **RAM** | 2 GB | 4 GB |
| **Storage** | 20 GB | 50+ GB |
| **Bandwidth** | 1 TB/tháng | 2+ TB/tháng |

### Với Oracle Free Tier (24GB RAM):

```
MariaDB:            ~2GB RAM
Redis (3 instances): ~512MB
Frappe/Gunicorn:    ~2GB RAM (2 workers)
Nginx:              ~128MB
OS:                 ~512MB
────────────────────────────────────
Tổng sử dụng:       ~5GB / 24GB có sẵn
→ CÒN DƯ RẤT NHIỀU cho scale lên 500+ users
```

---

## 5. Bảo mật Cơ bản

### Checklist trước khi cho user dùng thử

- [ ] **Đổi admin password** — Không dùng default `admin`
- [ ] **Enable HTTPS** — Bắt buộc, dùng Let's Encrypt (miễn phí)
- [ ] **Firewall** — Chỉ mở port 22, 80, 443
- [ ] **SSH Key** — Không dùng password authentication
- [ ] **Tắt Developer Mode** — `DEVELOPER_MODE=0` trong production
- [ ] **Database password mạnh** — Ít nhất 16 ký tự
- [ ] **Regular updates** — `sudo apt update && sudo apt upgrade`
- [ ] **Fail2ban** — Chống brute force SSH

```bash
# Cài fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# Cài UFW firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 6. Backup & Recovery

### Backup thủ công

```bash
# Backup database + files
bench --site lms.yourdomain.com backup --with-files

# File backup ở: ~/frappe-bench/sites/lms.yourdomain.com/private/backups/
```

### Backup tự động (Crontab)

```bash
# Thêm vào crontab (mỗi ngày lúc 2h sáng)
crontab -e

# Thêm dòng:
0 2 * * * cd /home/frappe/frappe-bench && bench --site lms.yourdomain.com backup --with-files >> /var/log/lms-backup.log 2>&1
```

### Recovery

```bash
# Restore từ backup
bench --site lms.yourdomain.com restore \
  ~/frappe-bench/sites/lms.yourdomain.com/private/backups/BACKUP_FILE.sql.gz
```

---

## 7. Chi phí Tổng hợp

### So sánh chi phí hàng tháng

```
┌─────────────────────┬────────────┬───────────────┐
│ Phương án           │ USD/tháng │   VNĐ/tháng   │
├─────────────────────┼────────────┼───────────────┤
│ 🅲 Oracle Free      │    $0.25   │     6.000     │  ⭐ SINH VIÊN
│ 🅱️ VPS Hetzner      │    $6      │   150.000     │  
│ 🅱️ VPS DigitalOcean │    $13     │   325.000     │  
│ 🅰️ Frappe Cloud     │    $26     │   650.000     │  
└─────────────────────┴────────────┴───────────────┘
                                   (Domain đã bao gồm)
```

### Chi phí hàng năm

```
🅲 Oracle Free:    ~$3/năm     ≈    75.000 VNĐ   (chỉ domain)
🅱️ VPS Hetzner:    ~$72/năm    ≈ 1.800.000 VNĐ
🅰️ Frappe Cloud:   ~$312/năm   ≈ 7.800.000 VNĐ
```

---

## 📍 Khuyến nghị cuối cùng cho sinh viên

> **Dùng Option C (Oracle Cloud Free Tier)** nếu bạn muốn chi phí thấp nhất và sẵn sàng học thêm về Linux/Docker. Server mạnh hơn nhiều so với VPS trả phí $10/tháng.

> **Dùng Option B (VPS Hetzner)** nếu Oracle Free không đăng ký được hoặc muốn đơn giản hơn. $5/tháng là rất rẻ.

> **Dùng Option A (Frappe Cloud)** chỉ khi bạn hoàn toàn không muốn quản lý server và không ngại chi $25+/tháng.

### Quick Start (5 bước)

1. 📝 Đăng ký Oracle Cloud Free / hoặc mua VPS $5
2. 🔧 SSH vào server, cài Docker
3. 🚀 Chạy `easy-install.py` (1 lệnh duy nhất)
4. 🌐 Trỏ domain → server IP
5. ✅ Truy cập `https://lms.yourdomain.com` — Done!

---

*Hướng dẫn này được viết cho sinh viên mới bắt đầu. Nếu cần hỗ trợ thêm, hãy tham khảo [Frappe Documentation](https://docs.frappe.io) hoặc [Frappe Forum](https://discuss.frappe.io).*
