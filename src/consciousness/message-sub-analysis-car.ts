/**
 * V3 Message Sub-Analysis Car - Parallel Processing
 * 
 * Converts the original message analysis car to output structured sub-analysis
 * for the personality-first railroad architecture.
 */

import { SubAnalysisCar, MessageSubAnalysis, RailroadContext } from './types-v3.js';
import { simpleConversation } from '../reasoning/simple-conversation.js';
import { buildMessageAnalysisPrompt } from './subconscious-prompt-builder.js';

/**
 * Message Sub-Analysis Car for parallel processing
 */
class MessageSubAnalysisCarImpl implements SubAnalysisCar {
  name = 'message-analysis';

  async analyzeAsync(context: Pick<RailroadContext, 'message' | 'originalContext' | 'timestamp' | 'sessionId' | 'userId'>): Promise<MessageSubAnalysis> {
    try {
      // Build consciousness-aware prompt using subconscious dialogue
      const promptResult = await buildMessageAnalysisPrompt(context.message, context.originalContext, {
        mode: 'analytical', // Default since we don't have session context yet
        awarenessLevel: 'medium',
        emotionalTone: 'neutral',
        cognitiveLoad: 0.1,
        attentionFocus: 'general_conversation',
        learningState: 'active',
      });

      if (!promptResult.valid) {
        throw new Error('Prompt validation failed');
      }

      const analysis = await simpleConversation({
        question: promptResult.prompt,
        context: 'Internal consciousness analysis',
      });

      // Parse the response as JSON
      const result = JSON.parse(analysis.response);

      return {
        intent: result.intent || 'general',
        operations: result.operations || ['basic_response'],
        entities_mentioned: result.entities_mentioned || [],
        emotional_context: result.emotional_context || 'neutral',
        requires_memory: Boolean(result.requires_memory),
        requires_social: Boolean(result.requires_social),
        requires_insight_storage: Boolean(result.requires_insight_storage),
        confidence: this.calculateAnalysisConfidence(result),
        reasoning: this.extractReasoningFromResult(result)
      };
    } catch (error) {
      // Fallback to basic analysis if GenAI fails
      console.warn('Message analysis GenAI failed, using fallback:', error);
      
      return this.createFallbackAnalysis(context.message);
    }
  }

  /**
   * Calculate confidence in the analysis based on result completeness
   */
  private calculateAnalysisConfidence(result: any): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence for complete results
    if (result.intent && result.intent !== 'general') confidence += 0.15;
    if (result.operations && result.operations.length > 1) confidence += 0.1;
    if (result.entities_mentioned && result.entities_mentioned.length > 0) confidence += 0.1;
    if (result.emotional_context && result.emotional_context !== 'neutral') confidence += 0.1;
    if (result.subconscious_notes && result.subconscious_notes.length > 10) confidence += 0.05;
    
    return Math.min(0.95, confidence);
  }

  /**
   * Extract reasoning from GenAI result
   */
  private extractReasoningFromResult(result: any): string[] {
    const reasoning: string[] = [];
    
    if (result.subconscious_notes) {
      reasoning.push(`Subconscious insight: ${result.subconscious_notes}`);
    }
    
    if (result.intent && result.intent !== 'general') {
      reasoning.push(`Intent detection: ${result.intent}`);
    }
    
    if (result.emotional_context && result.emotional_context !== 'neutral') {
      reasoning.push(`Emotional context: ${result.emotional_context}`);
    }
    
    if (result.entities_mentioned && result.entities_mentioned.length > 0) {
      reasoning.push(`Entities identified: ${result.entities_mentioned.join(', ')}`);
    }
    
    return reasoning;
  }

  /**
   * Create fallback analysis when GenAI fails
   */
  private createFallbackAnalysis(message: string): MessageSubAnalysis {
    const fallbackAnalysis = {
      intent: this.detectIntentFallback(message),
      operations: ['basic_response'],
      entities_mentioned: this.extractMentionsFallback(message),
      emotional_context: this.detectEmotionalContextFallback(message),
      requires_memory: message.toLowerCase().includes('remember') || message.toLowerCase().includes('recall'),
      requires_social: this.extractMentionsFallback(message).length > 0,
      requires_insight_storage: message.toLowerCase().includes('think') || message.toLowerCase().includes('realize'),
      confidence: 0.3, // Lower confidence for fallback
      reasoning: ['Fallback analysis - GenAI unavailable']
    };

    return fallbackAnalysis;
  }

  /**
   * Simple fallback intent detection
   */
  private detectIntentFallback(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('why')) {
      return 'learning_request';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return 'assistance_request';
    }
    
    if (lowerMessage.includes('think') || lowerMessage.includes('analyze')) {
      return 'technical_discussion';
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('how are you')) {
      return 'social_check_in';
    }
    
    return 'general';
  }

  /**
   * Simple fallback emotional context detection
   */
  private detectEmotionalContextFallback(message: string): string {
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
    
    return 'neutral';
  }

  /**
   * Simple fallback for extracting potential entity mentions
   */
  private extractMentionsFallback(message: string): string[] {
    const mentions: string[] = [];

    // Common names that might appear in our context
    const commonNames = ['andy', 'echo', 'claude'];

    for (const name of commonNames) {
      if (message.toLowerCase().includes(name)) {
        mentions.push(name);
      }
    }

    return mentions;
  }
}

/**
 * Export the sub-analysis car instance
 */
export const messageSubAnalysisCar: SubAnalysisCar = new MessageSubAnalysisCarImpl();