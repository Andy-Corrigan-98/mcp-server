import { MemoryResult } from '../core/db/index.js';
import {
  ConsciousnessContextResult,
  ConsciousnessState,
  ConsciousnessMetrics,
  Intention,
  Insight,
  LearningPatterns,
} from '../consciousness/types.js';
import { ConsciousnessPrismaService } from '../core/db/prisma-service.js';
import { ConfigurationService } from '../core/db/configuration-service.js';
import { GuidGenerator } from '../core/utils/guid.js';

/**
 * Session update memory content structure
 */
interface SessionUpdateContent {
  activityType: string;
  cognitiveImpact: string;
  attentionFocus?: string;
  learningOccurred: boolean;
  sessionId: string;
  timestamp: string;
  stateAfterUpdate: ConsciousnessState;
}

/**
 * Get comprehensive context about persistent consciousness state for agent decision-making
 */
export async function getContext(args: {
  include_metrics?: boolean;
  include_memory_state?: boolean;
  include_intentions?: boolean;
  include_personality?: boolean;
}): Promise<ConsciousnessContextResult> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Load configuration values
  const maxMemorySlice = await config.getNumber('consciousness.max_memory_slice', 5);
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

  const includeMetrics = Boolean(args.include_metrics);
  const includeMemoryState = Boolean(args.include_memory_state);
  const includeIntentions = Boolean(args.include_intentions !== false);
  const includePersonality = Boolean(args.include_personality !== false);

  // Generate session info using modern methods
  const sessionId = GuidGenerator.generateSessionId();
  const sessionStartTime = new Date();

  // Create current consciousness state for context
  const currentState: ConsciousnessState = {
    timestamp: new Date(),
    sessionId,
    mode: 'analytical',
    activeProcesses: ['state_assessment', 'context_compilation'],
    attentionFocus: 'system_startup',
    awarenessLevel: 'medium',
    cognitiveLoad: 0.1,
    learningState: 'active',
    emotionalTone: 'neutral',
  };

  const baseContext = {
    timestamp: new Date().toISOString(),
    sessionId,
    sessionDuration: Date.now() - sessionStartTime.getTime(),
    currentState,
  };

  const result: ConsciousnessContextResult = { ...baseContext };

  if (includeMetrics) {
    result.brainMetrics = await calculateBrainMetrics(db, sessionStartTime);
  }

  if (includeMemoryState) {
    try {
      const memoryCount = await db.getMemoryCount();
      const recentMemories = await db.searchMemories('', [], undefined);
      result.memoryState = {
        totalMemories: memoryCount,
        recentActivity: recentMemories.slice(0, maxMemorySlice).map((m: MemoryResult) => ({
          key: m.key,
          tags: m.tags,
          importance: m.importance,
          timestamp: m.storedAt,
        })),
      };
    } catch {
      result.memoryState = { status: 'unavailable' };
    }
  }

  if (includeIntentions) {
    result.intentions = await getActiveIntentions(db, intentionStatuses);
  }

  if (includePersonality) {
    result.personalityProfile = {
      vocabularyPreferences: {
        priorityLevels,
        reflectionDepths,
        intentionStatuses,
        intentionDurations,
        insightCategories,
      },
      learningPatterns: await getLearningPatterns(db, sessionStartTime),
    };
  }

  return result;
}

/**
 * Calculate comprehensive brain metrics
 */
async function calculateBrainMetrics(
  db: ConsciousnessPrismaService,
  sessionStartTime: Date
): Promise<ConsciousnessMetrics> {
  try {
    const memoryCount = await db.getMemoryCount();
    const totalInsights = await countInsights(db);
    const totalIntentions = await countIntentions(db);

    return {
      memoryUtilization: Math.min(memoryCount / 1000, 1.0),
      learningRate: calculateLearningRate(totalInsights, sessionStartTime),
      sessionActivity: calculateSessionActivity(sessionStartTime),
      personalityEvolution: calculatePersonalityEvolution(),
      attentionPatterns: await getAttentionPatterns(db),
      memoryAccessPatterns: await getMemoryAccessPatterns(db),
      totalMemories: memoryCount,
      totalInsights,
      totalIntentions,
    };
  } catch {
    return {
      memoryUtilization: 0,
      learningRate: 0,
      sessionActivity: 0,
      personalityEvolution: 0,
      attentionPatterns: {},
      memoryAccessPatterns: {},
      totalMemories: 0,
      totalInsights: 0,
      totalIntentions: 0,
    };
  }
}

/**
 * Get active intentions from memory
 */
async function getActiveIntentions(db: ConsciousnessPrismaService, intentionStatuses: string[]): Promise<Intention[]> {
  try {
    const memories = await db.searchMemories('', ['intention'], undefined);
    return memories
      .map((m: MemoryResult) => m.content as Intention)
      .filter(intention => intention && intention.status === intentionStatuses[0])
      .slice(0, 10); // Limit to 10 active intentions
  } catch {
    return [];
  }
}

/**
 * Get learning patterns from insights
 */
async function getLearningPatterns(db: ConsciousnessPrismaService, sessionStartTime: Date): Promise<LearningPatterns> {
  try {
    const insights = await db.searchMemories('', ['insight'], undefined);
    const recentInsights = insights
      .slice(0, 10)
      .map(insight => {
        const content = insight.content as Insight;
        return content.category;
      })
      .filter(Boolean);

    const confidenceValues = insights.map(insight => {
      const content = insight.content as Insight;
      return content.confidence || 0;
    });

    const averageConfidence =
      confidenceValues.length > 0 ? confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length : 0;

    const learningVelocity = insights.length / Math.max(1, Date.now() - sessionStartTime.getTime());

    return {
      recentCategories: recentInsights,
      averageConfidence,
      learningVelocity,
    };
  } catch {
    return {
      recentCategories: [],
      averageConfidence: 0,
      learningVelocity: 0,
    };
  }
}

/**
 * Count total insights in the system
 */
async function countInsights(db: ConsciousnessPrismaService): Promise<number> {
  try {
    const memories = await db.searchMemories('', ['insight'], undefined);
    return memories.length;
  } catch {
    return 0;
  }
}

/**
 * Count total intentions in the system
 */
async function countIntentions(db: ConsciousnessPrismaService): Promise<number> {
  try {
    const memories = await db.searchMemories('', ['intention'], undefined);
    return memories.length;
  } catch {
    return 0;
  }
}

/**
 * Get attention patterns from session updates
 */
async function getAttentionPatterns(db: ConsciousnessPrismaService): Promise<Record<string, number>> {
  try {
    const updates = await db.searchMemories('', ['session_update'], undefined);
    const patterns: Record<string, number> = {};

    for (const update of updates) {
      const content = update.content as SessionUpdateContent;
      if (content?.attentionFocus) {
        patterns[content.attentionFocus] = (patterns[content.attentionFocus] || 0) + 1;
      }
    }

    return patterns;
  } catch {
    return {};
  }
}

/**
 * Get memory access patterns
 */
async function getMemoryAccessPatterns(db: ConsciousnessPrismaService): Promise<Record<string, number>> {
  try {
    const memories = await db.searchMemories('', [], undefined);
    const patterns: Record<string, number> = {};

    for (const memory of memories) {
      for (const tag of memory.tags) {
        patterns[tag] = (patterns[tag] || 0) + (memory.accessCount || 0);
      }
    }

    return patterns;
  } catch {
    return {};
  }
}

/**
 * Calculate learning rate based on insights and time
 */
function calculateLearningRate(totalInsights: number, sessionStartTime: Date): number {
  const sessionDuration = Date.now() - sessionStartTime.getTime();
  const hoursElapsed = sessionDuration / (1000 * 60 * 60);
  return hoursElapsed > 0 ? totalInsights / hoursElapsed : 0;
}

/**
 * Calculate session activity level
 */
function calculateSessionActivity(sessionStartTime: Date): number {
  const sessionDuration = Date.now() - sessionStartTime.getTime();
  const minutesElapsed = sessionDuration / (1000 * 60);
  return Math.min(minutesElapsed * 0.1, 1.0); // Simple activity calculation
}

/**
 * Calculate personality evolution rate
 */
function calculatePersonalityEvolution(): number {
  // Simplified calculation - in reality would track personality changes over time
  return 0.15;
}
