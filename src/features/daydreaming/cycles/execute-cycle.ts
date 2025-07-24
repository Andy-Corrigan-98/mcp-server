import {
  DaydreamingCycleResult,
  ConnectionHypothesis,
  ConnectionEvaluation,
  SerendipitousInsight,
} from '../../../tools/daydreaming/types.js';
import { GuidGenerator } from '../../../utils/guid.js';
import { loadDaydreamingConfig } from '../config/load-config.js';
import { sampleConceptPairs } from '../sampling/sample-concepts.js';
import { generateConnectionHypothesis } from '../exploration/generate-hypothesis.js';
import { evaluateConnectionHypothesis } from '../evaluation/evaluate-hypothesis.js';
import { storeSerendipitousInsight } from '../storage/store-insight.js';
import { getDaydreamingContext } from './context.js';

/**
 * Execute a complete Day-Dreaming Loop cycle
 */
export async function daydreamCycle(args: Record<string, unknown>): Promise<DaydreamingCycleResult> {
  const cycleId = GuidGenerator.generateDaydreamCycleId();
  const startTime = new Date();
  const config = await loadDaydreamingConfig();

  // Check if daydreaming is enabled and conditions are met
  if (!config.enabled) {
    throw new Error('Day-Dreaming Loop is disabled');
  }

  const context = await getDaydreamingContext();
  if (context.currentCognitiveLoad > config.maxCognitiveLoad) {
    throw new Error(`Cognitive load too high (${context.currentCognitiveLoad}) for daydreaming`);
  }

  const maxConceptPairs = Math.min(
    (args.max_concept_pairs as number) || config.maxConceptPairsPerCycle,
    config.maxConceptPairsPerCycle
  );
  const focusArea = args.focus_area as string;
  const explorationDepth = (args.exploration_depth as string) || 'moderate';

  // Track results
  const hypothesesGenerated: ConnectionHypothesis[] = [];
  const evaluationsCompleted: ConnectionEvaluation[] = [];
  const insightsStored: SerendipitousInsight[] = [];
  let totalThinkingSteps = 0;

  // Sample concept pairs
  const conceptPairs = await sampleConceptPairs(maxConceptPairs, focusArea);

  // Explore each concept pair
  for (const pair of conceptPairs) {
    try {
      // Generate connection hypothesis
      const hypothesis = await generateConnectionHypothesis(pair, explorationDepth);
      hypothesesGenerated.push(hypothesis);
      totalThinkingSteps += hypothesis.explorationSteps.length;

      // Evaluate the hypothesis
      const evaluation = await evaluateConnectionHypothesis(hypothesis);
      evaluationsCompleted.push(evaluation);

      // Store valuable insights
      if (evaluation.shouldStore) {
        const insight = await storeSerendipitousInsight(evaluation);
        insightsStored.push(insight);
      }
    } catch (error) {
      console.warn(`Failed to process concept pair ${pair.concept1.entity} <-> ${pair.concept2.entity}:`, error);
    }
  }

  const endTime = new Date();

  const result: DaydreamingCycleResult = {
    cycleId,
    startTime,
    endTime,
    conceptPairsExplored: conceptPairs,
    hypothesesGenerated,
    evaluationsCompleted,
    insightsStored,
    performance: {
      totalThinkingSteps,
      averageConfidence:
        hypothesesGenerated.length > 0
          ? hypothesesGenerated.reduce((sum, h) => sum + h.confidence, 0) / hypothesesGenerated.length
          : 0,
      storageRate: conceptPairs.length > 0 ? (insightsStored.length / conceptPairs.length) * 100 : 0, // eslint-disable-line no-magic-numbers
    },
    nextCycleRecommendation: {
      suggestedInterval: config.samplingIntervalMs,
      focusAreas: focusArea ? [focusArea] : [],
    },
  };

  return result;
}
