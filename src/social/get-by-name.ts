import { getEntityByName } from '../entities/index.js';
import { getRelationshipByEntityId } from './get-by-id.js';

/**
 * Relationship retrieval by name
 * Single responsibility: Get relationships by entity name only
 */

/**
 * Get relationship by entity name
 * Single responsibility: Name-based relationship lookup
 */
export const getRelationshipByEntityName = async (entityName: string): Promise<any | null> => {
  const entity = await getEntityByName(entityName);
  if (!entity) {
    return null;
  }

  return getRelationshipByEntityId(entity.id);
};








