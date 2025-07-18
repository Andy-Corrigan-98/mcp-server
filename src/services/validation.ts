/**
 * Pure validation utility functions
 * Replaces InputValidator and SocialValidationUtils with pure functions
 */

/**
 * Sanitize and validate a string input
 */
export const sanitizeString = (input: string | undefined, maxLength: number): string | undefined => {
  if (!input) return undefined;

  // Basic sanitization - trim and limit length
  const sanitized = input.toString().trim();
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
};

/**
 * Validate and sanitize a required string
 */
export const validateRequiredString = (input: unknown, fieldName: string, maxLength: number): string => {
  if (!input || typeof input !== 'string') {
    throw new Error(`${fieldName} is required and must be a string`);
  }

  const sanitized = sanitizeString(input, maxLength);
  if (!sanitized) {
    throw new Error(`${fieldName} cannot be empty after sanitization`);
  }

  return sanitized;
};

/**
 * Validate a probability value (0.0 to 1.0)
 */
export const validateProbability = (input: unknown, defaultValue: number): number => {
  if (input === undefined || input === null) {
    return defaultValue;
  }

  const num = typeof input === 'number' ? input : parseFloat(input as string);
  if (isNaN(num)) {
    return defaultValue;
  }

  return Math.max(0, Math.min(1, num));
};

/**
 * Safely parse JSON with fallback
 */
export const parseJsonSafely = <T>(input: unknown, fallback: T): T => {
  if (!input) return fallback;

  try {
    if (typeof input === 'string') {
      return JSON.parse(input);
    }
    if (typeof input === 'object') {
      return input as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
};

/**
 * Validate and stringify JSON for database storage
 */
export const validateAndStringifyJson = (input: unknown): string => {
  if (!input) return JSON.stringify({});

  try {
    if (typeof input === 'string') {
      // Test if it's valid JSON
      JSON.parse(input);
      return input;
    }
    return JSON.stringify(input);
  } catch {
    return JSON.stringify({});
  }
};

/**
 * Validation functions interface
 */
export interface ValidationService {
  sanitizeString: (input: string | undefined, maxLength: number) => string | undefined;
  validateRequiredString: (input: unknown, fieldName: string, maxLength: number) => string;
  validateProbability: (input: unknown, defaultValue: number) => number;
  parseJsonSafely: <T>(input: unknown, fallback: T) => T;
  validateAndStringifyJson: (input: unknown) => string;
}

/**
 * Create a validation service instance
 */
export const createValidationService = (): ValidationService => ({
  sanitizeString,
  validateRequiredString,
  validateProbability,
  parseJsonSafely,
  validateAndStringifyJson,
});
