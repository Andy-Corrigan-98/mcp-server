import { ConnectionEvaluation, SerendipitousInsight } from '../daydreaming/types.js';
import { GuidGenerator } from '../core/utils/guid.js';
import { executeMemoryOperation } from '../../memory/index.js';

/**
 * Store a serendipitous insight in memory with structured metadata
 */
export async function storeSerendipitousInsight(evaluation: ConnectionEvaluation): Promise<SerendipitousInsight> {
  const insight: SerendipitousInsight = {
    id: GuidGenerator.generateSerendipitousInsightId(),
    evaluation,
    insight: evaluation.hypothesis.hypothesis,
    implications: [], // Would extract from thinking steps
    suggestedActions: [], // Would derive from evaluation
    tags: [
      'daydreaming',
      'serendipitous_insight',
      evaluation.hypothesis.conceptPair.concept1.entity,
      evaluation.hypothesis.conceptPair.concept2.entity,
    ],
    relatedMemories: [],
    storedAt: new Date(),
  };

  // Store in memory system
  await executeMemoryOperation('memory_store', {
    key: `daydream_insight_${insight.id}`,
    content: insight,
    importance: evaluation.overallScore > 0.8 ? 'high' : evaluation.overallScore > 0.6 ? 'medium' : 'low', // eslint-disable-line no-magic-numbers
    tags: insight.tags,
  });

  return insight;
}








