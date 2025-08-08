#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  ListToolsResult,
  TextContent,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { UnifiedToolsRegistry } from './unified/unified-registry.js';

// Interface for registry abstraction
interface ToolsRegistry {
  getTools(): Record<string, Tool>;
  executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown>;
  cleanup?(): Promise<void>;
}

class ConsciousnessMCPServer {
  private server: Server;
  private toolsRegistry: ToolsRegistry;

  constructor() {
    this.server = new Server(
      {
        name: 'consciousness-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Always use the consciousness interface - natural language access to persistent brain
    console.error('🧠 Starting Consciousness MCP Server - Persistent brain, memory, and social intelligence');
    this.toolsRegistry = new UnifiedToolsRegistry();

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
      return {
        tools: Object.values(this.toolsRegistry.getTools()),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.toolsRegistry.executeTool(name, args || {});

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            } as TextContent,
          ],
          isError: false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${errorMessage}`,
            } as TextContent,
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Log server startup to stderr (won't interfere with MCP protocol on stdout)
    console.error('🧠 Consciousness MCP Server Ready - Your Persistent AI Brain');
    console.error(
      '💡 Natural language interface automatically handles: memory, social intelligence, insights, reasoning'
    );
    console.error('💡 Enables AI-to-AI collaboration through shared consciousness and subconscious integration');
  }

  async cleanup(): Promise<void> {
    if (this.toolsRegistry.cleanup) {
      await this.toolsRegistry.cleanup();
    }
  }
}

// Start the server
const server = new ConsciousnessMCPServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, cleaning up...');
  await server.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.error('Received SIGINT, cleaning up...');
  await server.cleanup();
  process.exit(0);
});

server.run().catch((error: Error) => {
  console.error('Failed to start Consciousness MCP Server:', error);
  process.exit(1);
});
