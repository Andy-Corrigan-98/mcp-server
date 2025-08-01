/**
 * Core Database Index - v2 Consciousness Substrate
 * Compatibility layer for v1 imports
 */

// Re-export services for compatibility with existing imports
export { ConfigurationService } from '../services/configuration.js';
export { executeDatabase } from '../services/database.js';
export { 
  validateRequiredString,
  validateOptionalString,
  validateNumber,
  validateBoolean,
  sanitizeString,
  validateProbability,
  validateEnum,
  validateAndStringifyJson
} from '../services/validation.js';

// Compatibility types for database operations
export interface MemoryResult {
  id: number;
  key: string;
  content: Record<string, unknown>;
  tags: string[];
  importance: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryData {
  key: string;
  content: Record<string, unknown>;
  tags?: string[];
  importance?: string;
}

export interface KnowledgeEntityData {
  entity: string;
  entityType: string;
  properties?: Record<string, unknown>;
}

export interface KnowledgeRelationshipData {
  entity: string;
  target: string;
  relationship: string;
  strength?: number;
}