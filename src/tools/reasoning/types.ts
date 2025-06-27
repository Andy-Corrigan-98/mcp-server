import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool definitions for reasoning and sequential thinking operations
 */

export const REASONING_TOOLS: Record<string, Tool> = {
  sequential_thinking: {
    name: 'sequential_thinking',
    description:
      'A detailed tool for dynamic and reflective problem-solving through thoughts. This tool helps analyze problems through a flexible thinking process that can adapt and evolve.',
    inputSchema: {
      type: 'object',
      properties: {
        thought: {
          type: 'string',
          description:
            'Your current thinking step, which can include regular analytical steps, revisions of previous thoughts, questions about previous decisions, realizations about needing more analysis, changes in approach, hypothesis generation, or hypothesis verification',
        },
        next_thought_needed: {
          type: 'boolean',
          description: 'Whether another thought step is needed',
        },
        thought_number: {
          type: 'integer',
          description: 'Current thought number',
          minimum: 1,
        },
        total_thoughts: {
          type: 'integer',
          description: 'Estimated total thoughts needed',
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
          description: 'Branching point thought number',
          minimum: 1,
        },
        branch_id: {
          type: 'string',
          description: 'Branch identifier',
        },
        needs_more_thoughts: {
          type: 'boolean',
          description: 'If more thoughts are needed',
          default: false,
        },
      },
      required: ['thought', 'next_thought_needed', 'thought_number', 'total_thoughts'],
    },
  },
};

/**
 * Interface for sequential thinking state management
 */
export interface ThinkingSession {
  sessionId: string;
  thoughts: ThoughtStep[];
  branches: Map<string, ThoughtStep[]>;
  currentBranch: string | null;
  startedAt: Date;
  lastUpdated: Date;
}

export interface ThoughtStep {
  thoughtNumber: number;
  thought: string;
  nextThoughtNeeded: boolean;
  totalThoughts: number;
  isRevision: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts: boolean;
  timestamp: Date;
}

/**
 * Sequential thinking result interface
 */
export interface ThinkingResult {
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  branches: string[] | null;
  thoughtHistoryLength: number;
  sessionSummary?: string;
  insights?: string[];
  hypothesis?: string;
  verification?: string;
  conclusion?: string;
}
