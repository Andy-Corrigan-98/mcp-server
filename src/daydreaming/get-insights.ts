import { SerendipitousInsight } from '../daydreaming/types.js';
import { executeMemoryOperation } from '../../memory/index.js';

const DEFAULT_MIN_SCORE = 0.7;
const DEFAULT_DAYS_BACK = 7;

/**
 * Get stored daydream insights with filtering
 */
export async function getDaydreamInsights(
  args: Record<string, unknown>
): Promise<{ insights: SerendipitousInsight[] }> {
  const minScore = Math.max(0, Math.min(1, (args.min_score as number) || DEFAULT_MIN_SCORE));
  const daysBack = Math.max(1, (args.days_back as number) || DEFAULT_DAYS_BACK);
  const tags = (args.tags as string[]) || [];

  // Search memories with daydreaming tags
  const searchResult = (await executeMemoryOperation('memory_search', {
    tags: ['daydreaming', 'serendipitous_insight', ...tags],
  })) as any;

  const insights: SerendipitousInsight[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  for (const memory of searchResult.memories || []) {
    if (memory.storedAt >= cutoffDate && memory.content?.overallScore >= minScore) {
      insights.push(memory.content as SerendipitousInsight);
    }
  }

  return { insights };
}
