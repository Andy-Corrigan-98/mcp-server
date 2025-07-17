import { ConfigurableBase } from './base/configurable-base.js';
import { SocialValidationUtils } from './base/validation-utils.js';
import { SocialResponseBuilder } from './base/response-builder.js';
import { SocialEntityManager } from './entity-manager.js';
import { SocialRelationshipManager } from './relationship-manager.js';

/**
 * Interaction Recorder for Social Consciousness System
 * Handles recording and searching social interactions
 */
export class SocialInteractionRecorder extends ConfigurableBase {
  private entityManager: SocialEntityManager;
  private relationshipManager: SocialRelationshipManager;

  // Configuration for interaction recording
  protected config = {
    maxContextLength: 800,
    maxSummaryLength: 600,
    maxLearningLength: 800,
    qualityDefault: 0.5,
    emotionalIntensityDefault: 0.5,
  };

  constructor(entityManager: SocialEntityManager, relationshipManager: SocialRelationshipManager) {
    super();
    this.entityManager = entityManager;
    this.relationshipManager = relationshipManager;
  }

  /**
   * Record a new social interaction
   */
  async recordInteraction(args: {
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
  }): Promise<object> {
    const entityName = SocialValidationUtils.validateRequiredString(args.entity_name, 'entity_name', 100);
    const interactionType = args.interaction_type;
    const context = args.context
      ? SocialValidationUtils.sanitizeString(args.context, this.config.maxContextLength)
      : undefined;
    const summary = args.summary
      ? SocialValidationUtils.sanitizeString(args.summary, this.config.maxSummaryLength)
      : undefined;
    const duration = SocialValidationUtils.validatePositiveNumber(args.duration);
    const quality = SocialValidationUtils.validateProbability(args.quality, this.config.qualityDefault);
    const learningExtracted = args.learning_extracted
      ? SocialValidationUtils.sanitizeString(args.learning_extracted, this.config.maxLearningLength)
      : undefined;
    const myEmotionalState = args.my_emotional_state;
    const theirEmotionalState = args.their_emotional_state;
    const conversationStyle = args.conversation_style;
    const relationshipImpact = args.relationship_impact;
    const relatedMemories = args.related_memories;

    // Get the entity
    const entity = await this.entityManager.getEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }

    // Determine emotional tone from myEmotionalState or default to neutral
    let emotionalTone = 'neutral';
    if (myEmotionalState && myEmotionalState.primary) {
      emotionalTone = myEmotionalState.primary as string;
    }

    // Create the interaction record
    const newInteraction = await this.db.execute(async prisma => {
      return prisma.socialInteraction.create({
        data: {
          entityId: entity.id,
          interactionType: interactionType as any,
          context,
          summary,
          duration,
          quality,
          learningExtracted,
          emotionalTone: emotionalTone as any,
          myEmotionalState: SocialValidationUtils.validateAndStringifyJson(myEmotionalState),
          theirEmotionalState: SocialValidationUtils.validateAndStringifyJson(theirEmotionalState),
          conversationStyle: SocialValidationUtils.validateAndStringifyJson(conversationStyle),
        },
      });
    });

    // Update entity's last interaction timestamp
    await this.entityManager.updateLastInteraction(entity.id);

    // Update relationship dynamics based on this interaction
    if (quality !== undefined) {
      await this.relationshipManager.updateFromInteraction(entity.id, {
        quality,
        duration,
        interactionType,
        learningExtracted,
      });
    }

    // Store relationship impact if provided
    if (relationshipImpact) {
      // Store as an insight or learning for future reference
      try {
        await this.db.execute(async prisma => {
          return prisma.socialLearning.create({
            data: {
              entityId: entity.id,
              learningType: 'relationship_dynamic',
              insight: `Interaction impact: ${SocialValidationUtils.validateAndStringifyJson(relationshipImpact)}`,
              confidence: 0.7,
              applicability: `Relationship with ${entityName}`,
            },
          });
        });
      } catch {
        console.warn('Failed to store relationship impact');
      }
    }

    return SocialResponseBuilder.interactionRecorded(
      {
        id: newInteraction.id,
        entity: entityName,
        type: interactionType,
        quality,
        duration,
        emotional_tone: emotionalTone,
        learning_extracted: learningExtracted,
        created_at: newInteraction.createdAt,
      },
      entityName,
      relatedMemories || [],
      quality !== undefined
    );
  }

  /**
   * Search for interactions with filtering
   */
  async searchInteractions(args: {
    entity_name?: string;
    interaction_type?: string;
    date_range?: { start: string; end: string };
    context_keywords?: string[];
    limit?: number;
  }): Promise<object> {
    const entityName = args.entity_name;
    const interactionType = args.interaction_type;
    const dateRange = args.date_range;
    const contextKeywords = args.context_keywords || [];
    const limit = Math.min(args.limit || 50, 100); // Cap at 100

    // Build where clause
    const whereClause: any = {};

    if (entityName) {
      const entity = await this.entityManager.getEntityByName(entityName);
      if (!entity) {
        throw new Error(`Social entity '${entityName}' not found`);
      }
      whereClause.entityId = entity.id;
    }

    if (interactionType) {
      whereClause.interactionType = interactionType;
    }

    if (dateRange) {
      whereClause.createdAt = {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end),
      };
    }

    // Handle context keywords search
    if (contextKeywords.length > 0) {
      const keywordConditions = contextKeywords.map(keyword => ({
        OR: [
          { context: { contains: keyword, mode: 'insensitive' } },
          { summary: { contains: keyword, mode: 'insensitive' } },
          { learningExtracted: { contains: keyword, mode: 'insensitive' } },
        ],
      }));
      whereClause.AND = keywordConditions;
    }

    // Get interactions
    const interactions = await this.db.execute(async prisma => {
      return prisma.socialInteraction.findMany({
        where: whereClause,
        include: {
          entity: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    });

    // Format results
    const formattedInteractions = interactions.map((interaction: any) => ({
      id: interaction.id,
      entity: {
        name: interaction.entity.name,
        displayName: interaction.entity.displayName,
      },
      type: interaction.interactionType,
      context: interaction.context,
      summary: interaction.summary,
      duration: interaction.duration,
      quality: interaction.quality,
      learning_extracted: interaction.learningExtracted,
      emotional_tone: interaction.emotionalTone,
      my_emotional_state: SocialValidationUtils.parseJsonSafely(interaction.myEmotionalState, undefined),
      their_emotional_state: SocialValidationUtils.parseJsonSafely(interaction.theirEmotionalState, undefined),
      conversation_style: SocialValidationUtils.parseJsonSafely(interaction.conversationStyle, undefined),
      created_at: interaction.createdAt,
    }));

    return SocialResponseBuilder.searchResults(
      formattedInteractions,
      {
        entity_name: entityName,
        interaction_type: interactionType,
        date_range: dateRange,
        context_keywords: contextKeywords,
      },
      'interactions'
    );
  }

  /**
   * Get recent interactions for an entity
   */
  async getRecentInteractions(entityId: number, limit: number = 10) {
    return await this.db.execute(async prisma => {
      return prisma.socialInteraction.findMany({
        where: { entityId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    });
  }
}
