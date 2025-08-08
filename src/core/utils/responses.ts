/**
 * Pure response builder functions
 * Pure functions for building social response objects
 */

/**
 * Standard success response for entity creation
 */
export const entityCreatedResponse = (name: string, entityType: string, entityId: number, displayName?: string) => ({
  success: true,
  entity: name,
  entity_type: entityType,
  entity_id: entityId,
  display_name: displayName,
  message: `Social entity '${displayName || name}' created successfully`,
});

/**
 * Standard success response for entity updates
 */
export const entityUpdatedResponse = (name: string, updated: Record<string, unknown>, displayName?: string) => ({
  success: true,
  entity: name,
  updated,
  message: `Social entity '${displayName || name}' updated successfully`,
});

/**
 * Standard success response for relationship creation
 */
export const relationshipCreatedResponse = (entityName: string, relationshipType: string, relationshipId: number) => ({
  success: true,
  entity: entityName,
  relationship_type: relationshipType,
  relationship_id: relationshipId,
  message: `Relationship '${relationshipType}' created for '${entityName}'`,
});

/**
 * Standard success response for interaction recording
 */
export const interactionRecordedResponse = (
  entityName: string,
  interactionType: string,
  interactionId: number,
  quality?: number
) => ({
  success: true,
  interaction_id: interactionId,
  entity: entityName,
  type: interactionType,
  quality,
  message: `Interaction with '${entityName}' recorded successfully`,
});

/**
 * Standard error response
 */
export const errorResponse = (error: string, context?: string) => ({
  success: false,
  error,
  context,
});

/**
 * Response builders interface
 */
export interface ResponseBuilders {
  entityCreated: typeof entityCreatedResponse;
  entityUpdated: typeof entityUpdatedResponse;
  relationshipCreated: typeof relationshipCreatedResponse;
  interactionRecorded: typeof interactionRecordedResponse;
  error: typeof errorResponse;
}

/**
 * Create response builders service
 */
export const createResponseBuilders = (): ResponseBuilders => ({
  entityCreated: entityCreatedResponse,
  entityUpdated: entityUpdatedResponse,
  relationshipCreated: relationshipCreatedResponse,
  interactionRecorded: interactionRecordedResponse,
  error: errorResponse,
});
