/**
 * Get Social Entity by Name - v2 Consciousness Substrate
 * Core function for retrieving social entities by name
 */

import { executeDatabase } from '../core/services/database.js';

/**
 * Get a social entity by name
 */
export async function getEntityByName(name: string) {
  if (!name || typeof name !== 'string') {
    return { success: false, error: 'Entity name is required' };
  }

  const result = await executeDatabase(async (prisma) => {
    return prisma.socialEntity.findUnique({
      where: { name: name.trim() },
      include: {
        relationships: true,
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  if (!result.data) {
    return { success: false, error: `Entity '${name}' not found` };
  }

  return { success: true, data: result.data };
}

// Re-export for compatibility
export { executeDatabase } from '../core/services/database.js';