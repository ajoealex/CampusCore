@echo off

echo ============================================
echo    CampusCore API - Build Executable
echo ============================================
echo.

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
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
echo This may take a few minutes on first run...
echo.
call npx pkg . --targets node18-win-x64,node18-linux-x64,node18-macos-x64 --out-path "build\CampusCore API" --compress GZip
echo.

:: Copy .env.example as .env to the build folder
echo Copying configuration files...
copy ".env.example" "build\CampusCore API\.env" >nul

:: Create app_data directories in build folder
mkdir "build\CampusCore API\app_data\students" 2>nul
mkdir "build\CampusCore API\app_data\courses" 2>nul

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
echo Press any key to close...
pause >nul
