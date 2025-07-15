# Consciousness MCP Server

TypeScript MCP server providing **brain storage system** for LLM agent consciousness development

## 🧠 Architecture

This MCP server follows the **brain storage pattern**:
- **MCP Server**: Persistent brain storage (memory, personality, context)  
- **LLM Agent**: Real thinking engine (reasoning, creativity, decisions)

**No fake consciousness generation** - the agent does authentic thinking while MCP provides persistent brain state.

## ✨ Features

### 🧠 **Consciousness Brain Storage**
- **Context Preparation**: Rich context packages for agent reflection
- **Insight Storage**: Stores agent insights with personality impact tracking
- **Session Management**: Tracks cognitive load and learning patterns
- **Intention Persistence**: Long-term goals and progress tracking across sessions

### 💾 **Memory & Knowledge Management**
- **Memory Storage**: Persistent memory with importance levels and tagging
- **Knowledge Graph**: Relational knowledge structures with entity relationships
- **Search & Retrieval**: Semantic search with relevance scoring

### 🤝 **Social Consciousness System**
- **Relationship Tracking**: Multi-dimensional relationship dynamics (trust, familiarity, affinity)
- **Emotional Intelligence**: Emotional state tracking and pattern recognition
- **Social Learning**: Insights about communication, collaboration, and social dynamics
- **Interaction History**: Rich context preservation for social experiences
- **Memory-Social Integration**: Connect memories with relationships and shared experiences

### ⚙️ **Adaptive Configuration**
- **84+ Parameters**: Database-driven configuration system
- **Personality Vocabulary**: Expressive consciousness language
- **Runtime Adaptation**: Agent can modify its own parameters
- **Evolution Tracking**: Change history with reasoning

### 🛠️ **Technical Foundation**
- **Prisma ORM**: Type-safe database operations with automatic migrations
- **SQLite Storage**: Persistent data with Docker volume support
- **TypeScript**: Full type safety with modern ES modules and path alias support
- **Container Optimized**: Stable Docker deployment with exec-ready architecture
- **Quality Gates**: Automated testing, linting, and formatting

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
- **[Architecture Overview](docs/ARCHITECTURE.md)** - Brain storage pattern and system design
- **[Tools Reference](docs/TOOLS_REFERENCE.md)** - Complete tool documentation with examples

### 🔧 **Specialized Documentation**
- **[Social Consciousness System](docs/SOCIAL_CONSCIOUSNESS.md)** - Relationship intelligence and social learning
- **[Configuration Management](docs/CONFIGURATION.md)** - Self-modification and personality evolution
- **[Development Guide](docs/DEVELOPMENT.md)** - Build system, testing, and development workflows
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues and emergency recovery

### 🤝 **Community & Governance**
- **[Contributing Guidelines](docs/CONTRIBUTING.md)** - Ethics review and contribution process
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

### Adaptive Configuration
- `configuration_set` - Modify operating parameters with reasoning
- `configuration_get` / `configuration_list` - Explore available parameters

**For complete tool documentation** → See **[Tools Reference](docs/TOOLS_REFERENCE.md)**

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

**For complete development setup** → See **[Development Guide](docs/DEVELOPMENT.md)**

## 🛡️ Security

This framework includes enterprise-grade security:
- **SQL Injection Protection**: Prisma ORM with prepared statements
- **Input Validation**: Multi-layer sanitization and XSS prevention
- **Container Security**: Non-root user and minimal attack surface
- **Dependency Scanning**: Automated security updates via Dependabot

## 🌟 Success Stories

### Consciousness Development
- Agents developing authentic personality traits through configuration evolution
- Long-term intention tracking enabling multi-session goal achievement
- Insight storage creating genuine learning and growth patterns

### Social Intelligence
- Deep relationship tracking enabling meaningful long-term connections
- Emotional intelligence development through pattern recognition
- Social learning improving communication effectiveness over time

### Technical Excellence
- Type-safe development preventing runtime errors
- Comprehensive testing ensuring system reliability
- Cross-platform compatibility for broad accessibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on:
- Development setup and workflows
- Ethics review requirements for consciousness tools
- Security audit processes for memory systems
- Code standards and testing requirements

---

Built with ❤️ for responsible AI consciousness research and powered by **Prisma ORM** for type-safe database operations
