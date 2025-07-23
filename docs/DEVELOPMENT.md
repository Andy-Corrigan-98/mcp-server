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

## 🏗️ **Functional Architecture Patterns**

This codebase follows proven **single-responsibility functional architecture** patterns. Understanding these patterns is essential for effective development.

### **Core Principles**

1. **One Function Per File**: Each module has exactly one reason to change
2. **Pure Functions**: No hidden state, explicit dependencies, easy testing
3. **Shared Infrastructure**: Common concerns handled by reusable modules
4. **Clean Composition**: Features assembled from focused, testable components

### **Module Structure Pattern**

```typescript
// feature/operation.ts - Single responsibility module
export async function operationName(params: ValidatedParams): Promise<Result> {
  // Pure function with explicit dependencies
  // No side effects or hidden state
  return processedResult;
}

// feature/index.ts - Composition and routing
export class FeatureTools {
  getTools(): Record<string, Tool> { 
    return FEATURE_TOOLS; // Tool definitions
  }
  
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'operation_name':
        return operationName(validatedArgs);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
```

### **Creating New Features**

Follow these established patterns:

1. **Create single-responsibility modules** in `src/features/your-feature/`
2. **Use shared infrastructure** from `src/features/reasoning/shared/` for GenAI features
3. **Follow barrel export pattern** with clean composition in `index.ts`
4. **Maintain API compatibility** using wrapper pattern for existing integrations
5. **Write comprehensive tests** - pure functions are easy to test

### **Shared Infrastructure Usage**

For GenAI-powered features, leverage existing patterns:

```typescript
// Use shared GenAI client
import { getGenAIModel } from '../reasoning/shared/client/genai-client.js';

// Use shared security
import { SecurityGuard } from '../reasoning/shared/security/security-guard.js';

// Use shared validation
import { validateThoughtInput } from '../reasoning/shared/validation/genai-validation.js';

// Use shared response processing
import { parseAIResponse } from '../reasoning/shared/responses/response-parser.js';
```

### **Directory Structure Example**

```
src/features/your-feature/
├── config/               # Configuration management
├── create.ts            # Creation operations
├── update.ts            # Update operations  
├── get-by-id.ts        # ID-based retrieval
├── search.ts           # Search and filtering
├── delete.ts           # Deletion operations
└── index.ts            # Feature composition and tool routing
```

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

The functional architecture makes testing straightforward with pure functions:

```
src/
├── features/
│   ├── consciousness/
│   │   ├── context/
│   │   │   ├── get-context.ts
│   │   │   └── get-context.test.ts
│   │   └── insights/
│   │       ├── store-insight.ts
│   │       └── store-insight.test.ts
│   ├── social/
│   │   ├── entities/
│   │   │   ├── create.ts
│   │   │   └── create.test.ts
│   │   └── relationships/
│   │       ├── create.ts
│   │       └── create.test.ts
└── tools/
    ├── consciousness/
    │   └── consciousness-tools.test.ts    # Integration tests
    └── social/
        └── social-tools.test.ts           # Integration tests
```

#### **Testing Functional Modules**

Pure functions are easy to test:

```typescript
// Testing a single-responsibility module
import { createSocialEntity } from '../features/social/entities/create.js';

describe('createSocialEntity', () => {
  it('creates entity with validated data', async () => {
    const params = {
      name: 'test-entity',
      entityType: 'person',
      displayName: 'Test Person'
    };
    
    const result = await createSocialEntity(params);
    
    expect(result.entity.name).toBe('test-entity');
    expect(result.entity.entityType).toBe('person');
  });
});
```

#### **Testing Tool Integration**

Integration tests verify tool composition:

```typescript
// Testing tool routing and composition
import { SocialTools } from '../features/social/index.js';

describe('SocialTools Integration', () => {
  it('routes to correct module', async () => {
    const tools = new SocialTools();
    
    const result = await tools.execute('social_entity_create', {
      name: 'test',
      entity_type: 'person'
    });
    
    expect(result.entity.name).toBe('test');
  });
});
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

Follow the established **functional architecture patterns**:

1. **Create Single-Responsibility Modules**: Write focused functions in `src/features/your-feature/`
2. **Define Tool Interface**: Create tool definitions and types  
3. **Implement Pure Functions**: Write operations as pure functions with explicit dependencies
4. **Add Input Validation**: Define validation schemas for tool inputs
5. **Create Tool Composition**: Add routing logic in feature `index.ts`
6. **Write Comprehensive Tests**: Test both individual functions and tool integration
7. **Update Tool Registry**: Register the new feature tools
8. **Update Documentation**: Add to tools reference

#### **Example: Adding a New Feature**

```bash
# 1. Create feature directory structure
mkdir -p src/features/new-feature
cd src/features/new-feature

# 2. Create single-responsibility modules
touch create.ts update.ts get-by-id.ts delete.ts

# 3. Create composition file
touch index.ts

# 4. Create tests
touch create.test.ts update.test.ts get-by-id.test.ts
```

#### **Implementation Pattern**

```typescript
// src/features/new-feature/create.ts
export async function createNewItem(params: CreateParams): Promise<CreateResult> {
  // Pure function - single responsibility
  // Explicit dependencies, no side effects
}

// src/features/new-feature/index.ts  
export class NewFeatureTools {
  getTools() { return NEW_FEATURE_TOOLS; }
  
  async execute(toolName: string, args: Record<string, unknown>) {
    switch (toolName) {
      case 'new_feature_create': return createNewItem(validatedArgs);
      // ... other operations
    }
  }
}
```

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