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

  return result || null;
};
