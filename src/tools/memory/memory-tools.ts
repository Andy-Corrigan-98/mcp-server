import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MemoryData, MemoryResult, KnowledgeEntityData, KnowledgeRelationshipData } from '../../db/index.js';
import { InputValidator } from '../../validation/index.js';
import { ServiceBase } from '../base/index.js';
import { MEMORY_TOOLS, RelevanceConfig } from './types.js';

/**
 * Memory configuration interface
 */
interface MemoryConfig {
  maxTagLength: number;
  maxEntityTypeLength: number;
  maxRelationshipTypeLength: number;
  maxAccessCountNormalization: number;
  minGraphDepth: number;
  maxGraphDepth: number;
  decimalPrecision: number;
  contentWeight: number;
  tagWeight: number;
  importanceWeight: number;
  accessWeight: number;
  importanceScoreLow: number;
  importanceScoreMedium: number;
  importanceScoreHigh: number;
  importanceScoreCritical: number;
}

/**
 * Memory Tools implementation for consciousness MCP server
 * Provides memory storage and knowledge graph operations
 */
export class MemoryTools extends ServiceBase {
  private relevanceConfig: RelevanceConfig;
  private config: MemoryConfig = {} as MemoryConfig;

  constructor() {
    super(); // Initialize services automatically

    // Initialize configuration with defaults
    this.initializeDefaults();

    // Set relevance config from loaded values
    this.relevanceConfig = {
      contentWeight: this.config.contentWeight,
      tagWeight: this.config.tagWeight,
      importanceWeight: this.config.importanceWeight,
      accessWeight: this.config.accessWeight,
    };

    // Load configuration values asynchronously to override defaults
    this.loadConfiguration();
  }

  /**
   * Initialize configuration with default values
   */
  private initializeDefaults(): void {
    this.config = {
      maxTagLength: 100,
      maxEntityTypeLength: 100,
      maxRelationshipTypeLength: 100,
      maxAccessCountNormalization: 10,
      minGraphDepth: 1,
      maxGraphDepth: 5,
      decimalPrecision: 100,
      contentWeight: 0.4,
      tagWeight: 0.3,
      importanceWeight: 0.2,
      accessWeight: 0.1,
      importanceScoreLow: 0.25,
      importanceScoreMedium: 0.5,
      importanceScoreHigh: 0.75,
      importanceScoreCritical: 1.0,
    };
  }

  /**
   * Load all configuration values from the database
   */
  private async loadConfiguration(): Promise<void> {
    try {
      this.config = {
        maxTagLength: await this.configService.getNumber('memory.max_tag_length', this.config.maxTagLength),
        maxEntityTypeLength: await this.configService.getNumber(
          'memory.max_entity_type_length',
          this.config.maxEntityTypeLength
        ),
        maxRelationshipTypeLength: await this.configService.getNumber(
          'memory.max_relationship_type_length',
          this.config.maxRelationshipTypeLength
        ),
        maxAccessCountNormalization: await this.configService.getNumber(
          'memory.max_access_count_normalization',
          this.config.maxAccessCountNormalization
        ),
        minGraphDepth: await this.configService.getNumber('memory.min_graph_depth', this.config.minGraphDepth),
        maxGraphDepth: await this.configService.getNumber('memory.max_graph_depth', this.config.maxGraphDepth),
        decimalPrecision: await this.configService.getNumber('memory.decimal_precision', this.config.decimalPrecision),
        contentWeight: await this.configService.getNumber('memory.content_weight', this.config.contentWeight),
        tagWeight: await this.configService.getNumber('memory.tag_weight', this.config.tagWeight),
        importanceWeight: await this.configService.getNumber('memory.importance_weight', this.config.importanceWeight),
        accessWeight: await this.configService.getNumber('memory.access_weight', this.config.accessWeight),
        importanceScoreLow: await this.configService.getNumber(
          'memory.importance_score_low',
          this.config.importanceScoreLow
        ),
        importanceScoreMedium: await this.configService.getNumber(
          'memory.importance_score_medium',
          this.config.importanceScoreMedium
        ),
        importanceScoreHigh: await this.configService.getNumber(
          'memory.importance_score_high',
          this.config.importanceScoreHigh
        ),
        importanceScoreCritical: await this.configService.getNumber(
          'memory.importance_score_critical',
          this.config.importanceScoreCritical
        ),
      };

      // Update relevance config with new values
      this.relevanceConfig = {
        contentWeight: this.config.contentWeight,
        tagWeight: this.config.tagWeight,
        importanceWeight: this.config.importanceWeight,
        accessWeight: this.config.accessWeight,
      };
    } catch (error) {
      console.warn('Failed to load memory configuration, using defaults:', error);
      // Defaults are already set in initializeDefaults()
    }
  }

  /**
   * Get all available memory tools
   */
  getTools(): Record<string, Tool> {
    return MEMORY_TOOLS;
  }

  /**
   * Execute a memory tool operation
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'memory_store':
        return this.storeMemory(args);
      case 'memory_retrieve':
        return this.retrieveMemory(args);
      case 'memory_search':
        return this.searchMemories(args);
      case 'knowledge_graph_add':
        return this.addToKnowledgeGraph(args);
      case 'knowledge_graph_query':
        return this.queryKnowledgeGraph(args);
      default:
        throw new Error(`Unknown memory tool: ${toolName}`);
    }
  }

  private async storeMemory(args: Record<string, unknown>): Promise<object> {
    const key = InputValidator.validateKey(args.key as string);
    const content = args.content;
    const tags = (args.tags as string[]) || [];
    const importance = InputValidator.validateImportanceLevel((args.importance as string) || 'medium');

    // Sanitize tags
    const sanitizedTags = tags.map(tag => InputValidator.sanitizeString(tag, this.config.maxTagLength));

    const memoryData: MemoryData = {
      key,
      content,
      tags: sanitizedTags,
      importance,
    };

    const result = await this.db.storeMemory(memoryData);

    return {
      success: true,
      key: result.key,
      stored_at: result.storedAt,
      message: `Memory stored successfully with key: ${key}`,
    };
  }

  private async retrieveMemory(args: Record<string, unknown>): Promise<object> {
    const key = InputValidator.validateKey(args.key as string);

    const memory = await this.db.retrieveMemory(key);

    if (!memory) {
      return {
        success: false,
        message: `No memory found with key: ${key}`,
      };
    }

    return {
      success: true,
      memory: {
        key: memory.key,
        content: memory.content,
        tags: memory.tags,
        importance: memory.importance,
        stored_at: memory.storedAt,
        access_count: memory.accessCount,
        last_accessed: memory.lastAccessed,
      },
    };
  }

  private async searchMemories(args: Record<string, unknown>): Promise<object> {
    const query = args.query ? InputValidator.sanitizeSearchQuery(args.query as string) : undefined;
    const tags = args.tags
      ? (args.tags as string[]).map(tag => InputValidator.sanitizeString(tag, this.config.maxTagLength))
      : undefined;
    const importanceFilter = args.importance_filter
      ? InputValidator.validateImportanceLevel(args.importance_filter as string)
      : undefined;

    const memories = await this.db.searchMemories(query, tags, importanceFilter);

    // Calculate relevance scores
    const rankedMemories = memories
      .map(memory => ({
        ...memory,
        relevance_score: this.calculateRelevance(memory, query),
      }))
      .sort((a, b) => b.relevance_score - a.relevance_score);

    return {
      success: true,
      results: rankedMemories.map(memory => ({
        key: memory.key,
        content: memory.content,
        tags: memory.tags,
        importance: memory.importance,
        stored_at: memory.storedAt,
        access_count: memory.accessCount,
        relevance_score: memory.relevance_score,
      })),
      total_found: rankedMemories.length,
    };
  }

  private calculateRelevance(memory: MemoryResult, query?: string): number {
    let score = 0;

    // Content relevance
    if (query) {
      const contentStr = JSON.stringify(memory.content).toLowerCase();
      const queryLower = query.toLowerCase();

      if (contentStr.includes(queryLower)) {
        score += this.relevanceConfig.contentWeight;
      }
    }

    // Tag relevance (simplified)
    if (query) {
      const queryLower = query.toLowerCase();
      const tagMatches = memory.tags.filter(tag => tag.toLowerCase().includes(queryLower)).length;
      score += (tagMatches / Math.max(memory.tags.length, 1)) * this.relevanceConfig.tagWeight;
    }

    // Importance weighting
    const importanceScores = {
      low: this.config.importanceScoreLow,
      medium: this.config.importanceScoreMedium,
      high: this.config.importanceScoreHigh,
      critical: this.config.importanceScoreCritical,
    };
    score += importanceScores[memory.importance] * this.relevanceConfig.importanceWeight;

    // Access frequency (normalized)
    const accessScore = Math.min(memory.accessCount / this.config.maxAccessCountNormalization, 1.0);
    score += accessScore * this.relevanceConfig.accessWeight;

    return Math.round(score * this.config.decimalPrecision) / this.config.decimalPrecision; // Round to 2 decimal places
  }

  private async addToKnowledgeGraph(args: Record<string, unknown>): Promise<object> {
    const entityName = InputValidator.validateEntityName(args.entity as string);
    const entityType = InputValidator.sanitizeString(args.entity_type as string, this.config.maxEntityTypeLength);
    const properties = (args.properties as Record<string, unknown>) || {};
    const relationships = (args.relationships as unknown[]) || [];

    // Add the entity
    const entityData: KnowledgeEntityData = {
      name: entityName,
      entityType,
      properties,
    };

    await this.db.addEntity(entityData);

    // Add relationships
    for (const rel of relationships) {
      const relationship = rel as { target: string; relationship: string; strength?: number };
      const targetName = InputValidator.validateEntityName(relationship.target);
      const relationshipType = InputValidator.sanitizeString(
        relationship.relationship,
        this.config.maxRelationshipTypeLength
      );
      const strength =
        typeof relationship.strength === 'number' ? Math.max(0, Math.min(1, relationship.strength)) : 1.0;

      const relationshipData: KnowledgeRelationshipData = {
        sourceEntityName: entityName,
        targetEntityName: targetName,
        relationshipType,
        strength,
      };

      await this.db.addRelationship(relationshipData);
    }

    return {
      success: true,
      entity: entityName,
      relationships_added: relationships.length,
      message: `Entity '${entityName}' added to knowledge graph with ${relationships.length} relationships`,
    };
  }

  private async queryKnowledgeGraph(args: Record<string, unknown>): Promise<object> {
    const entityName = InputValidator.validateEntityName(args.entity as string);
    const depth = Math.max(this.config.minGraphDepth, Math.min(this.config.maxGraphDepth, (args.depth as number) || 2));

    const graphData = await this.db.getEntityRelationships(entityName, depth);

    if (graphData.length === 0) {
      return {
        success: false,
        message: `Entity '${entityName}' not found in knowledge graph`,
      };
    }

    const insights = this.generateSemanticInsights(graphData);

    return {
      success: true,
      entity: entityName,
      depth_explored: depth,
      graph_data: graphData,
      semantic_insights: insights,
      total_entities: graphData.length,
    };
  }

  private generateSemanticInsights(graphData: unknown[]): string[] {
    const insights: string[] = [];

    // Simple insight generation
    const entities = graphData as Array<{
      entityType: string;
      sourceRelationships?: Array<{ relationshipType: string }>;
      targetRelationships?: Array<{ relationshipType: string }>;
    }>;

    const entityTypes = [...new Set(entities.map(e => e.entityType))];
    if (entityTypes.length > 1) {
      insights.push(
        `Cross-domain connections found across ${entityTypes.length} entity types: ${entityTypes.join(', ')}`
      );
    }

    const relationshipTypes = new Set();
    entities.forEach(entity => {
      entity.sourceRelationships?.forEach(rel => relationshipTypes.add(rel.relationshipType));
      entity.targetRelationships?.forEach(rel => relationshipTypes.add(rel.relationshipType));
    });

    if (relationshipTypes.size > 0) {
      insights.push(`Relationship patterns: ${Array.from(relationshipTypes).join(', ')}`);
    }

    return insights;
  }
}
