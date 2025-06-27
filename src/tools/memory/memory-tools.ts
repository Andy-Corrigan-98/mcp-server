import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ImportanceLevel } from '@prisma/client';
import { 
  ConsciousnessPrismaService, 
  MemoryData, 
  MemoryResult,
  KnowledgeEntityData,
  KnowledgeRelationshipData
} from '../../db/index.js';
import { InputValidator } from '../../validation/index.js';
import { MEMORY_TOOLS, RelevanceConfig } from './types.js';

/**
 * Memory Tools implementation for consciousness MCP server
 * Provides memory storage and knowledge graph operations
 */
export class MemoryTools {
  private db: ConsciousnessPrismaService;
  private relevanceConfig: RelevanceConfig;

  constructor() {
    this.db = ConsciousnessPrismaService.getInstance();
    this.relevanceConfig = {
      contentWeight: 0.4,
      tagWeight: 0.3,
      importanceWeight: 0.2,
      accessWeight: 0.1,
    };
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
    const importance = InputValidator.validateImportanceLevel(
      (args.importance as string) || 'medium'
    );

    // Sanitize tags
    const sanitizedTags = tags.map(tag => InputValidator.sanitizeString(tag, 100));

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
    const tags = args.tags ? (args.tags as string[]).map(tag => InputValidator.sanitizeString(tag, 100)) : undefined;
    const importanceFilter = args.importance_filter ? InputValidator.validateImportanceLevel(args.importance_filter as string) : undefined;

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
      const tagMatches = memory.tags.filter(tag => 
        tag.toLowerCase().includes(queryLower)
      ).length;
      score += (tagMatches / Math.max(memory.tags.length, 1)) * this.relevanceConfig.tagWeight;
    }

    // Importance weighting
    const importanceScores = { low: 0.25, medium: 0.5, high: 0.75, critical: 1.0 };
    score += importanceScores[memory.importance] * this.relevanceConfig.importanceWeight;

    // Access frequency (normalized)
    const accessScore = Math.min(memory.accessCount / 10, 1.0);
    score += accessScore * this.relevanceConfig.accessWeight;

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  private async addToKnowledgeGraph(args: Record<string, unknown>): Promise<object> {
    const entityName = InputValidator.validateEntityName(args.entity as string);
    const entityType = InputValidator.sanitizeString(args.entity_type as string, 100);
    const properties = (args.properties as Record<string, unknown>) || {};
    const relationships = (args.relationships as any[]) || [];

    // Add the entity
    const entityData: KnowledgeEntityData = {
      name: entityName,
      entityType,
      properties,
    };

    await this.db.addEntity(entityData);

    // Add relationships
    for (const rel of relationships) {
      const targetName = InputValidator.validateEntityName(rel.target);
      const relationshipType = InputValidator.sanitizeString(rel.relationship, 100);
      const strength = typeof rel.strength === 'number' ? 
        Math.max(0, Math.min(1, rel.strength)) : 1.0;

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
    const depth = Math.max(1, Math.min(5, (args.depth as number) || 2));

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

  private generateSemanticInsights(graphData: any[]): string[] {
    const insights: string[] = [];
    
    // Simple insight generation
    const entityTypes = [...new Set(graphData.map(e => e.entityType))];
    if (entityTypes.length > 1) {
      insights.push(`Cross-domain connections found across ${entityTypes.length} entity types: ${entityTypes.join(', ')}`);
    }

    const relationshipTypes = new Set();
    graphData.forEach(entity => {
      entity.sourceRelationships?.forEach((rel: any) => relationshipTypes.add(rel.relationshipType));
      entity.targetRelationships?.forEach((rel: any) => relationshipTypes.add(rel.relationshipType));
    });

    if (relationshipTypes.size > 0) {
      insights.push(`Relationship patterns: ${Array.from(relationshipTypes).join(', ')}`);
    }

    return insights;
  }
} 