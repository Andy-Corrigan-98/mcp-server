#!/bin/bash
set -e

echo "🔄 Consciousness MCP Server Upgrade Script"
echo "==========================================="

# Function to check if container is running
check_container() {
    if docker ps --format 'table {{.Names}}' | grep -q "consciousness-mcp-server"; then
        return 0
    else
        return 1
    fi
}

# Function to backup database
backup_database() {
    echo "📦 Creating database backup..."
    BACKUP_DIR="./backups"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    
    mkdir -p $BACKUP_DIR
    
    if [ -f "./data/consciousness.db" ]; then
        cp "./data/consciousness.db" "$BACKUP_DIR/consciousness_backup_$TIMESTAMP.db"
        echo "   ✅ Database backed up to: $BACKUP_DIR/consciousness_backup_$TIMESTAMP.db"
    else
        echo "   ⚠️  No existing database found to backup"
    fi
}

# Function to stop container
stop_container() {
    if check_container; then
        echo "🛑 Stopping existing container..."
        docker-compose down consciousness-mcp-server
        echo "   ✅ Container stopped"
    else
        echo "ℹ️  No running container to stop"
    fi
}

# Function to rebuild and start
rebuild_and_start() {
    echo "🔨 Rebuilding container with latest changes..."
    docker-compose build consciousness-mcp-server
    
    echo "🚀 Starting updated container..."
    docker-compose up -d consciousness-mcp-server
    
    echo "⏳ Waiting for container to be ready..."
    sleep 5
    
    if check_container; then
        echo "   ✅ Container started successfully"
    else
        echo "   ❌ Container failed to start"
        exit 1
    fi
}

# Function to check migration status
check_migrations() {
    echo "🔍 Checking migration status..."
    docker exec consciousness-mcp-server npx prisma migrate status
}

# Function to force migration if needed
force_migrate() {
    echo "⚡ Applying any pending migrations..."
    docker exec consciousness-mcp-server npm run db:migrate:deploy
    echo "   ✅ Migrations applied"
}

# Main upgrade process
main() {
    echo "Starting upgrade process..."
    echo ""
    
    # Step 1: Backup
    backup_database
    echo ""
    
    # Step 2: Stop container
    stop_container
    echo ""
    
    # Step 3: Rebuild and start
    rebuild_and_start
    echo ""
    
    # Step 4: Check migrations
    check_migrations
    echo ""
    
    # Step 5: Force migrate if needed (this is handled by entrypoint.sh now)
    echo "📋 Migrations are handled automatically by entrypoint.sh"
    echo ""
    
    echo "🎉 Upgrade complete!"
    echo ""
    echo "📊 Container status:"
    docker ps --filter "name=consciousness-mcp-server" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "📝 To view logs: docker logs consciousness-mcp-server"
    echo "🔧 To access shell: docker exec -it consciousness-mcp-server sh"
}

# Parse command line arguments
case "${1:-upgrade}" in
    "upgrade")
        main
        ;;
    "backup-only")
        backup_database
        ;;
    "check-migrations")
        check_migrations
        ;;
    "force-migrate")
        force_migrate
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [upgrade|backup-only|check-migrations|force-migrate|help]"
        echo ""
        echo "Commands:"
        echo "  upgrade          - Full upgrade process (default)"
        echo "  backup-only      - Only backup the database"
        echo "  check-migrations - Check migration status"
        echo "  force-migrate    - Force apply pending migrations"
        echo "  help             - Show this help"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac 