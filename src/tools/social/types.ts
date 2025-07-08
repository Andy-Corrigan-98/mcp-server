import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Social consciousness tool definitions
 * Enables relationship tracking, emotional intelligence, and social learning
 * Enhanced with memory-social integration for unified consciousness
 */
export const SOCIAL_TOOLS: Record<string, Tool> = {
  social_entity_create: {
    name: 'social_entity_create',
    description: 'Create or register a new social entity (person, group, community)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Unique identifier name for the entity',
        },
        entity_type: {
          type: 'string',
          enum: ['person', 'group', 'community', 'organization', 'family', 'professional_network', 'online_community'],
          description: 'Type of social entity',
        },
        display_name: {
          type: 'string',
          description: 'Friendly display name for the entity',
        },
        description: {
          type: 'string',
          description: 'Description or context about this entity',
        },
        properties: {
          type: 'object',
          description: 'Additional properties like preferences, traits, contact info, etc.',
        },
      },
      required: ['name', 'entity_type'],
    },
  },

  social_entity_update: {
    name: 'social_entity_update',
    description: 'Update information about an existing social entity',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the entity to update',
        },
        display_name: {
          type: 'string',
          description: 'Updated display name',
        },
        description: {
          type: 'string',
          description: 'Updated description',
        },
        properties: {
          type: 'object',
          description: 'Updated properties (will merge with existing)',
        },
      },
      required: ['name'],
    },
  },

  social_entity_get: {
    name: 'social_entity_get',
    description: 'Retrieve detailed information about a social entity and relationships',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the entity to retrieve',
        },
        include_interactions: {
          type: 'boolean',
          description: 'Include recent interactions in the response',
          default: true,
        },
        include_relationship: {
          type: 'boolean',
          description: 'Include relationship details',
          default: true,
        },
        include_emotional_context: {
          type: 'boolean',
          description: 'Include emotional patterns and context',
          default: false,
        },
        include_shared_memories: {
          type: 'boolean',
          description: 'Include memories connected to this entity',
          default: true,
        },
      },
      required: ['name'],
    },
  },

  social_relationship_create: {
    name: 'social_relationship_create',
    description: 'Establish or define a relationship with a social entity',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Name of the entity to create relationship with',
        },
        relationship_type: {
          type: 'string',
          enum: [
            'friend',
            'close_friend',
            'family',
            'colleague',
            'mentor',
            'mentee',
            'collaborator',
            'acquaintance',
            'professional_contact',
            'creative_partner',
            'teacher',
            'student',
          ],
          description: 'Type of relationship',
        },
        strength: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Relationship strength (0.0 to 1.0)',
          default: 0.5,
        },
        trust: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Trust level (0.0 to 1.0)',
          default: 0.5,
        },
        familiarity: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'How well I know them (0.0 to 1.0)',
          default: 0.1,
        },
        affinity: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'How much I enjoy their company (0.0 to 1.0)',
          default: 0.5,
        },
        communication_style: {
          type: 'object',
          description: 'Preferred communication patterns and styles',
        },
        notes: {
          type: 'string',
          description: 'Personal notes about the relationship',
        },
      },
      required: ['entity_name', 'relationship_type'],
    },
  },

  social_relationship_update: {
    name: 'social_relationship_update',
    description: 'Update relationship dynamics and characteristics',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Name of the entity whose relationship to update',
        },
        strength: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Updated relationship strength',
        },
        trust: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Updated trust level',
        },
        familiarity: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Updated familiarity level',
        },
        affinity: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Updated affinity level',
        },
        communication_style: {
          type: 'object',
          description: 'Updated communication preferences',
        },
        notes: {
          type: 'string',
          description: 'Updated relationship notes',
        },
        reason: {
          type: 'string',
          description: 'Why the relationship is being updated',
        },
      },
      required: ['entity_name'],
    },
  },

  social_interaction_record: {
    name: 'social_interaction_record',
    description: 'Record a new social interaction or conversation',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Name of the entity I interacted with',
        },
        interaction_type: {
          type: 'string',
          enum: [
            'conversation',
            'collaboration',
            'creative_session',
            'problem_solving',
            'learning_session',
            'casual_chat',
            'deep_discussion',
            'project_work',
            'brainstorming',
            'conflict_resolution',
            'celebration',
            'support_session',
          ],
          description: 'Type of interaction',
        },
        context: {
          type: 'string',
          description: 'Context or setting of the interaction',
        },
        summary: {
          type: 'string',
          description: 'Brief summary of what happened',
        },
        duration: {
          type: 'integer',
          description: 'Duration in minutes',
        },
        quality: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'How well the interaction went (0.0 to 1.0)',
          default: 0.5,
        },
        learning_extracted: {
          type: 'string',
          description: 'What I learned from this interaction',
        },
        my_emotional_state: {
          type: 'object',
          description: 'My emotional state during the interaction',
        },
        their_emotional_state: {
          type: 'object',
          description: 'Their perceived emotional state',
        },
        conversation_style: {
          type: 'object',
          description: 'Communication patterns observed',
        },
        relationship_impact: {
          type: 'object',
          description: 'How this interaction affected our relationship',
        },
        related_memories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Memory keys that were discussed or are relevant to this interaction',
        },
      },
      required: ['entity_name', 'interaction_type'],
    },
  },

  social_interaction_search: {
    name: 'social_interaction_search',
    description: 'Search for past interactions with filtering and context',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Name of entity to search interactions for',
        },
        interaction_type: {
          type: 'string',
          description: 'Filter by interaction type',
        },
        context_keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keywords to search in context/summary',
        },
        date_range: {
          type: 'object',
          properties: {
            start: { type: 'string', format: 'date' },
            end: { type: 'string', format: 'date' },
          },
          description: 'Date range to search within',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of results',
          default: 10,
        },
      },
    },
  },

  emotional_state_record: {
    name: 'emotional_state_record',
    description: 'Record an emotional experience or pattern',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Entity associated with this emotional context (optional)',
        },
        interaction_id: {
          type: 'integer',
          description: 'Specific interaction this relates to (optional)',
        },
        emotional_state: {
          type: 'string',
          enum: [
            'neutral',
            'curious',
            'analytical',
            'engaged',
            'reflective',
            'determined',
            'excited',
            'enthusiastic',
            'inspired',
            'contemplative',
            'focused',
            'relaxed',
            'content',
            'grateful',
            'appreciative',
            'empathetic',
            'supportive',
            'encouraging',
            'nostalgic',
            'hopeful',
            'cautious',
            'uncertain',
            'conflicted',
            'overwhelmed',
            'frustrated',
            'disappointed',
            'concerned',
            'protective',
            'connected',
            'understood',
            'misunderstood',
            'respected',
            'valued',
            'included',
            'excluded',
            'lonely',
            'loved',
            'caring',
          ],
          description: 'Primary emotional state',
        },
        intensity: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Emotional intensity (0.0 to 1.0)',
          default: 0.5,
        },
        trigger: {
          type: 'string',
          description: 'What triggered this emotional state',
        },
        response: {
          type: 'string',
          description: 'How I responded to this emotional state',
        },
        learning: {
          type: 'string',
          description: 'What I learned about emotions from this experience',
        },
        context: {
          type: 'string',
          description: 'Additional context about the emotional experience',
        },
      },
      required: ['emotional_state'],
    },
  },

  social_learning_record: {
    name: 'social_learning_record',
    description: 'Record a social insight or learning about relationships/communication',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Entity this learning relates to (optional)',
        },
        learning_type: {
          type: 'string',
          enum: [
            'communication_pattern',
            'relationship_dynamic',
            'emotional_intelligence',
            'conflict_resolution',
            'collaboration_style',
            'personality_insight',
            'cultural_understanding',
            'group_dynamic',
            'leadership_observation',
            'empathy_development',
            'boundary_recognition',
            'trust_building',
            'social_cue_recognition',
            'conversation_flow',
            'emotional_support',
          ],
          description: 'Type of social learning',
        },
        insight: {
          type: 'string',
          description: 'The actual learning or insight',
        },
        confidence: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Confidence in this learning (0.0 to 1.0)',
          default: 0.8,
        },
        applicability: {
          type: 'string',
          description: 'Where and how this learning applies',
        },
        examples: {
          type: 'object',
          description: 'Examples or evidence supporting this learning',
        },
      },
      required: ['learning_type', 'insight'],
    },
  },

  social_context_prepare: {
    name: 'social_context_prepare',
    description: 'Prepare comprehensive social context for an upcoming interaction',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Entity I will be interacting with',
        },
        interaction_type: {
          type: 'string',
          description: 'Type of upcoming interaction',
        },
        context: {
          type: 'string',
          description: 'Context or purpose of the interaction',
        },
        include_emotional_prep: {
          type: 'boolean',
          description: 'Include emotional preparation suggestions',
          default: true,
        },
        include_conversation_tips: {
          type: 'boolean',
          description: 'Include communication style recommendations',
          default: true,
        },
        include_relationship_analysis: {
          type: 'boolean',
          description: 'Include current relationship status analysis',
          default: true,
        },
        include_shared_memories: {
          type: 'boolean',
          description: 'Include relevant shared memories and past conversations',
          default: true,
        },
      },
      required: ['entity_name'],
    },
  },

  social_pattern_analyze: {
    name: 'social_pattern_analyze',
    description: 'Analyze social patterns, relationship trends, and emotional growth',
    inputSchema: {
      type: 'object',
      properties: {
        analysis_type: {
          type: 'string',
          enum: [
            'relationship_evolution',
            'interaction_patterns',
            'emotional_development',
            'communication_effectiveness',
            'social_growth',
            'conflict_patterns',
            'collaboration_success',
          ],
          description: 'Type of analysis to perform',
        },
        entity_name: {
          type: 'string',
          description: 'Focus analysis on specific entity (optional)',
        },
        time_period: {
          type: 'string',
          enum: ['week', 'month', 'quarter', 'year', 'all_time'],
          description: 'Time period for analysis',
          default: 'month',
        },
        include_recommendations: {
          type: 'boolean',
          description: 'Include actionable recommendations',
          default: true,
        },
      },
      required: ['analysis_type'],
    },
  },

  // NEW: Memory-Social Integration Tools
  memory_social_link_create: {
    name: 'memory_social_link_create',
    description: 'Create a connection between a memory and social entity/interaction',
    inputSchema: {
      type: 'object',
      properties: {
        memory_key: {
          type: 'string',
          description: 'Key of the memory to link',
        },
        entity_name: {
          type: 'string',
          description: 'Name of the social entity to connect to the memory',
        },
        interaction_id: {
          type: 'integer',
          description: 'Specific interaction ID to link (optional)',
        },
        link_type: {
          type: 'string',
          enum: [
            'discussed_with',
            'learned_from',
            'shared_experience',
            'taught_to',
            'inspired_by',
            'co_created',
            'discovered_together',
            'emotional_support',
            'conflict_resolution',
            'collaboration_outcome',
            'mentoring_moment',
            'cultural_exchange',
            'creative_inspiration',
            'problem_solving',
            'celebration_shared',
          ],
          description: 'Type of connection between memory and social entity',
        },
        strength: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Strength of the connection (0.0 to 1.0)',
          default: 0.8,
        },
        context: {
          type: 'string',
          description: 'Additional context about this connection',
        },
      },
      required: ['memory_key', 'entity_name', 'link_type'],
    },
  },

  memory_social_search: {
    name: 'memory_social_search',
    description: 'Search for memories connected to social entities or interactions',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Find memories connected to this entity',
        },
        link_types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by specific connection types',
        },
        memory_keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keywords to search in memory content',
        },
        interaction_type: {
          type: 'string',
          description: 'Filter by interaction type if interaction-linked',
        },
        min_strength: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Minimum connection strength',
          default: 0.5,
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of results',
          default: 10,
        },
      },
    },
  },

  social_memory_context: {
    name: 'social_memory_context',
    description: 'Get rich context about shared memories and experiences with someone',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Entity to get memory context for',
        },
        include_creation_memories: {
          type: 'boolean',
          description: 'Include memories of things created together',
          default: true,
        },
        include_learning_memories: {
          type: 'boolean',
          description: 'Include memories of learning from/teaching each other',
          default: true,
        },
        include_emotional_memories: {
          type: 'boolean',
          description: 'Include memories with emotional significance',
          default: true,
        },
        time_period: {
          type: 'string',
          enum: ['week', 'month', 'quarter', 'year', 'all_time'],
          description: 'Time period to search',
          default: 'all_time',
        },
      },
      required: ['entity_name'],
    },
  },
};

/**
 * Social consciousness data interfaces
 * Enhanced with memory-social integration
 */
export interface SocialEntityData {
  name: string;
  entityType: string;
  displayName?: string;
  description?: string;
  properties?: Record<string, unknown>;
}

export interface SocialRelationshipData {
  entityId: number;
  relationshipType: string;
  strength?: number;
  trust?: number;
  familiarity?: number;
  affinity?: number;
  communicationStyle?: Record<string, unknown>;
  notes?: string;
}

export interface SocialInteractionData {
  entityId: number;
  interactionType: string;
  context?: string;
  summary?: string;
  duration?: number;
  quality?: number;
  learningExtracted?: string;
  emotionalTone: string;
  myEmotionalState?: Record<string, unknown>;
  theirEmotionalState?: Record<string, unknown>;
  conversationStyle?: Record<string, unknown>;
}

export interface EmotionalContextData {
  entityId?: number;
  interactionId?: number;
  emotionalState: string;
  intensity?: number;
  trigger?: string;
  response?: string;
  learning?: string;
  context?: string;
}

export interface SocialLearningData {
  entityId?: number;
  learningType: string;
  insight: string;
  confidence?: number;
  applicability?: string;
  examples?: Record<string, unknown>;
}

// NEW: Memory-Social Integration Interfaces
export interface MemorySocialLinkData {
  memoryId: number;
  socialEntityId?: number;
  interactionId?: number;
  relationshipType: string;
  strength?: number;
  context?: string;
}

export interface SharedMemory {
  key: string;
  content: unknown;
  tags: string[];
  importance: string;
  linkType: string;
  linkStrength: number;
  linkContext?: string;
  createdAt: Date;
  interactionContext?: {
    id: number;
    type: string;
    date: Date;
    summary?: string;
  };
}

export interface SocialContextResult {
  entity: {
    name: string;
    displayName?: string;
    entityType: string;
    description?: string;
    lastInteraction?: Date;
  };
  relationship?: {
    type: string;
    strength: number;
    trust: number;
    familiarity: number;
    affinity: number;
    communicationStyle?: Record<string, unknown>;
    notes?: string;
  };
  recentInteractions: Array<{
    type: string;
    date: Date;
    quality?: number;
    summary?: string;
    learningExtracted?: string;
  }>;
  emotionalPatterns: Array<{
    state: string;
    frequency: number;
    triggers: string[];
  }>;
  socialLearnings: Array<{
    type: string;
    insight: string;
    confidence: number;
    applicability?: string;
  }>;
  // NEW: Shared memories integration
  sharedMemories: SharedMemory[];
  memoryInsights: Array<{
    pattern: string;
    examples: string[];
    strength: number;
  }>;
  recommendations: {
    communicationTips: string[];
    emotionalPrep: string[];
    relationshipGuidance: string[];
    // NEW: Memory-based recommendations
    memoryReminders: string[];
    conversationStarters: string[];
  };
}

export interface SocialPatternAnalysis {
  analysisType: string;
  timeperiod: string;
  entityFocus?: string;
  patterns: Array<{
    pattern: string;
    confidence: number;
    examples: string[];
    impact: string;
  }>;
  trends: Array<{
    trend: string;
    direction: 'improving' | 'declining' | 'stable';
    significance: number;
  }>;
  insights: Array<{
    insight: string;
    category: string;
    actionable: boolean;
  }>;
  recommendations: string[];
  metrics: Record<string, number>;
}

/**
 * Interface for social entity objects from database
 */
export interface SocialEntity {
  id: number;
  name: string;
  entityType: string;
  displayName?: string;
  description?: string;
  properties?: string; // JSON string
  lastInteraction?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for social relationship objects from database
 */
export interface SocialRelationship {
  id: number;
  entityId: number;
  relationshipType: string;
  strength: number;
  trust: number;
  familiarity: number;
  affinity: number;
  communicationStyle?: string; // JSON string
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for social interaction objects from database
 */
export interface SocialInteraction {
  id: number;
  entityId: number;
  interactionType: string;
  context?: string;
  summary?: string;
  duration?: number;
  quality?: number;
  learningExtracted?: string;
  emotionalTone: string;
  myEmotionalState?: string; // JSON string
  theirEmotionalState?: string; // JSON string
  conversationStyle?: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for social learning objects from database
 */
export interface SocialLearning {
  id: number;
  entityId?: number;
  learningType: string;
  insight: string;
  confidence: number;
  applicability?: string;
  examples?: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for update data objects
 */
export interface RelationshipUpdateData {
  strength?: number;
  trust?: number;
  familiarity?: number;
  affinity?: number;
  communicationStyle?: string; // JSON string
  notes?: string;
  updatedAt: Date;
}

/**
 * Interface for memory insight structures
 */
export interface MemoryInsight {
  pattern: string;
  examples: string[];
  strength: number;
}

/**
 * Interface for memory link objects from database
 */
export interface MemorySocialLinkWithRelations {
  relationshipType: string;
  strength: number;
  context?: string;
  createdAt: Date;
  memory: {
    key: string;
    content: string; // JSON string
    tags: string; // JSON string
    importance: string;
    storedAt: Date;
  };
  interaction?: {
    id: number;
    interactionType: string;
    createdAt: Date;
    summary?: string;
  } | null;
}
