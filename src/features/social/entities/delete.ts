import { executeDatabase } from '../../../services/database.js';
import { getEntityByName } from './get-by-name.js';

/**
 * Entity deletion
 * Single responsibility: Removing social entities
 */

/**
 * Delete a social entity
 */
export const deleteEntity = async (name: string): Promise<void> => {
  const existing = await getEntityByName(name);
  if (!existing) {
    throw new Error(`Social entity '${name}' not found`);
  }

  await executeDatabase(async prisma => {
    return prisma.socialEntity.delete({
      where: { name },
    });
  });
};
