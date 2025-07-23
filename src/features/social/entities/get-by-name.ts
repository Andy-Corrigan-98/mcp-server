import { executeDatabase } from '../../../services/database.js';
import { SocialEntity } from '../../../tools/social/types.js';

/**
 * Entity retrieval by name
 * Single responsibility: Name-based entity queries
 */

/**
 * Get a social entity by name
 */
export const getEntityByName = async (name: string): Promise<SocialEntity | null> => {
  const result = await executeDatabase(async prisma => {
    return prisma.socialEntity.findUnique({
      where: { name },
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
