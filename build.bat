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

:: Clean previous build if it exists
if exist "build" (
    echo Cleaning previous build...
    rmdir /s /q "build"
)
echo.

:: Create build directory structure
echo Creating build directories...
mkdir "build\CampusCore API\campuscore-win"
mkdir "build\CampusCore API\campuscore-linux"
mkdir "build\CampusCore API\campuscore-macos"
echo.

:: Run pkg to create executables (to temp location first)
echo Building executables with pkg...
echo This may take a few minutes on first run...
echo.
call npx pkg . --targets node18-win-x64,node18-linux-x64,node18-macos-x64 --out-path "build\temp" --compress GZip
echo.

:: Move executables to their platform folders
echo Organizing build output...
move "build\temp\campuscore-win.exe" "build\CampusCore API\campuscore-win\campuscore-win.exe" >nul
move "build\temp\campuscore-linux" "build\CampusCore API\campuscore-linux\campuscore-linux" >nul
move "build\temp\campuscore-macos" "build\CampusCore API\campuscore-macos\campuscore-macos" >nul
rmdir "build\temp"

:: Copy .env and create app_data for each platform
echo Setting up configuration and data folders...

:: Windows
copy ".env.example" "build\CampusCore API\campuscore-win\.env" >nul
mkdir "build\CampusCore API\campuscore-win\app_data\students" 2>nul
mkdir "build\CampusCore API\campuscore-win\app_data\courses" 2>nul

:: Linux
copy ".env.example" "build\CampusCore API\campuscore-linux\.env" >nul
mkdir "build\CampusCore API\campuscore-linux\app_data\students" 2>nul
mkdir "build\CampusCore API\campuscore-linux\app_data\courses" 2>nul

:: macOS
copy ".env.example" "build\CampusCore API\campuscore-macos\.env" >nul
mkdir "build\CampusCore API\campuscore-macos\app_data\students" 2>nul
mkdir "build\CampusCore API\campuscore-macos\app_data\courses" 2>nul

:: Create zip files for each platform
echo.
echo Creating zip archives...
powershell -Command "Compress-Archive -Path 'build\CampusCore API\campuscore-win\*' -DestinationPath 'build\CampusCore API\campuscore-win.zip' -Force"
powershell -Command "Compress-Archive -Path 'build\CampusCore API\campuscore-linux\*' -DestinationPath 'build\CampusCore API\campuscore-linux.zip' -Force"
powershell -Command "Compress-Archive -Path 'build\CampusCore API\campuscore-macos\*' -DestinationPath 'build\CampusCore API\campuscore-macos.zip' -Force"

echo.
echo ============================================
echo    Build Complete!
echo ============================================
echo.
echo Output directory: build\CampusCore API\
echo.
echo Platform folders:
echo   campuscore-win\      - Windows executable
echo   campuscore-linux\    - Linux executable
echo   campuscore-macos\    - macOS executable
echo.
echo Zip archives:
echo   campuscore-win.zip   - Windows distribution
echo   campuscore-linux.zip - Linux distribution
echo   campuscore-macos.zip - macOS distribution
echo.
echo Press any key to close...
pause >nul
