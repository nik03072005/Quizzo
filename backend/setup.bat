@echo off
REM Quizzo Backend Setup Script for Windows
REM This script will set up and start your backend server

echo.
echo 🎯 Starting Quizzo Backend Setup...
echo.

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the backend directory
    echo Run: cd backend
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if .env exists
if not exist ".env" (
    echo.
    echo ⚙️  Creating .env file...
    copy .env.example .env
    echo ✅ .env file created
    echo.
    echo ⚠️  NOTE: Email configuration is optional for development
    echo    OTP codes will be shown in the console
    echo.
) else (
    echo ✅ .env file already exists
)

echo.
echo 🚀 Starting backend server...
echo    Your MongoDB is already configured!
echo.
echo    Server will run on: http://localhost:3000
echo    API endpoint: http://localhost:3000/api
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
call npm run dev