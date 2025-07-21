import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Generic base class for tool execution that eliminates repetitive switch statement patterns
 *
 * Usage:
 * export class MyTools extends ToolExecutor {
 *   protected category = 'my_tool';
 *   protected toolHandlers = {
 *     'my_tool_action': this.handleAction.bind(this),
 *     'my_tool_query': this.handleQuery.bind(this)
 *   };
 * }
 */
export abstract class ToolExecutor {
  protected abstract category: string;
  protected abstract toolHandlers: Record<string, (args: Record<string, unknown>) => Promise<unknown>>;

  /**
   * Get available tools - must be implemented by subclasses
   */
  abstract getTools(): Record<string, Tool>;

  /**
   * Generic execute method that eliminates switch statement boilerplate
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const handler = this.toolHandlers[toolName];

    if (!handler) {
      throw new Error(`Unknown ${this.category} tool: ${toolName}`);
    }

    try {
      return await handler(args);
    } catch (error) {
      // Enhance error context
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`${this.category} tool '${toolName}' failed: ${errorMessage}`);
    }
  }

  /**
   * Helper method to validate tool exists before execution
   */
  protected validateTool(toolName: string): void {
    if (!this.toolHandlers[toolName]) {
      throw new Error(`Tool '${toolName}' is not supported by ${this.category} module`);
    }
  }

  /**
   * Helper to get tool handler for testing or introspection
   */
  protected getToolHandler(toolName: string): ((args: Record<string, unknown>) => Promise<unknown>) | undefined {
    return this.toolHandlers[toolName];
  }

  /**
   * Get list of supported tool names
   */
  getSupportedTools(): string[] {
    return Object.keys(this.toolHandlers);
  }
}
