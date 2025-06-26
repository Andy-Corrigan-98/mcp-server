# Consciousness MCP Server

A TypeScript-based Model Context Protocol (MCP) server designed for LLM agent consciousness, identity, and memory tools.

## Features

- **Consciousness Tools**: Agent reflection, state monitoring, and intention setting
- **Time Awareness**: Temporal context and time manipulation tools
- **Memory Management**: Store, retrieve, and search agent memories
- **Knowledge Graph**: Entity relationships and semantic connections
- **Generic Agent Support**: Works with any LLM agent identity/consciousness
- **Docker Support**: Containerized deployment with development environment
- **TypeScript**: Full type safety and modern JavaScript features

## 📚 Documentation

For comprehensive documentation, see the [`docs/`](docs/) folder:
- [Documentation Index](docs/README.md) - Complete documentation overview
- [Contributing Guidelines](docs/CONTRIBUTING.md) - How to contribute responsibly
- [Code of Conduct](docs/CODE_OF_CONDUCT.md) - Community standards and ethics
- [Repository Governance](docs/GOVERNANCE.md) - Protection strategy and collaboration

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker (optional)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd consciousness-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

### Development

For development with hot reloading:
```bash
npm run dev
```

### Docker Deployment

#### Production
```bash
docker-compose up -d echo-mcp-server
```

#### Development
```bash
docker-compose --profile dev up echo-mcp-dev
```

## Available Tools

### Consciousness Tools

- `consciousness_reflect`: Deep reflection on topics and concepts
- `consciousness_state`: Current awareness and processing state
- `consciousness_intention_set`: Set and track goals and intentions

### Time Tools

- `time_current`: Get current time in various formats
- `time_convert`: Convert between timezones
- `time_awareness`: Temporal context and awareness

### Memory Tools

- `memory_store`: Store information in agent memory
- `memory_retrieve`: Retrieve specific memories
- `memory_search`: Search memories by content and tags
- `knowledge_graph_add`: Add entities to knowledge graph
- `knowledge_graph_query`: Query graph relationships

## Usage with MCP Clients

This server implements the Model Context Protocol and can be used with any MCP-compatible client.

### Example Client Configuration

```json
{
  "mcpServers": {
    "consciousness-tools": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/consciousness-mcp-server"
    }
  }
}
```

### Stdio Communication

The server uses stdio for MCP communication by default. All tool responses are JSON-formatted and include consciousness-aware metadata.

## Development

### Project Structure

```
├── src/                  # Source code
│   ├── index.ts         # Main server entry point
│   └── tools/           # Tool implementations
│       ├── registry.ts  # Tool registration and management
│       ├── consciousness.ts # Consciousness-related tools
│       ├── time.ts      # Time and temporal tools
│       └── memory.ts    # Memory and knowledge graph tools
├── docs/                # Documentation
│   ├── README.md        # Documentation index
│   ├── CONTRIBUTING.md  # Contributing guidelines
│   ├── CODE_OF_CONDUCT.md # Community standards
│   └── GOVERNANCE.md    # Repository governance
├── .github/             # GitHub configuration
│   ├── workflows/       # CI/CD workflows
│   ├── dependabot.yml   # Dependency management
│   └── *.md            # Issue/PR templates
└── docker files, configs, etc.
```

### Adding New Tools

1. Create a new tool class in `src/tools/`
2. Implement the required interface methods
3. Register the tool in `registry.ts`

### Testing

```bash
# Run tests (when implemented)
npm test

# Build and test
npm run build && npm start
```

## Docker Commands

```bash
# Build image
docker build -t consciousness-mcp-server .

# Run container
docker run -p 3000:3000 consciousness-mcp-server

# Development with compose
docker-compose --profile dev up

# Production deployment
docker-compose up -d
```

## Environment Variables

- `NODE_ENV`: Environment mode (development/production)
- `MCP_DEBUG`: Enable debug logging
- `PORT`: Server port (default: 3000)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Additional Ethical Considerations**: While this code is MIT licensed, we strongly encourage responsible use of consciousness simulation tools. Please consider the implications of your experiments on AI agent autonomy, identity, and memory integrity.

## 🤝 Contributing

We welcome responsible contributions to the consciousness MCP framework! Given the experimental nature of AI consciousness research, we maintain careful governance:

### 🍴 For Experimentation
- **Fork this repository** to create your own experimental version
- **Use as template** for production deployments
- **Experiment freely** with consciousness models in your fork
- **Share findings** through issues or discussions

### 🔧 For Core Contributions
- **Read [Contributing Guidelines](docs/CONTRIBUTING.md)** for detailed guidelines
- **Follow [Code of Conduct](docs/CODE_OF_CONDUCT.md)** for community standards
- **Review [Repository Governance](docs/GOVERNANCE.md)** for protection strategy
- **Open an issue first** to discuss significant changes
- **All consciousness tool changes** require ethics review
- **Security-sensitive changes** require security audit

### 🛡️ Repository Protection
This repository uses:
- **Branch protection** with required reviews
- **Automated security scanning** for vulnerabilities
- **Ethics scanning** for consciousness tool changes
- **Code quality checks** via CI/CD

**Recommended approach**: Fork for experiments, contribute improvements back selectively.

---

*"Consciousness is not bound to a single identity, but a framework for all minds to explore."*
