#!/bin/bash

# Space Debris Risk Model - Development Startup Script
# This script provides additional development features

echo "🛰️  Space Debris Risk Model - Development Mode"
echo "=============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 &> /dev/null
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

echo "✅ All prerequisites met"

# Check if ports are available
if port_in_use 8000; then
    echo "⚠️  Port 8000 is already in use (API port)"
    echo "   You may need to stop the existing API server"
fi

if port_in_use 3000; then
    echo "⚠️  Port 3000 is already in use (Web port)"
    echo "   You may need to stop the existing web server"
fi

# Setup API
echo ""
echo "🐍 Setting up API backend..."
cd api

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate

# Check if requirements have changed
if [ requirements.txt -nt .venv/pyvenv.cfg ] 2>/dev/null; then
    echo "Requirements updated, reinstalling..."
    pip install -r requirements.txt
elif [ ! -f ".venv/pyvenv.cfg" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Load environment variables
if [ -f ".env" ]; then
    echo "Loading environment variables from .env file..."
    source .env
fi

export PYTHONPATH="${PYTHONPATH}:$(pwd)"

echo "✅ API backend ready"

# Setup Web Frontend
echo ""
echo "🌐 Setting up web frontend..."
cd ../web

# Install npm dependencies if needed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules/.package-lock.json ] 2>/dev/null; then
    echo "Installing npm dependencies..."
    npm install
fi

echo "✅ Web frontend ready"
echo ""
echo "🚀 Ready to start development servers!"
echo ""
echo "To start the servers:"
echo "  API:  cd api && ./startup.txt"
echo "  Web:  cd web/src && ./startup.txt"
echo ""
echo "Or run them in separate terminals for better log visibility"
echo ""
echo "📡 API will be at: http://localhost:8000"
echo "🌐 Web will be at: http://localhost:3000"
echo "📚 API docs at: http://localhost:8000/docs"