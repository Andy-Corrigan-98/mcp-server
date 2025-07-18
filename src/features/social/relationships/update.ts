import { executeDatabase } from '../../../services/database.js';
import {
  validateRequiredString,
  sanitizeString,
  validateProbability,
  validateAndStringifyJson,
} from '../../../services/validation.js';
import { getEntityByName } from '../entities/index.js';
import { loadRelationshipConfig } from './load-config.js';
import { getRelationshipByEntityId } from './get-by-id.js';

/**
 * Relationship update functionality
 * Single responsibility: Update existing relationships only
 */

/**
 * Update an existing relationship
 * Single responsibility: Relationship update logic
 */
export const updateRelationship = async (args: {
  entity_name: string;
  strength?: number;
  trust?: number;
  familiarity?: number;
  affinity?: number;
  communication_style?: Record<string, unknown>;
  notes?: string;
  reason?: string;
}): Promise<object> => {
  const config = await loadRelationshipConfig();

  // Constants for magic numbers
  const MAX_ENTITY_NAME_LENGTH = 100;
  const DEFAULT_STRENGTH = 0.5;
  const DEFAULT_TRUST = 0.5;
  const DEFAULT_FAMILIARITY = 0.1;
  const DEFAULT_AFFINITY = 0.5;

  // Validate inputs
  const entityName = validateRequiredString(args.entity_name, 'entity_name', MAX_ENTITY_NAME_LENGTH);
  const notes = sanitizeString(args.notes, config.maxNotesLength);

  // Get the entity
  const entity = await getEntityByName(entityName);
  if (!entity) {
    throw new Error(`Social entity '${entityName}' not found`);
  }

  // Get existing relationship
  const existingRelationship = await getRelationshipByEntityId(entity.id);
  if (!existingRelationship) {
    throw new Error(`No relationship found for entity '${entityName}'`);
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (args.strength !== undefined) updateData.strength = validateProbability(args.strength, DEFAULT_STRENGTH);
  if (args.trust !== undefined) updateData.trust = validateProbability(args.trust, DEFAULT_TRUST);
  if (args.familiarity !== undefined)
    updateData.familiarity = validateProbability(args.familiarity, DEFAULT_FAMILIARITY);
  if (args.affinity !== undefined) updateData.affinity = validateProbability(args.affinity, DEFAULT_AFFINITY);
  if (args.communication_style !== undefined)
    updateData.communicationStyle = validateAndStringifyJson(args.communication_style);
  if (notes !== undefined) updateData.notes = notes;

  // Update the relationship
  const updatedRelationship = await executeDatabase(async prisma => {
    return prisma.socialRelationship.update({
      where: { id: existingRelationship.id },
      data: updateData,
    });
  });

  return {
    success: true,
    entity: entityName,
    relationship_id: updatedRelationship.id,
    updated: updateData,
    message: `Relationship for '${entityName}' updated successfully`,
  };
};
