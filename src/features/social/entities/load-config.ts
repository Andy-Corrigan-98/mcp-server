import { loadConfiguration } from '../../../services/configuration.js';

/**
 * Entity configuration management
 * Single responsibility: Configuration loading and validation
 */

// Configuration interface
export interface EntityConfig extends Record<string, unknown> {
  maxEntityNameLength: number;
  maxDisplayNameLength: number;
  maxDescriptionLength: number;
}

// Default configuration
const DEFAULT_CONFIG: EntityConfig = {
  maxEntityNameLength: 100,
  maxDisplayNameLength: 150,
  maxDescriptionLength: 500,
};

/**
 * Load entity configuration
 */
export const loadEntityConfig = async (): Promise<EntityConfig> => {
  return loadConfiguration('SOCIAL', DEFAULT_CONFIG, 'social');
};
