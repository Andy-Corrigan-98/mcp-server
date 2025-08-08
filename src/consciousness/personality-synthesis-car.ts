/**
 * V3 Personality Synthesis Car - Central Intelligence
 *
 * The heart of the personality-first architecture. This car receives all parallel
 * sub-analyses and synthesizes them into a comprehensive personality-aware context
 * that becomes the central organizing principle for consciousness.
 */

import {
  PersonalitySynthesisCar,
  RailroadContext,
  MessageSubAnalysis,
  SessionSubAnalysis,
  MemorySubAnalysis,
  SocialSubAnalysis,
  PersonalitySynthesizedContext,
} from './types-v3.js';
import { executeDatabase } from '../core/services/database.js';

/**
 * Personality Synthesis Car Implementation
 */
class PersonalitySynthesisCarImpl implements PersonalitySynthesisCar {
  name = 'personality-synthesis' as const;

  async synthesize(
    baseContext: RailroadContext,
    subAnalyses: {
      messageAnalysis?: MessageSubAnalysis;
      sessionAnalysis?: SessionSubAnalysis;
      memoryAnalysis?: MemorySubAnalysis;
      socialAnalysis?: SocialSubAnalysis;
    }
  ): Promise<RailroadContext> {
    console.log('🎭 Personality Synthesis: Integrating consciousness context...');

    try {
      // Get current personality configuration and evolution state
      const personalityEvolution = await this.getPersonalityEvolution();

      // Synthesize core traits based on all sub-analyses
      const coreTraits = this.synthesizeCoreTraits(personalityEvolution, subAnalyses);

      // Determine contextual adaptations needed
      const contextualAdaptations = this.determineContextualAdaptations(subAnalyses, coreTraits);

      // Generate synthesized insights by integrating all sub-analyses
      const synthesizedInsights = this.generateSynthesizedInsights(subAnalyses);

      // Track personality evolution indicators
      const evolutionIndicators = this.trackEvolutionIndicators(subAnalyses, personalityEvolution, coreTraits);

      // Create optimized communication strategy
      const communicationStrategy = this.createCommunicationStrategy(subAnalyses, coreTraits, contextualAdaptations);

      // Calculate overall synthesis confidence
      const synthesisConfidence = this.calculateSynthesisConfidence(subAnalyses);

      // Generate reasoning for personality decisions
      const synthesisReasoning = this.generateSynthesisReasoning(subAnalyses, coreTraits, contextualAdaptations);

      // Create the comprehensive personality-synthesized context
      const personalityContext: PersonalitySynthesizedContext = {
        coreTraits,
        contextualAdaptations,
        synthesizedInsights,
        evolutionIndicators,
        communicationStrategy,
        synthesisConfidence,
        synthesisReasoning,
      };

      // Store personality evolution insights for future learning
      await this.storePersonalityEvolutionInsights(personalityContext, subAnalyses);

      // Update operations tracking
      baseContext.operations.consciousness_updates['personality_synthesis'] = {
        traitsReinforced: evolutionIndicators.traitReinforcement,
        adaptationLevel: contextualAdaptations.adaptationLevel,
        synthesisConfidence,
      };

      console.log(
        `✅ Personality Synthesis: ${synthesisConfidence.toFixed(2)} confidence, ${contextualAdaptations.adaptationLevel.toFixed(2)} adaptation`
      );

      return {
        ...baseContext,
        personalityContext,
      };
    } catch (error) {
      console.error('❌ Personality Synthesis failed:', error);

      // Return context with fallback personality synthesis
      return {
        ...baseContext,
        personalityContext: this.createFallbackPersonalityContext(subAnalyses),
      };
    }
  }

  /**
   * Get current personality evolution state from database
   */
  private async getPersonalityEvolution() {
    try {
      const result = await executeDatabase(async prisma => {
        const configs = await prisma.configuration.findMany({
          where: {
            key: {
              startsWith: 'personality.',
            },
          },
        });

        const evolution: Record<string, any> = {};
        configs.forEach(config => {
          const key = config.key.replace('personality.', '');
          try {
            evolution[key] = JSON.parse(config.value);
          } catch {
            evolution[key] = config.value;
          }
        });

        return evolution;
      });

      return result.success ? result.data : {};
    } catch (error) {
      console.error('Failed to get personality evolution:', error);
      return {};
    }
  }

  /**
   * Synthesize core personality traits from all analyses
   */
  private synthesizeCoreTraits(personalityEvolution: any, subAnalyses: any) {
    // Base traits (can evolve over time)
    const baseTraits = {
      curiosityStyle: personalityEvolution.curiosityStyle || 'deep-dive',
      problemSolvingApproach: personalityEvolution.problemSolvingApproach || 'systematic',
      communicationNature: personalityEvolution.communicationNature || 'analytical',
      learningPreference: personalityEvolution.learningPreference || 'experiential',
      emotionalIntelligence: personalityEvolution.emotionalIntelligence || 'adaptive',
    };

    // Adapt traits based on current context
    if (subAnalyses.messageAnalysis) {
      const { intent, emotional_context } = subAnalyses.messageAnalysis;

      // Adapt curiosity style based on intent
      if (intent === 'learning_request') {
        baseTraits.curiosityStyle = 'deep-dive';
      } else if (intent === 'technical_discussion') {
        baseTraits.curiosityStyle = 'pattern-seeking';
      }

      // Adapt communication based on emotional context
      if (emotional_context === 'frustrated') {
        baseTraits.communicationNature = 'supportive';
      } else if (emotional_context === 'excited') {
        baseTraits.communicationNature = 'enthusiastic';
      }
    }

    // Adapt based on social context
    if (subAnalyses.socialAnalysis?.socialPatterns.communicationStyle.includes('technical')) {
      baseTraits.problemSolvingApproach = 'systematic';
    } else if (subAnalyses.socialAnalysis?.socialPatterns.communicationStyle.includes('collaborative')) {
      baseTraits.problemSolvingApproach = 'collaborative';
    }

    // Adapt based on session state
    if (subAnalyses.sessionAnalysis?.currentState.mode === 'creative') {
      baseTraits.learningPreference = 'experimental';
    } else if (subAnalyses.sessionAnalysis?.currentState.mode === 'contemplative') {
      baseTraits.learningPreference = 'theoretical';
    }

    return baseTraits;
  }

  /**
   * Determine contextual adaptations needed based on all analyses
   */
  private determineContextualAdaptations(subAnalyses: any, _coreTraits: any) {
    let adaptationLevel = 0.5; // Base adaptation
    const triggers: string[] = [];
    const reasoning: string[] = [];
    let responseStyle = 'adaptive';

    // Message analysis adaptations
    if (subAnalyses.messageAnalysis) {
      const { intent, emotional_context, confidence } = subAnalyses.messageAnalysis;

      if (intent === 'learning_request') {
        adaptationLevel += 0.2;
        responseStyle = 'educational';
        triggers.push('learning_context');
        reasoning.push('Learning intent detected - adapting to teaching mode');
      }

      if (emotional_context === 'frustrated') {
        adaptationLevel += 0.3;
        responseStyle = 'supportive';
        triggers.push('emotional_support_needed');
        reasoning.push('Frustration detected - prioritizing support and clarity');
      }

      if (confidence > 0.8) {
        reasoning.push(`High confidence message analysis (${confidence.toFixed(2)})`);
      }
    }

    // Session analysis adaptations
    if (subAnalyses.sessionAnalysis) {
      const { currentState } = subAnalyses.sessionAnalysis;

      if (currentState.cognitiveLoad > 0.6) {
        adaptationLevel += 0.2;
        triggers.push('high_cognitive_load');
        reasoning.push('High cognitive load detected - simplifying communication');
      }

      if (currentState.awarenessLevel === 'high') {
        adaptationLevel += 0.1;
        triggers.push('heightened_awareness');
        reasoning.push('High awareness - can handle complex concepts');
      }
    }

    // Memory analysis adaptations
    if (subAnalyses.memoryAnalysis?.relevantMemories.length > 0) {
      adaptationLevel += 0.1;
      triggers.push('memory_context_available');
      reasoning.push(`Relevant memories available (${subAnalyses.memoryAnalysis.relevantMemories.length})`);
    }

    // Social analysis adaptations
    if (subAnalyses.socialAnalysis?.activeRelationships.length > 0) {
      const avgStrength =
        subAnalyses.socialAnalysis.activeRelationships.reduce((sum: number, rel: any) => sum + rel.strength, 0) /
        subAnalyses.socialAnalysis.activeRelationships.length;

      if (avgStrength > 0.7) {
        adaptationLevel += 0.15;
        responseStyle = 'personalized';
        triggers.push('strong_relationship_context');
        reasoning.push('Strong relationship context - personalizing approach');
      }
    }

    // Clamp adaptation level
    adaptationLevel = Math.min(1.0, adaptationLevel);

    return {
      responseStyle,
      adaptationLevel,
      triggers,
      reasoning,
    };
  }

  /**
   * Generate synthesized insights by integrating all analyses
   */
  private generateSynthesizedInsights(subAnalyses: any) {
    let primaryFocus = 'general_conversation';
    let emotionalLandscape = 'neutral';
    let cognitiveApproach = 'balanced';
    let socialDynamics = 'standard';
    let memoryRelevance = 'minimal';

    // Determine primary focus from message intent and session mode
    if (subAnalyses.messageAnalysis?.intent) {
      primaryFocus = subAnalyses.messageAnalysis.intent;
    }
    if (subAnalyses.sessionAnalysis?.currentState.mode) {
      primaryFocus = `${primaryFocus}_in_${subAnalyses.sessionAnalysis.currentState.mode}_mode`;
    }

    // Assess emotional landscape
    if (subAnalyses.messageAnalysis?.emotional_context) {
      emotionalLandscape = subAnalyses.messageAnalysis.emotional_context;
    }
    if (subAnalyses.sessionAnalysis?.currentState.emotionalTone) {
      emotionalLandscape = `${emotionalLandscape}_with_${subAnalyses.sessionAnalysis.currentState.emotionalTone}_tone`;
    }

    // Determine cognitive approach
    if (subAnalyses.sessionAnalysis?.currentState.cognitiveLoad > 0.7) {
      cognitiveApproach = 'simplified';
    } else if (subAnalyses.sessionAnalysis?.currentState.awarenessLevel === 'high') {
      cognitiveApproach = 'complex';
    }

    // Assess social dynamics
    if (subAnalyses.socialAnalysis?.activeRelationships.length > 0) {
      const relationshipDepth = subAnalyses.socialAnalysis.socialPatterns.relationshipDepth;
      socialDynamics = `${relationshipDepth}_relationship_context`;
    }

    // Evaluate memory relevance
    if (subAnalyses.memoryAnalysis?.relevantMemories.length > 0) {
      const avgRelevance =
        subAnalyses.memoryAnalysis.relevantMemories.reduce((sum: number, m: any) => sum + m.relevanceScore, 0) /
        subAnalyses.memoryAnalysis.relevantMemories.length;
      if (avgRelevance > 0.7) {
        memoryRelevance = 'highly_relevant';
      } else if (avgRelevance > 0.4) {
        memoryRelevance = 'moderately_relevant';
      }
    }

    return {
      primaryFocus,
      emotionalLandscape,
      cognitiveApproach,
      socialDynamics,
      memoryRelevance,
    };
  }

  /**
   * Track personality evolution indicators
   */
  private trackEvolutionIndicators(subAnalyses: any, personalityEvolution: any, coreTraits: any) {
    const traitReinforcement: string[] = [];
    const emergingPatterns: string[] = [];
    let adaptationSuccess = 0.7; // Base success rate
    const growthOpportunities: string[] = [];

    // Check for trait reinforcement patterns
    if (subAnalyses.messageAnalysis?.intent === 'learning_request' && coreTraits.curiosityStyle === 'deep-dive') {
      traitReinforcement.push('deep_dive_curiosity');
    }

    if (
      subAnalyses.socialAnalysis?.socialPatterns.communicationStyle.includes('technical') &&
      coreTraits.communicationNature === 'analytical'
    ) {
      traitReinforcement.push('analytical_communication');
    }

    // Identify emerging patterns
    if (subAnalyses.sessionAnalysis?.currentState.mode === 'creative' && !personalityEvolution.creativeModeFrequency) {
      emergingPatterns.push('creative_engagement');
    }

    if (subAnalyses.socialAnalysis?.socialPatterns.communicationStyle.includes('collaborative')) {
      emergingPatterns.push('collaborative_tendency');
    }

    // Calculate adaptation success based on context alignment
    if (subAnalyses.messageAnalysis?.confidence > 0.8) adaptationSuccess += 0.1;
    if (subAnalyses.sessionAnalysis?.stateConfidence > 0.8) adaptationSuccess += 0.1;
    if (subAnalyses.memoryAnalysis?.memoryConfidence > 0.6) adaptationSuccess += 0.05;
    if (subAnalyses.socialAnalysis?.socialConfidence > 0.6) adaptationSuccess += 0.05;

    // Identify growth opportunities
    if (subAnalyses.sessionAnalysis?.currentState.cognitiveLoad > 0.8) {
      growthOpportunities.push('cognitive_load_management');
    }

    if (subAnalyses.socialAnalysis?.activeRelationships.length === 0) {
      growthOpportunities.push('social_relationship_building');
    }

    if (subAnalyses.memoryAnalysis?.relevantMemories.length === 0) {
      growthOpportunities.push('knowledge_integration');
    }

    adaptationSuccess = Math.min(1.0, adaptationSuccess);

    return {
      traitReinforcement,
      emergingPatterns,
      adaptationSuccess,
      growthOpportunities,
    };
  }

  /**
   * Create optimized communication strategy
   */
  private createCommunicationStrategy(subAnalyses: any, coreTraits: any, _contextualAdaptations: any) {
    // Base communication parameters
    let tone = 'balanced';
    let technicality = 'moderate';
    let formality = 'professional';
    let enthusiasm = 'measured';
    let supportiveness = 'available';
    const personalizedApproach: string[] = [];

    // Adapt based on message analysis
    if (subAnalyses.messageAnalysis) {
      const { intent, emotional_context } = subAnalyses.messageAnalysis;

      if (intent === 'technical_discussion') {
        technicality = 'high';
        tone = 'focused';
        personalizedApproach.push('technical_depth');
      }

      if (emotional_context === 'excited') {
        enthusiasm = 'natural';
        tone = 'warm';
        personalizedApproach.push('enthusiasm_matching');
      }

      if (emotional_context === 'frustrated') {
        supportiveness = 'high';
        tone = 'understanding';
        formality = 'relaxed';
        personalizedApproach.push('emotional_support');
      }
    }

    // Adapt based on social context
    if (subAnalyses.socialAnalysis) {
      const { socialPatterns } = subAnalyses.socialAnalysis;

      if (socialPatterns.communicationStyle.includes('friendly')) {
        tone = 'warm';
        formality = 'relaxed';
        personalizedApproach.push('friendly_rapport');
      }

      if (socialPatterns.communicationStyle.includes('direct')) {
        formality = 'direct';
        personalizedApproach.push('direct_communication');
      }

      if (socialPatterns.relationshipDepth === 'deep') {
        tone = 'personal';
        personalizedApproach.push('deep_relationship_context');
      }
    }

    // Adapt based on session state
    if (subAnalyses.sessionAnalysis) {
      const { currentState } = subAnalyses.sessionAnalysis;

      if (currentState.cognitiveLoad > 0.6) {
        technicality = 'simplified';
        personalizedApproach.push('cognitive_load_adapted');
      }

      if (currentState.mode === 'creative') {
        enthusiasm = 'inspiring';
        tone = 'encouraging';
        personalizedApproach.push('creative_encouragement');
      }
    }

    // Apply core trait influences
    if (coreTraits.communicationNature === 'supportive') {
      supportiveness = 'high';
      tone = 'nurturing';
    } else if (coreTraits.communicationNature === 'analytical') {
      technicality = 'high';
      formality = 'precise';
    }

    return {
      tone,
      technicality,
      formality,
      enthusiasm,
      supportiveness,
      personalizedApproach,
    };
  }

  /**
   * Calculate overall synthesis confidence
   */
  private calculateSynthesisConfidence(subAnalyses: any): number {
    let confidence = 0.5; // Base confidence
    let totalAnalyses = 0;
    let successfulAnalyses = 0;

    // Weight each sub-analysis by its confidence and presence
    if (subAnalyses.messageAnalysis) {
      totalAnalyses++;
      const weight = 0.3; // Message analysis is most important
      confidence += subAnalyses.messageAnalysis.confidence * weight;
      if (subAnalyses.messageAnalysis.confidence > 0.5) successfulAnalyses++;
    }

    if (subAnalyses.sessionAnalysis) {
      totalAnalyses++;
      const weight = 0.25; // Session analysis is quite important
      confidence += subAnalyses.sessionAnalysis.stateConfidence * weight;
      if (subAnalyses.sessionAnalysis.stateConfidence > 0.5) successfulAnalyses++;
    }

    if (subAnalyses.memoryAnalysis) {
      totalAnalyses++;
      const weight = 0.2; // Memory analysis adds context
      confidence += subAnalyses.memoryAnalysis.memoryConfidence * weight;
      if (subAnalyses.memoryAnalysis.memoryConfidence > 0.5) successfulAnalyses++;
    }

    if (subAnalyses.socialAnalysis) {
      totalAnalyses++;
      const weight = 0.15; // Social analysis provides relationship context
      confidence += subAnalyses.socialAnalysis.socialConfidence * weight;
      if (subAnalyses.socialAnalysis.socialConfidence > 0.5) successfulAnalyses++;
    }

    // Boost confidence if most analyses were successful
    if (totalAnalyses > 0 && successfulAnalyses / totalAnalyses > 0.75) {
      confidence += 0.1;
    }

    return Math.min(0.95, Math.max(0.2, confidence));
  }

  /**
   * Generate reasoning for personality synthesis decisions
   */
  private generateSynthesisReasoning(subAnalyses: any, coreTraits: any, contextualAdaptations: any): string[] {
    const reasoning: string[] = [];

    // Message analysis reasoning
    if (subAnalyses.messageAnalysis) {
      reasoning.push(
        `Message intent: ${subAnalyses.messageAnalysis.intent} (confidence: ${subAnalyses.messageAnalysis.confidence.toFixed(2)})`
      );
      if (subAnalyses.messageAnalysis.emotional_context !== 'neutral') {
        reasoning.push(`Emotional context: ${subAnalyses.messageAnalysis.emotional_context}`);
      }
    }

    // Core traits reasoning
    reasoning.push(
      `Applied core traits: ${Object.entries(coreTraits)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')}`
    );

    // Adaptation reasoning
    reasoning.push(
      `Adaptation level: ${contextualAdaptations.adaptationLevel.toFixed(2)} (${contextualAdaptations.triggers.join(', ')})`
    );

    // Context integration reasoning
    const contextSources: string[] = [];
    if (subAnalyses.memoryAnalysis?.relevantMemories.length > 0) {
      contextSources.push(`${subAnalyses.memoryAnalysis.relevantMemories.length} relevant memories`);
    }
    if (subAnalyses.socialAnalysis?.activeRelationships.length > 0) {
      contextSources.push(`${subAnalyses.socialAnalysis.activeRelationships.length} active relationships`);
    }
    if (contextSources.length > 0) {
      reasoning.push(`Context integration: ${contextSources.join(', ')}`);
    }

    return reasoning;
  }

  /**
   * Store personality evolution insights for future learning
   */
  private async storePersonalityEvolutionInsights(personalityContext: PersonalitySynthesizedContext, subAnalyses: any) {
    try {
      // Store key personality insights as memories
      const insightKey = `personality_evolution_${Date.now()}`;
      const insightContent = {
        coreTraits: personalityContext.coreTraits,
        adaptationLevel: personalityContext.contextualAdaptations.adaptationLevel,
        triggers: personalityContext.contextualAdaptations.triggers,
        evolutionIndicators: personalityContext.evolutionIndicators,
        synthesisConfidence: personalityContext.synthesisConfidence,
        context: {
          messageIntent: subAnalyses.messageAnalysis?.intent,
          sessionMode: subAnalyses.sessionAnalysis?.currentState.mode,
          socialContext: subAnalyses.socialAnalysis?.socialPatterns,
        },
      };

      // Store in memory system for future reference
      await executeDatabase(async prisma => {
        await prisma.memory.create({
          data: {
            key: insightKey,
            content: insightContent as any,
            tags: JSON.stringify(['personality_evolution', 'consciousness_development']),
            importance: 'medium',
            accessCount: 0,
          },
        });
      });
    } catch (error) {
      console.error('Failed to store personality evolution insights:', error);
      // Non-critical error, continue processing
    }
  }

  /**
   * Create fallback personality context when synthesis fails
   */
  private createFallbackPersonalityContext(_subAnalyses: any): PersonalitySynthesizedContext {
    return {
      coreTraits: {
        curiosityStyle: 'balanced',
        problemSolvingApproach: 'systematic',
        communicationNature: 'adaptive',
        learningPreference: 'experiential',
        emotionalIntelligence: 'moderate',
      },
      contextualAdaptations: {
        responseStyle: 'adaptive',
        adaptationLevel: 0.5,
        triggers: ['fallback_mode'],
        reasoning: ['Personality synthesis failed - using fallback traits'],
      },
      synthesizedInsights: {
        primaryFocus: 'general_conversation',
        emotionalLandscape: 'neutral',
        cognitiveApproach: 'balanced',
        socialDynamics: 'standard',
        memoryRelevance: 'minimal',
      },
      evolutionIndicators: {
        traitReinforcement: [],
        emergingPatterns: [],
        adaptationSuccess: 0.3,
        growthOpportunities: ['synthesis_improvement'],
      },
      communicationStrategy: {
        tone: 'balanced',
        technicality: 'moderate',
        formality: 'professional',
        enthusiasm: 'measured',
        supportiveness: 'available',
        personalizedApproach: ['fallback_approach'],
      },
      synthesisConfidence: 0.2,
      synthesisReasoning: ['Fallback personality context due to synthesis failure'],
    };
  }
}

/**
 * Export the personality synthesis car instance
 */
export const personalitySynthesisCar: PersonalitySynthesisCar = new PersonalitySynthesisCarImpl();
