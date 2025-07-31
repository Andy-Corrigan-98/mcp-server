/**
 * Insight Evaluation Core Module
 * Single responsibility: Orchestrate AI-powered insight evaluation
 * Uses shared GenAI infrastructure and specialized evaluation modules
 */

import { getGenAIModel } from '../../reasoning/shared/index.js';
import { ConnectionHypothesis, ConnectionEvaluation } from '../daydreaming/types.js';
import { buildEvaluationPrompt } from './prompt-builder.js';
import { processEvaluationResponse } from './response-processor.js';
import { createFallbackEvaluation } from './fallback-evaluator.js';

/**
 * Intelligent evaluation of connection hypotheses using Gemini
 * Core implementation using shared infrastructure
 */
export const evaluateInsightCore = async (
  concept1: string,
  concept2: string,
  hypothesis: string,
  explorationContext?: string
): Promise<ConnectionEvaluation> => {
  try {
    // Get GenAI model using shared infrastructure
    const model = await getGenAIModel();

    // Create hypothesis object
    const connectionHypothesis: ConnectionHypothesis = {
      conceptPair: {
        concept1: { entity: concept1, type: 'entity', source: 'recent_conversation' },
        concept2: { entity: concept2, type: 'entity', source: 'recent_conversation' },
        samplingReason: 'Manual evaluation request',
        sampledAt: new Date(),
      },
      hypothesis,
      explorationSteps: explorationContext ? [explorationContext] : [],
      confidence: 0.5,
      noveltyScore: 0.5,
      generatedAt: new Date(),
    };

    // Build evaluation prompt using specialized prompt builder
    const promptResult = await buildEvaluationPrompt(connectionHypothesis);

    // Handle prompt length validation
    if (!promptResult.valid) {
      console.warn(`Evaluation prompt too long (${promptResult.length}), using fallback evaluation`);
      return await createFallbackEvaluation(connectionHypothesis);
    }

    // Generate AI evaluation using shared GenAI model
    const result = await model.generateContent(promptResult.prompt);
    const response = await result.response;
    const evaluationOutput = response.text();

    // Process AI response using specialized response processor
    return await processEvaluationResponse(evaluationOutput, connectionHypothesis);
  } catch (error) {
    console.error('Functional insight evaluation error:', error);

    // Create fallback evaluation with error context
    const fallbackHypothesis: ConnectionHypothesis = {
      conceptPair: {
        concept1: { entity: concept1, type: 'entity', source: 'recent_conversation' },
        concept2: { entity: concept2, type: 'entity', source: 'recent_conversation' },
        samplingReason: 'Manual evaluation request (fallback)',
        sampledAt: new Date(),
      },
      hypothesis,
      explorationSteps: explorationContext ? [explorationContext] : [],
      confidence: 0.5,
      noveltyScore: 0.5,
      generatedAt: new Date(),
    };

    return await createFallbackEvaluation(fallbackHypothesis);
  }
};
