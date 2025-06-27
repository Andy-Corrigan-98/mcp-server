import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool definitions for memory operations
 */

export const MEMORY_TOOLS: Record<string, Tool> = {
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

/**
 * Relevance calculation parameters
 */
export interface RelevanceConfig {
  contentWeight: number;
  tagWeight: number;
  importanceWeight: number;
  accessWeight: number;
} 