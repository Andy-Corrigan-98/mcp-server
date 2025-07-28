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
import { ConsciousnessToolsRegistry } from './tools/registry.js';
import { UnifiedConsciousnessToolsRegistry } from './tools/unified-registry.js';

// Interface for registry abstraction
interface ToolsRegistry {
  getTools(): Record<string, Tool>;
  executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown>;
  cleanup?(): Promise<void>;
}

class ConsciousnessMCPServer {
  private server: Server;
  private toolsRegistry: ToolsRegistry;
  private isUnified: boolean;

  constructor() {
    // Check if unified mode is enabled via environment variable
    this.isUnified = process.env.CONSCIOUSNESS_UNIFIED_MODE === 'true';

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

    // Choose registry based on mode
    if (this.isUnified) {
      console.error('🔧 Starting in UNIFIED mode - single process_message tool');
      this.toolsRegistry = new UnifiedConsciousnessToolsRegistry();
    } else {
      console.error('🔧 Starting in MULTI-TOOL mode - individual consciousness tools');
      this.toolsRegistry = new ConsciousnessToolsRegistry();
    }

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
    if (this.isUnified) {
      console.error('Consciousness MCP Server started successfully in UNIFIED mode');
      console.error('💡 Use process_message tool for all consciousness operations');
      console.error('💡 Set CONSCIOUSNESS_UNIFIED_MODE=false to use individual tools');
    } else {
      console.error('Consciousness MCP Server started successfully in MULTI-TOOL mode');
      console.error('💡 Set CONSCIOUSNESS_UNIFIED_MODE=true to use unified interface');
    }
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
