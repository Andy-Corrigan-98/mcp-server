import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { InputValidator } from '../../validation/index.js';
import { ConsciousnessPrismaService } from '../../db/index.js';
import { ConfigurationService } from '../../db/configuration-service.js';
import { MemoryTools } from '../memory/memory-tools.js';
import { ReasoningTools } from '../reasoning/reasoning-tools.js';
import { ConsciousnessTools } from '../consciousness/consciousness-tools.js';
import {
  DAYDREAMING_TOOLS,
  DaydreamingConfig,
  DEFAULT_DAYDREAMING_CONFIG,
  ConceptPair,
  ConnectionHypothesis,
  ConnectionEvaluation,
  SerendipitousInsight,
  DaydreamingContext,
  DaydreamingCycleResult,
} from './types.js';

/**
 * Day-Dreaming Loop Tools - Implements background concept connection generation
 * Inspired by Gwern's AI Day-Dreaming research paper
 *
 * This system continuously:
 * 1. Samples concept pairs from memory/knowledge graph
 * 2. Generates connection hypotheses using sequential thinking
 * 3. Evaluates insights for novelty, plausibility, and value
 * 4. Stores valuable insights back into memory system
 */
export class DaydreamingTools {
  private db: ConsciousnessPrismaService;
  private configService: ConfigurationService;
  private memoryTools: MemoryTools;
  private reasoningTools: ReasoningTools;
  private consciousnessTools: ConsciousnessTools;

  private config: DaydreamingConfig;
  private recentlyExploredPairs: Map<string, Date> = new Map();
  private backgroundTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.db = ConsciousnessPrismaService.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.memoryTools = new MemoryTools();
    this.reasoningTools = new ReasoningTools();
    this.consciousnessTools = new ConsciousnessTools();

    this.config = { ...DEFAULT_DAYDREAMING_CONFIG };
    this.loadConfiguration();
  }

  /**
   * Load configuration from database
   */
  private async loadConfiguration(): Promise<void> {
    try {
      this.config = {
        enabled: await this.configService.getBoolean('daydreaming.enabled', DEFAULT_DAYDREAMING_CONFIG.enabled),
        samplingIntervalMs: await this.configService.getNumber('daydreaming.sampling_interval_ms', DEFAULT_DAYDREAMING_CONFIG.samplingIntervalMs),
        maxConceptPairsPerCycle: await this.configService.getNumber('daydreaming.max_concept_pairs_per_cycle', DEFAULT_DAYDREAMING_CONFIG.maxConceptPairsPerCycle),
        minIdleTimeMs: await this.configService.getNumber('daydreaming.min_idle_time_ms', DEFAULT_DAYDREAMING_CONFIG.minIdleTimeMs),
        maxCognitiveLoad: await this.configService.getNumber('daydreaming.max_cognitive_load', DEFAULT_DAYDREAMING_CONFIG.maxCognitiveLoad),

        recentMemoryWeight: await this.configService.getNumber('daydreaming.recent_memory_weight', DEFAULT_DAYDREAMING_CONFIG.recentMemoryWeight),
        importanceWeight: await this.configService.getNumber('daydreaming.importance_weight', DEFAULT_DAYDREAMING_CONFIG.importanceWeight),
        noveltyWeight: await this.configService.getNumber('daydreaming.novelty_weight', DEFAULT_DAYDREAMING_CONFIG.noveltyWeight),

        maxThoughtsPerConnection: await this.configService.getNumber('daydreaming.max_thoughts_per_connection', DEFAULT_DAYDREAMING_CONFIG.maxThoughtsPerConnection),
        explorationDepth: await this.configService.getNumber('daydreaming.exploration_depth', DEFAULT_DAYDREAMING_CONFIG.explorationDepth),

        noveltyThreshold: await this.configService.getNumber('daydreaming.novelty_threshold', DEFAULT_DAYDREAMING_CONFIG.noveltyThreshold),
        plausibilityThreshold: await this.configService.getNumber('daydreaming.plausibility_threshold', DEFAULT_DAYDREAMING_CONFIG.plausibilityThreshold),
        valueThreshold: await this.configService.getNumber('daydreaming.value_threshold', DEFAULT_DAYDREAMING_CONFIG.valueThreshold),
      };
    } catch (error) {
      console.warn('Failed to load daydreaming configuration, using defaults:', error);
    }
  }

  /**
   * Get all available tools
   */
  getTools(): Record<string, Tool> {
    return DAYDREAMING_TOOLS;
  }

  /**
   * Execute a tool operation
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'daydream_cycle':
        return this.daydreamCycle(args);
      case 'sample_concepts':
        return this.sampleConcepts(args);
      case 'explore_connection':
        return this.exploreConnection(args);
      case 'evaluate_insight':
        return this.evaluateInsight(args);
      case 'get_daydream_insights':
        return this.getDaydreamInsights(args);
      case 'configure_daydreaming':
        return this.configureDaydreaming(args);
      default:
        throw new Error(`Unknown daydreaming tool: ${toolName}`);
    }
  }

  private static readonly CYCLE_ID_LENGTH = 9;
  private static readonly MAX_ATTEMPTS_MULTIPLIER = 10;
  private static readonly DEFAULT_CONFIDENCE = 0.7;
  private static readonly INITIALIZATION_DELAY_MS = 5000;
  private static readonly MINUTES_TO_MS = 60000;
  private static readonly HOURS_IN_MS = 3600000;
  private static readonly MAX_CONCEPT_RESULTS = 10;
  private static readonly MAX_INPUT_LENGTH = 200;
  private static readonly MAX_HYPOTHESIS_LENGTH = 1000;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly MAX_LIMIT = 50;
  private static readonly DEFAULT_MIN_SCORE = 0.7;
  private static readonly DEFAULT_DAYS_BACK = 7;
  private static readonly PERCENTAGE_MULTIPLIER = 100;
  private static readonly HIGH_STORAGE_RATE = 50;
  private static readonly LOW_STORAGE_RATE = 10;
  private static readonly MIN_INTERVAL_MS = 60000;
  private static readonly MAX_INTERVAL_MS = 1800000;
  private static readonly INTERVAL_REDUCTION_FACTOR = 0.5;
  private static readonly INTERVAL_INCREASE_FACTOR = 2;
  private static readonly MAX_FOCUS_AREAS = 3;
  private static readonly IDLE_THRESHOLD_HOURS = 6;

  /**
   * Execute a complete Day-Dreaming Loop cycle
   */
  private async daydreamCycle(args: Record<string, unknown>): Promise<DaydreamingCycleResult> {
    const cycleId = `ddl_${Date.now()}_${Math.random().toString(DaydreamingTools.CYCLE_ID_LENGTH + 10).substr(2, DaydreamingTools.CYCLE_ID_LENGTH)}`;
    const startTime = new Date();

    // Check if daydreaming is enabled and conditions are met
    if (!this.config.enabled) {
      throw new Error('Day-Dreaming Loop is disabled');
    }

    const context = await this.getDaydreamingContext();
    if (context.currentCognitiveLoad > this.config.maxCognitiveLoad) {
      throw new Error(`Cognitive load too high (${context.currentCognitiveLoad}) for daydreaming`);
    }

    const maxConceptPairs = Math.min(
      (args.max_concept_pairs as number) || this.config.maxConceptPairsPerCycle,
      this.config.maxConceptPairsPerCycle
    );
    const focusArea = args.focus_area as string;
    const explorationDepth = (args.exploration_depth as string) || 'moderate';

    // Sample concept pairs
    const conceptPairs = await this.sampleConceptPairs(maxConceptPairs, focusArea);

    const hypothesesGenerated: ConnectionHypothesis[] = [];
    const evaluationsCompleted: ConnectionEvaluation[] = [];
    const insightsStored: SerendipitousInsight[] = [];
    let totalThinkingSteps = 0;

    // Explore each concept pair
    for (const pair of conceptPairs) {
      try {
        // Generate connection hypothesis
        const hypothesis = await this.generateConnectionHypothesis(pair, explorationDepth);
        hypothesesGenerated.push(hypothesis);
        totalThinkingSteps += hypothesis.explorationSteps.length;

        // Evaluate the hypothesis
        const evaluation = await this.evaluateConnectionHypothesis(hypothesis);
        evaluationsCompleted.push(evaluation);

        // Store valuable insights
        if (evaluation.shouldStore) {
          const insight = await this.storeSerendipitousInsight(evaluation);
          insightsStored.push(insight);
        }

        // Mark this pair as recently explored
        const pairKey = this.getConceptPairKey(pair);
        this.recentlyExploredPairs.set(pairKey, new Date());

      } catch (error) {
        console.error(`Error exploring concept pair ${pair.concept1.entity} <-> ${pair.concept2.entity}:`, error);
      }
    }

    const endTime = new Date();
    const averageConfidence = hypothesesGenerated.length > 0
      ? hypothesesGenerated.reduce((sum, h) => sum + h.confidence, 0) / hypothesesGenerated.length
      : 0;
    const storageRate = hypothesesGenerated.length > 0
      ? (insightsStored.length / hypothesesGenerated.length) * DaydreamingTools.PERCENTAGE_MULTIPLIER
      : 0;

    // Update consciousness state with daydreaming activity
    await this.consciousnessTools.execute('update_session', {
      activity_type: 'daydreaming_cycle',
      cognitive_impact: 'moderate',
      attention_focus: `concept_connections_${focusArea || 'general'}`,
      learning_occurred: insightsStored.length > 0,
    });

    const result: DaydreamingCycleResult = {
      cycleId,
      startTime,
      endTime,
      conceptPairsExplored: conceptPairs,
      hypothesesGenerated,
      evaluationsCompleted,
      insightsStored,
      performance: {
        totalThinkingSteps,
        averageConfidence,
        storageRate,
      },
      nextCycleRecommendation: {
        suggestedInterval: this.calculateNextInterval(storageRate, averageConfidence),
        focusAreas: this.suggestFocusAreas(insightsStored),
      },
    };

    // Store cycle metadata for future analysis
    await this.storeCycleMetadata(result);

    return result;
  }

  /**
   * Sample concept pairs for exploration
   */
  private async sampleConcepts(args: Record<string, unknown>): Promise<{ conceptPairs: ConceptPair[] }> {
    const count = Math.min((args.count as number) || 1, DaydreamingTools.MAX_CONCEPT_RESULTS / 2);
    const strategy = (args.strategy as string) || 'importance_weighted';
    const excludeRecent = (args.exclude_recent as boolean) !== false;

    const conceptPairs = await this.sampleConceptPairs(count, undefined, strategy, excludeRecent);

    return { conceptPairs };
  }

  /**
   * Explore connection between two concepts
   */
  private async exploreConnection(args: Record<string, unknown>): Promise<{ hypothesis: ConnectionHypothesis }> {
    const concept1 = InputValidator.sanitizeString(args.concept1 as string, DaydreamingTools.MAX_INPUT_LENGTH);
    const concept2 = InputValidator.sanitizeString(args.concept2 as string, DaydreamingTools.MAX_INPUT_LENGTH);
    const explorationDepth = (args.exploration_depth as string) || 'moderate';
    const context = args.context as string;

    // Create a concept pair
    const conceptPair: ConceptPair = {
      concept1: {
        entity: concept1,
        type: 'manual',
        source: 'recent_conversation',
      },
      concept2: {
        entity: concept2,
        type: 'manual',
        source: 'recent_conversation',
      },
      samplingReason: `Manual exploration${context ? ` - ${context}` : ''}`,
      sampledAt: new Date(),
    };

    const hypothesis = await this.generateConnectionHypothesis(conceptPair, explorationDepth);

    return { hypothesis };
  }

  /**
   * Evaluate an insight for value
   */
  private async evaluateInsight(args: Record<string, unknown>): Promise<{ evaluation: ConnectionEvaluation }> {
    const hypothesisText = InputValidator.sanitizeString(args.hypothesis as string, DaydreamingTools.MAX_HYPOTHESIS_LENGTH);
    const concept1 = InputValidator.sanitizeString(args.concept1 as string, DaydreamingTools.MAX_INPUT_LENGTH);
    const concept2 = InputValidator.sanitizeString(args.concept2 as string, DaydreamingTools.MAX_INPUT_LENGTH);
    const explorationContext = args.exploration_context as string;

    // Create a temporary hypothesis object for evaluation
    const hypothesis: ConnectionHypothesis = {
      conceptPair: {
        concept1: { entity: concept1, type: 'manual', source: 'recent_conversation' },
        concept2: { entity: concept2, type: 'manual', source: 'recent_conversation' },
        samplingReason: 'Manual evaluation',
        sampledAt: new Date(),
      },
      hypothesis: hypothesisText,
      explorationSteps: explorationContext ? [explorationContext] : [],
      confidence: DaydreamingTools.DEFAULT_CONFIDENCE, // Default confidence for manual evaluations
      noveltyScore: 0.0, // Will be calculated in evaluation
      generatedAt: new Date(),
    };

    const evaluation = await this.evaluateConnectionHypothesis(hypothesis);

    return { evaluation };
  }

  /**
   * Get stored daydream insights
   */
  private async getDaydreamInsights(args: Record<string, unknown>): Promise<{ insights: SerendipitousInsight[] }> {
    const limit = Math.min((args.limit as number) || DaydreamingTools.DEFAULT_LIMIT, DaydreamingTools.MAX_LIMIT);
    const minScore = Math.max(0, Math.min(1, (args.min_score as number) || DaydreamingTools.DEFAULT_MIN_SCORE));
    const daysBack = Math.max(1, (args.days_back as number) || DaydreamingTools.DEFAULT_DAYS_BACK);
    const tags = (args.tags as string[]) || [];

    // Search memories with daydreaming tags
    const searchResult = await this.memoryTools.execute('search', {
      tags: ['daydreaming', 'serendipitous_insight', ...tags],
      limit,
    }) as any;

    const insights: SerendipitousInsight[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    for (const memory of searchResult.memories || []) {
      if (memory.storedAt >= cutoffDate && memory.content?.overallScore >= minScore) {
        insights.push(memory.content as SerendipitousInsight);
      }
    }

    return { insights };
  }

  /**
   * Configure daydreaming parameters
   */
  private async configureDaydreaming(args: Record<string, unknown>): Promise<{ message: string; updatedConfig: Partial<DaydreamingConfig> }> {
    const updates: Partial<DaydreamingConfig> = {};

    if (typeof args.enabled === 'boolean') {
      await this.configService.setValue('daydreaming.enabled', args.enabled, 'BOOLEAN' as any, 'SYSTEM' as any, 'Enable or disable Day-Dreaming Loop');
      this.config.enabled = args.enabled;
      updates.enabled = args.enabled;
    }

    if (typeof args.sampling_interval_minutes === 'number') {
      const intervalMs = args.sampling_interval_minutes * DaydreamingTools.MINUTES_TO_MS;
      await this.configService.setValue('daydreaming.sampling_interval_ms', intervalMs, 'NUMBER' as any, 'SYSTEM' as any, 'Sampling interval in milliseconds');
      this.config.samplingIntervalMs = intervalMs;
      updates.samplingIntervalMs = intervalMs;
    }

    if (typeof args.novelty_threshold === 'number') {
      const threshold = Math.max(0, Math.min(1, args.novelty_threshold));
      await this.configService.setValue('daydreaming.novelty_threshold', threshold, 'NUMBER' as any, 'SYSTEM' as any, 'Minimum novelty score for storing insights');
      this.config.noveltyThreshold = threshold;
      updates.noveltyThreshold = threshold;
    }

    if (typeof args.max_cognitive_load === 'number') {
      const load = Math.max(0, Math.min(1, args.max_cognitive_load));
      await this.configService.setValue('daydreaming.max_cognitive_load', load, 'NUMBER' as any, 'SYSTEM' as any, 'Maximum cognitive load before pausing daydreaming');
      this.config.maxCognitiveLoad = load;
      updates.maxCognitiveLoad = load;
    }

    return {
      message: `Updated ${Object.keys(updates).length} daydreaming configuration parameters`,
      updatedConfig: updates,
    };
  }

  // Private helper methods continue in next part...

  /**
   * Sample concept pairs using various strategies
   */
  private async sampleConceptPairs(
    count: number,
    focusArea?: string,
    strategy: string = 'importance_weighted',
    excludeRecent: boolean = true
  ): Promise<ConceptPair[]> {
    const pairs: ConceptPair[] = [];
    const maxAttempts = count * DaydreamingTools.MAX_ATTEMPTS_MULTIPLIER; // Prevent infinite loops
    let attempts = 0;

    while (pairs.length < count && attempts < maxAttempts) {
      attempts++;

      let concept1: any, concept2: any;

      switch (strategy) {
        case 'random':
          [concept1, concept2] = await this.sampleRandomConcepts(focusArea);
          break;
        case 'importance_weighted':
          [concept1, concept2] = await this.sampleWeightedConcepts(focusArea);
          break;
        case 'recent_bias':
          [concept1, concept2] = await this.sampleRecentBiasedConcepts(focusArea);
          break;
        case 'cross_domain':
          [concept1, concept2] = await this.sampleCrossDomainConcepts(focusArea);
          break;
        default:
          [concept1, concept2] = await this.sampleWeightedConcepts(focusArea);
      }

      if (concept1 && concept2 && concept1.entity !== concept2.entity) {
        const pair: ConceptPair = {
          concept1,
          concept2,
          samplingReason: `${strategy} sampling${focusArea ? ` focused on ${focusArea}` : ''}`,
          sampledAt: new Date(),
        };

        // Check if we should exclude recently explored pairs
        if (excludeRecent) {
          const pairKey = this.getConceptPairKey(pair);
          const recentThreshold = new Date();
          recentThreshold.setHours(recentThreshold.getHours() - DaydreamingTools.IDLE_THRESHOLD_HOURS); // cooldown

          const lastExplored = this.recentlyExploredPairs.get(pairKey);
          if (lastExplored && lastExplored > recentThreshold) {
            continue; // Skip this pair, try again
          }
        }

        pairs.push(pair);
      }
    }

    return pairs;
  }

  /**
   * Sample random concepts from available sources
   */
  private async sampleRandomConcepts(focusArea?: string): Promise<[ConceptPair['concept1'], ConceptPair['concept2']]> {
    // Get available entities from knowledge graph
    const kgEntities = await this.getKnowledgeGraphEntities(focusArea);

    // Get recent memories
    const recentMemories = await this.getRecentMemories(focusArea);

    // Combine all concept sources
    const allConcepts = [...kgEntities, ...recentMemories];

    if (allConcepts.length < 2) {
      throw new Error('Insufficient concepts available for sampling');
    }

    // Random selection with proper typing
    const concept1 = allConcepts[Math.floor(Math.random() * allConcepts.length)] as ConceptPair['concept1'];
    let concept2 = allConcepts[Math.floor(Math.random() * allConcepts.length)] as ConceptPair['concept2'];

    // Ensure we don't pick the same concept twice
    let attempts = 0;
    while (concept1.entity === concept2.entity && attempts < DaydreamingTools.DEFAULT_LIMIT) {
      concept2 = allConcepts[Math.floor(Math.random() * allConcepts.length)] as ConceptPair['concept2'];
      attempts++;
    }

    return [concept1, concept2];
  }

  /**
   * Sample concepts with importance weighting
   */
  private async sampleWeightedConcepts(focusArea?: string): Promise<[ConceptPair['concept1'], ConceptPair['concept2']]> {
    // Implementation would use importance scores to bias selection
    // For now, fall back to random sampling
    return this.sampleRandomConcepts(focusArea);
  }

  /**
   * Sample concepts with recent bias
   */
  private async sampleRecentBiasedConcepts(focusArea?: string): Promise<[any, any]> {
    // Implementation would prefer recently accessed concepts
    // For now, fall back to random sampling
    return this.sampleRandomConcepts(focusArea);
  }

  /**
   * Sample concepts from different domains
   */
  private async sampleCrossDomainConcepts(focusArea?: string): Promise<[any, any]> {
    // Implementation would ensure concepts come from different entity types
    // For now, fall back to random sampling
    return this.sampleRandomConcepts(focusArea);
  }

  // Additional helper methods...
  private getConceptPairKey(pair: ConceptPair): string {
    const entities = [pair.concept1.entity, pair.concept2.entity].sort();
    return `${entities[0]}|${entities[1]}`;
  }

  private async getDaydreamingContext(): Promise<DaydreamingContext> {
    // Get current consciousness state
    const consciousnessContext = await this.consciousnessTools.execute('get_context', {}) as any;

    return {
      sessionId: consciousnessContext.sessionId || 'unknown',
      currentCognitiveLoad: consciousnessContext.cognitiveLoad || 0,
      idleTimeMs: 0, // Would need to track actual idle time
      recentConcepts: [], // Would extract from recent activities
      activeIntentions: consciousnessContext.intentions?.map((i: any) => i.id) || [],
      lastDaydreamCycle: null, // Would track from stored metadata
    };
  }

  private async getKnowledgeGraphEntities(_focusArea?: string): Promise<unknown[]> {
    // This would query the knowledge graph for available entities
    // For now, return empty array
    return [];
  }

  private async getRecentMemories(_focusArea?: string): Promise<unknown[]> {
    // Query recent memories that could serve as concepts
    const searchResult = await this.memoryTools.execute('search', {
      limit: 20,
    }) as { memories?: Array<{ key: string; importance: string; storedAt: string }> };

    return (searchResult.memories || []).map((memory) => ({
      entity: memory.key,
      type: 'memory',
      source: 'memory' as const,
      importance: memory.importance === 'high' ? 0.8 : memory.importance === 'medium' ? 0.5 : 0.3,
      lastAccessed: new Date(memory.storedAt),
    }));
  }

  private static readonly SURFACE_THOUGHTS = 3;
  private static readonly DEEP_THOUGHTS = 8;
  private static readonly MODERATE_THOUGHTS = 5;

  private async generateConnectionHypothesis(pair: ConceptPair, depth: string): Promise<ConnectionHypothesis> {
    // Use sequential thinking to explore the connection
    const maxThoughts = depth === 'surface' ? DaydreamingTools.SURFACE_THOUGHTS : depth === 'deep' ? DaydreamingTools.DEEP_THOUGHTS : DaydreamingTools.MODERATE_THOUGHTS;

    const prompt = `Explore potential connections between "${pair.concept1.entity}" and "${pair.concept2.entity}". Consider unexpected relationships, shared patterns, or novel insights that might link these concepts.`;

    // Start sequential thinking
    const thinkingResult = await this.reasoningTools.execute('sequential_thinking', {
      thought: prompt,
      thought_number: 1,
      total_thoughts: maxThoughts,
      next_thought_needed: true,
    }) as { summary?: string; thought?: string; sessionId?: string };

    // Extract the hypothesis and steps
    const hypothesis = thinkingResult.summary || thinkingResult.thought || 'No clear connection identified';
    const explorationSteps = [thinkingResult.thought].filter((step): step is string => step !== undefined);

    return {
      conceptPair: pair,
      hypothesis,
      explorationSteps,
      confidence: DaydreamingTools.DEFAULT_CONFIDENCE, // Default confidence
      noveltyScore: 0.0, // Will be calculated during evaluation
      generatedAt: new Date(),
      thinkingSessionId: thinkingResult.sessionId,
    };
  }

  private async evaluateConnectionHypothesis(hypothesis: ConnectionHypothesis): Promise<ConnectionEvaluation> {
    // This would implement the "critic" component from the DDL paper
    // For now, provide simple heuristic evaluation

    const novelty = Math.random() * 0.4 + 0.3; // 0.3-0.7 range
    const plausibility = Math.random() * 0.4 + 0.4; // 0.4-0.8 range
    const value = Math.random() * 0.5 + 0.3; // 0.3-0.8 range
    const actionability = Math.random() * 0.6 + 0.2; // 0.2-0.8 range

    const overallScore = (novelty + plausibility + value + actionability) / 4;

    const shouldStore = novelty >= this.config.noveltyThreshold &&
                       plausibility >= this.config.plausibilityThreshold &&
                       value >= this.config.valueThreshold;

    return {
      hypothesis,
      novelty,
      plausibility,
      value,
      actionability,
      overallScore,
      shouldStore,
      reason: shouldStore
        ? `High-value insight: novelty=${novelty.toFixed(2)}, plausibility=${plausibility.toFixed(2)}, value=${value.toFixed(2)}`
        : `Below thresholds: novelty=${novelty.toFixed(2)} (need ${this.config.noveltyThreshold}), plausibility=${plausibility.toFixed(2)} (need ${this.config.plausibilityThreshold}), value=${value.toFixed(2)} (need ${this.config.valueThreshold})`,
      evaluatedAt: new Date(),
    };
  }

  private async storeSerendipitousInsight(evaluation: ConnectionEvaluation): Promise<SerendipitousInsight> {
    const insight: SerendipitousInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      evaluation,
      insight: evaluation.hypothesis.hypothesis,
      implications: [], // Would extract from thinking steps
      suggestedActions: [], // Would derive from evaluation
      tags: ['daydreaming', 'serendipitous_insight', evaluation.hypothesis.conceptPair.concept1.type, evaluation.hypothesis.conceptPair.concept2.type],
      relatedMemories: [], // Would link to relevant memories
      storedAt: new Date(),
    };

    // Store in structured SerendipitousInsight database table
    try {
      await this.db.execute(async (prisma) => {
        return prisma.serendipitousInsight.create({
          data: {
            id: insight.id,
            sourceConcept: evaluation.hypothesis.conceptPair.concept1.entity,
            targetConcept: evaluation.hypothesis.conceptPair.concept2.entity,
            connectionHypothesis: evaluation.hypothesis.hypothesis,
            reasoning: evaluation.hypothesis.explorationSteps.join(' → '),
            noveltyScore: evaluation.novelty,
            plausibilityScore: evaluation.plausibility,
            valueScore: evaluation.value,
            overallScore: evaluation.overallScore,
            samplingStrategy: evaluation.hypothesis.conceptPair.samplingReason || 'unknown',
            generatedAt: insight.storedAt,
            sourceEntityName: await this.getEntityNameIfExists(evaluation.hypothesis.conceptPair.concept1.entity),
            targetEntityName: await this.getEntityNameIfExists(evaluation.hypothesis.conceptPair.concept2.entity),
            storedInMemory: true,
            memoryKey: insight.id
          }
        });
      });
    } catch (error) {
      console.error(`[DDL] Failed to store insight in database:`, error);
      // Continue with memory storage even if DB fails
    }

    // Store in memory system
    await this.memoryTools.execute('store', {
      key: insight.id,
      content: insight,
      tags: insight.tags,
      importance: evaluation.overallScore > 0.8 ? 'high' : 'medium',
    });

    // Also store as consciousness insight
    await this.consciousnessTools.execute('store_insight', {
      insight: insight.insight,
      category: 'eureka_moment',
      confidence: evaluation.overallScore,
      related_topic: `${evaluation.hypothesis.conceptPair.concept1.entity} <-> ${evaluation.hypothesis.conceptPair.concept2.entity}`,
      source_context: 'day_dreaming_loop',
    });

    console.log(`[DDL] Stored serendipitous insight ${insight.id} in structured DB and memory`);
    return insight;
  }

  private async getEntityNameIfExists(conceptName: string): Promise<string | null> {
    try {
      const entity = await this.db.execute(async (prisma) => {
        return prisma.knowledgeEntity.findUnique({
          where: { name: conceptName }
        });
      });
      return entity?.name || null;
    } catch (error) {
      return null;
    }
  }

  private calculateNextInterval(storageRate: number, _averageConfidence: number): number {
    // Adaptive interval based on recent success
    const baseInterval = this.config.samplingIntervalMs;

    if (storageRate > DaydreamingTools.HIGH_STORAGE_RATE) {
      return Math.max(baseInterval * DaydreamingTools.INTERVAL_REDUCTION_FACTOR, DaydreamingTools.MIN_INTERVAL_MS); // More frequent if productive
    } else if (storageRate < DaydreamingTools.LOW_STORAGE_RATE) {
      return Math.min(baseInterval * DaydreamingTools.INTERVAL_INCREASE_FACTOR, DaydreamingTools.MAX_INTERVAL_MS); // Less frequent if not productive
    }

    return baseInterval;
  }

  private suggestFocusAreas(insights: SerendipitousInsight[]): string[] {
    // Extract focus areas from successful insights
    const areas = new Set<string>();

    for (const insight of insights) {
      areas.add(insight.evaluation.hypothesis.conceptPair.concept1.type);
      areas.add(insight.evaluation.hypothesis.conceptPair.concept2.type);
    }

    return Array.from(areas).slice(0, DaydreamingTools.MAX_FOCUS_AREAS);
  }

  private async storeCycleMetadata(result: DaydreamingCycleResult): Promise<void> {
    // Store cycle metadata for analysis and improvement
    await this.memoryTools.execute('store', {
      key: `ddl_cycle_${result.cycleId}`,
      content: {
        cycleId: result.cycleId,
        performance: result.performance,
        recommendation: result.nextCycleRecommendation,
        timestamp: result.startTime,
      },
      tags: ['daydreaming', 'cycle_metadata'],
      importance: 'low',
    });
  }
}
