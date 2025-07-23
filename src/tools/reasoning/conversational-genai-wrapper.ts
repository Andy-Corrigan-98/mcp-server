import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { FunctionalConversationalReasoningTools } from '../../features/reasoning/conversational/index.js';

/**
 * Wrapper for Functional Conversational GenAI Reasoning Tools
 * Provides simple, secure conversation interface with Google GenAI
 * Now using functional single-responsibility modules instead of class-based approach
 */
export class ConversationalGenAIToolsWrapper {
  private functionalTools = FunctionalConversationalReasoningTools;

  /**
   * Get available tool definitions
   */
  getTools(): Record<string, Tool> {
    return this.functionalTools.getTools();
  }

  /**
   * Execute a conversational GenAI tool using functional approach
   */
  async execute(name: string, args: Record<string, unknown>): Promise<unknown> {
    return this.functionalTools.execute(name, args);
  }
}
