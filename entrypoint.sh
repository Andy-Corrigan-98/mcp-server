#!/bin/sh
set -e

echo "🚀 Starting Consciousness MCP Server..."

# Ensure data directory exists
mkdir -p /app/data

# Generate Prisma client
echo "📦 Generating Prisma client..."
npm run db:generate

# Set up database schema (creates tables if they don't exist, updates if needed)
echo "🗄️ Setting up database schema..."
if [ ! -f "/app/data/consciousness.db" ]; then
    echo "   Creating new database..."
    npm run db:push
else
    echo "   Database exists, applying schema updates..."
    npm run db:push
fi

# Start the main application
echo "✅ Database ready, starting MCP server..."
exec npm start 