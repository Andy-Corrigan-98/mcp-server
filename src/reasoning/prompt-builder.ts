/**
 * Reasoning Prompt Builder Module
 * Single responsibility: Construct sophisticated reasoning prompts for Gemini
 */

import { validateThoughtInput, validatePromptLength } from '../shared/index.js';

/**
 * Interface for reasoning prompt context
 */
export interface ReasoningPromptContext {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  isRevision?: boolean;
  branchId?: string;
  revisesThought?: number;
  branchFromThought?: number;
}

/**
 * Result of prompt building with validation
 */
export interface PromptBuildResult {
  prompt: string;
  valid: boolean;
  length: number;
  maxLength: number;
  truncated?: string;
}

/**
 * Build sophisticated reasoning prompt for Gemini
 */
export const buildReasoningPrompt = async (context: ReasoningPromptContext): Promise<PromptBuildResult> => {
  const {
    thought,
    thoughtNumber,
    totalThoughts,
    nextThoughtNeeded,
    isRevision,
    branchId,
    revisesThought,
    branchFromThought,
  } = context;

  // Validate thought input
  const validatedThought = await validateThoughtInput(thought);

  const prompt = `You are an advanced reasoning system. Analyze this problem step-by-step with deep thinking.

CURRENT THINKING STEP: ${thoughtNumber} of ${totalThoughts}
${isRevision ? `REVISION: This revises thinking step ${revisesThought}` : ''}
${branchId ? `BRANCH: Exploring alternative path "${branchId}" from step ${branchFromThought}` : ''}

PROBLEM/THOUGHT TO ANALYZE:
${validatedThought}

REASONING REQUIREMENTS:
1. Provide deep, structured analysis of this thinking step
2. Generate insights about the problem and potential solutions
3. Identify patterns, connections, and underlying principles
4. ${nextThoughtNeeded ? 'Suggest what the next thinking step should focus on' : 'Provide conclusive analysis and recommendations'}
5. Consider alternative approaches and potential pitfalls
6. Extract key hypotheses that can be tested or verified

RESPONSE FORMAT:
Please structure your response as JSON with these fields:
{
  "analysis": "Deep analysis of the current thinking step",
  "insights": ["List of key insights discovered"],
  "hypothesis": "Primary hypothesis or theory emerging",
  "verification": "How this hypothesis could be tested/verified", 
  "nextSteps": ["Specific recommendations for next steps"],
  "alternatives": ["Alternative approaches to consider"],
  "conclusion": "Summary conclusion and recommendations",
  "confidence": 0.85
}

Think deeply and provide sophisticated reasoning:`;

  // Validate prompt length
  const validation = await validatePromptLength(prompt);

  return {
    prompt,
    valid: validation.valid,
    length: validation.length,
    maxLength: validation.maxLength,
    truncated: validation.truncated,
  };
};
