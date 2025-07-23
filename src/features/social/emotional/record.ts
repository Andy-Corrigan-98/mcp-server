import { executeDatabase } from '../../../services/database.js';
import { validateRequiredString, sanitizeString } from '../../../services/validation.js';
import { ResponseBuilder } from '../../../utils/response-builder.js';
import { getEntityByName } from '../entities/get-by-name.js';
import type { EmotionalState } from '@prisma/client';

/**
 * Emotional state recording
 * Single responsibility: Recording emotional experiences and patterns
 */

/**
 * Record an emotional experience or pattern
 */
export const recordEmotionalState = async (args: {
  emotional_state: string;
  entity_name?: string;
  interaction_id?: number;
  intensity?: number;
  trigger?: string;
  response?: string;
  learning?: string;
  context?: string;
}): Promise<object> => {
  // Validate emotional state
  const emotionalState = validateRequiredString(args.emotional_state, 'emotional_state', 50) as EmotionalState;
  const intensity = Math.max(0, Math.min(1, args.intensity ?? 0.5));
  const trigger = sanitizeString(args.trigger, 300);
  const response = sanitizeString(args.response, 300);
  const learning = sanitizeString(args.learning, 500);
  const context = sanitizeString(args.context, 500);

  // Get entity if specified
  let entityId: number | undefined;
  if (args.entity_name) {
    const entity = await getEntityByName(args.entity_name);
    if (!entity) {
      throw new Error(`Social entity '${args.entity_name}' not found`);
    }
    entityId = entity.id;
  }

  // Create emotional context record
  const emotionalRecord = await executeDatabase(async prisma => {
    return prisma.emotionalContext.create({
      data: {
        entityId,
        interactionId: args.interaction_id,
        emotionalState,
        intensity,
        trigger,
        response,
        learning,
        context,
      },
    });
  });

  return ResponseBuilder.success(
    {
      emotional_record: {
        id: emotionalRecord.id,
        emotional_state: emotionalState,
        intensity,
        entity_name: args.entity_name,
        interaction_id: args.interaction_id,
        created_at: emotionalRecord.createdAt,
      },
    },
    `Emotional state '${emotionalState}' recorded successfully`
  );
};
