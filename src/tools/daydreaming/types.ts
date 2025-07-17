import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Configuration for Day-Dreaming Loop behavior
 */
export interface DaydreamingConfig {
  enabled: boolean;
  samplingIntervalMs: number;
  maxConceptPairsPerCycle: number;
  minIdleTimeMs: number;
  maxCognitiveLoad: number;

  // Concept sampling weights
  recentMemoryWeight: number;
  importanceWeight: number;
  noveltyWeight: number;

  // Connection generation settings
  maxThoughtsPerConnection: number;
  explorationDepth: number;

  // Insight evaluation thresholds
  noveltyThreshold: number;
  plausibilityThreshold: number;
  valueThreshold: number;

  // GenAI evaluation settings
  useGenAIEvaluation: boolean;
}

/**
 * A pair of concepts selected for connection exploration
 */
export interface ConceptPair {
  concept1: {
    entity: string;
    type: string;
    source: 'memory' | 'knowledge_graph' | 'recent_conversation';
    importance?: number;
    lastAccessed?: Date;
  };
  concept2: {
    entity: string;
    type: string;
    source: 'memory' | 'knowledge_graph' | 'recent_conversation';
    importance?: number;
    lastAccessed?: Date;
  };
  samplingReason: string;
  sampledAt: Date;
}

/**
 * A hypothesis about potential connections between concepts
 */
export interface ConnectionHypothesis {
  conceptPair: ConceptPair;
  hypothesis: string;
  explorationSteps: string[];
  confidence: number;
  noveltyScore: number;
  generatedAt: Date;
  thinkingSessionId?: string;
}

/**
 * Evaluation of a connection hypothesis
 */
export interface ConnectionEvaluation {
  hypothesis: ConnectionHypothesis;

  // Core evaluation metrics
  novelty: number; // 0-1: How unexpected/new is this connection?
  plausibility: number; // 0-1: How logical/reasonable is this connection?
  value: number; // 0-1: How useful/interesting is this insight?
  actionability: number; // 0-1: Does this suggest new directions?

  // Overall assessment
  overallScore: number;
  shouldStore: boolean;
  reason: string;

  evaluatedAt: Date;

  // Optional GenAI metadata
  genAIMetadata?: {
    noveltyExplanation?: string;
    plausibilityExplanation?: string;
    valueExplanation?: string;
    actionabilityExplanation?: string;
    keyInsights?: string[];
    suggestedApplications?: string[];
    improvementSuggestions?: string[];
    aiConfidence?: number;
    model?: string;
    evaluatedWithAI?: boolean;
    fallbackReason?: string;
  };
}

/**
 * A valuable insight generated from the Day-Dreaming Loop
 */
export interface SerendipitousInsight {
  id: string;
  evaluation: ConnectionEvaluation;
  insight: string;
  implications: string[];
  suggestedActions: string[];
  tags: string[];
  relatedMemories: string[];
  storedAt: Date;
}

/**
 * Context for background Day-Dreaming Loop execution
 */
export interface DaydreamingContext {
  sessionId: string;
  currentCognitiveLoad: number;
  idleTimeMs: number;
  recentConcepts: string[];
  activeIntentions: string[];
  lastDaydreamCycle: Date | null;
}

/**
 * Result of a Day-Dreaming Loop cycle
 */
export interface DaydreamingCycleResult {
  cycleId: string;
  startTime: Date;
  endTime: Date;

  conceptPairsExplored: ConceptPair[];
  hypothesesGenerated: ConnectionHypothesis[];
  evaluationsCompleted: ConnectionEvaluation[];
  insightsStored: SerendipitousInsight[];

  performance: {
    totalThinkingSteps: number;
    averageConfidence: number;
    storageRate: number; // percentage of hypotheses that became stored insights
  };

  nextCycleRecommendation: {
    suggestedInterval: number;
    focusAreas: string[];
  };
}

/**
 * Day-Dreaming Loop tool definitions
 */
export const DAYDREAMING_TOOLS: Record<string, Tool> = {
  daydream_cycle: {
    name: 'daydream_cycle',
    description: 'Execute a complete Day-Dreaming Loop cycle: sample concepts, generate connections, evaluate insights',
    inputSchema: {
      type: 'object',
      properties: {
        max_concept_pairs: {
          type: 'number',
          description: 'Maximum number of concept pairs to explore in this cycle',
          default: 3,
          minimum: 1,
          maximum: 10,
        },
        focus_area: {
          type: 'string',
          description: 'Optional focus area or domain to bias concept sampling towards',
        },
        exploration_depth: {
          type: 'string',
          enum: ['surface', 'moderate', 'deep'],
          default: 'moderate',
          description: 'How deeply to explore each concept connection',
        },
      },
    },
  },

  sample_concepts: {
    name: 'sample_concepts',
    description: 'Sample concept pairs for connection exploration using various strategies',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of concept pairs to sample',
          default: 1,
          minimum: 1,
          maximum: 5,
        },
        strategy: {
          type: 'string',
          enum: ['random', 'importance_weighted', 'recent_bias', 'cross_domain'],
          default: 'importance_weighted',
          description: 'Sampling strategy to use',
        },
        exclude_recent: {
          type: 'boolean',
          default: true,
          description: 'Whether to exclude recently explored concept pairs',
        },
      },
    },
  },

  explore_connection: {
    name: 'explore_connection',
    description: 'Generate hypotheses about potential connections between two concepts',
    inputSchema: {
      type: 'object',
      properties: {
        concept1: {
          type: 'string',
          description: 'First concept to explore',
        },
        concept2: {
          type: 'string',
          description: 'Second concept to explore',
        },
        exploration_depth: {
          type: 'string',
          enum: ['surface', 'moderate', 'deep'],
          default: 'moderate',
          description: 'Depth of exploration',
        },
        context: {
          type: 'string',
          description: 'Additional context or focus for the exploration',
        },
      },
      required: ['concept1', 'concept2'],
    },
  },

  evaluate_insight: {
    name: 'evaluate_insight',
    description: 'Evaluate a connection hypothesis for novelty, plausibility, and value',
    inputSchema: {
      type: 'object',
      properties: {
        hypothesis: {
          type: 'string',
          description: 'The connection hypothesis to evaluate',
        },
        concept1: {
          type: 'string',
          description: 'First concept in the connection',
        },
        concept2: {
          type: 'string',
          description: 'Second concept in the connection',
        },
        exploration_context: {
          type: 'string',
          description: 'Context from the exploration process',
        },
      },
      required: ['hypothesis', 'concept1', 'concept2'],
    },
  },

  get_daydream_insights: {
    name: 'get_daydream_insights',
    description: 'Retrieve stored serendipitous insights from Day-Dreaming Loop sessions',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          default: 10,
          minimum: 1,
          maximum: 50,
          description: 'Maximum number of insights to retrieve',
        },
        min_score: {
          type: 'number',
          default: 0.7,
          minimum: 0,
          maximum: 1,
          description: 'Minimum overall score for insights to include',
        },
        days_back: {
          type: 'number',
          default: 7,
          minimum: 1,
          description: 'How many days back to search for insights',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by specific tags',
        },
      },
    },
  },

  configure_daydreaming: {
    name: 'configure_daydreaming',
    description: 'Update Day-Dreaming Loop configuration parameters',
    inputSchema: {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          description: 'Enable or disable the Day-Dreaming Loop',
        },
        sampling_interval_minutes: {
          type: 'number',
          minimum: 1,
          maximum: 1440,
          description: 'Interval between automatic daydreaming cycles in minutes',
        },
        novelty_threshold: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Minimum novelty score for storing insights',
        },
        max_cognitive_load: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Maximum cognitive load before pausing daydreaming',
        },
      },
    },
  },
};

/**
 * Default configuration for Day-Dreaming Loop
 */
export const DEFAULT_DAYDREAMING_CONFIG: DaydreamingConfig = {
  enabled: true,
  samplingIntervalMs: 5 * 60 * 1000, // 5 minutes
  maxConceptPairsPerCycle: 3,
  minIdleTimeMs: 30 * 1000, // 30 seconds
  maxCognitiveLoad: 0.7,

  recentMemoryWeight: 0.3,
  importanceWeight: 0.4,
  noveltyWeight: 0.3,

  maxThoughtsPerConnection: 8,
  explorationDepth: 2,

  noveltyThreshold: 0.6,
  plausibilityThreshold: 0.5,
  valueThreshold: 0.6,

  useGenAIEvaluation: true,
};
