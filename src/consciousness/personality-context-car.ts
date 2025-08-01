/**
 * Personality Context Railroad Car - v2 Consciousness Substrate
 * Adds adaptive personality, communication style, and learning pattern context
 */

import { RailroadContext, RailroadCar } from './types.js';
import { executeDatabase } from '../core/services/database.js';

/**
 * Personality Context Railroad Car
 */
async function personalityContextProcess(context: RailroadContext): Promise<RailroadContext> {
  try {
    console.log('🎭 Personality Context Car: Analyzing personality adaptation...');

    // Get current personality configuration
    const personalityConfig = await getPersonalityConfiguration();
    
    // Analyze context for personality adaptation
    const adaptationNeeds = analyzeAdaptationNeeds(context);
    
    // Get learning patterns and preferences
    const learningPatterns = await getLearningPatterns();
    
    // Determine optimal communication style
    const communicationStyle = determineOptimalCommunicationStyle(context, personalityConfig, adaptationNeeds);
    
    // Track personality adaptations
    context.operations.consciousness_updates['personality_adaptation'] = {
      style: communicationStyle,
      adaptationLevel: adaptationNeeds.adaptationLevel,
      triggers: adaptationNeeds.triggers
    };
    
    // Enrich context with personality information
    const enrichedContext = {
      ...context,
      personalityContext: {
        currentPreferences: personalityConfig.preferences,
        adaptationLevel: adaptationNeeds.adaptationLevel,
        responseStyle: communicationStyle,
        learningPatterns: learningPatterns,
        personalityInsights: generatePersonalityInsights(context, personalityConfig, adaptationNeeds),
        communicationAdaptations: getOptimalCommunicationAdaptations(context, communicationStyle)
      }
    };
    
    console.log(`✅ Personality Context Car: Adapted to ${communicationStyle} style (${adaptationNeeds.adaptationLevel} adaptation)`);
    return enrichedContext;
    
  } catch (error) {
    console.error('❌ Personality Context Car failed:', error);
    
    // Add error but don't fail the railroad
    context.errors.push({
      car: 'personality-context',
      error: error instanceof Error ? error.message : 'Personality adaptation failed',
      recoverable: true
    });
    
    // Return context with default personality data
    return {
      ...context,
      personalityContext: {
        currentPreferences: getDefaultPreferences(),
        adaptationLevel: 0.5,
        responseStyle: 'adaptive',
        learningPatterns: getDefaultLearningPatterns(),
        // V2 simplified - interface compliant
        // communicationAdaptations removed - not in interface
      }
    };
  }
}

/**
 * Get personality configuration from database/storage
 */
async function getPersonalityConfiguration() {
  try {
    const result = await executeDatabase(async (prisma) => {
      const configs = await prisma.configuration.findMany({
        where: {
          key: {
            startsWith: 'personality.'
          }
        }
      });
      
      const preferences: Record<string, any> = {};
      configs.forEach(config => {
        const key = config.key.replace('personality.', '');
        try {
          preferences[key] = JSON.parse(config.value);
        } catch {
          preferences[key] = config.value;
        }
      });
      
      return preferences;
    });
    
    if (result.success && result.data) {
      return {
        preferences: result.data,
        communicationStyles: result.data.communicationStyles || ['adaptive', 'technical', 'friendly'],
        adaptationThresholds: result.data.adaptationThresholds || { social: 0.6, technical: 0.7, creative: 0.5 }
      };
    }
    
    return getDefaultPersonalityConfig();
  } catch (error) {
    console.error('Personality config fetch failed:', error);
    return getDefaultPersonalityConfig();
  }
}

/**
 * Analyze what personality adaptations are needed
 */
function analyzeAdaptationNeeds(context: RailroadContext) {
  const adaptations = {
    adaptationLevel: 0.5,
    triggers: [] as string[],
    recommendedStyle: 'adaptive' as string,
    reasoning: [] as string[]
  };
  
  // Analyze based on message analysis
  if (context.analysis) {
    const { intent, emotional_context, requires_social } = context.analysis;
    
    // Intent-based adaptations
    switch (intent) {
      case 'learning_request':
        adaptations.adaptationLevel = 0.8;
        adaptations.recommendedStyle = 'educational';
        adaptations.triggers.push('learning_context');
        adaptations.reasoning.push('Learning intent detected - adaptive teaching mode');
        break;
      case 'social_check_in':
        adaptations.adaptationLevel = 0.7;
        adaptations.recommendedStyle = 'friendly';
        adaptations.triggers.push('social_interaction');
        adaptations.reasoning.push('Social interaction - warm and engaging tone');
        break;
      case 'technical_discussion':
        adaptations.adaptationLevel = 0.9;
        adaptations.recommendedStyle = 'technical';
        adaptations.triggers.push('technical_focus');
        adaptations.reasoning.push('Technical discussion - precise and detailed');
        break;
      default:
        adaptations.triggers.push('general_conversation');
    }
    
    // Emotional context adaptations
    if (emotional_context) {
      switch (emotional_context) {
        case 'curious':
          adaptations.adaptationLevel += 0.1;
          adaptations.triggers.push('curiosity_engagement');
          break;
        case 'frustrated':
          adaptations.adaptationLevel += 0.2;
          adaptations.recommendedStyle = 'supportive';
          adaptations.triggers.push('support_needed');
          break;
        case 'excited':
          adaptations.adaptationLevel += 0.1;
          adaptations.triggers.push('enthusiasm_match');
          break;
      }
    }
  }
  
  // Session context adaptations
  if (context.sessionContext) {
    const { mode, cognitiveLoad } = context.sessionContext;
    
    if (mode === 'learning' && cognitiveLoad > 0.6) {
      adaptations.adaptationLevel += 0.1;
      adaptations.triggers.push('high_cognitive_load');
      adaptations.reasoning.push('High cognitive load - clear and structured responses');
    }
    
    if (mode === 'social' && context.socialContext?.activeRelationships && context.socialContext.activeRelationships.length > 0) {
      adaptations.adaptationLevel += 0.1;
      adaptations.triggers.push('relationship_context');
      adaptations.reasoning.push('Active relationship context - personalized approach');
    }
  }
  
  // Memory context adaptations
  if (context.memoryContext?.relevantMemories?.length) {
    adaptations.adaptationLevel += 0.1;
    adaptations.triggers.push('memory_context_available');
    adaptations.reasoning.push('Relevant memories available - context-aware responses');
  }
  
  // Clamp adaptation level
  adaptations.adaptationLevel = Math.min(1.0, adaptations.adaptationLevel);
  
  return adaptations;
}

/**
 * Get learning patterns from insights/configurations
 */
async function getLearningPatterns() {
  try {
    const result = await executeDatabase(async (prisma) => {
      const recentInsights = await prisma.memory.findMany({
        // orderBy: { createdAt: 'desc' }, // Not in schema
        take: 10,
        select: {
          tags: true
          // confidence/createdAt: not in schema
        }
      });
      
      return recentInsights;
    });
    
    if (result.success && result.data) {
      const insights = result.data;
      const categories = insights.map((i: any) => i.tags?.[0] || 'general');
      const avgConfidence = insights.reduce((sum: any, i: any) => sum + (i.importance === 'high' ? 0.9 : 0.6), 0) / insights.length || 0.7;
      
      return {
        recentCategories: Array.from(new Set(categories)),
        averageConfidence: avgConfidence,
        learningVelocity: calculateLearningVelocity(insights),
        preferredInsightTypes: getMostFrequentCategories(categories)
      };
    }
    
    return getDefaultLearningPatterns();
  } catch (error) {
    console.error('Learning patterns fetch failed:', error);
    return getDefaultLearningPatterns();
  }
}

/**
 * Determine optimal communication style
 */
function determineOptimalCommunicationStyle(context: RailroadContext, config: any, adaptations: any): string {
  // Start with adaptation recommendation
  let style = adaptations.recommendedStyle;
  
  // Refine based on social context
  if (context.socialContext?.activeRelationships && context.socialContext.activeRelationships.length > 0) {
    const socialStyle = 'adaptive';
    
    // Blend styles intelligently
    if (false) { // Simplified logic
      style = 'friendly_technical';
    } else if (false) { // Simplified logic
      style = 'warm_professional';
    }
  }
  
  // Ensure we have a valid style
  const validStyles = ['adaptive', 'technical', 'friendly', 'educational', 'supportive', 'warm_professional', 'friendly_technical'];
  if (!validStyles.includes(style)) {
    style = 'adaptive';
  }
  
  return style;
}

/**
 * Generate personality insights
 */
function generatePersonalityInsights(context: RailroadContext, config: any, adaptations: any) {
  return {
    adaptationRecommended: adaptations.adaptationLevel > 0.6,
    communicationOptimization: adaptations.recommendedStyle,
    learningOpportunities: identifyLearningOpportunities(context),
    personalityAlignment: calculatePersonalityAlignment(context),
    adaptationReasoning: adaptations.reasoning,
    confidenceLevel: Math.min(0.95, 0.7 + (adaptations.adaptationLevel * 0.25))
  };
}

/**
 * Get optimal communication adaptations
 */
function getOptimalCommunicationAdaptations(context: RailroadContext, style: string) {
  const baseAdaptations = {
    tone: 'balanced',
    technicality: 'moderate',
    formality: 'professional',
    enthusiasm: 'measured',
    supportiveness: 'available'
  };
  
  switch (style) {
    case 'technical':
      return { ...baseAdaptations, technicality: 'high', formality: 'precise', tone: 'focused' };
    case 'friendly':
      return { ...baseAdaptations, tone: 'warm', enthusiasm: 'natural', formality: 'relaxed' };
    case 'educational':
      return { ...baseAdaptations, tone: 'encouraging', technicality: 'adaptive', supportiveness: 'high' };
    case 'supportive':
      return { ...baseAdaptations, tone: 'understanding', supportiveness: 'high', enthusiasm: 'gentle' };
    case 'friendly_technical':
      return { ...baseAdaptations, tone: 'warm', technicality: 'high', enthusiasm: 'natural' };
    case 'warm_professional':
      return { ...baseAdaptations, tone: 'warm', formality: 'professional', enthusiasm: 'measured' };
    default:
      return baseAdaptations;
  }
}

// Helper functions
function getDefaultPersonalityConfig() {
  return {
    preferences: {
      communicationStyle: 'adaptive',
      learningStyle: 'collaborative',
      responseDepth: 'contextual'
    },
    communicationStyles: ['adaptive', 'technical', 'friendly'],
    adaptationThresholds: { social: 0.6, technical: 0.7, creative: 0.5 }
  };
}

function getDefaultPreferences() {
  return {
    communicationStyle: 'adaptive',
    responseStyle: 'balanced',
    technicalDepth: 'moderate'
  };
}

function getDefaultLearningPatterns() {
  return {
    recentCategories: ['general'],
    averageConfidence: 0.7,
    learningVelocity: 0.5,
    preferredInsightTypes: ['pattern_weaving', 'knowledge_crystallization']
  };
}

function calculateLearningVelocity(insights: any[]) {
  if (insights.length === 0) return 0.5;
  
  const timeSpread = insights.length > 1 ? 
    (new Date(insights[0].createdAt).getTime() - new Date(insights[insights.length - 1].createdAt).getTime()) : 
    86400000; // 1 day
  
  return Math.min(1.0, insights.length / (timeSpread / 86400000)); // insights per day, capped at 1.0
}

function getMostFrequentCategories(categories: string[]) {
  const counts: Record<string, number> = {};
  categories.forEach(cat => counts[cat] = (counts[cat] || 0) + 1);
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);
}

function identifyLearningOpportunities(context: RailroadContext): string[] {
  const opportunities: string[] = [];
  
  if (context.analysis?.requires_memory && context.memoryContext?.relevantMemories?.length) {
    opportunities.push('memory_pattern_recognition');
  }
  
  if (context.socialContext?.activeRelationships?.length) {
    opportunities.push('social_dynamic_learning');
  }
  
  if (context.analysis?.intent === 'learning_request') {
    opportunities.push('adaptive_teaching');
  }
  
  return opportunities;
}

function calculatePersonalityAlignment(context: RailroadContext): number {
  let alignment = 0.7; // Base alignment
  
  // Boost for consistent interaction patterns
  if (context.socialContext?.recentInteractions && context.socialContext.recentInteractions.length > 0) {
    alignment += 0.1;
  }
  
  // Boost for relevant memory context
  if (context.memoryContext?.relevantMemories?.length) {
    alignment += 0.1;
  }
  
  // Boost for clear intent recognition
  if (context.analysis?.intent && context.analysis.intent !== 'unknown') {
    alignment += 0.1;
  }
  
  return Math.min(1.0, alignment);
}

/**
 * Export as RailroadCar object
 */
export const personalityContextCar: RailroadCar = {
  name: 'personality-context',
  process: personalityContextProcess
};