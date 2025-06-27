import { ImportanceLevel } from '@prisma/client';

/**
 * Input validation and sanitization for security and data integrity
 */
export class InputValidator {
  static sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    // Trim and limit length to prevent DoS attacks
    const sanitized = input.trim().substring(0, maxLength);

    // Basic XSS prevention for stored content
    return sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/javascript:/gi, '');
  }

  static validateKey(key: string): string {
    const sanitized = this.sanitizeString(key, 255);

    // Keys should be alphanumeric, dashes, underscores only
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
      throw new Error('Memory key must contain only alphanumeric characters, dashes, and underscores');
    }

    return sanitized;
  }

  static validateImportanceLevel(importance: string): ImportanceLevel {
    const validLevels: ImportanceLevel[] = ['low', 'medium', 'high', 'critical'];
    if (!validLevels.includes(importance as ImportanceLevel)) {
      throw new Error(`Invalid importance level. Must be one of: ${validLevels.join(', ')}`);
    }
    return importance as ImportanceLevel;
  }

  static sanitizeSearchQuery(query: string): string {
    // Prevent potential ReDoS attacks with complex regex
    const sanitized = this.sanitizeString(query, 500);

    // Remove potential SQL-like patterns (defense in depth)
    return sanitized
      .replace(/['"`;\\]/g, '') // Remove quotes, semicolons, backslashes
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/gi, ''); // Remove SQL keywords
  }

  static validateEntityName(name: string): string {
    const sanitized = this.sanitizeString(name, 255);

    // Entity names should be reasonable
    if (sanitized.length < 1) {
      throw new Error('Entity name cannot be empty');
    }

    return sanitized;
  }
}
