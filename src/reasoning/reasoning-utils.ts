/**
 * Reasoning Utilities - v2 Consciousness Substrate
 * Shared utilities for AI reasoning operations
 */

/**
 * Validate a number parameter for reasoning operations
 */
export function validateNumber(value: number, min: number): number {
  if (typeof value !== 'number' || value < min || !Number.isInteger(value)) {
    throw new Error(`Invalid number: must be integer >= ${min}`);
  }
  return value;
}

/**
 * Validate a score parameter (0.0 to 1.0)
 */
export function validateScore(value: number): number {
  if (typeof value !== 'number' || value < 0 || value > 1) {
    throw new Error('Score must be a number between 0.0 and 1.0');
  }
  return value;
}

/**
 * Clean and truncate text content
 */
export function cleanTextContent(text: string, maxLength: number = 1000): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  // Remove excessive whitespace and clean up
  const cleaned = text.trim().replace(/\s+/g, ' ');
  
  // Truncate if too long
  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength) + '...';
  }
  
  return cleaned;
}

/**
 * Parse string array from AI response
 */
export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string');
      }
    } catch {
      // If JSON parsing fails, treat as single string
      return [value];
    }
  }
  
  return [];
}

/**
 * Get model name for AI operations
 */
export function getModelName(): string {
  return 'gemini-1.5-pro-latest'; // Default model for reasoning operations
}

/**
 * Extract key insights from AI response
 */
export function extractKeyInsights(response: string): string[] {
  // Simple extraction - look for bullet points or numbered lists
  const lines = response.split('\n');
  const insights: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      insights.push(trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, ''));
    }
  }
  
  return insights.length > 0 ? insights : [response.trim()];
}

/**
 * Format reasoning prompt with context
 */
export function formatReasoningPrompt(prompt: string, context?: string): string {
  if (!context) {
    return prompt;
  }
  
  return `Context: ${context}\n\nPrompt: ${prompt}`;
}

/**
 * Validate reasoning parameters
 */
export function validateReasoningParams(params: {
  thought: unknown;
  thought_number: unknown;
  total_thoughts: unknown;
}): {
  thought: string;
  thought_number: number;
  total_thoughts: number;
} {
  if (typeof params.thought !== 'string' || params.thought.trim().length === 0) {
    throw new Error('thought must be a non-empty string');
  }
  
  const thought_number = validateNumber(params.thought_number as number, 1);
  const total_thoughts = validateNumber(params.total_thoughts as number, 1);
  
  if (thought_number > total_thoughts) {
    throw new Error('thought_number cannot be greater than total_thoughts');
  }
  
  return {
    thought: params.thought.trim(),
    thought_number,
    total_thoughts
  };
}