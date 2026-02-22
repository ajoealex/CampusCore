#!/bin/bash

echo "============================================"
echo "   CampusCore API - Install and Start"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Display Node.js version
echo "Node.js version:"
node --version
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH."
    exit 1
fi

# Display npm version
echo "npm version:"
npm --version
echo ""

# Check if .env file exists, if not copy from .env.example
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env file from .env.example..."
        cp .env.example .env
        echo ".env file created. You can modify it to change configuration."
        echo ""
    else
        echo "WARNING: .env.example not found. Using default configuration."
    fi
fi

# Install dependencies
echo "Installing dependencies..."
echo ""
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies."
    exit 1
fi
echo ""
echo "Dependencies installed successfully."
echo ""

# Create app_data directories if they don't exist
mkdir -p app_data/students
mkdir -p app_data/courses

# Start the server
echo "============================================"
echo "   Starting CampusCore API Server..."
echo "============================================"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""
npm start
