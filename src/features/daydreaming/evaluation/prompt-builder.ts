/**
 * Daydreaming Evaluation Prompt Builder Module
 * Single responsibility: Construct evaluation prompts for concept connection assessment
 */

import { validatePromptLength } from '../../reasoning/shared/index.js';
import { ConnectionHypothesis } from '../../../tools/daydreaming/types.js';

/**
 * Result of evaluation prompt building
 */
export interface EvaluationPromptResult {
  prompt: string;
  valid: boolean;
  length: number;
  maxLength: number;
  truncated?: string;
}

/**
 * Build sophisticated evaluation prompt for Gemini
 */
export const buildEvaluationPrompt = async (hypothesis: ConnectionHypothesis): Promise<EvaluationPromptResult> => {
  const { conceptPair, hypothesis: connectionHypothesis, explorationSteps } = hypothesis;

  const prompt = `You are an expert at evaluating creative insights and conceptual connections. Please analyze this connection hypothesis across four key dimensions.

CONNECTION TO EVALUATE:
Concept 1: "${conceptPair.concept1.entity}" (${conceptPair.concept1.type})
Concept 2: "${conceptPair.concept2.entity}" (${conceptPair.concept2.type})

Connection Hypothesis: ${connectionHypothesis}

Exploration Context: ${explorationSteps.join(' → ')}

EVALUATION CRITERIA:

1. NOVELTY (0.0-1.0): How unexpected, surprising, or original is this connection?
   - 0.0-0.3: Obvious, conventional, well-known connection
   - 0.4-0.6: Somewhat creative, has interesting aspects
   - 0.7-1.0: Highly original, surprising, breakthrough insight

2. PLAUSIBILITY (0.0-1.0): How logical, coherent, and well-reasoned is this connection?
   - 0.0-0.3: Illogical, contradictory, nonsensical
   - 0.4-0.6: Some logical basis, partially convincing
   - 0.7-1.0: Highly logical, well-reasoned, convincing

3. VALUE (0.0-1.0): How useful, interesting, or practically relevant is this insight?
   - 0.0-0.3: Not particularly useful or interesting
   - 0.4-0.6: Moderately interesting, some potential value
   - 0.7-1.0: Highly valuable, could lead to important insights

4. ACTIONABILITY (0.0-1.0): Does this connection suggest concrete next steps or applications?
   - 0.0-0.3: Abstract with no clear applications
   - 0.4-0.6: Some potential applications, needs development
   - 0.7-1.0: Clear actionable implications, ready to pursue

RESPONSE FORMAT:
Please respond with a JSON object containing your detailed evaluation:

{
  "novelty": 0.75,
  "novelty_explanation": "Why this score for novelty",
  "plausibility": 0.65,
  "plausibility_explanation": "Why this score for plausibility", 
  "value": 0.80,
  "value_explanation": "Why this score for value",
  "actionability": 0.55,
  "actionability_explanation": "Why this score for actionability",
  "overall_assessment": "Summary of the connection's strengths and weaknesses",
  "key_insights": ["Specific insights extracted from this connection"],
  "suggested_applications": ["Concrete ways this could be applied or explored"],
  "improvement_suggestions": ["How this connection could be strengthened"],
  "confidence": 0.85
}

Please provide thoughtful, nuanced evaluation based on the actual content:`;

  // Validate prompt length using shared infrastructure
  const validation = await validatePromptLength(prompt);

  return {
    prompt,
    valid: validation.valid,
    length: validation.length,
    maxLength: validation.maxLength,
    truncated: validation.truncated,
  };
};
