import { ConfigurationService } from '../db/configuration-service.js';
import { InputValidator } from './input-validator.js';
import { ImportanceLevel } from '@prisma/client';

// Constants to avoid magic numbers
const DEFAULT_PROBABILITY = 0.5;
const DEFAULT_MAX_LENGTH = 500;
const DEFAULT_MAX_ITEM_LENGTH = 100;
const DEFAULT_MIN_INTEGER = 1;
const DEFAULT_MAX_INTEGER = 100;

/**
 * Enhanced validation utilities that integrate with configuration system
 * Eliminates repetitive validation + config loading patterns
 */
export class ConfiguredValidator {
  private static instance: ConfiguredValidator;
  private configService: ConfigurationService;

  private constructor() {
    this.configService = ConfigurationService.getInstance();
  }

  static getInstance(): ConfiguredValidator {
    if (!ConfiguredValidator.instance) {
      ConfiguredValidator.instance = new ConfiguredValidator();
    }
    return ConfiguredValidator.instance;
  }

  /**
   * Sanitize string with configuration-driven max length
   */
  async sanitizeWithConfig(
    input: string | undefined,
    configKey: string,
    defaultMaxLength: number
  ): Promise<string | undefined> {
    if (!input) return undefined;

    const maxLength = await this.configService.getNumber(configKey, defaultMaxLength);
    return InputValidator.sanitizeString(input, maxLength);
  }

  /**
   * Validate required string with configuration-driven max length
   */
  async validateRequiredWithConfig(
    input: unknown,
    fieldName: string,
    configKey: string,
    defaultMaxLength: number
  ): Promise<string> {
    if (!input || typeof input !== 'string') {
      throw new Error(`Field '${fieldName}' is required and must be a string`);
    }

    const maxLength = await this.configService.getNumber(configKey, defaultMaxLength);
    const sanitized = InputValidator.sanitizeString(input, maxLength);

    if (!sanitized || sanitized.trim().length === 0) {
      throw new Error(`Field '${fieldName}' cannot be empty after sanitization`);
    }

    return sanitized;
  }

  /**
   * Validate and clamp probability value (0-1 range) with configuration-driven default
   */
  async validateProbabilityWithConfig(
    value: unknown,
    configKey: string,
    defaultValue: number = DEFAULT_PROBABILITY
  ): Promise<number> {
    const configDefault = await this.configService.getNumber(configKey, defaultValue);

    if (value === undefined || value === null) return configDefault;

    const num = Number(value);
    if (isNaN(num)) return configDefault;

    return Math.max(0, Math.min(1, num));
  }

  /**
   * Validate importance level with configuration-driven defaults
   */
  async validateImportanceWithConfig(
    level: unknown,
    configKey: string = 'memory.default_importance'
  ): Promise<ImportanceLevel> {
    const defaultLevel = (await this.configService.getString(configKey, 'medium')) as ImportanceLevel;

    if (!level || typeof level !== 'string') return defaultLevel;

    return InputValidator.validateImportanceLevel(level);
  }

  /**
   * Validate array of strings with configuration-driven item max length
   */
  async validateStringArray(items: unknown, configKey: string, defaultMaxItemLength: number): Promise<string[]> {
    if (!Array.isArray(items)) return [];

    const maxItemLength = await this.configService.getNumber(configKey, defaultMaxItemLength);

    return items
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => InputValidator.sanitizeString(item as string, maxItemLength))
      .filter(item => item.length > 0);
  }

  /**
   * Validate and stringify JSON with optional schema validation
   */
  validateAndStringifyJson(input: unknown): string | undefined {
    if (!input) return undefined;

    if (typeof input === 'string') {
      // Validate it's parseable JSON
      try {
        JSON.parse(input);
        return input;
      } catch {
        throw new Error('Invalid JSON string provided');
      }
    }

    if (typeof input === 'object') {
      try {
        return JSON.stringify(input);
      } catch {
        throw new Error('Object cannot be serialized to JSON');
      }
    }

    throw new Error('Input must be a JSON string or object');
  }

  /**
   * Parse JSON safely with typed fallback
   */
  parseJsonSafely<T>(jsonString: string | null | undefined, fallback: T): T {
    if (!jsonString) return fallback;

    try {
      return JSON.parse(jsonString) as T;
    } catch {
      console.warn('Failed to parse JSON, using fallback value');
      return fallback;
    }
  }

  /**
   * Validate positive integer with configuration-driven bounds
   */
  async validatePositiveInteger(
    value: unknown,
    minConfigKey: string,
    maxConfigKey: string,
    defaultMin: number = DEFAULT_MIN_INTEGER,
    defaultMax: number = DEFAULT_MAX_INTEGER
  ): Promise<number> {
    const min = await this.configService.getNumber(minConfigKey, defaultMin);
    const max = await this.configService.getNumber(maxConfigKey, defaultMax);

    const num = Number(value);
    if (!Number.isInteger(num) || num < min) {
      throw new Error(`Value must be an integer >= ${min}`);
    }

    return Math.min(num, max);
  }

  /**
   * Batch validate multiple fields with their config keys
   */
  async validateBatch(
    validationSpecs: Array<{
      value: unknown;
      type: 'string' | 'required_string' | 'probability' | 'integer' | 'positive_integer' | 'string_array';
      fieldName: string;
      configKey: string;
      defaultValue?: unknown;
    }>
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    for (const spec of validationSpecs) {
      switch (spec.type) {
        case 'string': {
          results[spec.fieldName] = await this.sanitizeWithConfig(
            spec.value as string,
            spec.configKey,
            (spec.defaultValue as number) || DEFAULT_MAX_LENGTH
          );
          break;
        }
        case 'required_string': {
          results[spec.fieldName] = await this.validateRequiredWithConfig(
            spec.value,
            spec.fieldName,
            spec.configKey,
            (spec.defaultValue as number) || DEFAULT_MAX_LENGTH
          );
          break;
        }
        case 'probability': {
          results[spec.fieldName] = await this.validateProbabilityWithConfig(
            spec.value,
            spec.configKey,
            (spec.defaultValue as number) || DEFAULT_PROBABILITY
          );
          break;
        }
        case 'integer':
        case 'positive_integer': {
          const minValue = (spec.defaultValue as number) || DEFAULT_MIN_INTEGER;
          results[spec.fieldName] = await this.configService.getNumber(spec.configKey, minValue);
          break;
        }
        case 'string_array': {
          results[spec.fieldName] = await this.validateStringArray(
            spec.value,
            spec.configKey,
            (spec.defaultValue as number) || DEFAULT_MAX_ITEM_LENGTH
          );
          break;
        }
      }
    }

    return results;
  }
}








