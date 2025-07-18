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

  return result || null;
};
