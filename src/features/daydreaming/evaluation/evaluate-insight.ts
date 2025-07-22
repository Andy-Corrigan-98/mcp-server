import { InputValidator } from '../../../validation/index.js';
import { ConnectionHypothesis, ConnectionEvaluation } from '../../../tools/daydreaming/types.js';
import { evaluateConnectionHypothesis } from './evaluate-hypothesis.js';

const MAX_HYPOTHESIS_LENGTH = 1000;
const MAX_INPUT_LENGTH = 200;
const DEFAULT_CONFIDENCE = 0.7;

/**
 * Evaluate a connection hypothesis for value, novelty, and plausibility
 */
export async function evaluateInsight(args: Record<string, unknown>): Promise<{ evaluation: ConnectionEvaluation }> {
  const hypothesisText = InputValidator.sanitizeString(args.hypothesis as string, MAX_HYPOTHESIS_LENGTH);
  const concept1 = InputValidator.sanitizeString(args.concept1 as string, MAX_INPUT_LENGTH);
  const concept2 = InputValidator.sanitizeString(args.concept2 as string, MAX_INPUT_LENGTH);
  const explorationContext = args.exploration_context as string;

  // Create a temporary hypothesis object for evaluation
  const hypothesis: ConnectionHypothesis = {
    conceptPair: {
      concept1: { entity: concept1, type: 'manual', source: 'recent_conversation' },
      concept2: { entity: concept2, type: 'manual', source: 'recent_conversation' },
      samplingReason: 'Manual evaluation',
      sampledAt: new Date(),
    },
    hypothesis: hypothesisText,
    explorationSteps: explorationContext ? [explorationContext] : [],
    confidence: DEFAULT_CONFIDENCE,
    noveltyScore: 0.0, // Will be calculated in evaluation
    generatedAt: new Date(),
  };

  const evaluation = await evaluateConnectionHypothesis(hypothesis);

  return { evaluation };
}
