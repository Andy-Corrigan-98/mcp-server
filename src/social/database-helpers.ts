/**
 * Database Helpers for Social Module - v2 Consciousness Substrate
 * Helper functions to work with executeDatabase patterns
 */

import { executeDatabase } from '../core/services/database.js';

/**
 * Helper to extract data from executeDatabase result
 */
export function extractDatabaseResult<T>(result: { success: boolean; data?: T; error?: string }): T | null {
  if (!result.success || !result.data) {
    return null;
  }
  return result.data;
}

/**
 * Helper to get entity context with proper data extraction
 */
export async function getEntityContext(entityName: string) {
  const result = await executeDatabase(async prisma => {
    const entity = await prisma.socialEntity.findUnique({
      where: { name: entityName },
      include: {
        relationships: true,
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!entity) {
      return null;
    }

    // Get recent interactions
    const recentInteractions = await prisma.socialInteraction.findMany({
      where: { entityId: entity.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        interactionType: true,
        summary: true,
        quality: true,
        createdAt: true,
      },
    });

    // Get emotional contexts with enhanced analysis
    const emotionalContexts = await prisma.emotionalContext.findMany({
      where: { entityId: entity.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        emotionalState: true,
        intensity: true,
        trigger: true,
        response: true,
        learning: true,
        context: true,
        createdAt: true,
      },
    });

    // Get social learnings
    const socialLearnings = await prisma.socialLearning.findMany({
      where: { entityId: entity.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        learningType: true,
        insight: true,
        confidence: true,
        createdAt: true,
      },
    });

    return {
      entity,
      relationship: entity.relationships[0] || null,
      recentInteractions,
      emotionalContexts,
      socialLearnings,
    };
  });

  return result;
}

/**
 * Helper to create memory link with proper data extraction
 */
export async function createMemoryLink(memoryKey: string, entityId: number, linkType: string, context?: string) {
  return executeDatabase(async prisma => {
    // First find the memory
    const memory = await prisma.memory.findFirst({
      where: { key: memoryKey },
      select: { id: true },
    });

    if (!memory) {
      throw new Error(`Memory with key '${memoryKey}' not found`);
    }

    // Create the link
    return prisma.memorySocialLink.create({
      data: {
        memoryId: memory.id,
        socialEntityId: entityId,
        relationshipType: linkType as any, // Cast to enum type
        strength: 0.7, // Default strength
        context: context || null,
      },
    });
  });
}
