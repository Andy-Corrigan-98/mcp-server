// Import functions first
import { prepareContext } from './context/prepare-context.js';
import { getContext } from './context/get-context.js';
import { storeInsight } from './insights/store-insight.js';
import { setIntention } from './intentions/set-intention.js';
import { updateIntention } from './intentions/update-intention.js';
import { updateSession } from './session/update-session.js';

// Then export them
export { prepareContext, getContext, storeInsight, setIntention, updateIntention, updateSession };

// Re-export types for convenience
export type {
  ConsciousnessContext,
  ConsciousnessContextResult,
  ConsciousnessState,
  ConsciousnessMetrics,
  Intention,
  Insight,
  InsightStorageResult,
  LearningPatterns,
} from '../../tools/consciousness/types.js';

/**
 * Functional Consciousness Tools
 *
 * This module provides a clean, functional interface to consciousness operations.
 * Each function has a single responsibility and can be used independently.
 *
 * Features:
 * - Context preparation and retrieval
 * - Insight storage and management
 * - Intention setting and tracking
 * - Session state management
 *
 * All functions are pure and stateless - they take explicit dependencies
 * and have no hidden side effects.
 */

/**
 * Execute a consciousness operation by name
 * This function provides compatibility with the existing tool execution pattern
 */
export async function executeConsciousnessOperation(
  operationName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (operationName) {
    case 'consciousness_prepare_context':
      return prepareContext({
        topic: args.topic as string,
        context_depth: args.context_depth as string,
        include_memories: args.include_memories as boolean,
        include_knowledge: args.include_knowledge as boolean,
        context_note: args.context_note as string,
      });

    case 'consciousness_store_insight':
      return storeInsight({
        insight: args.insight as string,
        category: args.category as string,
        confidence: args.confidence as number,
        related_topic: args.related_topic as string,
        source_context: args.source_context as string,
      });

    case 'consciousness_get_context':
      return getContext({
        include_metrics: args.include_metrics as boolean,
        include_memory_state: args.include_memory_state as boolean,
        include_intentions: args.include_intentions as boolean,
        include_personality: args.include_personality as boolean,
      });

    case 'consciousness_set_intention':
      return setIntention({
        intention: args.intention as string,
        priority: args.priority as string,
        context: args.context as string,
        duration: args.duration as string,
        success_criteria: args.success_criteria as string,
      });

    case 'consciousness_update_intention':
      return updateIntention({
        intention_id: args.intention_id as string,
        status: args.status as string,
        progress_note: args.progress_note as string,
        new_priority: args.new_priority as string,
      });

    case 'consciousness_update_session':
      return updateSession({
        activity_type: args.activity_type as string,
        cognitive_impact: args.cognitive_impact as string,
        attention_focus: args.attention_focus as string,
        learning_occurred: args.learning_occurred as boolean,
      });

    default:
      throw new Error(`Unknown consciousness operation: ${operationName}`);
  }
}
