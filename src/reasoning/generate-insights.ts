import { ThinkingSession, ThoughtStep } from '../reasoning/types.js';

/**
 * Get all thoughts from a session (main thoughts + branch thoughts)
 */
function getAllThoughts(session: ThinkingSession): ThoughtStep[] {
  const allThoughts = [...session.thoughts];

  // Add thoughts from all branches
  for (const branch of session.branches.values()) {
    allThoughts.push(...branch);
  }

  // Sort by thought number and timestamp
  return allThoughts.sort((a, b) => {
    if (a.thoughtNumber !== b.thoughtNumber) {
      return a.thoughtNumber - b.thoughtNumber;
    }
    return a.timestamp.getTime() - b.timestamp.getTime();
  });
}

/**
 * Generate insights from thinking session patterns
 */
export function generateInsights(session: ThinkingSession): string[] {
  const insights: string[] = [];
  const allThoughts = getAllThoughts(session);

  // Look for patterns and key insights
  const revisionCount = allThoughts.filter(t => t.isRevision).length;
  if (revisionCount > 0) {
    insights.push(`Demonstrated reflective thinking with ${revisionCount} revision(s)`);
  }

  const branchCount = session.branches.size;
  if (branchCount > 0) {
    insights.push(`Explored ${branchCount} alternative approach(es)`);
  }

  // Analyze thought evolution
  if (allThoughts.length >= 2) {
    const totalAdjustments = allThoughts.filter(t => t.totalThoughts !== allThoughts[0].totalThoughts).length;
    if (totalAdjustments > 0) {
      insights.push('Dynamically adjusted scope as understanding deepened');
    }
  }

  return insights;
}

/**
 * Extract hypothesis from thinking session
 */
export function extractHypothesis(session: ThinkingSession): string | undefined {
  const allThoughts = getAllThoughts(session);

  // Look for hypothesis-related keywords
  const hypothesisThoughts = allThoughts.filter(
    t =>
      t.thought.toLowerCase().includes('hypothesis') ||
      t.thought.toLowerCase().includes('theory') ||
      t.thought.toLowerCase().includes('assume')
  );

  if (hypothesisThoughts.length > 0) {
    return hypothesisThoughts[hypothesisThoughts.length - 1].thought;
  }

  return undefined;
}

/**
 * Extract verification attempts from thinking session
 */
export function extractVerification(session: ThinkingSession): string | undefined {
  const allThoughts = getAllThoughts(session);

  // Look for verification-related keywords
  const verificationThoughts = allThoughts.filter(
    t =>
      t.thought.toLowerCase().includes('verify') ||
      t.thought.toLowerCase().includes('test') ||
      t.thought.toLowerCase().includes('validate') ||
      t.thought.toLowerCase().includes('check')
  );

  if (verificationThoughts.length > 0) {
    return verificationThoughts[verificationThoughts.length - 1].thought;
  }

  return undefined;
}

/**
 * Generate conclusion from thinking session
 */
export function generateConclusion(
  session: ThinkingSession,
  nextThoughtNeeded: boolean,
  summaryLength: number
): string | undefined {
  if (nextThoughtNeeded) {
    return undefined; // No conclusion yet
  }

  const allThoughts = getAllThoughts(session);
  const lastThought = allThoughts[allThoughts.length - 1];

  if (lastThought) {
    const truncated = lastThought.thought.substring(0, summaryLength);
    const ellipsis = lastThought.thought.length > summaryLength ? '...' : '';
    const conclusionText = `Sequential thinking completed with ${allThoughts.length} thoughts. Final insight: ${truncated}${ellipsis}`;
    return conclusionText;
  }

  return 'Sequential thinking session completed.';
}

/**
 * Generate session summary with statistics
 */
export function generateSessionSummary(session: ThinkingSession, millisecondsPerSecond: number): string {
  const allThoughts = getAllThoughts(session);
  const duration = session.lastUpdated.getTime() - session.startedAt.getTime();

  return (
    `Session: ${allThoughts.length} thoughts, ${session.branches.size} branches, ` +
    `${Math.round(duration / millisecondsPerSecond)}s duration`
  );
}








