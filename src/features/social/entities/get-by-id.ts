import { executeDatabase } from '../../../services/database.js';
import { SocialEntity } from '../../../tools/social/types.js';

/**
 * Entity retrieval by ID
 * Single responsibility: ID-based entity queries
 */

/**
 * Get a social entity by ID
 */
export const getEntityById = async (id: number): Promise<SocialEntity | null> => {
  const result = await executeDatabase(async prisma => {
    return prisma.socialEntity.findUnique({
      where: { id },
    });
  });

  if (!result) return null;

  // Transform null values to undefined to match interface
  return {
    ...result,
    displayName: result.displayName ?? undefined,
    description: result.description ?? undefined,
    lastInteraction: result.lastInteraction ?? undefined,
  };
};
