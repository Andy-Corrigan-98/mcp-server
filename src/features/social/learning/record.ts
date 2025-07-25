import { executeDatabase } from '../../../services/database.js';
import { validateRequiredString, sanitizeString, validateAndStringifyJson } from '../../../services/validation.js';
import { ResponseBuilder } from '../../../utils/response-builder.js';
import { getEntityByName } from '../entities/get-by-name.js';
import type { SocialLearningType } from '@prisma/client';

/**
 * Social learning recording
 * Single responsibility: Recording social insights and learnings
 */

/**
 * Record a social insight or learning about relationships/communication
 */
export const recordSocialLearning = async (args: {
  learning_type: string;
  insight: string;
  entity_name?: string;
  confidence?: number;
  applicability?: string;
  examples?: Record<string, unknown>;
}): Promise<object> => {
  // Validate inputs
  const learningType = validateRequiredString(args.learning_type, 'learning_type', 50) as SocialLearningType;
  const insight = validateRequiredString(args.insight, 'insight', 1000);
  const confidence = Math.max(0, Math.min(1, args.confidence ?? 0.8));
  const applicability = sanitizeString(args.applicability, 500);
  const examples = validateAndStringifyJson(args.examples);

  // Get entity if specified
  let entityId: number | undefined;
  if (args.entity_name) {
    const entity = await getEntityByName(args.entity_name);
    if (!entity) {
      throw new Error(`Social entity '${args.entity_name}' not found`);
    }
    entityId = entity.id;
  }

  // Create social learning record
  const learningRecord = await executeDatabase(async prisma => {
    return prisma.socialLearning.create({
      data: {
        entityId,
        learningType,
        insight,
        confidence,
        applicability,
        examples,
      },
    });
  });

  return ResponseBuilder.success(
    {
      learning_record: {
        id: learningRecord.id,
        learning_type: learningType,
        insight,
        confidence,
        entity_name: args.entity_name,
        created_at: learningRecord.createdAt,
      },
    },
    `Social learning '${learningType}' recorded successfully`
  );
};
