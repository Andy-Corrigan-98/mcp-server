import { executeDatabase } from '../../../services/database.js';
import { validateRequiredString, sanitizeString } from '../../../services/validation.js';
import { ResponseBuilder } from '../../../utils/response-builder.js';
import { getEntityByName } from '../entities/get-by-name.js';

/**
 * Memory-social link creation
 * Single responsibility: Creating connections between memories and social entities/interactions
 */

/**
 * Create a connection between a memory and social entity/interaction
 */
export const createMemorySocialLink = async (args: {
  memory_key: string;
  entity_name: string;
  interaction_id?: number;
  link_type: string;
  strength?: number;
  context?: string;
}): Promise<object> => {
  // Validate inputs
  const memoryKey = validateRequiredString(args.memory_key, 'memory_key', 100);
  const entityName = validateRequiredString(args.entity_name, 'entity_name', 100);
  const linkType = validateRequiredString(args.link_type, 'link_type', 50);
  const strength = Math.max(0, Math.min(1, args.strength ?? 0.8));
  const context = sanitizeString(args.context, 500);

  // Get the entity
  const entity = await getEntityByName(entityName);
  if (!entity) {
    throw new Error(`Social entity '${entityName}' not found`);
  }

  // Check if memory exists (simplified check for now)
  const memoryExists = await executeDatabase(async prisma => {
    const memory = await prisma.memory.findFirst({
      where: { key: memoryKey },
    });
    return !!memory;
  });

  if (!memoryExists) {
    throw new Error(`Memory with key '${memoryKey}' not found`);
  }

  // Validate interaction if specified
  if (args.interaction_id) {
    const interactionExists = await executeDatabase(async prisma => {
      const interaction = await prisma.socialInteraction.findFirst({
        where: { 
          id: args.interaction_id,
          entityId: entity.id,
        },
      });
      return !!interaction;
    });

    if (!interactionExists) {
      throw new Error(`Interaction ${args.interaction_id} not found for entity '${entityName}'`);
    }
  }

  // Create the memory-social link
  const link = await executeDatabase(async prisma => {
    return prisma.memorySocialLink.create({
      data: {
        memoryKey,
        socialEntityId: entity.id,
        interactionId: args.interaction_id,
        relationshipType: linkType,
        strength,
        context,
      },
    });
  });

  return ResponseBuilder.success({
    link: {
      id: link.id,
      memory_key: memoryKey,
      entity_name: entityName,
      interaction_id: args.interaction_id,
      link_type: linkType,
      strength,
      created_at: link.createdAt,
    },
  }, `Memory-social link created between '${memoryKey}' and '${entityName}'`);
}; 