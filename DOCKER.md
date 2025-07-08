# Docker Deployment Guide

## Migration Strategy

### 🔄 Automatic Schema Management
The production container automatically handles database schema via `entrypoint.sh`:

- ✅ **New deployments**: Creates database with current schema
- ✅ **Updates**: Updates schema to match current Prisma schema  
- ✅ **Development-friendly**: Uses `prisma db push` for rapid iteration

> **Note**: Currently using `prisma db push` for schema management. Migration-based approach (`prisma migrate deploy`) encountered issues during testing and will be implemented in future versions.

### 🚀 Deployment Options

#### 1. Standard Deployment
```bash
# Start production container
docker-compose up -d consciousness-mcp-server

# View logs
docker logs consciousness-mcp-server
```

#### 2. Development Environment  
```bash
# Start dev container with live reload
docker-compose --profile dev up consciousness-mcp-dev
```

#### 3. Manual Upgrade (Recommended)
```bash
# Full upgrade with backup and safety checks
./docker-upgrade.sh

# Other options:
./docker-upgrade.sh backup-only
./docker-upgrade.sh check-migrations  
./docker-upgrade.sh force-migrate
```

### 📦 Schema Management Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run db:push` | Sync schema to database | Current approach |
| `npm run db:migrate:deploy` | Apply pending migrations | Future implementation |
| `npm run db:migrate:dev` | Create new migration | Development |
| `npm run db:migrate:reset` | Reset database | Development only |

### 🛡️ Production Safety

#### ✅ What's Safe:
- `docker-compose up -d` - Applies schema updates automatically
- `./docker-upgrade.sh` - Full upgrade with backup
- `prisma db push` - Current schema sync method

#### ⚠️ What's Dangerous:
- `prisma migrate reset` - Destroys all data
- Manual schema editing - Can cause conflicts
- Stopping container during schema updates

### 🗄️ Database Persistence

The database is persisted via Docker volume:
```yaml
volumes:
  - ./data:/app/data  # Maps local ./data to container /app/data
```

Your database file: `./data/consciousness.db`

### 🔧 Troubleshooting

#### Schema Issues
```bash
# Check current schema status
docker exec consciousness-mcp-server npx prisma db push --preview-feature

# Force schema sync
docker exec consciousness-mcp-server npm run db:push
```

#### Container Issues
```bash
# Rebuild container
docker-compose build consciousness-mcp-server

# Force recreate
docker-compose up -d --force-recreate consciousness-mcp-server
```

### 📋 Upgrade Checklist

1. ✅ Backup database: `./docker-upgrade.sh backup-only`
2. ✅ Stop container: `docker-compose down`
3. ✅ Pull latest code: `git pull`
4. ✅ Rebuild: `docker-compose build`
5. ✅ Start: `docker-compose up -d`
6. ✅ Verify: `docker logs consciousness-mcp-server`

Or simply: `./docker-upgrade.sh` (does all of the above)

### 🎯 Best Practices

- **Always backup** before major updates
- **Use the upgrade script** for production changes
- **Test schema changes** in development first
- **Monitor logs** after deployments
- **Keep schema in version control** via Prisma files

### 🚧 Future Improvements

- **Migration-based deployment**: Will implement `prisma migrate deploy` once container environment issues are resolved
- **Automated rollback**: Enhanced upgrade script with automatic rollback on failure
- **Health checks**: More comprehensive container health monitoring 