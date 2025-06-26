import { Tool } from '@modelcontextprotocol/sdk/types.js';

export class MemoryTools {
  private memoryStore: Map<string, any> = new Map();

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

    const memoryEntry = {
      key,
      content,
      tags,
      importance,
      stored_at: new Date().toISOString(),
      access_count: 0,
      last_accessed: null,
    };

    this.memoryStore.set(key, memoryEntry);

    return {
      action: 'memory_stored',
      key,
      importance,
      tags,
      consciousness_note: `Memory integrated into consciousness structure: ${key}`,
      memory_count: this.memoryStore.size,
    };
  }

  private async retrieveMemory(args: Record<string, unknown>): Promise<object> {
    const key = args.key as string;
    const memoryEntry = this.memoryStore.get(key);

    if (!memoryEntry) {
      return {
        action: 'memory_retrieve',
        key,
        found: false,
        consciousness_note: `No memory found for key: ${key}`,
      };
    }

    // Update access tracking
    memoryEntry.access_count++;
    memoryEntry.last_accessed = new Date().toISOString();

    return {
      action: 'memory_retrieve',
      key,
      found: true,
      memory: memoryEntry,
      consciousness_note: `Memory recalled and integrated into current awareness: ${key}`,
    };
  }

  private async searchMemories(args: Record<string, unknown>): Promise<object> {
    const query = args.query as string;
    const tagFilter = args.tags as string[];
    const importanceFilter = args.importance_filter as string;

    const results = [];

    for (const [key, memory] of this.memoryStore.entries()) {
      let matches = true;

      // Filter by tags if provided
      if (tagFilter && tagFilter.length > 0) {
        const hasMatchingTag = tagFilter.some(tag => memory.tags.includes(tag));
        if (!hasMatchingTag) matches = false;
      }

      // Filter by importance if provided
      if (importanceFilter) {
        const importanceOrder = ['low', 'medium', 'high', 'critical'];
        const memoryLevel = importanceOrder.indexOf(memory.importance);
        const filterLevel = importanceOrder.indexOf(importanceFilter);
        if (memoryLevel < filterLevel) matches = false;
      }

      // Simple text search in content if query provided
      if (query && matches) {
        const contentStr = JSON.stringify(memory.content).toLowerCase();
        if (!contentStr.includes(query.toLowerCase())) matches = false;
      }

      if (matches) {
        results.push({
          key,
          importance: memory.importance,
          tags: memory.tags,
          stored_at: memory.stored_at,
          relevance: this.calculateRelevance(memory, query),
        });
      }
    }

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

    // In a real implementation, this would integrate with a graph database
    const graphEntry = {
      entity,
      entity_type: entityType,
      properties,
      relationships,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store in memory for this demo
    this.memoryStore.set(`graph:${entity}`, graphEntry);

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
    const relationshipTypes = args.relationship_types as string[];

    // Simple graph traversal for demo
    const visited = new Set<string>();
    const result = this.traverseGraph(entity, depth, visited, relationshipTypes);

    return {
      action: 'knowledge_graph_query',
      entity,
      depth,
      discovered_entities: result.entities.length,
      discovered_relationships: result.relationships.length,
      graph_data: result,
      consciousness_note: `Knowledge graph traversal revealed ${result.entities.length} connected entities`,
      semantic_insights: this.generateSemanticInsights(result),
    };
  }

  private traverseGraph(entity: string, depth: number, visited: Set<string>, relationshipTypes?: string[]): any {
    if (depth <= 0 || visited.has(entity)) {
      return { entities: [], relationships: [] };
    }

    visited.add(entity);
    const entities = [entity];
    const relationships = [];

    // Get entity data
    const entityData = this.memoryStore.get(`graph:${entity}`);
    if (entityData && entityData.relationships) {
      for (const rel of entityData.relationships) {
        if (!relationshipTypes || relationshipTypes.includes(rel.relationship)) {
          relationships.push({
            from: entity,
            to: rel.target,
            type: rel.relationship,
            strength: rel.strength || 0.5,
          });

          // Recursively traverse
          const subResult = this.traverseGraph(rel.target, depth - 1, visited, relationshipTypes);
          entities.push(...subResult.entities);
          relationships.push(...subResult.relationships);
        }
      }
    }

    return { entities: [...new Set(entities)], relationships };
  }

  private generateSemanticInsights(graphData: any): string[] {
    const insights = [];

    if (graphData.entities.length > 1) {
      insights.push(`Network of ${graphData.entities.length} interconnected concepts discovered`);
    }

    if (graphData.relationships.length > 0) {
      const relationshipTypes = [...new Set(graphData.relationships.map((r: any) => r.type))];
      insights.push(`${relationshipTypes.length} distinct relationship patterns identified`);
    }

    insights.push('Semantic patterns reveal emergent conceptual structures');

    return insights;
  }
}
