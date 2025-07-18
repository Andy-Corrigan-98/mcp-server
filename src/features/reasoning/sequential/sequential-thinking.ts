import { InputValidator } from '../../../validation/index.js';
import { ConfigurationService } from '../../../db/configuration-service.js';
import { ThinkingSession, ThoughtStep, ThinkingResult } from '../../../tools/reasoning/types.js';
import { createNewSession, getCurrentSessionId, handleBranching } from '../session/session-management.js';
import {
  generateInsights,
  extractHypothesis,
  extractVerification,
  generateConclusion,
  generateSessionSummary,
} from '../insights/generate-insights.js';
import { validateNumber } from '../utils/reasoning-utils.js';

/**
 * Active sessions storage
 */
const activeSessions: Map<string, ThinkingSession> = new Map();

/**
 * Advanced AI-powered reasoning system for sophisticated problem-solving, analysis, and step-by-step thinking
 */
export async function sequentialThinking(args: {
  thought: string;
  next_thought_needed: boolean;
  thought_number: number;
  total_thoughts: number;
  is_revision?: boolean;
  revises_thought?: number;
  branch_from_thought?: number;
  branch_id?: string;
  needs_more_thoughts?: boolean;
}): Promise<ThinkingResult> {
  const config = ConfigurationService.getInstance();

  // Get configuration values
  const maxThoughtLength = await config.getNumber('reasoning.max_thought_length', 2000);
  const maxBranchIdLength = await config.getNumber('reasoning.max_branch_id_length', 50);

  // Validate input parameters
  const thought = InputValidator.sanitizeString(args.thought, maxThoughtLength);
  const nextThoughtNeeded = Boolean(args.next_thought_needed);
  const thoughtNumber = validateNumber(args.thought_number, 1);
  const totalThoughts = validateNumber(args.total_thoughts, 1);
  const isRevision = Boolean(args.is_revision) || false;
  const revisesThought = args.revises_thought ? validateNumber(args.revises_thought, 1) : undefined;
  const branchFromThought = args.branch_from_thought ? validateNumber(args.branch_from_thought, 1) : undefined;
  const branchId = args.branch_id ? InputValidator.sanitizeString(args.branch_id, maxBranchIdLength) : undefined;
  const needsMoreThoughts = Boolean(args.needs_more_thoughts) || false;

  // Get or create session (simple session management based on context)
  const sessionId = getCurrentSessionId();
  let session = activeSessions.get(sessionId);

  if (!session) {
    session = createNewSession(sessionId, activeSessions);
  }

  // Ensure session is not undefined
  if (!session) {
    throw new Error('Failed to create or retrieve thinking session');
  }

  // Create new thought step
  const thoughtStep: ThoughtStep = {
    thoughtNumber,
    thought,
    nextThoughtNeeded,
    totalThoughts,
    isRevision,
    revisesThought,
    branchFromThought,
    branchId,
    needsMoreThoughts,
    timestamp: new Date(),
  };

  // Handle branching logic
  if (branchId && branchFromThought) {
    handleBranching(session, thoughtStep, branchId, branchFromThought);
  } else {
    // Add to main thought sequence
    session.thoughts.push(thoughtStep);
  }

  session.lastUpdated = new Date();

  // Generate insights and analysis
  const insights = generateInsights(session);
  const hypothesis = extractHypothesis(session);
  const verification = extractVerification(session);
  const conclusion = generateConclusion(
    session,
    nextThoughtNeeded,
    await config.getNumber('reasoning.summary_length', 200)
  );

  // Clean up completed sessions to prevent memory leaks
  if (!nextThoughtNeeded && !needsMoreThoughts) {
    activeSessions.delete(sessionId);
  }

  return {
    thoughtNumber,
    totalThoughts,
    nextThoughtNeeded,
    branches: Array.from(session.branches.keys()),
    thoughtHistoryLength: session.thoughts.length,
    sessionSummary: generateSessionSummary(session, await config.getNumber('reasoning.milliseconds_per_second', 1000)),
    insights,
    hypothesis,
    verification,
    conclusion,
  };
}
