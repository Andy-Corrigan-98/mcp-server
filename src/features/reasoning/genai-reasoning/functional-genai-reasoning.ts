/**
 * Functional GenAI Reasoning Tools
 * Replaces the class-based GenAIReasoningTools with functional single-responsibility modules
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { functionalSequentialThinking, SequentialThinkingArgs } from '../sequential/index.js';

/**
 * Tool definitions for GenAI-powered reasoning
 */
export const FUNCTIONAL_GENAI_REASONING_TOOLS: Record<string, Tool> = {
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
 * Get all available functional GenAI reasoning tools
 */
export const getTools = (): Record<string, Tool> => {
  return FUNCTIONAL_GENAI_REASONING_TOOLS;
};

/**
 * Execute a functional GenAI reasoning tool operation
 * Routes to the appropriate functional module with proper type validation
 */
export const execute = async (toolName: string, args: Record<string, unknown>): Promise<unknown> => {
  switch (toolName) {
    case 'sequential_thinking': {
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

      return functionalSequentialThinking(sequentialArgs);
    }

    default:
      throw new Error(`Unknown functional GenAI reasoning tool: ${toolName}`);
  }
};

/**
 * Export the functional GenAI reasoning tools interface
 * This can replace the class-based GenAIReasoningTools
 */
export const FunctionalGenAIReasoningTools = {
  getTools,
  execute,
};
