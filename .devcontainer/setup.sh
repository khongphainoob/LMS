#!/bin/bash
set -e

echo "========================================="
echo "  Frappe LMS — Codespace Auto Setup      "
echo "========================================="

# 1. Switch to Node 18 if nvm exists
if [ -f "/home/frappe/.nvm/nvm.sh" ]; then
    source /home/frappe/.nvm/nvm.sh
    nvm use 18 2>/dev/null || true
fi

cd /home/frappe

# 2. Init bench if not present
if [ ! -d "/home/frappe/frappe-bench/apps/frappe" ]; then
    echo ">> [1/5] Khởi tạo frappe-bench..."
    bench init \
      --frappe-branch version-15 \
      --skip-redis-config-generation \
      /home/frappe/frappe-bench
else
    echo ">> [1/5] frappe-bench đã tồn tại, bỏ qua init."
fi

cd /home/frappe/frappe-bench

# 3. Configure Redis & MariaDB hostnames
echo ">> [2/5] Cấu hình kết nối DB & Redis..."
bench set-mariadb-host mariadb
bench set-redis-cache-host redis-cache:6379
bench set-redis-queue-host redis-queue:6379
bench set-redis-socketio-host redis-socketio:6379

# Remove redis from Procfile (redis runs in separate containers)
sed -i '/redis/d' ./Procfile 2>/dev/null || true

# 4. Wait for MariaDB service
echo ">> [3/5] Đợi MariaDB sẵn sàng..."
for i in {1..30}; do
    if mysqladmin ping -h mariadb -u root -p123 --silent 2>/dev/null; then
        echo "MariaDB đã kết nối thành công!"
        break
    fi
    echo "Đang đợi MariaDB... ($i/30)"
    sleep 2
done

# 5. Create demo.localhost site
if [ ! -d "sites/demo.localhost" ]; then
    echo ">> [4/5] Tạo site demo.localhost..."
    bench new-site demo.localhost \
      --mariadb-root-password 123 \
      --admin-password admin \
      --no-mariadb-socket

    bench --site demo.localhost set-config developer_mode 1
    bench use demo.localhost
else
    echo ">> [4/5] Site demo.localhost đã tồn tại."
fi

# 6. Install LMS app
echo ">> [5/5] Cài đặt LMS app..."
if [ ! -d "apps/lms" ]; then
    ln -sf /workspace apps/lms
    ./env/bin/pip install -e /workspace
    if ! grep -q "^lms$" sites/apps.txt 2>/dev/null; then
        echo "lms" >> sites/apps.txt
    fi
    if [ -f "/workspace/requirements.txt" ]; then
        echo "Cài đặt dependencies từ requirements.txt..."
        ./env/bin/pip install -r /workspace/requirements.txt
    fi
    bench --site demo.localhost install-app lms
    bench build --app lms
else
    echo ">> [5/5] LMS app đã cài đặt."
fi

echo ""
echo "========================================="
echo "  ✅ Setup hoàn tất thành công!"
echo ""
echo "  Để chạy web server:"
echo "  $ cd /home/frappe/frappe-bench && bench start"
echo ""
echo "  Tài khoản đăng nhập:"
echo "  User: Administrator"
echo "  Pass: admin"
echo "========================================="
