@echo off
REM BlocPol Backend Startup Script for Windows

echo Starting BlocPol Backend Server...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo Warning: .env file not found. Creating from env.example...
    copy env.example .env
    echo Please update the .env file with your configuration before running the server.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Start the server
echo Starting server...
if "%1"=="dev" (
    echo Running in development mode...
    npm run dev
) else (
    echo Running in production mode...
    npm start
)


