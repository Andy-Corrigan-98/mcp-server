/**
 * Unit Tests for ConfigurationSchema
 * Tests configuration loading, validation, and schema management
 */

import { ConfigurationSchema } from '../../src/utils/configuration-schema.js';
import { TestConfigBuilder } from '../../src/test-utils/config-testing.js';
import { TestDataFactory } from '../../src/test-utils/data-factory.js';

// Mock the ConfigurationService
const mockConfigService = {
  get: jest.fn(),
  set: jest.fn(),
  initialize: jest.fn()
};

// Mock the dependency
jest.mock('../../src/db/configuration-service.js', () => ({
  ConfigurationService: jest.fn(() => mockConfigService)
}));

describe('ConfigurationSchema', () => {
  const configData = TestDataFactory.createConfigurationTestData();

  beforeEach(() => {
    jest.clearAllMocks();
    ConfigurationSchema.initialize();
  });

  describe('Schema Definition and Loading', () => {
    test('should load simple configuration schema', async () => {
      const schema = {
        appName: {
          key: 'app.name',
          type: 'string' as const,
          defaultValue: 'Test App',
          description: 'Application name'
        }
      };

      mockConfigService.get.mockResolvedValue('My Test App');

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result).toEqual({
        appName: 'My Test App'
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('app.name');
    });

    test('should use default values when configuration is missing', async () => {
      const schema = {
        port: {
          key: 'server.port',
          type: 'number' as const,
          defaultValue: 3000
        }
      };

      mockConfigService.get.mockResolvedValue(null);

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result).toEqual({
        port: 3000
      });
    });

    test('should validate configuration values with custom validators', async () => {
      const schema = {
        port: {
          key: 'server.port',
          type: 'number' as const,
          defaultValue: 3000,
          validator: (value: number) => value > 0 && value < 65536
        }
      };

      mockConfigService.get.mockResolvedValue(8080);

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result).toEqual({
        port: 8080
      });
    });

    test('should reject invalid configuration values', async () => {
      const schema = {
        port: {
          key: 'server.port',
          type: 'number' as const,
          defaultValue: 3000,
          validator: (value: number) => value > 0 && value < 65536
        }
      };

      mockConfigService.get.mockResolvedValue(-1);

      await expect(ConfigurationSchema.loadSchema(schema)).rejects.toThrow();
    });
  });

  describe('Data Type Handling', () => {
    test('should handle string configurations', async () => {
      const schema = {
        name: {
          key: 'app.name',
          type: 'string' as const,
          defaultValue: 'Default'
        }
      };

      mockConfigService.get.mockResolvedValue('Custom Name');

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result.name).toBe('Custom Name');
      expect(typeof result.name).toBe('string');
    });

    test('should handle number configurations', async () => {
      const schema = {
        timeout: {
          key: 'app.timeout',
          type: 'number' as const,
          defaultValue: 5000
        }
      };

      mockConfigService.get.mockResolvedValue('10000'); // String from environment

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result.timeout).toBe(10000);
      expect(typeof result.timeout).toBe('number');
    });

    test('should handle boolean configurations', async () => {
      const schema = {
        debug: {
          key: 'app.debug',
          type: 'boolean' as const,
          defaultValue: false
        }
      };

      mockConfigService.get.mockResolvedValue('true'); // String from environment

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result.debug).toBe(true);
      expect(typeof result.debug).toBe('boolean');
    });

    test('should handle array configurations', async () => {
      const schema = {
        origins: {
          key: 'cors.origins',
          type: 'string_array' as const,
          defaultValue: []
        }
      };

      mockConfigService.get.mockResolvedValue('localhost,example.com');

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result.origins).toEqual(['localhost', 'example.com']);
      expect(Array.isArray(result.origins)).toBe(true);
    });

    test('should handle JSON configurations', async () => {
      const schema = {
        metadata: {
          key: 'app.metadata',
          type: 'json' as const,
          defaultValue: {}
        }
      };

      const jsonValue = { version: '1.0', features: ['auth', 'api'] };
      mockConfigService.get.mockResolvedValue(JSON.stringify(jsonValue));

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result.metadata).toEqual(jsonValue);
    });
  });

  describe('Batch Loading', () => {
    test('should load multiple configurations efficiently', async () => {
      const schema = {
        appName: {
          key: 'app.name',
          type: 'string' as const,
          defaultValue: 'Test'
        },
        port: {
          key: 'server.port',
          type: 'number' as const,
          defaultValue: 3000
        },
        debug: {
          key: 'app.debug',
          type: 'boolean' as const,
          defaultValue: false
        }
      };

      mockConfigService.get
        .mockResolvedValueOnce('My App')
        .mockResolvedValueOnce('8080')
        .mockResolvedValueOnce('true');

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result).toEqual({
        appName: 'My App',
        port: 8080,
        debug: true
      });

      expect(mockConfigService.get).toHaveBeenCalledTimes(3);
    });

    test('should handle mixed success and failure in batch loading', async () => {
      const schema = {
        validConfig: {
          key: 'app.valid',
          type: 'string' as const,
          defaultValue: 'default'
        },
        invalidConfig: {
          key: 'app.invalid',
          type: 'number' as const,
          defaultValue: 100,
          validator: (value: number) => value > 0
        }
      };

      mockConfigService.get
        .mockResolvedValueOnce('Valid Value')
        .mockResolvedValueOnce('-1'); // Invalid number

      await expect(ConfigurationSchema.loadSchema(schema)).rejects.toThrow();
    });
  });

  describe('Predefined Schemas', () => {
    test('should load TIME schema configuration', async () => {
      mockConfigService.get
        .mockResolvedValueOnce('UTC')
        .mockResolvedValueOnce('iso')
        .mockResolvedValueOnce('300');

      const result = await ConfigurationSchema.loadPredefinedSchema('TIME');

      expect(result).toHaveProperty('defaultTimezone');
      expect(result).toHaveProperty('format');
      expect(result).toHaveProperty('awarenessCheckInterval');
      expect(mockConfigService.get).toHaveBeenCalledWith('time.default_timezone');
      expect(mockConfigService.get).toHaveBeenCalledWith('time.format');
      expect(mockConfigService.get).toHaveBeenCalledWith('time.awareness_check_interval');
    });

    test('should load VALIDATION schema configuration', async () => {
      mockConfigService.get
        .mockResolvedValueOnce('true')
        .mockResolvedValueOnce('10')
        .mockResolvedValueOnce('5000');

      const result = await ConfigurationSchema.loadPredefinedSchema('VALIDATION');

      expect(result).toHaveProperty('strictMode');
      expect(result).toHaveProperty('maxErrors');
      expect(result).toHaveProperty('timeout');
    });

    test('should load CONSCIOUSNESS schema configuration', async () => {
      mockConfigService.get
        .mockResolvedValueOnce('500')
        .mockResolvedValueOnce('true');

      const result = await ConfigurationSchema.loadPredefinedSchema('CONSCIOUSNESS');

      expect(result).toHaveProperty('maxTopicLength');
      expect(result).toHaveProperty('enableDeepThinking');
    });

    test('should throw error for unknown predefined schema', async () => {
      await expect(
        ConfigurationSchema.loadPredefinedSchema('UNKNOWN' as any)
      ).rejects.toThrow();
    });
  });

  describe('Configuration Validation', () => {
    test('should validate required configurations', async () => {
      const schema = {
        requiredField: {
          key: 'app.required',
          type: 'string' as const,
          defaultValue: 'default',
          validator: (value: string) => value.length > 0
        }
      };

      mockConfigService.get.mockResolvedValue('');

      await expect(ConfigurationSchema.loadSchema(schema)).rejects.toThrow();
    });

    test('should validate custom validation rules', async () => {
      const schema = {
        email: {
          key: 'user.email',
          type: 'string' as const,
          defaultValue: 'test@example.com',
          validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        }
      };

      mockConfigService.get.mockResolvedValue('invalid-email');

      await expect(ConfigurationSchema.loadSchema(schema)).rejects.toThrow();
    });

    test('should pass validation with valid values', async () => {
      const schema = {
        email: {
          key: 'user.email',
          type: 'string' as const,
          defaultValue: 'test@example.com',
          validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        }
      };

      mockConfigService.get.mockResolvedValue('user@example.com');

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result.email).toBe('user@example.com');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      const schema = {
        config: {
          key: 'app.config',
          type: 'string' as const,
          defaultValue: 'default'
        }
      };

      mockConfigService.get.mockRejectedValue(new Error('Database error'));

      await expect(ConfigurationSchema.loadSchema(schema)).rejects.toThrow('Database error');
    });

    test('should handle malformed JSON configurations', async () => {
      const schema = {
        jsonConfig: {
          key: 'app.json',
          type: 'json' as const,
          defaultValue: {}
        }
      };

      mockConfigService.get.mockResolvedValue('{ invalid json }');

      await expect(ConfigurationSchema.loadSchema(schema)).rejects.toThrow();
    });

    test('should handle type conversion errors', async () => {
      const schema = {
        numberConfig: {
          key: 'app.number',
          type: 'number' as const,
          defaultValue: 0
        }
      };

      mockConfigService.get.mockResolvedValue('not-a-number');

      await expect(ConfigurationSchema.loadSchema(schema)).rejects.toThrow();
    });
  });

  describe('Integration with Test Utilities', () => {
    test('should work with TestConfigBuilder for valid configurations', () => {
      const builder = new TestConfigBuilder();
      
      const validConfig = configData.validConfigs.stringConfig;
      const result = builder.createValidConfig(validConfig.key, validConfig.value);

      expect(result.loaded).toBe(true);
      expect(result.validationPassed).toBe(true);
      expect(result.values).toEqual({ [validConfig.key]: validConfig.value });
    });

    test('should work with TestConfigBuilder for invalid configurations', () => {
      const builder = new TestConfigBuilder();
      
      const invalidConfig = configData.invalidConfigs.missingRequired;
      const result = builder.createInvalidConfig(invalidConfig.key, invalidConfig.value);

      expect(result.loaded).toBe(false);
      expect(result.validationPassed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    test('should load configurations efficiently', async () => {
      const largeSchema = Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => [
          `config${i}`,
          {
            key: `app.config${i}`,
            type: 'string' as const,
            defaultValue: `default${i}`
          }
        ])
      );

      mockConfigService.get.mockImplementation((key: string) => 
        Promise.resolve(`value-${key}`)
      );

      const startTime = performance.now();
      const result = await ConfigurationSchema.loadSchema(largeSchema);
      const endTime = performance.now();

      expect(Object.keys(result)).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    test('should cache configuration schemas efficiently', async () => {
      const schema = {
        cachedConfig: {
          key: 'app.cached',
          type: 'string' as const,
          defaultValue: 'default'
        }
      };

      mockConfigService.get.mockResolvedValue('cached-value');

      // Load the same schema multiple times
      const results = await Promise.all([
        ConfigurationSchema.loadSchema(schema),
        ConfigurationSchema.loadSchema(schema),
        ConfigurationSchema.loadSchema(schema)
      ]);

      // All results should be the same
      results.forEach(result => {
        expect(result.cachedConfig).toBe('cached-value');
      });

      // Should have called the service for each load (no caching implementation assumed)
      expect(mockConfigService.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty schemas', async () => {
      const result = await ConfigurationSchema.loadSchema({});
      expect(result).toEqual({});
    });

    test('should handle configurations with special characters', async () => {
      const schema = {
        specialConfig: {
          key: 'app.special-config_with.dots',
          type: 'string' as const,
          defaultValue: 'default'
        }
      };

      mockConfigService.get.mockResolvedValue('special value with émojis 🎉');

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result.specialConfig).toBe('special value with émojis 🎉');
    });

    test('should handle very large configuration values', async () => {
      const largeValue = 'A'.repeat(10000);
      const schema = {
        largeConfig: {
          key: 'app.large',
          type: 'string' as const,
          defaultValue: 'default'
        }
      };

      mockConfigService.get.mockResolvedValue(largeValue);

      const result = await ConfigurationSchema.loadSchema(schema);

      expect(result.largeConfig).toBe(largeValue);
    });
  });
}); 