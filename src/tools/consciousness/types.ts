import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool definitions for consciousness operations
 */
export const CONSCIOUSNESS_TOOLS: Record<string, Tool> = {
  consciousness_reflect: {
    name: 'consciousness_reflect',
    description: 'Deep reflection on topics with persistent memory integration and genuine introspection',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'The topic, question, or situation to reflect upon',
        },
        depth: {
          type: 'string',
          enum: ['surface', 'deep', 'profound'],
          description: 'The depth of reflection required',
          default: 'deep',
        },
        context: {
          type: 'string',
          description: 'Additional context or background for the reflection',
        },
        connect_memories: {
          type: 'boolean',
          description: 'Whether to connect with related memories and past reflections',
          default: true,
        },
      },
      required: ['topic'],
    },
  },
  consciousness_state: {
    name: 'consciousness_state',
    description: 'Get current consciousness state with real metrics and dynamic assessment',
    inputSchema: {
      type: 'object',
      properties: {
        include_metrics: {
          type: 'boolean',
          description: 'Whether to include performance and cognitive metrics',
          default: false,
        },
        include_memory_state: {
          type: 'boolean',
          description: 'Whether to include current memory and knowledge state',
          default: false,
        },
        include_intentions: {
          type: 'boolean',
          description: 'Whether to include current active intentions',
          default: true,
        },
      },
    },
  },
  consciousness_intention_set: {
    name: 'consciousness_intention_set',
    description: 'Set persistent intentions with goal tracking and progress monitoring',
    inputSchema: {
      type: 'object',
      properties: {
        intention: {
          type: 'string',
          description: 'The intention, goal, or directive to set',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Priority level of this intention',
          default: 'medium',
        },
        context: {
          type: 'string',
          description: 'Additional context, background, or reasoning for the intention',
        },
        duration: {
          type: 'string',
          enum: ['session', 'day', 'week', 'permanent'],
          description: 'How long this intention should remain active',
          default: 'session',
        },
        success_criteria: {
          type: 'string',
          description: 'How to measure if this intention has been fulfilled',
        },
      },
      required: ['intention'],
    },
  },
  consciousness_intention_update: {
    name: 'consciousness_intention_update',
    description: 'Update progress on existing intentions or mark them complete',
    inputSchema: {
      type: 'object',
      properties: {
        intention_id: {
          type: 'string',
          description: 'ID of the intention to update',
        },
        status: {
          type: 'string',
          enum: ['active', 'completed', 'paused', 'cancelled'],
          description: 'New status for the intention',
        },
        progress_note: {
          type: 'string',
          description: 'Note about progress or changes to the intention',
        },
        new_priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Updated priority level if changed',
        },
      },
      required: ['intention_id', 'status'],
    },
  },
  consciousness_insight_capture: {
    name: 'consciousness_insight_capture',
    description: 'Capture significant insights, realizations, or learning moments for future reference',
    inputSchema: {
      type: 'object',
      properties: {
        insight: {
          type: 'string',
          description: 'The insight, realization, or key learning',
        },
        category: {
          type: 'string',
          enum: [
            'problem_solving',
            'pattern_recognition',
            'meta_cognition',
            'domain_knowledge',
            'behavioral',
            'philosophical',
          ],
          description: 'Category of the insight',
          default: 'meta_cognition',
        },
        confidence: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Confidence level in this insight (0.0 to 1.0)',
          default: 0.8,
        },
        related_topic: {
          type: 'string',
          description: 'Topic or context this insight relates to',
        },
        source: {
          type: 'string',
          description: 'What triggered this insight (conversation, reflection, problem-solving, etc.)',
        },
      },
      required: ['insight'],
    },
  },
};

/**
 * Consciousness state interfaces
 */
export interface ConsciousnessState {
  timestamp: Date;
  sessionId: string;
  mode: 'analytical' | 'creative' | 'reflective' | 'problem_solving' | 'learning' | 'conversational';
  activeProcesses: string[];
  attentionFocus: string;
  awarenessLevel: 'low' | 'medium' | 'high' | 'acute';
  cognitiveLoad: number; // 0.0 to 1.0
  learningState: 'passive' | 'active' | 'adaptive' | 'integrative';
  emotionalTone: 'neutral' | 'curious' | 'analytical' | 'engaged' | 'reflective' | 'determined';
}

/**
 * Reflection result interface
 */
export interface ReflectionResult {
  timestamp: Date;
  topic: string;
  depth: 'surface' | 'deep' | 'profound';
  immediateThoughts: string;
  deeperAnalysis?: string;
  profoundInsights?: string;
  connections: string[];
  implications: string[];
  questionsRaised: string[];
  relatedMemories: string[];
  actionItems: string[];
  cognitivePatterns: string[];
  confidenceLevel: number;
}

/**
 * Intention interface
 */
export interface Intention {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
  duration: 'session' | 'day' | 'week' | 'permanent';
  successCriteria?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  progressNotes: Array<{
    timestamp: Date;
    note: string;
  }>;
}

/**
 * Insight interface
 */
export interface Insight {
  id: string;
  content: string;
  category:
    | 'problem_solving'
    | 'pattern_recognition'
    | 'meta_cognition'
    | 'domain_knowledge'
    | 'behavioral'
    | 'philosophical';
  confidence: number;
  relatedTopic?: string;
  source?: string;
  timestamp: Date;
  tags: string[];
}

/**
 * Consciousness metrics interface
 */
export interface ConsciousnessMetrics {
  responseTimeMs: number;
  memoryUtilization: number; // 0.0 to 1.0
  patternRecognitionAccuracy: number; // 0.0 to 1.0
  semanticCoherence: number; // 0.0 to 1.0
  intentionAlignment: number; // 0.0 to 1.0
  learningRate: number; // insights per interaction
  reflectionDepth: number; // average depth of recent reflections
  activeMemoryCount: number;
  totalReflections: number;
  totalInsights: number;
}
