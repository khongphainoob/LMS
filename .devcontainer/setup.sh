#!/bin/bash
set -e

echo "========================================"
echo "  Frappe LMS — Codespace Setup Script   "
echo "========================================"

# ── 1. Cài system dependencies ──────────────────────────────────────────────
echo "[1/6] Cài system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
  python3-dev python3-pip python3-venv \
  git curl wget \
  nodejs npm \
  wkhtmltopdf \
  libpango-1.0-0 libpangoft2-1.0-0 \
  redis-tools mariadb-client

# Cài Node 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - 2>/dev/null
sudo apt-get install -y nodejs

# Cài yarn
sudo npm install -g yarn --quiet

# Cài bench
sudo pip3 install frappe-bench --quiet

echo "[1/6] ✅ Done"

# ── 2. Init bench ────────────────────────────────────────────────────────────
echo "[2/6] Khởi tạo frappe-bench..."
cd /home/frappe

if [ ! -d "frappe-bench" ]; then
  bench init frappe-bench \
    --frappe-branch version-15 \
    --no-procfile \
    --no-backups \
    --skip-redis-config-generation
  echo "[2/6] ✅ Bench initialized"
else
  echo "[2/6] ✅ Bench already exists, skipping"
fi

cd frappe-bench

# ── 3. Config Redis & MariaDB (trỏ tới docker services) ─────────────────────
echo "[3/6] Cấu hình kết nối Redis & MariaDB..."

bench set-redis-cache-host redis:6379
bench set-redis-queue-host redis:6379
bench set-redis-socketio-host redis:6379

# Tạo common_site_config
cat > sites/common_site_config.json << 'EOF'
{
  "db_host": "mariadb",
  "db_port": 3306,
  "redis_cache": "redis://redis:6379",
  "redis_queue": "redis://redis:6379",
  "redis_socketio": "redis://redis:6379",
  "socketio_port": 9000,
  "webserver_port": 8000,
  "background_workers": 1,
  "serve_default_site": true,
  "frappe_user": "frappe"
}
EOF

echo "[3/6] ✅ Done"

# ── 4. Get LMS app ───────────────────────────────────────────────────────────
echo "[4/6] Thêm LMS app..."
REPO_URL=$(cd /workspace && git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REPO_URL" ]; then
  echo "[4/6] ⚠️  Không tìm được remote URL, copy trực tiếp từ workspace..."
  cp -r /workspace /home/frappe/frappe-bench/apps/lms
  cd /home/frappe/frappe-bench
  ./env/bin/pip install -e apps/lms --quiet
else
  echo "[4/6] Clone từ: $REPO_URL"
  bench get-app lms "$REPO_URL" --overwrite
fi

echo "[4/6] ✅ Done"

# ── 5. Tạo site ─────────────────────────────────────────────────────────────
echo "[5/6] Tạo demo site..."
cd /home/frappe/frappe-bench

# Đợi MariaDB sẵn sàng
echo "Đợi MariaDB..."
for i in {1..30}; do
  if mysqladmin ping -h mariadb -u root -proot --silent 2>/dev/null; then
    break
  fi
  sleep 2
done

bench new-site demo.localhost \
  --mariadb-root-password root \
  --admin-password admin \
  --no-mariadb-socket \
  2>/dev/null || echo "Site đã tồn tại"

bench --site demo.localhost install-app lms

echo "[5/6] ✅ Site created: demo.localhost"

# ── 6. Tạo Procfile để chạy ─────────────────────────────────────────────────
echo "[6/6] Cấu hình startup..."
cat > /home/frappe/frappe-bench/Procfile << 'EOF'
web: bench serve --port 8000
socketio: node apps/frappe/socketio.js
watch: bench watch
schedule: bench schedule
worker_short: bench worker --queue short,default
worker_long: bench worker --queue long
EOF

echo "[6/6] ✅ Done"

echo ""
echo "========================================"
echo "  ✅ Setup hoàn tất!"
echo ""
echo "  Chạy app:"
echo "  $ cd ~/frappe-bench && bench start"
echo ""
echo "  Truy cập: http://localhost:8000"
echo "  User: Administrator / Pass: admin"
echo "========================================"
