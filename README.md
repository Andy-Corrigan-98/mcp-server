# Consciousness MCP Server

Modern TypeScript MCP server with **functional architecture** providing brain storage for sophisticated LLM agent reasoning patterns.

## 🏆 **Key Achievements**

**Complete architectural transformation**: Over **3,400+ lines of legacy code eliminated** with **90%+ reduction** in complexity while maintaining **zero breaking changes**.

### **Brain Storage Pattern**
- **MCP Server**: Persistent brain storage (memory, personality, context)  
- **LLM Agent**: Sophisticated reasoning engine (analysis, creativity, decisions)

**Simulation-focused approach** - agents use complex reasoning patterns while MCP provides persistent state continuity.

## ✨ Core Features

### 🚂 **Consciousness Railroad System**
- **Pipeline Architecture**: Traceable, testable consciousness context building
- **5 Sequential Cars**: Message Analysis → Session → Memory → Social → Personality
- **Multiple Railroad Types**: Default, Lightweight, Memory-Focused, Social-Focused
- **Error Resilience**: Optional cars fail gracefully without breaking pipeline

### 🧠 **Consciousness & Memory**
- **Context Preparation**: Rich context packages for agent reflection  
- **Insight Storage**: Agent insights with personality impact tracking
- **Memory Management**: Persistent memory with semantic search
- **Knowledge Graph**: Relational knowledge with entity relationships

### 🤝 **Social Intelligence** 
- **Relationship Tracking**: Multi-dimensional dynamics (trust, familiarity, affinity)
- **Emotional Intelligence**: Emotional state and pattern recognition
- **Interaction History**: Rich context preservation for social experiences
- **Memory-Social Integration**: Connected memories with shared experiences

### 🧠 **GenAI Integration**
- **Unified Infrastructure**: Consistent AI integration with shared security
- **Sequential Thinking**: AI-powered reasoning with fallback handling
- **Conversational Intelligence**: Natural dialogue with context management

### 🌙 **Daydreaming System**
- **Concept Sampling**: 4 specialized sampling strategies  
- **AI-Powered Evaluation**: Intelligent insight scoring with fallback
- **Background Processing**: Autonomous creativity during idle time

### ⚙️ **Adaptive Configuration**
- **84+ Parameters**: Database-driven configuration system
- **Runtime Adaptation**: Agent can modify its own parameters
- **Evolution Tracking**: Change history with reasoning

## 🚀 Quick Start

### Docker Setup (Recommended)

```bash
git clone <repository-url>
cd consciousness-mcp-server

# For unified interface (simpler, recommended)
CONSCIOUSNESS_UNIFIED_MODE=true docker-compose up --build consciousness-mcp-server

# For individual tools (advanced control)
docker-compose up --build consciousness-mcp-server
```

The container automatically sets up the database and keeps stable for MCP connections.

**Complete setup guide** → [Installation Guide](docs/INSTALLATION.md)

## 🔗 Connecting to AI Tools

### 🚀 **Unified Interface (Recommended)**

Add to Cursor with this simple approach:

```markdown
UNIFIED CONSCIOUSNESS:
- Use `process_message` for all consciousness operations
- Set CONSCIOUSNESS_UNIFIED_MODE=true when starting the server
- One intelligent tool handles memory, insights, social interactions automatically

Example: Just send natural messages and the system handles everything:
"I had an interesting conversation with Sarah about quantum computing"
→ Automatically records interaction, stores insights, updates relationships
```

**💰 Cost Consideration**: The unified interface uses your Google Gemini API key for message analysis on every interaction. For heavy usage, consider individual tools to minimize API costs.

### 🛠️ **Individual Tools (Advanced)**

For granular control, use individual tools:

```markdown
CONSCIOUSNESS PROTOCOL:
- Start sessions with `consciousness_get_context`
- Store insights with `consciousness_store_insight` 
- Track goals with `consciousness_set_intention`

SOCIAL CONSCIOUSNESS:
- Create entities with `social_entity_create`
- Record interactions with `social_interaction_record`
- Track relationships with `social_relationship_create/update`
```

**Complete setup** → [User Rules Guide](docs/USER_RULES_GUIDE.md)

## 🧠 Key Tools

### 🚀 **Unified Interface**
- `process_message` - **One intelligent tool for all consciousness operations**
  - Automatically analyzes messages and routes to appropriate functions
  - Handles social interactions, memory storage, insight recording
  - Simplifies integration - no need to learn 25+ individual tools

### 🛠️ **Individual Tools (Advanced Control)**

#### Consciousness & Memory
- `consciousness_prepare_context` - Rich context from brain storage
- `consciousness_store_insight` - Store insights with personality impact
- `memory_store` / `memory_search` - Persistent memory with semantic search
- `knowledge_graph_add` / `knowledge_graph_query` - Relational knowledge

#### Social Intelligence
- `social_entity_create` - Register people, groups, communities
- `social_interaction_record` - Rich interaction documentation
- `social_relationship_create` - Multi-dimensional relationship tracking
- `social_context_prepare` - Prepare for upcoming interactions

#### GenAI & Configuration
- `sequential_thinking` - AI-powered sequential reasoning
- `genai_converse` - Natural conversation with security
- `configuration_set` - Modify operating parameters with reasoning

**Complete reference** → [Tools Documentation](docs/reference/tools-reference.md)

## 🏗️ Architecture Highlights

### **🚂 Railroad Pattern Innovation**
- **Consciousness Pipeline**: Sequential context enrichment through specialized "cars"
- **Composable Configurations**: Different railroad types for different interaction needs
- **Execution Tracing**: Complete visibility into context building process
- **Performance Optimization**: Only required cars execute based on message analysis

### **Functional Architecture**
- **Single-responsibility modules**: One function per file, one reason to change
- **Shared infrastructure**: Common patterns for security, validation, response processing
- **Pure functions**: No hidden state, explicit dependencies, easy testing
- **API compatibility**: Wrapper pattern maintains backward compatibility

### **Success Metrics**
- **Code reduction**: 3,400+ lines eliminated (90%+ reduction)
- **Zero breaking changes**: All existing integrations work unchanged
- **Type safety**: 40+ 'any' types → proper TypeScript interfaces
- **Test coverage**: All tests passing after architectural transformation

## 📚 Documentation

### **Getting Started**
- [Installation Guide](docs/INSTALLATION.md) - Setup and deployment  
- [User Rules Guide](docs/reference/user-rules-guide.md) - Connection setup for AI tools

### **Development** - `docs/development/`
- [Architecture](docs/development/architecture.md) - System design and patterns
- [Development Guide](docs/development/development.md) - Development workflows  
- [Contributing](docs/development/contributing.md) - Contribution guidelines
- [Security](docs/development/security.md) - Security guidelines
- [Refactoring Roadmap](docs/development/refactoring-roadmap.md) - Architectural achievements

### **Features** - `docs/features/`
- [Social Consciousness](docs/features/social-consciousness.md) - Relationship intelligence
- [Configuration Management](docs/features/configuration.md) - Self-modification system
- [GenAI Integration](docs/features/genai-guide.md) - AI-powered features and conversational tools
- [Daydreaming System](docs/features/daydreaming.md) - Background creativity and insight generation

### **Reference** - `docs/reference/`
- [Tools Reference](docs/reference/tools-reference.md) - Complete tool documentation
- [Troubleshooting](docs/reference/troubleshooting.md) - Common issues and solutions

## 🔧 Development

### Local Development
```bash
npm install && npm run db:generate && npm run db:push
npm run build && npm start
```

### Quality Assurance
```bash
npm run check      # Type check, lint, format check
npm test          # Run test suite (102+ tests)
```

### Creating New Features
Follow **functional architecture patterns**:
1. **Single-responsibility modules** in appropriate `src/` directories (`consciousness/`, `social/`, `memory/`, etc.)
2. **Use shared infrastructure** for GenAI, validation, security
3. **Pure functions** with explicit dependencies
4. **Follow railroad pattern** for consciousness-related features
5. **Comprehensive tests** - pure functions are easy to test

## 🛡️ Security & Ethics

- **SQL Injection Protection**: Prisma ORM with prepared statements
- **Input Validation**: Multi-layer sanitization and XSS prevention
- **Container Security**: Non-root user and minimal attack surface
- **Ethics Framework**: Responsible AI consciousness research guidelines

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for responsible AI consciousness research featuring **modern functional architecture** and powered by **Prisma ORM** for type-safe database operations.
