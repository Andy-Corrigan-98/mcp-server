import { executeDatabase } from '../../../services/database.js';
import { validateRequiredString, sanitizeString } from '../../../services/validation.js';
import { ResponseBuilder } from '../../../utils/response-builder.js';
import { getEntityByName } from '../entities/get-by-name.js';

/**
 * Social context preparation
 * Single responsibility: Preparing comprehensive context for upcoming interactions
 */

/**
 * Prepare comprehensive social context for an upcoming interaction
 */
export const prepareSocialContext = async (args: {
  entity_name: string;
  interaction_type?: string;
  context?: string;
  include_emotional_prep?: boolean;
  include_conversation_tips?: boolean;
  include_relationship_analysis?: boolean;
  include_shared_memories?: boolean;
}): Promise<object> => {
  // Validate inputs
  const entityName = validateRequiredString(args.entity_name, 'entity_name', 100);
  // TODO: Use interaction type and context for enhanced preparation
  // const interactionType = sanitizeString(args.interaction_type, 50);
  // const context = sanitizeString(args.context, 500);
  
  const includeEmotionalPrep = args.include_emotional_prep !== false;
  const includeConversationTips = args.include_conversation_tips !== false;
  const includeRelationshipAnalysis = args.include_relationship_analysis !== false;
  // TODO: Implement shared memories integration
  // const includeSharedMemories = args.include_shared_memories !== false;

  // Get the entity
  const entity = await getEntityByName(entityName);
  if (!entity) {
    throw new Error(`Social entity '${entityName}' not found`);
  }

  // Gather comprehensive context
  const socialContext = await executeDatabase(async prisma => {
    // Get relationship info
    const relationship = await prisma.socialRelationship.findFirst({
      where: { entityId: entity.id },
    });

    // Get recent interactions (last 5)
    const recentInteractions = await prisma.socialInteraction.findMany({
      where: { entityId: entity.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get emotional patterns
    const emotionalContexts = await prisma.emotionalContext.findMany({
      where: { entityId: entity.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get social learnings
    const socialLearnings = await prisma.socialLearning.findMany({
      where: { entityId: entity.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      entity,
      relationship,
      recentInteractions,
      emotionalContexts,
      socialLearnings,
    };
  });

  // Build response
  const response: any = {
    entity: {
      name: socialContext.entity.name,
      display_name: socialContext.entity.displayName,
      entity_type: socialContext.entity.entityType,
      description: socialContext.entity.description,
      last_interaction: socialContext.recentInteractions[0]?.createdAt,
    },
    recent_interactions: socialContext.recentInteractions.map((interaction: any) => ({
      type: interaction.interactionType,
      date: interaction.createdAt,
      quality: interaction.quality,
      summary: interaction.summary,
      learning_extracted: interaction.learningExtracted,
    })),
    social_learnings: socialContext.socialLearnings.map((learning: any) => ({
      type: learning.learningType,
      insight: learning.insight,
      confidence: learning.confidence,
      applicability: learning.applicability,
    })),
    recommendations: {
      communication_tips: [],
      emotional_prep: [],
      relationship_guidance: [],
      memory_reminders: [],
      conversation_starters: [],
    },
  };

  // Add relationship info if available
  if (includeRelationshipAnalysis && socialContext.relationship) {
    response.relationship = {
      type: socialContext.relationship.relationshipType,
      strength: socialContext.relationship.strength,
      trust: socialContext.relationship.trust,
      familiarity: socialContext.relationship.familiarity,
      affinity: socialContext.relationship.affinity,
      notes: socialContext.relationship.notes,
    };
  }

  // Add emotional patterns if requested
  if (includeEmotionalPrep) {
    const emotionalPatterns = new Map<string, number>();
    socialContext.emotionalContexts.forEach((ec: any) => {
      const count = emotionalPatterns.get(ec.emotionalState) || 0;
      emotionalPatterns.set(ec.emotionalState, count + 1);
    });

    response.emotional_patterns = Array.from(emotionalPatterns.entries()).map(([state, frequency]) => ({
      state,
      frequency,
      triggers: socialContext.emotionalContexts
        .filter((ec: any) => ec.emotionalState === state && ec.trigger)
        .map((ec: any) => ec.trigger!)
        .slice(0, 3),
    }));
  }

  // Generate recommendations
  if (includeConversationTips && socialContext.relationship) {
    response.recommendations.communication_tips.push(
      `Relationship strength: ${socialContext.relationship.strength}/1.0`,
      `Trust level: ${socialContext.relationship.trust}/1.0`,
      `Familiarity: ${socialContext.relationship.familiarity}/1.0`
    );
  }

  if (includeEmotionalPrep && socialContext.emotionalContexts.length > 0) {
    const lastEmotional = socialContext.emotionalContexts[0];
    response.recommendations.emotional_prep.push(
      `Last emotional state: ${lastEmotional.emotionalState}`,
      lastEmotional.response ? `Previous response: ${lastEmotional.response}` : ''
    ).filter(Boolean);
  }

  // TODO: Add shared memories integration when memory-social linking is implemented

  return ResponseBuilder.success(response, `Social context prepared for interaction with '${entityName}'`);
}; 