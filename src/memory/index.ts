// Import functions first
import { storeMemory } from './store-memory.js';
import { retrieveMemory } from './retrieve-memory.js';
import { searchMemories } from './search-memories.js';
import { addToKnowledgeGraph } from './add-knowledge.js';
import { queryKnowledgeGraph } from './query-knowledge.js';

// Import tool builder for compatibility
import { Tool } from '@modelcontextprotocol/sdk/types.js';
// import { MEMORY_TOOLS } from '../../tools/memory/types.js'; // V1 legacy - removed

// Then export them
export { storeMemory, retrieveMemory, searchMemories, addToKnowledgeGraph, queryKnowledgeGraph };

// Re-export types for convenience
export type { MemoryData, MemoryResult, KnowledgeEntityData, KnowledgeRelationshipData } from '../core/db/index.js';

/**
 * Memory Tools
 *
 * Memory operations organized into single-responsibility modules:
 * - storage/: Memory storage and retrieval operations
 * - search/: Memory search with relevance scoring
 * - knowledge-graph/: Knowledge graph entity and relationship management
 *
 * All functions are pure and stateless - they take explicit dependencies
 * and have no hidden side effects.
 */

/**
 * Get all available memory tools with proper schemas
 * This function provides compatibility with the existing tool registration pattern
 */
export function getMemoryTools(): Record<string, Tool> {
  return {}; // V2 simplified
}

/**
 * Execute a memory operation by name
 * This function provides compatibility with the existing tool execution pattern
 */
export async function executeMemoryOperation(operationName: string, args: Record<string, unknown>): Promise<unknown> {
  switch (operationName) {
    case 'memory_store':
      return storeMemory({
        key: args.key as string,
        content: args.content,
        tags: args.tags as string[],
        importance: args.importance as string,
      });

    case 'memory_retrieve':
      return retrieveMemory({
        key: args.key as string,
      });

    case 'memory_search':
      return searchMemories({
        query: args.query as string,
        tags: args.tags as string[],
        importance_filter: args.importance_filter as string,
      });

    case 'knowledge_graph_add':
      return addToKnowledgeGraph({
        entity: args.entity as string,
        entity_type: args.entity_type as string,
        properties: args.properties as Record<string, unknown>,
        relationships: args.relationships as Array<{
          target: string;
          relationship: string;
          strength?: number;
        }>,
      });

    case 'knowledge_graph_query':
      return queryKnowledgeGraph({
        entity: args.entity as string,
        depth: args.depth as number,
        relationship_types: args.relationship_types as string[],
      });

    default:
      throw new Error(`Unknown memory operation: ${operationName}`);
  }
}

/**
 * Memory Tools Wrapper
 * Provides the same interface as the old class-based approach for compatibility
 */
export class MemoryTools {
  getTools(): Record<string, Tool> {
    return getMemoryTools();
  }

  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    return executeMemoryOperation(toolName, args);
  }
}
