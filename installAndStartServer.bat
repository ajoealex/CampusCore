@echo off

echo ============================================
echo    CampusCore API - Install and Start
echo ============================================
echo.

:: Check if .env file exists, if not copy from .env.example
echo Checking configuration...
if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env file from .env.example...
        copy .env.example .env >nul
        echo .env file created.
    )
) else (
    echo .env file found.
)
echo.

:: Install dependencies
echo Installing dependencies...
call npm install
echo.

:: Create app_data directories if they don't exist
echo Setting up data directories...
if not exist "app_data\students" mkdir "app_data\students"
if not exist "app_data\courses" mkdir "app_data\courses"
echo.

:: Start the server
echo ============================================
echo    Starting CampusCore API Server...
echo ============================================
echo.
echo Press Ctrl+C to stop the server.
echo.
call node src/server.js

:: If we get here, server stopped
echo.
echo Server stopped.
echo Press any key to close...
pause >nul
