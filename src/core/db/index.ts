/**
 * Database module barrel exports
 * Provides clean imports for database-related functionality
 */

// Core database service
export { ConsciousnessPrismaService } from './prisma-service.js';

// Type definitions
export type {
  MemoryData,
  MemoryResult,
  KnowledgeEntityData,
  KnowledgeRelationshipData,
  DatabaseConfig,
} from './types.js';
