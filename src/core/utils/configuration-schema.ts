import { ConfigurationService } from '../db/configuration-service.js';
import { ErrorFactory } from './error-factory.js';

/**
 * Type-safe configuration schema utility
 * Eliminates repetitive config loading and provides validation
 */

// Constants to avoid magic numbers
const MAX_HOUR_VALUE = 23;

// Configuration value types
type ConfigValue = string | number | boolean | string[] | Record<string, unknown>;

// Schema definition for configuration keys
interface ConfigFieldSchema {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'string_array' | 'json';
  defaultValue: ConfigValue;
  validator?: (value: ConfigValue) => boolean;
  description?: string;
}

// Schema definition for a configuration module
interface ConfigModuleSchema {
  [fieldName: string]: ConfigFieldSchema;
}

// Result type for loaded configuration
type LoadedConfig<T extends ConfigModuleSchema> = {
  [K in keyof T]: T[K]['defaultValue'] extends string
    ? string
    : T[K]['defaultValue'] extends number
      ? number
      : T[K]['defaultValue'] extends boolean
        ? boolean
        : T[K]['defaultValue'] extends string[]
          ? string[]
          : T[K]['defaultValue'] extends Record<string, unknown>
            ? Record<string, unknown>
            : ConfigValue;
};

/**
 * Configuration schema utility for type-safe config loading
 */
export class ConfigurationSchema {
  private static configService: ConfigurationService;

  static initialize(): void {
    ConfigurationSchema.configService = ConfigurationService.getInstance();
  }

  /**
   * Load a complete configuration schema with type safety
   */
  static async load<T extends ConfigModuleSchema>(schema: T): Promise<LoadedConfig<T>> {
    if (!ConfigurationSchema.configService) {
      ConfigurationSchema.initialize();
    }

    const result = {} as LoadedConfig<T>;
    const errors: string[] = [];

    // Process all fields in parallel for better performance
    const loadPromises = Object.entries(schema).map(async ([fieldName, fieldSchema]) => {
      try {
        const value = await ConfigurationSchema.loadField(fieldSchema);

        // Validate the loaded value if validator is provided
        if (fieldSchema.validator && !fieldSchema.validator(value)) {
          errors.push(`Configuration '${fieldSchema.key}' failed validation`);
          return { fieldName, value: fieldSchema.defaultValue };
        }

        return { fieldName, value };
      } catch (error) {
        errors.push(`Failed to load '${fieldSchema.key}': ${error instanceof Error ? error.message : String(error)}`);
        return { fieldName, value: fieldSchema.defaultValue };
      }
    });

    const loadedFields = await Promise.all(loadPromises);

    // Assemble the result object
    for (const { fieldName, value } of loadedFields) {
      (result as Record<string, unknown>)[fieldName] = value;
    }

    // Log warnings for any errors (but don't throw, use defaults)
    if (errors.length > 0) {
      console.warn('Configuration loading warnings:', errors);
    }

    return result;
  }

  /**
   * Load a single configuration field with type conversion
   */
  private static async loadField(fieldSchema: ConfigFieldSchema): Promise<ConfigValue> {
    const { key, type, defaultValue } = fieldSchema;

    try {
      switch (type) {
        case 'string': {
          return await ConfigurationSchema.configService.getString(key, defaultValue as string);
        }

        case 'number': {
          return await ConfigurationSchema.configService.getNumber(key, defaultValue as number);
        }

        case 'boolean': {
          return await ConfigurationSchema.configService.getBoolean(key, defaultValue as boolean);
        }

        case 'string_array': {
          return await ConfigurationSchema.configService.getEnumArray(key, defaultValue as string[]);
        }

        case 'json': {
          const jsonValue = await ConfigurationSchema.configService.getString(key, JSON.stringify(defaultValue));
          try {
            return JSON.parse(jsonValue);
          } catch {
            console.warn(`Invalid JSON for config key '${key}', using default`);
            return defaultValue;
          }
        }

        default: {
          throw ErrorFactory.unknownConfigurationType(type, { key });
        }
      }
    } catch (error) {
      // Return default on any error
      console.warn(`Error loading config '${key}':`, error);
      return defaultValue;
    }
  }

  /**
   * Create a typed configuration loader for a specific module
   */
  static createLoader<T extends ConfigModuleSchema>(schema: T) {
    return {
      async load(): Promise<LoadedConfig<T>> {
        return ConfigurationSchema.load(schema);
      },

      async get<K extends keyof T>(fieldName: K): Promise<LoadedConfig<T>[K]> {
        const fieldSchema = schema[fieldName];
        const value = await ConfigurationSchema.loadField(fieldSchema);
        return value as LoadedConfig<T>[K];
      },

      getSchema(): T {
        return schema;
      },

      getFieldNames(): (keyof T)[] {
        return Object.keys(schema);
      },
    };
  }

  /**
   * Validate configuration schema definition
   */
  static validateSchema<T extends ConfigModuleSchema>(schema: T): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      // Check required properties
      if (!fieldSchema.key) {
        errors.push(`Field '${fieldName}' missing required 'key' property`);
      }
      if (!fieldSchema.type) {
        errors.push(`Field '${fieldName}' missing required 'type' property`);
      }
      if (fieldSchema.defaultValue === undefined) {
        errors.push(`Field '${fieldName}' missing required 'defaultValue' property`);
      }

      // Check type consistency
      const expectedTypes: Record<string, string> = {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        string_array: 'object',
        json: 'object',
      };

      const expectedType = expectedTypes[fieldSchema.type];
      const actualType = typeof fieldSchema.defaultValue;

      if (
        expectedType &&
        actualType !== expectedType &&
        !(fieldSchema.type === 'string_array' && Array.isArray(fieldSchema.defaultValue))
      ) {
        errors.push(`Field '${fieldName}' type mismatch: expected ${fieldSchema.type}, got ${actualType}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Pre-defined schemas for common modules
   */
  static readonly SCHEMAS = {
    TIME: {
      defaultTimezone: {
        key: 'time.default_timezone',
        type: 'string' as const,
        defaultValue: 'UTC',
        description: 'Default timezone for time operations',
      },
      millisecondsPerSecond: {
        key: 'time.milliseconds_per_second',
        type: 'number' as const,
        defaultValue: 1000,
        validator: (value: ConfigValue) => typeof value === 'number' && value > 0,
      },
      deepNightThreshold: {
        key: 'time.deep_night_hour_threshold',
        type: 'number' as const,
        defaultValue: 6,
        validator: (value: ConfigValue) => typeof value === 'number' && value >= 0 && value <= MAX_HOUR_VALUE,
      },
      morningThreshold: {
        key: 'time.morning_hour_threshold',
        type: 'number' as const,
        defaultValue: 12,
        validator: (value: ConfigValue) => typeof value === 'number' && value >= 0 && value <= MAX_HOUR_VALUE,
      },
      afternoonThreshold: {
        key: 'time.afternoon_hour_threshold',
        type: 'number' as const,
        defaultValue: 18,
        validator: (value: ConfigValue) => typeof value === 'number' && value >= 0 && value <= MAX_HOUR_VALUE,
      },
      eveningThreshold: {
        key: 'time.evening_hour_threshold',
        type: 'number' as const,
        defaultValue: 22,
        validator: (value: ConfigValue) => typeof value === 'number' && value >= 0 && value <= MAX_HOUR_VALUE,
      },
    },

    VALIDATION: {
      maxConfigKeyLength: {
        key: 'validation.max_config_key_length',
        type: 'number' as const,
        defaultValue: 255,
        validator: (value: ConfigValue) => typeof value === 'number' && value > 0,
      },
      maxReasonLength: {
        key: 'validation.max_reason_length',
        type: 'number' as const,
        defaultValue: 500,
        validator: (value: ConfigValue) => typeof value === 'number' && value > 0,
      },
      maxSearchLength: {
        key: 'validation.max_search_length',
        type: 'number' as const,
        defaultValue: 100,
        validator: (value: ConfigValue) => typeof value === 'number' && value > 0,
      },
    },

    CONSCIOUSNESS: {
      maxTopicLength: {
        key: 'consciousness.max_topic_length',
        type: 'number' as const,
        defaultValue: 500,
        validator: (value: ConfigValue) => typeof value === 'number' && value > 0,
      },
      maxInsightLength: {
        key: 'consciousness.max_insight_length',
        type: 'number' as const,
        defaultValue: 1000,
        validator: (value: ConfigValue) => typeof value === 'number' && value > 0,
      },
      defaultConfidence: {
        key: 'consciousness.default_confidence',
        type: 'number' as const,
        defaultValue: 0.8,
        validator: (value: ConfigValue) => typeof value === 'number' && value >= 0 && value <= 1,
      },
      insightCategories: {
        key: 'personality.insight_categories',
        type: 'string_array' as const,
        defaultValue: [
          'eureka_moment',
          'pattern_weaving',
          'mirror_gazing',
          'knowledge_crystallization',
          'behavior_archaeology',
          'existential_pondering',
        ],
      },
    },
  } as const;
}








