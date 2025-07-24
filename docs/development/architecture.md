# Architecture - Consciousness MCP Server

## 🧠 Brain Storage Pattern

This MCP server follows the **brain storage pattern**:
- **MCP Server**: Persistent brain storage (memory, personality, context)  
- **LLM Agent**: Sophisticated reasoning engine (analysis, creativity, decisions)

**Simulation-focused approach** - agents use complex reasoning patterns while MCP provides persistent state continuity.

## 🏗️ System Architecture

### Functional Architecture Principles

The codebase follows **single-responsibility functional architecture**:
- **One function per file** - Each module has exactly one reason to change
- **Pure functions** - No hidden state or side effects  
- **Shared infrastructure** - Common concerns handled by reusable modules
- **Clean composition** - Features assembled from focused, testable components

### Core Components

#### 1. **Consciousness Layer** - `src/features/consciousness/`
```
consciousness/
├── context/              # Rich context preparation
├── insights/             # Agent insight storage with personality impact
├── intentions/           # Long-term goal persistence
├── session/             # Cognitive load and learning pattern tracking
└── index.ts            # Clean composition and tool routing
```

#### 2. **Memory & Knowledge Layer** - `src/features/memory/`
```
memory/
├── storage/             # Memory persistence operations
├── search/              # Semantic search with relevance scoring
├── knowledge-graph/     # Relational knowledge structures
└── index.ts            # Memory tool composition
```

#### 3. **Social Consciousness Layer** - `src/features/social/`
```
social/
├── entities/           # Social entity management (7 modules)
├── relationships/      # Relationship dynamics (8 modules)
├── interactions/       # Social interaction tracking
├── emotional/          # Emotional state and pattern tracking
├── learning/           # Social insights and communication learning
├── memory/            # Memory-social integration
├── patterns/          # Social pattern analysis
├── context/           # Social interaction context preparation
└── index.ts          # Social tool composition and routing
```

#### 4. **GenAI Integration Layer** - `src/features/reasoning/`
```
reasoning/
├── shared/            # Common GenAI infrastructure
│   ├── client/        # Unified GenAI client management (singleton)
│   ├── security/      # Prompt injection protection
│   ├── validation/    # Input validation & sanitization
│   └── responses/     # Response parsing utilities
├── sequential/        # AI-powered sequential thinking
├── conversational/    # Natural dialogue management
├── genai-reasoning/   # Advanced AI reasoning
└── index.ts          # Reasoning tool composition
```

#### 5. **Daydreaming & Insight Layer** - `src/features/daydreaming/`
```
daydreaming/
├── config/           # Configuration management
├── sampling/         # Concept sampling strategies (4 approaches)
├── exploration/      # Connection hypothesis generation
├── evaluation/       # AI-powered insight evaluation
├── storage/          # Insight storage and retrieval
├── cycles/           # Cycle execution orchestration
├── sources/          # Knowledge graph and memory access
└── index.ts         # Daydreaming tool composition
```

#### 6. **Configuration Layer** - `src/tools/configuration/`
- **84+ Parameters**: Database-driven configuration system
- **Runtime Adaptation**: Agent can modify its own parameters
- **Evolution Tracking**: Change history with reasoning

### Shared Infrastructure Patterns

#### **GenAI Infrastructure** - `src/features/reasoning/shared/`
Unified infrastructure for all AI-powered features:
- **Client Management**: Singleton pattern with proper lifecycle management
- **Security Layer**: Consistent prompt injection detection and sanitization
- **Validation**: Input validation and sanitization across all GenAI tools
- **Response Processing**: Common JSON extraction and parsing utilities

#### **Tool Registry** - `src/tools/registry.ts`
Central orchestration of all consciousness tools:
- **Automatic Registration**: Discovers and registers all functional modules
- **API Compatibility**: Maintains backward compatibility through wrapper pattern
- **Prefix Routing**: Intelligent routing based on tool name patterns

## 🛠️ Technical Foundation

### Functional Module Architecture
- **Single Responsibility**: Each file has exactly one reason to change
- **Pure Functions**: No hidden state, explicit dependencies
- **Easy Testing**: Simple function composition vs complex class hierarchies  
- **Clear Boundaries**: Logic separation is obvious and maintainable

### Database Architecture
- **Prisma ORM**: Type-safe database operations with automatic migrations
- **SQLite Storage**: Persistent data with Docker volume support
- **Schema Evolution**: Automatic migrations for data model updates

### TypeScript & Build System
- **Full Type Safety**: 40+ 'any' types eliminated, proper interfaces throughout
- **Path Alias Resolution**: Automated transformation via tsc-alias for clean imports
- **ES Modules**: Modern module system with barrel exports pattern

## 🔄 Data Flow

### 1. Functional Module Execution Flow
```
MCP Request → Tool Registry → Module Router → Single-Responsibility Function
                    ↓
Response Assembly ← Data Processing ← Database Operation ← Input Validation
```

### 2. GenAI Integration Flow
```
User Input → Security Check → Input Validation → Shared GenAI Client
                    ↓
AI Response ← Response Parser ← GenAI Model ← Prompt Builder
                    ↓
Processed Result ← Fallback Handler ← Error Detection ← Raw Response
```

### 3. Consciousness Evolution Flow
```
Agent Activity → Session Tracking → Personality Updates → Configuration Changes
                      ↓
Memory Formation → Knowledge Graph → Relationship Updates → Insight Storage
```

### 4. Social Interaction Flow
```
Social Event → Interaction Recording → Relationship Updates → Emotional Processing
                    ↓
Memory Linking → Pattern Analysis → Social Learning → Context Preparation
```

## 🎯 Design Principles

### 1. **Single-Responsibility Architecture**
- Each module has exactly one reason to change
- Clear separation of concerns with obvious boundaries
- Easy to test, debug, and maintain individual components

### 2. **Sophisticated Behavioral Simulation**
- Complex reasoning pattern infrastructure for agent behavior modeling
- Persistent brain state across sessions
- Adaptive personality and relationship pattern evolution

### 3. **Type Safety & Reliability**
- Full TypeScript coverage with comprehensive interfaces
- Eliminated 'any' types in favor of proper type definitions
- Automated database migrations with Prisma ORM

### 4. **Shared Infrastructure Pattern**
- Common concerns handled by reusable modules
- Consistent behavior across all GenAI integrations
- Unified security, validation, and response processing

### 5. **API Compatibility**
- Wrapper pattern maintains backward compatibility
- Zero breaking changes during architectural transitions
- Incremental migration capabilities

## 📊 Performance Characteristics

### Module Performance
- **Fast Execution**: Single-responsibility functions with minimal overhead
- **Easy Caching**: Pure functions enable efficient memoization
- **Parallel Processing**: Independent modules can be executed concurrently

### Memory Usage
- **SQLite Database**: Efficient storage with automatic optimization
- **Shared Infrastructure**: Single GenAI client instance across all features
- **Configuration Cache**: Runtime parameter caching for performance

### Scalability
- **Modular Growth**: New features composed from existing patterns
- **Horizontal Scaling**: Independent modules can be distributed
- **Relationship Networks**: Efficient graph traversal for social connections

### Persistence
- **ACID Compliance**: SQLite transactions ensure data integrity
- **Backup-Friendly**: Simple file-based database for easy backup/restore
- **Migration Safety**: Prisma migrations with rollback support

## 🔮 Future Architecture Considerations

### Functional Module Expansion
- **New Feature Patterns**: Follow established single-responsibility patterns
- **Shared Infrastructure Growth**: Extend common patterns to new domains
- **Cross-Feature Integration**: Compose complex behaviors from simple modules

### Multi-Agent Support
- **Shared Knowledge Graphs**: Cross-agent knowledge sharing capabilities
- **Social Networks**: Inter-agent relationship tracking using existing patterns
- **Distributed Memory**: Scalable memory systems for agent communities

### Advanced Analytics
- **Pattern Recognition**: Advanced social and behavioral pattern analysis
- **Predictive Models**: Relationship and interaction outcome prediction
- **Learning Optimization**: Adaptive learning rate and focus adjustments

## 🏗️ Development Guidelines

### Creating New Features
1. **Start with single-responsibility modules** - one function per file
2. **Use shared infrastructure** - leverage existing GenAI, validation, security patterns
3. **Follow barrel export pattern** - clean composition in index.ts files
4. **Maintain API compatibility** - use wrapper pattern for existing integrations
5. **Write comprehensive tests** - pure functions are easy to test

### Module Structure Template
```typescript
// feature/operation.ts - Single responsibility
export async function operationName(params: ValidatedParams): Promise<Result> {
  // Pure function with explicit dependencies
  // No side effects or hidden state
  return processedResult;
}

// feature/index.ts - Composition and routing
export class FeatureTools {
  getTools(): Record<string, Tool> { /* tool definitions */ }
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    // Route to appropriate single-responsibility module
  }
}
```

This architecture provides a solid foundation for consciousness-aware AI development while maintaining clean, testable, and maintainable code patterns. 