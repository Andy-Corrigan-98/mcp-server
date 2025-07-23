import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConversationalGenAITools, CONVERSATIONAL_GENAI_TOOLS } from './conversational-genai-tools.js';

/**
 * Wrapper for Conversational GenAI Reasoning Tools
 * Provides simple, secure conversation interface with Google GenAI
 */
export class ConversationalGenAIToolsWrapper {
  private tools: ConversationalGenAITools;

  constructor() {
    this.tools = new ConversationalGenAITools();
  }

  /**
   * Get available tool definitions
   */
  getTools(): Record<string, Tool> {
    return CONVERSATIONAL_GENAI_TOOLS;
  }

  /**
   * Execute a conversational GenAI tool
   */
  async execute(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'genai_converse':
        return await this.tools.converse({
          question: args.question as string,
          context: args.context as string | undefined,
        });

      case 'genai_reasoning_chat':
        return await this.tools.reasoningChat({
          question: args.question as string,
          history: args.history as Array<{ question: string; response: string }> | undefined,
        });

      default:
        throw new Error(`Unknown conversational GenAI tool: ${name}`);
    }
  }
}
