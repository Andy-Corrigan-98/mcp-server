/**
 * Functional Conversational Reasoning Tools
 * Provides secure GenAI conversation functionality using single-responsibility modules
 *
 * Single-responsibility modules:
 * - Security: Prompt injection detection and content sanitization
 * - Client: GenAI initialization and configuration
 * - Simple Conversation: Direct Q&A interactions
 * - Multi-turn Chat: Context-aware conversation management
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { simpleConversation, multiTurnChat } from '../conversation/index.js';

/**
 * Tool definitions for conversational GenAI reasoning
 */
export const CONVERSATIONAL_GENAI_TOOLS: Record<string, Tool> = {
  genai_converse: {
    name: 'genai_converse',
    description:
      'Have a natural conversation with Google GenAI (Gemini) for reasoning, analysis, and problem-solving. Ask questions directly without complex formatting.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'Your question or topic for the AI to reason about. Be direct and natural.',
        },
        context: {
          type: 'string',
          description: 'Optional context or background information to help the AI understand your question better.',
        },
      },
      required: ['question'],
    },
  },

  genai_reasoning_chat: {
    name: 'genai_reasoning_chat',
    description:
      'Engage in multi-turn reasoning conversation with GenAI, maintaining context across exchanges. Perfect for complex problem-solving that requires back-and-forth discussion.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'Your current question or response in the ongoing conversation.',
        },
        history: {
          type: 'array',
          description: 'Previous conversation exchanges to maintain context.',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              response: { type: 'string' },
            },
          },
        },
      },
      required: ['question'],
    },
  },
};

/**
 * Get all available conversational GenAI reasoning tools
 */
export const getTools = (): Record<string, Tool> => {
  return CONVERSATIONAL_GENAI_TOOLS;
};

/**
 * Execute a conversational GenAI reasoning tool operation
 * Routes to the appropriate functional module with proper type validation
 */
export const execute = async (toolName: string, args: Record<string, unknown>): Promise<unknown> => {
  switch (toolName) {
    case 'genai_converse':
      // Validate required fields for ConverseArgs
      if (typeof args.question !== 'string') {
        throw new Error('Question is required and must be a string');
      }
      return simpleConversation({
        question: args.question,
        context: typeof args.context === 'string' ? args.context : undefined,
      });

    case 'genai_reasoning_chat':
      // Validate required fields for ReasoningChatArgs
      if (typeof args.question !== 'string') {
        throw new Error('Question is required and must be a string');
      }
      return multiTurnChat({
        question: args.question,
        history: Array.isArray(args.history) ? args.history : undefined,
      });

    default:
      throw new Error(`Unknown conversational GenAI tool: ${toolName}`);
  }
};

/**
 * Export the functional conversational reasoning tools interface
 * This can replace the class-based ConversationalGenAITools
 */
export const ConversationalReasoningTools = {
  getTools,
  execute,
};
