import { executeDatabase } from '../../../services/database.js';
import { validateRequiredString, sanitizeString, validateAndStringifyJson } from '../../../services/validation.js';
import { entityCreatedResponse } from '../../../utils/responses.js';
import { loadEntityConfig } from './load-config.js';
import { getEntityByName } from './get-by-name.js';
import type { SocialEntityType } from '@prisma/client';

/**
 * Entity creation
 * Single responsibility: Creating new social entities
 */

/**
 * Create a new social entity
 */
export const createEntity = async (args: {
  name: string;
  entity_type: string;
  display_name?: string;
  description?: string;
  properties?: Record<string, unknown>;
}): Promise<object> => {
  const config = await loadEntityConfig();

  // Validate and sanitize inputs
  const name = validateRequiredString(args.name, 'name', config.maxEntityNameLength);
  const entityType = args.entity_type as SocialEntityType;
  const displayName = sanitizeString(args.display_name, config.maxDisplayNameLength);
  const description = sanitizeString(args.description, config.maxDescriptionLength);
  const properties = validateAndStringifyJson(args.properties);

  // Check if entity already exists
  const existing = await getEntityByName(name);
  if (existing) {
    throw new Error(`Social entity '${name}' already exists`);
  }

  // Create the entity
  const newEntity = await executeDatabase(async prisma => {
    return prisma.socialEntity.create({
      data: {
        name,
        entityType,
        displayName,
        description,
        properties,
      },
    });
  });

  return entityCreatedResponse(name, entityType, newEntity.id, displayName);
};
