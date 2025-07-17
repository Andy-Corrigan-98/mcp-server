import { ConsciousnessPrismaService } from '@/db/prisma-service.js';
import { ConfigurationService } from '@/db/configuration-service.js';
import { InputValidator } from '@/validation/input-validator.js';
import { SocialEntityManager } from './entity-manager.js';
import { SocialRelationshipManager } from './relationship-manager.js';

/**
 * Interaction Recorder for Social Consciousness System
 * Handles recording and searching social interactions
 */
export class SocialInteractionRecorder {
  private db: ConsciousnessPrismaService;
  private configService: ConfigurationService;
  private entityManager: SocialEntityManager;
  private relationshipManager: SocialRelationshipManager;

  // Configuration for interaction recording
  private config = {
    maxContextLength: 800,
    maxSummaryLength: 600,
    maxLearningLength: 800,
    qualityDefault: 0.5,
    emotionalIntensityDefault: 0.5,
  };

  constructor(entityManager: SocialEntityManager, relationshipManager: SocialRelationshipManager) {
    this.db = ConsciousnessPrismaService.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.entityManager = entityManager;
    this.relationshipManager = relationshipManager;
    this.loadConfiguration();
  }

  /**
   * Load configuration values
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const configs = await this.configService.getConfigurationsByCategory('SOCIAL');
      configs.forEach((config: any) => {
        const key = config.key.replace('social.', '');
        if (key in this.config) {
          (this.config as any)[key] = config.value;
        }
      });
    } catch {
      console.warn('Failed to load interaction recorder configuration');
    }
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
    const entityName = InputValidator.sanitizeString(args.entity_name, 100);
    const interactionType = args.interaction_type;
    const context = args.context
      ? InputValidator.sanitizeString(args.context, this.config.maxContextLength)
      : undefined;
    const summary = args.summary
      ? InputValidator.sanitizeString(args.summary, this.config.maxSummaryLength)
      : undefined;
    const duration = args.duration;
    const quality = args.quality !== undefined ? Math.max(0, Math.min(1, args.quality)) : this.config.qualityDefault;
    const learningExtracted = args.learning_extracted
      ? InputValidator.sanitizeString(args.learning_extracted, this.config.maxLearningLength)
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
          myEmotionalState: myEmotionalState ? JSON.stringify(myEmotionalState) : undefined,
          theirEmotionalState: theirEmotionalState ? JSON.stringify(theirEmotionalState) : undefined,
          conversationStyle: conversationStyle ? JSON.stringify(conversationStyle) : undefined,
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
              insight: `Interaction impact: ${JSON.stringify(relationshipImpact)}`,
              confidence: 0.7,
              applicability: `Relationship with ${entityName}`,
            },
          });
        });
      } catch {
        console.warn('Failed to store relationship impact');
      }
    }

    return {
      success: true,
      interaction: {
        id: newInteraction.id,
        entity: entityName,
        type: interactionType,
        quality,
        duration,
        emotional_tone: emotionalTone,
        learning_extracted: learningExtracted,
        created_at: newInteraction.createdAt,
      },
      relationship_updated: quality !== undefined,
      related_memories: relatedMemories || [],
      message: `Interaction with '${entityName}' recorded successfully`,
    };
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
      my_emotional_state: interaction.myEmotionalState ? JSON.parse(interaction.myEmotionalState) : undefined,
      their_emotional_state: interaction.theirEmotionalState ? JSON.parse(interaction.theirEmotionalState) : undefined,
      conversation_style: interaction.conversationStyle ? JSON.parse(interaction.conversationStyle) : undefined,
      created_at: interaction.createdAt,
    }));

    return {
      success: true,
      interactions: formattedInteractions,
      total_found: formattedInteractions.length,
      filters_applied: {
        entity_name: entityName,
        interaction_type: interactionType,
        date_range: dateRange,
        context_keywords: contextKeywords,
      },
      message: `Found ${formattedInteractions.length} interactions`,
    };
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
