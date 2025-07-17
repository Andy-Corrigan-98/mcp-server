import { InputValidator } from '@/validation/input-validator.js';
import { ServiceBase } from '../base/index.js';
import { SocialEntity } from './types.js';

/**
 * Entity Manager for Social Consciousness System
 * Handles creation, updates, and retrieval of social entities
 */
export class SocialEntityManager extends ServiceBase {
  // Configuration for entity management
  private config = {
    maxEntityNameLength: 100,
    maxDisplayNameLength: 150,
    maxDescriptionLength: 500,
  };

  constructor() {
    super();
    this.loadConfiguration();
  }

  /**
   * Load configuration values
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const configs = await this.configService.getConfigurationsByCategory('SOCIAL');
      configs.forEach((config: any) => {
        const key = config.key.replace('social.', '');
        if (key in this.config) {
          (this.config as any)[key] = config.value;
        }
      });
    } catch {
      console.warn('Failed to load social entity configuration');
    }
  }

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
    const name = InputValidator.sanitizeString(args.name, this.config.maxEntityNameLength);
    const entityType = args.entity_type;
    const displayName = args.display_name
      ? InputValidator.sanitizeString(args.display_name, this.config.maxDisplayNameLength)
      : undefined;
    const description = args.description
      ? InputValidator.sanitizeString(args.description, this.config.maxDescriptionLength)
      : undefined;
    const properties = args.properties || {};

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
          properties: JSON.stringify(properties),
        },
      });
    });

    return {
      success: true,
      entity: name,
      entity_type: entityType,
      display_name: displayName,
      entity_id: newEntity.id,
      message: `Social entity '${displayName || name}' created successfully`,
    };
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
    const name = InputValidator.sanitizeString(args.name, this.config.maxEntityNameLength);
    const displayName = args.display_name
      ? InputValidator.sanitizeString(args.display_name, this.config.maxDisplayNameLength)
      : undefined;
    const description = args.description
      ? InputValidator.sanitizeString(args.description, this.config.maxDescriptionLength)
      : undefined;

    // Get existing entity
    const existingEntity = await this.getEntityByName(name);
    if (!existingEntity) {
      throw new Error(`Social entity '${name}' not found`);
    }

    // Merge properties if provided
    let mergedProperties = {};
    if (existingEntity.properties) {
      try {
        mergedProperties = JSON.parse(existingEntity.properties);
      } catch {
        console.warn('Failed to parse existing properties, starting fresh');
      }
    }
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

    return {
      success: true,
      entity: name,
      updated: {
        display_name: updatedEntity.displayName,
        description: updatedEntity.description,
        properties: mergedProperties,
      },
      message: `Social entity '${displayName || name}' updated successfully`,
    };
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
