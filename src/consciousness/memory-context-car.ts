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
    let recentActivity: Record<string, unknown>[] = [];
    
    try {
      // Get total memory count (if available)
          const memoryStats = await memory.executeMemoryOperation('getMemoryCount', {});
    totalMemories = (memoryStats as number) || 0;
      
      // Get recent memory activity
      const recentSearch = await memory.searchMemories({
        query: '',
        tags: [],
        // No importance filter to get recent activity
      });
      
      const RECENT_ACTIVITY_LIMIT = 5;
      recentActivity = recentSearch.results?.slice(0, RECENT_ACTIVITY_LIMIT) || [];
      
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









