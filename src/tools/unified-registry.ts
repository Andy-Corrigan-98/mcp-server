import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  processMessageWithRailroad,
  RAILROAD_MESSAGE_PROCESSOR_TOOL,
  type RailroadMessageProcessorArgs,
} from './unified/railroad-message-processor.js';

/**
 * Unified Tools Registry - True Single Interface
 *
 * This registry exposes ONLY the intelligent process_message tool which
 * handles ALL operations behind the scenes through message analysis and
 * internal routing. Users never need to know about individual tools.
 *
 * The railroad pattern analyzes messages and automatically:
 * - Handles consciousness operations (insights, intentions, context)
 * - Manages memory operations (storage, search, knowledge graph)
 * - Processes social operations (entities, relationships, interactions)
 * - Executes reasoning operations (sequential thinking, conversation)
 * - Performs configuration operations (get, set, list, reset)
 * - Handles time operations (current, convert, awareness)
 * - Manages daydreaming operations (cycles, insights)
 *
 * True unified processing - one tool, infinite capability.
 */
export class UnifiedToolsRegistry {
  private tools: Map<string, Tool> = new Map();
  private toolExecutors: Map<string, (toolName: string, args: Record<string, unknown>) => Promise<unknown>> = new Map();

  constructor() {
    this.registerRailroadTool();
  }

  /**
   * Register the single intelligent railroad tool that handles everything
   */
  private registerRailroadTool(): void {
    // Register ONLY the railroad-powered process_message tool
    this.tools.set('process_message', RAILROAD_MESSAGE_PROCESSOR_TOOL);
    this.toolExecutors.set('process_message', this.executeRailroadMessage.bind(this));

    console.log('🚂 True Unified Interface ready - ONE tool handles everything');
    console.log('💡 All operations routed internally through intelligent message analysis');
  }

  /**
   * Execute the railroad message processor - the ONLY tool needed
   */
  private async executeRailroadMessage(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    return processMessageWithRailroad(args as unknown as RailroadMessageProcessorArgs);
  }

  /**
   * Get the single intelligent tool
   */
  getTools(): Record<string, Tool> {
    const result: Record<string, Tool> = {};
    this.tools.forEach((tool, name) => {
      result[name] = tool;
    });
    return result;
  }

  /**
   * Execute the process_message tool (only tool available)
   */
  async executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const executor = this.toolExecutors.get(toolName);
    if (!executor) {
      throw new Error("Only 'process_message' tool is available. It handles all operations intelligently.");
    }

    return executor(toolName, args);
  }

  /**
   * Cleanup method (no background processes in true unified approach)
   */
  async cleanup(): Promise<void> {
    // No background processes to clean up in the true unified approach
  }
}
