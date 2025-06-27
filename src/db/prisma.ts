import { PrismaClient, ImportanceLevel } from '@prisma/client';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

export class ConsciousnessPrismaService {
  private prisma: PrismaClient;
  private static instance: ConsciousnessPrismaService;

  constructor() {
    // Ensure database directory exists
    const dbUrl = process.env.DATABASE_URL || 'file:/app/data/consciousness.db';
    if (dbUrl.startsWith('file:')) {
      const dbPath = dbUrl.replace('file:', '');
      const dbDir = dirname(dbPath);
      try {
        mkdirSync(dbDir, { recursive: true });
      } catch {
        // Directory might already exist
      }
    }

    this.prisma = new PrismaClient({
      log: process.env.DB_DEBUG === 'true' ? ['query', 'info', 'warn', 'error'] : [],
    });
  }

  static getInstance(): ConsciousnessPrismaService {
    if (!ConsciousnessPrismaService.instance) {
      ConsciousnessPrismaService.instance = new ConsciousnessPrismaService();
    }
    return ConsciousnessPrismaService.instance;
  }

  // Memory operations with clean API like EF Core
  async storeMemory(data: MemoryData): Promise<MemoryResult> {
    const memory = await this.prisma.memory.upsert({
      where: { key: data.key },
      update: {
        content: JSON.stringify(data.content),
        tags: JSON.stringify(data.tags),
        importance: data.importance,
        accessCount: { increment: 0 }, // Don't increment on update
      },
      create: {
        key: data.key,
        content: JSON.stringify(data.content),
        tags: JSON.stringify(data.tags),
        importance: data.importance,
      },
    });

    return this.mapMemoryToResult(memory);
  }

  async retrieveMemory(key: string): Promise<MemoryResult | null> {
    const memory = await this.prisma.memory.findUnique({
      where: { key },
    });

    if (!memory) {
      return null;
    }

    // Update access tracking
    await this.prisma.memory.update({
      where: { key },
      data: {
        accessCount: { increment: 1 },
        lastAccessed: new Date(),
      },
    });

    // Return updated memory data
    return this.mapMemoryToResult({
      ...memory,
      accessCount: memory.accessCount + 1,
      lastAccessed: new Date(),
    });
  }

  async searchMemories(
    query?: string,
    tags?: string[],
    importanceFilter?: ImportanceLevel
  ): Promise<MemoryResult[]> {
    const whereConditions: any = {};

    // Add importance filter
    if (importanceFilter) {
      const importanceOrder: ImportanceLevel[] = ['low', 'medium', 'high', 'critical'];
      const minLevel = importanceOrder.indexOf(importanceFilter);
      whereConditions.importance = {
        in: importanceOrder.slice(minLevel),
      };
    }

    // Add content search
    if (query) {
      whereConditions.OR = [
        { content: { contains: query } },
        { key: { contains: query } },
      ];
    }

    // Add tag filtering (simple approach for now)
    if (tags && tags.length > 0) {
      whereConditions.AND = tags.map(tag => ({
        tags: { contains: `"${tag}"` },
      }));
    }

    const memories = await this.prisma.memory.findMany({
      where: whereConditions,
      orderBy: [
        { importance: 'desc' },
        { storedAt: 'desc' },
      ],
    });

    return memories.map(memory => this.mapMemoryToResult(memory));
  }

  async getMemoryCount(): Promise<number> {
    return this.prisma.memory.count();
  }

  // Knowledge graph operations with clean API
  async addEntity(data: KnowledgeEntityData): Promise<void> {
    await this.prisma.knowledgeEntity.upsert({
      where: { name: data.name },
      update: {
        entityType: data.entityType,
        properties: JSON.stringify(data.properties),
      },
      create: {
        name: data.name,
        entityType: data.entityType,
        properties: JSON.stringify(data.properties),
      },
    });
  }

  async addRelationship(data: KnowledgeRelationshipData): Promise<void> {
    await this.prisma.knowledgeRelationship.upsert({
      where: {
        sourceEntityName_targetEntityName_relationshipType: {
          sourceEntityName: data.sourceEntityName,
          targetEntityName: data.targetEntityName,
          relationshipType: data.relationshipType,
        },
      },
      update: {
        strength: data.strength ?? 1.0,
      },
      create: {
        sourceEntityName: data.sourceEntityName,
        targetEntityName: data.targetEntityName,
        relationshipType: data.relationshipType,
        strength: data.strength ?? 1.0,
      },
    });
  }

  async getEntity(name: string) {
    return this.prisma.knowledgeEntity.findUnique({
      where: { name },
      include: {
        sourceRelationships: {
          include: { targetEntity: true },
        },
        targetRelationships: {
          include: { sourceEntity: true },
        },
      },
    });
  }

  async getEntityRelationships(entityName: string, depth: number = 2) {
    // For now, simplified relationship query
    // In a real implementation, you might use recursive queries or multiple rounds
    const entity = await this.getEntity(entityName);
    if (!entity) return [];

    const result: Array<{
      entity: string;
      level: number;
      entityType: string;
      properties: string;
      relationshipType: string | null;
      strength: number | null;
    }> = [
      {
        entity: entity.name,
        level: 0,
        entityType: entity.entityType,
        properties: entity.properties,
        relationshipType: null,
        strength: null,
      },
    ];

    // Add direct relationships
    for (const rel of entity.sourceRelationships) {
      result.push({
        entity: rel.targetEntity.name,
        level: 1,
        entityType: rel.targetEntity.entityType,
        properties: rel.targetEntity.properties,
        relationshipType: rel.relationshipType,
        strength: rel.strength,
      });
    }

    for (const rel of entity.targetRelationships) {
      result.push({
        entity: rel.sourceEntity.name,
        level: 1,
        entityType: rel.sourceEntity.entityType,
        properties: rel.sourceEntity.properties,
        relationshipType: rel.relationshipType,
        strength: rel.strength,
      });
    }

    return result;
  }

  private mapMemoryToResult(memory: any): MemoryResult {
    return {
      id: memory.id,
      key: memory.key,
      content: JSON.parse(memory.content),
      tags: JSON.parse(memory.tags),
      importance: memory.importance,
      storedAt: memory.storedAt,
      accessCount: memory.accessCount,
      lastAccessed: memory.lastAccessed,
    };
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
} 