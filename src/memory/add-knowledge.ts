import { KnowledgeEntityData, KnowledgeRelationshipData } from '../core/db/index.js';
import { InputValidator } from '../core/validation/index.js';
import { ConsciousnessPrismaService } from '../core/db/prisma-service.js';
import { ConfigurationService } from '../core/db/configuration-service.js';

/**
 * Add nodes and relationships to agent knowledge graph
 */
export async function addToKnowledgeGraph(args: {
  entity: string;
  entity_type: string;
  properties?: Record<string, unknown>;
  relationships?: Array<{
    target: string;
    relationship: string;
    strength?: number;
  }>;
}): Promise<{
  success: boolean;
  entity: string;
  relationships_added: number;
  message: string;
}> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Get configuration values
  const maxEntityTypeLength = await config.getNumber('memory.max_entity_type_length', 100);
  const maxRelationshipTypeLength = await config.getNumber('memory.max_relationship_type_length', 100);

  // Validate and sanitize inputs
  const entityName = InputValidator.validateEntityName(args.entity);
  const entityType = InputValidator.sanitizeString(args.entity_type, maxEntityTypeLength);
  const properties = args.properties || {};
  const relationships = args.relationships || [];

  // Add the entity
  const entityData: KnowledgeEntityData = {
    name: entityName,
    entityType,
    properties,
  };

  await db.addEntity(entityData);

  // Add relationships
  for (const rel of relationships) {
    const targetName = InputValidator.validateEntityName(rel.target);
    const relationshipType = InputValidator.sanitizeString(rel.relationship, maxRelationshipTypeLength);
    const strength = typeof rel.strength === 'number' ? Math.max(0, Math.min(1, rel.strength)) : 1.0;

    const relationshipData: KnowledgeRelationshipData = {
      sourceEntityName: entityName,
      targetEntityName: targetName,
      relationshipType,
      strength,
    };

    await db.addRelationship(relationshipData);
  }

  return {
    success: true,
    entity: entityName,
    relationships_added: relationships.length,
    message: `Entity '${entityName}' added to knowledge graph with ${relationships.length} relationships`,
  };
}








