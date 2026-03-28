#!/bin/bash

ENV=${1:-dev}

echo "📦 Installing dependencies for $ENV environment..."

# Backend dependencies
echo "🐍 Installing Python dependencies..."
REQ_FILE="requirements/dev.txt"
if [ "$ENV" == "prod" ] || [ "$ENV" == "production" ]; then
    REQ_FILE="requirements/prod.txt"
elif [ "$ENV" == "test" ]; then
    REQ_FILE="requirements/test.txt"
fi

if [ -f "$REQ_FILE" ]; then
    pip install -r "$REQ_FILE"
else
    echo "⚠️  Warning: $REQ_FILE not found, falling back to base.txt"
    pip install -r requirements/base.txt
fi

# Frontend dependencies
echo "📦 Installing Node dependencies..."
cd frontend
yarn install --frozen-lockfile

if [ "$ENV" == "prod" ]; then
    echo "🔨 Building frontend for production..."
    yarn build
fi

cd ..

echo "✅ Dependencies installed successfully!"
