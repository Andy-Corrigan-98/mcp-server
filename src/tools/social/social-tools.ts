import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { InputValidator } from '@/validation/input-validator.js';
import { ServiceBase } from '../base/index.js';
import {
  SOCIAL_TOOLS,
  SocialContextResult,
  SocialPatternAnalysis,
  SharedMemory,
  RelationshipUpdateData,
} from './types.js';

/**
 * Social tools configuration interface
 */
interface SocialConfig {
  maxEntityNameLength: number;
  maxDisplayNameLength: number;
  maxDescriptionLength: number;
  maxNotesLength: number;
  maxContextLength: number;
  maxSummaryLength: number;
  maxLearningLength: number;
  maxInsightLength: number;
  maxApplicabilityLength: number;
  maxTriggerLength: number;
  maxResponseLength: number;
  maxRecommendationLength: number;
  defaultConfidence: number;
  maxRecentInteractions: number;
  maxSocialLearnings: number;
  maxEmotionalPatterns: number;
  maxRecommendations: number;
  relationshipDecayTime: number;
  emotionalIntensityDefault: number;
  qualityDefault: number;
}

/**
 * Social Consciousness Tools implementation
 * Provides relationship tracking, emotional intelligence, and social learning
 */
export class SocialTools extends ServiceBase {
  private config: SocialConfig = {} as SocialConfig;

  constructor() {
    super();

    // Initialize configuration with defaults
    this.initializeDefaults();

    // Load configuration values asynchronously to override defaults
    this.loadConfiguration();
  }

  /**
   * Get all available social consciousness tools
   */
  getTools(): Record<string, Tool> {
    return SOCIAL_TOOLS;
  }

  /**
   * Execute a social consciousness tool operation
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'social_entity_create':
        return this.createSocialEntity(args);
      case 'social_entity_update':
        return this.updateSocialEntity(args);
      case 'social_entity_get':
        return this.getSocialEntity(args);
      case 'social_relationship_create':
        return this.createRelationship(args);
      case 'social_relationship_update':
        return this.updateRelationship(args);
      case 'social_interaction_record':
        return this.recordInteraction(args);
      case 'social_interaction_search':
        return this.searchInteractions(args);
      case 'emotional_state_record':
        return this.recordEmotionalState(args);
      case 'social_learning_record':
        return this.recordSocialLearning(args);
      case 'social_context_prepare':
        return this.prepareSocialContext(args);
      case 'social_pattern_analyze':
        return this.analyzeSocialPatterns(args);
      case 'memory_social_link_create':
        return this.createMemorySocialLink(args);
      case 'memory_social_search':
        return this.searchMemorySocialLinks(args);
      case 'social_memory_context':
        return this.getSocialMemoryContext(args);
      default:
        throw new Error(`Unknown social tool: ${toolName}`);
    }
  }

  /**
   * Initialize configuration with default values
   */
  private initializeDefaults(): void {
    this.config = {
      maxEntityNameLength: 100,
      maxDisplayNameLength: 150,
      maxDescriptionLength: 500,
      maxNotesLength: 1000,
      maxContextLength: 800,
      maxSummaryLength: 600,
      maxLearningLength: 800,
      maxInsightLength: 1000,
      maxApplicabilityLength: 400,
      maxTriggerLength: 300,
      maxResponseLength: 500,
      maxRecommendationLength: 200,
      defaultConfidence: 0.8,
      maxRecentInteractions: 10,
      maxSocialLearnings: 15,
      maxEmotionalPatterns: 8,
      maxRecommendations: 5,
      relationshipDecayTime: 7776000000, // 90 days in milliseconds
      emotionalIntensityDefault: 0.5,
      qualityDefault: 0.5,
    };
  }

  /**
   * Load configuration values from database
   */
  private async loadConfiguration(): Promise<void> {
    try {
      this.config = {
        ...this.config,
        maxEntityNameLength: await this.configService.getNumber(
          'social.max_entity_name_length',
          this.config.maxEntityNameLength
        ),
        maxDisplayNameLength: await this.configService.getNumber(
          'social.max_display_name_length',
          this.config.maxDisplayNameLength
        ),
        maxDescriptionLength: await this.configService.getNumber(
          'social.max_description_length',
          this.config.maxDescriptionLength
        ),
        maxNotesLength: await this.configService.getNumber('social.max_notes_length', this.config.maxNotesLength),
        maxContextLength: await this.configService.getNumber('social.max_context_length', this.config.maxContextLength),
        maxSummaryLength: await this.configService.getNumber('social.max_summary_length', this.config.maxSummaryLength),
        maxLearningLength: await this.configService.getNumber(
          'social.max_learning_length',
          this.config.maxLearningLength
        ),
        maxInsightLength: await this.configService.getNumber('social.max_insight_length', this.config.maxInsightLength),
        maxApplicabilityLength: await this.configService.getNumber(
          'social.max_applicability_length',
          this.config.maxApplicabilityLength
        ),
        maxTriggerLength: await this.configService.getNumber('social.max_trigger_length', this.config.maxTriggerLength),
        maxResponseLength: await this.configService.getNumber(
          'social.max_response_length',
          this.config.maxResponseLength
        ),
        maxRecommendationLength: await this.configService.getNumber(
          'social.max_recommendation_length',
          this.config.maxRecommendationLength
        ),
        defaultConfidence: await this.configService.getNumber(
          'social.default_confidence',
          this.config.defaultConfidence
        ),
        maxRecentInteractions: await this.configService.getNumber(
          'social.max_recent_interactions',
          this.config.maxRecentInteractions
        ),
        maxSocialLearnings: await this.configService.getNumber(
          'social.max_social_learnings',
          this.config.maxSocialLearnings
        ),
        maxEmotionalPatterns: await this.configService.getNumber(
          'social.max_emotional_patterns',
          this.config.maxEmotionalPatterns
        ),
        maxRecommendations: await this.configService.getNumber(
          'social.max_recommendations',
          this.config.maxRecommendations
        ),
        relationshipDecayTime: await this.configService.getNumber(
          'social.relationship_decay_time',
          this.config.relationshipDecayTime
        ),
        emotionalIntensityDefault: await this.configService.getNumber(
          'social.emotional_intensity_default',
          this.config.emotionalIntensityDefault
        ),
        qualityDefault: await this.configService.getNumber('social.quality_default', this.config.qualityDefault),
      };
    } catch (error) {
      console.warn('Failed to load social configuration, using defaults:', error);
    }
  }

  /**
   * Create a new social entity
   */
  private async createSocialEntity(args: Record<string, unknown>): Promise<object> {
    const name = InputValidator.sanitizeString(args.name as string, this.config.maxEntityNameLength);
    const entityType = args.entity_type as string;
    const displayName = args.display_name
      ? InputValidator.sanitizeString(args.display_name as string, this.config.maxDisplayNameLength)
      : undefined;
    const description = args.description
      ? InputValidator.sanitizeString(args.description as string, this.config.maxDescriptionLength)
      : undefined;
    const properties = (args.properties as Record<string, unknown>) || {};

    // Check if entity already exists
    const existing = await this.getSocialEntityByName(name);
    if (existing) {
      throw new Error(`Social entity '${name}' already exists`);
    }

    // Create the entity using the database service
    const newEntity = await this.db.execute(async prisma => {
      return prisma.socialEntity.create({
        data: {
          name,
          entityType: entityType as any,
          displayName,
          description,
          properties: JSON.stringify(properties),
        },
      });
    });

    return {
      success: true,
      entity: name,
      entity_type: entityType,
      display_name: displayName,
      entity_id: newEntity.id,
      message: `Social entity '${displayName || name}' created successfully`,
    };
  }

  /**
   * Update an existing social entity
   */
  private async updateSocialEntity(args: Record<string, unknown>): Promise<object> {
    const name = InputValidator.sanitizeString(args.name as string, this.config.maxEntityNameLength);
    const displayName = args.display_name
      ? InputValidator.sanitizeString(args.display_name as string, this.config.maxDisplayNameLength)
      : undefined;
    const description = args.description
      ? InputValidator.sanitizeString(args.description as string, this.config.maxDescriptionLength)
      : undefined;
    const newProperties = (args.properties as Record<string, unknown>) || {};

    // Get existing entity
    const entity = await this.getSocialEntityByName(name);
    if (!entity) {
      throw new Error(`Social entity '${name}' not found`);
    }

    // Merge properties
    const existingProperties = entity.properties ? JSON.parse(entity.properties) : {};
    const mergedProperties = { ...existingProperties, ...newProperties };

    // Update the entity
    await this.db.execute(async prisma => {
      return prisma.socialEntity.update({
        where: { name },
        data: {
          ...(displayName && { displayName }),
          ...(description && { description }),
          properties: JSON.stringify(mergedProperties),
          updatedAt: new Date(),
        },
      });
    });

    return {
      success: true,
      entity: name,
      updated_fields: Object.keys({ displayName, description, properties: newProperties }).filter(
        key => args[key] !== undefined
      ),
      message: `Social entity '${displayName || name}' updated successfully`,
    };
  }

  /**
   * Get comprehensive information about a social entity
   */
  private async getSocialEntity(args: Record<string, unknown>): Promise<SocialContextResult> {
    const name = InputValidator.sanitizeString(args.name as string, this.config.maxEntityNameLength);
    const includeInteractions = Boolean(args.include_interactions !== false);
    const includeRelationship = Boolean(args.include_relationship !== false);
    const includeEmotionalContext = Boolean(args.include_emotional_context);

    // Get the entity
    const entity = await this.getSocialEntityByName(name);
    if (!entity) {
      throw new Error(`Social entity '${name}' not found`);
    }

    // Get relationship if requested
    let relationship;
    if (includeRelationship) {
      const relationshipData = await this.db.execute(async prisma => {
        return prisma.socialRelationship.findFirst({
          where: { entityId: entity.id },
        });
      });
      if (relationshipData) {
        relationship = {
          type: relationshipData.relationshipType,
          strength: relationshipData.strength,
          trust: relationshipData.trust,
          familiarity: relationshipData.familiarity,
          affinity: relationshipData.affinity,
          communicationStyle: relationshipData.communicationStyle
            ? JSON.parse(relationshipData.communicationStyle)
            : undefined,
          notes: relationshipData.notes || undefined,
        };
      }
    }

    // Get recent interactions if requested
    let recentInteractions: SocialContextResult['recentInteractions'] = [];
    if (includeInteractions) {
      const interactions = await this.db.execute(async prisma => {
        return prisma.socialInteraction.findMany({
          where: { entityId: entity.id },
          orderBy: { createdAt: 'desc' },
          take: this.config.maxRecentInteractions,
        });
      });

      recentInteractions = interactions.map(interaction => ({
        type: interaction.interactionType,
        date: interaction.createdAt,
        quality: interaction.quality || undefined,
        summary: interaction.summary || undefined,
        learningExtracted: interaction.learningExtracted || undefined,
      }));
    }

    // Get emotional patterns if requested
    let emotionalPatterns: SocialContextResult['emotionalPatterns'] = [];
    if (includeEmotionalContext) {
      const emotionalContexts = await this.db.execute(async prisma => {
        return prisma.emotionalContext.findMany({
          where: { entityId: entity.id },
          orderBy: { createdAt: 'desc' },
          take: 50, // Get recent emotional data
        });
      });

      // Analyze emotional patterns
      const emotionalStateFrequency: Record<string, number> = {};
      const emotionalTriggers: Record<string, string[]> = {};

      emotionalContexts.forEach(context => {
        // Count frequency of emotional states
        emotionalStateFrequency[context.emotionalState] = (emotionalStateFrequency[context.emotionalState] || 0) + 1;

        // Collect triggers for each emotional state
        if (context.trigger) {
          if (!emotionalTriggers[context.emotionalState]) {
            emotionalTriggers[context.emotionalState] = [];
          }
          emotionalTriggers[context.emotionalState].push(context.trigger);
        }
      });

      // Generate patterns from the analysis
      emotionalPatterns = Object.entries(emotionalStateFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, this.config.maxEmotionalPatterns)
        .map(([state, frequency]) => ({
          state,
          frequency: frequency / emotionalContexts.length,
          triggers: [...new Set(emotionalTriggers[state] || [])].slice(0, 3),
        }));
    }

    // Get social learnings
    const learnings = await this.db.execute(async prisma => {
      return prisma.socialLearning.findMany({
        where: { entityId: entity.id },
        orderBy: { createdAt: 'desc' },
        take: this.config.maxSocialLearnings,
      });
    });

    const socialLearnings = learnings.map(learning => ({
      type: learning.learningType,
      insight: learning.insight,
      confidence: learning.confidence,
      applicability: learning.applicability || undefined,
    }));

    // Generate recommendations based on the data
    // Enhanced: Get shared memories if requested
    let sharedMemories: SharedMemory[] = [];
    let memoryInsights: Array<{
      pattern: string;
      examples: string[];
      strength: number;
    }> = [];

    if (args.include_shared_memories !== false) {
      const memoryData = await this.getSharedMemoriesForEntity(entity.id);
      sharedMemories = memoryData.memories;
      memoryInsights = memoryData.insights;
    }

    const recommendations = this.generateRecommendations(
      entity,
      relationship,
      recentInteractions,
      socialLearnings,
      sharedMemories
    );

    return {
      entity: {
        name: entity.name,
        displayName: entity.displayName || undefined,
        entityType: entity.entityType,
        description: entity.description || undefined,
        lastInteraction: entity.lastInteraction || undefined,
      },
      relationship,
      recentInteractions,
      emotionalPatterns,
      socialLearnings,
      // Enhanced: Include shared memories and insights
      sharedMemories,
      memoryInsights,
      recommendations,
    };
  }

  /**
   * Create a relationship with a social entity
   */
  private async createRelationship(args: Record<string, unknown>): Promise<object> {
    const entityName = InputValidator.sanitizeString(args.entity_name as string, this.config.maxEntityNameLength);
    const relationshipType = args.relationship_type as string;
    const strength = Math.max(0, Math.min(1, (args.strength as number) || 0.5));
    const trust = Math.max(0, Math.min(1, (args.trust as number) || 0.5));
    const familiarity = Math.max(0, Math.min(1, (args.familiarity as number) || 0.1));
    const affinity = Math.max(0, Math.min(1, (args.affinity as number) || 0.5));
    const communicationStyle = args.communication_style as Record<string, unknown>;
    const notes = args.notes
      ? InputValidator.sanitizeString(args.notes as string, this.config.maxNotesLength)
      : undefined;

    // Get the entity
    const entity = await this.getSocialEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }

    // Check if relationship already exists
    const existingRelationship = await this.db.execute(async prisma => {
      return prisma.socialRelationship.findFirst({
        where: { entityId: entity.id },
      });
    });

    if (existingRelationship) {
      throw new Error(`Relationship with '${entityName}' already exists. Use social_relationship_update instead.`);
    }

    // Create the relationship
    await this.db.execute(async prisma => {
      return prisma.socialRelationship.create({
        data: {
          entityId: entity.id,
          relationshipType: relationshipType as any,
          strength,
          trust,
          familiarity,
          affinity,
          communicationStyle: communicationStyle ? JSON.stringify(communicationStyle) : null,
          notes,
        },
      });
    });

    return {
      success: true,
      entity: entityName,
      relationship_type: relationshipType,
      dimensions: { strength, trust, familiarity, affinity },
      message: `Relationship with '${entity.displayName || entityName}' established as ${relationshipType}`,
    };
  }

  /**
   * Update relationship dynamics
   */
  private async updateRelationship(args: Record<string, unknown>): Promise<object> {
    const entityName = InputValidator.sanitizeString(args.entity_name as string, this.config.maxEntityNameLength);
    const reason = args.reason
      ? InputValidator.sanitizeString(args.reason as string, this.config.maxNotesLength)
      : undefined;

    // Get the entity
    const entity = await this.getSocialEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }

    // Get existing relationship
    const relationship = await this.db.execute(async prisma => {
      return prisma.socialRelationship.findFirst({
        where: { entityId: entity.id },
      });
    });

    if (!relationship) {
      throw new Error(`No relationship found with '${entityName}'. Create one first.`);
    }

    // Prepare update data
    const updateData: RelationshipUpdateData = { updatedAt: new Date() };
    const updatedFields: string[] = [];

    if (args.strength !== undefined) {
      updateData.strength = Math.max(0, Math.min(1, args.strength as number));
      updatedFields.push('strength');
    }
    if (args.trust !== undefined) {
      updateData.trust = Math.max(0, Math.min(1, args.trust as number));
      updatedFields.push('trust');
    }
    if (args.familiarity !== undefined) {
      updateData.familiarity = Math.max(0, Math.min(1, args.familiarity as number));
      updatedFields.push('familiarity');
    }
    if (args.affinity !== undefined) {
      updateData.affinity = Math.max(0, Math.min(1, args.affinity as number));
      updatedFields.push('affinity');
    }
    if (args.communication_style) {
      const existingStyle = relationship.communicationStyle ? JSON.parse(relationship.communicationStyle) : {};
      const newStyle = { ...existingStyle, ...(args.communication_style as Record<string, unknown>) };
      updateData.communicationStyle = JSON.stringify(newStyle);
      updatedFields.push('communication_style');
    }
    if (args.notes !== undefined) {
      updateData.notes = args.notes
        ? InputValidator.sanitizeString(args.notes as string, this.config.maxNotesLength)
        : undefined;
      updatedFields.push('notes');
    }

    // Update the relationship
    const updatedRelationship = await this.db.execute(async prisma => {
      return prisma.socialRelationship.update({
        where: { id: relationship.id },
        data: updateData,
      });
    });

    // Record this update as a social learning if reason is provided
    if (reason) {
      await this.recordSocialLearning({
        entity_name: entityName,
        learning_type: 'relationship_dynamic',
        insight: `Relationship update: ${reason}. Updated fields: ${updatedFields.join(', ')}`,
        confidence: 0.7,
        applicability: `Future interactions with ${entityName}`,
      });
    }

    return {
      success: true,
      entity: entityName,
      updated_fields: updatedFields,
      new_dimensions: {
        strength: updatedRelationship.strength,
        trust: updatedRelationship.trust,
        familiarity: updatedRelationship.familiarity,
        affinity: updatedRelationship.affinity,
      },
      message: `Relationship with '${entity.displayName || entityName}' updated`,
    };
  }

  /**
   * Record a new social interaction
   */
  private async recordInteraction(args: Record<string, unknown>): Promise<object> {
    const entityName = InputValidator.sanitizeString(args.entity_name as string, this.config.maxEntityNameLength);
    const interactionType = args.interaction_type as string;
    const context = args.context
      ? InputValidator.sanitizeString(args.context as string, this.config.maxContextLength)
      : undefined;
    const summary = args.summary
      ? InputValidator.sanitizeString(args.summary as string, this.config.maxSummaryLength)
      : undefined;
    const duration = args.duration as number;
    const quality =
      args.quality !== undefined ? Math.max(0, Math.min(1, args.quality as number)) : this.config.qualityDefault;
    const learningExtracted = args.learning_extracted
      ? InputValidator.sanitizeString(args.learning_extracted as string, this.config.maxLearningLength)
      : undefined;
    const myEmotionalState = args.my_emotional_state as Record<string, unknown>;
    const theirEmotionalState = args.their_emotional_state as Record<string, unknown>;
    const conversationStyle = args.conversation_style as Record<string, unknown>;
    const relationshipImpact = args.relationship_impact as Record<string, unknown>;
    const relatedMemories = args.related_memories as string[] | undefined;

    // Get the entity
    const entity = await this.getSocialEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }

    // Determine emotional tone from myEmotionalState or default to neutral
    let emotionalTone = 'neutral';
    if (myEmotionalState && myEmotionalState.primary) {
      emotionalTone = myEmotionalState.primary as string;
    }

    // Record the interaction
    const interaction = await this.db.execute(async prisma => {
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
          myEmotionalState: myEmotionalState ? JSON.stringify(myEmotionalState) : null,
          theirEmotionalState: theirEmotionalState ? JSON.stringify(theirEmotionalState) : null,
          conversationStyle: conversationStyle ? JSON.stringify(conversationStyle) : null,
        },
      });
    });

    // Update entity's last interaction time
    await this.db.execute(async prisma => {
      return prisma.socialEntity.update({
        where: { id: entity.id },
        data: { lastInteraction: new Date() },
      });
    });

    // Update relationship if impact is specified
    if (relationshipImpact) {
      await this.updateRelationshipFromInteraction(entity.id, relationshipImpact, quality);
    }

    // Record learning if extracted
    if (learningExtracted) {
      await this.recordSocialLearning({
        entity_name: entityName,
        learning_type: 'communication_pattern',
        insight: learningExtracted,
        confidence: quality,
        applicability: `Future ${interactionType} interactions with ${entityName}`,
      });
    }

    // Enhanced: Link related memories if provided
    let memoriesLinked = 0;
    if (relatedMemories && Array.isArray(relatedMemories)) {
      for (const memoryKey of relatedMemories) {
        try {
          const result = (await this.createMemorySocialLink({
            memory_key: memoryKey,
            entity_name: entityName,
            interaction_id: interaction.id,
            link_type: 'discussed_with',
            strength: 0.8,
            context: `Discussed during ${interactionType} interaction`,
          })) as any;

          if (result.success) {
            memoriesLinked++;
          } else {
            console.warn(`Failed to link memory ${memoryKey} to interaction:`, result.error);
          }
        } catch (error) {
          console.warn(`Failed to link memory ${memoryKey} to interaction:`, error);
        }
      }
    }

    return {
      success: true,
      interaction_id: interaction.id,
      entity: entityName,
      type: interactionType,
      quality,
      duration,
      learning_recorded: !!learningExtracted,
      relationship_updated: !!relationshipImpact,
      memories_linked: memoriesLinked,
      message: `Interaction with '${entity.displayName || entityName}' recorded successfully`,
    };
  }

  /**
   * Search for past interactions
   */
  private async searchInteractions(args: Record<string, unknown>): Promise<object> {
    const entityName = args.entity_name
      ? InputValidator.sanitizeString(args.entity_name as string, this.config.maxEntityNameLength)
      : undefined;
    const interactionType = args.interaction_type as string;
    const contextKeywords = (args.context_keywords as string[]) || [];
    const limit = Math.min((args.limit as number) || 10, 50);

    // Build where clause
    const whereClause: Record<string, unknown> = {};

    // Get entity once if entityName is provided
    if (entityName) {
      const entity = await this.getSocialEntityByName(entityName);
      if (!entity) {
        throw new Error(`Social entity '${entityName}' not found`);
      }
      whereClause.entityId = entity.id;
    }

    if (interactionType) {
      whereClause.interactionType = interactionType;
    }

    // Get interactions
    const interactions = await this.db.execute(async prisma => {
      return prisma.socialInteraction.findMany({
        where: whereClause,
        include: {
          entity: {
            select: {
              name: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    });

    // Filter by keywords if provided
    let filteredInteractions = interactions;
    if (contextKeywords.length > 0) {
      filteredInteractions = interactions.filter(interaction => {
        const searchText = `${interaction.context || ''} ${interaction.summary || ''}`.toLowerCase();
        return contextKeywords.some(keyword => searchText.includes(keyword.toLowerCase()));
      });
    }

    return {
      success: true,
      total_found: filteredInteractions.length,
      interactions: filteredInteractions.map(interaction => ({
        id: interaction.id,
        entity: {
          name: interaction.entity.name,
          displayName: interaction.entity.displayName,
        },
        type: interaction.interactionType,
        date: interaction.createdAt,
        context: interaction.context,
        summary: interaction.summary,
        quality: interaction.quality,
        duration: interaction.duration,
        learning: interaction.learningExtracted,
        emotional_tone: interaction.emotionalTone,
      })),
    };
  }

  /**
   * Record an emotional state or experience
   */
  private async recordEmotionalState(args: Record<string, unknown>): Promise<object> {
    const entityName = args.entity_name
      ? InputValidator.sanitizeString(args.entity_name as string, this.config.maxEntityNameLength)
      : undefined;
    const interactionId = args.interaction_id as number;
    const emotionalState = args.emotional_state as string;
    const intensity = Math.max(0, Math.min(1, (args.intensity as number) || this.config.emotionalIntensityDefault));
    const trigger = args.trigger
      ? InputValidator.sanitizeString(args.trigger as string, this.config.maxTriggerLength)
      : undefined;
    const response = args.response
      ? InputValidator.sanitizeString(args.response as string, this.config.maxResponseLength)
      : undefined;
    const learning = args.learning
      ? InputValidator.sanitizeString(args.learning as string, this.config.maxLearningLength)
      : undefined;
    const context = args.context
      ? InputValidator.sanitizeString(args.context as string, this.config.maxContextLength)
      : undefined;

    // Get entity if specified
    let entityId: number | undefined;
    if (entityName) {
      const entity = await this.getSocialEntityByName(entityName);
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

    // Record as social learning if learning is provided
    if (learning) {
      await this.recordSocialLearning({
        entity_name: entityName,
        learning_type: 'emotional_intelligence',
        insight: learning,
        confidence: intensity,
        applicability: context || 'General emotional awareness',
      });
    }

    return {
      success: true,
      emotional_context_id: emotionalContext.id,
      emotional_state: emotionalState,
      intensity,
      entity: entityName,
      learning_recorded: !!learning,
      message: `Emotional experience recorded: ${emotionalState} (intensity: ${intensity})`,
    };
  }

  /**
   * Record a social learning or insight
   */
  private async recordSocialLearning(args: Record<string, unknown>): Promise<object> {
    const entityName = args.entity_name
      ? InputValidator.sanitizeString(args.entity_name as string, this.config.maxEntityNameLength)
      : undefined;
    const learningType = args.learning_type as string;
    const insight = InputValidator.sanitizeString(args.insight as string, this.config.maxInsightLength);
    const confidence = Math.max(0, Math.min(1, (args.confidence as number) || this.config.defaultConfidence));
    const applicability = args.applicability
      ? InputValidator.sanitizeString(args.applicability as string, this.config.maxApplicabilityLength)
      : undefined;
    const examples = args.examples as Record<string, unknown>;

    // Get entity if specified
    let entityId: number | undefined;
    if (entityName) {
      const entity = await this.getSocialEntityByName(entityName);
      if (entity) {
        entityId = entity.id;
      }
      // Don't throw error if entity not found for general learnings
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
          examples: examples ? JSON.stringify(examples) : null,
        },
      });
    });

    return {
      success: true,
      learning_id: socialLearning.id,
      learning_type: learningType,
      confidence,
      entity: entityName,
      message: `Social learning recorded: ${learningType}`,
    };
  }

  /**
   * Prepare comprehensive social context for an interaction
   */
  private async prepareSocialContext(args: Record<string, unknown>): Promise<SocialContextResult> {
    const entityName = InputValidator.sanitizeString(args.entity_name as string, this.config.maxEntityNameLength);
    const interactionType = args.interaction_type as string;
    const context = args.context as string;
    const includeEmotionalPrep = Boolean(args.include_emotional_prep !== false);
    const includeConversationTips = Boolean(args.include_conversation_tips !== false);
    const includeRelationshipAnalysis = Boolean(args.include_relationship_analysis !== false);

    // Get comprehensive entity information
    const result = await this.getSocialEntity({
      name: entityName,
      include_interactions: true,
      include_relationship: includeRelationshipAnalysis,
      include_emotional_context: includeEmotionalPrep,
    });

    // Enhance recommendations based on context
    if (context || interactionType) {
      const enhancedRecommendations = await this.generateContextualRecommendations(
        entityName,
        interactionType,
        context,
        result,
        { includeEmotionalPrep, includeConversationTips, includeRelationshipAnalysis }
      );
      result.recommendations = enhancedRecommendations;
    }

    return result;
  }

  /**
   * Analyze social patterns and trends
   */
  private async analyzeSocialPatterns(args: Record<string, unknown>): Promise<SocialPatternAnalysis> {
    const analysisType = (args.analysis_type as string) || 'relationship_dynamics';
    const entityName = args.entity_name
      ? InputValidator.sanitizeString(args.entity_name as string, this.config.maxEntityNameLength)
      : undefined;
    const timePeriod = (args.time_period as string) || 'month';

    // Calculate date filter based on time period
    const now = new Date();
    let daysBack = 30; // default month
    switch (timePeriod) {
      case 'week':
        daysBack = 7;
        break;
      case 'month':
        daysBack = 30;
        break;
      case 'quarter':
        daysBack = 90;
        break;
      case 'year':
        daysBack = 365;
        break;
    }
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get data for analysis
    const interactions = await this.db.execute(async prisma => {
      const where = entityName
        ? {
            entity: { name: entityName },
            createdAt: { gte: startDate },
          }
        : { createdAt: { gte: startDate } };

      return prisma.socialInteraction.findMany({
        where,
        include: { entity: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
    });

    const relationships = await this.db.execute(async prisma => {
      const where = entityName ? { entity: { name: entityName } } : {};
      return prisma.socialRelationship.findMany({
        where,
        include: { entity: true },
        orderBy: { updatedAt: 'desc' },
      });
    });

    const learnings = await this.db.execute(async prisma => {
      // Inline where clause to avoid unused variable

      return prisma.socialLearning.findMany({
        where: entityName
          ? { entity: { name: entityName }, createdAt: { gte: startDate } }
          : { createdAt: { gte: startDate } },
        include: { entity: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    // Analyze patterns based on analysis type
    const patterns = [];
    const trends = [];
    const insights = [];
    const recommendations = [];
    const metrics: Record<string, number> = {};

    if (analysisType === 'relationship_dynamics') {
      // Analyze relationship strength trends
      const avgStrength = relationships.reduce((sum, rel) => sum + rel.strength, 0) / relationships.length;
      const avgTrust = relationships.reduce((sum, rel) => sum + rel.trust, 0) / relationships.length;
      const avgFamiliarity = relationships.reduce((sum, rel) => sum + rel.familiarity, 0) / relationships.length;

      metrics.averageRelationshipStrength = avgStrength || 0;
      metrics.averageTrust = avgTrust || 0;
      metrics.averageFamiliarity = avgFamiliarity || 0;
      metrics.totalRelationships = relationships.length;

      if (avgStrength > 0.7) {
        patterns.push({
          pattern: 'Strong relationship foundation',
          confidence: 0.9,
          examples: relationships
            .filter(r => r.strength > 0.7)
            .map(r => r.entity.name)
            .slice(0, 3),
          impact: 'Positive social network quality',
        });
      }

      if (avgFamiliarity < 0.4) {
        insights.push({
          insight: 'Many relationships are still developing - opportunity for deeper connections',
          category: 'relationship_growth',
          actionable: true,
        });
        recommendations.push('Focus on spending more quality time with existing connections');
      }
    }

    if (analysisType === 'interaction_patterns' || analysisType === 'relationship_dynamics') {
      // Analyze interaction frequency and quality
      const interactionsByType: Record<string, number> = {};
      const qualityByType: Record<string, number[]> = {};

      interactions.forEach(interaction => {
        interactionsByType[interaction.interactionType] = (interactionsByType[interaction.interactionType] || 0) + 1;

        if (interaction.quality !== null) {
          if (!qualityByType[interaction.interactionType]) {
            qualityByType[interaction.interactionType] = [];
          }
          qualityByType[interaction.interactionType].push(interaction.quality);
        }
      });

      metrics.totalInteractions = interactions.length;
      metrics.averageInteractionQuality =
        interactions.filter(i => i.quality !== null).reduce((sum, i) => sum + (i.quality || 0), 0) /
          interactions.filter(i => i.quality !== null).length || 0;

      // Find dominant interaction types
      const dominantType = Object.entries(interactionsByType).sort(([, a], [, b]) => b - a)[0];

      if (dominantType) {
        patterns.push({
          pattern: `Primary interaction mode: ${dominantType[0]}`,
          confidence: 0.8,
          examples: interactions
            .filter(i => i.interactionType === dominantType[0])
            .slice(0, 3)
            .map(i => `${i.entity.name} - ${i.summary || 'interaction'}`),
          impact: 'Defines social engagement style',
        });
      }

      // Analyze quality trends
      const recentQuality =
        interactions
          .slice(0, 10)
          .filter(i => i.quality !== null)
          .reduce((sum, i) => sum + (i.quality || 0), 0) / 10;

      const olderQuality =
        interactions
          .slice(10, 20)
          .filter(i => i.quality !== null)
          .reduce((sum, i) => sum + (i.quality || 0), 0) / 10;

      if (recentQuality > olderQuality + 0.1) {
        trends.push({
          trend: 'Interaction quality improving',
          direction: 'improving' as const,
          significance: (recentQuality - olderQuality) * 2,
        });
      } else if (recentQuality < olderQuality - 0.1) {
        trends.push({
          trend: 'Interaction quality declining',
          direction: 'declining' as const,
          significance: (olderQuality - recentQuality) * 2,
        });
        recommendations.push('Consider what factors might be affecting interaction quality');
      }
    }

    if (analysisType === 'learning_growth' || analysisType === 'relationship_dynamics') {
      // Analyze social learning accumulation
      const learningsByType: Record<string, number> = {};
      learnings.forEach(learning => {
        learningsByType[learning.learningType] = (learningsByType[learning.learningType] || 0) + 1;
      });

      metrics.totalSocialLearnings = learnings.length;
      metrics.averageLearningConfidence = learnings.reduce((sum, l) => sum + l.confidence, 0) / learnings.length || 0;

      if (learnings.length > 10) {
        patterns.push({
          pattern: 'Active social learning and reflection',
          confidence: 0.85,
          examples: Object.keys(learningsByType).slice(0, 3),
          impact: 'Continuous social intelligence development',
        });
      }

      // Learning velocity trend
      const recentWeek = learnings.filter(l => l.createdAt > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
      const previousWeek = learnings.filter(l => {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        return l.createdAt > twoWeeksAgo && l.createdAt <= weekAgo;
      }).length;

      if (recentWeek > previousWeek) {
        trends.push({
          trend: 'Accelerating social learning',
          direction: 'improving' as const,
          significance: 0.8,
        });
      }
    }

    // Generate general insights
    if (patterns.length === 0) {
      insights.push({
        insight: 'Limited recent social activity - consider increasing social engagement',
        category: 'engagement',
        actionable: true,
      });
      recommendations.push('Schedule regular social interactions to build social momentum');
    }

    if (metrics.totalInteractions > 0 && metrics.averageInteractionQuality > 0.8) {
      insights.push({
        insight: 'High-quality social interactions indicate strong social skills',
        category: 'strength',
        actionable: false,
      });
    }

    return {
      analysisType,
      timeperiod: timePeriod,
      entityFocus: entityName,
      patterns,
      trends,
      insights,
      recommendations,
      metrics,
    };
  }

  // Helper methods

  /**
   * Get social entity by name
   */
  private async getSocialEntityByName(name: string) {
    return this.db.execute(async prisma => {
      return prisma.socialEntity.findUnique({
        where: { name },
      });
    });
  }

  /**
   * Update relationship based on interaction
   */
  private async updateRelationshipFromInteraction(
    entityId: number,
    relationshipImpact: Record<string, unknown>,
    quality: number
  ) {
    const relationship = await this.db.execute(async prisma => {
      return prisma.socialRelationship.findFirst({
        where: { entityId },
      });
    });

    if (!relationship) return;

    const updateData: RelationshipUpdateData = { updatedAt: new Date() };
    let hasUpdates = false;

    // Simple relationship impact logic
    if (quality > 0.7) {
      // Positive interaction
      updateData.strength = Math.min(1, relationship.strength + 0.05);
      updateData.affinity = Math.min(1, relationship.affinity + 0.03);
      hasUpdates = true;
    } else if (quality < 0.3) {
      // Negative interaction
      updateData.strength = Math.max(0, relationship.strength - 0.03);
      updateData.affinity = Math.max(0, relationship.affinity - 0.05);
      hasUpdates = true;
    }

    // Familiarity always increases with interaction
    updateData.familiarity = Math.min(1, relationship.familiarity + 0.02);
    hasUpdates = true;

    if (hasUpdates) {
      await this.db.execute(async prisma => {
        return prisma.socialRelationship.update({
          where: { id: relationship.id },
          data: updateData,
        });
      });
    }
  }

  /**
   * Generate recommendations for social context
   */
  private generateRecommendations(
    entity: any,
    relationship: any,
    recentInteractions: any[],
    socialLearnings: any[],
    sharedMemories: SharedMemory[] = []
  ): SocialContextResult['recommendations'] {
    const communicationTips: string[] = [];
    const emotionalPrep: string[] = [];
    const relationshipGuidance: string[] = [];

    // Basic recommendations based on relationship
    if (relationship) {
      if (relationship.affinity > 0.7) {
        communicationTips.push('They seem to enjoy our interactions - maintain your natural style');
      } else if (relationship.affinity < 0.4) {
        communicationTips.push('Consider adjusting your communication approach');
      }

      if (relationship.familiarity < 0.3) {
        relationshipGuidance.push('Still getting to know each other - ask open questions');
      }

      if (relationship.trust > 0.8) {
        emotionalPrep.push('High trust level - feel free to be authentic and vulnerable');
      }
    }

    // Add learnings-based recommendations
    socialLearnings.forEach(learning => {
      if (learning.type === 'communication_pattern') {
        communicationTips.push(`Remember: ${learning.insight}`);
      } else if (learning.type === 'emotional_intelligence') {
        emotionalPrep.push(`Emotional insight: ${learning.insight}`);
      }
    });

    // Enhanced: Generate memory-based recommendations
    const memoryReminders = this.generateMemoryReminders(sharedMemories);
    const conversationStarters = this.generateConversationStarters(sharedMemories);

    return {
      communicationTips: communicationTips.slice(0, this.config.maxRecommendations),
      emotionalPrep: emotionalPrep.slice(0, this.config.maxRecommendations),
      relationshipGuidance: relationshipGuidance.slice(0, this.config.maxRecommendations),
      memoryReminders: memoryReminders.slice(0, this.config.maxRecommendations),
      conversationStarters: conversationStarters.slice(0, this.config.maxRecommendations),
    };
  }

  /**
   * Generate contextual recommendations for specific interactions
   */
  private async generateContextualRecommendations(
    entityName: string,
    interactionType: string,
    context: string,
    baseResult: SocialContextResult,
    _options: { includeEmotionalPrep: boolean; includeConversationTips: boolean; includeRelationshipAnalysis: boolean }
  ): Promise<SocialContextResult['recommendations']> {
    // This would include more sophisticated logic based on the interaction type and context
    return baseResult.recommendations;
  }

  // NEW: Memory-Social Integration Methods

  /**
   * Get shared memories for a specific social entity
   */
  private async getSharedMemoriesForEntity(entityId: number): Promise<{
    memories: SharedMemory[];
    insights: Array<{
      pattern: string;
      examples: string[];
      strength: number;
    }>;
  }> {
    try {
      // Get all memory links for this entity
      const links = await this.db.execute(async prisma => {
        return prisma.memorySocialLink.findMany({
          where: { socialEntityId: entityId },
          include: {
            memory: true,
            interaction: true,
          },
          orderBy: [{ strength: 'desc' }, { createdAt: 'desc' }],
          take: 20, // Limit for performance
        });
      });

      // Format memories with rich context
      const memories = links.map(link => ({
        key: link.memory.key,
        content: link.memory.content,
        tags: JSON.parse(link.memory.tags || '[]'),
        importance: link.memory.importance,
        linkType: link.relationshipType,
        linkStrength: link.strength,
        linkContext: link.context ?? undefined,
        createdAt: link.memory.storedAt,
        interactionContext: link.interaction
          ? {
              id: link.interaction.id,
              type: link.interaction.interactionType,
              date: link.interaction.createdAt,
              summary: link.interaction.summary ?? undefined,
            }
          : undefined,
      }));

      // Generate insights about memory patterns
      const insights = this.generateMemoryInsights(links);

      return { memories, insights };
    } catch (error) {
      console.warn('Failed to get shared memories:', error);
      return { memories: [], insights: [] };
    }
  }

  /**
   * Generate insights about memory patterns with this entity
   */
  private generateMemoryInsights(links: any[]): Array<{
    pattern: string;
    examples: string[];
    strength: number;
  }> {
    if (links.length === 0) return [];

    const insights: Array<{
      pattern: string;
      examples: string[];
      strength: number;
    }> = [];

    // Analyze link type distribution
    const linkTypeDistribution: Record<string, number> = {};
    links.forEach(link => {
      linkTypeDistribution[link.relationshipType] = (linkTypeDistribution[link.relationshipType] || 0) + 1;
    });

    // Find dominant patterns
    const dominantTypes = Object.entries(linkTypeDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (dominantTypes.length > 0) {
      insights.push({
        pattern: `Primary connection type: ${dominantTypes[0][0]}`,
        examples: links
          .filter(l => l.relationshipType === dominantTypes[0][0])
          .slice(0, 3)
          .map(l => l.memory.key),
        strength: dominantTypes[0][1] / links.length,
      });
    }

    // Analyze memory importance patterns
    const highImportanceCount = links.filter(
      l => l.memory.importance === 'high' || l.memory.importance === 'critical'
    ).length;

    if (highImportanceCount > 0) {
      insights.push({
        pattern: `${Math.round((highImportanceCount / links.length) * 100)}% high-importance memories`,
        examples: links
          .filter(l => l.memory.importance === 'high' || l.memory.importance === 'critical')
          .slice(0, 2)
          .map(l => l.memory.key),
        strength: highImportanceCount / links.length,
      });
    }

    // Analyze creation vs collaboration patterns
    const creativeLinks = links.filter(l =>
      ['co_created', 'creative_inspiration', 'collaboration_outcome'].includes(l.relationshipType)
    );

    if (creativeLinks.length > 0) {
      insights.push({
        pattern: 'Strong creative collaboration history',
        examples: creativeLinks.slice(0, 3).map(l => l.memory.key),
        strength: creativeLinks.length / links.length,
      });
    }

    return insights.slice(0, 5); // Limit insights
  }

  /**
   * Enhanced: Generate memory reminders from shared memories array
   */
  private generateMemoryReminders(sharedMemories: SharedMemory[]): string[] {
    if (!sharedMemories || sharedMemories.length === 0) return [];

    const reminders: string[] = [];

    // Group by link type for meaningful reminders
    const linkGroups: Record<string, SharedMemory[]> = {};
    sharedMemories.forEach(memory => {
      if (!linkGroups[memory.linkType]) {
        linkGroups[memory.linkType] = [];
      }
      linkGroups[memory.linkType].push(memory);
    });

    // Generate contextual reminders
    Object.entries(linkGroups).forEach(([linkType, memories]) => {
      const recent = memories[0]; // Most recent

      switch (linkType) {
        case 'co_created':
          reminders.push(`Remember: You collaborated on ${recent.linkContext || recent.key}`);
          break;
        case 'learned_from':
          reminders.push(`They taught you: ${recent.linkContext || 'valuable insights'}`);
          break;
        case 'shared_experience':
          reminders.push(`Shared moment: ${recent.linkContext || recent.key}`);
          break;
        case 'emotional_support':
          reminders.push(`They supported you with: ${recent.linkContext || 'understanding'}`);
          break;
        case 'creative_inspiration':
          reminders.push(`They inspired: ${recent.linkContext || recent.key}`);
          break;
        case 'discovered_together':
          reminders.push(`You discovered together: ${recent.linkContext || 'important insights'}`);
          break;
        default:
          reminders.push(`Discussed: ${recent.linkContext || recent.key}`);
      }
    });

    return reminders.slice(0, 5);
  }

  /**
   * Enhanced: Generate conversation starters from shared memories array
   */
  private generateConversationStarters(sharedMemories: SharedMemory[]): string[] {
    if (!sharedMemories || sharedMemories.length === 0) return [];

    const starters: string[] = [];

    // Group by link type
    const linkGroups: Record<string, SharedMemory[]> = {};
    sharedMemories.forEach(memory => {
      if (!linkGroups[memory.linkType]) {
        linkGroups[memory.linkType] = [];
      }
      linkGroups[memory.linkType].push(memory);
    });

    // Generate starters based on memory types
    if (linkGroups.co_created && linkGroups.co_created.length > 0) {
      starters.push('I was thinking about what we built together...');
    }

    if (linkGroups.learned_from && linkGroups.learned_from.length > 0) {
      starters.push("I've been applying what you taught me about...");
    }

    if (linkGroups.creative_inspiration && linkGroups.creative_inspiration.length > 0) {
      starters.push('Your idea about [topic] sparked something new for me...');
    }

    if (linkGroups.emotional_support && linkGroups.emotional_support.length > 0) {
      starters.push('I really appreciated how you helped me through...');
    }

    if (linkGroups.discovered_together && linkGroups.discovered_together.length > 0) {
      starters.push('Remember when we figured out that insight about...');
    }

    if (linkGroups.shared_experience && linkGroups.shared_experience.length > 0) {
      starters.push('That experience we had with [topic] made me think...');
    }

    // Fallback to recent memories
    if (starters.length === 0 && sharedMemories.length > 0) {
      starters.push('I was reflecting on our conversation about...');
    }

    return starters.slice(0, 5);
  }

  /**
   * Create a connection between a memory and a social entity/interaction
   */
  private async createMemorySocialLink(args: Record<string, unknown>): Promise<object> {
    try {
      const memoryKey = args.memory_key as string;
      const entityName = args.entity_name as string;
      const linkType = args.link_type as string;
      const interactionId = args.interaction_id as number | undefined;
      const strength = (args.strength as number) || 0.8;
      const context = args.context as string | undefined;

      // Validate required fields
      if (!memoryKey || !entityName || !linkType) {
        throw new Error('memory_key, entity_name, and link_type are required');
      }

      // Get the memory
      const memory = await this.db.execute(async prisma => {
        return prisma.memory.findUnique({
          where: { key: memoryKey },
        });
      });

      if (!memory) {
        throw new Error(`Memory with key '${memoryKey}' not found`);
      }

      // Get the social entity
      const entity = await this.getSocialEntityByName(entityName);
      if (!entity) {
        throw new Error(`Social entity '${entityName}' not found`);
      }

      // Validate interaction if provided
      let interaction = null;
      if (interactionId) {
        interaction = await this.db.execute(async prisma => {
          return prisma.socialInteraction.findUnique({
            where: { id: interactionId },
          });
        });
        if (!interaction || interaction.entityId !== entity.id) {
          throw new Error(`Interaction ${interactionId} not found or does not belong to entity ${entityName}`);
        }
      }

      // Create the memory-social link
      const link = await this.db.execute(async prisma => {
        return prisma.memorySocialLink.create({
          data: {
            memoryId: memory.id,
            socialEntityId: entity.id,
            interactionId: interactionId || null,
            relationshipType: linkType as any,
            strength: strength,
            context: context || null,
          },
        });
      });

      return {
        success: true,
        link: {
          id: link.id,
          memoryKey: memoryKey,
          entityName: entityName,
          linkType: linkType,
          strength: strength,
          interactionId: interactionId,
          context: context,
        },
        message: `Memory '${memoryKey}' successfully linked to '${entityName}' as '${linkType}'`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to create memory-social link',
      };
    }
  }

  /**
   * Search for memories connected to social entities or interactions
   */
  private async searchMemorySocialLinks(args: Record<string, unknown>): Promise<object> {
    try {
      const entityName = args.entity_name as string | undefined;
      const linkTypes = args.link_types as string[] | undefined;
      const memoryKeywords = args.memory_keywords as string[] | undefined;
      const interactionType = args.interaction_type as string | undefined;
      const minStrength = (args.min_strength as number) || 0.5;
      const limit = (args.limit as number) || 10;

      // Build the search query
      const whereClause: any = {};

      // Filter by entity
      if (entityName) {
        const entity = await this.getSocialEntityByName(entityName);
        if (!entity) {
          throw new Error(`Social entity '${entityName}' not found`);
        }
        whereClause.socialEntityId = entity.id;
      }

      // Filter by link types
      if (linkTypes && linkTypes.length > 0) {
        whereClause.relationshipType = { in: linkTypes };
      }

      // Filter by minimum strength
      whereClause.strength = { gte: minStrength };

      // Get the links with full context
      const links = await this.db.execute(async prisma => {
        return prisma.memorySocialLink.findMany({
          where: whereClause,
          include: {
            memory: true,
            socialEntity: true,
            interaction: true,
          },
          orderBy: [{ strength: 'desc' }, { createdAt: 'desc' }],
          take: limit,
        });
      });

      // Filter by memory keywords if provided
      let filteredLinks = links;
      if (memoryKeywords && memoryKeywords.length > 0) {
        filteredLinks = links.filter(link => {
          const content = JSON.stringify(link.memory.content).toLowerCase();
          const tags = JSON.parse(link.memory.tags || '[]')
            .join(' ')
            .toLowerCase();
          const searchText = `${content} ${tags}`;

          return memoryKeywords.some(keyword => searchText.includes(keyword.toLowerCase()));
        });
      }

      // Filter by interaction type if provided
      if (interactionType) {
        filteredLinks = filteredLinks.filter(
          link => link.interaction && link.interaction.interactionType === interactionType
        );
      }

      // Format results
      const results = filteredLinks.map(link => ({
        memoryKey: link.memory.key,
        memoryContent: link.memory.content,
        memoryTags: JSON.parse(link.memory.tags || '[]'),
        memoryImportance: link.memory.importance,
        memoryCreatedAt: link.memory.storedAt,
        linkType: link.relationshipType,
        linkStrength: link.strength,
        linkContext: link.context,
        linkCreatedAt: link.createdAt,
        entityName: link.socialEntity?.name,
        entityDisplayName: link.socialEntity?.displayName,
        interactionContext: link.interaction
          ? {
              id: link.interaction.id,
              type: link.interaction.interactionType,
              date: link.interaction.createdAt,
              summary: link.interaction.summary,
              quality: link.interaction.quality,
            }
          : null,
      }));

      return {
        success: true,
        count: results.length,
        results: results,
        query: {
          entityName,
          linkTypes,
          memoryKeywords,
          interactionType,
          minStrength,
          limit,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to search memory-social links',
      };
    }
  }

  /**
   * Get rich context about shared memories and experiences with someone
   */
  private async getSocialMemoryContext(args: Record<string, unknown>): Promise<object> {
    try {
      const entityName = args.entity_name as string;
      const includeCreation = args.include_creation_memories !== false;
      const includeLearning = args.include_learning_memories !== false;
      const includeEmotional = args.include_emotional_memories !== false;
      const timePeriod = (args.time_period as string) || 'all_time';

      if (!entityName) {
        throw new Error('entity_name is required');
      }

      // Get the entity
      const entity = await this.getSocialEntityByName(entityName);
      if (!entity) {
        throw new Error(`Social entity '${entityName}' not found`);
      }

      // Calculate time filter
      let dateFilter: any = {};
      if (timePeriod !== 'all_time') {
        const now = new Date();
        let daysBack = 0;
        switch (timePeriod) {
          case 'week':
            daysBack = 7;
            break;
          case 'month':
            daysBack = 30;
            break;
          case 'quarter':
            daysBack = 90;
            break;
          case 'year':
            daysBack = 365;
            break;
        }
        if (daysBack > 0) {
          const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
          dateFilter = { createdAt: { gte: cutoffDate } };
        }
      }

      // Get all memory links for this entity
      const links = await this.db.execute(async prisma => {
        return prisma.memorySocialLink.findMany({
          where: {
            socialEntityId: entity.id,
            ...dateFilter,
          },
          include: {
            memory: true,
            interaction: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      });

      // Categorize memories by type
      const categorizedMemories: any = {
        creation: [],
        learning: [],
        emotional: [],
        collaboration: [],
        inspiration: [],
        support: [],
        other: [],
      };

      for (const link of links) {
        const memoryData = {
          key: link.memory.key,
          content: link.memory.content,
          tags: JSON.parse(link.memory.tags || '[]'),
          importance: link.memory.importance,
          linkType: link.relationshipType,
          linkStrength: link.strength,
          linkContext: link.context,
          createdAt: link.memory.storedAt,
          interactionContext: link.interaction
            ? {
                id: link.interaction.id,
                type: link.interaction.interactionType,
                date: link.interaction.createdAt,
                summary: link.interaction.summary,
              }
            : null,
        };

        // Categorize based on link type
        switch (link.relationshipType) {
          case 'co_created':
          case 'collaboration_outcome':
            if (includeCreation) categorizedMemories.creation.push(memoryData);
            break;
          case 'learned_from':
          case 'taught_to':
          case 'mentoring_moment':
          case 'discovered_together':
            if (includeLearning) categorizedMemories.learning.push(memoryData);
            break;
          case 'emotional_support':
          case 'celebration_shared':
          case 'conflict_resolution':
            if (includeEmotional) categorizedMemories.emotional.push(memoryData);
            break;
          case 'inspired_by':
          case 'creative_inspiration':
            categorizedMemories.inspiration.push(memoryData);
            break;
          case 'shared_experience':
          case 'discussed_with':
            categorizedMemories.collaboration.push(memoryData);
            break;
          default:
            categorizedMemories.other.push(memoryData);
        }
      }

      // Generate insights about memory patterns
      const totalMemories = links.length;
      const linkTypeDistribution: Record<string, number> = {};
      links.forEach(link => {
        linkTypeDistribution[link.relationshipType] = (linkTypeDistribution[link.relationshipType] || 0) + 1;
      });

      // Find dominant patterns
      const dominantTypes = Object.entries(linkTypeDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([type, count]) => ({
          pattern: type,
          frequency: count,
          percentage: Math.round((count / totalMemories) * 100),
        }));

      // Analyze memory evolution over time
      const monthlyCreation: Record<string, number> = {};
      links.forEach(link => {
        const month = link.createdAt.toISOString().substring(0, 7);
        monthlyCreation[month] = (monthlyCreation[month] || 0) + 1;
      });

      return {
        success: true,
        entity: {
          name: entity.name,
          displayName: entity.displayName,
          type: entity.entityType,
        },
        summary: {
          totalSharedMemories: totalMemories,
          timePeriod: timePeriod,
          dominantPatterns: dominantTypes,
          memoryTypes: {
            creation: categorizedMemories.creation.length,
            learning: categorizedMemories.learning.length,
            emotional: categorizedMemories.emotional.length,
            collaboration: categorizedMemories.collaboration.length,
            inspiration: categorizedMemories.inspiration.length,
            other: categorizedMemories.other.length,
          },
        },
        memories: categorizedMemories,
        insights: {
          linkTypeDistribution,
          monthlyCreation,
          recommendedTopics: dominantTypes.slice(0, 3).map(p => p.pattern),
          relationshipStrength: links.reduce((sum, link) => sum + link.strength, 0) / Math.max(links.length, 1),
        },
        recommendations: {
          conversationStarters: this.generateConversationStarters([
            ...categorizedMemories.creation,
            ...categorizedMemories.learning,
            ...categorizedMemories.emotional,
            ...categorizedMemories.collaboration,
            ...categorizedMemories.inspiration,
            ...categorizedMemories.support,
            ...categorizedMemories.other,
          ]),
          memoryReminders: this.generateMemoryReminders([
            ...categorizedMemories.creation,
            ...categorizedMemories.learning,
            ...categorizedMemories.emotional,
            ...categorizedMemories.collaboration,
            ...categorizedMemories.inspiration,
            ...categorizedMemories.support,
            ...categorizedMemories.other,
          ]),
          deepeningOpportunities: this.generateDeepeningOpportunities(linkTypeDistribution),
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to get social memory context',
      };
    }
  }

  /**
   * Helper: Generate opportunities to deepen the relationship
   */
  private generateDeepeningOpportunities(linkDistribution: Record<string, number>): string[] {
    const opportunities: string[] = [];

    // Suggest based on what's missing or underrepresented
    if (!linkDistribution.co_created || linkDistribution.co_created < 2) {
      opportunities.push('Consider collaborating on a project together');
    }
    if (!linkDistribution.emotional_support || linkDistribution.emotional_support < 1) {
      opportunities.push('Be more open about emotional support exchanges');
    }
    if (!linkDistribution.learned_from || linkDistribution.learned_from < 2) {
      opportunities.push('Ask about their expertise or experiences');
    }

    return opportunities.slice(0, 3);
  }
}
