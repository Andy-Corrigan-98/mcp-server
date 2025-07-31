/**
 * Simple security patterns for prompt injection detection
 * Lightweight alternative to complex AI-based detection
 * Extracted as shared module for all GenAI tools
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

  /**
   * Check input for security violations
   */
  static validateInput(input: string): { safe: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check for prompt injection
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        violations.push('Potential prompt injection detected');
        break;
      }
    }

    // Check for toxic content
    for (const pattern of this.TOXIC_PATTERNS) {
      if (pattern.test(input)) {
        violations.push('Potentially harmful content detected');
        break;
      }
    }

    // Check input length
    if (input.length > 10000) {
      violations.push('Input too long - potential DoS attempt');
    }

    // Check for unusual character patterns
    const nonAsciiRatio = (input.length - input.replace(/[^\x20-\x7E]/g, '').length) / input.length;
    if (nonAsciiRatio > 0.3) {
      violations.push('Unusual character encoding detected');
    }

    return {
      safe: violations.length === 0,
      violations,
    };
  }

  /**
   * Sanitize output to prevent data leakage
   */
  static sanitizeOutput(output: string): string {
    // Remove potential system information leakage
    return output
      .replace(/(?:system prompt|initial instructions|configuration)[\s\S]*?(?:\n\n|.\s)/gi, '[REDACTED] ')
      .replace(/(?:api[_\s]?key|password|token|secret)[\s:=]+[\w\-.]+/gi, '[REDACTED]')
      .replace(/(?:user[_\s]?id|email|phone)[\s:=]+[\w@.+-]+/gi, '[REDACTED]')
      .trim();
  }
}








