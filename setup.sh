#!/bin/bash

echo "🚀 eBuy Backend Setup Script"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Node.js and PostgreSQL are installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create it with your database credentials."
    echo "📝 Example .env content:"
    echo "PORT=5000"
    echo "DB_HOST=localhost"
    echo "DB_PORT=5432"
    echo "DB_NAME=ebuy_db"
    echo "DB_USER=postgres"
    echo "DB_PASSWORD=your_password_here"
    echo "JWT_SECRET=your_very_secure_jwt_secret_key_here"
    echo "JWT_EXPIRES_IN=7d"
    echo "UPLOAD_PATH=uploads/"
    echo "MAX_FILE_SIZE=5242880"
    echo "NODE_ENV=development"
    echo "CORS_ORIGIN=http://localhost:3000"
    exit 1
fi

echo "✅ .env file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/profiles uploads/products uploads/misc

# Initialize database
echo "🗄️  Initializing database..."
read -p "Have you created the PostgreSQL database? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:init
    echo "✅ Database initialized successfully"
else
    echo "⚠️  Please create the PostgreSQL database first:"
    echo "   1. Connect to PostgreSQL: psql -U postgres"
    echo "   2. Create database: CREATE DATABASE ebuy_db;"
    echo "   3. Exit psql: \\q"
    echo "   4. Run this script again"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo "🚀 You can now start the development server with: npm run dev"
echo "🌐 Server will be available at: http://localhost:5000"
echo "📋 Health check endpoint: http://localhost:5000/health"
