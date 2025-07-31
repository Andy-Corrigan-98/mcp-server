/**
 * Fallback Evaluation Module
 * Single responsibility: Provide heuristic evaluation when AI evaluation fails
 */

import { ConnectionHypothesis, ConnectionEvaluation } from '../daydreaming/types.js';
import { getModelName } from '../../reasoning/shared/index.js';

// Constants for heuristic evaluation
const MIN_DISTANCE = 0.1;
const NOVELTY_MULTIPLIER = 0.7;
const NOVELTY_BASE = 0.2;
const PLAUSIBILITY_MULTIPLIER = 0.3;
const VALUE_MULTIPLIER = 0.6;
const VALUE_BASE = 0.3;
const VALUE_DIVISOR = 50;
const DEFAULT_THRESHOLD = 0.6;

/**
 * Create fallback evaluation when AI evaluation fails
 */
export const createFallbackEvaluation = async (hypothesis: ConnectionHypothesis): Promise<ConnectionEvaluation> => {
  // Use basic heuristics as fallback instead of random numbers
  const wordCount = hypothesis.hypothesis.split(' ').length;
  const conceptDistance = estimateConceptDistance(
    hypothesis.conceptPair.concept1.entity,
    hypothesis.conceptPair.concept2.entity
  );

  // Basic heuristic scoring
  const novelty = Math.min(0.9, conceptDistance * NOVELTY_MULTIPLIER + NOVELTY_BASE); // Cross-domain = more novel
  const plausibility = Math.max(0.2, 0.8 - conceptDistance * PLAUSIBILITY_MULTIPLIER); // Closer concepts = more plausible
  const value = Math.min(0.8, (wordCount / VALUE_DIVISOR) * VALUE_MULTIPLIER + VALUE_BASE); // Longer hypotheses might be more developed
  const actionability = Math.random() * 0.4 + 0.3; // Still random for this one

  const overallScore = (novelty + plausibility + value + actionability) / 4;
  const modelName = await getModelName();

  return {
    hypothesis,
    novelty,
    plausibility,
    value,
    actionability,
    overallScore,
    shouldStore: overallScore > DEFAULT_THRESHOLD,
    reason: 'Fallback evaluation used due to AI evaluation failure',
    evaluatedAt: new Date(),
    genAIMetadata: {
      evaluatedWithAI: false,
      fallbackReason: 'AI evaluation failed, used heuristic scoring',
      model: modelName,
      noveltyExplanation: `Heuristic scoring based on concept distance (${conceptDistance.toFixed(2)})`,
      plausibilityExplanation: 'Heuristic scoring based on concept similarity',
      valueExplanation: `Heuristic scoring based on hypothesis length (${wordCount} words)`,
      actionabilityExplanation: 'Random scoring as placeholder',
      keyInsights: ['Fallback evaluation - manual review recommended'],
      suggestedApplications: ['Review connection manually for actual applications'],
      improvementSuggestions: ['Retry with AI evaluation when system is available'],
      aiConfidence: 0.3,
    },
  };
};

/**
 * Simple heuristic to estimate conceptual distance
 */
const estimateConceptDistance = (concept1: string, concept2: string): number => {
  // Very basic heuristic - could be improved with actual semantic analysis
  const words1 = concept1.toLowerCase().split(/\s+/);
  const words2 = concept2.toLowerCase().split(/\s+/);

  // Check for word overlap
  const overlap = words1.filter(word => words2.includes(word)).length;
  const totalWords = Math.max(words1.length, words2.length);

  // Distance is inverse of overlap ratio
  return Math.max(MIN_DISTANCE, 1 - overlap / totalWords);
};








