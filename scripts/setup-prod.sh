#!/bin/bash
set -e

echo "🏭 Setting up LMS Production Environment..."

# Ensure we're in production mode
if [ "$ENV" != "production" ]; then
    echo "⚠️  Warning: ENV variable is not set to 'production'"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

cd "$(dirname "$0")/../docker/production"

# Check for .env.prod
if [ ! -f .env.prod ]; then
    echo "❌ .env.prod not found!"
    echo "Please create .env.prod from .env.prod.example"
    exit 1
fi

# Validate .env.prod
if grep -q "CHANGE_ME" .env.prod; then
    echo "❌ Please update all CHANGE_ME values in .env.prod"
    exit 1
fi

# Build production image
echo "🔨 Building production image..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start database first
echo "🗄️  Starting database..."
docker-compose -f docker-compose.prod.yml up -d mariadb

# Wait for database
echo "⏳ Waiting for database..."
sleep 20

# Start Redis
echo "📦 Starting Redis..."
docker-compose -f docker-compose.prod.yml up -d redis-cache redis-queue redis-socketio

# Start Frappe
echo "🚀 Starting Frappe..."
docker-compose -f docker-compose.prod.yml up -d frappe

# Wait for Frappe
sleep 30

# Start Nginx
echo "🌐 Starting Nginx..."
docker-compose -f docker-compose.prod.yml up -d nginx

echo ""
echo "✅ Production environment is running!"
echo ""
echo "🔒 Next steps:"
echo "   1. Setup SSL certificates"
echo "   2. Configure monitoring"
echo "   3. Test backups"
echo "   4. Setup alerts"
echo ""
