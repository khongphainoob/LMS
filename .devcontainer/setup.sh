#!/bin/bash
set -e

echo "========================================="
echo "  Frappe LMS — Codespace Auto Setup      "
echo "========================================="

BENCH_DIR="/workspace/frappe-bench"

# 1. Cài system dependencies
echo ">> [1/6] Cài dependencies..."
apt-get update -qq
apt-get install -y -qq \
  python3-dev python3-pip python3-venv \
  git curl wget \
  wkhtmltopdf \
  libpango-1.0-0 libpangoft2-1.0-0 \
  redis-tools mariadb-client \
  nodejs npm

# Cài Node 18 nếu chưa có
if ! node --version | grep -q "^v18"; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash - 2>/dev/null
  apt-get install -y nodejs
fi

npm install -g yarn --quiet 2>/dev/null || true
pip3 install frappe-bench --quiet
echo ">> [1/6] ✅ Done"

# 2. Init bench
echo ">> [2/6] Khởi tạo frappe-bench..."
if [ ! -d "$BENCH_DIR/apps/frappe" ]; then
  bench init \
    --frappe-branch version-15 \
    --skip-redis-config-generation \
    "$BENCH_DIR"
  echo ">> [2/6] ✅ Bench initialized"
else
  echo ">> [2/6] ✅ Bench đã tồn tại"
fi

cd "$BENCH_DIR"

# 3. Cấu hình Redis & MariaDB (trỏ tới docker services)
echo ">> [3/6] Cấu hình DB & Redis..."
bench set-mariadb-host mariadb
bench set-redis-cache-host redis-cache:6379
bench set-redis-queue-host redis-queue:6379
bench set-redis-socketio-host redis-socketio:6379
sed -i '/redis/d' ./Procfile 2>/dev/null || true
echo ">> [3/6] ✅ Done"

# 4. Đợi MariaDB
echo ">> [4/6] Đợi MariaDB sẵn sàng..."
for i in {1..30}; do
  if mysqladmin ping -h mariadb -u root -p123 --silent 2>/dev/null; then
    echo "MariaDB ready!"
    break
  fi
  echo "  Đang đợi... ($i/30)"
  sleep 2
done

# 5. Tạo site
if [ ! -d "$BENCH_DIR/sites/demo.localhost" ]; then
  echo ">> [5/6] Tạo site demo.localhost..."
  bench new-site demo.localhost \
    --mariadb-root-password 123 \
    --admin-password admin \
    --no-mariadb-socket
  bench --site demo.localhost set-config developer_mode 1
  bench use demo.localhost
else
  echo ">> [5/6] ✅ Site đã tồn tại"
fi

# 6. Cài LMS app
echo ">> [6/6] Cài LMS app..."
if [ ! -d "$BENCH_DIR/apps/lms" ]; then
  # Link workspace repo vào bench apps
  ln -sf /workspace "$BENCH_DIR/apps/lms"
  "$BENCH_DIR/env/bin/pip" install -e /workspace --quiet
  if [ -f "/workspace/requirements.txt" ]; then
    "$BENCH_DIR/env/bin/pip" install -r /workspace/requirements.txt --quiet
  fi
  bench --site demo.localhost install-app lms
  bench build --app lms 2>/dev/null || true
  echo ">> [6/6] ✅ LMS installed"
else
  echo ">> [6/6] ✅ LMS đã được cài"
fi

echo ""
echo "========================================="
echo "  ✅ Setup hoàn tất!"
echo ""
echo "  Chạy server:"
echo "  $ cd $BENCH_DIR && bench start"
echo ""
echo "  Đăng nhập: Administrator / admin"
echo "========================================="
