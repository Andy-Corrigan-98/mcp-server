import { MemoryResult } from '../../../db/index.js';
import { InputValidator } from '../../../validation/index.js';
import { ConsciousnessPrismaService } from '../../../db/prisma-service.js';
import { ConfigurationService } from '../../../db/configuration-service.js';

/**
 * Relevance configuration interface
 */
interface RelevanceConfig {
  contentWeight: number;
  tagWeight: number;
  importanceWeight: number;
  accessWeight: number;
}

/**
 * Search memories by tags or content patterns
 */
export async function searchMemories(args: { query?: string; tags?: string[]; importance_filter?: string }): Promise<{
  success: boolean;
  results: Array<{
    key: string;
    content: unknown;
    tags: string[];
    importance: string;
    stored_at: string;
    access_count: number;
    relevance_score: number;
  }>;
  total_found: number;
}> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Get configuration values
  const maxTagLength = await config.getNumber('memory.max_tag_length', 100);
  const decimalPrecision = await config.getNumber('memory.decimal_precision', 100);

  // Get relevance weights
  const relevanceConfig: RelevanceConfig = {
    contentWeight: await config.getNumber('memory.content_weight', 0.4),
    tagWeight: await config.getNumber('memory.tag_weight', 0.3),
    importanceWeight: await config.getNumber('memory.importance_weight', 0.2),
    accessWeight: await config.getNumber('memory.access_weight', 0.1),
  };

  // Get importance scores
  const importanceScores = {
    low: await config.getNumber('memory.importance_score_low', 0.25),
    medium: await config.getNumber('memory.importance_score_medium', 0.5),
    high: await config.getNumber('memory.importance_score_high', 0.75),
    critical: await config.getNumber('memory.importance_score_critical', 1.0),
  };

  const maxAccessCountNormalization = await config.getNumber('memory.max_access_count_normalization', 10);

  // Validate and sanitize inputs
  const query = args.query ? InputValidator.sanitizeSearchQuery(args.query) : undefined;
  const tags = args.tags ? args.tags.map(tag => InputValidator.sanitizeString(tag, maxTagLength)) : undefined;
  const importanceFilter = args.importance_filter
    ? InputValidator.validateImportanceLevel(args.importance_filter)
    : undefined;

  const memories = await db.searchMemories(query, tags, importanceFilter);

  // Calculate relevance scores
  const rankedMemories = memories
    .map(memory => ({
      ...memory,
      relevance_score: calculateRelevance(
        memory,
        query,
        relevanceConfig,
        importanceScores,
        maxAccessCountNormalization,
        decimalPrecision
      ),
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score);

  return {
    success: true,
    results: rankedMemories.map(memory => ({
      key: memory.key,
      content: memory.content,
      tags: memory.tags,
      importance: memory.importance,
      stored_at: memory.storedAt.toISOString(),
      access_count: memory.accessCount,
      relevance_score: memory.relevance_score,
    })),
    total_found: rankedMemories.length,
  };
}

/**
 * Calculate relevance score for a memory based on query and configuration
 */
function calculateRelevance(
  memory: MemoryResult,
  query: string | undefined,
  relevanceConfig: RelevanceConfig,
  importanceScores: Record<string, number>,
  maxAccessCountNormalization: number,
  decimalPrecision: number
): number {
  let score = 0;

  // Content relevance
  if (query) {
    const contentStr = JSON.stringify(memory.content).toLowerCase();
    const queryLower = query.toLowerCase();

    if (contentStr.includes(queryLower)) {
      score += relevanceConfig.contentWeight;
    }
  }

  // Tag relevance (simplified)
  if (query) {
    const queryLower = query.toLowerCase();
    const tagMatches = memory.tags.filter(tag => tag.toLowerCase().includes(queryLower)).length;
    score += (tagMatches / Math.max(memory.tags.length, 1)) * relevanceConfig.tagWeight;
  }

  // Importance weighting
  score += importanceScores[memory.importance] * relevanceConfig.importanceWeight;

  // Access frequency (normalized)
  const accessScore = Math.min(memory.accessCount / maxAccessCountNormalization, 1.0);
  score += accessScore * relevanceConfig.accessWeight;

  return Math.round(score * decimalPrecision) / decimalPrecision; // Round to configured precision
}
