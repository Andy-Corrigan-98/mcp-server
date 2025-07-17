import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SOCIAL_TOOLS, SocialContextResult, SocialPatternAnalysis } from './types.js';
import { SocialEntityManager } from './entity-manager.js';
import { SocialRelationshipManager } from './relationship-manager.js';
import { SocialInteractionRecorder } from './interaction-recorder.js';
import { SocialEmotionalIntelligence } from './emotional-intelligence.js';
import { SocialMemoryIntegration } from './memory-integration.js';

/**
 * Refactored Social Consciousness Tools
 * Composed from focused modules for better maintainability and single responsibility
 */
export class SocialToolsRefactored {
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
    const entityName = args.name as string;
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
          communicationStyle: relationship.communicationStyle ? JSON.parse(relationship.communicationStyle) : undefined,
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
      emotionalPatterns = await this.emotionalIntelligence.getEmotionalPatterns(entity.id, 20);
    }

    // Get social learnings
    const socialLearningsData = await this.emotionalIntelligence.getSocialLearnings(entity.id, 15);
    const socialLearnings = socialLearningsData.map((learning: any) => ({
      type: learning.learningType,
      insight: learning.insight,
      confidence: learning.confidence,
      applicability: learning.applicability,
    }));

    // Get shared memories
    let sharedMemories: any[] = [];
    let memoryInsights: any[] = [];
    if (includeSharedMemories) {
      const memoryData = await this.memoryIntegration.getSharedMemoriesForEntity(entity.id);
      sharedMemories = memoryData.memories;
      memoryInsights = memoryData.insights;
    }

    // Generate recommendations
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
        displayName: entity.displayName,
        entityType: entity.entityType,
        description: entity.description,
        lastInteraction: entity.lastInteraction,
      },
      relationship,
      recentInteractions,
      emotionalPatterns,
      socialLearnings,
      sharedMemories,
      memoryInsights,
      recommendations,
    };
  }

  /**
   * Prepare comprehensive social context for an interaction
   */
  private async prepareSocialContext(args: Record<string, unknown>): Promise<SocialContextResult> {
    const entityName = args.entity_name as string;
    const interactionType = args.interaction_type as string;
    const context = args.context as string;

    // Get comprehensive entity information
    const result = await this.getSocialEntity({
      name: entityName,
      include_interactions: true,
      include_relationship: true,
      include_emotional_context: true,
      include_shared_memories: true,
    });

    // Enhance recommendations based on context
    if (context || interactionType) {
      const enhancedRecommendations = this.generateContextualRecommendations(
        entityName,
        interactionType,
        context,
        result
      );
      result.recommendations = enhancedRecommendations;
    }

    return result;
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

  /**
   * Generate recommendations based on entity and relationship data
   */
  private generateRecommendations(
    entity: any,
    relationship: any,
    recentInteractions: any[],
    socialLearnings: any[],
    sharedMemories: any[]
  ) {
    const recommendations = {
      communicationTips: [] as string[],
      emotionalPrep: [] as string[],
      relationshipGuidance: [] as string[],
      memoryReminders: [] as string[],
      conversationStarters: [] as string[],
    };

    // Basic recommendation logic
    if (relationship) {
      if (relationship.familiarity < 0.3) {
        recommendations.communicationTips.push('Take time to build familiarity through lighter conversations');
      }
      if (relationship.trust < 0.5) {
        recommendations.relationshipGuidance.push('Focus on building trust through consistent, reliable interactions');
      }
    }

    // Memory-based recommendations
    if (sharedMemories.length > 0) {
      const recentMemories = sharedMemories.slice(0, 3);
      recommendations.memoryReminders = recentMemories.map(m => `Remember: ${m.key} (${m.linkType})`);
    }

    // Interaction history recommendations
    if (recentInteractions.length > 0) {
      const avgQuality = recentInteractions.reduce((sum, i) => sum + (i.quality || 0.5), 0) / recentInteractions.length;
      if (avgQuality > 0.7) {
        recommendations.emotionalPrep.push('Your recent interactions have been very positive - maintain this energy');
      }
    }

    return recommendations;
  }

  /**
   * Generate contextual recommendations for specific interaction types
   */
  private generateContextualRecommendations(
    entityName: string,
    interactionType: string,
    context: string,
    entityData: SocialContextResult
  ) {
    const recommendations = { ...entityData.recommendations };

    // Add context-specific recommendations based on interaction type
    switch (interactionType) {
      case 'deep_discussion':
        recommendations.communicationTips.push(
          'Prepare thoughtful questions and be ready to share your own perspectives'
        );
        break;
      case 'collaboration':
        recommendations.communicationTips.push('Focus on clear goal-setting and open communication about expectations');
        break;
      case 'conflict_resolution':
        recommendations.emotionalPrep.push('Approach with empathy and focus on understanding their perspective first');
        break;
      case 'creative_session':
        recommendations.emotionalPrep.push('Embrace playfulness and be open to unexpected ideas');
        break;
    }

    return recommendations;
  }
}
