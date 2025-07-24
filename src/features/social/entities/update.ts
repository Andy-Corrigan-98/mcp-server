import { executeDatabase } from '../../../services/database.js';
import { validateRequiredString, sanitizeString, parseJsonSafely } from '../../../services/validation.js';
import { entityUpdatedResponse } from '../../../utils/responses.js';
import { loadEntityConfig } from './load-config.js';
import { getEntityByName } from './get-by-name.js';

/**
 * Entity updating
 * Single responsibility: Modifying existing social entities
 */

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
