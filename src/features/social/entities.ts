import { executeDatabase } from '../../services/database.js';
import { loadConfiguration } from '../../services/configuration.js';
import {
  validateRequiredString,
  sanitizeString,
  validateAndStringifyJson,
  parseJsonSafely,
} from '../../services/validation.js';
import { entityCreatedResponse, entityUpdatedResponse } from '../../utils/responses.js';
import { SocialEntity } from '../../tools/social/types.js';

/**
 * Functional entity management
 * Replaces SocialEntityManager class with pure functions
 */

// Configuration interface
interface EntityConfig extends Record<string, unknown> {
  maxEntityNameLength: number;
  maxDisplayNameLength: number;
  maxDescriptionLength: number;
}

// Default configuration
const DEFAULT_CONFIG: EntityConfig = {
  maxEntityNameLength: 100,
  maxDisplayNameLength: 150,
  maxDescriptionLength: 500,
};

/**
 * Load entity configuration
 */
export const loadEntityConfig = async (): Promise<EntityConfig> => {
  return loadConfiguration('SOCIAL', DEFAULT_CONFIG, 'social');
};

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
  const entityType = args.entity_type;
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

/**
 * Update an existing social entity
 */
export const updateEntity = async (args: {
  name: string;
  display_name?: string;
  description?: string;
  properties?: Record<string, unknown>;
}): Promise<object> => {
  const config = await loadEntityConfig();

  // Validate inputs
  const name = validateRequiredString(args.name, 'name', config.maxEntityNameLength);
  const displayName = sanitizeString(args.display_name, config.maxDisplayNameLength);
  const description = sanitizeString(args.description, config.maxDescriptionLength);

  // Get existing entity
  const existingEntity = await getEntityByName(name);
  if (!existingEntity) {
    throw new Error(`Social entity '${name}' not found`);
  }

  // Merge properties if provided
  let mergedProperties = parseJsonSafely(existingEntity.properties, {});
  if (args.properties) {
    mergedProperties = { ...mergedProperties, ...args.properties };
  }

  // Update the entity
  const updatedEntity = await executeDatabase(async prisma => {
    return prisma.socialEntity.update({
      where: { name },
      data: {
        displayName: displayName !== undefined ? displayName : existingEntity.displayName,
        description: description !== undefined ? description : existingEntity.description,
        properties: JSON.stringify(mergedProperties),
        updatedAt: new Date(),
      },
    });
  });

  return entityUpdatedResponse(
    name,
    {
      display_name: updatedEntity.displayName,
      description: updatedEntity.description,
      properties: mergedProperties,
    },
    displayName
  );
};

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

/**
 * List all social entities with optional filtering
 */
export const listEntities = async (filters?: {
  entityType?: string;
  limit?: number;
  offset?: number;
}): Promise<SocialEntity[]> => {
  return executeDatabase(async prisma => {
    const where: Record<string, unknown> = {};
    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    return prisma.socialEntity.findMany({
      where,
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
      orderBy: { createdAt: 'desc' },
    });
  });
};

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
