import { ConnectionHypothesis, ConnectionEvaluation } from '../../../tools/daydreaming/types.js';
import { ConfigurationService } from '../../../db/configuration-service.js';
import { functionalEvaluateInsight } from './functional-evaluate-insight.js';
import { estimateConceptDistance } from './concept-distance.js';
import { loadDaydreamingConfig } from '../config/load-config.js';

const WORD_COUNT_DIVISOR = 50;
const CONCEPT_DISTANCE_MULTIPLIER = 0.7;
const CONCEPT_DISTANCE_OFFSET = 0.2;
const PLAUSIBILITY_BASE = 0.8;
const PLAUSIBILITY_MULTIPLIER = 0.3;
const MIN_PLAUSIBILITY = 0.2;
const VALUE_MULTIPLIER = 0.6;
const SPECIFIC_EXAMPLES_BONUS = 0.2;
const VALUE_BASE = 0.3;
const MAX_NOVELTY = 0.9;
const MAX_VALUE = 0.8;
const ACTIONABILITY_RANGE = 0.4;
const ACTIONABILITY_BASE_HIGH = 0.5;
const ACTIONABILITY_BASE_LOW = 0.2;
const SCORE_DIVISOR = 4;

/**
 * Evaluate a connection hypothesis using GenAI or heuristic fallback
 * Now uses the new functional architecture with shared GenAI infrastructure
 */
export async function evaluateConnectionHypothesis(hypothesis: ConnectionHypothesis): Promise<ConnectionEvaluation> {
  const configService = ConfigurationService.getInstance();

  // Check if GenAI evaluation is enabled
  const useGenAI = await configService.getBoolean('daydreaming.use_genai_evaluation', true);

  if (useGenAI) {
    try {
      console.log('🧠 Using functional GenAI evaluation for daydreaming connection hypothesis...');

      // Use the new functional evaluation approach
      const evaluation = await functionalEvaluateInsight(
        hypothesis.conceptPair.concept1.entity,
        hypothesis.conceptPair.concept2.entity,
        hypothesis.hypothesis,
        hypothesis.explorationSteps.join(' ')
      );

      return evaluation;
    } catch (error) {
      console.warn('Functional GenAI evaluation failed, falling back to heuristic evaluation:', error);
      // Fall through to heuristic evaluation
    }
  }

  // Fallback: Improved heuristic evaluation
  return evaluateUsingHeuristics(hypothesis);
}

/**
 * Heuristic evaluation when GenAI is unavailable
 */
async function evaluateUsingHeuristics(hypothesis: ConnectionHypothesis): Promise<ConnectionEvaluation> {
  const config = await loadDaydreamingConfig();

  const wordCount = hypothesis.hypothesis.split(' ').length;
  const conceptDistance = estimateConceptDistance(
    hypothesis.conceptPair.concept1.entity,
    hypothesis.conceptPair.concept2.entity
  );
  const hasSpecificExamples = /\b(example|such as|like|including)\b/i.test(hypothesis.hypothesis);
  const hasActionWords = /\b(could|might|should|would|enable|allow|lead to|result in)\b/i.test(hypothesis.hypothesis);

  // Heuristic scoring with multiple factors
  const novelty = Math.min(MAX_NOVELTY, conceptDistance * CONCEPT_DISTANCE_MULTIPLIER + CONCEPT_DISTANCE_OFFSET);
  const plausibility = Math.max(MIN_PLAUSIBILITY, PLAUSIBILITY_BASE - conceptDistance * PLAUSIBILITY_MULTIPLIER);
  const value = Math.min(
    MAX_VALUE,
    (wordCount / WORD_COUNT_DIVISOR) * VALUE_MULTIPLIER +
      (hasSpecificExamples ? SPECIFIC_EXAMPLES_BONUS : 0) +
      VALUE_BASE
  );
  const actionability = hasActionWords
    ? Math.random() * ACTIONABILITY_RANGE + ACTIONABILITY_BASE_HIGH
    : Math.random() * ACTIONABILITY_RANGE + ACTIONABILITY_BASE_LOW;

  const overallScore = (novelty + plausibility + value + actionability) / SCORE_DIVISOR;

  const shouldStore =
    novelty >= config.noveltyThreshold &&
    plausibility >= config.plausibilityThreshold &&
    value >= config.valueThreshold;

  return {
    hypothesis,
    novelty,
    plausibility,
    value,
    actionability,
    overallScore,
    shouldStore,
    reason: shouldStore
      ? `High-value insight: novelty=${novelty.toFixed(2)}, plausibility=${plausibility.toFixed(2)}, value=${value.toFixed(2)}`
      : `Below thresholds: novelty=${novelty.toFixed(2)} (need ${config.noveltyThreshold}), plausibility=${plausibility.toFixed(2)} (need ${config.plausibilityThreshold}), value=${value.toFixed(2)} (need ${config.valueThreshold})`,
    evaluatedAt: new Date(),
    genAIMetadata: {
      evaluatedWithAI: false,
      fallbackReason: 'GenAI evaluation disabled or failed, used heuristic fallback',
    },
  };
}
