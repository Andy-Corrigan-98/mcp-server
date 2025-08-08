import { executeDatabase } from '../core/services/database.js';
import { getEntityByName } from './get-by-name.js'; // V2 import path
import { getRelationshipByEntityId } from './get-by-id.js';

/**
 * Relationship deletion functionality
 * Single responsibility: Delete relationships only
 */

/**
 * Delete a relationship
 * Single responsibility: Relationship deletion logic
 */
export const deleteRelationship = async (entityName: string): Promise<void> => {
  const entity = await getEntityByName(entityName);
  if (!entity) {
    throw new Error(`Social entity '${entityName}' not found`);
  }

  const relationship = await getRelationshipByEntityId((entity as any).id || entity.data?.id || 0); // V2 data access
  if (!relationship) {
    throw new Error(`No relationship found for entity '${entityName}'`);
  }

  await executeDatabase(async prisma => {
    return prisma.socialRelationship.delete({
      where: { id: relationship.id },
    });
  });
};
