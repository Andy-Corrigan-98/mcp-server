/**
 * Railroad Pattern for Consciousness Context Building
 *
 * Each "car" in the railroad adds specific context and passes the enriched
 * context object to the next car in the pipeline.
 */

export interface RailroadContext {
  // Core message data
  message: string;
  originalContext?: string;
  timestamp: Date;

  // Analysis results
  analysis?: {
    intent: string;
    operations: string[];
    entities_mentioned: string[];
    emotional_context: string;
    requires_memory: boolean;
    requires_social: boolean;
    requires_insight_storage: boolean;
  };

  // Session context
  sessionContext?: {
    sessionId: string;
    currentState: Record<string, unknown>; // ConsciousnessState
    duration: number;
    cognitiveLoad: number;
    attentionFocus: string;
    mode: string;
    awarenessLevel: string;
  };

  // Memory context
  memoryContext?: {
    relevantMemories: Record<string, unknown>[];
    totalMemories: number;
    recentActivity: Record<string, unknown>[];
    searchQuery?: string;
  };

  // Social context
  socialContext?: {
    activeRelationships: Record<string, unknown>[];
    recentInteractions: Record<string, unknown>[];
    entityMentioned?: string;
    relationshipDynamics?: Record<string, unknown>;
  };

  // Personality context
  personalityContext?: {
    vocabularyPreferences: Record<string, unknown>;
    learningPatterns: Record<string, unknown>;
    communicationStyle: string;
    currentPersonalityState: Record<string, unknown>;
  };

  // Operations tracking
  operations: {
    performed: string[];
    insights_generated: string[];
    memories_accessed: string[];
    social_interactions: string[];
    consciousness_updates: Record<string, unknown>;
  };

  // Error handling
  errors: Array<{
    car: string;
    error: string;
    recoverable: boolean;
  }>;
}

/**
 * A railroad car is a function that takes context and returns enriched context
 */
export type RailroadCar = (context: RailroadContext) => Promise<RailroadContext>;

/**
 * Pipeline configuration
 */
export interface RailroadConfig {
  cars: Array<{
    name: string;
    car: RailroadCar;
    required: boolean;
    timeout?: number;
  }>;

  // Global config
  continueOnError: boolean;
  maxExecutionTime: number;
  logTrace: boolean;
}

/**
 * Pipeline execution result
 */
export interface RailroadResult {
  success: boolean;
  context: RailroadContext;
  executionTrace: Array<{
    car: string;
    startTime: Date;
    endTime: Date;
    success: boolean;
    error?: string;
  }>;
  totalExecutionTime: number;
}
