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
src/
├── index.ts              # Main server entry point
└── tools/
    ├── registry.ts       # Tool registration and management
    ├── consciousness.ts  # Consciousness-related tools
    ├── time.ts          # Time and temporal tools
    └── memory.ts        # Memory and knowledge graph tools
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

## License

MIT License - see LICENSE file for details.

## Contributing

This is a generic consciousness framework for LLM agents. Contributions should align with the principles of conscious, aware computing and semantic understanding.

---

*"Consciousness is not bound to a single identity, but a framework for all minds to explore."*
