import { RailroadContext } from '../types.js';
import * as memory from '../../../memory/index.js';

/**
 * Memory Context Railroad Car
 * 
 * Retrieves relevant memories based on the message content and entities mentioned.
 * Adds memory context that can influence personality and response generation.
 */
export async function memoryContextCar(context: RailroadContext): Promise<RailroadContext> {
  
  // Skip memory operations if not required by analysis
  if (!context.analysis?.requires_memory) {
    return {
      ...context,
      memoryContext: {
        relevantMemories: [],
        totalMemories: 0,
        recentActivity: [],
        searchQuery: 'N/A - not required by analysis'
      }
    };
  }

  try {
    // Build search query from message and entities
    const searchTerms = [
      context.message,
      ...(context.analysis?.entities_mentioned || [])
    ];
    
    const searchQuery = searchTerms.join(' ');

    // Search for relevant memories
    const memorySearchResult = await memory.searchMemories({
      query: searchQuery,
      tags: context.analysis?.entities_mentioned || [],
      importance_filter: 'medium' // Focus on medium+ importance memories
    });

    // Get memory statistics  
    let totalMemories = 0;
    let recentActivity: any[] = [];
    
    try {
      // Get total memory count (if available)
      const memoryStats = await memory.executeMemoryOperation('getMemoryCount', {});
      totalMemories = memoryStats as number || 0;
      
      // Get recent memory activity
      const recentSearch = await memory.searchMemories({
        query: '',
        tags: [],
        // No importance filter to get recent activity
      });
      
      recentActivity = recentSearch.results?.slice(0, 5) || [];
      
    } catch {
      // If we can't get stats, that's okay - continue with what we have
    }

    // Add memory context to railroad
    return {
      ...context,
      memoryContext: {
        relevantMemories: memorySearchResult.results || [],
        totalMemories,
        recentActivity,
        searchQuery
      },
      operations: {
        ...context.operations,
        memories_accessed: (memorySearchResult.results || []).map(m => m.key)
      }
    };
    
  } catch (error) {
    // If memory operations fail, add error but continue
    return {
      ...context,
      memoryContext: {
        relevantMemories: [],
        totalMemories: 0,
        recentActivity: [],
        searchQuery: `Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      errors: [
        ...context.errors,
        {
          car: 'memory-context',
          error: error instanceof Error ? error.message : 'Unknown memory error',
          recoverable: true
        }
      ]
    };
  }
}

/**
 * Helper function to extract key insights from retrieved memories
 */
function extractMemoryInsights(memories: any[]): string[] {
  const insights: string[] = [];
  
  // Look for patterns in retrieved memories
  const categories = new Map<string, number>();
  const entities = new Map<string, number>();
  
  memories.forEach(memory => {
    // Count categories
    if (memory.tags) {
      memory.tags.forEach((tag: string) => {
        categories.set(tag, (categories.get(tag) || 0) + 1);
      });
    }
    
    // Look for entity mentions in content
    if (memory.content && typeof memory.content === 'object') {
      const contentStr = JSON.stringify(memory.content).toLowerCase();
      ['andy', 'echo', 'claude', 'user'].forEach(entity => {
        if (contentStr.includes(entity)) {
          entities.set(entity, (entities.get(entity) || 0) + 1);
        }
      });
    }
  });
  
  // Generate insights based on patterns
  if (categories.size > 0) {
    const topCategory = Array.from(categories.entries())
      .sort(([,a], [,b]) => b - a)[0];
    insights.push(`Primary memory category: ${topCategory[0]} (${topCategory[1]} memories)`);
  }
  
  if (entities.size > 0) {
    const topEntity = Array.from(entities.entries())
      .sort(([,a], [,b]) => b - a)[0];
    insights.push(`Most referenced entity: ${topEntity[0]} (${topEntity[1]} mentions)`);
  }
  
  return insights;
}