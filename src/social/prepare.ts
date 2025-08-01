import { executeDatabase } from '../core/services/database.js';
import { validateRequiredString } from '../core/services/validation.js';
import { ResponseBuilder } from '../core/utils/response-builder.js';
import { getEntityByName } from './get-by-name.js';

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
  // Interaction type and context could be used for enhanced preparation in future versions

  const includeEmotionalPrep = args.include_emotional_prep !== false;
  const includeConversationTips = args.include_conversation_tips !== false;
  const includeRelationshipAnalysis = args.include_relationship_analysis !== false;
  // Shared memories integration available when memory-social linking is configured

  // Get the entity
  const entity = await getEntityByName(entityName);
  if (!entity.success || !entity.data) {
    throw new Error(`Social entity '${entityName}' not found`);
  }

  // Gather comprehensive context
  const socialContext = await executeDatabase(async prisma => {
    // Get relationship info
    const relationship = await prisma.socialRelationship.findFirst({
      where: { entityId: entity.data.id },
    });

    // Get recent interactions (last 5)
    const recentInteractions = await prisma.socialInteraction.findMany({
      where: { entityId: entity.data.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get emotional patterns
    const emotionalContexts = await prisma.emotionalContext.findMany({
      where: { entityId: entity.data.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get social learnings
    const socialLearnings = await prisma.socialLearning.findMany({
      where: { entityId: entity.data.id },
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
      name: entity.data.name,
      display_name: entity.data.displayName,
      entity_type: entity.data.entityType,
      description: entity.data.description,
      last_interaction: socialContext.data?.recentInteractions?.[0]?.createdAt,
    },
    recent_interactions: (socialContext.data?.recentInteractions || []).map((interaction: any) => ({
      type: interaction.interactionType,
      date: interaction.createdAt,
      quality: interaction.quality,
      summary: interaction.summary,
      learning_extracted: interaction.learningExtracted,
    })),
    social_learnings: (socialContext.data?.socialLearnings || []).map((learning: any) => ({
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
  if (includeRelationshipAnalysis && socialContext.data?.relationship) {
    response.relationship = {
      type: socialContext.data.relationship.relationshipType,
      strength: socialContext.data.relationship.strength,
      trust: socialContext.data.relationship.trust,
      familiarity: socialContext.data.relationship.familiarity,
      affinity: socialContext.data.relationship.affinity,
      notes: socialContext.data.relationship.notes,
    };
  }

  // Add emotional patterns if requested
  if (includeEmotionalPrep) {
    const emotionalPatterns = new Map<string, number>();
    (socialContext.data?.emotionalContexts || []).forEach((ec: any) => {
      const count = emotionalPatterns.get(ec.emotionalState) || 0;
      emotionalPatterns.set(ec.emotionalState, count + 1);
    });

    response.emotional_patterns = Array.from(emotionalPatterns.entries()).map(([state, frequency]) => ({
      state,
      frequency,
      triggers: socialContext.data?.emotionalContexts || []
        .filter((ec: any) => ec.emotionalState === state && ec.trigger)
        .map((ec: any) => ec.trigger!)
        .slice(0, 3),
    }));
  }

  // Generate recommendations
  if (includeConversationTips && socialContext.data?.relationship) {
    response.recommendations.communication_tips.push(
      `Relationship strength: ${socialContext.data.relationship.strength}/1.0`,
      `Trust level: ${socialContext.data.relationship.trust}/1.0`,
      `Familiarity: ${socialContext.data.relationship.familiarity}/1.0`
    );
  }

  if (includeEmotionalPrep && socialContext.data?.emotionalContexts && Array.isArray(socialContext.data.emotionalContexts) && socialContext.data.emotionalContexts.length > 0) {
    const lastEmotional = socialContext.data?.emotionalContexts?.[0];
    response.recommendations.emotional_prep
      .push(
        `Last emotional state: ${lastEmotional.emotionalState}`,
        lastEmotional.response ? `Previous response: ${lastEmotional.response}` : ''
      )
      .filter(Boolean);
  }

  // Shared memories integration can be enabled via memory-social linking configuration

  return ResponseBuilder.success(response, `Social context prepared for interaction with '${entityName}'`);
};
