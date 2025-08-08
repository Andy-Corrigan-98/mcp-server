/**
 * V3 Social Sub-Analysis Car - Parallel Processing
 * 
 * Converts the original social context car to output structured sub-analysis
 * for the personality-first railroad architecture.
 */

import { SubAnalysisCar, SocialSubAnalysis, RailroadContext } from './types-v3.js';
import { executeDatabase } from '../core/services/database.js';

/**
 * Social Sub-Analysis Car for parallel processing
 */
class SocialSubAnalysisCarImpl implements SubAnalysisCar {
  name = 'social-analysis';

  async analyzeAsync(context: Pick<RailroadContext, 'message' | 'originalContext' | 'timestamp' | 'sessionId' | 'userId'>): Promise<SocialSubAnalysis> {
    try {
      console.log('👥 Social Sub-Analysis: Analyzing social context...');

      // Extract social entities from the message
      const socialEntities = this.extractSocialEntities(context.message, context.originalContext);
      
      // Get relationship information
      const relationships = await this.getRelevantRelationships(socialEntities) || [];
      
      // Get recent interactions
      const recentInteractions = await this.getRecentInteractions(socialEntities, 5) || [];
      
      // Analyze social patterns
      const socialPatterns = this.analyzeSocialPatterns(relationships, recentInteractions, context.message);
      
      // Calculate confidence in social analysis
      const socialConfidence = this.calculateSocialConfidence(relationships, recentInteractions, socialEntities);

      console.log(`✅ Social Sub-Analysis: Found ${relationships.length} relationships, ${recentInteractions.length} recent interactions`);
      
      return {
        activeRelationships: relationships,
        recentInteractions,
        socialPatterns,
        socialConfidence
      };
      
    } catch (error) {
      console.error('❌ Social Sub-Analysis failed:', error);
      
      // Return empty but valid analysis on failure
      return {
        activeRelationships: [],
        recentInteractions: [],
        socialPatterns: {
          communicationStyle: [],
          interactionFrequency: 0,
          relationshipDepth: 'surface'
        },
        socialConfidence: 0.1 // Low confidence for failed analysis
      };
    }
  }

  /**
   * Extract social entities from message and context
   */
  private extractSocialEntities(message: string, originalContext?: string): string[] {
    const entities: string[] = [];
    
    // Common names that might appear in our context
    const commonNames = ['andy', 'echo', 'claude', 'user'];
    const combinedText = `${message} ${originalContext || ''}`.toLowerCase();
    
    // Look for direct name mentions
    for (const name of commonNames) {
      if (combinedText.includes(name) && !entities.includes(name)) {
        entities.push(name);
      }
    }
    
    // Look for relationship indicators
    const relationshipIndicators = ['we', 'us', 'our', 'together', 'team', 'colleague', 'friend'];
    const hasRelationshipContext = relationshipIndicators.some(indicator => 
      combinedText.includes(indicator)
    );
    
    if (hasRelationshipContext && entities.length === 0) {
      entities.push('user'); // Default to user relationship
    }
    
    // Look for social pronouns and add context
    if (combinedText.includes('you') || combinedText.includes('your')) {
      if (!entities.includes('user')) {
        entities.push('user');
      }
    }
    
    return entities.slice(0, 3); // Limit to most relevant
  }

  /**
   * Get relevant relationships for social entities
   */
  private async getRelevantRelationships(entities: string[]) {
    if (entities.length === 0) return [];
    
    try {
      const result = await executeDatabase(async (prisma) => {
        // First get social entities by name
        const socialEntities = await prisma.socialEntity.findMany({
          where: {
            name: { in: entities }
          },
          include: {
            relationships: true
          }
        });

        // Map to expected format
        const relationships = socialEntities.flatMap(entity => 
          entity.relationships.map(rel => ({
            name: entity.name,
            relationship: rel.relationshipType,
            strength: rel.strength || 0.5,
            context: rel.notes ? [rel.notes] : []
          }))
        );

        return relationships;
      });

      return result.success ? result.data : [];
    } catch (error) {
      console.error('Failed to get relationships:', error);
      return [];
    }
  }

  /**
   * Get recent interactions for social entities
   */
  private async getRecentInteractions(entities: string[], limit: number) {
    if (entities.length === 0) return [];
    
    try {
      const result = await executeDatabase(async (prisma) => {
        // First get social entities by name to get their IDs
        const socialEntities = await prisma.socialEntity.findMany({
          where: {
            name: { in: entities }
          },
          select: {
            id: true,
            name: true
          }
        });

        const entityIds = socialEntities.map(e => e.id);
        
        if (entityIds.length === 0) return [];

        // Get recent social interactions for these entities
        const interactions = await prisma.socialInteraction.findMany({
          where: {
            entityId: { in: entityIds }
          },
          take: limit,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            summary: true,
            interactionType: true,
            context: true,
            emotionalTone: true,
            createdAt: true,
            entity: {
              select: {
                name: true
              }
            }
          }
        });

        return interactions.map(interaction => ({
          summary: interaction.summary || 'Social interaction',
          participants: [interaction.entity.name],
          outcome: interaction.emotionalTone || 'neutral',
          timestamp: interaction.createdAt.toISOString()
        }));
      });

      return result.success ? result.data : [];
    } catch (error) {
      console.error('Failed to get recent interactions:', error);
      return [];
    }
  }

  /**
   * Analyze social patterns from relationships and interactions
   */
  private analyzeSocialPatterns(relationships: any[], recentInteractions: any[], message: string): {
    communicationStyle: string[];
    interactionFrequency: number;
    relationshipDepth: string;
  } {
    const patterns = {
      communicationStyle: [] as string[],
      interactionFrequency: 0,
      relationshipDepth: 'surface' as string
    };

    // Analyze communication style from message
    patterns.communicationStyle = this.inferCommunicationStyle(message);

    // Calculate interaction frequency (interactions per day over recent period)
    if (recentInteractions.length > 0) {
      const recent = recentInteractions.slice(0, 5);
      const daySpan = recent.length > 1 ? 
        this.daysBetween(new Date(recent[recent.length - 1].timestamp), new Date(recent[0].timestamp)) : 1;
      patterns.interactionFrequency = recent.length / Math.max(1, daySpan);
    }

    // Determine relationship depth from relationship strength
    if (relationships.length > 0) {
      const avgStrength = relationships.reduce((sum, rel) => sum + rel.strength, 0) / relationships.length;
      if (avgStrength > 0.7) {
        patterns.relationshipDepth = 'deep';
      } else if (avgStrength > 0.4) {
        patterns.relationshipDepth = 'moderate';
      } else {
        patterns.relationshipDepth = 'surface';
      }
    }

    return patterns;
  }

  /**
   * Infer communication style from message content
   */
  private inferCommunicationStyle(message: string): string[] {
    const styles: string[] = [];
    const lowerMessage = message.toLowerCase();

    // Technical communication
    if (this.hasTechnicalTerms(lowerMessage)) {
      styles.push('technical');
    }

    // Friendly communication
    if (this.hasFriendlyTerms(lowerMessage)) {
      styles.push('friendly');
    }

    // Direct communication
    if (this.hasDirectTerms(lowerMessage)) {
      styles.push('direct');
    }

    // Collaborative communication
    if (this.hasCollaborativeTerms(lowerMessage)) {
      styles.push('collaborative');
    }

    // Casual communication
    if (this.hasCasualTerms(lowerMessage)) {
      styles.push('casual');
    }

    return styles.length > 0 ? styles : ['neutral'];
  }

  /**
   * Check for technical communication terms
   */
  private hasTechnicalTerms(message: string): boolean {
    const technicalTerms = ['implement', 'architecture', 'algorithm', 'optimization', 'analysis', 'system', 'code', 'function', 'class', 'interface'];
    return technicalTerms.some(term => message.includes(term));
  }

  /**
   * Check for friendly communication terms
   */
  private hasFriendlyTerms(message: string): boolean {
    const friendlyTerms = ['thanks', 'please', 'appreciate', 'wonderful', 'great', 'awesome', 'nice', 'good'];
    return friendlyTerms.some(term => message.includes(term));
  }

  /**
   * Check for direct communication terms
   */
  private hasDirectTerms(message: string): boolean {
    const directTerms = ['need', 'must', 'should', 'require', 'immediately', 'now', 'fix', 'problem'];
    return directTerms.some(term => message.includes(term));
  }

  /**
   * Check for collaborative communication terms
   */
  private hasCollaborativeTerms(message: string): boolean {
    const collaborativeTerms = ['we', 'us', 'our', 'together', 'team', 'collaborate', 'work with', 'let\'s'];
    return collaborativeTerms.some(term => message.includes(term));
  }

  /**
   * Check for casual communication terms
   */
  private hasCasualTerms(message: string): boolean {
    const casualTerms = ['hey', 'hi', 'yeah', 'ok', 'cool', 'just', 'like', 'you know'];
    return casualTerms.some(term => message.includes(term));
  }

  /**
   * Calculate days between two dates
   */
  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate confidence in social analysis
   */
  private calculateSocialConfidence(relationships: any[], recentInteractions: any[], socialEntities: string[]): number {
    let confidence = 0.3; // Base confidence for social analysis

    // Higher confidence with more social entities mentioned
    if (socialEntities.length > 0) {
      confidence += Math.min(0.3, socialEntities.length * 0.15);
    }

    // Higher confidence with active relationships
    if (relationships.length > 0) {
      confidence += Math.min(0.2, relationships.length * 0.1);
      
      // Boost for strong relationships
      const strongRelationships = relationships.filter(rel => rel.strength > 0.6);
      if (strongRelationships.length > 0) {
        confidence += 0.1;
      }
    }

    // Higher confidence with recent interactions
    if (recentInteractions.length > 0) {
      confidence += Math.min(0.2, recentInteractions.length * 0.05);
    }

    return Math.min(0.95, Math.max(0.1, confidence));
  }
}

/**
 * Export the sub-analysis car instance
 */
export const socialSubAnalysisCar: SubAnalysisCar = new SocialSubAnalysisCarImpl();