import { executeDatabase } from '../core/services/database.js';

/**
 * Relationship listing functionality
 * Single responsibility: List and filter relationships only
 */

/**
 * List all relationships with optional filtering
 * Single responsibility: Relationship listing and filtering logic
 */
export const listRelationships = async (filters?: {
  relationshipType?: string;
  minStrength?: number;
  limit?: number;
  offset?: number;
}): Promise<any[]> => {
  return executeDatabase(async prisma => {
    const where: Record<string, unknown> = {};
    if (filters?.relationshipType) {
      where.relationshipType = filters.relationshipType;
    }
    if (filters?.minStrength !== undefined) {
      where.strength = { gte: filters.minStrength };
    }

    const DEFAULT_LIMIT = 100;
    const DEFAULT_OFFSET = 0;

    return prisma.socialRelationship.findMany({
      where,
      include: {
        entity: true,
      },
      take: filters?.limit || DEFAULT_LIMIT,
      skip: filters?.offset || DEFAULT_OFFSET,
      orderBy: { strength: 'desc' },
    });
  });
};
