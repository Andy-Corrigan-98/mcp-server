import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SOCIAL_TOOLS } from '../../tools/social/types.js';
import * as entities from './entities.js';
import * as relationships from './relationships/index.js';

/**
 * Functional social tools implementation
 * Replaces class-based SocialTools with pure function composition
 */

/**
 * Get all available social consciousness tools
 */
export const getTools = (): Record<string, Tool> => {
  return SOCIAL_TOOLS;
};

/**
 * Execute a social consciousness tool operation
 * Routes to the appropriate functional module
 */
export const execute = async (toolName: string, args: Record<string, unknown>): Promise<unknown> => {
  switch (toolName) {
    // Entity Management
    case 'social_entity_create':
      return entities.createEntity(args as any);
    case 'social_entity_update':
      return entities.updateEntity(args as any);
    case 'social_entity_get':
      return getSocialEntity(args);

    // Relationship Management
    case 'social_relationship_create':
      return relationships.createRelationship(args as any);
    case 'social_relationship_update':
      return relationships.updateRelationship(args as any);

    // TODO: Add other tool implementations as we migrate them
    case 'social_interaction_record':
    case 'social_interaction_search':
    case 'emotional_state_record':
    case 'social_learning_record':
    case 'social_context_prepare':
    case 'social_pattern_analyze':
    case 'memory_social_link_create':
    case 'memory_social_search':
    case 'social_memory_context':
      throw new Error(`Tool '${toolName}' not yet migrated to functional approach`);

    default:
      throw new Error(`Unknown social tool: ${toolName}`);
  }
};

/**
 * Get comprehensive information about a social entity
 * Functional equivalent of the class-based getSocialEntity method
 */
const getSocialEntity = async (args: Record<string, unknown>): Promise<any> => {
  const { validateRequiredString, parseJsonSafely } = await import('../../services/validation.js');

  const MAX_ENTITY_NAME_LENGTH = 100;
  const entityName = validateRequiredString(args.name, 'name', MAX_ENTITY_NAME_LENGTH);
  const includeRelationship = args.include_relationship !== false;

  // TODO: Remove these when implementing the full functionality
  // const includeInteractions = args.include_interactions !== false;
  // const includeEmotionalContext = args.include_emotional_context !== false;
  // const includeSharedMemories = args.include_shared_memories !== false;

  // Get basic entity information
  const entity = await entities.getEntityByName(entityName);
  if (!entity) {
    throw new Error(`Social entity '${entityName}' not found`);
  }

  // Get relationship information
  let relationship: any = undefined;
  if (includeRelationship) {
    relationship = await relationships.getRelationshipByEntityId(entity.id);
    if (relationship) {
      // Convert to expected format
      relationship = {
        type: relationship.relationshipType,
        strength: relationship.strength,
        trust: relationship.trust,
        familiarity: relationship.familiarity,
        affinity: relationship.affinity,
        communicationStyle: parseJsonSafely(relationship.communicationStyle, undefined),
        notes: relationship.notes,
      };
    }
  }

  // TODO: Implement these when we migrate the other modules
  const recentInteractions: any[] = [];
  const emotionalPatterns: any[] = [];
  const socialLearnings: any[] = [];

  return {
    entity: {
      name: entity.name,
      entityType: entity.entityType,
      displayName: entity.displayName,
      description: entity.description,
    },
    relationship,
    recentInteractions,
    emotionalPatterns,
    socialLearnings,
    sharedMemories: [],
    memoryInsights: [],
    recommendations: {
      communicationTips: [],
      emotionalPrep: [],
      relationshipGuidance: [],
      memoryReminders: [],
      conversationStarters: [],
    },
  };
};

/**
 * Export the functional social tools interface
 * This can replace the class-based SocialTools
 */
export const FunctionalSocialTools = {
  getTools,
  execute,
};
