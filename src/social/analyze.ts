import { executeDatabase } from '../core/services/database.js';
import { validateRequiredString, sanitizeString } from '../core/services/validation.js';
import { ResponseBuilder } from '../core/utils/response-builder.js';
import { getEntityByName } from '../entities/get-by-name.js';

/**
 * Social pattern analysis
 * Single responsibility: Analyzing social patterns, relationship trends, and growth
 */

/**
 * Analyze social patterns, relationship trends, and emotional growth
 */
export const analyzeSocialPatterns = async (args: {
  analysis_type: string;
  entity_name?: string;
  time_period?: string;
  include_recommendations?: boolean;
}): Promise<object> => {
  // Validate inputs
  const analysisType = validateRequiredString(args.analysis_type, 'analysis_type', 50);
  const entityName = sanitizeString(args.entity_name, 100);
  const timePeriod = args.time_period || 'month';
  const includeRecommendations = args.include_recommendations !== false;

  // Calculate date range based on time period
  const now = new Date();
  let startDate: Date;
  switch (timePeriod) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'all_time':
      startDate = new Date(2020, 0, 1); // Arbitrary old date
      break;
    default: // month
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get entity if specified
  let entityId: number | undefined;
  if (entityName) {
    const entity = await getEntityByName(entityName);
    if (!entity) {
      throw new Error(`Social entity '${entityName}' not found`);
    }
    entityId = entity.id;
  }

  // Perform analysis based on type
  const analysisData = await executeDatabase(async prisma => {
    const whereCondition = {
      createdAt: { gte: startDate },
      ...(entityId && { entityId }),
    };

    switch (analysisType) {
      case 'relationship_evolution':
        return analyzeRelationshipEvolution(prisma, whereCondition, entityId);
      case 'interaction_patterns':
        return analyzeInteractionPatterns(prisma, whereCondition);
      case 'emotional_development':
        return analyzeEmotionalDevelopment(prisma, whereCondition, entityId);
      case 'communication_effectiveness':
        return analyzeCommunicationEffectiveness(prisma, whereCondition);
      case 'social_growth':
        return analyzeSocialGrowth(prisma, whereCondition);
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }
  });

  // Build response
  const response: any = {
    analysis_type: analysisType,
    time_period: timePeriod,
    entity_focus: entityName,
    ...analysisData,
  };

  if (includeRecommendations) {
    response.recommendations = generateRecommendations(analysisType, analysisData);
  }

  return ResponseBuilder.success(response, `Social pattern analysis '${analysisType}' completed`);
};

// Helper analysis functions
async function analyzeRelationshipEvolution(prisma: any, whereCondition: any, _entityId?: number) {
  const interactions = await prisma.socialInteraction.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'asc' },
  });

  const patterns: any[] = [];
  const trends: any[] = [];

  if (interactions.length > 1) {
    const qualityTrend = calculateQualityTrend(interactions);
    trends.push({
      trend: 'interaction_quality',
      direction: qualityTrend > 0 ? 'improving' : qualityTrend < 0 ? 'declining' : 'stable',
      significance: Math.abs(qualityTrend),
    });
  }

  return { patterns, trends, metrics: { total_interactions: interactions.length } };
}

async function analyzeInteractionPatterns(prisma: any, whereCondition: any) {
  const interactions = await prisma.socialInteraction.findMany({
    where: whereCondition,
  });

  const typeFrequency = new Map<string, number>();
  interactions.forEach((interaction: any) => {
    const count = typeFrequency.get(interaction.interactionType) || 0;
    typeFrequency.set(interaction.interactionType, count + 1);
  });

  const patterns: any[] = Array.from(typeFrequency.entries()).map(([type, count]) => ({
    pattern: `${type}_frequency`,
    confidence: count / interactions.length,
    examples: [`${count} interactions of type '${type}'`],
    impact: count > interactions.length * 0.3 ? 'high' : 'medium',
  }));

  return { patterns, trends: [], metrics: { total_interactions: interactions.length } };
}

async function analyzeEmotionalDevelopment(prisma: any, whereCondition: any, _entityId?: number) {
  const emotions = await prisma.emotionalContext.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'asc' },
  });

  const emotionalStates = new Map<string, number[]>();
  emotions.forEach((emotion: any) => {
    if (!emotionalStates.has(emotion.emotionalState)) {
      emotionalStates.set(emotion.emotionalState, []);
    }
    emotionalStates.get(emotion.emotionalState)!.push(emotion.intensity || 0.5);
  });

  const patterns = Array.from(emotionalStates.entries()).map(([state, intensities]) => ({
    pattern: `${state}_emotional_pattern`,
    confidence: intensities.length / emotions.length,
    examples: [`Average intensity: ${(intensities.reduce((a, b) => a + b, 0) / intensities.length).toFixed(2)}`],
    impact: intensities.length > emotions.length * 0.2 ? 'high' : 'medium',
  }));

  return { patterns, trends: [], metrics: { total_emotional_records: emotions.length } };
}

async function analyzeCommunicationEffectiveness(prisma: any, whereCondition: any) {
  const interactions = await prisma.socialInteraction.findMany({
    where: whereCondition,
  });

  const avgQuality = interactions.reduce((sum: number, i: any) => sum + (i.quality || 0.5), 0) / interactions.length;

  const patterns = [
    {
      pattern: 'communication_effectiveness',
      confidence: avgQuality,
      examples: [`Average interaction quality: ${avgQuality.toFixed(2)}`],
      impact: avgQuality > 0.7 ? 'high' : avgQuality > 0.5 ? 'medium' : 'low',
    },
  ];

  return { patterns, trends: [], metrics: { average_quality: avgQuality } };
}

async function analyzeSocialGrowth(prisma: any, whereCondition: any) {
  const learnings = await prisma.socialLearning.findMany({
    where: whereCondition,
  });

  const avgConfidence = learnings.reduce((sum: number, l: any) => sum + l.confidence, 0) / learnings.length;

  const patterns = [
    {
      pattern: 'social_learning_growth',
      confidence: avgConfidence,
      examples: [`${learnings.length} social learnings recorded`],
      impact: learnings.length > 10 ? 'high' : 'medium',
    },
  ];

  return { patterns, trends: [], metrics: { total_learnings: learnings.length } };
}

function calculateQualityTrend(interactions: any[]): number {
  if (interactions.length < 2) return 0;

  const firstHalf = interactions.slice(0, Math.floor(interactions.length / 2));
  const secondHalf = interactions.slice(Math.floor(interactions.length / 2));

  const firstAvg = firstHalf.reduce((sum, i) => sum + (i.quality || 0.5), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, i) => sum + (i.quality || 0.5), 0) / secondHalf.length;

  return secondAvg - firstAvg;
}

function generateRecommendations(analysisType: string, analysisData: any): string[] {
  const recommendations: string[] = [];

  switch (analysisType) {
    case 'relationship_evolution':
      if (analysisData.metrics.total_interactions < 5) {
        recommendations.push('Consider increasing interaction frequency to build stronger relationship patterns');
      }
      break;
    case 'emotional_development':
      recommendations.push('Continue tracking emotional patterns to build emotional intelligence');
      break;
    case 'communication_effectiveness':
      if (analysisData.metrics.average_quality < 0.6) {
        recommendations.push('Focus on improving communication quality in future interactions');
      }
      break;
  }

  return recommendations;
}
