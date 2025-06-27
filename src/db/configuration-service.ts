import { ConsciousnessPrismaService } from './prisma-service.js';
import { Configuration, ConfigurationType, ConfigurationCategory } from '@prisma/client';

interface ConfigCacheEntry {
  value: string;
  type: ConfigurationType;
  timestamp: number;
}

export class ConfigurationService {
  private static instance: ConfigurationService;
  private prisma: ConsciousnessPrismaService;
  private cache: Map<string, ConfigCacheEntry> = new Map();
  private cacheExpiryMs = 300000; // 5 minutes

  private constructor() {
    this.prisma = ConsciousnessPrismaService.getInstance();
  }

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Get a configuration value as a number
   */
  async getNumber(key: string, defaultValue: number): Promise<number> {
    try {
      const value = await this.getValue(key);
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Get a configuration value as a string
   */
  async getString(key: string, defaultValue: string): Promise<string> {
    try {
      return await this.getValue(key);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Get a configuration value as a boolean
   */
  async getBoolean(key: string, defaultValue: boolean): Promise<boolean> {
    try {
      const value = await this.getValue(key);
      return value.toLowerCase() === 'true';
    } catch {
      return defaultValue;
    }
  }

  /**
   * Get a configuration value as JSON
   */
  async getJson<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await this.getValue(key);
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Set a configuration value
   */
  async setValue(
    key: string,
    value: string | number | boolean | object,
    type: ConfigurationType,
    category: ConfigurationCategory,
    description: string
  ): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await this.prisma.upsertConfiguration({
      key,
      value: stringValue,
      type,
      category,
      description,
      defaultValue: stringValue,
    });

    // Update cache
    this.cache.set(key, {
      value: stringValue,
      type,
      timestamp: Date.now(),
    });
  }

  /**
   * Get all configurations for a category
   */
  async getConfigurationsByCategory(category: ConfigurationCategory): Promise<Configuration[]> {
    return await this.prisma.getConfigurationsByCategory(category);
  }

  /**
   * Preload configurations for better performance
   */
  async preloadConfigurations(keys: string[]): Promise<void> {
    const configurations = await this.prisma.getConfigurationsByKeys(keys);

    for (const config of configurations) {
      this.cache.set(config.key, {
        value: config.value,
        type: config.type,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get raw configuration value from database or cache
   */
  private async getValue(key: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiryMs) {
      return cached.value;
    }

    // Fetch from database
    const config = await this.prisma.getConfiguration(key);
    if (!config) {
      throw new Error(`Configuration key '${key}' not found`);
    }

    // Update cache
    this.cache.set(key, {
      value: config.value,
      type: config.type,
      timestamp: Date.now(),
    });

    return config.value;
  }
}
