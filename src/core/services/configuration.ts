import { ConfigurationService } from '../core/db/configuration-service.js';
import type { Configuration } from '@prisma/client';
import { ConfigurationCategory } from '@prisma/client';

/**
 * Pure configuration service functions
 * Replaces ConfigurationService singleton with explicit functions
 */

/**
 * Configuration loading function
 */
export const loadConfiguration = async <TConfig extends Record<string, unknown>>(
  category: ConfigurationCategory,
  defaultConfig: TConfig,
  keyPrefix?: string
): Promise<TConfig> => {
  try {
    const configService = ConfigurationService.getInstance();
    const configs = await configService.getConfigurationsByCategory(category);

    const result = { ...defaultConfig };
    const prefix = keyPrefix ? `${keyPrefix}.` : `${category.toLowerCase()}.`;

    configs.forEach((config: Configuration) => {
      const key = config.key.replace(prefix, '');
      if (key in result) {
        (result as any)[key] = config.value;
      }
    });

    return result;
  } catch (error) {
    console.warn(`Failed to load ${category} configuration, using defaults:`, error);
    return defaultConfig;
  }
};

/**
 * Get a single configuration value
 */
export const getConfigValue = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const configService = ConfigurationService.getInstance();

    if (typeof defaultValue === 'string') {
      return (await configService.getString(key, defaultValue as string)) as T;
    } else if (typeof defaultValue === 'number') {
      return (await configService.getNumber(key, defaultValue as number)) as T;
    } else if (typeof defaultValue === 'boolean') {
      return (await configService.getBoolean(key, defaultValue as boolean)) as T;
    }

    return defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Configuration service interface
 */
export interface ConfigService {
  loadConfiguration: <TConfig extends Record<string, unknown>>(
    category: ConfigurationCategory,
    defaultConfig: TConfig,
    keyPrefix?: string
  ) => Promise<TConfig>;
  getValue: <T>(key: string, defaultValue: T) => Promise<T>;
}

/**
 * Create a configuration service instance
 */
export const createConfigService = (): ConfigService => ({
  loadConfiguration,
  getValue: getConfigValue,
});








