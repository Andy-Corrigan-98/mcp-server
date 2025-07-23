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
 * Functional Reasoning Tools
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
 * Execute a reasoning operation by name
 * This function provides compatibility with the existing tool execution pattern
 */
export async function executeReasoningOperation(
  operationName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (operationName) {
    case 'sequential_thinking':
      return sequentialThinking({
        thought: args.thought as string,
        next_thought_needed: args.next_thought_needed as boolean,
        thought_number: args.thought_number as number,
        total_thoughts: args.total_thoughts as number,
        is_revision: args.is_revision as boolean,
        revises_thought: args.revises_thought as number,
        branch_from_thought: args.branch_from_thought as number,
        branch_id: args.branch_id as string,
        needs_more_thoughts: args.needs_more_thoughts as boolean,
      });

    default:
      throw new Error(`Unknown reasoning operation: ${operationName}`);
  }
}

/**
 * Functional Reasoning Tools Wrapper
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
