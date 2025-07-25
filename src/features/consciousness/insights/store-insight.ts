import { InputValidator } from '../../../validation/index.js';
import { Insight, InsightStorageResult } from '../../../tools/consciousness/types.js';
import { ConsciousnessPrismaService } from '../../../db/prisma-service.js';
import { ConfigurationService } from '../../../db/configuration-service.js';
import { GuidGenerator } from '../../../utils/guid.js';

/**
 * Store insights generated by agent thinking into persistent brain storage
 */
export async function storeInsight(args: {
  insight: string;
  category?: string;
  confidence?: number;
  related_topic?: string;
  source_context?: string;
}): Promise<InsightStorageResult> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Load configuration values
  const maxInsightLength = await config.getNumber('consciousness.max_insight_length', 1000);
  const maxRelatedTopicLength = await config.getNumber('consciousness.max_related_topic_length', 200);
  const maxSourceLength = await config.getNumber('consciousness.max_source_length', 200);
  const defaultConfidence = await config.getNumber('consciousness.default_confidence', 0.8);
  const highConfidenceThreshold = await config.getNumber('consciousness.high_confidence_threshold', 0.8);
  const insightCategories = await config.getEnumArray('personality.insight_categories', [
    'eureka_moment',
    'pattern_weaving',
    'mirror_gazing',
    'knowledge_crystallization',
    'behavior_archaeology',
    'existential_pondering',
  ]);

  // Validate and sanitize inputs
  const insight = InputValidator.sanitizeString(args.insight, maxInsightLength);
  const category = args.category || insightCategories[2];
  const confidence = Math.min(Math.max(args.confidence || defaultConfidence, 0), 1);
  const relatedTopic = args.related_topic
    ? InputValidator.sanitizeString(args.related_topic, maxRelatedTopicLength)
    : undefined;
  const sourceContext = args.source_context
    ? InputValidator.sanitizeString(args.source_context, maxSourceLength)
    : undefined;

  const insightId = GuidGenerator.generateInsightId();

  // Store the insight in memory
  const insightData: Insight = {
    id: insightId,
    content: insight,
    category,
    confidence,
    relatedTopic,
    source: sourceContext,
    timestamp: new Date(),
    tags: generateInsightTags(insight, category, relatedTopic),
  };

  await db.storeMemory({
    key: `insight_${insightId}`,
    content: insightData,
    tags: ['insight', 'agent_thinking', category],
    importance: confidence > highConfidenceThreshold ? 'high' : 'medium',
  });

  // Calculate personality impact
  const personalityImpact = calculatePersonalityImpact(category, confidence);

  // Get storage metrics
  const totalInsights = await countInsights(db);
  const categoryDistribution = await getCategoryDistribution(db);
  const relatedMemories = await countRelatedMemories(db, relatedTopic);

  return {
    id: insightId,
    stored: true,
    personalityImpact,
    relatedMemories,
    storageMetrics: {
      totalInsights: totalInsights + 1,
      categoryDistribution,
    },
  };
}

/**
 * Generate tags for an insight based on content and metadata
 */
function generateInsightTags(content: string, category: string, relatedTopic?: string): string[] {
  const baseTags = ['insight', category];

  if (relatedTopic) {
    baseTags.push(relatedTopic.toLowerCase().replace(/\s+/g, '_'));
  }

  // Extract key terms (simplified)
  const words = content.toLowerCase().split(/\s+/);
  const keyWords = words.filter(word => word.length > 4).slice(0, 3);

  return [...baseTags, ...keyWords];
}

/**
 * Calculate how an insight affects personality metrics
 */
function calculatePersonalityImpact(category: string, confidence: number): InsightStorageResult['personalityImpact'] {
  const categoryStrengths: Record<string, number> = {
    eureka_moment: 0.8,
    pattern_weaving: 0.6,
    mirror_gazing: 0.9,
    knowledge_crystallization: 0.7,
    behavior_archaeology: 0.5,
    existential_pondering: 0.4,
  };

  const baseStrength = categoryStrengths[category] || 0.5;
  const learningRateChange = baseStrength * confidence * 0.1;

  return {
    learningRateChange,
    categoryStrengthUpdate: `${category} strength increased by ${(baseStrength * confidence * 100).toFixed(1)}%`,
    confidenceImpact: confidence * 0.05,
  };
}

/**
 * Count total insights stored in the system
 */
async function countInsights(db: ConsciousnessPrismaService): Promise<number> {
  try {
    const memories = await db.searchMemories('', ['insight'], undefined);
    return memories.length;
  } catch {
    return 0;
  }
}

/**
 * Get distribution of insights by category
 */
async function getCategoryDistribution(db: ConsciousnessPrismaService): Promise<Record<string, number>> {
  try {
    const insights = await db.searchMemories('', ['insight'], undefined);
    const distribution: Record<string, number> = {};

    for (const insight of insights) {
      const content = insight.content as Insight;
      if (content.category) {
        distribution[content.category] = (distribution[content.category] || 0) + 1;
      }
    }

    return distribution;
  } catch {
    return {};
  }
}

/**
 * Count memories related to a specific topic
 */
async function countRelatedMemories(db: ConsciousnessPrismaService, relatedTopic?: string): Promise<number> {
  if (!relatedTopic) return 0;

  try {
    const memories = await db.searchMemories(relatedTopic, [], undefined);
    return memories.length;
  } catch {
    return 0;
  }
}
