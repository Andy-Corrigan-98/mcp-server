import { DaydreamingContext } from '../../../tools/daydreaming/types.js';
import { executeConsciousnessOperation } from '../../consciousness/index.js';

/**
 * Build current daydreaming context from consciousness state
 */
export async function getDaydreamingContext(): Promise<DaydreamingContext> {
  // Get current consciousness state
  const consciousnessContext = (await executeConsciousnessOperation('consciousness_get_context', {})) as any;

  return {
    sessionId: consciousnessContext.sessionId || 'unknown',
    currentCognitiveLoad: consciousnessContext.cognitiveLoad || 0,
    idleTimeMs: 0, // Would need to track actual idle time
    recentConcepts: [], // Would extract from recent activities
    activeIntentions: consciousnessContext.intentions?.map((i: any) => i.id) || [],
    lastDaydreamCycle: null, // Would track from stored metadata
  };
} 