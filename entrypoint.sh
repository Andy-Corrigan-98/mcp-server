#!/bin/sh
set -e

echo "🚀 Starting Consciousness MCP Server..."

# Ensure data directory exists
mkdir -p /app/data

# Generate Prisma client
echo "📦 Generating Prisma client..."
npm run db:generate

# Apply database migrations (production-safe approach)
echo "🗄️ Applying database migrations..."
if [ ! -f "/app/data/consciousness.db" ]; then
    echo "   Creating new database with migrations..."
    npm run db:migrate:deploy
else
    echo "   Database exists, applying pending migrations..."
    npm run db:migrate:deploy
fi

# Seed configuration defaults (only sets values that don't already exist)
echo "🌱 Seeding configuration defaults..."
npm run db:seed

# Database is ready, but don't start MCP server yet
# Cursor will start it via docker exec when needed
echo "✅ Database ready, container ready for MCP connections..."

# Keep container alive for docker exec commands
tail -f /dev/null 