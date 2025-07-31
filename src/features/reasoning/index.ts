// Import functions first
import { sequentialThinking } from './sequential/sequential-thinking.js';

// Import tool builder for compatibility
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { REASONING_TOOLS } from '../../tools/reasoning/types.js';

// Then export them
export { sequentialThinking };

// Re-export types for convenience
export type { ThinkingSession, ThoughtStep, ThinkingResult } from '../../tools/reasoning/types.js';

/**
 * Reasoning Tools
 *
 * Reasoning operations organized into single-responsibility modules:
 * - sequential/: Sequential thinking and problem-solving operations
 * - session/: Session management and branching logic
 * - insights/: Insight generation and analysis
 * - utils/: Utility functions for validation and helpers
 *
 * All functions are pure and stateless - they take explicit dependencies
 * and have no hidden side effects.
 */

/**
 * Get all available reasoning tools with proper schemas
 * This function provides compatibility with the existing tool registration pattern
 */
export function getReasoningTools(): Record<string, Tool> {
  return REASONING_TOOLS;
}

/**
 * Handler for sequential thinking operations with proper validation
 */
async function handleSequentialThinkingOperation(args: Record<string, unknown>): Promise<unknown> {
  // Validate required fields
  if (typeof args.thought !== 'string') {
    throw new Error('thought is required and must be a string');
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

  return sequentialThinking({
    thought: args.thought,
    next_thought_needed: args.next_thought_needed,
    thought_number: args.thought_number,
    total_thoughts: args.total_thoughts,
    is_revision: typeof args.is_revision === 'boolean' ? args.is_revision : undefined,
    revises_thought: typeof args.revises_thought === 'number' ? args.revises_thought : undefined,
    branch_from_thought: typeof args.branch_from_thought === 'number' ? args.branch_from_thought : undefined,
    branch_id: typeof args.branch_id === 'string' ? args.branch_id : undefined,
    needs_more_thoughts: typeof args.needs_more_thoughts === 'boolean' ? args.needs_more_thoughts : undefined,
  });
}

/**
 * Handler mapping for reasoning operations
 * Eliminates switch statement pattern for better maintainability
 */
const REASONING_OPERATION_HANDLERS: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  sequential_thinking: handleSequentialThinkingOperation,
};

/**
 * Execute a reasoning operation by name
 * This function provides compatibility with the existing tool execution pattern
 */
export async function executeReasoningOperation(
  operationName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const handler = REASONING_OPERATION_HANDLERS[operationName];

  if (!handler) {
    const availableOperations = Object.keys(REASONING_OPERATION_HANDLERS).join(', ');
    throw new Error(`Unknown reasoning operation: ${operationName}. Available operations: ${availableOperations}`);
  }

  return handler(args);
}

/**
 * Reasoning Tools Wrapper
 * Provides the same interface as the old class-based approach for compatibility
 */
export class ReasoningTools {
  getTools(): Record<string, Tool> {
    return getReasoningTools();
  }

  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    return executeReasoningOperation(toolName, args);
  }
}
