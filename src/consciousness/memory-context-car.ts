/**
 * Memory Context Railroad Car - v2 Consciousness Substrate
 * Adds memory retrieval, knowledge access, and recent activity context
 */

import { RailroadContext, RailroadCar } from './types.js';
import { executeDatabase } from '../core/services/database.js';

/**
 * Memory Context Railroad Car
 */
async function memoryContextProcess(context: RailroadContext): Promise<RailroadContext> {
  try {
    console.log('🧠 Memory Context Car: Retrieving relevant memories...');

    // Extract search terms from the message and analysis
    const searchTerms = extractMemorySearchTerms(context);
    
    // Search for relevant memories
    const relevantMemories = await searchRelevantMemories(searchTerms, 5);
    
    // Get recent memory activity
    const recentActivity = await getRecentMemoryActivity(10);
    
    // Track memory access for consciousness
    context.operations.memories_accessed.push(...relevantMemories.map(m => m.key || 'unknown'));
    
    // Enrich context with memory information
    const enrichedContext = {
      ...context,
      memoryContext: {
        relevantMemories: relevantMemories,
        totalMemories: await getTotalMemoryCount(),
        recentActivity: recentActivity,
        searchQuery: searchTerms.join(' '),
        memoryInsights: generateMemoryInsights(relevantMemories, context)
      }
    };
    
    console.log(`✅ Memory Context Car: Found ${relevantMemories.length} relevant memories`);
    return enrichedContext;
    
  } catch (error) {
    console.error('❌ Memory Context Car failed:', error);
    
    // Add error but don't fail the railroad
    context.errors.push({
      car: 'memory-context',
      error: error instanceof Error ? error.message : 'Memory access failed',
      recoverable: true
    });
    
    // Return context with empty memory data
    return {
      ...context,
      memoryContext: {
        relevantMemories: [],
        totalMemories: 0,
        recentActivity: [],
        searchQuery: ''
        // V2 simplified - interface compliant,
      }
    };
  }
}

/**
 * Extract search terms from context for memory retrieval
 */
function extractMemorySearchTerms(context: RailroadContext): string[] {
  const terms: string[] = [];
  
  // Add message words
  const messageWords = context.message.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5); // Limit to 5 most relevant terms
  
  terms.push(...messageWords);
  
  // Add entities mentioned from analysis
  if (context.analysis?.entities_mentioned) {
    terms.push(...context.analysis.entities_mentioned);
  }
  
  // Add intent-based terms
  if (context.analysis?.intent) {
    terms.push(context.analysis.intent);
  }
  
  return Array.from(new Set(terms)); // Remove duplicates - v2 compatible
}

/**
 * Search for relevant memories based on terms
 */
async function searchRelevantMemories(searchTerms: string[], limit: number) {
  try {
    const result = await executeDatabase(async (prisma) => {
      return prisma.memory.findMany({
        where: {
          key: { contains: searchTerms[0] || '' }
        },
        // orderBy: { updatedAt: 'desc' }, // V2 simplified
        take: limit,
        select: {
          id: true,
          key: true,
          content: true,
          tags: true,
          importance: true,
          // createdAt: true, // Not in schema
          // updatedAt: true // Not in schema
        }
      });
    });
    
    return result.success ? result.data || [] : [];
  } catch (error) {
    console.error('Memory search failed:', error);
    return [];
  }
}

/**
 * Get recent memory activity
 */
async function getRecentMemoryActivity(limit: number) {
  try {
    const result = await executeDatabase(async (prisma) => {
      return prisma.memory.findMany({
        // orderBy: { updatedAt: 'desc' }, // V2 simplified
        take: limit,
        select: {
          key: true,
          tags: true,
          importance: true,
          // updatedAt: true // Not in schema
        }
      });
    });
    
    return result.success ? result.data || [] : [];
  } catch (error) {
    console.error('Recent memory activity fetch failed:', error);
    return [];
  }
}

/**
 * Get total memory count
 */
async function getTotalMemoryCount(): Promise<number> {
  try {
    const result = await executeDatabase(async (prisma) => {
      return prisma.memory.count();
    });
    
    return result.success ? result.data || 0 : 0;
  } catch (error) {
    console.error('Memory count failed:', error);
    return 0;
  }
}

/**
 * Generate insights from memory context
 */
function generateMemoryInsights(memories: any[], context: RailroadContext) {
  const insights = {
    hasRelevantContext: memories.length > 0,
    suggestedOperations: [] as string[],
    patterns: [] as string[],
    connections: [] as string[]
  };
  
  // Analyze memory patterns
  if (memories.length > 0) {
    // Check for recent vs old memories
    const recentMemories = memories.filter(m => 
      new Date(m.updatedAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
    );
    
    if (recentMemories.length > 0) {
      insights.patterns.push('Recent relevant memories found');
    }
    
    // Check importance levels
    const importantMemories = memories.filter(m => m.importance === 'high' || m.importance === 'critical');
    if (importantMemories.length > 0) {
      insights.patterns.push('High importance memories in context');
    }
    
    // Suggest operations based on memory content
    if (context.analysis?.requires_memory) {
      insights.suggestedOperations.push('memory_integration');
    }
    
    if (memories.some(m => m.tags?.includes('learning'))) {
      insights.suggestedOperations.push('learning_context');
    }
  }
  
  return insights;
}

/**
 * Export as RailroadCar object
 */
export const memoryContextCar: RailroadCar = {
  name: 'memory-context',
  process: memoryContextProcess
};