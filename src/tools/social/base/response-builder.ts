/**
 * Standard response builder for social consciousness modules
 * Ensures consistent response format across all modules
 */
export class SocialResponseBuilder {
  /**
   * Build a standard success response
   */
  static success(data: Record<string, any>, message?: string): object {
    return {
      success: true,
      ...data,
      ...(message && { message }),
    };
  }

  /**
   * Build an entity creation response
   */
  static entityCreated(
    entityName: string,
    entityType: string,
    entityId: number,
    displayName?: string,
    additionalData?: Record<string, any>
  ): object {
    return this.success(
      {
        entity: entityName,
        entity_type: entityType,
        entity_id: entityId,
        ...(displayName && { display_name: displayName }),
        ...additionalData,
      },
      `Social entity '${displayName || entityName}' created successfully`
    );
  }

  /**
   * Build an entity update response
   */
  static entityUpdated(entityName: string, updates: Record<string, any>, displayName?: string): object {
    return this.success(
      {
        entity: entityName,
        updated: updates,
      },
      `Social entity '${displayName || entityName}' updated successfully`
    );
  }

  /**
   * Build a relationship creation response
   */
  static relationshipCreated(
    entityName: string,
    relationshipType: string,
    relationshipId: number,
    relationshipData: Record<string, any>
  ): object {
    return this.success(
      {
        entity: entityName,
        relationship: relationshipData,
        relationship_id: relationshipId,
      },
      `Relationship with '${entityName}' established as '${relationshipType}'`
    );
  }

  /**
   * Build a relationship update response
   */
  static relationshipUpdated(entityName: string, relationshipData: Record<string, any>, reason?: string): object {
    return this.success(
      {
        entity: entityName,
        relationship: relationshipData,
        ...(reason && { reason }),
      },
      `Relationship with '${entityName}' updated successfully`
    );
  }

  /**
   * Build an interaction record response
   */
  static interactionRecorded(
    interaction: Record<string, any>,
    entityName: string,
    relatedMemories: string[] = [],
    relationshipUpdated: boolean = false
  ): object {
    return this.success(
      {
        interaction,
        relationship_updated: relationshipUpdated,
        related_memories: relatedMemories,
      },
      `Interaction with '${entityName}' recorded successfully`
    );
  }

  /**
   * Build a search results response
   */
  static searchResults<T>(results: T[], filters: Record<string, any>, entityType: string = 'items'): object {
    return this.success(
      {
        [entityType]: results,
        total_found: results.length,
        filters_applied: filters,
      },
      `Found ${results.length} ${entityType}`
    );
  }

  /**
   * Build a learning/state record response
   */
  static recordCreated(recordType: string, recordData: Record<string, any>, entityName?: string): object {
    return this.success(
      {
        [recordType]: recordData,
      },
      `${recordType.replace('_', ' ')} recorded successfully${entityName ? ` for ${entityName}` : ''}`
    );
  }

  /**
   * Build a memory link response
   */
  static memoryLinked(memoryKey: string, entityName: string, linkType: string, linkData: Record<string, any>): object {
    return this.success(
      {
        memory_social_link: linkData,
      },
      `Memory '${memoryKey}' linked to entity '${entityName}' with type '${linkType}'`
    );
  }
}
