import { RailroadContext } from '../types.js';
import * as social from '../../../social/index.js';

/**
 * Social Context Railroad Car
 * 
 * Adds social relationship context when entities are mentioned in the message.
 * Records interactions and retrieves relationship dynamics.
 */
export async function socialContextCar(context: RailroadContext): Promise<RailroadContext> {
  
  // Skip social operations if not required by analysis
  if (!context.analysis?.requires_social || !context.analysis?.entities_mentioned.length) {
    return {
      ...context,
      socialContext: {
        activeRelationships: [],
        recentInteractions: [],
        entityMentioned: undefined,
        relationshipDynamics: undefined
      }
    };
  }

  try {
    const entitiesMentioned = context.analysis.entities_mentioned;
    const activeRelationships: any[] = [];
    const recentInteractions: any[] = [];
    let primaryEntity: string | undefined;
    let relationshipDynamics: any = undefined;

    // Process each mentioned entity
    for (const entityName of entitiesMentioned) {
      try {
        // Get entity information and relationship context
        const entityContext = await social.execute('social_entity_get', {
          name: entityName,
          include_relationship: true,
          include_interactions: true,
          include_shared_memories: true
        });

        if (entityContext && typeof entityContext === 'object') {
          activeRelationships.push(entityContext);
          
          // Set primary entity (first one found)
          if (!primaryEntity) {
            primaryEntity = entityName;
            relationshipDynamics = entityContext;
          }
        }

        // Record this interaction
        await social.execute('social_interaction_record', {
          entity_name: entityName,
          interaction_type: 'conversation',
          summary: context.message.substring(0, 200), // Truncate for summary
          context: context.originalContext || 'General conversation',
          quality: 0.8, // Default quality
        });

        // Search for recent interactions
        const recentInteractionSearch = await social.execute('social_interaction_search', {
          entity_name: entityName,
          limit: 5
        });

        if (recentInteractionSearch && typeof recentInteractionSearch === 'object') {
          const interactions = (recentInteractionSearch as any).interactions || [];
          recentInteractions.push(...interactions);
        }

      } catch (error) {
        // If we can't find/process this entity, log but continue
        context.errors.push({
          car: 'social-context',
          error: `Failed to process entity '${entityName}': ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: true
        });
      }
    }

    // Add social context to railroad
    return {
      ...context,
      socialContext: {
        activeRelationships,
        recentInteractions,
        entityMentioned: primaryEntity,
        relationshipDynamics
      },
      operations: {
        ...context.operations,
        social_interactions: [
          ...context.operations.social_interactions,
          ...entitiesMentioned.map(entity => `Recorded interaction with ${entity}`)
        ]
      }
    };
    
  } catch (error) {
    // If social operations fail, add error but continue
    return {
      ...context,
      socialContext: {
        activeRelationships: [],
        recentInteractions: [],
        entityMentioned: undefined,
        relationshipDynamics: undefined
      },
      errors: [
        ...context.errors,
        {
          car: 'social-context',
          error: error instanceof Error ? error.message : 'Unknown social error',
          recoverable: true
        }
      ]
    };
  }
}

/**
 * Helper function to extract communication style preferences from relationship context
 */
function extractCommunicationStyle(relationshipDynamics: any): string {
  if (!relationshipDynamics?.relationship?.communicationStyle) {
    return 'neutral';
  }

  const commStyle = relationshipDynamics.relationship.communicationStyle;
  
  // Map communication style to simple descriptors
  if (commStyle.formal) return 'formal';
  if (commStyle.casual) return 'casual';
  if (commStyle.technical) return 'technical';
  if (commStyle.playful) return 'playful';
  if (commStyle.supportive) return 'supportive';
  
  return 'adaptive';
}

/**
 * Helper function to determine relationship strength level
 */
function getRelationshipStrength(relationshipDynamics: any): 'weak' | 'moderate' | 'strong' {
  if (!relationshipDynamics?.relationship?.strength) {
    return 'moderate';
  }

  const strength = relationshipDynamics.relationship.strength;
  
  if (strength >= 0.8) return 'strong';
  if (strength >= 0.5) return 'moderate';
  return 'weak';
}