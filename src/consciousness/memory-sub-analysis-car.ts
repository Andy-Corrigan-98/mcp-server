/**
 * V3 Memory Sub-Analysis Car - Parallel Processing
 * 
 * Converts the original memory context car to output structured sub-analysis
 * for the personality-first railroad architecture.
 */

import { SubAnalysisCar, MemorySubAnalysis, RailroadContext } from './types-v3.js';
import { executeDatabase } from '../core/services/database.js';

/**
 * Memory Sub-Analysis Car for parallel processing
 */
class MemorySubAnalysisCarImpl implements SubAnalysisCar {
  name = 'memory-analysis';

  async analyzeAsync(context: Pick<RailroadContext, 'message' | 'originalContext' | 'timestamp' | 'sessionId' | 'userId'>): Promise<MemorySubAnalysis> {
    try {
      console.log('🧠 Memory Sub-Analysis: Retrieving relevant memories...');

      // Extract search terms from the message
      const searchTerms = this.extractMemorySearchTerms(context.message, context.originalContext);
      
      // Search for relevant memories
      const relevantMemories = await this.searchRelevantMemories(searchTerms, 5) || [];
      
      // Get total memory count
      const totalMemories = await this.getTotalMemoryCount();
      
      // Analyze memory patterns
      const memoryPatterns = await this.analyzeMemoryPatterns(searchTerms);
      
      // Calculate confidence in memory analysis
      const memoryConfidence = this.calculateMemoryConfidence(relevantMemories, searchTerms);

      console.log(`✅ Memory Sub-Analysis: Found ${relevantMemories.length} relevant memories`);
      
      return {
        relevantMemories,
        totalMemories,
        searchTerms,
        memoryPatterns,
        memoryConfidence
      };
      
    } catch (error) {
      console.error('❌ Memory Sub-Analysis failed:', error);
      
      // Return empty but valid analysis on failure
      return {
        relevantMemories: [],
        totalMemories: 0,
        searchTerms: this.extractMemorySearchTerms(context.message, context.originalContext),
        memoryPatterns: {
          frequentTopics: [],
          learningAreas: [],
          recentTrends: []
        },
        memoryConfidence: 0.1 // Low confidence for failed analysis
      };
    }
  }

  /**
   * Extract search terms from message for memory retrieval
   */
  private extractMemorySearchTerms(message: string, originalContext?: string): string[] {
    const terms: string[] = [];
    
    // Add message words (filter out common words)
    const messageWords = message.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isCommonWord(word))
      .slice(0, 8); // Limit to most relevant terms
    
    terms.push(...messageWords);
    
    // Add context words if available
    if (originalContext) {
      const contextWords = originalContext.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !this.isCommonWord(word))
        .slice(0, 3);
      
      terms.push(...contextWords);
    }
    
    // Add domain-specific terms
    const domainTerms = this.extractDomainTerms(message);
    terms.push(...domainTerms);
    
    return Array.from(new Set(terms)); // Remove duplicates
  }

  /**
   * Check if a word is too common to be useful for search
   */
  private isCommonWord(word: string): boolean {
    const commonWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];
    return commonWords.includes(word);
  }

  /**
   * Extract domain-specific terms that are likely important
   */
  private extractDomainTerms(message: string): string[] {
    const terms: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Technical terms
    const techTerms = ['personality', 'consciousness', 'railroad', 'analysis', 'architecture', 'implementation', 'algorithm', 'optimization', 'design', 'system'];
    techTerms.forEach(term => {
      if (lowerMessage.includes(term)) {
        terms.push(term);
      }
    });
    
    // Names that might be important
    const names = ['andy', 'echo', 'claude'];
    names.forEach(name => {
      if (lowerMessage.includes(name)) {
        terms.push(name);
      }
    });
    
    return terms;
  }

  /**
   * Search for relevant memories based on terms
   */
  private async searchRelevantMemories(searchTerms: string[], limit: number) {
    try {
      const result = await executeDatabase(async (prisma) => {
        // Search memories by content and tags
        const memories = await prisma.memory.findMany({
          take: limit * 2, // Get more than needed for better filtering
          select: {
            key: true,
            content: true,
            tags: true,
            importance: true,
            accessCount: true,
            storedAt: true
          }
        });

        // Score memories by relevance
        const scoredMemories = memories.map(memory => {
          const relevanceScore = this.calculateMemoryRelevance(memory, searchTerms);
          return {
            ...memory,
            relevanceScore
          };
        });

        // Sort by relevance and take top results
        return scoredMemories
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, limit)
          .map(memory => ({
            key: memory.key,
            content: memory.content,
            relevanceScore: memory.relevanceScore,
            tags: Array.isArray(memory.tags) ? memory.tags : (memory.tags ? [memory.tags] : []),
            accessCount: memory.accessCount || 0
          }));
      });

      return result.success ? result.data : [];
    } catch (error) {
      console.error('Memory search failed:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for a memory
   */
  private calculateMemoryRelevance(memory: any, searchTerms: string[]): number {
    let score = 0;
    const contentStr = JSON.stringify(memory.content).toLowerCase();
    const tags = memory.tags || [];

    // Score based on search term matches
    searchTerms.forEach(term => {
      if (contentStr.includes(term)) {
        score += 0.3;
      }
      if (tags.some((tag: string) => tag.toLowerCase().includes(term))) {
        score += 0.4; // Tags are more specific
      }
    });

    // Boost for importance
    if (memory.importance === 'high') score += 0.2;
    if (memory.importance === 'critical') score += 0.3;

    // Slight boost for frequently accessed memories
    if (memory.accessCount > 2) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Get total memory count
   */
  private async getTotalMemoryCount(): Promise<number> {
    try {
      const result = await executeDatabase(async (prisma) => {
        return prisma.memory.count();
      });

      return result.success ? (result.data || 0) : 0;
    } catch (error) {
      console.error('Failed to get memory count:', error);
      return 0;
    }
  }

  /**
   * Analyze memory patterns for insights
   */
  private async analyzeMemoryPatterns(searchTerms: string[]): Promise<{
    frequentTopics: string[];
    learningAreas: string[];
    recentTrends: string[];
  }> {
    try {
      const result = await executeDatabase(async (prisma) => {
        // Get recent memories for pattern analysis
        const recentMemories = await prisma.memory.findMany({
          take: 20,
          orderBy: {
            storedAt: 'desc'
          },
          select: {
            tags: true,
            content: true,
            importance: true
          }
        });

        return recentMemories;
      });

      if (!result.success || !result.data) {
        return {
          frequentTopics: [],
          learningAreas: [],
          recentTrends: []
        };
      }

      const memories = result.data;

      // Analyze frequent topics from tags
      const allTags = memories.flatMap(m => m.tags || []);
      const tagCounts = this.countOccurrences(allTags);
      const frequentTopics = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      // Identify learning areas (high importance memories)
      const learningMemories = memories.filter(m => m.importance === 'high' || m.importance === 'critical');
      const learningTags = learningMemories.flatMap(m => m.tags || []);
      const learningCounts = this.countOccurrences(learningTags);
      const learningAreas = Object.entries(learningCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([tag]) => tag);

      // Recent trends based on current search terms
      const recentTrends = searchTerms.filter(term => 
        frequentTopics.some(topic => topic.includes(term)) ||
        learningAreas.some(area => area.includes(term))
      ).slice(0, 3);

      return {
        frequentTopics,
        learningAreas,
        recentTrends
      };

    } catch (error) {
      console.error('Failed to analyze memory patterns:', error);
      return {
        frequentTopics: [],
        learningAreas: [],
        recentTrends: []
      };
    }
  }

  /**
   * Count occurrences of items in array
   */
  private countOccurrences(items: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return counts;
  }

  /**
   * Calculate confidence in memory analysis
   */
  private calculateMemoryConfidence(relevantMemories: any[], searchTerms: string[]): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence with more relevant memories
    if (relevantMemories.length > 0) {
      confidence += Math.min(0.3, relevantMemories.length * 0.1);
    }

    // Higher confidence with high relevance scores
    const avgRelevance = relevantMemories.length > 0 
      ? relevantMemories.reduce((sum, m) => sum + m.relevanceScore, 0) / relevantMemories.length
      : 0;
    confidence += avgRelevance * 0.2;

    // Higher confidence with more specific search terms
    if (searchTerms.length > 3) {
      confidence += 0.1;
    }

    return Math.min(0.95, Math.max(0.1, confidence));
  }
}

/**
 * Export the sub-analysis car instance
 */
export const memorySubAnalysisCar: SubAnalysisCar = new MemorySubAnalysisCarImpl();