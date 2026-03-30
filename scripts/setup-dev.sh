#!/bin/bash
set -e

echo "🚀 Setting up LMS Development Environment..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Navigate to docker/dev
cd "$(dirname "$0")/../docker/dev"

# Create .env if not exists
if [ ! -f .env.dev ]; then
    echo "📝 Using default .env.dev..."
fi

# Pull images
echo "📦 Pulling Docker images..."
docker-compose -f docker-compose.dev.yml pull

# Build custom images
echo "🔨 Building custom images..."
docker-compose -f docker-compose.dev.yml build

# Start services
echo "🎬 Starting services..."
docker-compose -f docker-compose.dev.yml up -d mariadb redis-cache redis-queue redis-socketio

# Wait for MariaDB
echo "⏳ Waiting for MariaDB..."
sleep 10

# Start Frappe
echo "🎯 Starting Frappe..."
docker-compose -f docker-compose.dev.yml up -d frappe

# Wait for site creation
echo "⏳ Waiting for site creation..."
sleep 30

# Start Frontend
echo "🎨 Starting Frontend..."
docker-compose -f docker-compose.dev.yml up -d frontend

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📍 Access points:"
echo "   - Backend:  http://localhost:8000"
echo "   - Frontend: http://localhost:8080"
echo "   - Username: Administrator"
echo "   - Password: admin"
echo ""
echo "📝 Useful commands:"
echo "   - View logs:    docker-compose -f docker-compose.dev.yml logs -f"
echo "   - Stop all:     docker-compose -f docker-compose.dev.yml down"
echo "   - Restart:      docker-compose -f docker-compose.dev.yml restart"
echo "   - Shell access: docker exec -it lms_frappe_dev bash"
echo ""
