import { ConceptPair, ConnectionHypothesis } from '../daydreaming/types.js';
import { executeReasoningOperation } from '../../reasoning/index.js';

const SURFACE_THOUGHTS = 3;
const DEEP_THOUGHTS = 8;
const MODERATE_THOUGHTS = 5;
const DEFAULT_CONFIDENCE = 0.7;

/**
 * Generate a connection hypothesis between concepts using sequential thinking
 */
export async function generateConnectionHypothesis(pair: ConceptPair, depth: string): Promise<ConnectionHypothesis> {
  // Use sequential thinking to explore the connection
  const maxThoughts = depth === 'surface' ? SURFACE_THOUGHTS : depth === 'deep' ? DEEP_THOUGHTS : MODERATE_THOUGHTS;

  const prompt = `Explore potential connections between "${pair.concept1.entity}" and "${pair.concept2.entity}". Consider unexpected relationships, shared patterns, or novel insights that might link these concepts.`;

  // Start sequential thinking
  const thinkingResult = (await executeReasoningOperation('sequential_thinking', {
    thought: prompt,
    thought_number: 1,
    total_thoughts: maxThoughts,
    next_thought_needed: true,
  })) as { summary?: string; thought?: string; sessionId?: string };

  // Extract the hypothesis and steps
  const hypothesis = thinkingResult.summary || thinkingResult.thought || 'No clear connection identified';
  const explorationSteps = [thinkingResult.thought].filter((step): step is string => step !== undefined);

  return {
    conceptPair: pair,
    hypothesis,
    explorationSteps,
    confidence: DEFAULT_CONFIDENCE,
    noveltyScore: 0.0, // Will be calculated during evaluation
    generatedAt: new Date(),
    thinkingSessionId: thinkingResult.sessionId,
  };
}








