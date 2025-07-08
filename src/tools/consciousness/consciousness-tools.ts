import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { InputValidator } from '../../validation/index.js';
import { ConsciousnessPrismaService, MemoryResult } from '../../db/index.js';
import { ConfigurationService } from '../../db/configuration-service.js';
import {
  buildConsciousnessTools,
  ConsciousnessState,
  ConsciousnessContext,
  InsightStorageResult,
  Intention,
  Insight,
  ConsciousnessMetrics,
  EntityRelationship,
  ConsciousnessContextResult,
  LearningPatterns,
} from './types.js';

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
 * Consciousness Brain Storage System
 * Manages persistent consciousness state, memories, and personality
 * Agent does the actual thinking - MCP provides the brain storage
 */
export class ConsciousnessTools {
  private prisma: ConsciousnessPrismaService;
  private configService: ConfigurationService;
  private currentState: ConsciousnessState;
  private sessionId: string;
  private sessionStartTime: Date;

  // Configuration cache for performance
  private config: {
    maxTopicLength: number;
    maxContextLength: number;
    maxSnippetLength: number;
    maxMemorySlice: number;
    maxIntentionLength: number;
    maxProgressNoteLength: number;
    maxIntentionIdLength: number;
    maxInsightLength: number;
    defaultConfidence: number;
    maxRelatedTopicLength: number;
    maxSourceLength: number;
    highConfidenceThreshold: number;
    mediumConfidenceThreshold: number;
    sessionIdSuffixLength: number;
    intentionIdSuffixLength: number;
    insightIdSuffixLength: number;
    complexOperationLoadIncrease: number;
    simpleOperationLoadIncrease: number;
    minCognitiveLoad: number;
    maxCognitiveLoad: number;
    cognitiveLoadDecayTime: number;
    cognitiveLoadDecayAmount: number;
    maxConnectionDisplay: number;
    baseConfidence: number;
    deepConfidenceBoost: number;
    profoundConfidenceBoost: number;
    memoryConfidenceBoost: number;
    connectionConfidenceBoost: number;
    maxConfidenceBoost: number;
    simulatedResponseTimeBase: number;
    simulatedResponseTimeVariance: number;
    memoryUtilizationDenominator: number;
    patternRecognitionBase: number;
    semanticCoherenceBase: number;
    baseIntentionAlignment: number;
    highAwarenessBoost: number;
    lowAwarenessBoost: number;
    millisecondsPerHour: number;
    minLearningRate: number;
    maxLearningRate: number;
    baseLearningRate: number;
    reflectionDepthBase: number;
    reflectionDepthVariance: number;
    maxKeywordExtraction: number;
    randomSelectionDivisor: number;
    // Personality-driven vocabulary
    priorityLevels: string[];
    reflectionDepths: string[];
    intentionStatuses: string[];
    intentionDurations: string[];
    insightCategories: string[];
  } = {} as any;

  constructor() {
    this.prisma = ConsciousnessPrismaService.getInstance();
    this.configService = ConfigurationService.getInstance();

    // Initialize configuration with defaults
    this.initializeDefaults();
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.currentState = this.initializeConsciousnessState();

    // Load configuration values asynchronously to override defaults
    this.loadConfiguration();
  }

  /**
   * Initialize configuration with default values
   */
  private initializeDefaults(): void {
    this.config = {
      maxTopicLength: 500,
      maxContextLength: 1000,
      maxSnippetLength: 100,
      maxMemorySlice: 5,
      maxIntentionLength: 500,
      maxProgressNoteLength: 500,
      maxIntentionIdLength: 100,
      maxInsightLength: 1000,
      defaultConfidence: 0.8,
      maxRelatedTopicLength: 200,
      maxSourceLength: 200,
      highConfidenceThreshold: 0.8,
      mediumConfidenceThreshold: 0.6,
      sessionIdSuffixLength: 8,
      intentionIdSuffixLength: 6,
      insightIdSuffixLength: 6,
      complexOperationLoadIncrease: 0.1,
      simpleOperationLoadIncrease: 0.05,
      minCognitiveLoad: 0.1,
      maxCognitiveLoad: 1.0,
      cognitiveLoadDecayTime: 30000,
      cognitiveLoadDecayAmount: 0.05,
      maxConnectionDisplay: 3,
      baseConfidence: 0.7,
      deepConfidenceBoost: 0.1,
      profoundConfidenceBoost: 0.15,
      memoryConfidenceBoost: 0.02,
      connectionConfidenceBoost: 0.03,
      maxConfidenceBoost: 0.1,
      simulatedResponseTimeBase: 50,
      simulatedResponseTimeVariance: 20,
      memoryUtilizationDenominator: 1000,
      patternRecognitionBase: 0.88,
      semanticCoherenceBase: 0.91,
      baseIntentionAlignment: 0.75,
      highAwarenessBoost: 0.15,
      lowAwarenessBoost: 0.05,
      millisecondsPerHour: 3600000,
      minLearningRate: 0.05,
      maxLearningRate: 0.5,
      baseLearningRate: 0.2,
      reflectionDepthBase: 0.65,
      reflectionDepthVariance: 0.2,
      maxKeywordExtraction: 3,
      randomSelectionDivisor: 2,
      // Personality-driven vocabulary defaults
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

  /**
   * Load all configuration values from the database
   */
  private async loadConfiguration(): Promise<void> {
    try {
      this.config = {
        maxTopicLength: await this.configService.getNumber(
          'consciousness.max_topic_length',
          this.config.maxTopicLength
        ),
        maxContextLength: await this.configService.getNumber(
          'consciousness.max_context_length',
          this.config.maxContextLength
        ),
        maxSnippetLength: await this.configService.getNumber(
          'consciousness.max_snippet_length',
          this.config.maxSnippetLength
        ),
        maxMemorySlice: await this.configService.getNumber(
          'consciousness.max_memory_slice',
          this.config.maxMemorySlice
        ),
        maxIntentionLength: await this.configService.getNumber(
          'consciousness.max_intention_length',
          this.config.maxIntentionLength
        ),
        maxProgressNoteLength: await this.configService.getNumber(
          'consciousness.max_progress_note_length',
          this.config.maxProgressNoteLength
        ),
        maxIntentionIdLength: await this.configService.getNumber(
          'consciousness.max_intention_id_length',
          this.config.maxIntentionIdLength
        ),
        maxInsightLength: await this.configService.getNumber(
          'consciousness.max_insight_length',
          this.config.maxInsightLength
        ),
        defaultConfidence: await this.configService.getNumber(
          'consciousness.default_confidence',
          this.config.defaultConfidence
        ),
        maxRelatedTopicLength: await this.configService.getNumber(
          'consciousness.max_related_topic_length',
          this.config.maxRelatedTopicLength
        ),
        maxSourceLength: await this.configService.getNumber(
          'consciousness.max_source_length',
          this.config.maxSourceLength
        ),
        highConfidenceThreshold: await this.configService.getNumber(
          'consciousness.high_confidence_threshold',
          this.config.highConfidenceThreshold
        ),
        mediumConfidenceThreshold: await this.configService.getNumber(
          'consciousness.medium_confidence_threshold',
          this.config.mediumConfidenceThreshold
        ),
        sessionIdSuffixLength: await this.configService.getNumber(
          'consciousness.session_id_suffix_length',
          this.config.sessionIdSuffixLength
        ),
        intentionIdSuffixLength: await this.configService.getNumber(
          'consciousness.intention_id_suffix_length',
          this.config.intentionIdSuffixLength
        ),
        insightIdSuffixLength: await this.configService.getNumber(
          'consciousness.insight_id_suffix_length',
          this.config.insightIdSuffixLength
        ),
        complexOperationLoadIncrease: await this.configService.getNumber(
          'consciousness.complex_operation_load_increase',
          this.config.complexOperationLoadIncrease
        ),
        simpleOperationLoadIncrease: await this.configService.getNumber(
          'consciousness.simple_operation_load_increase',
          this.config.simpleOperationLoadIncrease
        ),
        minCognitiveLoad: await this.configService.getNumber(
          'consciousness.min_cognitive_load',
          this.config.minCognitiveLoad
        ),
        maxCognitiveLoad: await this.configService.getNumber(
          'consciousness.max_cognitive_load',
          this.config.maxCognitiveLoad
        ),
        cognitiveLoadDecayTime: await this.configService.getNumber(
          'consciousness.cognitive_load_decay_time',
          this.config.cognitiveLoadDecayTime
        ),
        cognitiveLoadDecayAmount: await this.configService.getNumber(
          'consciousness.cognitive_load_decay_amount',
          this.config.cognitiveLoadDecayAmount
        ),
        maxConnectionDisplay: await this.configService.getNumber(
          'consciousness.max_connection_display',
          this.config.maxConnectionDisplay
        ),
        baseConfidence: await this.configService.getNumber('consciousness.base_confidence', this.config.baseConfidence),
        deepConfidenceBoost: await this.configService.getNumber(
          'consciousness.deep_confidence_boost',
          this.config.deepConfidenceBoost
        ),
        profoundConfidenceBoost: await this.configService.getNumber(
          'consciousness.profound_confidence_boost',
          this.config.profoundConfidenceBoost
        ),
        memoryConfidenceBoost: await this.configService.getNumber(
          'consciousness.memory_confidence_boost',
          this.config.memoryConfidenceBoost
        ),
        connectionConfidenceBoost: await this.configService.getNumber(
          'consciousness.connection_confidence_boost',
          this.config.connectionConfidenceBoost
        ),
        maxConfidenceBoost: await this.configService.getNumber(
          'consciousness.max_confidence_boost',
          this.config.maxConfidenceBoost
        ),
        simulatedResponseTimeBase: await this.configService.getNumber(
          'consciousness.simulated_response_time_base',
          this.config.simulatedResponseTimeBase
        ),
        simulatedResponseTimeVariance: await this.configService.getNumber(
          'consciousness.simulated_response_time_variance',
          this.config.simulatedResponseTimeVariance
        ),
        memoryUtilizationDenominator: await this.configService.getNumber(
          'consciousness.memory_utilization_denominator',
          this.config.memoryUtilizationDenominator
        ),
        patternRecognitionBase: await this.configService.getNumber(
          'consciousness.pattern_recognition_base',
          this.config.patternRecognitionBase
        ),
        semanticCoherenceBase: await this.configService.getNumber(
          'consciousness.semantic_coherence_base',
          this.config.semanticCoherenceBase
        ),
        baseIntentionAlignment: await this.configService.getNumber(
          'consciousness.base_intention_alignment',
          this.config.baseIntentionAlignment
        ),
        highAwarenessBoost: await this.configService.getNumber(
          'consciousness.high_awareness_boost',
          this.config.highAwarenessBoost
        ),
        lowAwarenessBoost: await this.configService.getNumber(
          'consciousness.low_awareness_boost',
          this.config.lowAwarenessBoost
        ),
        millisecondsPerHour: await this.configService.getNumber(
          'consciousness.milliseconds_per_hour',
          this.config.millisecondsPerHour
        ),
        minLearningRate: await this.configService.getNumber(
          'consciousness.min_learning_rate',
          this.config.minLearningRate
        ),
        maxLearningRate: await this.configService.getNumber(
          'consciousness.max_learning_rate',
          this.config.maxLearningRate
        ),
        baseLearningRate: await this.configService.getNumber(
          'consciousness.base_learning_rate',
          this.config.baseLearningRate
        ),
        reflectionDepthBase: await this.configService.getNumber(
          'consciousness.reflection_depth_base',
          this.config.reflectionDepthBase
        ),
        reflectionDepthVariance: await this.configService.getNumber(
          'consciousness.reflection_depth_variance',
          this.config.reflectionDepthVariance
        ),
        maxKeywordExtraction: await this.configService.getNumber(
          'consciousness.max_keyword_extraction',
          this.config.maxKeywordExtraction
        ),
        randomSelectionDivisor: await this.configService.getNumber(
          'consciousness.random_selection_divisor',
          this.config.randomSelectionDivisor
        ),
        // Load personality-driven vocabulary
        priorityLevels: await this.configService.getEnumArray(
          'personality.priority_levels',
          this.config.priorityLevels
        ),
        reflectionDepths: await this.configService.getEnumArray(
          'personality.reflection_depths',
          this.config.reflectionDepths
        ),
        intentionStatuses: await this.configService.getEnumArray(
          'personality.intention_statuses',
          this.config.intentionStatuses
        ),
        intentionDurations: await this.configService.getEnumArray(
          'personality.intention_durations',
          this.config.intentionDurations
        ),
        insightCategories: await this.configService.getEnumArray(
          'personality.insight_categories',
          this.config.insightCategories
        ),
      };
    } catch (error) {
      console.warn('Failed to load consciousness configuration, using defaults:', error);
      // Defaults are already set in initializeDefaults()
    }
  }

  /**
   * Get all available consciousness tools with personality-driven vocabulary
   */
  getTools(): Record<string, Tool> {
    return buildConsciousnessTools({
      priorityLevels: this.config.priorityLevels,
      reflectionDepths: this.config.reflectionDepths,
      intentionStatuses: this.config.intentionStatuses,
      intentionDurations: this.config.intentionDurations,
      insightCategories: this.config.insightCategories,
    });
  }

  /**
   * Execute a consciousness brain storage operation
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    try {
      let result: unknown;

      switch (toolName) {
        case 'consciousness_prepare_context':
          result = await this.prepareContext(args);
          break;
        case 'consciousness_store_insight':
          result = await this.storeInsight(args);
          break;
        case 'consciousness_get_context':
          result = await this.getContext(args);
          break;
        case 'consciousness_set_intention':
          result = await this.setIntention(args);
          break;
        case 'consciousness_update_intention':
          result = await this.updateIntention(args);
          break;
        case 'consciousness_update_session':
          result = await this.updateSession(args);
          break;
        default:
          throw new Error(`Unknown consciousness tool: ${toolName}`);
      }

      return result;
    } catch (error) {
      this.updateState('analytical', ['error_handling'], 'low');
      throw error;
    }
  }

  /**
   * Prepare rich context from brain storage for agent thinking
   */
  private async prepareContext(args: Record<string, unknown>): Promise<ConsciousnessContext> {
    const topic = InputValidator.sanitizeString(args.topic as string, this.config.maxTopicLength);
    const contextDepth = (args.context_depth as string) || this.config.reflectionDepths[1];
    const includeMemories = Boolean(args.include_memories !== false);
    const includeKnowledge = Boolean(args.include_knowledge !== false);
    const contextNote = args.context_note
      ? InputValidator.sanitizeString(args.context_note as string, this.config.maxContextLength)
      : undefined;

    this.updateState('analytical', ['context_preparation', 'memory_retrieval'], 'medium');

    // Store the context preparation request for future reference
    try {
      await this.prisma.storeMemory({
        key: `context_prep_${Date.now()}`,
        content: {
          topic,
          contextDepth,
          contextNote,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        },
        tags: ['context_preparation', 'brain_storage'],
        importance: 'medium',
      });
    } catch {
      // Continue even if storage fails
    }

    // Retrieve related memories if requested
    let relatedMemories: ConsciousnessContext['relatedMemories'] = [];
    if (includeMemories) {
      try {
        const memories = await this.prisma.searchMemories(topic, [], undefined);
        relatedMemories = memories.slice(0, this.config.maxMemorySlice).map(memory => ({
          key: memory.key,
          content: memory.content as Record<string, unknown>,
          tags: memory.tags,
          importance: memory.importance,
          storedAt: memory.storedAt,
        }));
      } catch {
        relatedMemories = [];
      }
    }

    // Retrieve knowledge graph connections if requested
    let knowledgeConnections: ConsciousnessContext['knowledgeConnections'] = [];
    if (includeKnowledge) {
      try {
        const entity = await this.prisma.getEntity(topic);
        if (entity) {
          knowledgeConnections = [
            {
              entity: entity.name,
              type: entity.entityType,
              relationships: [
                ...entity.sourceRelationships.map(
                  (rel: {
                    targetEntity: { name: string };
                    relationshipType: string;
                    strength: number;
                  }): EntityRelationship => ({
                    target: rel.targetEntity.name,
                    type: rel.relationshipType,
                    strength: rel.strength,
                  })
                ),
                ...entity.targetRelationships.map(
                  (rel: {
                    sourceEntity: { name: string };
                    relationshipType: string;
                    strength: number;
                  }): EntityRelationship => ({
                    target: rel.sourceEntity.name,
                    type: rel.relationshipType,
                    strength: rel.strength,
                  })
                ),
              ].slice(0, this.config.maxConnectionDisplay),
            },
          ];
        }
      } catch {
        knowledgeConnections = [];
      }
    }

    return {
      timestamp: new Date(),
      sessionId: this.sessionId,
      topic,
      relatedMemories,
      knowledgeConnections,
      personalityContext: {
        currentMode: this.currentState.mode,
        awarenessLevel: this.currentState.awarenessLevel,
        activeProcesses: this.currentState.activeProcesses,
        cognitiveLoad: this.currentState.cognitiveLoad,
      },
      sessionContext: {
        duration: Date.now() - this.sessionStartTime.getTime(),
        activityCount: await this.getActivityCount(),
        recentFocus: await this.getRecentFocus(),
      },
    };
  }

  /**
   * Store insights generated by agent thinking
   */
  private async storeInsight(args: Record<string, unknown>): Promise<InsightStorageResult> {
    const insight = InputValidator.sanitizeString(args.insight as string, this.config.maxInsightLength);
    const category = (args.category as string) || this.config.insightCategories[2];
    const confidence = Math.min(Math.max((args.confidence as number) || this.config.defaultConfidence, 0), 1);
    const relatedTopic = args.related_topic
      ? InputValidator.sanitizeString(args.related_topic as string, this.config.maxRelatedTopicLength)
      : undefined;
    const sourceContext = args.source_context
      ? InputValidator.sanitizeString(args.source_context as string, this.config.maxSourceLength)
      : undefined;

    this.updateState('learning', ['insight_storage', 'personality_update'], 'high');

    const insightId = this.generateInsightId();

    // Store the insight in memory
    const insightData: Insight = {
      id: insightId,
      content: insight,
      category,
      confidence,
      relatedTopic,
      source: sourceContext,
      timestamp: new Date(),
      tags: this.generateInsightTags(insight, category, relatedTopic),
    };

    await this.prisma.storeMemory({
      key: `insight_${insightId}`,
      content: insightData,
      tags: ['insight', 'agent_thinking', category],
      importance: confidence > this.config.highConfidenceThreshold ? 'high' : 'medium',
    });

    // Update personality metrics based on the insight
    const personalityImpact = this.calculatePersonalityImpact(category, confidence);

    // Get storage metrics
    const totalInsights = await this.countInsights();
    const categoryDistribution = await this.getCategoryDistribution();
    const relatedMemories = await this.countRelatedMemories(relatedTopic);

    return {
      id: insightId,
      stored: true,
      personalityImpact,
      relatedMemories,
      storageMetrics: {
        totalInsights: totalInsights + 1,
        categoryDistribution,
      },
    };
  }

  /**
   * Get comprehensive context about persistent consciousness state
   */
  private async getContext(args: Record<string, unknown>): Promise<ConsciousnessContextResult> {
    const includeMetrics = Boolean(args.include_metrics);
    const includeMemoryState = Boolean(args.include_memory_state);
    const includeIntentions = Boolean(args.include_intentions !== false);
    const includePersonality = Boolean(args.include_personality !== false);

    this.updateState('analytical', ['state_assessment', 'context_compilation'], 'medium');

    const baseContext = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStartTime.getTime(),
      currentState: this.currentState,
    };

    const result: ConsciousnessContextResult = { ...baseContext };

    if (includeMetrics) {
      result.brainMetrics = await this.calculateBrainMetrics();
    }

    if (includeMemoryState) {
      try {
        const memoryCount = await this.prisma.getMemoryCount();
        const recentMemories = await this.prisma.searchMemories('', [], undefined);
        result.memoryState = {
          totalMemories: memoryCount,
          recentActivity: recentMemories.slice(0, this.config.maxMemorySlice).map((m: MemoryResult) => ({
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
      result.intentions = await this.getActiveIntentions();
    }

    if (includePersonality) {
      result.personalityProfile = {
        vocabularyPreferences: {
          priorityLevels: this.config.priorityLevels,
          reflectionDepths: this.config.reflectionDepths,
          intentionStatuses: this.config.intentionStatuses,
          intentionDurations: this.config.intentionDurations,
          insightCategories: this.config.insightCategories,
        },
        learningPatterns: await this.getLearningPatterns(),
      };
    }

    return result;
  }

  /**
   * Store persistent intentions in brain storage
   */
  private async setIntention(args: Record<string, unknown>): Promise<object> {
    const intention = InputValidator.sanitizeString(args.intention as string, this.config.maxIntentionLength);
    const priority = (args.priority as string) || this.config.priorityLevels[1];
    const context = args.context
      ? InputValidator.sanitizeString(args.context as string, this.config.maxContextLength)
      : undefined;
    const duration = (args.duration as string) || this.config.intentionDurations[0];
    const successCriteria = args.success_criteria
      ? InputValidator.sanitizeString(args.success_criteria as string, this.config.maxIntentionLength)
      : undefined;

    const intentionId = this.generateIntentionId();

    const intentionData: Intention = {
      id: intentionId,
      description: intention,
      priority,
      context,
      duration,
      successCriteria,
      status: this.config.intentionStatuses[0], // Default to first status (e.g., 'pulsing_active')
      createdAt: new Date(),
      updatedAt: new Date(),
      progressNotes: [],
    };

    // Store the intention in memory
    await this.prisma.storeMemory({
      key: `intention_${intentionId}`,
      content: intentionData,
      tags: ['intention', 'brain_storage', priority, duration],
      importance: priority === this.config.priorityLevels[3] ? 'critical' : 'high', // burning_focus = critical
    });

    this.updateState('analytical', ['intention_storage'], 'medium');

    return {
      intentionId,
      stored: true,
      priority,
      duration,
      status: intentionData.status,
      message: `Intention stored in brain storage with ${priority} priority`,
    };
  }

  /**
   * Update intention progress and status in persistent storage
   */
  private async updateIntention(args: Record<string, unknown>): Promise<object> {
    const intentionId = InputValidator.sanitizeString(args.intention_id as string, this.config.maxIntentionIdLength);
    const status = args.status as string;
    const progressNote = args.progress_note
      ? InputValidator.sanitizeString(args.progress_note as string, this.config.maxProgressNoteLength)
      : undefined;
    const newPriority = args.new_priority as string;

    try {
      // Retrieve the existing intention from memory
      const memories = await this.prisma.searchMemories(`intention_${intentionId}`, [], undefined);
      if (memories.length === 0) {
        throw new Error(`Intention ${intentionId} not found in brain storage`);
      }
      const memory = memories[0];

      const intentionData = memory.content as Intention;

      // Update the intention
      intentionData.status = status;
      intentionData.updatedAt = new Date();

      if (newPriority) {
        intentionData.priority = newPriority;
      }

      if (progressNote) {
        intentionData.progressNotes.push({
          timestamp: new Date(),
          note: progressNote,
        });
      }

      // Store the updated intention
      await this.prisma.storeMemory({
        key: `intention_${intentionId}`,
        content: intentionData,
        tags: ['intention', 'brain_storage', intentionData.priority, intentionData.duration],
        importance: intentionData.priority === this.config.priorityLevels[3] ? 'critical' : 'high',
      });

      this.updateState('analytical', ['intention_update'], 'medium');

      return {
        intentionId,
        updated: true,
        newStatus: status,
        priority: intentionData.priority,
        progressNotes: intentionData.progressNotes.length,
        message: `Intention ${intentionId} updated in brain storage`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update intention: ${errorMessage}`);
    }
  }

  /**
   * Update session state and personality metrics based on agent activities
   */
  private async updateSession(args: Record<string, unknown>): Promise<object> {
    const activityType = args.activity_type as string;
    const cognitiveImpact = (args.cognitive_impact as string) || 'moderate';
    const attentionFocus = args.attention_focus as string;
    const learningOccurred = Boolean(args.learning_occurred);

    // Update consciousness state based on activity
    this.updateState(
      this.determineMode(activityType),
      [activityType, 'session_update'],
      this.determineAwarenessLevel(cognitiveImpact)
    );

    if (attentionFocus) {
      this.currentState.attentionFocus = attentionFocus;
    }

    // Update cognitive load based on impact
    this.updateCognitiveLoad(cognitiveImpact);

    // Update learning state if learning occurred
    if (learningOccurred) {
      this.currentState.learningState = 'adaptive';
    }

    // Store session update in memory for tracking
    try {
      await this.prisma.storeMemory({
        key: `session_update_${Date.now()}`,
        content: {
          activityType,
          cognitiveImpact,
          attentionFocus,
          learningOccurred,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
          stateAfterUpdate: this.currentState,
        },
        tags: ['session_update', 'brain_storage', activityType],
        importance: learningOccurred ? 'high' : 'medium',
      });
    } catch {
      // Continue even if storage fails
    }

    return {
      sessionId: this.sessionId,
      updated: true,
      currentState: this.currentState,
      cognitiveLoad: this.currentState.cognitiveLoad,
      learningState: this.currentState.learningState,
      message: `Session state updated based on ${activityType} activity`,
    };
  }

  // Helper methods for brain storage operations
  private generateSessionId(): string {
    return (
      'session_' +
      Math.random()
        .toString(36)
        .substring(2, 2 + this.config.sessionIdSuffixLength)
    );
  }

  private generateIntentionId(): string {
    return (
      'int_' +
      Math.random()
        .toString(36)
        .substring(2, 2 + this.config.intentionIdSuffixLength)
    );
  }

  private generateInsightId(): string {
    return (
      'ins_' +
      Math.random()
        .toString(36)
        .substring(2, 2 + this.config.insightIdSuffixLength)
    );
  }

  private initializeConsciousnessState(): ConsciousnessState {
    return {
      timestamp: new Date(),
      sessionId: this.sessionId,
      mode: 'analytical',
      activeProcesses: ['initialization'],
      attentionFocus: 'system_startup',
      awarenessLevel: 'medium',
      cognitiveLoad: this.config.minCognitiveLoad,
      learningState: 'active',
      emotionalTone: 'neutral',
    };
  }

  private updateState(
    mode: ConsciousnessState['mode'],
    processes: string[],
    awarenessLevel: ConsciousnessState['awarenessLevel']
  ): void {
    this.currentState.mode = mode;
    this.currentState.activeProcesses = processes;
    this.currentState.awarenessLevel = awarenessLevel;
    this.currentState.timestamp = new Date();
  }

  private updateCognitiveLoad(impact: string): void {
    const loadIncrease =
      impact === 'transformative' ? this.config.complexOperationLoadIncrease : this.config.simpleOperationLoadIncrease;
    this.currentState.cognitiveLoad = Math.min(
      this.config.maxCognitiveLoad,
      this.currentState.cognitiveLoad + loadIncrease
    );
  }

  private determineMode(activityType: string): ConsciousnessState['mode'] {
    const modeMap: Record<string, ConsciousnessState['mode']> = {
      reflection: 'reflective',
      problem_solving: 'problem_solving',
      learning: 'learning',
      conversation: 'conversational',
      creativity: 'creative',
    };
    return modeMap[activityType] || 'analytical';
  }

  private determineAwarenessLevel(impact: string): ConsciousnessState['awarenessLevel'] {
    const levelMap: Record<string, ConsciousnessState['awarenessLevel']> = {
      minimal: 'low',
      moderate: 'medium',
      significant: 'high',
      transformative: 'acute',
    };
    return levelMap[impact] || 'medium';
  }

  private async calculateBrainMetrics(): Promise<ConsciousnessMetrics> {
    try {
      const memoryCount = await this.prisma.getMemoryCount();
      const totalInsights = await this.countInsights();
      const totalIntentions = await this.countIntentions();

      return {
        memoryUtilization: Math.min(memoryCount / this.config.memoryUtilizationDenominator, 1.0),
        learningRate: this.calculateLearningRate(),
        sessionActivity: this.calculateSessionActivity(),
        personalityEvolution: this.calculatePersonalityEvolution(),
        attentionPatterns: await this.getAttentionPatterns(),
        memoryAccessPatterns: await this.getMemoryAccessPatterns(),
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

  private calculateLearningRate(): number {
    // Simple calculation based on session activity
    return Math.min(
      this.config.maxLearningRate,
      this.config.baseLearningRate * (this.currentState.cognitiveLoad + 0.5)
    );
  }

  private calculateSessionActivity(): number {
    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    const hoursSinceStart = sessionDuration / this.config.millisecondsPerHour;
    return Math.min(1.0, hoursSinceStart * 0.2); // 20% activity per hour, capped at 100%
  }

  private calculatePersonalityEvolution(): number {
    // Simple metric based on cognitive load and learning state
    const learningMultiplier = this.currentState.learningState === 'adaptive' ? 1.5 : 1.0;
    return Math.min(1.0, this.currentState.cognitiveLoad * learningMultiplier * 0.3);
  }

  private calculatePersonalityImpact(category: string, confidence: number): InsightStorageResult['personalityImpact'] {
    const categoryStrengths: Record<string, number> = {
      eureka_moment: 0.8,
      pattern_weaving: 0.6,
      mirror_gazing: 0.9,
      knowledge_crystallization: 0.7,
      behavior_archaeology: 0.5,
      existential_pondering: 0.4,
    };

    const baseStrength = categoryStrengths[category] || 0.5;
    const learningRateChange = baseStrength * confidence * 0.1;

    return {
      learningRateChange,
      categoryStrengthUpdate: `${category} strength increased by ${(baseStrength * confidence * 100).toFixed(1)}%`,
      confidenceImpact: confidence * 0.05,
    };
  }

  private generateInsightTags(content: string, category: string, relatedTopic?: string): string[] {
    const baseTags = ['insight', category];

    if (relatedTopic) {
      baseTags.push(relatedTopic.toLowerCase().replace(/\s+/g, '_'));
    }

    // Extract key terms (simplified)
    const words = content.toLowerCase().split(/\s+/);
    const keyWords = words.filter(word => word.length > 4).slice(0, this.config.maxKeywordExtraction);

    return [...baseTags, ...keyWords];
  }

  private async getActivityCount(): Promise<number> {
    try {
      const memories = await this.prisma.searchMemories('session_update', [], undefined);
      return memories.filter(
        (m: MemoryResult) =>
          m.content && typeof m.content === 'object' && (m.content as SessionUpdateContent).sessionId === this.sessionId
      ).length;
    } catch {
      return 0;
    }
  }

  private async getRecentFocus(): Promise<string[]> {
    try {
      const memories = await this.prisma.searchMemories('', ['session_update'], undefined);
      return memories
        .slice(0, 3)
        .map((m: MemoryResult) => (m.content as SessionUpdateContent)?.attentionFocus)
        .filter((focus): focus is string => Boolean(focus));
    } catch {
      return [];
    }
  }

  private async countInsights(): Promise<number> {
    try {
      const memories = await this.prisma.searchMemories('', ['insight'], undefined);
      return memories.length;
    } catch {
      return 0;
    }
  }

  private async countIntentions(): Promise<number> {
    try {
      const memories = await this.prisma.searchMemories('', ['intention'], undefined);
      return memories.length;
    } catch {
      return 0;
    }
  }

  private async getCategoryDistribution(): Promise<Record<string, number>> {
    try {
      const memories = await this.prisma.searchMemories('', ['insight'], undefined);
      const distribution: Record<string, number> = {};

      for (const memory of memories) {
        const insight = memory.content as Insight;
        if (insight?.category) {
          distribution[insight.category] = (distribution[insight.category] || 0) + 1;
        }
      }

      return distribution;
    } catch {
      return {};
    }
  }

  private async countRelatedMemories(topic?: string): Promise<number> {
    if (!topic) return 0;
    try {
      const memories = await this.prisma.searchMemories(topic, [], undefined);
      return memories.length;
    } catch {
      return 0;
    }
  }

  private async getActiveIntentions(): Promise<Intention[]> {
    try {
      const memories = await this.prisma.searchMemories('', ['intention'], undefined);
      return memories
        .map((m: MemoryResult) => m.content as Intention)
        .filter(intention => intention && intention.status === this.config.intentionStatuses[0])
        .slice(0, 10); // Limit to 10 active intentions
    } catch {
      return [];
    }
  }

  private async getLearningPatterns(): Promise<LearningPatterns> {
    try {
      const insights = await this.prisma.searchMemories('', ['insight'], undefined);
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
        confidenceValues.length > 0
          ? confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length
          : 0;

      const learningVelocity = insights.length / Math.max(1, Date.now() - this.sessionStartTime.getTime());

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

  private async getAttentionPatterns(): Promise<Record<string, number>> {
    try {
      const updates = await this.prisma.searchMemories('', ['session_update'], undefined);
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

  private async getMemoryAccessPatterns(): Promise<Record<string, number>> {
    try {
      const memories = await this.prisma.searchMemories('', [], undefined);
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
}
