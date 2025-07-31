import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ErrorFactory } from '../../utils/index.js';

// Constants to avoid magic numbers
const MAX_LOG_STRING_LENGTH = 200;

/**
 * Generic base class for tool execution that eliminates repetitive switch statement patterns
 * Now with standardized error handling using ErrorFactory
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
   * Now with enhanced error handling using ErrorFactory
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const handler = this.toolHandlers[toolName];

    if (!handler) {
      throw ErrorFactory.toolNotFound(toolName, this.category, {
        availableTools: this.getSupportedTools(),
      });
    }

    try {
      return await handler(args);
    } catch (error) {
      // Enhanced error context with tool execution details
      if (error instanceof Error) {
        throw ErrorFactory.toolExecutionFailed(toolName, this.category, error, {
          args: this.sanitizeArgsForLogging(args),
          availableTools: this.getSupportedTools(),
        });
      }

      throw ErrorFactory.toolExecutionFailed(toolName, this.category, new Error(String(error)), {
        args: this.sanitizeArgsForLogging(args),
      });
    }
  }

  /**
   * Helper method to validate tool exists before execution
   */
  protected validateTool(toolName: string): void {
    if (!this.toolHandlers[toolName]) {
      throw ErrorFactory.operationNotSupported(toolName, this.category, {
        availableTools: this.getSupportedTools(),
      });
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

  /**
   * Sanitize arguments for logging (remove sensitive data)
   */
  private sanitizeArgsForLogging(args: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...args };

    // Remove potentially sensitive fields
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth', 'api_key'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Truncate long strings
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string' && value.length > MAX_LOG_STRING_LENGTH) {
        sanitized[key] = value.substring(0, MAX_LOG_STRING_LENGTH) + '...[TRUNCATED]';
      }
    }

    return sanitized;
  }
}

