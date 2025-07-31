import { ConnectionEvaluation } from '../daydreaming/types.js';
import { evaluateInsightCore } from './evaluate-insight-core.js';
import { InputValidator } from '../core/validation/index.js';

const MAX_HYPOTHESIS_LENGTH = 1000;
const MAX_INPUT_LENGTH = 200;

/**
 * Evaluate a connection hypothesis for value, novelty, and plausibility
 * Now uses the new functional architecture with shared GenAI infrastructure
 */
export async function evaluateInsight(args: Record<string, unknown>): Promise<{ evaluation: ConnectionEvaluation }> {
  // Extract and validate parameters
  const concept1 = InputValidator.sanitizeString(args.concept1 as string, MAX_INPUT_LENGTH);
  const concept2 = InputValidator.sanitizeString(args.concept2 as string, MAX_INPUT_LENGTH);
  const hypothesis = InputValidator.sanitizeString(args.hypothesis as string, MAX_HYPOTHESIS_LENGTH);
  const explorationContext = args.exploration_context as string;

  // Delegate to the core implementation
  const evaluation = await evaluateInsightCore(concept1, concept2, hypothesis, explorationContext);
  return { evaluation };
}
