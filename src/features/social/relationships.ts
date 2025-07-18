import { executeDatabase } from '../../services/database.js';
import { loadConfiguration } from '../../services/configuration.js';
import {
  validateRequiredString,
  sanitizeString,
  validateProbability,
  validateAndStringifyJson,
} from '../../services/validation.js';
import { relationshipCreatedResponse } from '../../utils/responses.js';
import { getEntityByName } from './entities.js';

/**
 * Functional relationship management
 * Replaces SocialRelationshipManager class with pure functions
 */

// Configuration interface
interface RelationshipConfig extends Record<string, unknown> {
  maxNotesLength: number;
  relationshipDecayTime: number;
}

// Default configuration
const DEFAULT_CONFIG: RelationshipConfig = {
  maxNotesLength: 1000,
  relationshipDecayTime: 7776000000, // 90 days in milliseconds
};

/**
 * Load relationship configuration
 */
export const loadRelationshipConfig = async (): Promise<RelationshipConfig> => {
  return loadConfiguration('SOCIAL', DEFAULT_CONFIG, 'social');
};

/**
 * Create a new relationship
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

  // Validate inputs
  const MAX_ENTITY_NAME_LENGTH = 100;
  const DEFAULT_STRENGTH = 0.5;
  const DEFAULT_TRUST = 0.5;
  const DEFAULT_FAMILIARITY = 0.1;
  const DEFAULT_AFFINITY = 0.5;

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

/**
 * Update an existing relationship
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

  // Validate inputs
  const entityName = validateRequiredString(args.entity_name, 'entity_name', 100);
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
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (args.strength !== undefined) updateData.strength = validateProbability(args.strength, 0.5);
  if (args.trust !== undefined) updateData.trust = validateProbability(args.trust, 0.5);
  if (args.familiarity !== undefined) updateData.familiarity = validateProbability(args.familiarity, 0.1);
  if (args.affinity !== undefined) updateData.affinity = validateProbability(args.affinity, 0.5);
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

/**
 * Get relationship by entity ID
 */
export const getRelationshipByEntityId = async (entityId: number): Promise<any | null> => {
  const result = await executeDatabase(async prisma => {
    return prisma.socialRelationship.findUnique({
      where: { socialEntityId: entityId },
    });
  });

  return result || null;
};

/**
 * Get relationship by entity name
 */
export const getRelationshipByEntityName = async (entityName: string): Promise<any | null> => {
  const entity = await getEntityByName(entityName);
  if (!entity) {
    return null;
  }

  return getRelationshipByEntityId(entity.id);
};

/**
 * List all relationships with optional filtering
 */
export const listRelationships = async (filters?: {
  relationshipType?: string;
  minStrength?: number;
  limit?: number;
  offset?: number;
}): Promise<any[]> => {
  return executeDatabase(async prisma => {
    const where: any = {};
    if (filters?.relationshipType) {
      where.relationshipType = filters.relationshipType;
    }
    if (filters?.minStrength !== undefined) {
      where.strength = { gte: filters.minStrength };
    }

    return prisma.socialRelationship.findMany({
      where,
      include: {
        socialEntity: true,
      },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
      orderBy: { strength: 'desc' },
    });
  });
};

/**
 * Delete a relationship
 */
export const deleteRelationship = async (entityName: string): Promise<void> => {
  const entity = await getEntityByName(entityName);
  if (!entity) {
    throw new Error(`Social entity '${entityName}' not found`);
  }

  const relationship = await getRelationshipByEntityId(entity.id);
  if (!relationship) {
    throw new Error(`No relationship found for entity '${entityName}'`);
  }

  await executeDatabase(async prisma => {
    return prisma.socialRelationship.delete({
      where: { id: relationship.id },
    });
  });
};
