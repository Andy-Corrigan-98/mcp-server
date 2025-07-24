import { InputValidator } from '../../../validation/index.js';
import { ConceptPair, ConnectionHypothesis } from '../../../tools/daydreaming/types.js';
import { generateConnectionHypothesis } from './generate-hypothesis.js';

const MAX_INPUT_LENGTH = 200;

/**
 * Explore connection between two concepts
 */
export async function exploreConnection(args: Record<string, unknown>): Promise<{ hypothesis: ConnectionHypothesis }> {
  const concept1 = InputValidator.sanitizeString(args.concept1 as string, MAX_INPUT_LENGTH);
  const concept2 = InputValidator.sanitizeString(args.concept2 as string, MAX_INPUT_LENGTH);
  const explorationDepth = (args.exploration_depth as string) || 'moderate';
  const context = args.context as string;

  // Create a concept pair
  const conceptPair: ConceptPair = {
    concept1: {
      entity: concept1,
      type: 'manual',
      source: 'recent_conversation',
    },
    concept2: {
      entity: concept2,
      type: 'manual',
      source: 'recent_conversation',
    },
    samplingReason: `Manual exploration${context ? ` - ${context}` : ''}`,
    sampledAt: new Date(),
  };

  const hypothesis = await generateConnectionHypothesis(conceptPair, explorationDepth);

  return { hypothesis };
}
