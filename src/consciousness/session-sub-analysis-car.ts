/**
 * V3 Session Sub-Analysis Car - Parallel Processing
 * 
 * Converts the original session context car to output structured sub-analysis
 * for the personality-first railroad architecture.
 */

import { SubAnalysisCar, SessionSubAnalysis, RailroadContext } from './types-v3.js';
import { GuidGenerator } from '../core/utils/guid.js';

/**
 * Session Sub-Analysis Car for parallel processing
 */
class SessionSubAnalysisCarImpl implements SubAnalysisCar {
  name = 'session-analysis';

  async analyzeAsync(context: Pick<RailroadContext, 'message' | 'originalContext' | 'timestamp' | 'sessionId' | 'userId'>): Promise<SessionSubAnalysis> {
    // Generate or get current session info
    const sessionId = context.sessionId || GuidGenerator.generateSessionId();
    
    // Analyze the message for basic intent (since we don't have message analysis yet in parallel)
    const basicIntent = this.extractBasicIntent(context.message);
    const basicEmotionalContext = this.extractBasicEmotionalContext(context.message);
    
    // Create current consciousness state
    const currentState = {
      mode: this.determineMode(basicIntent),
      awarenessLevel: this.determineAwarenessLevel(basicEmotionalContext),
      emotionalTone: this.mapEmotionalContext(basicEmotionalContext),
      cognitiveLoad: this.calculateCognitiveLoad(context.message),
      attentionFocus: this.determineAttentionFocus(context.message),
      learningState: this.determineLearningState(context.message, basicIntent),
    };

    // Get session duration (for now, just time since context started)
    const duration = Date.now() - new Date(context.timestamp).getTime();

    // Identify contextual factors that might influence consciousness
    const contextualFactors = this.identifyContextualFactors(context.message, currentState);

    // Calculate confidence in our state analysis
    const stateConfidence = this.calculateStateConfidence(context.message, currentState);

    return {
      sessionId,
      currentState,
      duration,
      contextualFactors,
      stateConfidence
    };
  }

  /**
   * Extract basic intent from message for session analysis
   */
  private extractBasicIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('explain')) {
      return 'learning';
    }
    
    if (lowerMessage.includes('implement') || lowerMessage.includes('code') || lowerMessage.includes('technical')) {
      return 'technical';
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('chat')) {
      return 'social';
    }
    
    if (lowerMessage.includes('create') || lowerMessage.includes('design') || lowerMessage.includes('brainstorm')) {
      return 'creative';
    }
    
    if (lowerMessage.includes('think') || lowerMessage.includes('analyze') || lowerMessage.includes('consider')) {
      return 'reflection';
    }
    
    return 'general';
  }

  /**
   * Extract basic emotional context from message
   */
  private extractBasicEmotionalContext(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('excited') || lowerMessage.includes('amazing') || lowerMessage.includes('great')) {
      return 'excited';
    }
    
    if (lowerMessage.includes('frustrated') || lowerMessage.includes('confused') || lowerMessage.includes('stuck')) {
      return 'frustrated';
    }
    
    if (lowerMessage.includes('curious') || lowerMessage.includes('interested') || lowerMessage.includes('wondering')) {
      return 'curious';
    }
    
    if (lowerMessage.includes('urgent') || lowerMessage.includes('quickly') || lowerMessage.includes('asap')) {
      return 'urgent';
    }
    
    return 'neutral';
  }

  /**
   * Determine consciousness mode based on message intent
   */
  private determineMode(intent: string): string {
    switch (intent) {
      case 'technical':
        return 'analytical';
      case 'social':
        return 'social';
      case 'learning':
      case 'reflection':
        return 'contemplative';
      case 'creative':
        return 'creative';
      default:
        return 'analytical';
    }
  }

  /**
   * Determine awareness level based on emotional context
   */
  private determineAwarenessLevel(emotionalContext: string): string {
    const highAwarenessContexts = ['excited', 'focused', 'intense', 'urgent'];
    const lowAwarenessContexts = ['tired', 'distracted', 'casual', 'relaxed'];

    if (highAwarenessContexts.some(ctx => emotionalContext.includes(ctx))) {
      return 'high';
    } else if (lowAwarenessContexts.some(ctx => emotionalContext.includes(ctx))) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  /**
   * Map emotional context to consciousness emotional tone
   */
  private mapEmotionalContext(emotionalContext: string): string {
    if (emotionalContext.includes('excited') || emotionalContext.includes('positive')) {
      return 'positive';
    } else if (emotionalContext.includes('frustrated') || emotionalContext.includes('negative')) {
      return 'concerned';
    } else if (emotionalContext.includes('playful') || emotionalContext.includes('humorous')) {
      return 'playful';
    } else {
      return 'neutral';
    }
  }

  /**
   * Calculate cognitive load based on message complexity
   */
  private calculateCognitiveLoad(message: string): number {
    let load = 0.1; // Base load

    // Increase load based on message characteristics
    if (message.length > 200) load += 0.2;
    if (message.includes('complex') || message.includes('difficult')) load += 0.2;
    if (message.includes('multiple') || message.includes('several')) load += 0.1;
    if (message.split(' ').length > 50) load += 0.2;
    
    // Technical terms increase cognitive load
    const technicalTerms = ['implement', 'architecture', 'algorithm', 'optimization', 'analysis'];
    const technicalCount = technicalTerms.filter(term => message.toLowerCase().includes(term)).length;
    load += technicalCount * 0.1;

    return Math.min(1.0, load);
  }

  /**
   * Determine attention focus based on message content
   */
  private determineAttentionFocus(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('personality') || lowerMessage.includes('consciousness')) {
      return 'personality_development';
    }
    
    if (lowerMessage.includes('code') || lowerMessage.includes('implement')) {
      return 'technical_implementation';
    }
    
    if (lowerMessage.includes('design') || lowerMessage.includes('architecture')) {
      return 'system_design';
    }
    
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return 'problem_solving';
    }
    
    return 'general_conversation';
  }

  /**
   * Determine learning state based on message and intent
   */
  private determineLearningState(message: string, intent: string): string {
    if (intent === 'learning' || message.toLowerCase().includes('learn')) {
      return 'adaptive';
    }
    
    if (intent === 'reflection' || message.toLowerCase().includes('understand')) {
      return 'contemplative';
    }
    
    if (intent === 'technical' || message.toLowerCase().includes('implement')) {
      return 'focused';
    }
    
    return 'active';
  }

  /**
   * Identify contextual factors that might influence consciousness
   */
  private identifyContextualFactors(message: string, currentState: any): string[] {
    const factors: string[] = [];
    
    if (currentState.cognitiveLoad > 0.5) {
      factors.push('high_cognitive_demand');
    }
    
    if (message.length > 300) {
      factors.push('complex_input');
    }
    
    if (currentState.awarenessLevel === 'high') {
      factors.push('heightened_awareness');
    }
    
    if (currentState.mode === 'creative') {
      factors.push('creative_thinking_required');
    }
    
    if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('quickly')) {
      factors.push('time_pressure');
    }
    
    return factors;
  }

  /**
   * Calculate confidence in our state analysis
   */
  private calculateStateConfidence(message: string, _currentState: any): number {
    let confidence = 0.7; // Base confidence for session analysis
    
    // Higher confidence for clear indicators
    if (message.toLowerCase().includes('mode') || message.toLowerCase().includes('state')) {
      confidence += 0.1;
    }
    
    // Lower confidence for ambiguous messages
    if (message.length < 20) {
      confidence -= 0.2;
    }
    
    // Higher confidence for specific emotional indicators
    const emotionalIndicators = ['excited', 'frustrated', 'curious', 'focused'];
    if (emotionalIndicators.some(indicator => message.toLowerCase().includes(indicator))) {
      confidence += 0.1;
    }
    
    return Math.min(0.95, Math.max(0.3, confidence));
  }
}

/**
 * Export the sub-analysis car instance
 */
export const sessionSubAnalysisCar: SubAnalysisCar = new SessionSubAnalysisCarImpl();