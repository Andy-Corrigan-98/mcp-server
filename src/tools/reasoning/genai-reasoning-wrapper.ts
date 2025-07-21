import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolExecutor } from '../base/index.js';
import { GenAIReasoningTools, GENAI_REASONING_TOOLS } from './genai-reasoning-tools.js';

/**
 * Wrapper for GenAI reasoning tools that uses the new ToolExecutor pattern
 * Demonstrates how existing wrappers can benefit from pattern extraction
 */
export class GenAIReasoningToolsWrapper extends ToolExecutor {
  protected category = 'genai_reasoning';
  private genAITools: GenAIReasoningTools;

  // Define tool handlers using the new pattern
  protected toolHandlers = {
    sequential_thinking: this.handleSequentialThinking.bind(this),
  };

  constructor() {
    super();
    this.genAITools = new GenAIReasoningTools();
  }

  /**
   * Get available GenAI reasoning tools
   */
  getTools(): Record<string, Tool> {
    return GENAI_REASONING_TOOLS;
  }

  /**
   * Handle sequential thinking tool
   */
  private async handleSequentialThinking(args: Record<string, unknown>): Promise<unknown> {
    return await this.genAITools.sequentialThinking(args);
  }
}
