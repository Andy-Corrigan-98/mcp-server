/**
 * Consciousness Railroad Pattern
 *
 * A traceable, testable pipeline for building personality context that replaces
 * scattered consciousness operations with a linear, composable flow.
 */

// Core railroad infrastructure
export { ConsciousnessRailroad, createSimpleRailroad } from './pipeline.js';
export type { RailroadContext, RailroadCar, RailroadConfig, RailroadResult } from './types.js';

// Individual railroad cars
export { messageAnalysisCar } from './message-analysis-car.js';
export { sessionContextCar } from './session-context-car.js';
export { memoryContextCar } from './memory-context-car.js';
export { socialContextCar } from './social-context-car.js';
export { personalityContextCar } from './personality-context-car.js';

// Pre-configured railroads and utilities
export {
  createConsciousnessRailroad,
  createLightweightRailroad,
  createMemoryFocusedRailroad,
  createSocialFocusedRailroad,
  processConsciousnessContext,
  // extractResponseContext, // V1 legacy function
  // getPersonalityContext, // V1 legacy function
} from './consciousness-railroad.js';
