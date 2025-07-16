#!/bin/sh
set -e

# Handle command line arguments
case "$1" in
    --version)
        # Extract version from package.json and display it
        VERSION=$(node -p "require('./package.json').version")
        echo "Consciousness MCP Server v$VERSION"
        exit 0
        ;;
    --help)
        echo "Consciousness MCP Server"
        echo ""
        echo "Usage:"
        echo "  docker run consciousness-mcp-server [OPTION]"
        echo ""
        echo "Options:"
        echo "  --version    Show version information"
        echo "  --help       Show this help message"
        echo ""
        echo "When run without options, starts the database setup process"
        echo "and keeps container ready for MCP connections."
        exit 0
        ;;
    -*)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac

echo "🚀 Starting Consciousness MCP Server..."

# Ensure data directory exists
mkdir -p /app/data

# Generate Prisma client
echo "📦 Generating Prisma client..."
npm run db:generate

# Apply database migrations (production-safe approach)
echo "🗄️ Setting up database schema..."
if [ ! -f "/app/data/consciousness.db" ]; then
    echo "   Creating new database..."
    npm run db:push
else
    echo "   Database exists, updating schema..."
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