/**
 * Consciousness Railroad Pattern - V2 & V3 Architectures
 *
 * V2: Linear, composable flow of railroad cars (original architecture)
 * V3: Parallel sub-analysis + personality synthesis (personality-first architecture)
 */

// ===== V2 ARCHITECTURE (Original Sequential) =====

// Core railroad infrastructure
export { ConsciousnessRailroad, createSimpleRailroad } from './pipeline.js';
export type { RailroadContext, RailroadCar, RailroadConfig, RailroadResult } from './types.js';

// Individual railroad cars
export { messageAnalysisCar } from './message-analysis-car.js';
export { sessionContextCar } from './session-context-car.js';
export { memoryContextCar } from './memory-context-car.js';
export { socialContextCar } from './social-context-car.js';
export { personalityContextCar } from './personality-context-car.js';

// Pre-configured V2 railroads and utilities
export {
  createConsciousnessRailroad,
  createLightweightRailroad,
  createMemoryFocusedRailroad,
  createSocialFocusedRailroad,
  processConsciousnessContext,
} from './consciousness-railroad.js';

// ===== V3 ARCHITECTURE (Personality-First Parallel) =====

// V3 Types and infrastructure
export type { 
  RailroadContext as V3RailroadContext,
  PersonalityFirstRailroad,
  SubAnalysisCar,
  PersonalitySynthesisCar,
  MessageSubAnalysis,
  SessionSubAnalysis,
  MemorySubAnalysis,
  SocialSubAnalysis,
  PersonalitySynthesizedContext
} from './types-v3.js';

// V3 Sub-analysis cars (parallel processing)
export { messageSubAnalysisCar } from './message-sub-analysis-car.js';
export { sessionSubAnalysisCar } from './session-sub-analysis-car.js';
export { memorySubAnalysisCar } from './memory-sub-analysis-car.js';
export { socialSubAnalysisCar } from './social-sub-analysis-car.js';

// V3 Personality synthesis car (central intelligence)
export { personalitySynthesisCar } from './personality-synthesis-car.js';

// V3 Railroad implementation and factory
export { createPersonalityFirstRailroad } from './personality-first-railroad.js';
export {
  createPersonalityFirstConsciousness,
  createLightweightPersonalityConsciousness,
  createDevelopmentPersonalityConsciousness,
  createProductionPersonalityConsciousness,
  processWithPersonalityFirst,
  compareConsciousnessArchitectures
} from './personality-first-consciousness.js';

// ===== UNIFIED PROCESSING INTERFACE =====

/**
 * Process consciousness context with architecture selection
 */
export async function processConsciousness(
  message: string,
  context?: string,
  architecture: 'v2' | 'v3' = 'v3',
  options?: {
    v3Mode?: 'default' | 'lightweight' | 'development' | 'production';
    v2Type?: 'default' | 'lightweight' | 'memory-focused' | 'social-focused';
  }
) {
  if (architecture === 'v3') {
    // Import V3 function dynamically to avoid circular dependencies
    const { processWithPersonalityFirst } = await import('./personality-first-consciousness.js');
    return processWithPersonalityFirst(message, context, options?.v3Mode);
  } else {
    // Use original V2 architecture
    const { processConsciousnessContext } = await import('./consciousness-railroad.js');
    return processConsciousnessContext(message, context, options?.v2Type || 'default');
  }
}
