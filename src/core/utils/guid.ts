import { randomUUID } from 'crypto';

/**
 * GUID Generation Utilities
 * Provides consistent UUID generation across the MCP server
 */
export class GuidGenerator {
  /**
   * Generate a standard UUID v4
   */
  static generateUUID(): string {
    return randomUUID();
  }

  /**
   * Generate a short UUID for session IDs (8 characters)
   */
  static generateShortId(): string {
    return randomUUID().substring(0, 8);
  }

  /**
   * Generate a prefixed UUID for specific entity types
   */
  static generatePrefixedId(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }

  /**
   * Generate a short prefixed ID (prefix + 8 chars)
   */
  static generateShortPrefixedId(prefix: string): string {
    return `${prefix}_${randomUUID().substring(0, 8)}`;
  }

  /**
   * Generate a compact ID without hyphens
   */
  static generateCompactId(): string {
    return randomUUID().replace(/-/g, '');
  }

  /**
   * Generate a session ID
   */
  static generateSessionId(): string {
    return this.generateShortPrefixedId('session');
  }

  /**
   * Generate an intention ID
   */
  static generateIntentionId(): string {
    return this.generateShortPrefixedId('int');
  }

  /**
   * Generate an insight ID
   */
  static generateInsightId(): string {
    return this.generateShortPrefixedId('ins');
  }

  /**
   * Generate a daydreaming cycle ID
   */
  static generateDaydreamCycleId(): string {
    return this.generateShortPrefixedId('ddl');
  }

  /**
   * Generate a serendipitous insight ID
   */
  static generateSerendipitousInsightId(): string {
    return this.generatePrefixedId('insight');
  }
}
