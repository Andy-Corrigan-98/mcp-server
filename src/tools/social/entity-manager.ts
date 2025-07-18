import { SocialEntity } from './types.js';
import { ConfigurableBase, SocialValidationUtils, SocialResponseBuilder } from './base/index.js';

/**
 * Entity Manager for Social Consciousness System
 * Handles creation, updates, and retrieval of social entities using base classes and utilities
 */
export class SocialEntityManager extends ConfigurableBase {
  // Configuration for entity management
  protected config = {
    maxEntityNameLength: 100,
    maxDisplayNameLength: 150,
    maxDescriptionLength: 500,
  };

  /**
   * Create a new social entity
   */
  async createEntity(args: {
    name: string;
    entity_type: string;
    display_name?: string;
    description?: string;
    properties?: Record<string, unknown>;
  }): Promise<object> {
    // Validate and sanitize inputs using utilities
    const name = SocialValidationUtils.validateRequiredString(
      args.name,
      'name',
      this.getConfig<number>('maxEntityNameLength')
    );
    const entityType = args.entity_type;
    const displayName = SocialValidationUtils.sanitizeString(
      args.display_name,
      this.getConfig<number>('maxDisplayNameLength')
    );
    const description = SocialValidationUtils.sanitizeString(
      args.description,
      this.getConfig<number>('maxDescriptionLength')
    );
    const properties = SocialValidationUtils.validateAndStringifyJson(args.properties);

    // Check if entity already exists
    const existing = await this.getEntityByName(name);
    if (existing) {
      throw new Error(`Social entity '${name}' already exists`);
    }

    // Create the entity
    const newEntity = await this.db.execute(async prisma => {
      return prisma.socialEntity.create({
        data: {
          name,
          entityType: entityType as any,
          displayName,
          description,
          properties,
        },
      });
    });

    // Return standardized response using response builder
    return SocialResponseBuilder.entityCreated(name, entityType, newEntity.id, displayName);
  }

  /**
   * Update an existing social entity
   */
  async updateEntity(args: {
    name: string;
    display_name?: string;
    description?: string;
    properties?: Record<string, unknown>;
  }): Promise<object> {
    const name = SocialValidationUtils.validateRequiredString(
      args.name,
      'name',
      this.getConfig<number>('maxEntityNameLength')
    );
    const displayName = SocialValidationUtils.sanitizeString(
      args.display_name,
      this.getConfig<number>('maxDisplayNameLength')
    );
    const description = SocialValidationUtils.sanitizeString(
      args.description,
      this.getConfig<number>('maxDescriptionLength')
    );

    // Get existing entity
    const existingEntity = await this.getEntityByName(name);
    if (!existingEntity) {
      throw new Error(`Social entity '${name}' not found`);
    }

    // Merge properties if provided
    let mergedProperties = SocialValidationUtils.parseJsonSafely(existingEntity.properties, {});
    if (args.properties) {
      mergedProperties = { ...mergedProperties, ...args.properties };
    }

    // Update the entity
    const updatedEntity = await this.db.execute(async prisma => {
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

    // Return standardized response
    return SocialResponseBuilder.entityUpdated(
      name,
      {
        display_name: updatedEntity.displayName,
        description: updatedEntity.description,
        properties: mergedProperties,
      },
      displayName
    );
  }

  /**
   * Get a social entity by name
   */
  async getEntityByName(name: string): Promise<SocialEntity | null> {
    const result = await this.db.execute(async prisma => {
      return prisma.socialEntity.findUnique({
        where: { name },
      });
    });

    if (!result) return null;

    // Convert null to undefined for compatibility with SocialEntity interface
    return {
      ...result,
      displayName: result.displayName ?? undefined,
      description: result.description ?? undefined,
      properties: result.properties ?? undefined,
      lastInteraction: result.lastInteraction ?? undefined,
    };
  }

  /**
   * Update entity's last interaction timestamp
   */
  async updateLastInteraction(entityId: number): Promise<void> {
    await this.db.execute(async prisma => {
      return prisma.socialEntity.update({
        where: { id: entityId },
        data: { lastInteraction: new Date() },
      });
    });
  }
}
