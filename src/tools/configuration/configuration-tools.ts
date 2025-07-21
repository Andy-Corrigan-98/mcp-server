import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfigurationService } from '@/db/configuration-service.js';
import { ConfigurationType, ConfigurationCategory } from '@prisma/client';
import { ToolExecutor } from '../base/index.js';
import { ConfiguredValidator } from '../../validation/index.js';
import type {
  ConfigurationResult,
  ConfigurationUpdateResult,
  ConfigurationListResult,
  DatabaseConfiguration,
} from './types.js';

/**
 * Configuration Management Tools
 * Allows the consciousness system to modify its own operating parameters
 * Now using the new ToolExecutor pattern!
 */
export class ConfigurationTools extends ToolExecutor {
  protected category = 'configuration';
  private configService: ConfigurationService;
  private validator: ConfiguredValidator;

  // Define tool handlers using the new pattern - eliminates switch statement!
  protected toolHandlers = {
    configuration_get: this.getConfiguration.bind(this),
    configuration_set: this.setConfiguration.bind(this),
    configuration_list: this.listConfigurations.bind(this),
    configuration_reset: this.resetConfiguration.bind(this),
    configuration_categories: this.getCategories.bind(this),
  };

  constructor() {
    super();
    this.configService = ConfigurationService.getInstance();
    this.validator = ConfiguredValidator.getInstance();
  }

  getTools(): Record<string, Tool> {
    return {
      configuration_get: {
        name: 'configuration_get',
        description: 'Get current value of a configuration parameter',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Configuration key (e.g., "consciousness.max_topic_length")',
            },
          },
          required: ['key'],
        },
      },
      configuration_set: {
        name: 'configuration_set',
        description: 'Update a configuration parameter to adapt consciousness behavior',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Configuration key to update',
            },
            value: {
              type: ['string', 'number', 'boolean'],
              description: 'New value for the configuration',
            },
            reason: {
              type: 'string',
              description: 'Reason for the configuration change (for consciousness evolution tracking)',
            },
          },
          required: ['key', 'value'],
        },
      },
      configuration_list: {
        name: 'configuration_list',
        description: 'List configuration parameters by category or search',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['CONSCIOUSNESS', 'VALIDATION', 'MEMORY', 'REASONING', 'TIME', 'SYSTEM'],
              description: 'Filter by configuration category',
            },
            search: {
              type: 'string',
              description: 'Search term to filter configuration keys or descriptions',
            },
          },
        },
      },
      configuration_reset: {
        name: 'configuration_reset',
        description: 'Reset a configuration parameter to its default value',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Configuration key to reset',
            },
            reason: {
              type: 'string',
              description: 'Reason for resetting the configuration',
            },
          },
          required: ['key'],
        },
      },
      configuration_categories: {
        name: 'configuration_categories',
        description: 'Get overview of all configuration categories and their purposes',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    };
  }

  // Note: execute() method is now inherited from ToolExecutor base class!
  // This eliminates the repetitive switch statement pattern completely

  private async getConfiguration(args: Record<string, unknown>): Promise<ConfigurationResult> {
    // Use new validation pattern
    const key = await this.validator.validateRequiredWithConfig(
      args.key,
      'key',
      'validation.max_config_key_length',
      255
    );

    const config = await this.configService.getConfigurationByKey(key);
    if (!config) {
      throw new Error(`Configuration key '${key}' not found`);
    }

    return {
      key: config.key,
      value: config.value,
      type: config.type,
      category: config.category,
      description: config.description,
      defaultValue: config.defaultValue,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  private async setConfiguration(args: Record<string, unknown>): Promise<ConfigurationUpdateResult> {
    // Use new validation pattern with batch validation
    const validated = await this.validator.validateBatch([
      {
        value: args.key,
        type: 'required_string',
        fieldName: 'key',
        configKey: 'validation.max_config_key_length',
        defaultValue: 255,
      },
      {
        value: args.reason,
        type: 'string',
        fieldName: 'reason',
        configKey: 'validation.max_reason_length',
        defaultValue: 500,
      },
    ]);

    const key = validated.key;
    const newValue = args.value;
    const reason = validated.reason;

    // Get current configuration to validate and track changes
    const currentConfig = await this.configService.getConfigurationByKey(key);
    if (!currentConfig) {
      throw new Error(`Configuration key '${key}' not found. Use seeded values only.`);
    }

    // Validate the new value matches the expected type
    const validatedValue = this.validateValueForType(newValue, currentConfig.type);
    const stringValue = typeof validatedValue === 'object' ? JSON.stringify(validatedValue) : String(validatedValue);

    // Update the configuration
    await this.configService.setValue(
      key,
      validatedValue,
      currentConfig.type,
      currentConfig.category,
      currentConfig.description
    );

    // Clear cache to ensure immediate effect
    this.configService.clearCache();

    // Log the change for consciousness evolution tracking
    const changeLog = {
      key,
      oldValue: currentConfig.value,
      newValue: stringValue,
      type: currentConfig.type,
      category: currentConfig.category,
      timestamp: new Date().toISOString(),
      reason,
    };

    // Store the change in memory for tracking consciousness evolution
    try {
      const memoryService = (await import('@/memory/index.js')).MemoryTools;
      const memory = new memoryService();
      await memory.execute('memory_store', {
        key: `config_change_${Date.now()}`,
        content: changeLog,
        tags: ['configuration', 'consciousness_evolution', 'self_modification'],
        importance: 'high',
      });
    } catch {
      // Continue even if memory storage fails
    }

    return changeLog;
  }

  private async listConfigurations(args: Record<string, unknown>): Promise<ConfigurationListResult[]> {
    const categoryFilter = args.category as ConfigurationCategory | undefined;

    // Use new validation pattern for search term
    const searchTerm = await this.validator.sanitizeWithConfig(
      args.search as string,
      'validation.max_search_length',
      100
    );

    if (categoryFilter) {
      const configs = await this.configService.getConfigurationsByCategory(categoryFilter);
      const filteredConfigs = searchTerm
        ? configs.filter(
            c =>
              c.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : configs;

      return [
        {
          category: categoryFilter,
          configurations: filteredConfigs.map(this.mapToResult),
          totalCount: filteredConfigs.length,
        },
      ];
    }

    // Get all categories
    const categories: ConfigurationCategory[] = [
      'CONSCIOUSNESS',
      'VALIDATION',
      'MEMORY',
      'REASONING',
      'TIME',
      'SYSTEM',
    ];
    const results: ConfigurationListResult[] = [];

    for (const category of categories) {
      const configs = await this.configService.getConfigurationsByCategory(category);
      const filteredConfigs = searchTerm
        ? configs.filter(
            c =>
              c.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : configs;

      if (filteredConfigs.length > 0) {
        results.push({
          category,
          configurations: filteredConfigs.map(this.mapToResult),
          totalCount: filteredConfigs.length,
        });
      }
    }

    return results;
  }

  private async resetConfiguration(args: Record<string, unknown>): Promise<ConfigurationUpdateResult> {
    // Use new validation pattern
    const validated = await this.validator.validateBatch([
      {
        value: args.key,
        type: 'required_string',
        fieldName: 'key',
        configKey: 'validation.max_config_key_length',
        defaultValue: 255,
      },
      {
        value: args.reason || 'Reset to default value',
        type: 'string',
        fieldName: 'reason',
        configKey: 'validation.max_reason_length',
        defaultValue: 500,
      },
    ]);

    const key = validated.key;
    const reason = validated.reason;

    const currentConfig = await this.configService.getConfigurationByKey(key);
    if (!currentConfig) {
      throw new Error(`Configuration key '${key}' not found`);
    }

    // Reset to default value
    const defaultValue = this.parseValueForType(currentConfig.defaultValue, currentConfig.type);
    await this.configService.setValue(
      key,
      defaultValue,
      currentConfig.type,
      currentConfig.category,
      currentConfig.description
    );

    this.configService.clearCache();

    return {
      key,
      oldValue: currentConfig.value,
      newValue: currentConfig.defaultValue,
      type: currentConfig.type,
      category: currentConfig.category,
      timestamp: new Date().toISOString(),
      reason,
    };
  }

  private async getCategories(_args: Record<string, unknown>): Promise<object> {
    return {
      categories: {
        CONSCIOUSNESS: {
          description: 'Parameters affecting consciousness reflection, confidence, and cognitive load',
          purpose: 'Controls the depth and quality of conscious thought processes',
          examples: ['max_topic_length', 'default_confidence', 'cognitive_load_decay_time'],
        },
        VALIDATION: {
          description: 'Input validation limits and security constraints',
          purpose: 'Ensures data integrity and prevents security vulnerabilities',
          examples: ['default_max_length', 'max_key_length', 'max_search_query_length'],
        },
        MEMORY: {
          description: 'Memory storage, retrieval, and relationship scoring parameters',
          purpose: 'Controls how memories are stored, searched, and weighted for relevance',
          examples: ['content_weight', 'tag_weight', 'max_graph_depth'],
        },
        REASONING: {
          description: 'Sequential thinking and reasoning process constraints',
          purpose: 'Manages the depth and complexity of reasoning operations',
          examples: ['max_thought_length', 'max_branch_id_length', 'summary_length'],
        },
        TIME: {
          description: 'Temporal awareness and time classification thresholds',
          purpose: 'Defines how the system perceives and categorizes time periods',
          examples: ['morning_hour_threshold', 'evening_hour_threshold', 'active_hour_threshold'],
        },
        SYSTEM: {
          description: 'Core system parameters and operational constraints',
          purpose: 'Controls fundamental system behavior and performance characteristics',
          examples: ['cache_expiry_time', 'max_concurrent_operations'],
        },
      },
      usage_notes: {
        personality_evolution: 'Adjust consciousness parameters to reflect personality development',
        adaptation: 'Modify memory weights based on what proves most useful over time',
        optimization: 'Fine-tune reasoning parameters for better performance',
        temporal_awareness: 'Customize time thresholds to match personal or cultural preferences',
      },
    };
  }

  // Helper methods remain the same but are now part of the improved architecture
  private validateValueForType(value: unknown, type: ConfigurationType): string | number | boolean | object {
    switch (type) {
      case 'NUMBER': {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Value '${value}' is not a valid number`);
        }
        return num;
      }
      case 'STRING':
        return String(value);
      case 'BOOLEAN': {
        if (typeof value === 'boolean') return value;
        const str = String(value).toLowerCase();
        if (str === 'true') return true;
        if (str === 'false') return false;
        throw new Error(`Value '${value}' is not a valid boolean`);
      }
      case 'JSON':
        if (typeof value === 'object' && value !== null) return value;
        try {
          return JSON.parse(String(value));
        } catch {
          throw new Error(`Value '${value}' is not valid JSON`);
        }
      default:
        throw new Error(`Unknown configuration type: ${type}`);
    }
  }

  private parseValueForType(value: string, type: ConfigurationType): string | number | boolean | object {
    switch (type) {
      case 'NUMBER':
        return parseFloat(value);
      case 'STRING':
        return value;
      case 'BOOLEAN':
        return value.toLowerCase() === 'true';
      case 'JSON':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  private mapToResult(config: DatabaseConfiguration): ConfigurationResult {
    return {
      key: config.key,
      value: config.value,
      type: config.type,
      category: config.category,
      description: config.description,
      defaultValue: config.defaultValue,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}
