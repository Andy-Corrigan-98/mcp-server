/**
 * Sequential Thinking Module
 * Single responsibility: Orchestrate AI-powered sequential reasoning
 * Uses shared GenAI infrastructure and specialized reasoning modules
 */

import { getGenAIModel, SecurityGuard, validateNumber, validateBoolean } from '../shared/index.js';
import { buildReasoningPrompt, ReasoningPromptContext } from './prompt-builder.js';
import {
  processReasoningResponse,
  createFallbackReasoningResult,
  ProcessedReasoningResult,
} from './response-processor.js';

/**
 * Arguments for sequential thinking
 */
export interface SequentialThinkingArgs {
  thought: string;
  next_thought_needed: boolean;
  thought_number: number;
  total_thoughts: number;
  is_revision?: boolean;
  revises_thought?: number;
  branch_from_thought?: number;
  branch_id?: string;
  needs_more_thoughts?: boolean;
}

/**
 * Enhanced sequential thinking powered by Google GenAI
 * Implementation using shared infrastructure
 */
export const sequentialThinking = async (args: SequentialThinkingArgs): Promise<ProcessedReasoningResult> => {
  try {
    // Get GenAI model using shared infrastructure
    const model = await getGenAIModel();

    // Validate input parameters using shared validation
    const thoughtNumber = validateNumber(args.thought_number, 1);
    const totalThoughts = validateNumber(args.total_thoughts, 1);
    const nextThoughtNeeded = validateBoolean(args.next_thought_needed);
    const isRevision = validateBoolean(args.is_revision, false);
    const branchId = args.branch_id ? String(args.branch_id) : undefined;
    const revisesThought = args.revises_thought ? validateNumber(args.revises_thought, 1) : undefined;
    const branchFromThought = args.branch_from_thought ? validateNumber(args.branch_from_thought, 1) : undefined;

    // Security check on thought input using shared SecurityGuard
    const securityCheck = SecurityGuard.validateInput(args.thought);
    if (!securityCheck.safe) {
      console.warn('Security violation in sequential thinking:', securityCheck.violations);

      // Return safe fallback response
      return await createFallbackReasoningResult(
        'Cannot process potentially unsafe content. Please rephrase your thinking step.',
        { thoughtNumber, totalThoughts, nextThoughtNeeded, branchId }
      );
    }

    // Build context-aware prompt using specialized prompt builder
    const promptContext: ReasoningPromptContext = {
      thought: args.thought,
      thoughtNumber,
      totalThoughts,
      nextThoughtNeeded,
      isRevision,
      branchId,
      revisesThought,
      branchFromThought,
    };

    const promptResult = await buildReasoningPrompt(promptContext);

    // Handle prompt length validation
    if (!promptResult.valid) {
      console.warn(`Reasoning prompt too long (${promptResult.length}), using truncated version`);

      if (promptResult.truncated) {
        const truncatedResult = await buildReasoningPrompt({
          ...promptContext,
          thought: 'Analysis truncated due to length. Original thought was too long.',
        });

        if (!truncatedResult.valid) {
          return await createFallbackReasoningResult('Thought content too complex for analysis.', {
            thoughtNumber,
            totalThoughts,
            nextThoughtNeeded,
            branchId,
          });
        }

        promptResult.prompt = truncatedResult.prompt;
      }
    }

    // Generate AI reasoning using shared GenAI model
    const result = await model.generateContent(promptResult.prompt);
    const response = await result.response;
    const reasoningOutput = response.text();

    // Process AI response using specialized response processor
    return await processReasoningResponse(reasoningOutput, {
      thoughtNumber,
      totalThoughts,
      nextThoughtNeeded,
      branchId,
    });
  } catch (error) {
    console.error('Functional sequential thinking error:', error);

    // Create fallback response with error context
    return await createFallbackReasoningResult(
      `Failed to generate AI reasoning: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        thoughtNumber: args.thought_number || 1,
        totalThoughts: args.total_thoughts || 1,
        nextThoughtNeeded: false,
        branchId: args.branch_id,
      }
    );
  }
};








