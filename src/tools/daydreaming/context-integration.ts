import { executeConsciousnessOperation } from '../../features/consciousness/index.js';
import { MemoryTools } from '../memory/memory-tools.js';
import { SerendipitousInsight } from './types.js';

/**
 * Context integration module for Day-Dreaming Loop insights
 * Enhances context preparation to surface relevant background insights
 */
export class DaydreamContextIntegrator {
  private memoryTools: MemoryTools;

  constructor() {
    this.memoryTools = new MemoryTools();
  }

  /**
   * Enhance consciousness context preparation with daydream insights
   */
  async enhanceContextWithDaydreams(
    _topic: string,
    standardContext: Record<string, unknown>
  ): Promise<{
    enhancedContext: any;
    daydreamInsights: SerendipitousInsight[];
    creativeSparks: string[];
  }> {
    // Search for relevant daydream insights
    const daydreamInsights = await this.findRelevantDaydreamInsights(_topic);

    // Generate creative sparks from insights
    const creativeSparks = this.generateCreativeSparks(daydreamInsights, _topic);

    // Enhance the standard context
    const enhancedContext = {
      ...standardContext,
      daydreamEnhancement: {
        backgroundInsights: daydreamInsights.length,
        serendipitousConnections: creativeSparks,
        novelPerspectives: this.extractNovelPerspectives(daydreamInsights),
        crossDomainLinks: this.findCrossDomainConnections(daydreamInsights, _topic),
      },
    };

    return {
      enhancedContext,
      daydreamInsights,
      creativeSparks,
    };
  }

  /**
   * Find daydream insights relevant to the current topic
   */
  private async findRelevantDaydreamInsights(topic: string): Promise<SerendipitousInsight[]> {
    try {
      // Search memories for daydream insights
      const searchResult = (await this.memoryTools.execute('search', {
        query: topic,
        tags: ['daydreaming', 'serendipitous_insight'],
        limit: 10,
      })) as any;

      const insights: SerendipitousInsight[] = [];
      for (const memory of searchResult.memories || []) {
        if (memory.content && typeof memory.content === 'object') {
          insights.push(memory.content as SerendipitousInsight);
        }
      }

      // Sort by relevance and recency
      return insights
        .sort((a, b) => {
          const scoreA = a.evaluation.overallScore * this.getRecencyWeight(a.storedAt);
          const scoreB = b.evaluation.overallScore * this.getRecencyWeight(b.storedAt);
          return scoreB - scoreA;
        })
        .slice(0, 5); // Top 5 most relevant
    } catch (error) {
      console.warn('Could not retrieve daydream insights:', error);
      return [];
    }
  }

  /**
   * Generate creative sparks from insights that could inspire new thinking
   */
  private generateCreativeSparks(insights: SerendipitousInsight[], _topic: string): string[] {
    const sparks: string[] = [];

    for (const insight of insights) {
      // Extract the core connection insight
      const connection = this.extractCoreConnection(insight);
      if (connection) {
        sparks.push(
          `💡 Background insight: ${connection} (from daydreaming about ${insight.evaluation.hypothesis.conceptPair.concept1.entity} ↔ ${insight.evaluation.hypothesis.conceptPair.concept2.entity})`
        );
      }

      // Add implications as potential sparks
      for (const implication of insight.implications.slice(0, 2)) {
        sparks.push(`🌟 Serendipitous angle: ${implication}`);
      }
    }

    return sparks.slice(0, 4); // Limit to most relevant sparks
  }

  /**
   * Extract novel perspectives from daydream insights
   */
  private extractNovelPerspectives(insights: SerendipitousInsight[]): string[] {
    return insights
      .filter(insight => insight.evaluation.novelty > 0.7)
      .map(insight => `Unexpected connection: ${insight.insight.substring(0, 100)}...`)
      .slice(0, 3);
  }

  /**
   * Find cross-domain connections that might apply to current topic
   */
  private findCrossDomainConnections(insights: SerendipitousInsight[], topic: string): string[] {
    const connections: string[] = [];

    for (const insight of insights) {
      const concept1Type = insight.evaluation.hypothesis.conceptPair.concept1.type;
      const concept2Type = insight.evaluation.hypothesis.conceptPair.concept2.type;

      if (concept1Type !== concept2Type) {
        connections.push(`Cross-domain link: ${concept1Type} ↔ ${concept2Type} patterns might apply to ${topic}`);
      }
    }

    return connections.slice(0, 2);
  }

  /**
   * Calculate recency weight for insights (more recent = higher weight)
   */
  private getRecencyWeight(storedAt: Date): number {
    const now = new Date();
    const ageHours = (now.getTime() - storedAt.getTime()) / (1000 * 60 * 60);

    // Exponential decay: insights lose relevance over time
    return Math.exp(-ageHours / 24); // Half-life of ~17 hours
  }

  /**
   * Extract the core connection from an insight
   */
  private extractCoreConnection(insight: SerendipitousInsight): string | null {
    try {
      // Try to extract the key insight in a concise form
      const sentences = insight.insight.split('.').filter(s => s.trim().length > 10);
      return sentences[0]?.trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if we should include daydream enhancement for this topic
   */
  shouldEnhanceWithDaydreams(topic: string, contextDepth: string): boolean {
    // Include daydream insights for:
    // 1. Creative or open-ended topics
    // 2. Deep exploration contexts
    // 3. Problem-solving scenarios

    const creativeKeywords = ['creative', 'innovative', 'brainstorm', 'idea', 'solution', 'approach'];
    const problemKeywords = ['problem', 'challenge', 'issue', 'difficulty', 'obstacle'];

    const topicLower = topic.toLowerCase();
    const isCreative = creativeKeywords.some(keyword => topicLower.includes(keyword));
    const isProblemSolving = problemKeywords.some(keyword => topicLower.includes(keyword));
    const isDeepContext = contextDepth === 'profound_exploration';

    return isCreative || isProblemSolving || isDeepContext;
  }
}

/**
 * Enhanced context preparation that integrates daydream insights
 */
export async function prepareEnhancedContext(
  topic: string,
  contextDepth: string = 'thoughtful_dive',
  includeMemories: boolean = true,
  includeKnowledge: boolean = true,
  contextNote?: string
): Promise<any> {
  const integrator = new DaydreamContextIntegrator();

  // Get standard consciousness context
  const standardContext = await executeConsciousnessOperation('consciousness_prepare_context', {
    topic,
    context_depth: contextDepth,
    include_memories: includeMemories,
    include_knowledge: includeKnowledge,
    context_note: contextNote,
  });

  // Check if we should enhance with daydreams
  if (integrator.shouldEnhanceWithDaydreams(topic, contextDepth)) {
    const enhancement = await integrator.enhanceContextWithDaydreams(topic, standardContext as Record<string, unknown>);

    return {
      ...enhancement.enhancedContext,
      daydreamMeta: {
        insightsFound: enhancement.daydreamInsights.length,
        sparksGenerated: enhancement.creativeSparks.length,
        enhancementReason: 'Topic benefits from background creative insights',
      },
    };
  }

  return standardContext;
}
