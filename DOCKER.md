# Docker Deployment Guide

## Migration Strategy

### 🔄 Automatic Migrations
The production container automatically handles database migrations via `entrypoint.sh`:

- ✅ **New deployments**: Creates database with all migrations applied
- ✅ **Updates**: Applies only pending migrations safely  
- ✅ **Production-safe**: Uses `prisma migrate deploy` (not `db:push`)

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

### 📦 Migration Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run db:migrate:deploy` | Apply pending migrations | Production |
| `npm run db:migrate:dev` | Create new migration | Development |
| `npm run db:migrate:reset` | Reset database | Development only |
| `npm run db:push` | Force schema sync | Development only |

### 🛡️ Production Safety

#### ✅ What's Safe:
- `docker-compose up -d` - Applies migrations automatically
- `./docker-upgrade.sh` - Full upgrade with backup
- `prisma migrate deploy` - Production migration command

#### ⚠️ What's Dangerous:
- `prisma db push` - Bypasses migration history, can lose data
- `prisma migrate reset` - Destroys all data
- Manual schema editing - Can cause migration conflicts

### 🗄️ Database Persistence

The database is persisted via Docker volume:
```yaml
volumes:
  - ./data:/app/data  # Maps local ./data to container /app/data
```

Your database file: `./data/consciousness.db`

### 🔧 Troubleshooting

#### Migration Conflicts
```bash
# Check migration status
docker exec consciousness-mcp-server npx prisma migrate status

# Reset and reapply (DESTRUCTIVE - dev only)
docker exec consciousness-mcp-server npm run db:migrate:reset
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
- **Test migrations** in development first
- **Monitor logs** after deployments
- **Keep migration files** in version control 