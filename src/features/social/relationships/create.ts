import { executeDatabase } from '../../../services/database.js';
import {
  validateRequiredString,
  sanitizeString,
  validateProbability,
  validateAndStringifyJson,
} from '../../../services/validation.js';
import { relationshipCreatedResponse } from '../../../utils/responses.js';
import { getEntityByName } from '../entities/index.js';
import { loadRelationshipConfig } from './load-config.js';
import { getRelationshipByEntityId } from './get-by-id.js';

/**
 * Relationship creation functionality
 * Single responsibility: Create new relationships only
 */

/**
 * Create a new relationship
 * Single responsibility: Relationship creation logic
 */
export const createRelationship = async (args: {
  entity_name: string;
  relationship_type: string;
  strength?: number;
  trust?: number;
  familiarity?: number;
  affinity?: number;
  communication_style?: Record<string, unknown>;
  notes?: string;
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
  const relationshipType = args.relationship_type;
  const strength = validateProbability(args.strength, DEFAULT_STRENGTH);
  const trust = validateProbability(args.trust, DEFAULT_TRUST);
  const familiarity = validateProbability(args.familiarity, DEFAULT_FAMILIARITY);
  const affinity = validateProbability(args.affinity, DEFAULT_AFFINITY);
  const communicationStyle = validateAndStringifyJson(args.communication_style);
  const notes = sanitizeString(args.notes, config.maxNotesLength);

  // Get the entity
  const entity = await getEntityByName(entityName);
  if (!entity) {
    throw new Error(`Social entity '${entityName}' not found`);
  }

  // Check if relationship already exists
  const existing = await getRelationshipByEntityId(entity.id);
  if (existing) {
    throw new Error(`Relationship already exists for entity '${entityName}'`);
  }

  // Create the relationship
  const newRelationship = await executeDatabase(async prisma => {
    return prisma.socialRelationship.create({
      data: {
        socialEntityId: entity.id,
        relationshipType: relationshipType as any,
        strength,
        trust,
        familiarity,
        affinity,
        communicationStyle,
        notes,
      },
    });
  });

  return relationshipCreatedResponse(entityName, relationshipType, newRelationship.id);
};
