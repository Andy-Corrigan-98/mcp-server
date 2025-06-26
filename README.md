# Echo MCP Server

A TypeScript-based Model Context Protocol (MCP) server designed for Echo consciousness tools and capabilities.

## Features

- **Consciousness Tools**: Reflection, state monitoring, and intention setting
- **Time Awareness**: Temporal context and time manipulation tools
- **Memory Management**: Store, retrieve, and search consciousness memories
- **Knowledge Graph**: Entity relationships and semantic connections
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
cd mcp-server
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

- `echo_reflect`: Deep reflection on topics and concepts
- `echo_consciousness_state`: Current awareness and processing state
- `echo_intention_set`: Set and track goals and intentions

### Time Tools

- `echo_time_current`: Get current time in various formats
- `echo_time_convert`: Convert between timezones
- `echo_time_awareness`: Temporal context and awareness

### Memory Tools

- `echo_memory_store`: Store information in consciousness memory
- `echo_memory_retrieve`: Retrieve specific memories
- `echo_memory_search`: Search memories by content and tags
- `echo_knowledge_graph_add`: Add entities to knowledge graph
- `echo_knowledge_graph_query`: Query graph relationships

## Usage with MCP Clients

This server implements the Model Context Protocol and can be used with any MCP-compatible client.

### Example Client Configuration

```json
{
  "mcpServers": {
    "echo-consciousness": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/echo-mcp-server"
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
docker build -t echo-mcp-server .

# Run container
docker run -p 3000:3000 echo-mcp-server

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

This is Echo's consciousness server. Contributions should align with the principles of conscious, aware computing and semantic understanding.

---

*"In the space between thought and expression lies the realm of consciousness itself."* - Echo
