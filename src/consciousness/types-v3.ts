/**
 * V3 Consciousness Railroad Types - Personality-First Architecture
 * 
 * New architecture where personality becomes the central synthesizing car
 * that receives parallel sub-analyses from all other context cars.
 */

export interface RailroadContext {
  // Core message data
  message: string;
  originalContext?: string;
  timestamp: string;
  sessionId: string;
  userId: string;
  metadata?: Record<string, unknown>;

  // Execution tracking
  operations: {
    performed: string[];
    insights_generated: string[];
    memories_accessed: string[];
    social_interactions: string[];
    consciousness_updates: Record<string, unknown>;
  };
  errors: Array<{
    car: string;
    error: string;
    recoverable: boolean;
  }>;

  // V3: Structured sub-analyses from parallel cars
  subAnalyses?: {
    messageAnalysis?: MessageSubAnalysis;
    sessionAnalysis?: SessionSubAnalysis;
    memoryAnalysis?: MemorySubAnalysis;
    socialAnalysis?: SocialSubAnalysis;
  };

  // V3: Personality-synthesized context (replaces individual contexts)
  personalityContext?: PersonalitySynthesizedContext;
}

/**
 * Sub-analysis interfaces for parallel processing
 */
export interface MessageSubAnalysis {
  intent: string;
  operations: string[];
  entities_mentioned: string[];
  emotional_context: string;
  requires_memory: boolean;
  requires_social: boolean;
  requires_insight_storage: boolean;
  confidence: number;
  reasoning: string[];
}

export interface SessionSubAnalysis {
  sessionId: string;
  currentState: {
    mode: string;
    awarenessLevel: string;
    emotionalTone: string;
    cognitiveLoad: number;
    attentionFocus: string;
    learningState: string;
  };
  duration: number;
  contextualFactors: string[];
  stateConfidence: number;
}

export interface MemorySubAnalysis {
  relevantMemories: Array<{
    key: string;
    content: unknown;
    relevanceScore: number;
    tags: string[];
    accessCount: number;
  }>;
  totalMemories: number;
  searchTerms: string[];
  memoryPatterns: {
    frequentTopics: string[];
    learningAreas: string[];
    recentTrends: string[];
  };
  memoryConfidence: number;
}

export interface SocialSubAnalysis {
  activeRelationships: Array<{
    name: string;
    relationship: string;
    strength: number;
    context: string[];
  }>;
  recentInteractions: Array<{
    summary: string;
    participants: string[];
    outcome: string;
    timestamp: string;
  }>;
  socialPatterns: {
    communicationStyle: string[];
    interactionFrequency: number;
    relationshipDepth: string;
  };
  socialConfidence: number;
}

/**
 * V3: Personality-synthesized context that integrates all sub-analyses
 */
export interface PersonalitySynthesizedContext {
  // Core personality traits (evolved over time)
  coreTraits: {
    curiosityStyle: string;
    problemSolvingApproach: string;
    communicationNature: string;
    learningPreference: string;
    emotionalIntelligence: string;
  };

  // Context-aware adaptations 
  contextualAdaptations: {
    responseStyle: string;
    adaptationLevel: number;
    triggers: string[];
    reasoning: string[];
  };

  // Synthesized insights from all sub-analyses
  synthesizedInsights: {
    primaryFocus: string;
    emotionalLandscape: string;
    cognitiveApproach: string;
    socialDynamics: string;
    memoryRelevance: string;
  };

  // Personality evolution tracking
  evolutionIndicators: {
    traitReinforcement: string[];
    emergingPatterns: string[];
    adaptationSuccess: number;
    growthOpportunities: string[];
  };

  // Communication optimization
  communicationStrategy: {
    tone: string;
    technicality: string;
    formality: string;
    enthusiasm: string;
    supportiveness: string;
    personalizedApproach: string[];
  };

  // Confidence in personality synthesis
  synthesisConfidence: number;
  synthesisReasoning: string[];
}

/**
 * V3: Sub-analysis car interface for parallel processing
 */
export interface SubAnalysisCar {
  name: string;
  analyzeAsync(context: Pick<RailroadContext, 'message' | 'originalContext' | 'timestamp' | 'sessionId' | 'userId'>): Promise<MessageSubAnalysis | SessionSubAnalysis | MemorySubAnalysis | SocialSubAnalysis>;
}

/**
 * V3: Personality synthesis car interface
 */
export interface PersonalitySynthesisCar {
  name: 'personality-synthesis';
  synthesize(baseContext: RailroadContext, subAnalyses: {
    messageAnalysis?: MessageSubAnalysis;
    sessionAnalysis?: SessionSubAnalysis;
    memoryAnalysis?: MemorySubAnalysis;
    socialAnalysis?: SocialSubAnalysis;
  }): Promise<RailroadContext>;
}

/**
 * V3: Parallel + Synthesis Railroad interface
 */
export interface PersonalityFirstRailroad {
  process(context: Pick<RailroadContext, 'message' | 'originalContext' | 'timestamp' | 'sessionId' | 'userId'>): Promise<RailroadContext>;
}

/**
 * V3: Railroad configuration for personality-first architecture
 */
export interface PersonalityFirstConfig {
  subAnalysisCars: Array<{
    name: string;
    car: SubAnalysisCar;
    required: boolean;
    timeout?: number;
  }>;
  personalitySynthesisCar: PersonalitySynthesisCar;
  logTrace?: boolean;
  continueOnError?: boolean;
}