import { ConsciousnessPrismaService } from '@/db/prisma-service.js';
import { ConfigurationService } from '@/db/configuration-service.js';

/**
 * Base class for configurable social consciousness modules
 * Handles common patterns: service initialization, configuration loading
 */
export abstract class ConfigurableBase {
  protected db: ConsciousnessPrismaService;
  protected configService: ConfigurationService;
  protected abstract config: Record<string, any>;

  constructor() {
    this.db = ConsciousnessPrismaService.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.loadConfiguration();
  }

  /**
   * Load configuration values from database
   * Automatically strips 'social.' prefix and updates config object
   */
  protected async loadConfiguration(): Promise<void> {
    try {
      const configs = await this.configService.getConfigurationsByCategory('SOCIAL');
      configs.forEach((config: any) => {
        const key = config.key.replace('social.', '');
        if (key in this.config) {
          (this.config as any)[key] = config.value;
        }
      });
    } catch {
      console.warn(`Failed to load configuration for ${this.constructor.name}`);
    }
  }

  /**
   * Get configuration value by key
   */
  protected getConfig<T>(key: string): T {
    return this.config[key] as T;
  }

  /**
   * Update configuration value
   */
  protected setConfig(key: string, value: any): void {
    this.config[key] = value;
  }
}
