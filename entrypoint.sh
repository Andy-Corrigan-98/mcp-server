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

# Seed configuration defaults (only sets values that don't already exist)
echo "🌱 Seeding configuration defaults..."
npm run db:seed

# Database is ready, but don't start MCP server yet
# Cursor will start it via docker exec when needed
echo "✅ Database ready, container ready for MCP connections..."

# Keep container alive for docker exec commands
tail -f /dev/null 