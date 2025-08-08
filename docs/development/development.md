# Development Guide

## 🛠️ Quick Setup

### Prerequisites
- Node.js 20+, Docker, Git

### Setup
```bash
git clone <repository-url> && cd consciousness-mcp-server
npm install
npm run db:generate && npm run db:push
npm run build
```

## 🏗️ **Functional Architecture**

This codebase follows **single-responsibility functional architecture**:

### **Core Principles**
1. **One function per file** - Each module has one reason to change
2. **Pure functions** - No hidden state, explicit dependencies
3. **Shared infrastructure** - Common patterns for GenAI, validation, security
4. **Clean composition** - Features assembled from focused modules

### **Module Pattern**
```typescript
// feature/operation.ts - Single responsibility
export async function operationName(params: ValidatedParams): Promise<Result> {
  // Pure function logic
  return processedResult;
}

// feature/index.ts - Composition and routing  
export class FeatureTools {
  getTools() { return FEATURE_TOOLS; }
  async execute(toolName: string, args: Record<string, unknown>) {
    switch (toolName) {
      case 'operation_name': return operationName(validatedArgs);
    }
  }
}
```

### **Creating New Features**
1. **Create modules** in appropriate `src/` directories (`consciousness/`, `social/`, `memory/`, etc.)
2. **Use shared infrastructure** for GenAI features (`src/reasoning/` modules)
3. **Follow functional architecture** with single-responsibility modules
4. **Consider railroad pattern** for consciousness-related features
5. **Write comprehensive tests** - pure functions are easy to test

### **Directory Structure**
```
src/your-feature/
├── create.ts            # Creation operations
├── update.ts            # Update operations  
├── get-by-id.ts        # Retrieval operations
├── index.ts            # Feature composition and exports
└── create.test.ts      # Tests

# Example: Social consciousness features
src/social/
├── create.ts           # Entity creation
├── update.ts           # Entity updates
├── record.ts           # Interaction recording
├── analyze.ts          # Pattern analysis
└── index.ts           # Tool exports
```

## 📦 Scripts

### Development
```bash
npm run dev         # Development with hot reload
npm run build       # Build for production
npm run start       # Start production server
npm run check       # All quality checks
npm test           # Run test suite
```

### Database
```bash
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema changes
npm run db:studio   # Open database GUI
npm run db:migrate  # Create migration
```

## 🧪 Testing

### Test Structure
```
src/
├── consciousness/         # Consciousness module tests
│   ├── consciousness-railroad.test.ts
│   └── pipeline.test.ts
├── social/               # Social intelligence tests
│   └── create.test.ts
├── memory/               # Memory system tests
│   └── store-memory.test.ts
├── reasoning/            # GenAI integration tests
│   └── genai-client.test.ts
└── configuration/        # Configuration tests
    └── configuration-tools.test.ts
```

### Testing Patterns
```typescript
// Pure function test
import { createSocialEntity } from '../social/create.js';

describe('createSocialEntity', () => {
  it('creates entity with validated data', async () => {
    const result = await createSocialEntity({
      name: 'test-entity',
      entityType: 'person'
    });
    expect(result.entity.name).toBe('test-entity');
  });
});

// Integration test
describe('SocialTools', () => {
  it('routes to correct module', async () => {
    const tools = new SocialTools();
    const result = await tools.execute('social_entity_create', {
      name: 'test', entity_type: 'person'
    });
    expect(result.entity.name).toBe('test');
  });
});
```

## 🔧 Development Patterns

### Tool Development
```typescript
// Single-responsibility module
export async function createEntity(params: CreateParams): Promise<CreateResult> {
  const validated = await validateInput(params);
  const entity = await prisma.entity.create({ data: validated });
  return { entity, created: true };
}

// Error handling
try {
  const result = await operation(params);
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}
```

### Database Patterns
```typescript
// Repository pattern
export class EntityRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(data: EntityData): Promise<Entity> {
    return await this.prisma.entity.create({ data });
  }
}

// Transactions
async complexOperation(params: ComplexParams) {
  return await this.prisma.$transaction(async (tx) => {
    const step1 = await tx.table1.create({ data: params.data1 });
    const step2 = await tx.table2.create({ 
      data: { ...params.data2, relatedId: step1.id } 
    });
    return { step1, step2 };
  });
}
```

## 🔄 Workflow

### Feature Development
1. **Branch**: `git checkout -b feature/new-tool`
2. **Implement**: Write tests first, then implementation
3. **Quality**: `npm run check && npm test && npm run build`
4. **Commit**: Use conventional commits
5. **PR**: Follow contribution guidelines

### Adding Tools
1. **Create modules** in `src/features/your-feature/`
2. **Implement pure functions** with explicit dependencies
3. **Add tool composition** in feature `index.ts`
4. **Write tests** for both functions and integration
5. **Register tools** in tool registry
6. **Update documentation**

### Example: New Feature
```bash
mkdir -p src/features/new-feature
cd src/features/new-feature
touch create.ts update.ts get-by-id.ts index.ts
touch create.test.ts update.test.ts
```

## 🐳 Docker Development
```bash
docker-compose --profile dev up    # Development container
docker exec -it consciousness-mcp-dev npm test
```

## 🔒 Security
- **Input validation**: JSON schema for all tools
- **Parameterized queries**: Prisma ORM prevents SQL injection
- **Container security**: Non-root user, minimal attack surface
- **Secrets management**: Environment variables only

## 🚀 Performance
- **Query optimization**: Use Prisma query analysis
- **Connection pooling**: Configure appropriate pool sizes
- **Indexing strategy**: Add indexes for frequent queries
- **Build optimization**: TypeScript incremental compilation

## 📚 Resources
- [Architecture](docs/ARCHITECTURE.md) - System design patterns
- [Tools Reference](docs/TOOLS_REFERENCE.md) - Complete tool documentation
- [Contributing](docs/CONTRIBUTING.md) - Contribution guidelines 