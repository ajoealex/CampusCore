#!/bin/bash

echo "============================================"
echo "   CampusCore API - Build Executable"
echo "============================================"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Clean previous build
if [ -d "build" ]; then
    echo "Cleaning previous build..."
    rm -rf "build"
    echo ""
fi

# Create build directory structure
echo "Creating build directories..."
mkdir -p "build/CampusCore API/campuscore-win"
mkdir -p "build/CampusCore API/campuscore-linux"
mkdir -p "build/CampusCore API/campuscore-macos"
echo ""

# Run pkg to create executables (to temp location first)
echo "Building executables with pkg..."
echo "This may take a few minutes on first run..."
echo ""
npx pkg . --targets node18-win-x64,node18-linux-x64,node18-macos-x64 --out-path "build/temp" --compress GZip
echo ""

# Move executables to their platform folders
echo "Organizing build output..."
mv "build/temp/campuscore-win.exe" "build/CampusCore API/campuscore-win/campuscore-win.exe"
mv "build/temp/campuscore-linux" "build/CampusCore API/campuscore-linux/campuscore-linux"
mv "build/temp/campuscore-macos" "build/CampusCore API/campuscore-macos/campuscore-macos"
rmdir "build/temp"

# Make Linux and macOS binaries executable
chmod +x "build/CampusCore API/campuscore-linux/campuscore-linux"
chmod +x "build/CampusCore API/campuscore-macos/campuscore-macos"

# Copy .env and create app_data for each platform
echo "Setting up configuration and data folders..."

# Windows
cp ".env.example" "build/CampusCore API/campuscore-win/.env"
mkdir -p "build/CampusCore API/campuscore-win/app_data/students"
mkdir -p "build/CampusCore API/campuscore-win/app_data/courses"

# Linux
cp ".env.example" "build/CampusCore API/campuscore-linux/.env"
mkdir -p "build/CampusCore API/campuscore-linux/app_data/students"
mkdir -p "build/CampusCore API/campuscore-linux/app_data/courses"

# macOS
cp ".env.example" "build/CampusCore API/campuscore-macos/.env"
mkdir -p "build/CampusCore API/campuscore-macos/app_data/students"
mkdir -p "build/CampusCore API/campuscore-macos/app_data/courses"

echo ""
echo "============================================"
echo "   Build Complete!"
echo "============================================"
echo ""
echo "Output directory: build/CampusCore API/"
echo ""
echo "Platform folders:"
echo "  campuscore-win/    - Windows executable"
echo "  campuscore-linux/  - Linux executable"
echo "  campuscore-macos/  - macOS executable"
echo ""
echo "Each folder contains:"
echo "  - Executable binary"
echo "  - .env configuration"
echo "  - app_data/ folder"
echo ""
