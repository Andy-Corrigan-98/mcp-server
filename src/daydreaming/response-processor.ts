/**
 * Daydreaming Evaluation Response Processor Module
 * Single responsibility: Parse AI evaluation responses into structured ConnectionEvaluation
 */

import {
  parseAIResponse,
  validateScore,
  cleanTextContent,
  parseStringArray,
  getModelName,
} from '../../reasoning/shared/index.js';
import { ConnectionHypothesis, ConnectionEvaluation } from '../daydreaming/types.js';
import { ConfigurationService } from '../core/db/configuration-service.js';

/**
 * Interface for AI evaluation response structure
 */
export interface EvaluationResponse {
  novelty: number;
  novelty_explanation: string;
  plausibility: number;
  plausibility_explanation: string;
  value: number;
  value_explanation: string;
  actionability: number;
  actionability_explanation: string;
  overall_assessment: string;
  key_insights: string[];
  suggested_applications: string[];
  improvement_suggestions: string[];
  confidence: number;
}

/**
 * Parse AI evaluation response into structured ConnectionEvaluation
 */
export const processEvaluationResponse = async (
  aiOutput: string,
  hypothesis: ConnectionHypothesis
): Promise<ConnectionEvaluation> => {
  // Parse AI response with fallback handling
  const parsed = parseAIResponse<EvaluationResponse>(
    aiOutput,
    {
      novelty: 0.5,
      novelty_explanation: '',
      plausibility: 0.5,
      plausibility_explanation: '',
      value: 0.5,
      value_explanation: '',
      actionability: 0.5,
      actionability_explanation: '',
      overall_assessment: 'AI evaluation completed',
      key_insights: [],
      suggested_applications: [],
      improvement_suggestions: [],
      confidence: 0.5,
    },
    ['novelty', 'plausibility', 'value', 'actionability'] // Required fields
  );

  // Extract and validate metrics
  const novelty = validateScore(parsed.novelty, 0.5);
  const plausibility = validateScore(parsed.plausibility, 0.5);
  const value = validateScore(parsed.value, 0.5);
  const actionability = validateScore(parsed.actionability, 0.5);

  // Calculate overall score
  const overallScore = (novelty + plausibility + value + actionability) / 4;

  // Determine if should store based on thresholds
  const shouldStore = await shouldStoreInsight(novelty, plausibility, value);

  // Get current model name
  const modelName = await getModelName();

  return {
    hypothesis,
    novelty,
    plausibility,
    value,
    actionability,
    overallScore,
    shouldStore,
    reason: cleanTextContent(parsed.overall_assessment, 500),
    evaluatedAt: new Date(),

    // Additional AI insights
    genAIMetadata: {
      noveltyExplanation: cleanTextContent(parsed.novelty_explanation, 500),
      plausibilityExplanation: cleanTextContent(parsed.plausibility_explanation, 500),
      valueExplanation: cleanTextContent(parsed.value_explanation, 500),
      actionabilityExplanation: cleanTextContent(parsed.actionability_explanation, 500),
      keyInsights: parseStringArray(parsed.key_insights, []).map(insight => cleanTextContent(insight, 200)),
      suggestedApplications: parseStringArray(parsed.suggested_applications, []).map(app => cleanTextContent(app, 200)),
      improvementSuggestions: parseStringArray(parsed.improvement_suggestions, []).map(suggestion =>
        cleanTextContent(suggestion, 200)
      ),
      aiConfidence: validateScore(parsed.confidence, 0.5),
      model: modelName,
      evaluatedWithAI: true,
    },
  };
};

/**
 * Determine if insight should be stored based on configured thresholds
 */
const shouldStoreInsight = async (novelty: number, plausibility: number, value: number): Promise<boolean> => {
  const config = ConfigurationService.getInstance();

  const noveltyThreshold = await config.getNumber('daydreaming.novelty_threshold', 0.6);
  const plausibilityThreshold = await config.getNumber('daydreaming.plausibility_threshold', 0.5);
  const valueThreshold = await config.getNumber('daydreaming.value_threshold', 0.6);

  return novelty >= noveltyThreshold && plausibility >= plausibilityThreshold && value >= valueThreshold;
};








