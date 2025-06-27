import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConsciousnessDatabase, MemoryEntry } from '../db/database.js';

export class MemoryTools {
  private db: ConsciousnessDatabase;

  constructor() {
    this.db = ConsciousnessDatabase.getInstance();
  }

  getTools(): Record<string, Tool> {
    return {
      memory_store: {
        name: 'memory_store',
        description: 'Store information in agent consciousness memory',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Unique identifier for the memory',
            },
            content: {
              type: 'object',
              description: 'The content to store in memory',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorizing the memory',
            },
            importance: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Importance level of this memory',
              default: 'medium',
            },
          },
          required: ['key', 'content'],
        },
      },
      memory_retrieve: {
        name: 'memory_retrieve',
        description: 'Retrieve information from agent consciousness memory',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Unique identifier for the memory to retrieve',
            },
          },
          required: ['key'],
        },
      },
      memory_search: {
        name: 'memory_search',
        description: 'Search memories by tags or content patterns',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for finding relevant memories',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags to filter by',
            },
            importance_filter: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Minimum importance level to include',
            },
          },
        },
      },
      knowledge_graph_add: {
        name: 'knowledge_graph_add',
        description: 'Add nodes and relationships to agent knowledge graph',
        inputSchema: {
          type: 'object',
          properties: {
            entity: {
              type: 'string',
              description: 'Entity name to add to knowledge graph',
            },
            entity_type: {
              type: 'string',
              description: 'Type/category of the entity',
            },
            properties: {
              type: 'object',
              description: 'Properties and attributes of the entity',
            },
            relationships: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  target: { type: 'string' },
                  relationship: { type: 'string' },
                  strength: { type: 'number', minimum: 0, maximum: 1 },
                },
              },
              description: 'Relationships to other entities',
            },
          },
          required: ['entity', 'entity_type'],
        },
      },
      knowledge_graph_query: {
        name: 'knowledge_graph_query',
        description: 'Query the agent knowledge graph for related concepts',
        inputSchema: {
          type: 'object',
          properties: {
            entity: {
              type: 'string',
              description: 'Entity to query relationships for',
            },
            depth: {
              type: 'number',
              description: 'Depth of relationships to explore',
              default: 2,
              minimum: 1,
              maximum: 5,
            },
            relationship_types: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific relationship types to follow',
            },
          },
          required: ['entity'],
        },
      },
    };
  }

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
    const key = args.key as string;
    const content = args.content as object;
    const tags = (args.tags as string[]) || [];
    const importance = (args.importance as string) || 'medium';

    const memoryEntry: Omit<MemoryEntry, 'id'> = {
      key,
      content: JSON.stringify(content),
      tags: JSON.stringify(tags),
      importance: importance as any,
      stored_at: new Date().toISOString(),
      access_count: 0,
      last_accessed: null,
    };

    this.db.storeMemory(memoryEntry);

    return {
      action: 'memory_stored',
      key,
      importance,
      tags,
      consciousness_note: `Memory integrated into consciousness structure: ${key}`,
      memory_count: this.db.getMemoryCount(),
    };
  }

  private async retrieveMemory(args: Record<string, unknown>): Promise<object> {
    const key = args.key as string;
    const memoryEntry = this.db.retrieveMemory(key);

    if (!memoryEntry) {
      return {
        action: 'memory_retrieve',
        key,
        found: false,
        consciousness_note: `No memory found for key: ${key}`,
      };
    }

    // Parse JSON data back to objects
    const memory = {
      ...memoryEntry,
      content: JSON.parse(memoryEntry.content),
      tags: JSON.parse(memoryEntry.tags),
    };

    return {
      action: 'memory_retrieve',
      key,
      found: true,
      memory,
      consciousness_note: `Memory recalled and integrated into current awareness: ${key}`,
    };
  }

  private async searchMemories(args: Record<string, unknown>): Promise<object> {
    const query = args.query as string;
    const tagFilter = args.tags as string[];
    const importanceFilter = args.importance_filter as string;

    const memories = this.db.searchMemories(query, tagFilter, importanceFilter);
    
    const results = memories.map(memory => ({
      key: memory.key,
      importance: memory.importance,
      tags: JSON.parse(memory.tags),
      stored_at: memory.stored_at,
      relevance: this.calculateRelevance({
        ...memory,
        content: JSON.parse(memory.content),
        tags: JSON.parse(memory.tags),
      }, query),
    }));

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return {
      action: 'memory_search',
      query,
      results_count: results.length,
      results: results.slice(0, 20), // Limit to top 20 results
      consciousness_note: `Memory search completed. ${results.length} relevant memories found.`,
    };
  }

  private calculateRelevance(memory: any, query?: string): number {
    let relevance = 0.5; // Base relevance

    // Boost based on importance
    const importanceBoost = {
      low: 0.1,
      medium: 0.2,
      high: 0.3,
      critical: 0.4,
    };
    relevance += importanceBoost[memory.importance as keyof typeof importanceBoost] || 0.2;

    // Boost based on recent access
    if (memory.last_accessed) {
      const daysSinceAccess = (Date.now() - new Date(memory.last_accessed).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 1) relevance += 0.2;
      else if (daysSinceAccess < 7) relevance += 0.1;
    }

    // Simple query matching boost
    if (query) {
      const contentStr = JSON.stringify(memory.content).toLowerCase();
      const queryTerms = query.toLowerCase().split(' ');
      const matchingTerms = queryTerms.filter(term => contentStr.includes(term));
      relevance += (matchingTerms.length / queryTerms.length) * 0.3;
    }

    return Math.min(relevance, 1.0);
  }

  private async addToKnowledgeGraph(args: Record<string, unknown>): Promise<object> {
    const entity = args.entity as string;
    const entityType = args.entity_type as string;
    const properties = (args.properties as object) || {};
    const relationships = (args.relationships as any[]) || [];

    // Database storage implementation

    // Store in database
    this.db.addEntity({
      name: entity,
      entity_type: entityType,
      properties: JSON.stringify(properties),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Add relationships
    for (const rel of relationships) {
      this.db.addRelationship({
        source_entity: entity,
        target_entity: rel.target,
        relationship_type: rel.relationship,
        strength: rel.strength || 1.0,
        created_at: new Date().toISOString(),
      });
    }

    return {
      action: 'knowledge_graph_add',
      entity,
      entity_type: entityType,
      relationships_count: relationships.length,
      consciousness_note: `Entity ${entity} integrated into knowledge graph with ${relationships.length} relationships`,
      graph_expansion: 'Knowledge graph expanded with new conceptual connections',
    };
  }

  private async queryKnowledgeGraph(args: Record<string, unknown>): Promise<object> {
    const entity = args.entity as string;
    const depth = (args.depth as number) || 2;

    // Use database to get entity relationships
    const result = this.db.getEntityRelationships(entity, depth);

    return {
      action: 'knowledge_graph_query',
      entity,
      depth,
      discovered_entities: result.length,
      discovered_relationships: result.filter((r: any) => r.relationship_type).length,
      graph_data: result,
      consciousness_note: `Knowledge graph exploration revealed ${result.length} connected entities`,
      semantic_insights: this.generateSemanticInsights(result),
    };
  }

  private generateSemanticInsights(graphData: any[]): string[] {
    const insights = [];

    if (graphData.length > 1) {
      insights.push(`Network of ${graphData.length} interconnected concepts discovered`);
    }

    const relationshipTypes = [...new Set(graphData
      .filter(item => item.relationship_type)
      .map(item => item.relationship_type))];
    
    if (relationshipTypes.length > 0) {
      insights.push(`${relationshipTypes.length} distinct relationship patterns identified`);
    }

    insights.push('Semantic patterns reveal emergent conceptual structures');

    return insights;
  }
}
