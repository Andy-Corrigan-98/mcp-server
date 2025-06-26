#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  ListToolsResult,
  TextContent,
} from '@modelcontextprotocol/sdk/types.js';
import { ConsciousnessToolsRegistry } from './tools/registry.js';

class ConsciousnessMCPServer {
  private server: Server;
  private toolsRegistry: ConsciousnessToolsRegistry;

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

    this.toolsRegistry = new ConsciousnessToolsRegistry();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
      return {
        tools: this.toolsRegistry.getAllTools(),
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
    console.error('Consciousness MCP Server started successfully');
  }
}

// Start the server
const server = new ConsciousnessMCPServer();
server.run().catch((error: Error) => {
  console.error('Failed to start Consciousness MCP Server:', error);
  process.exit(1);
});
