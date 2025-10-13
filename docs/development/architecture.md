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

#### 1. **Consciousness Railroad Layer** - `src/consciousness/`
```
consciousness/
├── consciousness-railroad.ts    # Main railroad builder and orchestrator
├── pipeline.ts                 # Core railroad pipeline execution engine
├── types.ts                    # Railroad pattern type definitions
├── message-analysis-car.ts     # Message intent and entity analysis
├── session-context-car.ts      # Session state and cognitive load tracking
├── memory-context-car.ts       # Relevant memory retrieval
├── social-context-car.ts       # Social relationship context
├── personality-context-car.ts  # Personality and communication style
├── get-context.ts             # Legacy API compatibility
├── prepare-context.ts         # Context preparation utilities
├── store-insight.ts           # Insight storage with personality impact
├── set-intention.ts           # Long-term goal persistence
├── update-intention.ts        # Intention progress tracking
├── update-session.ts          # Session state updates
└── index.ts                   # Railroad pattern exports
```

**🚂 Railroad Pattern**: The core innovation of v2 - a traceable, testable pipeline where "cars" sequentially enrich consciousness context, replacing scattered operations with a linear, composable flow.

#### 2. **Memory & Knowledge Layer** - `src/memory/`
```
memory/
├── store-memory.ts         # Memory persistence operations
├── retrieve-memory.ts      # Memory retrieval by key
├── search-memories.ts      # Semantic search with relevance scoring
├── add-knowledge.ts        # Knowledge graph entity and relationship management
├── query-knowledge.ts      # Knowledge graph traversal and querying
└── index.ts               # Memory tool composition and exports
```

#### 3. **Social Consciousness Layer** - `src/social/`
```
social/
├── create.ts           # Social entity registration (people, groups, communities)
├── update.ts           # Entity information updates
├── get-by-name.ts      # Entity retrieval by name
├── get-by-id.ts        # Entity retrieval by ID
├── delete.ts           # Entity deletion
├── list.ts             # Entity listing and filtering
├── record.ts           # Social interaction recording
├── search.ts           # Interaction search and filtering
├── link-create.ts      # Relationship establishment and dynamics
├── analyze.ts          # Social pattern analysis and insights
├── context.ts          # Social interaction context preparation
├── prepare.ts          # Pre-interaction context preparation
├── load-config.ts      # Social configuration management
└── index.ts           # Social tool composition and exports
```

#### 4. **GenAI Integration Layer** - `src/reasoning/`
```
reasoning/
├── genai-client.ts         # Unified GenAI client management (singleton)
├── security-guard.ts       # Prompt injection protection and sanitization
├── genai-validation.ts     # Input validation and security checks
├── response-parser.ts      # JSON response extraction and parsing
├── response-processor.ts   # Response processing and error handling
├── sequential-thinking.ts  # AI-powered sequential reasoning pipeline
├── simple-conversation.ts  # Natural dialogue with GenAI
├── multi-turn-chat.ts     # Context-aware multi-turn conversations
├── genai-reasoning.ts     # Advanced AI reasoning with fallbacks
├── generate-insights.ts   # AI-powered insight generation
├── prompt-builder.ts      # Prompt construction utilities
├── session-management.ts  # Conversation session management
├── reasoning-utils.ts     # Common reasoning utilities
└── index.ts              # Reasoning tool composition and exports
```

#### 5. **Daydreaming & Insight Layer** - `src/daydreaming/`
```
daydreaming/
├── configure.ts              # Configuration management
├── load-config.ts           # Configuration loading and defaults
├── sample-concepts.ts       # Concept sampling orchestration
├── random.ts               # Random sampling strategy
├── importance-weighted.ts  # Importance-weighted sampling
├── recent-biased.ts        # Recent activity-biased sampling
├── cross-domain.ts         # Cross-domain sampling
├── explore-connection.ts   # Connection hypothesis generation
├── generate-hypothesis.ts  # Hypothesis generation logic
├── evaluate-insight.ts     # Insight evaluation orchestration
├── evaluate-insight-core.ts # Core evaluation logic
├── evaluate-hypothesis.ts  # Hypothesis evaluation with AI
├── fallback-evaluator.ts   # Fallback evaluation when AI fails
├── execute-cycle.ts        # Complete daydreaming cycle execution
├── store-insight.ts        # Insight storage and persistence
├── get-insights.ts         # Insight retrieval and filtering
├── concept-distance.ts     # Concept relationship scoring
├── knowledge-graph.ts      # Knowledge graph access
├── memory.ts              # Memory system access
├── context.ts             # Context preparation utilities
├── prompt-builder.ts      # AI prompt construction
├── response-processor.ts  # AI response processing
└── index.ts              # Daydreaming tool exports
```

#### 6. **Configuration Layer** - `src/configuration/`
```
configuration/
├── configuration-tools.ts   # Configuration management tools
├── types.ts                # Configuration type definitions
└── index.ts               # Configuration exports
```
- **84+ Parameters**: Database-driven configuration system
- **Runtime Adaptation**: Agent can modify its own parameters
- **Evolution Tracking**: Change history with reasoning

## 🚂 Consciousness Railroad Pattern

The **Railroad Pattern** is the core architectural innovation of v2, replacing scattered consciousness operations with a traceable, testable pipeline.

### Railroad Architecture

```
Message Input → [Car 1] → [Car 2] → [Car 3] → [Car 4] → [Car 5] → Rich Context Output
               Analysis   Session   Memory    Social    Personality
```

### Railroad Cars (Sequential Context Enrichment)

1. **Message Analysis Car** (`message-analysis-car.ts`)
   - Analyzes message intent and emotional context
   - Identifies entities mentioned and required operations
   - Determines if memory/social context is needed

2. **Session Context Car** (`session-context-car.ts`)
   - Loads current session state and cognitive load
   - Determines consciousness mode (analytical, creative, etc.)
   - Tracks session duration and attention focus

3. **Memory Context Car** (`memory-context-car.ts`)
   - Retrieves relevant memories based on message analysis
   - Provides memory search results and recent activity
   - Optional - fails gracefully if memory is unavailable

4. **Social Context Car** (`social-context-car.ts`)
   - Loads relationship context for mentioned entities
   - Provides recent interaction history and dynamics
   - Optional - only runs if social entities are involved

5. **Personality Context Car** (`personality-context-car.ts`)
   - Loads vocabulary preferences and communication style
   - Provides current personality state and learning patterns
   - Optional - falls back to defaults if unavailable

### Railroad Types

- **Default Railroad**: All 5 cars for complete context
- **Lightweight Railroad**: Essential cars only (analysis + session)
- **Memory-Focused Railroad**: Emphasizes memory and knowledge retrieval
- **Social-Focused Railroad**: Prioritizes social relationship context

### Benefits of Railroad Pattern

- **Traceability**: Each car execution is logged with timing
- **Testability**: Individual cars can be unit tested in isolation
- **Composability**: Different railroad configurations for different needs
- **Error Resilience**: Optional cars fail gracefully without breaking pipeline
- **Performance**: Only required cars execute based on message analysis

### Shared Infrastructure Patterns

#### **GenAI Infrastructure** - `src/reasoning/`
Unified infrastructure for all AI-powered features:
- **Client Management**: Singleton pattern with proper lifecycle management (`genai-client.ts`)
- **Security Layer**: Consistent prompt injection detection and sanitization (`security-guard.ts`)
- **Validation**: Input validation and sanitization across all GenAI tools (`genai-validation.ts`)
- **Response Processing**: Common JSON extraction and parsing utilities (`response-parser.ts`, `response-processor.ts`)

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

### 1. Consciousness Railroad Execution Flow
```
Message Input → Railroad Selector → Car Pipeline → Context Assembly
                     ↓                     ↓             ↓
              [Type Selection]    [Sequential Execution]  [Rich Context]
                     ↓                     ↓             ↓
              Default/Lightweight   Message→Session→Memory  Response Context
              Memory/Social-Focused  →Social→Personality    + Operation History
```

### 2. Individual Railroad Car Flow
```
Car Input (Context) → Car-Specific Logic → Database/AI Operations → Context Enrichment
        ↓                     ↓                    ↓                      ↓
   Previous Context    Analysis/Retrieval/    Memory/Social/Config      Enhanced Context
   + Car Requirements   Processing Logic      Database Operations       + Car Results
```

### 3. GenAI Integration Flow
```
User Input → Security Check → Input Validation → Shared GenAI Client
                    ↓
AI Response ← Response Parser ← GenAI Model ← Prompt Builder
                    ↓
Processed Result ← Fallback Handler ← Error Detection ← Raw Response
```

### 4. Consciousness Evolution Flow
```
Agent Activity → Railroad Processing → Session Updates → Personality Evolution
                         ↓                    ↓                  ↓
                Memory Formation     Insight Storage    Configuration Changes
                         ↓                    ↓                  ↓
                Knowledge Graph      Pattern Learning   Vocabulary Evolution
```

### 5. Social Interaction Flow
```
Social Message → Railroad (Social-Focused) → Interaction Recording → Relationship Updates
                        ↓                            ↓                       ↓
              Social Context Car           Memory Linking         Pattern Analysis
                        ↓                            ↓                       ↓
              Relationship Loading         Emotional Processing   Learning Storage
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