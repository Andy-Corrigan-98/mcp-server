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
  const interactionType = args.interaction_type || 'conversation';
  const context = args.context || '';

  const includeEmotionalPrep = args.include_emotional_prep !== false;
  const includeConversationTips = args.include_conversation_tips !== false;
  const includeRelationshipAnalysis = args.include_relationship_analysis !== false;
  const includeSharedMemories = args.include_shared_memories !== false;

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

    // Get shared memories if requested
    let sharedMemories: any[] = [];
    if (includeSharedMemories) {
      const memoryLinks = await prisma.memorySocialLink.findMany({
        where: { socialEntityId: entity.data.id },
        include: {
          memory: {
            select: {
              key: true,
              content: true,
              tags: true,
              importance: true,
              storedAt: true,
              socialContext: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      sharedMemories = memoryLinks.map(link => ({
        ...link.memory,
        linkType: link.relationshipType,
        linkStrength: link.strength,
        linkContext: link.context,
      }));
    }

    return {
      entity,
      relationship,
      recentInteractions,
      emotionalContexts,
      socialLearnings,
      sharedMemories,
    };
  });

  // Build response
  const response: any = {
    interaction_context: {
      type: interactionType,
      context: context,
      prepared_at: new Date().toISOString(),
    },
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
    shared_memories: includeSharedMemories
      ? (socialContext.data?.sharedMemories || []).map((memory: any) => ({
          key: memory.key,
          content: memory.content,
          tags: memory.tags,
          importance: memory.importance,
          stored_at: memory.storedAt,
          link_type: memory.linkType,
          link_strength: memory.linkStrength,
          link_context: memory.linkContext,
          social_context: memory.socialContext,
        }))
      : [],
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
      triggers:
        socialContext.data?.emotionalContexts ||
        []
          .filter((ec: any) => ec.emotionalState === state && ec.trigger)
          .map((ec: any) => ec.trigger!)
          .slice(0, 3),
    }));
  }

  // Generate interaction-specific recommendations
  if (includeConversationTips) {
    // Base relationship tips
    if (socialContext.data?.relationship) {
      response.recommendations.communication_tips.push(
        `Relationship strength: ${socialContext.data.relationship.strength}/1.0`,
        `Trust level: ${socialContext.data.relationship.trust}/1.0`,
        `Familiarity: ${socialContext.data.relationship.familiarity}/1.0`
      );
    }

    // Interaction-specific tips
    switch (interactionType) {
      case 'meeting':
      case 'project_work':
        response.recommendations.communication_tips.push(
          'Focus on collaborative outcomes and shared goals',
          'Reference previous project successes if available'
        );
        break;
      case 'casual_chat':
      case 'social':
        response.recommendations.communication_tips.push(
          'Keep tone light and personal',
          'Ask about their current interests and activities'
        );
        break;
      case 'problem_solving':
        response.recommendations.communication_tips.push(
          'Listen actively and ask clarifying questions',
          'Build on their ideas and previous solutions'
        );
        break;
      case 'creative_session':
      case 'brainstorming':
        response.recommendations.communication_tips.push(
          'Encourage creative thinking and wild ideas',
          'Reference past creative collaborations'
        );
        break;
    }

    // Context-specific recommendations
    if (context) {
      response.recommendations.communication_tips.push(`Context: ${context} - tailor conversation accordingly`);
    }
  }

  // Enhanced emotional preparation
  if (
    includeEmotionalPrep &&
    socialContext.data?.emotionalContexts &&
    Array.isArray(socialContext.data.emotionalContexts) &&
    socialContext.data.emotionalContexts.length > 0
  ) {
    const lastEmotional = socialContext.data?.emotionalContexts?.[0];
    const emotionalTrends = socialContext.data.emotionalContexts.slice(0, 5);

    response.recommendations.emotional_prep
      .push(
        `Last emotional state: ${lastEmotional.emotionalState}`,
        lastEmotional.response ? `Previous response: ${lastEmotional.response}` : '',
        `Recent emotional pattern: ${emotionalTrends.map(ec => ec.emotionalState).join(' → ')}`
      )
      .filter(Boolean);

    // Add emotional triggers awareness
    const triggers = emotionalTrends
      .filter(ec => ec.trigger)
      .map(ec => ec.trigger)
      .slice(0, 3);

    if (triggers.length > 0) {
      response.recommendations.emotional_prep.push(`Be mindful of triggers: ${triggers.join(', ')}`);
    }
  }

  // Memory-based recommendations
  if (includeSharedMemories && socialContext.data?.sharedMemories && socialContext.data.sharedMemories.length > 0) {
    const highImportanceMemories = socialContext.data.sharedMemories
      .filter((memory: any) => memory.importance === 'high' || memory.importance === 'critical')
      .slice(0, 3);

    if (highImportanceMemories.length > 0) {
      response.recommendations.memory_reminders = highImportanceMemories.map((memory: any) => ({
        key: memory.key,
        summary:
          typeof memory.content === 'string' ? memory.content.substring(0, 100) + '...' : 'Important shared memory',
        importance: memory.importance,
        link_context: memory.linkContext,
      }));
    }

    // Generate conversation starters from memories
    const recentMemories = socialContext.data.sharedMemories
      .filter((memory: any) => memory.tags && memory.tags.length > 0)
      .slice(0, 3);

    response.recommendations.conversation_starters = recentMemories.map((memory: any) => {
      const tags = Array.isArray(memory.tags) ? memory.tags : JSON.parse(memory.tags || '[]');
      return `Ask about ${tags[0]} (from your shared memory: ${memory.key})`;
    });
  }

  return ResponseBuilder.success(response, `Social context prepared for ${interactionType} with '${entityName}'`);
};
