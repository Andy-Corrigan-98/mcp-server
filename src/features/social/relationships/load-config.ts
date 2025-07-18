import { loadConfiguration } from '../../../services/configuration.js';

/**
 * Configuration loading for relationship management
 * Single responsibility: Handle relationship configuration only
 */

// Configuration interface
export interface RelationshipConfig extends Record<string, unknown> {
  maxNotesLength: number;
  relationshipDecayTime: number;
}

// Default configuration
export const DEFAULT_CONFIG: RelationshipConfig = {
  maxNotesLength: 1000,
  relationshipDecayTime: 7776000000, // 90 days in milliseconds
};

/**
 * Load relationship configuration
 * Single responsibility: Configuration loading
 */
export const loadRelationshipConfig = async (): Promise<RelationshipConfig> => {
  return loadConfiguration('SOCIAL', DEFAULT_CONFIG, 'social');
};
