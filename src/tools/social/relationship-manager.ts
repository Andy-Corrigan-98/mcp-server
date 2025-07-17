import { ConfigurableBase } from './base/configurable-base.js';
import { SocialValidationUtils } from './base/validation-utils.js';
import { SocialResponseBuilder } from './base/response-builder.js';
import { SocialEntityManager } from './entity-manager.js';

/**
 * Relationship Manager for Social Consciousness System
 * Handles relationship creation, updates, and dynamics tracking
 */
export class SocialRelationshipManager extends ConfigurableBase {
  private entityManager: SocialEntityManager;

  // Configuration for relationship management
  protected config = {
    maxNotesLength: 1000,
    relationshipDecayTime: 7776000000, // 90 days in milliseconds
  };

  constructor(entityManager: SocialEntityManager) {
    super();
    this.entityManager = entityManager;
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
    const entityName = SocialValidationUtils.validateRequiredString(args.entity_name, 'entity_name', 100);
    const relationshipType = args.relationship_type;
    const strength = SocialValidationUtils.validateProbability(args.strength, 0.5);
    const trust = SocialValidationUtils.validateProbability(args.trust, 0.5);
    const familiarity = SocialValidationUtils.validateProbability(args.familiarity, 0.1);
    const affinity = SocialValidationUtils.validateProbability(args.affinity, 0.5);
    const communicationStyle = args.communication_style || {};
    const notes = args.notes ? SocialValidationUtils.sanitizeString(args.notes, this.config.maxNotesLength) : null;

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
          communicationStyle: SocialValidationUtils.validateAndStringifyJson(communicationStyle),
          notes,
        },
      });
    });

    return SocialResponseBuilder.relationshipCreated(entityName, relationshipType, newRelationship.id, {
      type: relationshipType,
      strength,
      trust,
      familiarity,
      affinity,
      communication_style: communicationStyle,
      notes,
    });
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
    const entityName = SocialValidationUtils.validateRequiredString(args.entity_name, 'entity_name', 100);
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
      updateData.strength = SocialValidationUtils.validateProbability(args.strength);
    }
    if (args.trust !== undefined) {
      updateData.trust = SocialValidationUtils.validateProbability(args.trust);
    }
    if (args.familiarity !== undefined) {
      updateData.familiarity = SocialValidationUtils.validateProbability(args.familiarity);
    }
    if (args.affinity !== undefined) {
      updateData.affinity = SocialValidationUtils.validateProbability(args.affinity);
    }
    if (args.communication_style !== undefined) {
      // Merge with existing communication style
      const existingStyle = SocialValidationUtils.parseJsonSafely(existingRelationship.communicationStyle || '{}', {});
      updateData.communicationStyle = SocialValidationUtils.validateAndStringifyJson({
        ...existingStyle,
        ...args.communication_style,
      });
    }
    if (args.notes !== undefined) {
      updateData.notes = SocialValidationUtils.sanitizeString(args.notes, this.config.maxNotesLength);
    }

    // Update the relationship
    const updatedRelationship = await this.db.execute(async prisma => {
      return prisma.socialRelationship.update({
        where: { id: existingRelationship.id },
        data: updateData,
      });
    });

    return SocialResponseBuilder.relationshipUpdated(
      entityName,
      {
        type: updatedRelationship.relationshipType,
        strength: updatedRelationship.strength,
        trust: updatedRelationship.trust,
        familiarity: updatedRelationship.familiarity,
        affinity: updatedRelationship.affinity,
      },
      reason
    );
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
    const newStrength = SocialValidationUtils.validateProbability(relationship.strength + totalImpact);
    const newFamiliarity = SocialValidationUtils.validateProbability(
      relationship.familiarity + Math.abs(totalImpact) * 0.5
    );

    // Trust changes more slowly and depends on interaction quality
    let newTrust = relationship.trust;
    if (interactionData.quality > 0.7) {
      newTrust = SocialValidationUtils.validateProbability(newTrust + totalImpact * 0.3);
    } else if (interactionData.quality < 0.3) {
      newTrust = SocialValidationUtils.validateProbability(newTrust + totalImpact * 0.5); // Negative impact on trust
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
