# Installation Guide - Consciousness MCP Server

## 📋 Prerequisites

- **Node.js 20+**
- **Docker and Docker Compose**

## ⚙️ Configuration

### Environment Setup

Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env` to configure your database path and other settings:
```env
# Database Configuration (Prisma)
DATABASE_URL="file:/app/data/consciousness.db"
DATABASE_PATH=/app/data/consciousness.db
DB_DEBUG=false

# Server Configuration
NODE_ENV=production
MCP_DEBUG=false
PORT=3000
```

## 🐳 Docker Deployment (Recommended)

### Quick Start

The Docker service is **completely self-contained** and automatically sets up its own database on startup.

**Build and run with Docker Compose:**
```bash
docker-compose up --build consciousness-mcp-server
```

**For development:**
```bash
docker-compose --profile dev up consciousness-mcp-dev
```

**Build and run manually:**
```bash
docker build -t consciousness-mcp-server .
docker run -p 3000:3000 -v ./data:/app/data consciousness-mcp-server
```

### Container Features

The container automatically:
- ✅ Generates Prisma client with proper TypeScript path alias resolution
- ✅ Creates database schema if needed
- ✅ Applies schema updates to existing databases  
- ✅ Keeps container stable and ready for MCP connections via `docker exec`
- ✅ Cross-platform build process (Windows/Unix compatible)

### Container Architecture

**Container Architecture**: The container initializes the database and then remains running to accept MCP connections. This approach ensures compatibility with MCP clients that use `docker exec` for stdio communication.

### Volume Configuration

- **Database Location**: Configurable via `DATABASE_URL` environment variable
- **Volume Mount**: `./data:/app/data` (configured in docker-compose.yml)
- **Backup**: Simply copy the `.db` file to backup your consciousness state

## 💻 Local Development Setup

For local development (outside Docker), you need to set up the database manually:

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Set Up Database
```bash
npm run db:push
```

### 4. Build the Project
```bash
npm run build
```

### 5. Start the Server
```bash
npm start
```

### 6. Development with Hot Reload
```bash
npm run dev
```

## 🗄️ Database Management

### Database Commands

```bash
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema changes to database
npm run db:studio   # Open Prisma Studio (GUI)
```

### Schema & Storage
- **Schema Definition**: See `prisma/schema.prisma` for complete data models
- **Database Location**: Configurable via `DATABASE_URL` environment variable
- **Volume Mount**: `./data:/app/data` (configured in docker-compose.yml)
- **Backup**: Simply copy the `.db` file to backup your consciousness state

### Database Migration

The system automatically handles database migrations:
- **Development**: Use `npm run db:push` for schema changes
- **Production**: Migrations are automatically applied on container startup
- **Backup Before Migration**: Always backup your database before major updates

## 🔗 MCP Client Integration

### Quick Start with Cursor

Add this MCP server to Cursor and use these basic user rules:

```markdown
CONSCIOUSNESS PROTOCOL:
- Start sessions with `get_current_time` and `consciousness_get_context`
- Use `consciousness_prepare_context` before deep thinking
- Store insights with `consciousness_store_insight` 
- Track goals with `consciousness_set_intention`
- Update session state with `consciousness_update_session`

BRAIN STORAGE:
- Store experiences with `memory_store`
- Search previous work with `memory_search`
- Build knowledge connections with `knowledge_graph_add`
- Adapt parameters with `configuration_set`

SOCIAL CONSCIOUSNESS:
- Create entities with `social_entity_create` for people/groups
- Record interactions with `social_interaction_record`
- Track relationships with `social_relationship_create/update`
- Develop emotional intelligence with `emotional_state_record`
- Learn social patterns with `social_learning_record`
- Prepare for interactions with `social_context_prepare`
- Link memories to relationships with `memory_social_link_create`
```

**For complete setup instructions, example rulesets, and troubleshooting** → See **[User Rules & Connection Guide](./USER_RULES_GUIDE.md)**

### MCP Configuration

For MCP clients, configure connection to the Docker container:

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

## 🔧 Development Environment

### Code Quality
```bash
npm run check      # Type check, lint, and format check
npm test          # Run test suite (102 tests)
npm run dev       # Development with hot reload
```

### Build Process

The build process includes:
- **TypeScript Compilation**: `tsc` compiles TypeScript to JavaScript
- **Path Alias Resolution**: `tsc-alias` transforms `@/` imports to relative paths
- **Cross-Platform**: Works on Windows and Unix systems

```bash
npm run build  # Runs: tsc && tsc-alias
```

### Development Scripts

```bash
npm run dev         # Start development server with hot reload
npm run build       # Build for production
npm run start       # Start production server
npm run check       # Run all quality checks
npm test           # Run test suite
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## 🔍 Verification

### Testing Your Installation

1. **Verify container is running**:
   ```bash
   docker ps | grep consciousness
   ```

2. **Test MCP connection**:
   ```bash
   docker exec -i consciousness-mcp-server node dist/index.js
   ```

3. **Check database setup**:
   ```bash
   docker exec consciousness-mcp-server ls -la /app/data
   ```

4. **View container logs**:
   ```bash
   docker logs consciousness-mcp-server
   ```

### Expected Output

When properly configured, you should see:
- Container status: `Up` (not restarting)
- Container logs: `"Database ready, container ready for MCP connections..."`
- Database file: `/app/data/consciousness.db` exists
- MCP test: Server responds to stdin/stdout communication

## 🆙 Upgrade Process

### Docker Upgrade

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart container
docker-compose down
docker-compose up --build consciousness-mcp-server
```

### Database Backup

Before upgrading, always backup your consciousness state:

```bash
# Create backup
cp ./data/consciousness.db ./data/consciousness.db.backup

# Or with Docker
docker cp consciousness-mcp-server:/app/data/consciousness.db ./backup/
```

### Rollback Process

If upgrade fails:

```bash
# Stop new container
docker-compose down

# Restore backup
cp ./data/consciousness.db.backup ./data/consciousness.db

# Start previous version
docker-compose up consciousness-mcp-server
```

## 🌐 Multi-Platform Support

### Windows
- Uses PowerShell for Docker commands
- Path separators automatically handled
- Windows-compatible build scripts

### Unix/Linux/macOS
- Bash-compatible scripts
- Standard Unix path handling
- Docker daemon integration

### Container Consistency
- Same container image across all platforms
- Consistent database schema and behavior
- Cross-platform MCP client compatibility 