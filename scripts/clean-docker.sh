#!/bin/bash
set -e

echo "🧹 Cleaning Docker environment..."

echo "Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

echo "Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || true

echo "Removing all images..."
docker rmi $(docker images -q) 2>/dev/null || true

echo "Removing all volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null || true

echo "Removing all networks..."
docker network prune -f

echo "System prune..."
docker system prune -af

echo "✅ Docker environment cleaned!"
