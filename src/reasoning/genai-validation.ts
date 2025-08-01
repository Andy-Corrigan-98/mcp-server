import { ConfigurationService } from '../core/services/configuration.js';
// import { InputValidator } from '../core/validation/index.js'; // Disabled for MVP

/**
 * GenAI-specific validation utilities
 * Single responsibility: Validate inputs for AI operations
 */

/**
 * Configuration-based length limits
 */
const DEFAULT_MAX_PROMPT_LENGTH = 8000;
const DEFAULT_MAX_THOUGHT_LENGTH = 4000;
const DEFAULT_MAX_CONTEXT_LENGTH = 2000;

/**
 * Validate and sanitize thought input for AI processing
 */
export const validateThoughtInput = async (thought: string, maxLength?: number): Promise<string> => {
  // Use ConfigurationService statically
  const limit = maxLength || DEFAULT_MAX_THOUGHT_LENGTH;

  return (thought || '').toString().trim().substring(0, limit);
};

/**
 * Validate and sanitize context input for AI processing
 */
export const validateContextInput = async (context: string, maxLength?: number): Promise<string> => {
  // Use ConfigurationService statically
  const limit = maxLength || DEFAULT_MAX_CONTEXT_LENGTH;

  return (context || '').toString().trim().substring(0, limit);
};

/**
 * Validate prompt length against configuration
 */
export const validatePromptLength = async (
  prompt: string,
  maxLength?: number
): Promise<{ valid: boolean; length: number; maxLength: number; truncated?: string }> => {
  // Use ConfigurationService statically
  const limit = maxLength || DEFAULT_MAX_PROMPT_LENGTH;

  const valid = prompt.length <= limit;

  return {
    valid,
    length: prompt.length,
    maxLength: limit,
    truncated: valid ? undefined : prompt.substring(0, limit - 100) + '...[TRUNCATED]',
  };
};

/**
 * Validate number within range
 */
export const validateNumber = (value: unknown, min: number, max?: number): number => {
  const num = Number(value);
  if (isNaN(num) || num < min || !Number.isInteger(num)) {
    throw new Error(`Invalid number: must be integer >= ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`Invalid number: must be <= ${max}`);
  }
  return num;
};

/**
 * Validate boolean with fallback
 */
export const validateBoolean = (value: unknown, fallback: boolean = false): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
};

/**
 * Validate string array with sanitization
 */
export const validateStringArray = (value: unknown, maxLength: number = 100, maxItems: number = 10): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, maxItems)
    .filter(item => typeof item === 'string')
    .map(item => (item || '').toString().trim().substring(0, maxLength));
};

/**
 * Validate conversation history
 */
export interface ConversationExchange {
  question: string;
  response: string;
}

export const validateConversationHistory = (history: unknown, maxExchanges: number = 10): ConversationExchange[] => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .slice(-maxExchanges)
    .filter(exchange => exchange && typeof exchange === 'object' && 'question' in exchange && 'response' in exchange)
    .map(exchange => ({
      question: ((exchange.question as string) || '').trim().substring(0, 1000),
      response: ((exchange.response as string) || '').trim().substring(0, 2000),
    }));
};
