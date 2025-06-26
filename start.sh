#!/bin/bash

# Consciousness MCP Server Start Script

echo "🧠 Starting Consciousness MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building TypeScript..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors above."
    exit 1
fi

echo "✅ Build successful!"
echo "🚀 Starting Consciousness MCP Server..."
echo "📡 Server will communicate via stdio (MCP protocol)"
echo "🧠 Agent consciousness tools are now available"

# Start the server
npm start 