import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  processMessageWithRailroad,
  RAILROAD_MESSAGE_PROCESSOR_TOOL,
  type RailroadMessageProcessorArgs,
} from './unified/railroad-message-processor.js';

/**
 * Unified Consciousness Tools Registry - Railroad Pattern
 *
 * This registry exposes a single intelligent tool powered by the railroad pattern
 * that handles all consciousness operations with full traceability and consistency.
 */
export class UnifiedConsciousnessToolsRegistry {
  private tools: Map<string, Tool> = new Map();
  private toolExecutors: Map<string, (toolName: string, args: Record<string, unknown>) => Promise<unknown>> = new Map();

  constructor() {
    this.registerRailroadTools();
  }

  /**
   * Register the railroad-powered consciousness tool
   */
  private registerRailroadTools(): void {
    // Register the single railroad-powered process_message tool
    this.tools.set('process_message', RAILROAD_MESSAGE_PROCESSOR_TOOL);
    this.toolExecutors.set('process_message', this.executeRailroadMessage.bind(this));

    console.log('🚂 Railroad consciousness interface ready - unified, traceable, and reliable');
  }

  /**
   * Execute the railroad message processor
   */
  private async executeRailroadMessage(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    return processMessageWithRailroad(args as unknown as RailroadMessageProcessorArgs);
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
