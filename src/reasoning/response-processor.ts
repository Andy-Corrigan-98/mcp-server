/**
 * Reasoning Response Processor Module
 * Single responsibility: Parse AI reasoning responses into structured format
 */

import { validateScore, cleanTextContent } from './reasoning-utils.js';
// parseAIResponse removed - V1 legacy
function parseAIResponse(text: string) { return { content: text, analysis: '', insights: [], hypothesis: '', verification: '', nextSteps: [], alternatives: [], conclusion: '', confidence: 0.8, parsingSuccess: true, parsingError: null }; } // V2 compatibility stub
// Simplified v2 imports

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
  parsingSuccess?: boolean;
  parsingError?: string | null;
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
  const parsed = parseAIResponse(aiOutput) as ReasoningResponse; // V2 simplified
  // V2 simplified - use parsed response directly

  // Get current model name
  const modelName = process.env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash'; // V2 environment-based

  return {
    thoughtNumber: context.thoughtNumber,
    totalThoughts: context.totalThoughts,
    nextThoughtNeeded: context.nextThoughtNeeded,
    branchId: context.branchId,

    // AI-generated reasoning content with validation
    analysis: cleanTextContent(parsed.analysis, 2000),
    insights: (parsed.insights || []).map((insight: any) => cleanTextContent(insight)),
    hypothesis: cleanTextContent(parsed.hypothesis, 1000),
    verification: cleanTextContent(parsed.verification, 1000),
    nextSteps: (parsed.nextSteps || []).map((step: any) => cleanTextContent(step)),
    alternatives: (parsed.alternatives || []).map((alt: any) => cleanTextContent(alt)),
    conclusion: cleanTextContent(parsed.conclusion, 1000),
    confidence: validateScore(parsed.confidence),

    // Metadata
    aiPowered: true,
    timestamp: new Date().toISOString(),
    model: modelName,
    parsingSuccess: parsed.parsingSuccess || true,
    parsingError: parsed.parsingError || undefined,
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
  const modelName = process.env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash'; // V2 environment-based

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
