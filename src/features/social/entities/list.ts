import { executeDatabase } from '../../../services/database.js';
import { SocialEntity } from '../../../tools/social/types.js';

/**
 * Entity listing and filtering
 * Single responsibility: Querying and filtering entity collections
 */

/**
 * List all social entities with optional filtering
 */
export const listEntities = async (filters?: {
  entityType?: string;
  limit?: number;
  offset?: number;
}): Promise<SocialEntity[]> => {
  const results = await executeDatabase(async prisma => {
    const where: Record<string, unknown> = {};
    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    return prisma.socialEntity.findMany({
      where,
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
      orderBy: { createdAt: 'desc' },
    });
  });

  // Transform null values to undefined to match interface
  return results.map(result => ({
    ...result,
    displayName: result.displayName ?? undefined,
    description: result.description ?? undefined,
    lastInteraction: result.lastInteraction ?? undefined,
  }));
};
