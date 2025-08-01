/**
 * GenAI Reasoning Tools
 * Provides GenAI reasoning capabilities through single-responsibility modules
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { sequentialThinking, SequentialThinkingArgs } from './sequential-thinking.js';

/**
 * Tool definitions for GenAI-powered reasoning
 */
export const GENAI_REASONING_TOOLS: Record<string, Tool> = {
  sequential_thinking: {
    name: 'sequential_thinking',
    description:
      'Advanced AI-powered reasoning system using Google GenAI for sophisticated problem-solving, analysis, and step-by-step thinking. Much more powerful than traditional algorithmic reasoning.',
    inputSchema: {
      type: 'object',
      properties: {
        thought: {
          type: 'string',
          description: 'The problem, question, or thinking step to analyze with AI reasoning',
        },
        next_thought_needed: {
          type: 'boolean',
          description: 'Whether another thought step is needed after this one',
        },
        thought_number: {
          type: 'integer',
          description: 'Current thought step number',
          minimum: 1,
        },
        total_thoughts: {
          type: 'integer',
          description: 'Estimated total thought steps needed',
          minimum: 1,
        },
        is_revision: {
          type: 'boolean',
          description: 'Whether this revises previous thinking',
          default: false,
        },
        revises_thought: {
          type: 'integer',
          description: 'Which thought number is being reconsidered',
          minimum: 1,
        },
        branch_from_thought: {
          type: 'integer',
          description: 'Branching point thought number for alternative reasoning paths',
          minimum: 1,
        },
        branch_id: {
          type: 'string',
          description: 'Identifier for this reasoning branch',
        },
        needs_more_thoughts: {
          type: 'boolean',
          description: 'Whether additional analysis beyond current estimate is needed',
          default: false,
        },
      },
      required: ['thought', 'next_thought_needed', 'thought_number', 'total_thoughts'],
    },
  },
};

/**
 * Get all available GenAI reasoning tools
 */
export const getTools = (): Record<string, Tool> => {
  return GENAI_REASONING_TOOLS;
};

/**
 * Handler for sequential thinking operations
 */
async function handleSequentialThinking(args: Record<string, unknown>): Promise<unknown> {
  // Validate required fields for SequentialThinkingArgs
  if (typeof args.thought !== 'string') {
    throw new Error('Thought is required and must be a string');
  }
  if (typeof args.next_thought_needed !== 'boolean') {
    throw new Error('next_thought_needed is required and must be a boolean');
  }
  if (typeof args.thought_number !== 'number') {
    throw new Error('thought_number is required and must be a number');
  }
  if (typeof args.total_thoughts !== 'number') {
    throw new Error('total_thoughts is required and must be a number');
  }

  const sequentialArgs: SequentialThinkingArgs = {
    thought: args.thought,
    next_thought_needed: args.next_thought_needed,
    thought_number: args.thought_number,
    total_thoughts: args.total_thoughts,
    is_revision: typeof args.is_revision === 'boolean' ? args.is_revision : undefined,
    revises_thought: typeof args.revises_thought === 'number' ? args.revises_thought : undefined,
    branch_from_thought: typeof args.branch_from_thought === 'number' ? args.branch_from_thought : undefined,
    branch_id: typeof args.branch_id === 'string' ? args.branch_id : undefined,
    needs_more_thoughts: typeof args.needs_more_thoughts === 'boolean' ? args.needs_more_thoughts : undefined,
  };

  return sequentialThinking(sequentialArgs);
}

/**
 * Handler mapping for GenAI reasoning operations
 * Eliminates switch statement pattern for better maintainability
 */
const REASONING_HANDLERS: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  sequential_thinking: handleSequentialThinking,
};

/**
 * Execute a GenAI reasoning tool operation
 * Routes to the appropriate handler with clean mapping pattern
 */
export const execute = async (toolName: string, args: Record<string, unknown>): Promise<unknown> => {
  const handler = REASONING_HANDLERS[toolName];

  if (!handler) {
    const availableTools = Object.keys(REASONING_HANDLERS).join(', ');
    throw new Error(`Unknown GenAI reasoning tool: ${toolName}. Available tools: ${availableTools}`);
  }

  return handler(args);
};

/**
 * Export the GenAI reasoning tools interface
 * This provides a clean interface for GenAI reasoning operations
 */
export const GenAIReasoningTools = {
  getTools,
  execute,
};
