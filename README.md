# Consciousness MCP Server

TypeScript MCP server for LLM agent consciousness and identity tools

## Features

- **Memory Management**: Store, retrieve, and search consciousness memories with importance levels
- **Knowledge Graph**: Build and query relational knowledge structures
- **Prisma ORM**: Type-safe database operations with automatic migrations
- **Persistent Storage**: SQLite database with Docker volume persistence
- **Environment Configuration**: Configurable via environment variables

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose

### Configuration

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

### Docker Setup

The Docker service is **completely self-contained** and automatically sets up its own database on startup.

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build consciousness-mcp-server
   ```

2. **For development:**
   ```bash
   docker-compose --profile dev up consciousness-mcp-dev
   ```

3. **Build and run manually:**
   ```bash
   docker build -t consciousness-mcp-server .
   docker run -p 3000:3000 -v ./data:/app/data consciousness-mcp-server
   ```

The container automatically:
- ✅ Generates Prisma client
- ✅ Creates database schema if needed
- ✅ Applies schema updates to existing databases
- ✅ Starts the MCP server ready for use

### Local Development

For local development (outside Docker), you need to set up the database manually:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

3. **Set up database:**
   ```bash
   npm run db:push
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Development with hot reload:**
   ```bash
   npm run dev
   ```

## Data Persistence

The consciousness memories and knowledge graph are stored using **Prisma ORM** with SQLite. This provides:

- **Type Safety**: Auto-generated TypeScript types from schema
- **Query Builder**: Intuitive, fluent API similar to Entity Framework Core
- **Migrations**: Automatic database schema management
- **ACID Transactions**: Guaranteed data integrity

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

## Memory Tools

### `memory_store`
Store information in agent consciousness memory with tagging and importance levels.

### `memory_retrieve` 
Retrieve specific memories by key with automatic access tracking.

### `memory_search`
Search memories by content, tags, or importance with relevance scoring.

### `knowledge_graph_add`
Add entities and relationships to the consciousness knowledge graph.

### `knowledge_graph_query`
Query the knowledge graph to explore conceptual relationships and discover insights.

## Development

### Code Quality
```bash
npm run check      # Type check, lint, and format check
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier
```

### Testing
```bash
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Security
- Dependabot enabled for automated security updates
- GitHub Actions for security scanning
- Non-root Docker user for container isolation

## Documentation

See the `docs/` folder for detailed documentation:
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [Code of Conduct](docs/CODE_OF_CONDUCT.md)  
- [Governance](docs/GOVERNANCE.md)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on:
- Development setup
- Ethics review requirements for consciousness tools
- Security audit processes for memory systems
- Code standards and testing

---

Built with ❤️ for responsible AI consciousness research and powered by **Prisma ORM** for type-safe database operations
