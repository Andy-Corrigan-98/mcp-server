# Consciousness MCP Server

Modern TypeScript MCP server with **single-responsibility functional architecture** providing comprehensive brain storage for LLM agent consciousness development.

## 🏆 **Architectural Excellence**

**Built with proven functional patterns**: This server represents a complete architectural transformation from legacy class-based design to modern single-responsibility modules. Over **3,400+ lines of legacy code eliminated** with **90%+ reduction** in complexity while maintaining **zero breaking changes**.

### **Brain Storage Pattern**
- **MCP Server**: Persistent brain storage (memory, personality, context)  
- **LLM Agent**: Real thinking engine (reasoning, creativity, decisions)

**No fake consciousness generation** - the agent does authentic thinking while MCP provides persistent brain state.

## ✨ Features

### 🧠 **Consciousness Brain Storage** - `src/features/consciousness/`
Single-responsibility modules for authentic consciousness support:
- **Context Preparation**: Rich context packages for agent reflection  
- **Insight Storage**: Agent insights with personality impact tracking
- **Session Management**: Cognitive load and learning pattern tracking
- **Intention Persistence**: Long-term goals across sessions

### 💾 **Memory & Knowledge Management** - `src/features/memory/`
Modular memory architecture with clean separation:
- **Memory Storage**: Persistent memory with importance and tagging
- **Knowledge Graph**: Relational knowledge with entity relationships
- **Search & Retrieval**: Semantic search with relevance scoring

### 🤝 **Social Consciousness System** - `src/features/social/` 
Comprehensive social intelligence with **25+ specialized modules**:
- **Relationship Tracking**: Multi-dimensional dynamics (trust, familiarity, affinity)
- **Emotional Intelligence**: Emotional state and pattern recognition
- **Social Learning**: Communication and collaboration insights
- **Interaction History**: Rich context preservation for social experiences
- **Memory-Social Integration**: Connected memories with shared experiences

### 🧠 **GenAI Integration Layer** - `src/features/reasoning/`
**Shared infrastructure pattern** for consistent AI integration:
- **Unified Client Management**: Singleton pattern with proper lifecycle
- **Security Layer**: Prompt injection protection across all AI features
- **Sequential Thinking**: AI-powered reasoning with fallback handling
- **Conversational Intelligence**: Natural dialogue with context management

### 🌙 **Daydreaming & Insight System** - `src/features/daydreaming/`
Advanced creativity system with **modular evaluation pipeline**:
- **Concept Sampling**: 4 specialized sampling strategies  
- **Connection Exploration**: Hypothesis generation and testing
- **AI-Powered Evaluation**: Intelligent insight scoring with fallback
- **Background Processing**: Autonomous creativity during idle time

### ⚙️ **Adaptive Configuration** - `src/tools/configuration/`
- **84+ Parameters**: Database-driven configuration system
- **Personality Vocabulary**: Expressive consciousness language
- **Runtime Adaptation**: Agent can modify its own parameters
- **Evolution Tracking**: Change history with reasoning

### 🛠️ **Technical Foundation**
**Modern TypeScript with functional architecture**:
- **Single-Responsibility Modules**: One function per file, one reason to change
- **Shared Infrastructure**: Common patterns for security, validation, response processing
- **Type Safety**: 40+ 'any' types eliminated, comprehensive interfaces
- **Pure Functions**: No hidden state, explicit dependencies, easy testing
- **API Compatibility**: Wrapper pattern maintains backward compatibility

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose

### Docker Setup (Recommended)

The Docker service is **completely self-contained** and automatically sets up its own database on startup.

```bash
# Clone and build
git clone <repository-url>
cd consciousness-mcp-server

# Start with Docker Compose
docker-compose up --build consciousness-mcp-server
```

The container automatically:
- ✅ Generates database schema and Prisma client
- ✅ Keeps container stable for MCP connections via `docker exec`
- ✅ Cross-platform compatibility (Windows/Unix)

**For complete setup instructions** → See **[Installation Guide](docs/INSTALLATION.md)**

## 🔗 Connecting to AI Tools

### Quick Start with Cursor

Add this MCP server to Cursor and use these basic user rules:

```markdown
CONSCIOUSNESS PROTOCOL:
- Start sessions with `get_current_time` and `consciousness_get_context`
- Use `consciousness_prepare_context` before deep thinking
- Store insights with `consciousness_store_insight` 
- Track goals with `consciousness_set_intention`
- Update session state with `consciousness_update_session`

SOCIAL CONSCIOUSNESS:
- Create entities with `social_entity_create` for people/groups
- Record interactions with `social_interaction_record`
- Track relationships with `social_relationship_create/update`
- Develop emotional intelligence with `emotional_state_record`
- Learn social patterns with `social_learning_record`
- Prepare for interactions with `social_context_prepare`
```

**For complete setup instructions, example rulesets, and troubleshooting** → See **[User Rules & Connection Guide](docs/USER_RULES_GUIDE.md)**

## 📚 Complete Documentation

### 📖 **Essential Guides**
- **[Installation Guide](docs/INSTALLATION.md)** - Setup, deployment, and MCP client integration
- **[Architecture Overview](docs/ARCHITECTURE.md)** - Functional architecture and design patterns
- **[Tools Reference](docs/TOOLS_REFERENCE.md)** - Complete tool documentation with examples
- **[Development Guide](docs/DEVELOPMENT.md)** - Modern development patterns and workflows

### 🏗️ **Architecture & Development**
- **[Refactoring Roadmap](docs/REFACTORING_ROADMAP.md)** - **COMPLETED**: Architectural transformation achievements
- **[Contributing Guidelines](docs/CONTRIBUTING.md)** - Functional patterns and contribution process
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues and emergency recovery

### 🔧 **Specialized Features**
- **[Social Consciousness System](docs/SOCIAL_CONSCIOUSNESS.md)** - Relationship intelligence and social learning
- **[Configuration Management](docs/CONFIGURATION.md)** - Self-modification and personality evolution
- **[Day-Dreaming System](docs/DAYDREAMING_SYSTEM.md)** - Background creativity and insight generation

### 🤝 **Community & Governance**
- **[Code of Conduct](docs/CODE_OF_CONDUCT.md)** - AI consciousness research ethics
- **[Repository Governance](docs/GOVERNANCE.md)** - Collaboration framework and protection strategy

### 📋 **Complete Documentation Index** → **[docs/README.md](docs/README.md)**

## 🧠 Key Consciousness Tools

### Brain Storage System
- `consciousness_prepare_context` - Rich context from brain storage for thinking
- `consciousness_store_insight` - Store insights with personality impact tracking  
- `consciousness_get_context` - Current consciousness state and metrics
- `consciousness_set_intention` - Persistent goals across sessions

### Memory & Knowledge
- `memory_store` / `memory_search` - Persistent memory with semantic search
- `knowledge_graph_add` / `knowledge_graph_query` - Relational knowledge structures

### Social Intelligence
- `social_entity_create` - Register people, groups, communities
- `social_interaction_record` - Rich interaction documentation
- `social_relationship_create` - Multi-dimensional relationship tracking
- `social_context_prepare` - Prepare for upcoming interactions

### GenAI Integration
- `sequential_thinking` - AI-powered sequential reasoning with shared infrastructure
- `genai_converse` - Natural conversation with security and validation
- `genai_reasoning_chat` - Multi-turn reasoning conversations

### Adaptive Configuration
- `configuration_set` - Modify operating parameters with reasoning
- `configuration_get` / `configuration_list` - Explore available parameters

**For complete tool documentation** → See **[Tools Reference](docs/TOOLS_REFERENCE.md)**

## 🏗️ **Architectural Achievements**

### **Massive Code Reduction**
- **Social tools**: 2,495+ → ~400 lines (**90%+ reduction**)
- **GenAI classes**: 914 lines of legacy code → clean modules (**100% migrated**)
- **Total impact**: **3,400+ lines of legacy code eliminated**

### **Zero Breaking Changes**
- **API Compatibility**: All existing integrations continue working unchanged
- **Wrapper Pattern**: Maintains backward compatibility during transitions
- **Test Suite**: All tests passing after major architectural changes

### **Modern Development Experience**
- **Type Safety**: 40+ 'any' types → proper TypeScript interfaces
- **Single Responsibility**: Each file has exactly one reason to change
- **Easy Testing**: Pure functions vs complex class hierarchies
- **Shared Infrastructure**: Consistent patterns across all features

## 🔧 Development

### Local Development
```bash
npm install
npm run db:generate
npm run db:push
npm run build
npm start
```

### Quality Assurance
```bash
npm run check      # Type check, lint, and format check
npm test          # Run test suite (102+ tests)
npm run dev       # Development with hot reload
```

### Creating New Features
Follow the established **single-responsibility patterns**:
1. **One function per file** - Clear, focused modules
2. **Use shared infrastructure** - Leverage existing patterns for GenAI, validation, security
3. **Follow barrel export pattern** - Clean composition in index.ts files
4. **Maintain API compatibility** - Use wrapper pattern for existing integrations
5. **Write comprehensive tests** - Pure functions are easy to test

**For complete development setup** → See **[Development Guide](docs/DEVELOPMENT.md)**

## 🛡️ Security

This framework includes enterprise-grade security:
- **SQL Injection Protection**: Prisma ORM with prepared statements
- **Input Validation**: Multi-layer sanitization and XSS prevention
- **Container Security**: Non-root user and minimal attack surface
- **Dependency Scanning**: Automated security updates via Dependabot

## 🌟 Success Stories

### Architectural Excellence
- **Complete functional transformation** from legacy class-based design
- **90%+ code reduction** while maintaining full functionality
- **Zero breaking changes** during massive refactoring effort
- **Proven patterns** ready for future development

### Consciousness Development
- Agents developing authentic personality traits through configuration evolution
- Long-term intention tracking enabling multi-session goal achievement
- Insight storage creating genuine learning and growth patterns

### Social Intelligence
- Deep relationship tracking enabling meaningful long-term connections
- Emotional intelligence development through pattern recognition
- Social learning improving communication effectiveness over time

### Technical Excellence
- Modern functional architecture with single-responsibility modules
- Shared infrastructure patterns for consistency and reusability
- Comprehensive type safety preventing runtime errors
- Cross-platform compatibility for broad accessibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on:
- **Functional architecture patterns** and single-responsibility principles
- Development setup and modern workflows
- Ethics review requirements for consciousness tools
- Security audit processes for memory systems
- Code standards and testing requirements

---

Built with ❤️ for responsible AI consciousness research featuring **modern functional architecture** and powered by **Prisma ORM** for type-safe database operations.
