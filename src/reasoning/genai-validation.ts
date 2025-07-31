import { InputValidator } from '../../core/validation/index.js';
import { ConfigurationService } from '../../core/db/configuration-service.js';

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
  const config = ConfigurationService.getInstance();
  const limit = maxLength || (await config.getNumber('genai.max_thought_length', DEFAULT_MAX_THOUGHT_LENGTH));

  return InputValidator.sanitizeString(thought, limit);
};

/**
 * Validate and sanitize context input for AI processing
 */
export const validateContextInput = async (context: string, maxLength?: number): Promise<string> => {
  const config = ConfigurationService.getInstance();
  const limit = maxLength || (await config.getNumber('genai.max_context_length', DEFAULT_MAX_CONTEXT_LENGTH));

  return InputValidator.sanitizeString(context, limit);
};

/**
 * Validate prompt length against configuration
 */
export const validatePromptLength = async (
  prompt: string,
  maxLength?: number
): Promise<{ valid: boolean; length: number; maxLength: number; truncated?: string }> => {
  const config = ConfigurationService.getInstance();
  const limit = maxLength || (await config.getNumber('genai.max_prompt_length', DEFAULT_MAX_PROMPT_LENGTH));

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
    .map(item => InputValidator.sanitizeString(item, maxLength));
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
      question: InputValidator.sanitizeString(exchange.question as string, 1000),
      response: InputValidator.sanitizeString(exchange.response as string, 2000),
    }));
};








