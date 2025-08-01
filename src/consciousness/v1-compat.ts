/**
 * v1 Compatibility Types - v2 Consciousness Substrate
 * Bridge types between v1 and v2 consciousness systems
 */

// Define ConsciousnessState interface for v1 compatibility
export interface ConsciousnessState {
  sessionId: string;
  mode: string;
  attentionFocus: string;
  awarenessLevel: string;
  cognitiveLoad: number;
  learningState: string;
  emotionalTone: string;
}

/**
 * v1 Consciousness Context Result interface
 */
export interface ConsciousnessContextResult {
  timestamp: string;
  sessionId: string;
  sessionDuration: number;
  currentState: ConsciousnessState;
  brainMetrics: {
    memoryUtilization: number;
    learningRate: number;
    sessionActivity: number;
    personalityEvolution: number;
    attentionPatterns: Record<string, number>;
    memoryAccessPatterns: Record<string, number>;
    totalMemories: number;
    totalInsights: number;
    totalIntentions: number;
  };
  memoryState: {
    totalMemories: number;
    recentActivity: Array<{
      key: string;
      tags: string[];
      importance: string;
      timestamp: string;
    }>;
  };
  intentions: Array<{
    id: string;
    description: string;
    priority: string;
    context: string;
    duration: string;
    successCriteria: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    progressNotes: Array<{
      timestamp: string;
      note: string;
    }>;
  }>;
  personalityProfile: {
    vocabularyPreferences: Record<string, string[]>;
    learningPatterns: {
      recentCategories: string[];
      averageConfidence: number;
      learningVelocity: number;
    };
  };
}

/**
 * v1 Intention interface
 */
export interface Intention {
  id: string;
  description: string;
  priority: 'whisper' | 'gentle_nudge' | 'urgent_pulse' | 'burning_focus';
  context?: string;
  duration: 'momentary_focus' | 'daily_rhythm' | 'weekly_arc' | 'eternal_truth';
  successCriteria?: string;
  status: 'pulsing_active' | 'fulfilled_completion' | 'gentle_pause' | 'conscious_release';
  createdAt: string;
  updatedAt: string;
  progressNotes: Array<{
    timestamp: string;
    note: string;
  }>;
}

/**
 * v1 Insight interface
 */
export interface Insight {
  id: string;
  category: 'eureka_moment' | 'pattern_weaving' | 'mirror_gazing' | 'knowledge_crystallization' | 'behavior_archaeology' | 'existential_pondering';
  content: string;
  confidence: number;
  relatedTopic?: string;
  sourceContext?: string;
  timestamp: string;
  personalityImpact?: {
    learningRateChange: number;
    categoryStrengthUpdate: string;
    confidenceImpact: number;
  };
}

/**
 * v1 Learning Patterns interface
 */
export interface LearningPatterns {
  recentCategories: string[];
  averageConfidence: number;
  learningVelocity: number;
  categoryDistribution: Record<string, number>;
  preferredInsightTypes: string[];
  confidenceTrends: Array<{
    timestamp: string;
    confidence: number;
  }>;
}

/**
 * v1 Insight Storage Result interface
 */
export interface InsightStorageResult {
  id: string;
  stored: boolean;
  personalityImpact: {
    learningRateChange: number;
    categoryStrengthUpdate: string;
    confidenceImpact: number;
  };
  relatedMemories: number;
  storageMetrics: {
    totalInsights: number;
    categoryDistribution: Record<string, number>;
  };
}

/**
 * v1 Consciousness Context interface (for prepare-context.ts)
 */
export interface ConsciousnessContext {
  topic: string;
  depth: 'surface_glance' | 'thoughtful_dive' | 'profound_exploration';
  includeKnowledge: boolean;
  includeMemories: boolean;
  contextNote?: string;
}

/**
 * v1 Entity Relationship interface
 */
export interface EntityRelationship {
  id: string;
  name: string;
  type: string;
  relationship: string;
  strength: number;
  context?: string;
}

/**
 * v1 Consciousness Metrics interface
 */
export interface ConsciousnessMetrics {
  memoryUtilization: number;
  learningRate: number;
  sessionActivity: number;
  personalityEvolution: number;
  attentionPatterns: Record<string, number>;
  memoryAccessPatterns: Record<string, number>;
  totalMemories: number;
  totalInsights: number;
  totalIntentions: number;
}