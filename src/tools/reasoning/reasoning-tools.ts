import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { InputValidator } from '../../validation/index.js';
import { ServiceBase } from '../base/index.js';
import { REASONING_TOOLS, ThinkingSession, ThoughtStep, ThinkingResult } from './types.js';

/**
 * Reasoning configuration interface
 */
interface ReasoningConfig {
  maxThoughtLength: number;
  maxBranchIdLength: number;
  summaryLength: number;
  millisecondsPerSecond: number;
}

/**
 * Reasoning Tools implementation for consciousness MCP server
 * Provides sequential thinking and problem-solving capabilities
 */
export class ReasoningTools extends ServiceBase {
  private sessions: Map<string, ThinkingSession> = new Map();
  private config: ReasoningConfig = {} as ReasoningConfig;

  constructor() {
    super(); // Initialize services automatically

    // Initialize configuration with defaults
    this.initializeDefaults();

    // Load configuration values asynchronously to override defaults
    this.loadConfiguration();
  }

  /**
   * Initialize configuration with default values
   */
  private initializeDefaults(): void {
    this.config = {
      maxThoughtLength: 2000,
      maxBranchIdLength: 50,
      summaryLength: 200,
      millisecondsPerSecond: 1000,
    };
  }

  /**
   * Load all configuration values from the database
   */
  private async loadConfiguration(): Promise<void> {
    try {
      this.config = {
        maxThoughtLength: await this.configService.getNumber(
          'reasoning.max_thought_length',
          this.config.maxThoughtLength
        ),
        maxBranchIdLength: await this.configService.getNumber(
          'reasoning.max_branch_id_length',
          this.config.maxBranchIdLength
        ),
        summaryLength: await this.configService.getNumber('reasoning.summary_length', this.config.summaryLength),
        millisecondsPerSecond: await this.configService.getNumber(
          'reasoning.milliseconds_per_second',
          this.config.millisecondsPerSecond
        ),
      };
    } catch (error) {
      console.warn('Failed to load reasoning configuration, using defaults:', error);
      // Defaults are already set in initializeDefaults()
    }
  }

  private activeSessions: Map<string, ThinkingSession> = new Map();
  private sessionCounter = 0;

  /**
   * Get all available reasoning tools
   */
  getTools(): Record<string, Tool> {
    return REASONING_TOOLS;
  }

  /**
   * Execute a reasoning tool operation
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'sequential_thinking':
        return this.sequentialThinking(args);
      default:
        throw new Error(`Unknown reasoning tool: ${toolName}`);
    }
  }

  private async sequentialThinking(args: Record<string, unknown>): Promise<ThinkingResult> {
    // Validate input parameters
    const MAX_THOUGHT_LENGTH = this.config.maxThoughtLength;
    const thought = InputValidator.sanitizeString(args.thought as string, MAX_THOUGHT_LENGTH);
    const nextThoughtNeeded = Boolean(args.next_thought_needed);
    const thoughtNumber = this.validateNumber(args.thought_number as number, 1);
    const totalThoughts = this.validateNumber(args.total_thoughts as number, 1);
    const isRevision = Boolean(args.is_revision) || false;
    const revisesThought = args.revises_thought ? this.validateNumber(args.revises_thought as number, 1) : undefined;
    const _branchFromThought = args.branch_from_thought
      ? this.validateNumber(args.branch_from_thought as number, 1)
      : undefined;
    const MAX_BRANCH_ID_LENGTH = this.config.maxBranchIdLength;
    const branchId = args.branch_id
      ? InputValidator.sanitizeString(args.branch_id as string, MAX_BRANCH_ID_LENGTH)
      : undefined;
    const needsMoreThoughts = Boolean(args.needs_more_thoughts) || false;

    // Get or create session (simple session management based on context)
    const sessionId = this.getCurrentSessionId();
    let session = this.activeSessions.get(sessionId);

    if (!session) {
      session = this.createNewSession(sessionId);
    }

    // Create new thought step
    const thoughtStep: ThoughtStep = {
      thoughtNumber,
      thought,
      nextThoughtNeeded,
      totalThoughts,
      isRevision,
      revisesThought,
      branchFromThought: _branchFromThought,
      branchId,
      needsMoreThoughts,
      timestamp: new Date(),
    };

    // Handle branching logic
    if (branchId && _branchFromThought) {
      this.handleBranching(session, thoughtStep, branchId, _branchFromThought);
    } else {
      // Add to main thought sequence
      session.thoughts.push(thoughtStep);
    }

    session.lastUpdated = new Date();

    // Generate insights and analysis
    const insights = this.generateInsights(session);
    const hypothesis = this.extractHypothesis(session);
    const verification = this.extractVerification(session);
    const conclusion = this.generateConclusion(session, nextThoughtNeeded);

    // Clean up completed sessions to prevent memory leaks
    if (!nextThoughtNeeded && !needsMoreThoughts) {
      this.activeSessions.delete(sessionId);
    }

    return {
      thoughtNumber,
      totalThoughts,
      nextThoughtNeeded,
      branches: Array.from(session.branches.keys()),
      thoughtHistoryLength: session.thoughts.length,
      sessionSummary: this.generateSessionSummary(session),
      insights,
      hypothesis,
      verification,
      conclusion,
    };
  }

  private validateNumber(value: number, min: number): number {
    if (typeof value !== 'number' || value < min || !Number.isInteger(value)) {
      throw new Error(`Invalid number: must be integer >= ${min}`);
    }
    return value;
  }

  private getCurrentSessionId(): string {
    // Use a consistent session ID for sequential calls within reasonable time window
    // In a real implementation, this could be tied to conversation context
    if (this.sessionCounter === 0) {
      this.sessionCounter = 1;
    }
    return `thinking_session_${this.sessionCounter}`;
  }

  private createNewSession(sessionId: string): ThinkingSession {
    const session: ThinkingSession = {
      sessionId,
      thoughts: [],
      branches: new Map(),
      currentBranch: null,
      startedAt: new Date(),
      lastUpdated: new Date(),
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  private handleBranching(
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

  private generateInsights(session: ThinkingSession): string[] {
    const insights: string[] = [];
    const allThoughts = this.getAllThoughts(session);

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

  private extractHypothesis(session: ThinkingSession): string | undefined {
    const allThoughts = this.getAllThoughts(session);

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

  private extractVerification(session: ThinkingSession): string | undefined {
    const allThoughts = this.getAllThoughts(session);

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

  private generateConclusion(session: ThinkingSession, nextThoughtNeeded: boolean): string | undefined {
    if (nextThoughtNeeded) {
      return undefined; // No conclusion yet
    }

    const allThoughts = this.getAllThoughts(session);
    const lastThought = allThoughts[allThoughts.length - 1];

    if (lastThought) {
      const SUMMARY_LENGTH = this.config.summaryLength;
      const truncated = lastThought.thought.substring(0, SUMMARY_LENGTH);
      const ellipsis = lastThought.thought.length > SUMMARY_LENGTH ? '...' : '';
      const conclusionText = `Sequential thinking completed with ${allThoughts.length} thoughts. Final insight: ${truncated}${ellipsis}`;
      return conclusionText;
    }

    return 'Sequential thinking session completed.';
  }

  private generateSessionSummary(session: ThinkingSession): string {
    const allThoughts = this.getAllThoughts(session);
    const duration = session.lastUpdated.getTime() - session.startedAt.getTime();
    const MILLISECONDS_PER_SECOND = this.config.millisecondsPerSecond;

    return (
      `Session: ${allThoughts.length} thoughts, ${session.branches.size} branches, ` +
      `${Math.round(duration / MILLISECONDS_PER_SECOND)}s duration`
    );
  }

  private getAllThoughts(session: ThinkingSession): ThoughtStep[] {
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
}
