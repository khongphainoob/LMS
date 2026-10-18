#!/usr/bin/env bash
# Dựng và chạy Frappe LMS (code của repo này) cho môi trường demo.
# Chạy trong container `frappe` của docker/docker-compose.yml. Chạy lại nhiều lần an toàn:
# mỗi bước đặt một file đánh dấu và bị bỏ qua nếu đã xong.
set -Eeuo pipefail

SITE="${SITE_NAME:-lms.localhost}"
DATA_DIR="${DATA_DIR:-/home/frappe/data}"
BENCH_DIR="$DATA_DIR/frappe-bench"
APP_SRC="${APP_SRC:-/lms-src}"
STATE_DIR="$DATA_DIR/.state"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-123}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
FRAPPE_BRANCH="${FRAPPE_BRANCH:-version-15}"
NODE_VERSION="${NODE_VERSION:-22}"
START_BENCH="${START_BENCH:-1}"
RESYNC="${RESYNC:-0}"

# Không tải trình duyệt test của Cypress (hàng trăm MB, demo không cần)
export CYPRESS_INSTALL_BINARY=0
export UV_LINK_MODE=copy

log() { printf '\n>> %s\n' "$*"; }
on_error() {
  printf '\n!! Lỗi ở dòng %s của init.sh (lệnh: %s)\n' "$1" "$2" >&2
  printf '!! Xem docker/DEMO.md, mục "Xử lý lỗi". Chạy lại `docker compose up -d` sẽ tiếp tục từ bước dở.\n' >&2
}
trap 'on_error "$LINENO" "$BASH_COMMAND"' ERR

done_flag() { [ -f "$STATE_DIR/$1.done" ]; }
mark_done() { touch "$STATE_DIR/$1.done"; }

use_node() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  nvm use "$NODE_VERSION" >/dev/null
}

wait_for_mariadb() {
  log "Đợi MariaDB sẵn sàng..."
  for i in $(seq 1 60); do
    if mysqladmin ping -h mariadb -uroot -p"$DB_ROOT_PASSWORD" --skip-ssl --silent 2>/dev/null; then
      return 0
    fi
    sleep 3
  done
  echo "MariaDB không phản hồi sau 3 phút, hoặc DB_ROOT_PASSWORD sai so với lần chạy đầu." >&2
  return 1
}

# Client MariaDB trong image bench mới đòi TLS, còn server mariadb:10.8 không hỗ trợ TLS.
# Mạng nội bộ của compose không ra ngoài nên tắt TLS cho client là chấp nhận được.
configure_db_client() {
  printf '[client]\nskip-ssl\n' > "$HOME/.my.cnf"
}

# Phải chép thẳng vào apps/lms (không dùng symlink): frontend/src/socket.js import
# ../../../../sites/common_site_config.json nên chỉ build được khi app nằm đúng trong bench.
sync_app_source() {
  log "Chép code LMS vào bench (bỏ node_modules)..."
  mkdir -p "$BENCH_DIR/apps/lms"
  tar -C "$APP_SRC" --exclude=node_modules --exclude=frappe-bench --exclude=.venv \
    --exclude=lms/public/frontend/assets -cf - . | tar -C "$BENCH_DIR/apps/lms" -xf -
}

init_bench() {
  done_flag bench && return 0
  log "Tạo bench (Frappe $FRAPPE_BRANCH), vài phút..."
  rm -rf "$BENCH_DIR"
  bench init --frappe-branch "$FRAPPE_BRANCH" --python "$(command -v python3.12)" \
    --skip-redis-config-generation --skip-assets "$BENCH_DIR"
  cd "$BENCH_DIR"
  bench set-mariadb-host mariadb
  bench set-redis-cache-host redis://redis-cache:6379
  bench set-redis-queue-host redis://redis-queue:6379
  bench set-redis-socketio-host redis://redis-socketio:6379
  mark_done bench
}

# `bench serve` luôn bật Werkzeug debugger (có thể chạy mã từ xa); demo có link công khai
# nên chạy gunicorn thay thế. Static (/assets, /files) do nginx phục vụ, xem nginx-demo.conf.
patch_procfile() {
  cd "$BENCH_DIR"
  sed -i '/^redis_/d;/^watch:/d' Procfile
  sed -i 's|^web:.*|web: bash -c "cd sites \&\& exec ../env/bin/gunicorn -b 0.0.0.0:8000 -w 2 -t 120 --preload frappe.app:application"|' Procfile
}

create_site() {
  done_flag site && return 0
  cd "$BENCH_DIR"
  if [ -d "sites/$SITE" ]; then
    log "Site dở dang từ lần trước, xóa để tạo lại..."
    bench drop-site "$SITE" --force --no-backup --db-root-password "$DB_ROOT_PASSWORD" || rm -rf "sites/$SITE"
  fi
  if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD="$(python3 -c 'import secrets; print(secrets.token_urlsafe(12))')"
    echo "$ADMIN_PASSWORD" > "$DATA_DIR/admin_password.txt"
    chmod 600 "$DATA_DIR/admin_password.txt"
  fi
  log "Tạo site $SITE..."
  bench new-site "$SITE" --mariadb-root-password "$DB_ROOT_PASSWORD" \
    --admin-password "$ADMIN_PASSWORD" --mariadb-user-host-login-scope='%'
  bench use "$SITE"
  mark_done site
}

install_lms() {
  done_flag app && [ "$RESYNC" != "1" ] && return 0
  cd "$BENCH_DIR"
  [ -L apps/lms ] && rm -f apps/lms
  sync_app_source
  log "Cài LMS app (pip + yarn), vài phút..."
  uv pip install --quiet -e apps/lms --python env/bin/python
  sed -i -e '$a\' sites/apps.txt
  grep -qx lms sites/apps.txt || echo lms >> sites/apps.txt
  (cd apps/lms && yarn install --check-files)
  if ! bench --site "$SITE" list-apps | grep -q '^lms'; then
    bench --site "$SITE" install-app lms
  fi
  bench --site "$SITE" migrate
  rm -f "$STATE_DIR/build.done"
  mark_done app
}

build_assets() {
  done_flag build && return 0
  cd "$BENCH_DIR"
  log "Build assets và giao diện Vue (bench build gọi luôn yarn build của LMS), vài phút..."
  bench build
  bench --site "$SITE" clear-cache
  mark_done build
}

announce_when_ready() {
  until curl -fsS -H "Host: $SITE" http://127.0.0.1:8000/api/method/ping >/dev/null 2>&1; do sleep 5; done
  local pw="(đã đặt qua ADMIN_PASSWORD)"
  [ -f "$DATA_DIR/admin_password.txt" ] && pw="$(cat "$DATA_DIR/admin_password.txt")"
  printf '\n==============================================\n READY. Đăng nhập: Administrator / %s\n==============================================\n' "$pw"
}

main() {
  mkdir -p "$STATE_DIR"
  use_node
  [ -d "$APP_SRC/lms" ] || { echo "Không thấy code LMS ở $APP_SRC (mount ..:/lms-src bị thiếu?)" >&2; exit 1; }
  configure_db_client
  wait_for_mariadb
  init_bench
  patch_procfile
  create_site
  install_lms
  build_assets
  cd "$BENCH_DIR"
  if [ "$START_BENCH" = "1" ]; then
    announce_when_ready &
    exec bench start
  fi
}

main "$@"
