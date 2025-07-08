import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import { ConfigurationTools } from './configuration-tools.js';
import { ConfigurationListResult } from './types.js';
import { seedConfiguration } from '@/db/seed-configuration.js';

describe('ConfigurationTools', () => {
  let configTools: ConfigurationTools;

  beforeAll(async () => {
    // Ensure configuration is seeded
    await seedConfiguration();
  });

  beforeEach(() => {
    configTools = new ConfigurationTools();
  });

  describe('getTools', () => {
    it('should return all configuration tools', () => {
      const tools = configTools.getTools();

      expect(tools).toHaveProperty('configuration_get');
      expect(tools).toHaveProperty('configuration_set');
      expect(tools).toHaveProperty('configuration_list');
      expect(tools).toHaveProperty('configuration_reset');
      expect(tools).toHaveProperty('configuration_categories');
    });

    it('should return valid tool schemas', () => {
      const tools = configTools.getTools();

      expect(tools.configuration_get.name).toBe('configuration_get');
      expect(tools.configuration_get.description).toBeDefined();
      expect(tools.configuration_get.inputSchema).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should get configuration value', async () => {
      const result = await configTools.execute('configuration_get', {
        key: 'consciousness.max_topic_length',
      });

      expect(result).toHaveProperty('key', 'consciousness.max_topic_length');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('description');
    });

    it('should set configuration value', async () => {
      const result = await configTools.execute('configuration_set', {
        key: 'consciousness.max_topic_length',
        value: 600,
        reason: 'Testing configuration update',
      });

      expect(result).toHaveProperty('key', 'consciousness.max_topic_length');
      expect(result).toHaveProperty('oldValue');
      expect(result).toHaveProperty('newValue', '600');
      expect(result).toHaveProperty('reason', 'Testing configuration update');
    });

    it('should list configurations by category', async () => {
      const result = await configTools.execute('configuration_list', {
        category: 'CONSCIOUSNESS',
      });

      expect(Array.isArray(result)).toBe(true);
      const categories = result as ConfigurationListResult[];
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('category', 'CONSCIOUSNESS');
      expect(categories[0]).toHaveProperty('configurations');
      expect(categories[0]).toHaveProperty('totalCount');
    });

    it('should reset configuration to default', async () => {
      // First set a custom value
      await configTools.execute('configuration_set', {
        key: 'consciousness.max_topic_length',
        value: 999,
      });

      // Then reset it
      const result = await configTools.execute('configuration_reset', {
        key: 'consciousness.max_topic_length',
        reason: 'Testing reset functionality',
      });

      expect(result).toHaveProperty('key', 'consciousness.max_topic_length');
      expect(result).toHaveProperty('oldValue', '999');
      expect(result).toHaveProperty('newValue', '500'); // Default value
    });

    it('should get configuration categories overview', async () => {
      const result = await configTools.execute('configuration_categories', {});

      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('usage_notes');

      const categories = (result as any).categories;
      expect(categories).toHaveProperty('CONSCIOUSNESS');
      expect(categories).toHaveProperty('MEMORY');
      expect(categories).toHaveProperty('TIME');
    });

    it('should search configurations', async () => {
      const result = await configTools.execute('configuration_list', {
        search: 'max',
      });

      expect(Array.isArray(result)).toBe(true);
      const categories = result as ConfigurationListResult[];

      // Should find configurations with 'max' in the key or description
      const allConfigs = categories.flatMap(cat => cat.configurations);
      expect(allConfigs.length).toBeGreaterThan(0);

      const hasMaxInKey = allConfigs.some(config => config.key.toLowerCase().includes('max'));
      expect(hasMaxInKey).toBe(true);
    });

    it('should throw error for unknown tool', async () => {
      await expect(configTools.execute('unknown_tool', {})).rejects.toThrow('Unknown configuration tool: unknown_tool');
    });

    it('should throw error for non-existent configuration key', async () => {
      await expect(
        configTools.execute('configuration_get', {
          key: 'non.existent.key',
        })
      ).rejects.toThrow("Configuration key 'non.existent.key' not found");
    });

    it('should validate value types when setting configuration', async () => {
      // Try to set a non-numeric value for a NUMBER type config
      await expect(
        configTools.execute('configuration_set', {
          key: 'consciousness.max_topic_length',
          value: 'not-a-number',
        })
      ).rejects.toThrow('is not a valid number');
    });
  });
});
