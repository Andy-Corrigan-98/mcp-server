# Development Guide - Consciousness MCP Server

## 🛠️ Development Environment Setup

### Prerequisites
- **Node.js 20+**: Required for TypeScript compilation and runtime
- **Docker and Docker Compose**: For containerized development and testing
- **Git**: Version control and collaboration

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd consciousness-mcp-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env as needed for your development environment
   ```

4. **Initialize database**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Build the project**:
   ```bash
   npm run build
   ```

## 🏗️ Build System

### TypeScript Configuration

The project uses a sophisticated TypeScript setup with path alias resolution:

- **TypeScript Compilation**: `tsc` compiles TypeScript to JavaScript
- **Path Alias Resolution**: `tsc-alias` transforms `@/` imports to relative paths
- **Cross-Platform**: Works on Windows and Unix systems

### Build Process

```bash
npm run build  # Runs: tsc && tsc-alias
```

**Path Alias Resolution**: TypeScript preserves path aliases in compiled JavaScript, but Node.js can't resolve `@/` prefixed imports. The `tsc-alias` package transforms these aliases to relative paths during the build process.

### Build Configuration Files

- **`tsconfig.json`**: Main TypeScript configuration
- **`tsconfig.build.json`**: Production build configuration
- **`package.json`**: Build scripts and dependencies

## 📦 Development Scripts

### Core Development Commands

```bash
npm run dev         # Start development server with hot reload
npm run build       # Build for production
npm run start       # Start production server
npm run check       # Run all quality checks
npm test           # Run test suite
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Database Development Commands

```bash
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema changes to database
npm run db:studio   # Open Prisma Studio (GUI)
npm run db:migrate  # Run database migrations
npm run db:reset    # Reset database and reseed
```

### Quality Assurance Commands

```bash
npm run type-check  # TypeScript type checking
npm run lint:fix    # Fix linting issues automatically
npm run format:check # Check code formatting
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🔍 Code Quality

### Automated Quality Gates

The project includes comprehensive quality assurance:

- **TypeScript**: Full type safety with strict configuration
- **ESLint**: Code linting with custom rules for consciousness tools
- **Prettier**: Consistent code formatting
- **Jest**: Comprehensive test suite (102+ tests)
- **Husky**: Pre-commit hooks for quality enforcement
- **Commitlint**: Conventional commit message enforcement

### Quality Check Command

```bash
npm run check      # Runs all quality checks:
                   # - TypeScript type checking
                   # - ESLint linting
                   # - Prettier format checking
                   # - Test suite execution
```

### Pre-Commit Hooks

Husky automatically runs quality checks before commits:
- **Lint Staged**: Runs linting and formatting on staged files
- **Type Check**: Ensures TypeScript compilation succeeds
- **Test**: Runs relevant tests for changed files

## 🗄️ Database Development

### Prisma ORM Integration

The project uses Prisma for type-safe database operations:

#### Schema Development

- **Schema File**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`
- **Seed Data**: `src/db/seed.ts`

#### Database Workflow

1. **Make Schema Changes**: Edit `prisma/schema.prisma`
2. **Generate Client**: `npm run db:generate`
3. **Push Changes**: `npm run db:push` (development)
4. **Create Migration**: `npx prisma migrate dev` (for production)

#### Database Tools

```bash
# Development workflow
npx prisma studio              # Visual database editor
npx prisma format             # Format schema file
npx prisma validate          # Validate schema
npx prisma db seed           # Run seed data

# Migration workflow
npx prisma migrate dev       # Create and apply migration
npx prisma migrate reset     # Reset database with migrations
npx prisma migrate status    # Check migration status
```

### Database Design Patterns

#### Entity Relationships

- **Consciousness**: Sessions, insights, intentions, configurations
- **Memory**: Memories, knowledge graph entities and relationships
- **Social**: Entities, relationships, interactions, emotional states
- **Learning**: Social learning records and pattern analysis

#### Performance Considerations

- **Indexes**: Strategic indexing for search and relationship queries
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Efficient queries with proper includes/selects

## 🧪 Testing Strategy

### Test Architecture

The project maintains comprehensive test coverage across all layers:

#### Test Categories

1. **Unit Tests**: Individual function and class testing
2. **Integration Tests**: Tool integration and database operations
3. **System Tests**: End-to-end MCP server functionality
4. **Performance Tests**: Memory usage and response time validation

#### Test Structure

```
src/
├── tools/
│   ├── consciousness/
│   │   ├── consciousness-tools.test.ts
│   │   └── consciousness-tools.ts
│   ├── memory/
│   │   ├── memory-tools.test.ts
│   │   └── memory-tools.ts
│   └── social/
│       ├── social-tools.test.ts
│       └── social-tools.ts
```

#### Test Configuration

- **Jest**: Test runner with TypeScript support
- **Test Database**: Isolated test database for each test suite
- **Mocking**: Strategic mocking of external dependencies
- **Coverage**: Comprehensive coverage reporting

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test consciousness
npm test memory
npm test social

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- consciousness-tools.test.ts
```

### Writing Tests

#### Test Patterns

```typescript
describe('ConsciousnessTools', () => {
  let tools: ConsciousnessTools;
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } }
    });
    tools = new ConsciousnessTools(prisma);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it('should store insights with personality impact', async () => {
    const result = await tools.storeInsight({
      insight: 'Test insight',
      category: 'eureka_moment',
      confidence: 0.8
    });

    expect(result.stored).toBe(true);
    expect(result.personalityImpact).toBeDefined();
  });
});
```

## 🔧 Development Patterns

### Tool Development Architecture

#### Tool Structure

Each tool category follows a consistent pattern:

```typescript
// Tool interface definition
export interface ToolName {
  toolMethod(params: ToolParams): Promise<ToolResult>;
}

// Implementation class
export class ToolNameImpl implements ToolName {
  constructor(private prisma: PrismaClient) {}
  
  async toolMethod(params: ToolParams): Promise<ToolResult> {
    // Validation
    // Database operations
    // Result formatting
  }
}

// MCP tool registration
export const toolNameMCP = {
  name: 'tool_name',
  description: 'Tool description',
  inputSchema: {
    type: 'object',
    properties: { /* schema */ }
  }
};
```

#### Validation Patterns

```typescript
import { validateInput } from '@/validation';

async toolMethod(params: ToolParams): Promise<ToolResult> {
  const validated = await validateInput(params, 'tool_name');
  // Use validated parameters
}
```

#### Error Handling

```typescript
try {
  const result = await this.performOperation(params);
  return { success: true, data: result };
} catch (error) {
  console.error(`Tool operation failed:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

### Database Patterns

#### Repository Pattern

```typescript
export class ConsciousnessRepository {
  constructor(private prisma: PrismaClient) {}

  async storeInsight(insight: InsightData): Promise<StoredInsight> {
    return await this.prisma.insight.create({
      data: {
        content: insight.content,
        category: insight.category,
        confidence: insight.confidence,
        timestamp: new Date()
      }
    });
  }
}
```

#### Transaction Patterns

```typescript
async complexOperation(params: ComplexParams): Promise<ComplexResult> {
  return await this.prisma.$transaction(async (tx) => {
    const step1 = await tx.table1.create({ data: params.data1 });
    const step2 = await tx.table2.create({ 
      data: { ...params.data2, relatedId: step1.id } 
    });
    return { step1, step2 };
  });
}
```

## 🐳 Docker Development

### Development Container

```bash
# Build development container
docker-compose --profile dev build

# Run development container
docker-compose --profile dev up consciousness-mcp-dev

# Execute commands in container
docker exec -it consciousness-mcp-dev npm test
```

### Container Development Workflow

1. **Make Code Changes**: Edit source files locally
2. **Volume Mount**: Changes automatically sync to container
3. **Hot Reload**: Development server restarts automatically
4. **Test in Container**: Run tests in containerized environment

### Multi-Stage Dockerfile

The Dockerfile uses multi-stage builds:
- **Development Stage**: Includes dev dependencies and tools
- **Production Stage**: Minimal runtime image
- **Test Stage**: Isolated testing environment

## 🔄 Development Workflow

### Feature Development

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/new-consciousness-tool
   ```

2. **Implement Feature**:
   - Write tests first (TDD approach)
   - Implement tool logic
   - Update documentation
   - Add database migrations if needed

3. **Quality Checks**:
   ```bash
   npm run check    # Run all quality checks
   npm test        # Ensure all tests pass
   npm run build   # Verify build succeeds
   ```

4. **Commit with Conventional Commits**:
   ```bash
   git add .
   git commit -m "feat: add consciousness context preparation tool

   - Implement consciousness_prepare_context tool
   - Add comprehensive context retrieval from memory and knowledge graph
   - Include personality state and session information
   - Add 95% test coverage for context preparation"
   ```

5. **Create Pull Request**: Follow contribution guidelines

### Database Schema Changes

1. **Edit Schema**: Modify `prisma/schema.prisma`
2. **Generate Client**: `npm run db:generate`
3. **Create Migration**: `npx prisma migrate dev --name descriptive_name`
4. **Test Migration**: Ensure tests pass with new schema
5. **Update Seed Data**: Modify `src/db/seed.ts` if needed

### Adding New Tools

1. **Define Interface**: Create tool interface and types
2. **Implement Logic**: Write tool implementation class
3. **Add Validation**: Define input validation schema
4. **Write Tests**: Comprehensive test coverage
5. **Register Tool**: Add to MCP tool registry
6. **Update Documentation**: Add to tools reference

## 🚀 Performance Optimization

### Database Performance

- **Query Optimization**: Use Prisma's query analysis tools
- **Connection Pooling**: Configure appropriate pool sizes
- **Indexing Strategy**: Add indexes for frequently queried fields
- **Batch Operations**: Use batch queries for multiple operations

### Memory Management

- **Connection Cleanup**: Properly close database connections
- **Object Lifecycle**: Manage object creation and cleanup
- **Caching Strategy**: Implement intelligent caching for frequent operations

### Build Performance

- **Incremental Builds**: Use TypeScript incremental compilation
- **Docker Layer Caching**: Optimize Dockerfile for build caching
- **Dependency Management**: Keep dependencies lean and updated

## 🔒 Security Development

### Input Validation

- **Schema Validation**: Use JSON schema for all tool inputs
- **Sanitization**: Clean and sanitize all user inputs
- **Length Limits**: Enforce reasonable limits on input sizes

### Database Security

- **Parameterized Queries**: Prisma automatically handles SQL injection prevention
- **Connection Security**: Use secure connection strings
- **Secrets Management**: Never commit secrets to version control

### Container Security

- **Non-Root User**: Run containers as non-root user
- **Minimal Attack Surface**: Use minimal base images
- **Dependency Scanning**: Regular security audits of dependencies

## 📊 Monitoring and Debugging

### Logging Strategy

```typescript
import { logger } from '@/utils/logger';

logger.info('Tool operation started', { tool: 'consciousness_prepare_context', params });
logger.debug('Intermediate processing step', { step: 'memory_retrieval', count: memories.length });
logger.error('Tool operation failed', { error: error.message, stack: error.stack });
```

### Performance Monitoring

- **Database Query Monitoring**: Track slow queries and optimization opportunities
- **Memory Usage**: Monitor memory consumption patterns
- **Response Times**: Track tool response times and identify bottlenecks

### Debug Configuration

```bash
# Enable debug logging
export MCP_DEBUG=true
export DB_DEBUG=true

# Run with debugging
npm run dev
```

## 🔄 Continuous Integration

### GitHub Actions

The project includes automated CI/CD:

- **Quality Gates**: Automated testing, linting, and type checking
- **Build Verification**: Ensure builds succeed across platforms
- **Dependency Security**: Automated security scanning
- **Documentation**: Automated documentation generation

### Local CI Simulation

```bash
# Simulate CI pipeline locally
npm run check && npm test && npm run build
```

## 📚 Development Resources

### Key Documentation
- **TypeScript Handbook**: Advanced TypeScript patterns
- **Prisma Documentation**: Database operations and best practices
- **Jest Documentation**: Testing patterns and configuration
- **Docker Documentation**: Container development and optimization

### Internal Resources
- **Code Architecture**: See `docs/ARCHITECTURE.md`
- **Tool Development**: See `docs/TOOLS_REFERENCE.md`
- **Configuration**: See `docs/CONFIGURATION.md`

### Community
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Design discussions and questions
- **Contributing Guide**: See `docs/CONTRIBUTING.md` 