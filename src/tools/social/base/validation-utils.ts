import { InputValidator } from '@/validation/input-validator.js';

/**
 * Validation utilities for social consciousness modules
 * Encapsulates common validation patterns
 */
export class SocialValidationUtils {
  /**
   * Sanitize string with length limit
   */
  static sanitizeString(input: string | undefined, maxLength: number): string | undefined {
    if (!input) return undefined;
    return InputValidator.sanitizeString(input, maxLength);
  }

  /**
   * Validate and clamp numeric value to range [0, 1]
   */
  static validateProbability(value: number | undefined, defaultValue: number = 0.5): number {
    if (value === undefined) return defaultValue;
    return Math.max(0, Math.min(1, value));
  }

  /**
   * Validate and clamp numeric value to positive range
   */
  static validatePositiveNumber(value: number | undefined, defaultValue: number = 0): number {
    if (value === undefined) return defaultValue;
    return Math.max(0, value);
  }

  /**
   * Validate required string field
   */
  static validateRequiredString(input: any, fieldName: string, maxLength: number): string {
    if (!input || typeof input !== 'string') {
      throw new Error(`Field '${fieldName}' is required and must be a string`);
    }
    return InputValidator.sanitizeString(input, maxLength);
  }

  /**
   * Validate optional JSON field and stringify if provided
   */
  static validateAndStringifyJson(input: Record<string, unknown> | undefined): string | undefined {
    if (!input) return undefined;
    try {
      return JSON.stringify(input);
    } catch {
      throw new Error('Invalid JSON provided');
    }
  }

  /**
   * Parse JSON string safely
   */
  static parseJsonSafely<T>(jsonString: string | null | undefined, defaultValue: T): T {
    if (!jsonString) return defaultValue;
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      console.warn('Failed to parse JSON, using default value');
      return defaultValue;
    }
  }
}
