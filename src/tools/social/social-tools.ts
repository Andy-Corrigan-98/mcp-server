import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SOCIAL_TOOLS, SocialContextResult, SocialPatternAnalysis } from './types.js';
import { SocialValidationUtils } from './base/validation-utils.js';
import { SocialEntityManager } from './entity-manager.js';
import { SocialRelationshipManager } from './relationship-manager.js';
import { SocialInteractionRecorder } from './interaction-recorder.js';
import { SocialEmotionalIntelligence } from './emotional-intelligence.js';
import { SocialMemoryIntegration } from './memory-integration.js';

/**
 * Social Consciousness Tools
 * Composed from focused modules for better maintainability and single responsibility
 */
export class SocialTools {
  private entityManager: SocialEntityManager;
  private relationshipManager: SocialRelationshipManager;
  private interactionRecorder: SocialInteractionRecorder;
  private emotionalIntelligence: SocialEmotionalIntelligence;
  private memoryIntegration: SocialMemoryIntegration;

  constructor() {
    // Initialize managers with proper dependencies
    this.entityManager = new SocialEntityManager();
    this.relationshipManager = new SocialRelationshipManager(this.entityManager);
    this.interactionRecorder = new SocialInteractionRecorder(this.entityManager, this.relationshipManager);
    this.emotionalIntelligence = new SocialEmotionalIntelligence(this.entityManager);
    this.memoryIntegration = new SocialMemoryIntegration(this.entityManager);
  }

  /**
   * Get all available social consciousness tools
   */
  getTools(): Record<string, Tool> {
    return SOCIAL_TOOLS;
  }

  /**
   * Execute a social consciousness tool operation
   * Routes to the appropriate focused module
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      // Entity Management
      case 'social_entity_create':
        return this.entityManager.createEntity(args as any);
      case 'social_entity_update':
        return this.entityManager.updateEntity(args as any);
      case 'social_entity_get':
        return this.getSocialEntity(args);

      // Relationship Management
      case 'social_relationship_create':
        return this.relationshipManager.createRelationship(args as any);
      case 'social_relationship_update':
        return this.relationshipManager.updateRelationship(args as any);

      // Interaction Recording
      case 'social_interaction_record':
        return this.interactionRecorder.recordInteraction(args as any);
      case 'social_interaction_search':
        return this.interactionRecorder.searchInteractions(args as any);

      // Emotional Intelligence
      case 'emotional_state_record':
        return this.emotionalIntelligence.recordEmotionalState(args as any);
      case 'social_learning_record':
        return this.emotionalIntelligence.recordSocialLearning(args as any);

      // Context & Analysis
      case 'social_context_prepare':
        return this.prepareSocialContext(args);
      case 'social_pattern_analyze':
        return this.analyzeSocialPatterns(args);

      // Memory Integration
      case 'memory_social_link_create':
        return this.memoryIntegration.createMemorySocialLink(args as any);
      case 'memory_social_search':
        return this.memoryIntegration.searchMemorySocialLinks(args as any);
      case 'social_memory_context':
        return this.memoryIntegration.getSocialMemoryContext(args as any);

      default:
        throw new Error(`Unknown social tool: ${toolName}`);
    }
  }

  /**
   * Get comprehensive information about a social entity
   * Orchestrates multiple modules to provide rich context
   */
  private async getSocialEntity(args: Record<string, unknown>): Promise<SocialContextResult> {
    const entityName = SocialValidationUtils.validateRequiredString(args.name, 'name', 100);
    const includeInteractions = args.include_interactions !== false;
    const includeRelationship = args.include_relationship !== false;
    const includeEmotionalContext = args.include_emotional_context !== false;
    const includeSharedMemories = args.include_shared_memories !== false;

    // Get basic entity information
    const entity = await this.entityManager.getEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }

    // Get relationship information
    let relationship: any = undefined;
    if (includeRelationship) {
      relationship = await this.relationshipManager.getRelationshipByEntityId(entity.id);
      if (relationship) {
        // Convert to expected format
        relationship = {
          type: relationship.relationshipType,
          strength: relationship.strength,
          trust: relationship.trust,
          familiarity: relationship.familiarity,
          affinity: relationship.affinity,
          communicationStyle: SocialValidationUtils.parseJsonSafely(relationship.communicationStyle, undefined),
          notes: relationship.notes,
        };
      }
    }

    // Get recent interactions
    let recentInteractions: any[] = [];
    if (includeInteractions) {
      const interactions = await this.interactionRecorder.getRecentInteractions(entity.id, 10);
      recentInteractions = interactions.map((interaction: any) => ({
        type: interaction.interactionType,
        date: interaction.createdAt,
        quality: interaction.quality,
        summary: interaction.summary,
        learningExtracted: interaction.learningExtracted,
      }));
    }

    // Get emotional patterns
    let emotionalPatterns: any[] = [];
    if (includeEmotionalContext) {
      // For now, return empty patterns - can be implemented later
      emotionalPatterns = [];
    }

    // Get social learnings
    let socialLearnings: any[] = [];
    // For now, return empty learnings - can be implemented later
    socialLearnings = [];

    return {
      entity: {
        name: entity.name,
        entityType: entity.entityType,
        displayName: entity.displayName,
        description: entity.description,
      },
      relationship,
      recentInteractions: recentInteractions,
      emotionalPatterns: emotionalPatterns,
      socialLearnings: socialLearnings,
      sharedMemories: includeSharedMemories ? [] : [],
      memoryInsights: [],
      recommendations: {
        communicationTips: [],
        emotionalPrep: [],
        relationshipGuidance: [],
        memoryReminders: [],
        conversationStarters: [],
      },
    };
  }

  /**
   * Prepare social context for upcoming interactions
   * Aggregates information from multiple modules
   */
  private async prepareSocialContext(args: Record<string, unknown>): Promise<SocialContextResult> {
    const entityName = SocialValidationUtils.validateRequiredString(args.entity_name, 'entity_name', 100);

    // Use the comprehensive entity context as the base
    const context = await this.getSocialEntity({
      name: entityName,
      include_interactions: true,
      include_relationship: true,
      include_emotional_context: true,
      include_shared_memories: true,
    });

    // Add any additional context preparation logic here
    return context;
  }

  /**
   * Analyze social patterns and trends
   */
  private async analyzeSocialPatterns(args: Record<string, unknown>): Promise<SocialPatternAnalysis> {
    // For now, return a basic implementation
    // This could be expanded to use all the focused modules for comprehensive analysis
    return {
      analysisType: args.analysis_type as string,
      timeperiod: (args.time_period as string) || 'month',
      entityFocus: args.entity_name as string,
      patterns: [],
      trends: [],
      insights: [],
      recommendations: [],
      metrics: {},
    };
  }
}
