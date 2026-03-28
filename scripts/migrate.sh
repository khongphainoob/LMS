#!/bin/bash
set -e

echo "🗄️  Migrating database..."

ENV=${1:-dev}
SITE_NAME=${2:-lms.localhost}

if [ "$ENV" == "prod" ]; then
    CONTAINER="lms_frappe_prod"
elif [ "$ENV" == "staging" ]; then
    CONTAINER="lms_frappe_staging"
else
    CONTAINER="lms_frappe_dev"
fi

echo "📦 Running migrations on $SITE_NAME in $ENV environment..."

docker exec -it $CONTAINER bash -c "
    cd /home/frappe/frappe-bench &&
    bench --site $SITE_NAME migrate
"

echo "✅ Migration completed!"
