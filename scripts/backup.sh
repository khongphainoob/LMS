#!/bin/bash
set -e

ENV=${1:-prod}
BACKUP_DIR="./docker/production/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "💾 Starting backup for $ENV environment..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "📦 Backing up database..."
docker exec lms_mariadb_${ENV} \
    mysqldump -u root -p${DB_ROOT_PASSWORD} \
    --all-databases \
    --single-transaction \
    --quick \
    --lock-tables=false \
    > ${BACKUP_DIR}/db_${ENV}_${TIMESTAMP}.sql

# Compress
gzip ${BACKUP_DIR}/db_${ENV}_${TIMESTAMP}.sql

# Files backup
echo "📁 Backing up files..."
docker run --rm \
    -v lms_frappe_sites_${ENV}:/source:ro \
    -v $(pwd)/${BACKUP_DIR}:/backup \
    alpine \
    tar czf /backup/files_${ENV}_${TIMESTAMP}.tar.gz -C /source .

# Cleanup old backups (keep last 30 days)
find ${BACKUP_DIR} -name "*_${ENV}_*" -mtime +30 -delete

echo "✅ Backup completed!"
echo "📦 Backup files:"
echo "   - ${BACKUP_DIR}/db_${ENV}_${TIMESTAMP}.sql.gz"
echo "   - ${BACKUP_DIR}/files_${ENV}_${TIMESTAMP}.tar.gz"
