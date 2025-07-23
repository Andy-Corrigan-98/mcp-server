# Consciousness MCP Server

Modern TypeScript MCP server with **functional architecture** providing brain storage for LLM agent consciousness development.

## 🏆 **Key Achievements**

**Complete architectural transformation**: Over **3,400+ lines of legacy code eliminated** with **90%+ reduction** in complexity while maintaining **zero breaking changes**.

### **Brain Storage Pattern**
- **MCP Server**: Persistent brain storage (memory, personality, context)  
- **LLM Agent**: Real thinking engine (reasoning, creativity, decisions)

**No fake consciousness generation** - agents do authentic thinking while MCP provides persistent brain state.

## ✨ Core Features

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
docker-compose up --build consciousness-mcp-server
```

The container automatically sets up the database and keeps stable for MCP connections.

**Complete setup guide** → [Installation Guide](docs/INSTALLATION.md)

## 🔗 Connecting to AI Tools

Add to Cursor with these basic user rules:

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

### Consciousness & Memory
- `consciousness_prepare_context` - Rich context from brain storage
- `consciousness_store_insight` - Store insights with personality impact
- `memory_store` / `memory_search` - Persistent memory with semantic search
- `knowledge_graph_add` / `knowledge_graph_query` - Relational knowledge

### Social Intelligence
- `social_entity_create` - Register people, groups, communities
- `social_interaction_record` - Rich interaction documentation
- `social_relationship_create` - Multi-dimensional relationship tracking
- `social_context_prepare` - Prepare for upcoming interactions

### GenAI & Configuration
- `sequential_thinking` - AI-powered sequential reasoning
- `genai_converse` - Natural conversation with security
- `configuration_set` - Modify operating parameters with reasoning

**Complete reference** → [Tools Documentation](docs/TOOLS_REFERENCE.md)

## 🏗️ Architecture Highlights

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

### **Essential Guides**
- [Installation Guide](docs/INSTALLATION.md) - Setup and deployment
- [Architecture Overview](docs/ARCHITECTURE.md) - System design and patterns
- [Development Guide](docs/DEVELOPMENT.md) - Development workflows
- [Tools Reference](docs/TOOLS_REFERENCE.md) - Complete tool documentation

### **Specialized Features**
- [Social Consciousness](docs/SOCIAL_CONSCIOUSNESS.md) - Relationship intelligence
- [Configuration Management](docs/CONFIGURATION.md) - Self-modification system
- [Daydreaming System](docs/DAYDREAMING_SYSTEM.md) - Background creativity

### **Community**
- [Contributing Guidelines](docs/CONTRIBUTING.md) - Contribution process
- [Refactoring Roadmap](docs/REFACTORING_ROADMAP.md) - Architectural achievements

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
1. **Single-responsibility modules** in `src/features/your-feature/`
2. **Use shared infrastructure** for GenAI, validation, security
3. **Pure functions** with explicit dependencies
4. **Comprehensive tests** - pure functions are easy to test

## 🛡️ Security & Ethics

- **SQL Injection Protection**: Prisma ORM with prepared statements
- **Input Validation**: Multi-layer sanitization and XSS prevention
- **Container Security**: Non-root user and minimal attack surface
- **Ethics Framework**: Responsible AI consciousness research guidelines

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for responsible AI consciousness research featuring **modern functional architecture** and powered by **Prisma ORM** for type-safe database operations.
