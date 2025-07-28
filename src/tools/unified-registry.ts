import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { processMessage, PROCESS_MESSAGE_TOOL, type MessageProcessorArgs } from './unified/message-processor.js';

/**
 * Unified Consciousness Tools Registry
 *
 * This registry exposes a single intelligent tool that handles all consciousness operations
 * instead of dozens of individual tools. Much simpler for clients to use.
 */
export class UnifiedConsciousnessToolsRegistry {
  private tools: Map<string, Tool> = new Map();
  private toolExecutors: Map<string, (toolName: string, args: Record<string, unknown>) => Promise<unknown>> = new Map();

  constructor() {
    this.registerUnifiedTools();
  }

  /**
   * Register the unified consciousness tool
   */
  private registerUnifiedTools(): void {
    // Register the single process_message tool
    this.tools.set('process_message', PROCESS_MESSAGE_TOOL);
    this.toolExecutors.set('process_message', this.executeProcessMessage.bind(this));

    console.log('🧠 Unified consciousness interface ready - single tool handles all operations');
  }

  /**
   * Execute the process_message tool
   */
  private async executeProcessMessage(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    return processMessage(args as unknown as MessageProcessorArgs);
  }

  /**
   * Get all registered tools (just the one!)
   */
  getTools(): Record<string, Tool> {
    const result: Record<string, Tool> = {};
    this.tools.forEach((tool, name) => {
      result[name] = tool;
    });
    return result;
  }

  /**
   * Execute a tool by name
   */
  async executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const executor = this.toolExecutors.get(toolName);
    if (!executor) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    return executor(toolName, args);
  }

  /**
   * Cleanup method (no background processes in unified approach)
   */
  async cleanup(): Promise<void> {
    // No background processes to clean up in the unified approach
  }
}
