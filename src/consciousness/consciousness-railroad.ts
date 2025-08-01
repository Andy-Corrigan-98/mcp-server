import { createSimpleRailroad } from './simple-railroad.js';
import { ConsciousnessRailroad, RailroadContext } from './types.js';
import { messageAnalysisCar } from './message-analysis-car.js';
import { sessionContextCar } from './session-context-car.js';
import { memoryContextCar } from './memory-context-car.js';
import { socialContextCar } from './social-context-car.js';
import { personalityContextCar } from './personality-context-car.js';

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
  // For MVP, use the same 2-car setup
  return createConsciousnessRailroad();
}

/**
 * Create a memory-focused railroad for knowledge work
 */
export function createMemoryFocusedRailroad(): ConsciousnessRailroad {
  // For MVP, use the same 2-car setup
  return createConsciousnessRailroad();
}

/**
 * Create a social-focused railroad for relationship interactions
 */
export function createSocialFocusedRailroad(): ConsciousnessRailroad {
  // For MVP, use the same 2-car setup
  return createConsciousnessRailroad();
}

/**
 * Process a message through the consciousness railroad
 * This is the main entry point that replaces scattered consciousness operations
 */
export async function processConsciousnessContext(
  message: string,
  context?: string,
  railroadType: 'default' | 'lightweight' | 'memory-focused' | 'social-focused' = 'default'
): Promise<RailroadContext> {
  let railroad: ConsciousnessRailroad;

  // Select railroad based on type
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

  // For MVP, we'll simplify this - the railroad.process() method is the main interface
  const railroadContext: RailroadContext = {
    message,
    originalContext: context,
    timestamp: new Date().toISOString(),
    sessionId: 'proc-' + Date.now(),
    userId: 'system',
    operations: {
      performed: [],
      insights_generated: [],
      memories_accessed: [],
      social_interactions: [],
      consciousness_updates: {}
    },
    errors: []
  };
  
  return railroad.process(railroadContext);
}

// Simplified context functions for MVP
// These will be expanded once the full v2 features are available