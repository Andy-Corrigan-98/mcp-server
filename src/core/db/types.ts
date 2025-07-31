import { ImportanceLevel, ConfigurationType, ConfigurationCategory } from '@prisma/client';

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

/**
 * Prisma where condition interface for memory searches
 */
export interface MemoryWhereConditions {
  importance?: {
    in: ImportanceLevel[];
  };
  OR?: Array<{
    content?: { contains: string };
    key?: { contains: string };
  }>;
  AND?: Array<{
    tags: { contains: string };
  }>;
}

/**
 * Raw Prisma memory object from database
 */
export interface PrismaMemoryObject {
  id: number;
  key: string;
  content: string; // JSON string
  tags: string; // JSON string
  importance: ImportanceLevel;
  storedAt: Date;
  accessCount: number;
  lastAccessed: Date | null;
}

/**
 * Knowledge entity with relations from Prisma
 */
export interface PrismaKnowledgeEntity {
  id: number;
  name: string;
  entityType: string;
  properties: string; // JSON string
  sourceRelationships: Array<{
    targetEntity: { name: string };
    relationshipType: string;
    strength: number;
    targetEntityName: string;
  }>;
  targetRelationships: Array<{
    sourceEntity: { name: string };
    relationshipType: string;
    strength: number;
    sourceEntityName: string;
  }>;
}

/**
 * Configuration upsert data structure
 */
export interface ConfigurationUpsertData {
  key: string;
  value: string;
  type: ConfigurationType;
  category: ConfigurationCategory;
  description: string;
  defaultValue: string;
}
