/**
 * GUID Generator - v2 Consciousness Substrate
 * Simple GUID generation utilities for consciousness system
 */

/**
 * Generate a simple UUID-like string
 */
export function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a short ID for sessions
 */
export function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substr(2, 9);
}

/**
 * GUID Generator utilities
 */
export class GuidGenerator {
  static generate(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  static generateIntentionId(): string {
    return 'int_' + Math.random().toString(36).substring(2, 15);
  }

  static generateInsightId(): string {
    return 'ins_' + Math.random().toString(36).substring(2, 15);
  }

  static generateDaydreamCycleId(): string {
    return 'ddc_' + Math.random().toString(36).substring(2, 15);
  }

  static generateSerendipitousInsightId(): string {
    return 'sin_' + Math.random().toString(36).substring(2, 15);
  }

  static generateUserId(): string {
    return generateGuid();
  }
  
  static generateSessionId(): string {
    return generateSessionId();
  }
}