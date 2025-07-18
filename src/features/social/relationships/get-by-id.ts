import { executeDatabase } from '../../../services/database.js';

/**
 * Relationship retrieval by ID
 * Single responsibility: Get relationships by entity ID only
 */

/**
 * Get relationship by entity ID
 * Single responsibility: ID-based relationship lookup
 */
export const getRelationshipByEntityId = async (entityId: number): Promise<any | null> => {
  const result = await executeDatabase(async prisma => {
    return prisma.socialRelationship.findUnique({
      where: { socialEntityId: entityId },
    });
  });

  return result || null;
};
