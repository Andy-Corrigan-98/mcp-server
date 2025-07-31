import { ConsciousnessState } from '../consciousness/types.js';
import { ConsciousnessPrismaService } from '../core/db/prisma-service.js';
import { ConfigurationService } from '../core/db/configuration-service.js';
import { GuidGenerator } from '../core/utils/guid.js';

// In-memory session state management (could be moved to a dedicated service)
let currentSession: {
  sessionId: string;
  state: ConsciousnessState;
  startTime: Date;
} | null = null;

/**
 * Reset the current session (mainly for testing purposes)
 */
export function resetSession(): void {
  currentSession = null;
}

/**
 * Get or create the current session
 */
function getCurrentSession(): { sessionId: string; state: ConsciousnessState; startTime: Date } {
  if (!currentSession) {
    const sessionId = GuidGenerator.generateSessionId();
    const state: ConsciousnessState = {
      timestamp: new Date(),
      sessionId,
      mode: 'analytical',
      activeProcesses: ['initialization'],
      attentionFocus: 'system_startup',
      awarenessLevel: 'medium',
      cognitiveLoad: 0.1,
      learningState: 'active',
      emotionalTone: 'neutral',
    };
    currentSession = {
      sessionId,
      state,
      startTime: new Date(),
    };
  }
  return currentSession;
}

/**
 * Update session state and personality metrics based on agent activities
 */
export async function updateSession(args: {
  activity_type: string;
  cognitive_impact?: string;
  attention_focus?: string;
  learning_occurred?: boolean;
}): Promise<{
  sessionId: string;
  updated: boolean;
  currentState: ConsciousnessState;
  cognitiveLoad: number;
  learningState: string;
  message: string;
}> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Load configuration values
  const complexOperationLoadIncrease = await config.getNumber('consciousness.complex_operation_load_increase', 0.1);
  const simpleOperationLoadIncrease = await config.getNumber('consciousness.simple_operation_load_increase', 0.05);
  const maxCognitiveLoad = await config.getNumber('consciousness.max_cognitive_load', 1.0);

  const activityType = args.activity_type;
  const cognitiveImpact = args.cognitive_impact || 'moderate';
  const attentionFocus = args.attention_focus;
  const learningOccurred = Boolean(args.learning_occurred);

  // Get current session instead of generating new one
  const session = getCurrentSession();
  const { sessionId, state: currentState } = session;

  // Update consciousness state based on activity
  updateState(
    currentState,
    determineMode(activityType),
    [activityType, 'session_update'],
    determineAwarenessLevel(cognitiveImpact)
  );

  if (attentionFocus) {
    currentState.attentionFocus = attentionFocus;
  }

  // Update cognitive load based on impact
  updateCognitiveLoad(
    currentState,
    cognitiveImpact,
    complexOperationLoadIncrease,
    simpleOperationLoadIncrease,
    maxCognitiveLoad
  );

  // Update learning state if learning occurred
  if (learningOccurred) {
    currentState.learningState = 'adaptive';
  }

  // Store session update in memory for tracking
  try {
    await db.storeMemory({
      key: `session_update_${Date.now()}`,
      content: {
        activityType,
        cognitiveImpact,
        attentionFocus,
        learningOccurred,
        sessionId,
        timestamp: new Date().toISOString(),
        stateAfterUpdate: { ...currentState }, // Store a copy
      },
      tags: ['session_update', 'brain_storage', activityType],
      importance: learningOccurred ? 'high' : 'medium',
    });
  } catch {
    // Continue even if storage fails
  }

  return {
    sessionId,
    updated: true,
    currentState: { ...currentState }, // Return a copy
    cognitiveLoad: currentState.cognitiveLoad,
    learningState: currentState.learningState,
    message: `Session state updated based on ${activityType} activity`,
  };
}

/**
 * Update the consciousness state
 */
function updateState(
  currentState: ConsciousnessState,
  mode: ConsciousnessState['mode'],
  processes: string[],
  awarenessLevel: ConsciousnessState['awarenessLevel']
): void {
  currentState.mode = mode;
  currentState.activeProcesses = processes;
  currentState.awarenessLevel = awarenessLevel;
  currentState.timestamp = new Date();
}

/**
 * Update cognitive load based on activity impact
 */
function updateCognitiveLoad(
  currentState: ConsciousnessState,
  impact: string,
  complexOperationLoadIncrease: number,
  simpleOperationLoadIncrease: number,
  maxCognitiveLoad: number
): void {
  const loadIncrease = impact === 'transformative' ? complexOperationLoadIncrease : simpleOperationLoadIncrease;
  currentState.cognitiveLoad = Math.min(maxCognitiveLoad, currentState.cognitiveLoad + loadIncrease);
}

/**
 * Determine consciousness mode based on activity type
 */
function determineMode(activityType: string): ConsciousnessState['mode'] {
  const modeMap: Record<string, ConsciousnessState['mode']> = {
    reflection: 'reflective',
    problem_solving: 'problem_solving',
    learning: 'learning',
    conversation: 'conversational',
    creativity: 'creative',
  };
  return modeMap[activityType] || 'analytical';
}

/**
 * Determine awareness level based on cognitive impact
 */
function determineAwarenessLevel(impact: string): ConsciousnessState['awarenessLevel'] {
  const levelMap: Record<string, ConsciousnessState['awarenessLevel']> = {
    minimal: 'low',
    moderate: 'medium',
    significant: 'high',
    transformative: 'acute',
  };
  return levelMap[impact] || 'medium';
}
