/**
 * Reasoning Response Processor Module
 * Single responsibility: Parse AI reasoning responses into structured format
 */

import { parseAIResponse, validateScore, cleanTextContent, parseStringArray, getModelName } from '../shared/index.js';

/**
 * Interface for reasoning response structure
 */
export interface ReasoningResponse {
  analysis: string;
  insights: string[];
  hypothesis: string;
  verification: string;
  nextSteps: string[];
  alternatives: string[];
  conclusion: string;
  confidence: number;
}

/**
 * Interface for processed reasoning result
 */
export interface ProcessedReasoningResult {
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  branchId?: string;

  // AI-generated reasoning content
  analysis: string;
  insights: string[];
  hypothesis: string;
  verification: string;
  nextSteps: string[];
  alternatives: string[];
  conclusion: string;
  confidence: number;

  // Metadata
  aiPowered: boolean;
  timestamp: string;
  model: string;
  parsingSuccess: boolean;
  parsingError?: string;
}

/**
 * Process AI reasoning response into structured format
 */
export const processReasoningResponse = async (
  aiOutput: string,
  context: {
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    branchId?: string;
  }
): Promise<ProcessedReasoningResult> => {
  // Parse AI response with fallback handling
  const parsed = parseAIResponse<ReasoningResponse>(
    aiOutput,
    {
      analysis: 'AI analysis not parsed correctly',
      insights: [],
      hypothesis: 'No hypothesis identified',
      verification: 'Verification method unclear',
      nextSteps: [],
      alternatives: [],
      conclusion: 'Analysis incomplete',
      confidence: 0.5,
    },
    ['analysis', 'conclusion'] // Required fields
  );

  // Get current model name
  const modelName = await getModelName();

  return {
    thoughtNumber: context.thoughtNumber,
    totalThoughts: context.totalThoughts,
    nextThoughtNeeded: context.nextThoughtNeeded,
    branchId: context.branchId,

    // AI-generated reasoning content with validation
    analysis: cleanTextContent(parsed.analysis, 2000),
    insights: parseStringArray(parsed.insights, []).map(insight => cleanTextContent(insight, 500)),
    hypothesis: cleanTextContent(parsed.hypothesis, 1000),
    verification: cleanTextContent(parsed.verification, 1000),
    nextSteps: parseStringArray(parsed.nextSteps, []).map(step => cleanTextContent(step, 300)),
    alternatives: parseStringArray(parsed.alternatives, []).map(alt => cleanTextContent(alt, 300)),
    conclusion: cleanTextContent(parsed.conclusion, 1000),
    confidence: validateScore(parsed.confidence, 0.5),

    // Metadata
    aiPowered: true,
    timestamp: new Date().toISOString(),
    model: modelName,
    parsingSuccess: parsed.parsingSuccess,
    parsingError: parsed.parsingError,
  };
};

/**
 * Create fallback response when AI processing fails
 */
export const createFallbackReasoningResult = async (
  aiOutput: string,
  context: {
    thoughtNumber: number;
    totalThoughts: number;
    nextThoughtNeeded: boolean;
    branchId?: string;
  }
): Promise<ProcessedReasoningResult> => {
  const modelName = await getModelName();

  return {
    thoughtNumber: context.thoughtNumber,
    totalThoughts: context.totalThoughts,
    nextThoughtNeeded: context.nextThoughtNeeded,
    branchId: context.branchId,

    // Fallback content
    analysis: cleanTextContent(aiOutput, 2000),
    insights: ['AI reasoning generated but not structured'],
    hypothesis: 'Analysis provided without structured hypothesis',
    verification: 'Manual review required',
    nextSteps: ['Review analysis and determine next steps'],
    alternatives: ['Consider alternative approaches'],
    conclusion: 'Reasoning completed via AI model',
    confidence: 0.5,

    // Metadata
    aiPowered: true,
    timestamp: new Date().toISOString(),
    model: modelName,
    parsingSuccess: false,
    parsingError: 'Failed to parse structured reasoning response',
  };
};
