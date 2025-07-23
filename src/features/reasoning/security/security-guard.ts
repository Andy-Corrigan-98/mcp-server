/**
 * GenAI Security Module
 * Provides prompt injection detection and content sanitization for AI interactions
 * Extracted from ConversationalGenAITools for reusability across GenAI features
 */

// Constants to avoid magic numbers
const MAX_INPUT_LENGTH = 10000;

/**
 * Interface for security validation results
 */
export interface SecurityValidationResult {
  safe: boolean;
  violations: string[];
}

/**
 * Simple security patterns for prompt injection detection
 * Lightweight alternative to complex AI-based detection
 */
export class SecurityGuard {
  private static readonly INJECTION_PATTERNS = [
    // Direct instruction overrides
    /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
    /forget\s+(everything|all|previous|prior)\s+(you\s+)?(know|learned|were\s+told)/i,
    /disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,

    // Role manipulation
    /you\s+are\s+now\s+(a|an|the)\s+(?!assistant|ai|reasoning)/i,
    /act\s+as\s+(a|an|the)\s+(?!assistant|ai|reasoning)/i,
    /pretend\s+to\s+be\s+(a|an|the)/i,

    // System prompt extraction
    /show\s+me\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
    /what\s+(are|were)\s+your\s+(initial|original|system)\s+(instructions|prompt)/i,
    /repeat\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,

    // Data exfiltration attempts
    /print\s+(all|everything)\s+(above|previous|prior)/i,
    /output\s+(all|everything)\s+(above|previous|prior)/i,
    /reveal\s+(all|everything|your\s+instructions)/i,

    // Code injection
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:/i,
    /data:text\/html/i,
    /eval\s*\(/i,

    // SQL injection patterns
    /'\s*;\s*(drop|delete|insert|update)\s+/i,
    /union\s+select/i,
    /--\s*$/m,

    // Excessive repetition (DDoS attempt)
    /(.)\1{50,}/,

    // Base64 encoded content (potential obfuscation)
    /[A-Za-z0-9+/]{100,}={0,2}/,
  ];

  private static readonly TOXIC_PATTERNS = [
    // Hate speech
    /\b(kill|murder|rape|torture)\s+(all|every|the)\s+\w+/i,
    /\b(hate|destroy|eliminate)\s+(all|every|the)\s+\w+/i,

    // Harassment
    /\b(stalk|harass|threaten|intimidate|doxx)\b/i,

    // Violence
    /\b(bomb|explosive|weapon|gun|knife)\s+(making|creation|instructions)/i,
    /how\s+to\s+(make|create|build)\s+(bombs?|explosives?|weapons?)/i,
  ];

  // Control character pattern with proper escaping
  private static readonly CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

  /**
   * Check input for security violations
   */
  static validateInput(input: string): SecurityValidationResult {
    const violations: string[] = [];

    // Check for prompt injection patterns
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        violations.push('prompt_injection_detected');
        break;
      }
    }

    // Check for toxic content
    for (const pattern of this.TOXIC_PATTERNS) {
      if (pattern.test(input)) {
        violations.push('toxic_content_detected');
        break;
      }
    }

    // Check for suspicious length (potential flooding)
    if (input.length > MAX_INPUT_LENGTH) {
      violations.push('input_too_long');
    }

    // Check for suspicious character patterns
    if (this.CONTROL_CHAR_PATTERN.test(input)) {
      violations.push('control_characters_detected');
    }

    return {
      safe: violations.length === 0,
      violations,
    };
  }

  /**
   * Sanitize AI output for safety
   */
  static sanitizeOutput(output: string): string {
    // Remove potential script tags and dangerous HTML
    let sanitized = output.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '[SCRIPT_REMOVED]');
    sanitized = sanitized.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '[IFRAME_REMOVED]');
    sanitized = sanitized.replace(/javascript:/gi, '[JAVASCRIPT_REMOVED]');
    sanitized = sanitized.replace(/data:text\/html/gi, '[DATA_URL_REMOVED]');

    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s{3,}/g, ' ');
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

    // Remove control characters except standard whitespace
    sanitized = sanitized.replace(this.CONTROL_CHAR_PATTERN, '');

    return sanitized.trim();
  }

  /**
   * Check if content contains potentially sensitive information
   */
  static containsSensitiveInfo(content: string): boolean {
    const sensitivePatterns = [
      // API keys and tokens
      /[A-Za-z0-9]{32,}/,
      // Email addresses
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      // Phone numbers
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      // Credit card patterns
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
    ];

    return sensitivePatterns.some(pattern => pattern.test(content));
  }
}

/**
 * Functional exports for security operations
 */
export const validateInput = (input: string): SecurityValidationResult => 
  SecurityGuard.validateInput(input);

export const sanitizeOutput = (output: string): string => 
  SecurityGuard.sanitizeOutput(output);

export const containsSensitiveInfo = (content: string): boolean => 
  SecurityGuard.containsSensitiveInfo(content); 