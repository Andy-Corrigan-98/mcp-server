import { ConfigurableBase } from './base/configurable-base.js';
import { SocialValidationUtils } from './base/validation-utils.js';
import { SocialResponseBuilder } from './base/response-builder.js';
import { SocialEntityManager } from './entity-manager.js';
import { SharedMemory } from './types.js';

/**
 * Memory Integration Manager for Social Consciousness System
 * Handles linking memories with social entities and interactions
 */
export class SocialMemoryIntegration extends ConfigurableBase {
  private entityManager: SocialEntityManager;

  // Configuration for memory integration
  protected config = {
    maxContextLength: 500,
    defaultLinkStrength: 0.8,
  };

  constructor(entityManager: SocialEntityManager) {
    super();
    this.entityManager = entityManager;
  }

  /**
   * Create a link between a memory and social entity/interaction
   */
  async createMemorySocialLink(args: {
    memory_key: string;
    entity_name: string;
    interaction_id?: number;
    link_type: string;
    strength?: number;
    context?: string;
  }): Promise<object> {
    const memoryKey = SocialValidationUtils.validateRequiredString(args.memory_key, 'memory_key', 255);
    const entityName = SocialValidationUtils.validateRequiredString(args.entity_name, 'entity_name', 100);
    const interactionId = args.interaction_id;
    const linkType = args.link_type;
    const strength = SocialValidationUtils.validateProbability(args.strength, this.config.defaultLinkStrength);
    const context = args.context
      ? SocialValidationUtils.sanitizeString(args.context, this.config.maxContextLength)
      : undefined;

    // Get the entity
    const entity = await this.entityManager.getEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }

    // Verify the memory exists (basic check)
    const existingMemory = await this.db.execute(async prisma => {
      return prisma.memory.findUnique({
        where: { key: memoryKey },
      });
    });

    if (!existingMemory) {
      throw new Error(`Memory with key '${memoryKey}' not found`);
    }

    // Check if interaction exists if specified
    if (interactionId) {
      const interaction = await this.db.execute(async prisma => {
        return prisma.socialInteraction.findUnique({
          where: { id: interactionId },
        });
      });
      if (!interaction) {
        throw new Error(`Social interaction with ID ${interactionId} not found`);
      }
    }

    // Create the memory-social link
    const memorySocialLink = await this.db.execute(async prisma => {
      return prisma.memorySocialLink.create({
        data: {
          memoryId: existingMemory.id,
          socialEntityId: entity.id,
          interactionId: interactionId,
          relationshipType: linkType as any,
          strength,
          context,
        },
      });
    });

    return SocialResponseBuilder.memoryLinked(memoryKey, entityName, linkType, {
      id: memorySocialLink.id,
      memory_key: memoryKey,
      entity_name: entityName,
      interaction_id: interactionId,
      link_type: linkType,
      strength,
      context,
      created_at: memorySocialLink.createdAt,
    });
  }

  /**
   * Search for memories connected to social entities
   */
  async searchMemorySocialLinks(args: {
    entity_name?: string;
    interaction_type?: string;
    link_types?: string[];
    memory_keywords?: string[];
    min_strength?: number;
    limit?: number;
  }): Promise<object> {
    const entityName = args.entity_name;
    const interactionType = args.interaction_type;
    const linkTypes = args.link_types || [];
    const memoryKeywords = args.memory_keywords || [];
    const minStrength = SocialValidationUtils.validateProbability(args.min_strength, 0.5);
    const limit = Math.min(args.limit || 10, 50); // Cap at 50

    // Build where clause
    const whereClause: any = {
      strength: { gte: minStrength },
    };

    if (entityName) {
      const entity = await this.entityManager.getEntityByName(entityName);
      if (!entity) {
        throw new Error(`Social entity '${entityName}' not found`);
      }
      whereClause.socialEntityId = entity.id;
    }

    if (linkTypes.length > 0) {
      whereClause.linkType = { in: linkTypes };
    }

    // Get memory social links
    const links = await this.db.execute(async prisma => {
      return prisma.memorySocialLink.findMany({
        where: whereClause,
        include: {
          socialEntity: true,
          interaction: true,
          memory: true,
        },
        orderBy: [{ strength: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      });
    });

    // Filter by interaction type if specified
    let filteredLinks = links;
    if (interactionType) {
      filteredLinks = links.filter((link: any) => link.interaction?.interactionType === interactionType);
    }

    // Filter by memory keywords if specified
    if (memoryKeywords.length > 0) {
      filteredLinks = filteredLinks.filter((link: any) => {
        const memoryContent = JSON.stringify(link.memory?.content || {}).toLowerCase();
        return memoryKeywords.some(
          keyword =>
            memoryContent.includes(keyword.toLowerCase()) ||
            link.memory?.key.toLowerCase().includes(keyword.toLowerCase())
        );
      });
    }

    // Format results
    const formattedLinks = filteredLinks.map((link: any) => ({
      id: link.id,
      memory: {
        key: link.memory?.key,
        content: link.memory?.content,
        tags: link.memory?.tags,
        importance: link.memory?.importance,
        stored_at: link.memory?.createdAt,
      },
      entity: {
        name: link.socialEntity.name,
        display_name: link.socialEntity.displayName,
        type: link.socialEntity.entityType,
      },
      interaction: link.interaction
        ? {
            id: link.interaction.id,
            type: link.interaction.interactionType,
            created_at: link.interaction.createdAt,
          }
        : undefined,
      link_type: link.relationshipType,
      strength: link.strength,
      context: link.context,
      created_at: link.createdAt,
    }));

    return SocialResponseBuilder.searchResults(
      formattedLinks,
      {
        entity_name: entityName,
        interaction_type: interactionType,
        link_types: linkTypes,
        memory_keywords: memoryKeywords,
        min_strength: minStrength,
      },
      'memory_social_links'
    );
  }

  /**
   * Get shared memories for an entity
   */
  async getSharedMemoriesForEntity(entityId: number): Promise<{
    memories: SharedMemory[];
    insights: Array<{
      pattern: string;
      examples: string[];
      strength: number;
    }>;
  }> {
    const links = await this.db.execute(async prisma => {
      return prisma.memorySocialLink.findMany({
        where: { socialEntityId: entityId },
        include: {
          memory: true,
          interaction: true,
        },
        orderBy: { strength: 'desc' },
        take: 50,
      });
    });

    const memories: SharedMemory[] = links.map((link: any) => ({
      key: link.memory?.key || '',
      content: link.memory?.content || {},
      tags: link.memory?.tags || [],
      importance: link.memory?.importance || 'medium',
      linkType: link.relationshipType,
      linkStrength: link.strength,
      linkContext: link.context,
      createdAt: link.createdAt,
      interactionContext: link.interaction
        ? {
            id: link.interaction.id,
            type: link.interaction.interactionType,
            date: link.interaction.createdAt,
          }
        : undefined,
    }));

    const insights = this.generateMemoryInsights(links);

    return { memories, insights };
  }

  /**
   * Get rich memory context for a social entity
   */
  async getSocialMemoryContext(args: {
    entity_name: string;
    include_creation_memories?: boolean;
    include_learning_memories?: boolean;
    include_emotional_memories?: boolean;
    time_period?: string;
  }): Promise<object> {
    const entityName = SocialValidationUtils.validateRequiredString(args.entity_name, 'entity_name', 100);
    const includeCreation = args.include_creation_memories !== false;
    const includeLearning = args.include_learning_memories !== false;
    const includeEmotional = args.include_emotional_memories !== false;
    const timePeriod = args.time_period || 'all_time';

    // Get the entity
    const entity = await this.entityManager.getEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }

    // Calculate date filter
    let dateFilter: Date | undefined;
    if (timePeriod !== 'all_time') {
      const now = new Date();
      let daysBack = 30;
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
      dateFilter = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    }

    // Build link type filters
    const linkTypes: string[] = [];
    if (includeCreation) {
      linkTypes.push('co_created', 'shared_experience', 'collaboration_outcome');
    }
    if (includeLearning) {
      linkTypes.push('learned_from', 'taught_to', 'discovered_together', 'mentoring_moment');
    }
    if (includeEmotional) {
      linkTypes.push('emotional_support', 'inspired_by', 'celebration_shared');
    }

    // Get memory links
    const whereClause: any = {
      socialEntityId: entity.id,
    };
    if (linkTypes.length > 0) {
      whereClause.linkType = { in: linkTypes };
    }
    if (dateFilter) {
      whereClause.createdAt = { gte: dateFilter };
    }

    const links = await this.db.execute(async prisma => {
      return prisma.memorySocialLink.findMany({
        where: whereClause,
        include: {
          memory: true,
          interaction: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    // Categorize memories
    const categorizedMemories = {
      creation: [] as any[],
      learning: [] as any[],
      emotional: [] as any[],
      collaboration: [] as any[],
      inspiration: [] as any[],
      other: [] as any[],
    };

    links.forEach((link: any) => {
      const memory = {
        key: link.memory?.key,
        content: link.memory?.content,
        linkType: link.linkType,
        strength: link.strength,
        context: link.context,
        createdAt: link.createdAt,
      };

      switch (link.linkType) {
        case 'co_created':
        case 'shared_experience':
          categorizedMemories.creation.push(memory);
          break;
        case 'learned_from':
        case 'taught_to':
        case 'discovered_together':
          categorizedMemories.learning.push(memory);
          break;
        case 'emotional_support':
        case 'celebration_shared':
          categorizedMemories.emotional.push(memory);
          break;
        case 'collaboration_outcome':
        case 'problem_solving':
          categorizedMemories.collaboration.push(memory);
          break;
        case 'inspired_by':
        case 'creative_inspiration':
          categorizedMemories.inspiration.push(memory);
          break;
        default:
          categorizedMemories.other.push(memory);
      }
    });

    return SocialResponseBuilder.success(
      {
        entity: {
          name: entity.name,
          displayName: entity.displayName,
          type: entity.entityType,
        },
        summary: {
          totalSharedMemories: links.length,
          timePeriod: timePeriod,
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
        insights: this.generateMemoryInsights(links),
      },
      `Retrieved ${links.length} shared memories for ${entityName}`
    );
  }

  /**
   * Generate insights from memory links
   */
  private generateMemoryInsights(links: any[]): Array<{
    pattern: string;
    examples: string[];
    strength: number;
  }> {
    const linkTypeDistribution: Record<string, number> = {};
    const strengthByType: Record<string, number[]> = {};

    links.forEach((link: any) => {
      const type = link.linkType;
      linkTypeDistribution[type] = (linkTypeDistribution[type] || 0) + 1;

      if (!strengthByType[type]) {
        strengthByType[type] = [];
      }
      strengthByType[type].push(link.strength);
    });

    return Object.entries(linkTypeDistribution)
      .map(([type, count]) => ({
        pattern: `${type.replace('_', ' ')}: ${count} memories`,
        examples: links
          .filter((link: any) => link.linkType === type)
          .slice(0, 3)
          .map((link: any) => link.memory?.key || 'Unknown')
          .filter(Boolean),
        strength: strengthByType[type].reduce((sum, s) => sum + s, 0) / strengthByType[type].length,
      }))
      .sort((a, b) => b.strength - a.strength);
  }
}
