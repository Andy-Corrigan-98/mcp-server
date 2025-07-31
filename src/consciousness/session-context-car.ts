import { RailroadContext } from '../types.js';
import { GuidGenerator } from '../../core/utils/guid.js';

/**
 * Session Context Railroad Car
 *
 * Adds current session state, consciousness metrics, and session-specific context
 * to the railroad context.
 */
export async function sessionContextCar(context: RailroadContext): Promise<RailroadContext> {
  // Generate or get current session info
  const sessionId = GuidGenerator.generateSessionId();

  // Create current consciousness state
  const currentState = {
    timestamp: new Date(),
    sessionId,
    mode: determineMode(context.analysis?.intent || 'general'),
    activeProcesses: ['consciousness_pipeline'],
    attentionFocus: context.analysis?.entities_mentioned[0] || 'general_conversation',
    awarenessLevel: determineAwarenessLevel(context.analysis?.emotional_context || 'neutral'),
    cognitiveLoad: 0.1, // Start low, will be updated based on operations
    learningState: context.analysis?.requires_insight_storage ? 'adaptive' : 'active',
    emotionalTone: mapEmotionalContext(context.analysis?.emotional_context || 'neutral'),
  };

  // Get session duration (for now, just time since railroad started)
  const duration = Date.now() - context.timestamp.getTime();

  // Add session context to railroad
  return {
    ...context,
    sessionContext: {
      sessionId,
      currentState,
      duration,
      cognitiveLoad: currentState.cognitiveLoad,
      attentionFocus: currentState.attentionFocus,
      mode: currentState.mode,
      awarenessLevel: currentState.awarenessLevel,
    },
  };
}

/**
 * Determine consciousness mode based on message intent
 */
function determineMode(intent: string): string {
  switch (intent) {
    case 'technical':
    case 'problem_solving':
      return 'analytical';
    case 'social':
    case 'casual':
      return 'social';
    case 'learning':
    case 'reflection':
      return 'contemplative';
    case 'creative':
    case 'brainstorming':
      return 'creative';
    default:
      return 'analytical';
  }
}

/**
 * Determine awareness level based on emotional context
 */
function determineAwarenessLevel(emotionalContext: string): string {
  const highAwarenessContexts = ['excited', 'focused', 'intense', 'urgent'];
  const lowAwarenessContexts = ['tired', 'distracted', 'casual', 'relaxed'];

  if (highAwarenessContexts.some(ctx => emotionalContext.includes(ctx))) {
    return 'high';
  } else if (lowAwarenessContexts.some(ctx => emotionalContext.includes(ctx))) {
    return 'low';
  } else {
    return 'medium';
  }
}

/**
 * Map emotional context to consciousness emotional tone
 */
function mapEmotionalContext(emotionalContext: string): string {
  if (emotionalContext.includes('positive') || emotionalContext.includes('excited')) {
    return 'positive';
  } else if (emotionalContext.includes('negative') || emotionalContext.includes('frustrated')) {
    return 'concerned';
  } else if (emotionalContext.includes('playful') || emotionalContext.includes('humorous')) {
    return 'playful';
  } else {
    return 'neutral';
  }
}
