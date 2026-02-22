@echo off
echo ============================================
echo    CampusCore API - Install and Start
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

:: Display Node.js version
echo Node.js version:
node --version
echo.

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm is not installed or not in PATH.
    pause
    exit /b 1
)

:: Display npm version
echo npm version:
npm --version
echo.

:: Check if .env file exists, if not copy from .env.example
if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env file from .env.example...
        copy .env.example .env
        echo .env file created. You can modify it to change configuration.
        echo.
    ) else (
        echo WARNING: .env.example not found. Using default configuration.
    )
)

:: Install dependencies
echo Installing dependencies...
echo.
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)
echo.
echo Dependencies installed successfully.
echo.

:: Create app_data directories if they don't exist
if not exist "app_data\students" mkdir "app_data\students"
if not exist "app_data\courses" mkdir "app_data\courses"

:: Start the server
echo ============================================
echo    Starting CampusCore API Server...
echo ============================================
echo.
echo Press Ctrl+C to stop the server.
echo.
call npm start
