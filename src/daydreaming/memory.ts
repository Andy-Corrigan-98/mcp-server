import { executeMemoryOperation } from '../../memory/index.js';

const HIGH_IMPORTANCE_SCORE = 0.8;
const MEDIUM_IMPORTANCE_SCORE = 0.5;
const LOW_IMPORTANCE_SCORE = 0.3;

/**
 * Get recent memories that can serve as concepts for daydreaming
 */
export async function getRecentMemories(_focusArea?: string): Promise<unknown[]> {
  try {
    // Query recent memories that could serve as concepts
    const searchResult = (await executeMemoryOperation('memory_search', {})) as {
      results?: Array<{ key: string; importance: string; stored_at: string }>;
    };

    return (searchResult.results || []).map(memory => ({
      entity: memory.key,
      type: 'memory',
      source: 'memory' as const,
      importance:
        memory.importance === 'high'
          ? HIGH_IMPORTANCE_SCORE
          : memory.importance === 'medium'
            ? MEDIUM_IMPORTANCE_SCORE
            : LOW_IMPORTANCE_SCORE,
      lastAccessed: new Date(memory.stored_at),
    }));
  } catch (error) {
    console.warn('Failed to fetch recent memories:', error);
    return [];
  }
}








