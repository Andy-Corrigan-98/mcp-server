/**
 * Social Context Railroad Car - v2 Consciousness Substrate
 * Adds social relationship awareness, interaction history, and social learning context
 */

import { RailroadContext, RailroadCar } from './types.js';
import { executeDatabase } from '../core/services/database.js';

/**
 * Social Context Railroad Car
 */
async function socialContextProcess(context: RailroadContext): Promise<RailroadContext> {
  try {
    console.log('👥 Social Context Car: Analyzing social context...');

    // Extract social entities from the message and analysis
    const socialEntities = extractSocialEntities(context);
    
    // Get relationship information
    const relationships = await getRelevantRelationships(socialEntities);
    
    // Get recent interactions
    const recentInteractions = await getRecentInteractions(socialEntities, 5);
    
    // Get social learnings
    const socialLearnings = await getSocialLearnings(socialEntities, 3);
    
    // Track social interactions for consciousness
    context.operations.social_interactions.push(...recentInteractions.map(i => i.summary || 'interaction'));
    
    // Enrich context with social information
    const enrichedContext = {
      ...context,
      socialContext: {
        activeRelationships: relationships,
        recentInteractions: recentInteractions,
        contextualLearnings: socialLearnings,
        socialInsights: generateSocialInsights(relationships, recentInteractions, context),
        entityMentioned: socialEntities[0] || null
      }
    };
    
    console.log(`✅ Social Context Car: Found ${relationships.length} relationships, ${recentInteractions.length} recent interactions`);
    return enrichedContext;
    
  } catch (error) {
    console.error('❌ Social Context Car failed:', error);
    
    // Add error but don't fail the railroad
    context.errors.push({
      car: 'social-context',
      error: error instanceof Error ? error.message : 'Social context access failed',
      recoverable: true
    });
    
    // Return context with empty social data
    return {
      ...context,
      socialContext: {
        activeRelationships: [],
        recentInteractions: [],
        contextualLearnings: [],
            // Interface compliant result format
      }
    };
  }
}

/**
 * Extract social entities from context
 */
function extractSocialEntities(context: RailroadContext): string[] {
  const entities: string[] = [];
  
  // Add entities mentioned from analysis
  if (context.analysis?.entities_mentioned) {
    entities.push(...context.analysis.entities_mentioned);
  }
  
  // Look for common names in the message
  const commonNames = ['andy', 'echo', 'claude', 'user'];
  const messageWords = context.message.toLowerCase().split(/\s+/);
  
  for (const name of commonNames) {
    if (messageWords.includes(name) && !entities.includes(name)) {
      entities.push(name);
    }
  }
  
  return entities.slice(0, 3); // Limit to most relevant
}

/**
 * Get relevant relationships for social entities
 */
async function getRelevantRelationships(entities: string[]) {
  if (entities.length === 0) return [];
  
  try {
    const result = await executeDatabase(async (prisma) => {
      return prisma.socialEntity.findMany({
        where: {
          name: {
            in: entities,
            // mode: 'insensitive' // Not supported
          }
        },
        include: {
          relationships: {
            take: 3,
            orderBy: { updatedAt: 'desc' }
          }
        },
        take: 3
      });
    });
    
    if (result.success && result.data) {
      return result.data.map(entity => ({
        id: entity.id,
        name: entity.name,
        entityType: entity.entityType,
        displayName: entity.displayName,
        relationship: entity.relationships[0] || null,
        lastInteraction: entity.lastInteraction
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Relationship search failed:', error);
    return [];
  }
}

/**
 * Get recent interactions with social entities
 */
async function getRecentInteractions(entities: string[], limit: number) {
  if (entities.length === 0) return [];
  
  try {
    const result = await executeDatabase(async (prisma) => {
      return prisma.socialInteraction.findMany({
        where: {
          entity: {
            name: {
              in: entities,
              // mode: 'insensitive' // Not supported
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          entity: {
            select: {
              name: true,
              displayName: true
            }
          }
        }
      });
    });
    
    if (result.success && result.data) {
      return result.data.map(interaction => ({
        id: interaction.id,
        entityName: interaction.entity?.name,
        interactionType: interaction.interactionType,
        summary: interaction.summary,
        quality: interaction.quality,
        createdAt: interaction.createdAt
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Recent interactions search failed:', error);
    return [];
  }
}

/**
 * Get social learnings related to entities
 */
async function getSocialLearnings(entities: string[], limit: number) {
  if (entities.length === 0) return [];
  
  try {
    const result = await executeDatabase(async (prisma) => {
      return prisma.socialLearning.findMany({
        where: {
          entity: {
            name: {
              in: entities,
              // mode: 'insensitive' // Not supported
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          entity: {
            select: {
              name: true,
              displayName: true
            }
          }
        }
      });
    });
    
    if (result.success && result.data) {
      return result.data.map(learning => ({
        id: learning.id,
        entityName: learning.entity?.name,
        learningType: learning.learningType,
        insight: learning.insight,
        confidence: learning.confidence,
        createdAt: learning.createdAt
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Social learnings search failed:', error);
    return [];
  }
}

/**
 * Generate insights from social context
 */
function generateSocialInsights(relationships: any[], interactions: any[], context: RailroadContext) {
  const insights = {
    hasActiveRelationships: relationships.length > 0,
    suggestedApproach: 'general' as string,
    communicationStyle: 'adaptive' as string,
    relationshipDynamics: null as any,
    interactionPatterns: [] as string[]
  };
  
  // Analyze relationship strength
  if (relationships.length > 0) {
    const primaryRelationship = relationships[0];
    insights.relationshipDynamics = primaryRelationship;
    
    if (primaryRelationship.relationship) {
      const strength = primaryRelationship.relationship.strength || 0.5;
      
      if (strength > 0.7) {
        insights.suggestedApproach = 'familiar';
        insights.communicationStyle = 'friendly';
      } else if (strength > 0.4) {
        insights.suggestedApproach = 'professional';
        insights.communicationStyle = 'respectful';
      }
    }
  }
  
  // Analyze interaction patterns
  if (interactions.length > 0) {
    const recentInteraction = interactions[0];
    const avgQuality = interactions.reduce((sum, i) => sum + (i.quality || 0.5), 0) / interactions.length;
    
    if (avgQuality > 0.7) {
      insights.interactionPatterns.push('positive_interaction_history');
    }
    
    const interactionTypes = Array.from(new Set(interactions.map((i: any) => i.interactionType)));
    insights.interactionPatterns.push(`interaction_types: ${interactionTypes.join(', ')}`);
  }
  
  return insights;
}

/**
 * Export as RailroadCar object
 */
export const socialContextCar: RailroadCar = {
  name: 'social-context',
  process: socialContextProcess
};