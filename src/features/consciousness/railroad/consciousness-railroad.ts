import { ConsciousnessRailroad, createSimpleRailroad } from './pipeline.js';
import { messageAnalysisCar } from './cars/message-analysis-car.js';
import { sessionContextCar } from './cars/session-context-car.js';
import { memoryContextCar } from './cars/memory-context-car.js';
import { socialContextCar } from './cars/social-context-car.js';
import { personalityContextCar } from './cars/personality-context-car.js';
import { RailroadResult } from './types.js';

/**
 * Main Consciousness Railroad Builder
 *
 * Creates and configures the complete consciousness context pipeline.
 * This replaces the scattered consciousness operations with a traceable,
 * testable railroad pattern.
 */

/**
 * Create the default consciousness railroad with all standard cars
 */
export function createConsciousnessRailroad(): ConsciousnessRailroad {
  return createSimpleRailroad([
    {
      name: 'message-analysis',
      car: messageAnalysisCar,
      required: true, // Must understand the message to proceed
    },
    {
      name: 'session-context',
      car: sessionContextCar,
      required: true, // Session context is fundamental
    },
    {
      name: 'memory-context',
      car: memoryContextCar,
      required: false, // Memory can fail gracefully
    },
    {
      name: 'social-context',
      car: socialContextCar,
      required: false, // Social context is optional
    },
    {
      name: 'personality-context',
      car: personalityContextCar,
      required: false, // Personality can fall back to defaults
    },
  ]);
}

/**
 * Create a lightweight railroad for simple interactions
 */
export function createLightweightRailroad(): ConsciousnessRailroad {
  return createSimpleRailroad([
    {
      name: 'message-analysis',
      car: messageAnalysisCar,
      required: true,
    },
    {
      name: 'session-context',
      car: sessionContextCar,
      required: true,
    },
    {
      name: 'personality-context',
      car: personalityContextCar,
      required: false,
    },
  ]);
}

/**
 * Create a memory-focused railroad for knowledge work
 */
export function createMemoryFocusedRailroad(): ConsciousnessRailroad {
  return createSimpleRailroad([
    {
      name: 'message-analysis',
      car: messageAnalysisCar,
      required: true,
    },
    {
      name: 'memory-context',
      car: memoryContextCar,
      required: true, // Memory is required for this variant
    },
    {
      name: 'session-context',
      car: sessionContextCar,
      required: true,
    },
    {
      name: 'personality-context',
      car: personalityContextCar,
      required: false,
    },
  ]);
}

/**
 * Create a social-focused railroad for relationship interactions
 */
export function createSocialFocusedRailroad(): ConsciousnessRailroad {
  return createSimpleRailroad([
    {
      name: 'message-analysis',
      car: messageAnalysisCar,
      required: true,
    },
    {
      name: 'social-context',
      car: socialContextCar,
      required: true, // Social context is required for this variant
    },
    {
      name: 'memory-context',
      car: memoryContextCar,
      required: false,
    },
    {
      name: 'session-context',
      car: sessionContextCar,
      required: true,
    },
    {
      name: 'personality-context',
      car: personalityContextCar,
      required: false,
    },
  ]);
}

/**
 * Process a message through the consciousness railroad
 * This is the main entry point that replaces scattered consciousness operations
 */
export async function processConsciousnessContext(
  message: string,
  context?: string,
  railroadType: 'default' | 'lightweight' | 'memory-focused' | 'social-focused' = 'default'
): Promise<RailroadResult> {
  let railroad: ConsciousnessRailroad;

  switch (railroadType) {
    case 'lightweight':
      railroad = createLightweightRailroad();
      break;
    case 'memory-focused':
      railroad = createMemoryFocusedRailroad();
      break;
    case 'social-focused':
      railroad = createSocialFocusedRailroad();
      break;
    default:
      railroad = createConsciousnessRailroad();
      break;
  }

  return railroad.execute(message, context);
}

/**
 * Extract response context from railroad result for conversation generation
 */
export function extractResponseContext(result: RailroadResult): string {
  const ctx = result.context;

  const contextParts: string[] = [];

  // Add operations performed
  if (ctx.operations.performed.length > 0) {
    contextParts.push(`Operations: ${ctx.operations.performed.join(', ')}`);
  }

  // Add emotional context
  if (ctx.analysis?.emotional_context) {
    contextParts.push(`Emotional context: ${ctx.analysis.emotional_context}`);
  }

  // Add entities mentioned
  if ((ctx.analysis?.entities_mentioned?.length ?? 0) > 0) {
    contextParts.push(`Entities: ${ctx.analysis?.entities_mentioned?.join(', ')}`);
  }

  // Add session info
  if (ctx.sessionContext) {
    contextParts.push(`Session mode: ${ctx.sessionContext.mode}`);
    contextParts.push(`Attention: ${ctx.sessionContext.attentionFocus}`);
  }

  // Add personality state
  if (ctx.personalityContext?.currentPersonalityState) {
    const personality = ctx.personalityContext.currentPersonalityState;
    contextParts.push(`Personality: ${personality.mode} mode, ${personality.engagement} engagement`);
    contextParts.push(`Communication style: ${ctx.personalityContext.communicationStyle}`);
  }

  // Add memory context
  if ((ctx.memoryContext?.relevantMemories?.length ?? 0) > 0) {
    contextParts.push(`Relevant memories: ${ctx.memoryContext?.relevantMemories?.length} found`);
  }

  // Add social context
  if (ctx.socialContext?.relationshipDynamics) {
    contextParts.push('Active relationship context available');
  }

  // Add any errors (for debugging)
  if (ctx.errors.length > 0) {
    const recoverableErrors = ctx.errors.filter(e => e.recoverable);
    if (recoverableErrors.length > 0) {
      contextParts.push(`Note: ${recoverableErrors.length} recoverable processing issues`);
    }
  }

  return contextParts.join('\n');
}

/**
 * Get personality-informed response generation context
 * This provides rich context for the conversation system
 */
export function getPersonalityContext(result: RailroadResult): {
  vocabularyStyle: string;
  communicationTone: string;
  confidenceLevel: number;
  relationshipContext?: string;
  memoryContext?: string;
} {
  const ctx = result.context;

  const DEFAULT_CONFIDENCE = 0.8;
  const VOCABULARY_STYLE_INDEX = 1; // Second priority level (gentle_nudge)

  return {
    vocabularyStyle:
      ((ctx.personalityContext?.vocabularyPreferences as Record<string, unknown>)?.priorityLevels?.[
        VOCABULARY_STYLE_INDEX
      ] as string) || 'balanced',
    communicationTone: ctx.personalityContext?.communicationStyle || 'adaptive',
    confidenceLevel:
      ((ctx.personalityContext?.currentPersonalityState as Record<string, unknown>)?.confidence as number) ||
      DEFAULT_CONFIDENCE,
    relationshipContext: ctx.socialContext?.relationshipDynamics
      ? `Active relationship with ${ctx.socialContext.entityMentioned}`
      : undefined,
    memoryContext:
      (ctx.memoryContext?.relevantMemories?.length ?? 0) > 0
        ? `${ctx.memoryContext?.relevantMemories?.length} relevant memories`
        : undefined,
  };
}
