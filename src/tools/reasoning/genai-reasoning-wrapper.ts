import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolExecutor } from '../base/index.js';
import { FunctionalGenAIReasoningTools } from '../../features/reasoning/genai-reasoning/index.js';

/**
 * Wrapper for Functional GenAI Reasoning Tools
 * Updated to use functional single-responsibility modules instead of class-based approach
 */
export class GenAIReasoningToolsWrapper extends ToolExecutor {
  protected category = 'genai_reasoning';
  private functionalTools = FunctionalGenAIReasoningTools;

  // Define tool handlers using the new pattern
  protected toolHandlers = {
    sequential_thinking: this.handleSequentialThinking.bind(this),
  };

  constructor() {
    super();
  }

  /**
   * Get available GenAI reasoning tools
   */
  getTools(): Record<string, Tool> {
    return this.functionalTools.getTools();
  }

  /**
   * Handle sequential thinking tool using functional approach
   */
  private async handleSequentialThinking(args: Record<string, unknown>): Promise<unknown> {
    return await this.functionalTools.execute('sequential_thinking', args);
  }
}
