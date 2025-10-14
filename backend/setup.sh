#!/bin/bash

# Quizzo Backend Setup Script
# This script will set up and start your backend server

echo "🎯 Starting Quizzo Backend Setup..."
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "Run: cd backend"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  NOTE: Email configuration is optional for development"
    echo "   OTP codes will be shown in the console"
    echo ""
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Starting backend server..."
echo "   Your MongoDB is already configured!"
echo ""
echo "   Server will run on: http://localhost:3000"
echo "   API endpoint: http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev