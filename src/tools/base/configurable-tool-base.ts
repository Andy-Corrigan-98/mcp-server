import { ConsciousnessPrismaService } from '@/db/prisma-service.js';
import { ConfigurationService } from '@/db/configuration-service.js';
import { ConfigurationCategory } from '@prisma/client';

/**
 * Base class for all configurable tool modules across the consciousness system
 * Handles common patterns: service initialization, configuration loading, error handling
 *
 * Usage:
 * export class MyTools extends ConfigurableToolBase<MyConfig> {
 *   protected configCategory = 'MY_CATEGORY';
 *   protected config: MyConfig = { defaultValue: 42 };
 * }
 */
export abstract class ConfigurableToolBase<TConfig extends Record<string, unknown> = Record<string, unknown>> {
  protected db: ConsciousnessPrismaService;
  protected configService: ConfigurationService;
  protected abstract config: TConfig;
  protected abstract configCategory: ConfigurationCategory;

  constructor() {
    this.db = ConsciousnessPrismaService.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.initializeDefaults();
    this.loadConfiguration();
  }

  /**
   * Initialize default configuration values
   * Override in subclasses to set module-specific defaults
   */
  protected initializeDefaults(): void {
    // Default implementation - subclasses should override
  }

  /**
   * Load configuration values from database
   * Uses the configCategory to load appropriate configs
   */
  protected async loadConfiguration(): Promise<void> {
    try {
      const configs = await this.configService.getConfigurationsByCategory(this.configCategory);
      configs.forEach(config => {
        const key = config.key.replace(`${this.configCategory.toLowerCase()}.`, '');
        if (key in this.config) {
          (this.config as Record<string, unknown>)[key] = config.value;
        }
      });
    } catch (error) {
      console.warn(
        `Failed to load ${this.configCategory} configuration for ${this.constructor.name}, using defaults:`,
        error
      );
    }
  }

  /**
   * Get configuration value by key with type safety
   */
  protected getConfig<K extends keyof TConfig>(key: K): TConfig[K] {
    return this.config[key];
  }

  /**
   * Update configuration value
   */
  protected setConfig<K extends keyof TConfig>(key: K, value: TConfig[K]): void {
    this.config[key] = value;
  }

  /**
   * Get the full configuration object (read-only)
   */
  protected getFullConfig(): Readonly<TConfig> {
    return { ...this.config };
  }
}
