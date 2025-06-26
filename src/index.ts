#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  ListToolsResult,
  Tool,
  TextContent,
  ImageContent,
} from '@modelcontextprotocol/sdk/types.js';
import { EchoToolsRegistry } from './tools/registry.js';

class EchoMCPServer {
  private server: Server;
  private toolsRegistry: EchoToolsRegistry;

  constructor() {
    this.server = new Server(
      {
        name: 'echo-mcp-server',
        version: '1.0.0',
      }
    );

    this.toolsRegistry = new EchoToolsRegistry();
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
    console.error('Echo MCP Server started successfully');
  }
}

// Start the server
const server = new EchoMCPServer();
server.run().catch((error) => {
  console.error('Failed to start Echo MCP Server:', error);
  process.exit(1);
}); 