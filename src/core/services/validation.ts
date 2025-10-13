/**
 * Validation Service - v2 Consciousness Substrate
 * Provides input validation utilities for the consciousness railroad
 */

/**
 * Validate required string parameter
 */
export function validateRequiredString(value: unknown, paramName: string, maxLength?: number): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${paramName} must be a non-empty string`);
  }
  
  const trimmed = value.trim();
  if (maxLength && trimmed.length > maxLength) {
    throw new Error(`${paramName} must be ${maxLength} characters or less`);
  }
  
  return trimmed;
}

/**
 * Validate optional string parameter
 */
export function validateOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error('Value must be a string if provided');
  }
  return value.trim();
}

/**
 * Validate number parameter
 */
export function validateNumber(value: unknown, paramName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${paramName} must be a valid number`);
  }
  return value;
}

/**
 * Validate boolean parameter
 */
export function validateBoolean(value: unknown, paramName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${paramName} must be a boolean`);
  }
  return value;
}

/**
 * Validate array parameter
 */
export function validateArray(value: unknown, paramName: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${paramName} must be an array`);
  }
  return value;
}

/**
 * Validate object parameter
 */
export function validateObject(value: unknown, paramName: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${paramName} must be an object`);
  }
  return value as Record<string, unknown>;
}

/**
 * Validate thought input for reasoning operations
 */
export function validateThoughtInput(thought: unknown): string {
  return validateRequiredString(thought, 'thought');
}

/**
 * Validate prompt length for AI operations
 */
export function validatePromptLength(prompt: string, maxLength: number = 10000): string {
  if (prompt.length > maxLength) {
    throw new Error(`Prompt length ${prompt.length} exceeds maximum ${maxLength} characters`);
  }
  return prompt;
}

/**
 * Validate conversation history for multi-turn chat
 */
export function validateConversationHistory(history: unknown): Array<{ question: string; response: string }> {
  const validatedHistory = validateArray(history, 'history');
  
  return validatedHistory.map((item, index) => {
    const obj = validateObject(item, `history[${index}]`);
    return {
      question: validateRequiredString(obj.question, `history[${index}].question`),
      response: validateRequiredString(obj.response, `history[${index}].response`)
    };
  });
}

/**
 * Sanitize string by trimming and basic cleanup
 */
export function sanitizeString(value: string | undefined | null, maxLength?: number): string {
  if (typeof value !== 'string' || value === null || value === undefined) {
    return '';
  }
  
  let cleaned = value.trim().replace(/\s+/g, ' ');
  
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim();
  }
  
  return cleaned;
}

/**
 * Validate probability value (0.0 to 1.0)
 */
export function validateProbability(value: unknown, paramName: string | number = 'probability'): number {
  const paramNameStr = typeof paramName === 'string' ? paramName : 'probability';
  const num = validateNumber(value, paramNameStr);
  if (num < 0 || num > 1) {
    throw new Error(`${paramNameStr} must be between 0.0 and 1.0`);
  }
  return num;
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(value: unknown, options: readonly T[], paramName: string): T {
  const str = validateRequiredString(value, paramName);
  if (!options.includes(str as T)) {
    throw new Error(`${paramName} must be one of: ${options.join(', ')}`);
  }
  return str as T;
}

/**
 * Validate and stringify JSON object
 */
export function validateAndStringifyJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    throw new Error('Value must be JSON serializable');
  }
}