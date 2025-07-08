import { PrismaClient, ImportanceLevel } from '@prisma/client';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { MemoryData, MemoryResult, KnowledgeEntityData, KnowledgeRelationshipData, DatabaseConfig } from './types.js';

// Load environment variables
dotenv.config();

/**
 * Prisma-based consciousness database service
 * Provides Entity Framework Core-like experience for Node.js
 */
export class ConsciousnessPrismaService {
  private prisma: PrismaClient;
  private static instance: ConsciousnessPrismaService;

  constructor(config?: DatabaseConfig) {
    // Ensure database directory exists
    const dbUrl = config?.databaseUrl || process.env.DATABASE_URL || 'file:/app/data/consciousness.db';
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
      log: config?.enableDebugLogging || process.env.DB_DEBUG === 'true' ? ['query', 'info', 'warn', 'error'] : [],
    });
  }

  static getInstance(config?: DatabaseConfig): ConsciousnessPrismaService {
    if (!ConsciousnessPrismaService.instance) {
      ConsciousnessPrismaService.instance = new ConsciousnessPrismaService(config);
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

  async searchMemories(query?: string, tags?: string[], importanceFilter?: ImportanceLevel): Promise<MemoryResult[]> {
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
      whereConditions.OR = [{ content: { contains: query } }, { key: { contains: query } }];
    }

    // Add tag filtering (simple approach for now)
    if (tags && tags.length > 0) {
      whereConditions.AND = tags.map(tag => ({
        tags: { contains: `"${tag}"` },
      }));
    }

    const memories = await this.prisma.memory.findMany({
      where: whereConditions,
      orderBy: [{ importance: 'desc' }, { storedAt: 'desc' }],
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
    // Start with the root entity
    const visited = new Set<string>();
    const results: any[] = [];

    const exploreEntity = async (name: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(name)) {
        return;
      }

      visited.add(name);
      const entity = await this.getEntity(name);

      if (entity) {
        results.push(entity);

        // Explore related entities
        for (const rel of entity.sourceRelationships) {
          if (currentDepth < depth) {
            await exploreEntity(rel.targetEntityName, currentDepth + 1);
          }
        }

        for (const rel of entity.targetRelationships) {
          if (currentDepth < depth) {
            await exploreEntity(rel.sourceEntityName, currentDepth + 1);
          }
        }
      }
    };

    await exploreEntity(entityName, 1);
    return results;
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

  /**
   * Configuration management methods
   */
  async getConfiguration(key: string) {
    return await this.prisma.configuration.findUnique({
      where: { key },
    });
  }

  async getConfigurationsByCategory(category: any) {
    return await this.prisma.configuration.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
  }

  async getConfigurationsByKeys(keys: string[]) {
    return await this.prisma.configuration.findMany({
      where: {
        key: { in: keys },
      },
    });
  }

  async upsertConfiguration(config: {
    key: string;
    value: string;
    type: any;
    category: any;
    description: string;
    defaultValue: string;
  }) {
    return await this.prisma.configuration.upsert({
      where: { key: config.key },
      update: {
        value: config.value,
        type: config.type,
        category: config.category,
        description: config.description,
        updatedAt: new Date(),
      },
      create: config,
    });
  }

  /**
   * Provides access to the raw Prisma client for advanced operations
   * Used by social consciousness tools and other modules that need direct access
   */
  async execute<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return operation(this.prisma);
  }
}
