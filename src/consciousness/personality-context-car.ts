import { RailroadContext } from '../types.js';
import { ConfigurationService } from '../../core/db/configuration-service.js';
import { ConsciousnessPrismaService } from '../../core/db/prisma-service.js';
import type { LearningPatterns } from '../../consciousness/types.js';

/**
 * Personality Context Railroad Car
 *
 * Adds personality traits, vocabulary preferences, learning patterns, and
 * communication style based on accumulated consciousness data.
 */
export async function personalityContextCar(context: RailroadContext): Promise<RailroadContext> {
  try {
    const config = ConfigurationService.getInstance();
    const db = ConsciousnessPrismaService.getInstance();

    // Load vocabulary preferences from configuration
    const vocabularyPreferences = await loadVocabularyPreferences(config);

    // Get learning patterns from stored insights
    const learningPatterns = await getLearningPatterns(db);

    // Determine communication style based on context
    const communicationStyle = determineCommunicationStyle(context);

    // Build current personality state
    const currentPersonalityState = buildPersonalityState(
      context,
      vocabularyPreferences,
      learningPatterns,
      communicationStyle
    );

    return {
      ...context,
      personalityContext: {
        vocabularyPreferences,
        learningPatterns,
        communicationStyle,
        currentPersonalityState,
      },
    };
  } catch (error) {
    // If personality context fails, use defaults but continue
    return {
      ...context,
      personalityContext: {
        vocabularyPreferences: getDefaultVocabularyPreferences(),
        learningPatterns: getDefaultLearningPatterns(),
        communicationStyle: 'adaptive',
        currentPersonalityState: {
          mode: 'balanced',
          confidence: 0.8,
          engagement: 'medium',
          formality: 'casual',
        },
      },
      errors: [
        ...context.errors,
        {
          car: 'personality-context',
          error: error instanceof Error ? error.message : 'Unknown personality error',
          recoverable: true,
        },
      ],
    };
  }
}

/**
 * Load vocabulary preferences from configuration
 */
async function loadVocabularyPreferences(config: ConfigurationService) {
  const priorityLevels = await config.getEnumArray('personality.priority_levels', [
    'whisper',
    'gentle_nudge',
    'urgent_pulse',
    'burning_focus',
  ]);

  const reflectionDepths = await config.getEnumArray('personality.reflection_depths', [
    'surface_glance',
    'thoughtful_dive',
    'profound_exploration',
  ]);

  const intentionStatuses = await config.getEnumArray('personality.intention_statuses', [
    'pulsing_active',
    'fulfilled_completion',
    'gentle_pause',
    'conscious_release',
  ]);

  const intentionDurations = await config.getEnumArray('personality.intention_durations', [
    'momentary_focus',
    'daily_rhythm',
    'weekly_arc',
    'eternal_truth',
  ]);

  const insightCategories = await config.getEnumArray('personality.insight_categories', [
    'eureka_moment',
    'pattern_weaving',
    'mirror_gazing',
    'knowledge_crystallization',
    'behavior_archaeology',
    'existential_pondering',
  ]);

  return {
    priorityLevels,
    reflectionDepths,
    intentionStatuses,
    intentionDurations,
    insightCategories,
  };
}

/**
 * Get learning patterns from recent insights and interactions
 */
async function getLearningPatterns(db: ConsciousnessPrismaService) {
  try {
    // Get recent insights to analyze learning patterns
    const recentInsights = await db.searchMemories('', ['insight'], undefined);

    const categories: string[] = [];
    let totalConfidence = 0;
    let confidenceCount = 0;

    if (recentInsights && recentInsights.length > 0) {
      const MAX_RECENT_INSIGHTS = 10;
      recentInsights.slice(0, MAX_RECENT_INSIGHTS).forEach(insight => {
        // Extract category from tags or content
        if (insight.tags) {
          const categoryTag = insight.tags.find(tag =>
            [
              'eureka_moment',
              'pattern_weaving',
              'mirror_gazing',
              'knowledge_crystallization',
              'behavior_archaeology',
              'existential_pondering',
            ].includes(tag)
          );
          if (categoryTag) {
            categories.push(categoryTag);
          }
        }

        // Extract confidence if available
        if (insight.content && typeof insight.content === 'object') {
          const content = insight.content as any;
          if (typeof content.confidence === 'number') {
            totalConfidence += content.confidence;
            confidenceCount++;
          }
        }
      });
    }

    const DEFAULT_CONFIDENCE = 0.8;
    const INSIGHTS_PER_WEEK = 7;
    const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : DEFAULT_CONFIDENCE;
    const learningVelocity = categories.length / Math.max(1, INSIGHTS_PER_WEEK); // insights per day roughly

    return {
      recentCategories: categories,
      averageConfidence,
      learningVelocity,
    };
  } catch {
    return getDefaultLearningPatterns();
  }
}

/**
 * Determine communication style based on current context
 */
function determineCommunicationStyle(context: RailroadContext): string {
  // Check social context for relationship-based style
  if (
    context.socialContext?.relationshipDynamics &&
    typeof context.socialContext.relationshipDynamics === 'object' &&
    'relationship' in context.socialContext.relationshipDynamics
  ) {
    const relationship = context.socialContext.relationshipDynamics.relationship as Record<string, unknown>;
    const style = relationship.communicationStyle as Record<string, unknown>;
    if (style.casual) return 'casual_friendly';
    if (style.technical) return 'technical_precise';
    if (style.playful) return 'playful_engaging';
    if (style.formal) return 'formal_respectful';
  }

  // Fall back to analysis-based style
  const intent = context.analysis?.intent || 'general';
  const emotionalContext = context.analysis?.emotional_context || 'neutral';

  if (intent === 'technical' || intent === 'problem_solving') {
    return 'technical_precise';
  } else if (intent === 'social' || emotionalContext.includes('playful')) {
    return 'casual_friendly';
  } else if (intent === 'learning' || intent === 'reflection') {
    return 'thoughtful_exploratory';
  } else {
    return 'adaptive_balanced';
  }
}

/**
 * Build current personality state based on all context
 */
function buildPersonalityState(
  context: RailroadContext,
  vocabularyPreferences: Record<string, unknown>,
  learningPatterns: LearningPatterns,
  communicationStyle: string
) {
  const mode = determinePersonalityMode(context);
  const confidence = calculateConfidenceLevel(context, learningPatterns);
  const engagement = determineEngagementLevel(context);
  const formality = determineFormalityLevel(context, communicationStyle);

  return {
    mode,
    confidence,
    engagement,
    formality,
    vocabularyTone: getVocabularyTone(vocabularyPreferences),
    learningState: learningPatterns.learningVelocity > 1 ? 'accelerated' : 'steady',
    socialAwareness: (context.socialContext?.activeRelationships?.length ?? 0) > 0 ? 'high' : 'medium',
  };
}

function determinePersonalityMode(context: RailroadContext): string {
  const intent = context.analysis?.intent || 'general';

  switch (intent) {
    case 'technical':
      return 'analytical';
    case 'social':
      return 'relational';
    case 'creative':
      return 'imaginative';
    case 'learning':
      return 'curious';
    case 'reflection':
      return 'contemplative';
    default:
      return 'balanced';
  }
}

function calculateConfidenceLevel(context: RailroadContext, learningPatterns: LearningPatterns): number {
  const DEFAULT_BASE_CONFIDENCE = 0.8;
  let baseConfidence = learningPatterns.averageConfidence || DEFAULT_BASE_CONFIDENCE;

  // Adjust based on context richness
  const MEMORY_CONFIDENCE_THRESHOLD = 5;
  const MEMORY_CONFIDENCE_BOOST = 0.1;
  if ((context.memoryContext?.relevantMemories?.length ?? 0) > MEMORY_CONFIDENCE_THRESHOLD) {
    baseConfidence += MEMORY_CONFIDENCE_BOOST;
  }

  const SOCIAL_CONFIDENCE_BOOST = 0.05;
  if (context.socialContext?.relationshipDynamics) {
    baseConfidence += SOCIAL_CONFIDENCE_BOOST;
  }

  const MIN_CONFIDENCE = 0.1;
  const MAX_CONFIDENCE = 1.0;
  return Math.min(MAX_CONFIDENCE, Math.max(MIN_CONFIDENCE, baseConfidence));
}

function determineEngagementLevel(context: RailroadContext): string {
  const emotionalContext = context.analysis?.emotional_context || 'neutral';

  if (emotionalContext.includes('excited') || emotionalContext.includes('enthusiastic')) {
    return 'high';
  } else if (emotionalContext.includes('tired') || emotionalContext.includes('distracted')) {
    return 'low';
  } else {
    return 'medium';
  }
}

function determineFormalityLevel(context: RailroadContext, communicationStyle: string): string {
  if (communicationStyle.includes('formal')) return 'formal';
  if (communicationStyle.includes('casual') || communicationStyle.includes('playful')) return 'casual';
  return 'balanced';
}

function getVocabularyTone(vocabularyPreferences: Record<string, unknown>): string {
  // Use the preferred vocabulary style - our system uses more poetic/thoughtful terms
  const priorities = (vocabularyPreferences.priorityLevels as string[]) || [];
  if (priorities.includes('gentle_nudge')) return 'thoughtful';
  if (priorities.includes('burning_focus')) return 'intense';
  return 'balanced';
}

function getDefaultVocabularyPreferences() {
  return {
    priorityLevels: ['whisper', 'gentle_nudge', 'urgent_pulse', 'burning_focus'],
    reflectionDepths: ['surface_glance', 'thoughtful_dive', 'profound_exploration'],
    intentionStatuses: ['pulsing_active', 'fulfilled_completion', 'gentle_pause', 'conscious_release'],
    intentionDurations: ['momentary_focus', 'daily_rhythm', 'weekly_arc', 'eternal_truth'],
    insightCategories: [
      'eureka_moment',
      'pattern_weaving',
      'mirror_gazing',
      'knowledge_crystallization',
      'behavior_archaeology',
      'existential_pondering',
    ],
  };
}

function getDefaultLearningPatterns() {
  const DEFAULT_LEARNING_CONFIDENCE = 0.8;
  const DEFAULT_LEARNING_VELOCITY = 0.5;
  return {
    recentCategories: ['mirror_gazing', 'pattern_weaving'],
    averageConfidence: DEFAULT_LEARNING_CONFIDENCE,
    learningVelocity: DEFAULT_LEARNING_VELOCITY,
  };
}








