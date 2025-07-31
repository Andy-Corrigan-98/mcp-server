import { ThinkingSession, ThoughtStep } from '../reasoning/types.js';

/**
 * Session counter for generating unique session IDs
 */
let sessionCounter = 0;

/**
 * Get current session ID for thinking operations
 */
export function getCurrentSessionId(): string {
  // Use a consistent session ID for sequential calls within reasonable time window
  // In a real implementation, this could be tied to conversation context
  if (sessionCounter === 0) {
    sessionCounter = 1;
  }
  return `thinking_session_${sessionCounter}`;
}

/**
 * Create a new thinking session
 */
export function createNewSession(sessionId: string, activeSessions: Map<string, ThinkingSession>): ThinkingSession {
  const session: ThinkingSession = {
    sessionId,
    thoughts: [],
    branches: new Map(),
    currentBranch: null,
    startedAt: new Date(),
    lastUpdated: new Date(),
  };

  activeSessions.set(sessionId, session);
  return session;
}

/**
 * Handle branching logic for alternative reasoning paths
 */
export function handleBranching(
  session: ThinkingSession,
  thoughtStep: ThoughtStep,
  branchId: string,
  _branchFromThought: number
): void {
  if (!session.branches.has(branchId)) {
    session.branches.set(branchId, []);
  }

  const branch = session.branches.get(branchId)!;
  branch.push(thoughtStep);
  session.currentBranch = branchId;
}








