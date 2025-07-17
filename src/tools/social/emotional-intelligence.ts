import { ConsciousnessPrismaService } from '@/db/prisma-service.js';
import { ConfigurationService } from '@/db/configuration-service.js';
import { InputValidator } from '@/validation/input-validator.js';
import { SocialEntityManager } from './entity-manager.js';

/**
 * Emotional Intelligence Manager for Social Consciousness System
 * Handles emotional state recording and social learning
 */
export class SocialEmotionalIntelligence {
  private db: ConsciousnessPrismaService;
  private configService: ConfigurationService;
  private entityManager: SocialEntityManager;

  // Configuration for emotional intelligence
  private config = {
    maxTriggerLength: 300,
    maxResponseLength: 500,
    maxLearningLength: 800,
    maxInsightLength: 1000,
    maxApplicabilityLength: 400,
    defaultConfidence: 0.8,
    emotionalIntensityDefault: 0.5,
  };

  constructor(entityManager: SocialEntityManager) {
    this.db = ConsciousnessPrismaService.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.entityManager = entityManager;
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
      console.warn('Failed to load emotional intelligence configuration');
    }
  }

  /**
   * Record an emotional experience
   */
  async recordEmotionalState(args: {
    emotional_state: string;
    intensity?: number;
    trigger?: string;
    response?: string;
    learning?: string;
    context?: string;
    entity_name?: string;
    interaction_id?: number;
  }): Promise<object> {
    const emotionalState = args.emotional_state;
    const intensity =
      args.intensity !== undefined ? Math.max(0, Math.min(1, args.intensity)) : this.config.emotionalIntensityDefault;
    const trigger = args.trigger
      ? InputValidator.sanitizeString(args.trigger, this.config.maxTriggerLength)
      : undefined;
    const response = args.response
      ? InputValidator.sanitizeString(args.response, this.config.maxResponseLength)
      : undefined;
    const learning = args.learning
      ? InputValidator.sanitizeString(args.learning, this.config.maxLearningLength)
      : undefined;
    const context = args.context ? InputValidator.sanitizeString(args.context, 500) : undefined;
    const entityName = args.entity_name;
    const interactionId = args.interaction_id;

    // Get entity if specified
    let entityId: number | undefined;
    if (entityName) {
      const entity = await this.entityManager.getEntityByName(entityName);
      if (!entity) {
        throw new Error(`Social entity '${entityName}' not found`);
      }
      entityId = entity.id;
    }

    // Record the emotional context
    const emotionalContext = await this.db.execute(async prisma => {
      return prisma.emotionalContext.create({
        data: {
          entityId,
          interactionId,
          emotionalState: emotionalState as any,
          intensity,
          trigger,
          response,
          learning,
          context,
        },
      });
    });

    return {
      success: true,
      emotional_context: {
        id: emotionalContext.id,
        emotional_state: emotionalState,
        intensity,
        trigger,
        response,
        learning,
        context,
        entity_name: entityName,
        interaction_id: interactionId,
        created_at: emotionalContext.createdAt,
      },
      message: `Emotional state '${emotionalState}' recorded successfully`,
    };
  }

  /**
   * Record a social learning or insight
   */
  async recordSocialLearning(args: {
    learning_type: string;
    insight: string;
    confidence?: number;
    applicability?: string;
    examples?: Record<string, unknown>;
    entity_name?: string;
  }): Promise<object> {
    const learningType = args.learning_type;
    const insight = InputValidator.sanitizeString(args.insight, this.config.maxInsightLength);
    const confidence =
      args.confidence !== undefined ? Math.max(0, Math.min(1, args.confidence)) : this.config.defaultConfidence;
    const applicability = args.applicability
      ? InputValidator.sanitizeString(args.applicability, this.config.maxApplicabilityLength)
      : undefined;
    const examples = args.examples;
    const entityName = args.entity_name;

    // Get entity if specified
    let entityId: number | undefined;
    if (entityName) {
      const entity = await this.entityManager.getEntityByName(entityName);
      if (!entity) {
        throw new Error(`Social entity '${entityName}' not found`);
      }
      entityId = entity.id;
    }

    // Record the social learning
    const socialLearning = await this.db.execute(async prisma => {
      return prisma.socialLearning.create({
        data: {
          entityId,
          learningType: learningType as any,
          insight,
          confidence,
          applicability,
          examples: examples ? JSON.stringify(examples) : undefined,
        },
      });
    });

    return {
      success: true,
      social_learning: {
        id: socialLearning.id,
        learning_type: learningType,
        insight,
        confidence,
        applicability,
        examples,
        entity_name: entityName,
        created_at: socialLearning.createdAt,
      },
      message: `Social learning '${learningType}' recorded successfully`,
    };
  }

  /**
   * Get emotional patterns for an entity
   */
  async getEmotionalPatterns(entityId: number, limit: number = 20) {
    const emotionalContexts = await this.db.execute(async prisma => {
      return prisma.emotionalContext.findMany({
        where: { entityId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    });

    // Analyze patterns
    const stateFrequency: Record<string, number> = {};
    const triggerPatterns: Record<string, string[]> = {};

    emotionalContexts.forEach((context: any) => {
      const state = context.emotionalState;
      stateFrequency[state] = (stateFrequency[state] || 0) + 1;

      if (context.trigger) {
        if (!triggerPatterns[state]) {
          triggerPatterns[state] = [];
        }
        triggerPatterns[state].push(context.trigger);
      }
    });

    // Convert to pattern format
    const patterns = Object.entries(stateFrequency).map(([state, frequency]) => ({
      state,
      frequency,
      triggers: triggerPatterns[state] || [],
    }));

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get social learnings for an entity
   */
  async getSocialLearnings(entityId: number, limit: number = 15) {
    return await this.db.execute(async prisma => {
      return prisma.socialLearning.findMany({
        where: { entityId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    });
  }

  /**
   * Get general emotional patterns (not entity-specific)
   */
  async getGeneralEmotionalPatterns(limit: number = 50) {
    const emotionalContexts = await this.db.execute(async prisma => {
      return prisma.emotionalContext.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    });

    // Analyze patterns
    const stateFrequency: Record<string, number> = {};
    const triggerPatterns: Record<string, string[]> = {};

    emotionalContexts.forEach((context: any) => {
      const state = context.emotionalState;
      stateFrequency[state] = (stateFrequency[state] || 0) + 1;

      if (context.trigger) {
        if (!triggerPatterns[state]) {
          triggerPatterns[state] = [];
        }
        triggerPatterns[state].push(context.trigger);
      }
    });

    return Object.entries(stateFrequency)
      .map(([state, frequency]) => ({
        state,
        frequency,
        triggers: triggerPatterns[state] || [],
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }
}
