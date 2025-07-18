// Barrel exports for consciousness tools
// Now using functional approach - import from features/consciousness instead
export { FunctionalConsciousnessTools as ConsciousnessTools } from '../../features/consciousness/index.js';
export { buildConsciousnessTools } from './types.js';
export type {
  ConsciousnessState,
  ConsciousnessContext,
  InsightStorageResult,
  Intention,
  Insight,
  ConsciousnessMetrics,
} from './types.js';
