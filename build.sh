#!/bin/bash

echo "============================================"
echo "   CampusCore API - Build Executable"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies."
        exit 1
    fi
    echo ""
fi

# Clean previous build
if [ -d "build" ]; then
    echo "Cleaning previous build..."
    rm -rf "build"
    echo ""
fi

# Create build directory structure
echo "Creating build directory..."
mkdir -p "build/CampusCore API"
echo ""

# Run pkg to create executables
echo "Building executables with pkg..."
echo "This may take a few minutes on first run as pkg downloads Node.js binaries..."
echo ""
npx pkg . --targets node18-win-x64,node18-linux-x64,node18-macos-x64 --out-path "build/CampusCore API" --compress GZip

if [ $? -ne 0 ]; then
    echo "ERROR: Build failed."
    exit 1
fi

# Copy .env.example as .env to the build folder
echo ""
echo "Copying configuration files..."
cp ".env.example" "build/CampusCore API/.env"

# Create app_data directories in build folder
mkdir -p "build/CampusCore API/app_data/students"
mkdir -p "build/CampusCore API/app_data/courses"

# Make Linux and macOS binaries executable
chmod +x "build/CampusCore API/campuscore-linux" 2>/dev/null
chmod +x "build/CampusCore API/campuscore-macos" 2>/dev/null

echo ""
echo "============================================"
echo "   Build Complete!"
echo "============================================"
echo ""
echo "Output directory: build/CampusCore API/"
echo ""
echo "Files created:"
ls -la "build/CampusCore API/"
echo ""
echo "To run the server:"
echo "  Windows: campuscore.exe"
echo "  Linux:   ./campuscore-linux"
echo "  macOS:   ./campuscore-macos"
echo ""
echo "Make sure to configure the .env file before running."
echo ""
