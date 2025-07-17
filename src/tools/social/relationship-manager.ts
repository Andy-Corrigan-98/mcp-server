import { ConsciousnessPrismaService } from '@/db/prisma-service.js';
import { ConfigurationService } from '@/db/configuration-service.js';
import { InputValidator } from '@/validation/input-validator.js';
import { SocialEntityManager } from './entity-manager.js';

/**
 * Relationship Manager for Social Consciousness System
 * Handles relationship creation, updates, and dynamics tracking
 */
export class SocialRelationshipManager {
  private db: ConsciousnessPrismaService;
  private configService: ConfigurationService;
  private entityManager: SocialEntityManager;

  // Configuration for relationship management
  private config = {
    maxNotesLength: 1000,
    relationshipDecayTime: 7776000000, // 90 days in milliseconds
  };

  constructor(entityManager: SocialEntityManager) {
    this.db = ConsciousnessPrismaService.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.entityManager = entityManager;
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
      console.warn('Failed to load relationship configuration');
    }
  }

  /**
   * Create a new relationship
   */
  async createRelationship(args: {
    entity_name: string;
    relationship_type: string;
    strength?: number;
    trust?: number;
    familiarity?: number;
    affinity?: number;
    communication_style?: Record<string, unknown>;
    notes?: string;
  }): Promise<object> {
    const entityName = InputValidator.sanitizeString(args.entity_name, 100);
    const relationshipType = args.relationship_type;
    const strength = Math.max(0, Math.min(1, args.strength ?? 0.5));
    const trust = Math.max(0, Math.min(1, args.trust ?? 0.5));
    const familiarity = Math.max(0, Math.min(1, args.familiarity ?? 0.1));
    const affinity = Math.max(0, Math.min(1, args.affinity ?? 0.5));
    const communicationStyle = args.communication_style || {};
    const notes = args.notes ? InputValidator.sanitizeString(args.notes, this.config.maxNotesLength) : undefined;

    // Get the entity
    const entity = await this.entityManager.getEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }

    // Check if relationship already exists
    const existingRelationship = await this.getRelationshipByEntityId(entity.id);
    if (existingRelationship) {
      throw new Error(`Relationship with '${entityName}' already exists`);
    }

    // Create the relationship
    const newRelationship = await this.db.execute(async prisma => {
      return prisma.socialRelationship.create({
        data: {
          entityId: entity.id,
          relationshipType: relationshipType as any,
          strength,
          trust,
          familiarity,
          affinity,
          communicationStyle: JSON.stringify(communicationStyle),
          notes,
        },
      });
    });

    return {
      success: true,
      entity: entityName,
      relationship: {
        type: relationshipType,
        strength,
        trust,
        familiarity,
        affinity,
        communication_style: communicationStyle,
        notes,
      },
      relationship_id: newRelationship.id,
      message: `Relationship with '${entityName}' established as '${relationshipType}'`,
    };
  }

  /**
   * Update an existing relationship
   */
  async updateRelationship(args: {
    entity_name: string;
    strength?: number;
    trust?: number;
    familiarity?: number;
    affinity?: number;
    communication_style?: Record<string, unknown>;
    notes?: string;
    reason?: string;
  }): Promise<object> {
    const entityName = InputValidator.sanitizeString(args.entity_name, 100);
    const reason = args.reason || 'Manual update';

    // Get the entity
    const entity = await this.entityManager.getEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }

    // Get existing relationship
    const existingRelationship = await this.getRelationshipByEntityId(entity.id);
    if (!existingRelationship) {
      throw new Error(`No relationship found with '${entityName}'`);
    }

    // Prepare update data
    const updateData: any = { updatedAt: new Date() };

    if (args.strength !== undefined) {
      updateData.strength = Math.max(0, Math.min(1, args.strength));
    }
    if (args.trust !== undefined) {
      updateData.trust = Math.max(0, Math.min(1, args.trust));
    }
    if (args.familiarity !== undefined) {
      updateData.familiarity = Math.max(0, Math.min(1, args.familiarity));
    }
    if (args.affinity !== undefined) {
      updateData.affinity = Math.max(0, Math.min(1, args.affinity));
    }
    if (args.communication_style !== undefined) {
      // Merge with existing communication style
      let existingStyle = {};
      try {
        existingStyle = JSON.parse(existingRelationship.communicationStyle || '{}');
      } catch {
        console.warn('Failed to parse existing communication style');
      }
      updateData.communicationStyle = JSON.stringify({
        ...existingStyle,
        ...args.communication_style,
      });
    }
    if (args.notes !== undefined) {
      updateData.notes = InputValidator.sanitizeString(args.notes, this.config.maxNotesLength);
    }

    // Update the relationship
    const updatedRelationship = await this.db.execute(async prisma => {
      return prisma.socialRelationship.update({
        where: { id: existingRelationship.id },
        data: updateData,
      });
    });

    return {
      success: true,
      entity: entityName,
      relationship: {
        type: updatedRelationship.relationshipType,
        strength: updatedRelationship.strength,
        trust: updatedRelationship.trust,
        familiarity: updatedRelationship.familiarity,
        affinity: updatedRelationship.affinity,
      },
      reason,
      message: `Relationship with '${entityName}' updated successfully`,
    };
  }

  /**
   * Get relationship by entity ID
   */
  async getRelationshipByEntityId(entityId: number) {
    return await this.db.execute(async prisma => {
      return prisma.socialRelationship.findFirst({
        where: { entityId },
      });
    });
  }

  /**
   * Update relationship from interaction data
   */
  async updateFromInteraction(
    entityId: number,
    interactionData: {
      quality: number;
      duration?: number;
      interactionType: string;
      learningExtracted?: string;
    }
  ): Promise<void> {
    const relationship = await this.getRelationshipByEntityId(entityId);
    if (!relationship) {
      return; // No relationship to update
    }

    // Calculate relationship impact based on interaction
    const qualityImpact = (interactionData.quality - 0.5) * 0.05; // ±0.025 max
    const durationBonus = interactionData.duration
      ? Math.min(interactionData.duration / 60, 2) * 0.01 // Max 0.02 for 2+ hours
      : 0;
    const learningBonus = interactionData.learningExtracted ? 0.02 : 0;

    // Different interaction types have different impacts
    const interactionTypeMultipliers: Record<string, number> = {
      deep_discussion: 1.5,
      collaboration: 1.3,
      creative_session: 1.4,
      problem_solving: 1.2,
      learning_session: 1.3,
      casual_chat: 0.8,
      conflict_resolution: 2.0, // High impact for resolving conflicts
      celebration: 1.1,
      support_session: 1.6,
    };

    const typeMultiplier = interactionTypeMultipliers[interactionData.interactionType] || 1.0;
    const totalImpact = (qualityImpact + durationBonus + learningBonus) * typeMultiplier;

    // Update relationship metrics
    const newStrength = Math.max(0, Math.min(1, relationship.strength + totalImpact));
    const newFamiliarity = Math.max(0, Math.min(1, relationship.familiarity + Math.abs(totalImpact) * 0.5));

    // Trust changes more slowly and depends on interaction quality
    let newTrust = relationship.trust;
    if (interactionData.quality > 0.7) {
      newTrust = Math.min(1, newTrust + totalImpact * 0.3);
    } else if (interactionData.quality < 0.3) {
      newTrust = Math.max(0, newTrust + totalImpact * 0.5); // Negative impact on trust
    }

    await this.db.execute(async prisma => {
      return prisma.socialRelationship.update({
        where: { id: relationship.id },
        data: {
          strength: newStrength,
          familiarity: newFamiliarity,
          trust: newTrust,
          updatedAt: new Date(),
        },
      });
    });
  }
}
