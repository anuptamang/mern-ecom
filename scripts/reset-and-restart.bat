@echo off
REM Windows batch script for resetting database and restarting dev server

echo.
echo ========================================
echo  Reset Database and Restart Dev Server
echo ========================================
echo.

REM Step 1: Stop dev server
echo Step 1: Stopping dev server...

REM Kill processes on port 3000 (React)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
  echo   Killing process on port 3000 (PID: %%a)...
  taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 3010 (Server)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3010 ^| findstr LISTENING') do (
  echo   Killing process on port 3010 (PID: %%a)...
  taskkill /F /PID %%a >nul 2>&1
)

REM Kill nodemon processes
taskkill /F /IM nodemon.exe >nul 2>&1

REM Kill concurrently processes
taskkill /F /IM node.exe /FI "WINDOWTITLE eq concurrently*" >nul 2>&1

echo   ✓ Dev server stopped
echo.

REM Step 2: Run reset-and-seed script
echo Step 2: Resetting and seeding database...
cd server
if not exist "scripts\reset-and-seed.js" (
  echo   ✗ Error: reset-and-seed.js not found
  exit /b 1
)

node scripts\reset-and-seed.js
if errorlevel 1 (
  echo   ✗ Error: Database reset failed
  exit /b 1
)

echo   ✓ Database reset and seeded successfully
echo.

REM Step 3: Start dev server
echo Step 3: Starting dev server...
cd ..

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start dev server
start "Dev Server" cmd /k "npm run dev"

echo   ✓ Dev server started
echo.
echo ========================================
echo  ✓ All done! Dev server is running.
echo ========================================
echo.
