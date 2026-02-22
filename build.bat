@echo off
echo ============================================
echo    CampusCore API - Build Executable
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm is not installed or not in PATH.
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install dependencies.
        pause
        exit /b 1
    )
    echo.
)

:: Clean previous build
if exist "build" (
    echo Cleaning previous build...
    rmdir /s /q "build"
    echo.
)

:: Create build directory structure
echo Creating build directory...
mkdir "build\CampusCore API"
echo.

:: Run pkg to create executables
echo Building executables with pkg...
echo This may take a few minutes on first run as pkg downloads Node.js binaries...
echo.
call npx pkg . --targets node18-win-x64,node18-linux-x64,node18-macos-x64 --out-path "build\CampusCore API" --compress GZip

if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)

:: Copy .env.example as .env to the build folder
echo.
echo Copying configuration files...
copy ".env.example" "build\CampusCore API\.env"

:: Create app_data directories in build folder
mkdir "build\CampusCore API\app_data\students"
mkdir "build\CampusCore API\app_data\courses"

echo.
echo ============================================
echo    Build Complete!
echo ============================================
echo.
echo Output directory: build\CampusCore API\
echo.
echo Files created:
dir /b "build\CampusCore API"
echo.
echo To run the server:
echo   Windows: campuscore.exe
echo   Linux:   ./campuscore-linux
echo   macOS:   ./campuscore-macos
echo.
echo Make sure to configure the .env file before running.
echo.
pause
