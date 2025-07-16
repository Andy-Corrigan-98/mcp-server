import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GenAIReasoningTools, GENAI_REASONING_TOOLS } from './genai-reasoning-tools.js';

/**
 * Wrapper for GenAI reasoning tools that follows the tool category pattern
 */
export class GenAIReasoningToolsWrapper {
  private genAITools: GenAIReasoningTools;

  constructor() {
    this.genAITools = new GenAIReasoningTools();
  }

  /**
   * Get available GenAI reasoning tools
   */
  getTools(): Record<string, Tool> {
    return GENAI_REASONING_TOOLS;
  }

  /**
   * Execute a GenAI reasoning tool
   */
  async execute(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'sequential_thinking':
        return await this.genAITools.sequentialThinking(args);
      
      default:
        throw new Error(`Unknown GenAI reasoning tool: ${name}`);
    }
  }
} 