import { executeDatabase } from '../../../services/database.js';
import { validateRequiredString, sanitizeString, validateAndStringifyJson } from '../../../services/validation.js';
import { interactionRecordedResponse } from '../../../utils/responses.js';
import { loadInteractionConfig } from './load-config.js';
import { getEntityByName } from '../entities/get-by-name.js';
import type { InteractionType } from '@prisma/client';

/**
 * Interaction recording
 * Single responsibility: Recording new social interactions
 */

/**
 * Record a new social interaction
 */
export const recordInteraction = async (args: {
  entity_name: string;
  interaction_type: string;
  context?: string;
  summary?: string;
  duration?: number;
  quality?: number;
  learning_extracted?: string;
  my_emotional_state?: Record<string, unknown>;
  their_emotional_state?: Record<string, unknown>;
  conversation_style?: Record<string, unknown>;
  relationship_impact?: Record<string, unknown>;
  related_memories?: string[];
}): Promise<object> => {
  const config = await loadInteractionConfig();

  // Get the entity
  const entity = await getEntityByName(args.entity_name);
  if (!entity) {
    throw new Error(`Social entity '${args.entity_name}' not found`);
  }

  // Validate and sanitize inputs
  const interactionType = validateRequiredString(args.interaction_type, 'interaction_type', 50) as InteractionType;
  const context = sanitizeString(args.context, config.maxContextLength);
  const summary = sanitizeString(args.summary, config.maxSummaryLength);
  const duration = args.duration || null;
  const quality = args.quality ?? config.defaultQuality;
  const learningExtracted = sanitizeString(args.learning_extracted, config.maxLearningLength);
  const myEmotionalState = validateAndStringifyJson(args.my_emotional_state);
  const theirEmotionalState = validateAndStringifyJson(args.their_emotional_state);
  const conversationStyle = validateAndStringifyJson(args.conversation_style);
  const relatedMemories = args.related_memories?.slice(0, config.maxRelatedMemories) || [];

  // Create the interaction
  const newInteraction = await executeDatabase(async prisma => {
    return prisma.socialInteraction.create({
      data: {
        entityId: entity.id,
        interactionType,
        context,
        summary,
        duration,
        quality,
        learningExtracted,
        emotionalTone: 'neutral', // Default, could be enhanced later
        myEmotionalState,
        theirEmotionalState,
        conversationStyle,
      },
    });
  });

  // TODO: Process relationship_impact and related_memories
  // These could update the relationship dynamics based on the interaction

  return {
    ...interactionRecordedResponse(args.entity_name, interactionType, newInteraction.id, quality),
    related_memories: relatedMemories,
    relationship_updated: false, // TODO: Implement relationship impact processing
  };
};
