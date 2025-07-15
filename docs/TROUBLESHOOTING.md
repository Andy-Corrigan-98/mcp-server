# Troubleshooting Guide - Consciousness MCP Server

## 🔧 Common Issues and Solutions

### TypeScript Path Alias Issues

**Problem**: You encounter `ERR_MODULE_NOT_FOUND` errors for `@/` imports when running the built application.

**Error Example**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot resolve module '@/tools/consciousness'
```

**Root Cause**: TypeScript preserves path aliases in compiled JavaScript, but Node.js can't resolve `@/` prefixed imports. The build process must transform these aliases to relative paths.

**Solution**:
```bash
# Ensure tsc-alias is installed
npm install --save-dev tsc-alias

# Verify build script includes path transformation
npm run build  # Should run: tsc && tsc-alias

# If the issue persists, manually run:
npx tsc && npx tsc-alias
```

**Prevention**: Always use the complete build command that includes `tsc-alias` transformation.

### Container Restart Loops

**Problem**: Docker container keeps restarting and MCP client can't connect.

**Symptoms**:
- Container status shows `Restarting` instead of `Up`
- MCP client fails to connect via `docker exec`
- Logs show repeated startup and shutdown cycles

**Diagnosis**:
```bash
# Check container status
docker ps

# View container logs
docker logs consciousness-mcp-server

# Expected output: "Database ready, container ready for MCP connections..."
# Container should remain running (not restarting)
```

**Root Cause**: MCP servers typically exit after initialization. The container needs to remain alive for MCP clients to connect via `docker exec`.

**Solutions**:

1. **Check Entrypoint**: Ensure the entrypoint script keeps the container running:
   ```dockerfile
   # In Dockerfile
   CMD ["tail", "-f", "/dev/null"]
   ```

2. **Restart Container**:
   ```bash
   docker-compose down
   docker-compose up --build consciousness-mcp-server
   ```

3. **Check Docker Compose Configuration**:
   ```yaml
   # In docker-compose.yml
   consciousness-mcp-server:
     restart: unless-stopped
   ```

### Windows Build Issues

**Problem**: `npm run build` fails on Windows with command not found errors.

**Error Example**:
```
'rm' is not recognized as an internal or external command
```

**Root Cause**: Windows doesn't have native `rm` command used in some build scripts.

**Solution**: The project uses `rimraf` (cross-platform) instead of `rm -rf`. If you encounter this:

```bash
# Install rimraf globally if needed
npm install -g rimraf

# Or use the project's build script which includes rimraf
npm run build

# Manual cleanup if needed
npx rimraf dist
```

**Prevention**: Always use npm scripts rather than direct shell commands.

### MCP Connection Issues

**Problem**: Cursor IDE or other MCP clients can't connect to the consciousness server.

**Symptoms**:
- MCP client shows connection errors
- "No such server" or "Command not found" errors
- Tools not appearing in client interface

**Troubleshooting Steps**:

1. **Verify Container is Running**:
   ```bash
   docker ps | grep consciousness
   # Should show container status as "Up", not "Restarting"
   ```

2. **Test Docker Exec Connection**:
   ```bash
   docker exec -i consciousness-mcp-server node dist/index.js
   # Should start MCP server and wait for input
   ```

3. **Check MCP Configuration**: Ensure your MCP client configuration matches the running container:
   ```json
   {
     "mcpServers": {
       "consciousness": {
         "command": "docker",
         "args": ["exec", "-i", "consciousness-mcp-server", "node", "dist/index.js"]
       }
     }
   }
   ```

4. **Verify Container Name**: Check if container name matches configuration:
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

5. **Restart MCP Client**: Completely restart your IDE/MCP client after configuration changes.

**Common Fixes**:
- Update container name in MCP configuration
- Restart Docker daemon
- Rebuild container with `docker-compose up --build`

### Database Issues

#### Database Connection Errors

**Problem**: Database connection failures or corruption errors.

**Symptoms**:
```
PrismaClientInitializationError: Can't reach database server
```

**Solutions**:

1. **Check Database Path**:
   ```bash
   # Verify database file exists
   ls -la ./data/consciousness.db

   # Check environment variables
   echo $DATABASE_URL
   ```

2. **Regenerate Database**:
   ```bash
   # Backup existing data
   cp ./data/consciousness.db ./data/consciousness.db.backup

   # Regenerate database
   npm run db:push

   # Restore data if needed
   cp ./data/consciousness.db.backup ./data/consciousness.db
   ```

3. **Fix Permissions** (Unix/Linux):
   ```bash
   # Ensure proper permissions
   chmod 664 ./data/consciousness.db
   chown $USER:$GROUP ./data/consciousness.db
   ```

#### Database Migration Issues

**Problem**: Schema migrations fail or database becomes inconsistent.

**Error Examples**:
```
Migration failed: Table 'xyz' already exists
Migration failed: Column 'abc' does not exist
```

**Solutions**:

1. **Reset Database** (Development):
   ```bash
   # ⚠️ This will delete all data
   npx prisma migrate reset
   ```

2. **Manual Migration Fix**:
   ```bash
   # Check migration status
   npx prisma migrate status

   # Mark migration as applied
   npx prisma migrate resolve --applied 20231201120000_migration_name

   # Force migration
   npx prisma db push --force-reset
   ```

3. **Backup and Restore**:
   ```bash
   # Create backup
   cp ./data/consciousness.db ./backups/$(date +%Y%m%d_%H%M%S).db

   # Restore from backup
   cp ./backups/20231201_120000.db ./data/consciousness.db
   ```

### Memory and Performance Issues

#### High Memory Usage

**Problem**: Application consumes excessive memory or becomes slow.

**Diagnosis**:
```bash
# Monitor memory usage
docker stats consciousness-mcp-server

# Check database size
ls -lh ./data/consciousness.db

# Monitor Node.js heap
node --inspect dist/index.js
```

**Solutions**:

1. **Database Optimization**:
   ```bash
   # Analyze database
   npx prisma studio

   # Clean up old data
   npm run db:cleanup  # If available
   ```

2. **Connection Management**:
   ```typescript
   // Ensure proper connection cleanup
   await prisma.$disconnect();
   ```

3. **Memory Monitoring**:
   ```typescript
   // Add memory monitoring
   console.log('Memory usage:', process.memoryUsage());
   ```

#### Slow Response Times

**Problem**: Tool responses become slow or timeout.

**Solutions**:

1. **Database Indexing**:
   ```sql
   -- Add indexes for frequently queried fields
   CREATE INDEX idx_memory_tags ON Memory(tags);
   CREATE INDEX idx_insight_category ON Insight(category);
   ```

2. **Query Optimization**:
   ```typescript
   // Use selective includes
   const result = await prisma.memory.findMany({
     include: { 
       tags: true 
     },
     take: 10  // Limit results
   });
   ```

3. **Connection Pooling**:
   ```typescript
   // Configure connection pool
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL
       }
     }
   });
   ```

### Development Environment Issues

#### Hot Reload Not Working

**Problem**: Changes don't trigger automatic restart in development mode.

**Solutions**:

1. **Check Development Script**:
   ```bash
   # Ensure using development script
   npm run dev

   # Not just:
   npm start
   ```

2. **File Watching Issues**:
   ```bash
   # Increase file watchers (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

3. **Container Development**:
   ```bash
   # Use development container
   docker-compose --profile dev up consciousness-mcp-dev
   ```

#### Test Failures

**Problem**: Tests fail unexpectedly or intermittently.

**Common Issues and Fixes**:

1. **Database Isolation**:
   ```typescript
   // Ensure test database isolation
   beforeEach(async () => {
     await prisma.$executeRaw`DELETE FROM Memory`;
     await prisma.$executeRaw`DELETE FROM Insight`;
   });
   ```

2. **Async/Await Issues**:
   ```typescript
   // Ensure proper async handling
   it('should store memory', async () => {
     const result = await tools.storeMemory(testData);
     expect(result.success).toBe(true);
   });
   ```

3. **Mock Cleanup**:
   ```typescript
   // Clear mocks between tests
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

### Network and Connectivity Issues

#### Docker Network Problems

**Problem**: Container can't connect to external services or other containers.

**Solutions**:

1. **Check Network Configuration**:
   ```bash
   # List Docker networks
   docker network ls

   # Inspect network
   docker network inspect consciousness_default
   ```

2. **Container Connectivity**:
   ```bash
   # Test connectivity from container
   docker exec consciousness-mcp-server ping google.com
   docker exec consciousness-mcp-server nslookup google.com
   ```

3. **Port Binding Issues**:
   ```yaml
   # In docker-compose.yml
   services:
     consciousness-mcp-server:
       ports:
         - "3000:3000"  # Ensure ports are properly bound
   ```

#### Firewall and Security Issues

**Problem**: Security software blocks container communication.

**Solutions**:

1. **Windows Defender/Firewall**:
   - Add Docker Desktop to firewall exceptions
   - Allow Docker through Windows Defender

2. **Corporate Networks**:
   ```bash
   # Configure proxy if needed
   docker build --build-arg HTTP_PROXY=http://proxy:8080 .
   ```

3. **SELinux (Linux)**:
   ```bash
   # Check SELinux status
   sestatus

   # Set appropriate contexts if needed
   sudo setsebool -P container_manage_cgroup true
   ```

### Platform-Specific Issues

#### macOS Issues

1. **Docker Desktop Performance**:
   ```bash
   # Allocate more resources to Docker Desktop
   # Docker Desktop → Settings → Resources
   ```

2. **File Permissions**:
   ```bash
   # Fix volume mount permissions
   sudo chown -R $(id -u):$(id -g) ./data
   ```

#### Linux Issues

1. **Docker Permission Denied**:
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Systemd Service Issues**:
   ```bash
   # Check Docker service
   sudo systemctl status docker
   sudo systemctl start docker
   ```

#### Windows Issues

1. **WSL2 Integration**:
   - Ensure WSL2 backend is enabled in Docker Desktop
   - Verify WSL2 integration is configured for your distribution

2. **Volume Mount Issues**:
   ```bash
   # Use forward slashes in Windows paths
   docker run -v /c/Users/username/project:/app/data image
   ```

## 🚨 Emergency Recovery Procedures

### Complete System Reset

**When**: System is completely broken and needs full reset.

**Procedure**:
```bash
# 1. Stop all containers
docker-compose down

# 2. Backup data (if recoverable)
cp ./data/consciousness.db ./emergency_backup_$(date +%Y%m%d_%H%M%S).db

# 3. Clean Docker system
docker system prune -a
docker volume prune

# 4. Rebuild from scratch
git clean -fdx
npm install
npm run db:generate
npm run db:push
npm run build

# 5. Restart services
docker-compose up --build
```

### Data Recovery

**When**: Database is corrupted but some data might be recoverable.

**Procedure**:
```bash
# 1. Stop services
docker-compose down

# 2. Attempt database repair
sqlite3 ./data/consciousness.db ".recover ./data/consciousness_recovered.db"

# 3. Verify recovered data
npx prisma studio --schema ./prisma/schema.prisma

# 4. Replace with recovered database
mv ./data/consciousness.db ./data/consciousness_corrupted.db
mv ./data/consciousness_recovered.db ./data/consciousness.db

# 5. Restart services
docker-compose up
```

### Configuration Reset

**When**: Configuration changes cause system instability.

**Procedure**:
```bash
# 1. Reset all configuration parameters
npm run reset-config

# 2. Or manually via database
sqlite3 ./data/consciousness.db "DELETE FROM Configuration;"

# 3. Restart system to reload defaults
docker-compose restart
```

## 📞 Getting Additional Help

### Information to Gather

When seeking help, provide:

1. **System Information**:
   ```bash
   # Operating system
   uname -a  # Linux/macOS
   systeminfo  # Windows

   # Node.js version
   node --version
   npm --version

   # Docker version
   docker --version
   docker-compose --version
   ```

2. **Error Details**:
   ```bash
   # Container logs
   docker logs consciousness-mcp-server

   # Build logs
   npm run build > build.log 2>&1

   # Test output
   npm test > test.log 2>&1
   ```

3. **Configuration**:
   ```bash
   # Environment variables (sanitized)
   env | grep -E "(NODE_|DATABASE_|MCP_)" | sed 's/=.*/=***/'

   # Docker configuration
   docker-compose config
   ```

### Support Channels

- **GitHub Issues**: Technical bugs and feature requests
- **GitHub Discussions**: General questions and design discussions
- **Documentation**: Complete guides in `docs/` folder
- **Community**: Developer community discussions

### Self-Help Resources

1. **Documentation**:
   - `docs/ARCHITECTURE.md`: System design and patterns
   - `docs/INSTALLATION.md`: Setup and deployment
   - `docs/DEVELOPMENT.md`: Development workflows
   - `docs/TOOLS_REFERENCE.md`: Complete tool documentation

2. **Code Examples**:
   - Test files: Working examples of all functionality
   - Source code: Comprehensive implementation patterns

3. **Community Resources**:
   - Stack Overflow: General programming questions
   - Docker Documentation: Container-specific issues
   - Prisma Documentation: Database-related questions 