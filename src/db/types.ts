import { ImportanceLevel } from '@prisma/client';

/**
 * Core data interfaces for memory operations
 */
export interface MemoryData {
  key: string;
  content: unknown;
  tags: string[];
  importance: ImportanceLevel;
}

export interface MemoryResult extends MemoryData {
  id: number;
  storedAt: Date;
  accessCount: number;
  lastAccessed: Date | null;
}

/**
 * Knowledge graph data interfaces
 */
export interface KnowledgeEntityData {
  name: string;
  entityType: string;
  properties: Record<string, unknown>;
}

export interface KnowledgeRelationshipData {
  sourceEntityName: string;
  targetEntityName: string;
  relationshipType: string;
  strength?: number;
}

/**
 * Service configuration interface
 */
export interface DatabaseConfig {
  databaseUrl?: string;
  enableDebugLogging?: boolean;
}
