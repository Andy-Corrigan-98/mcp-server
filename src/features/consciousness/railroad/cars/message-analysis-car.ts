import { RailroadContext } from '../types.js';
import { simpleConversation } from '../../../reasoning/conversation/simple-conversation.js';

/**
 * Message Analysis Railroad Car
 * 
 * Analyzes the incoming message to understand intent, emotional context,
 * and what consciousness operations might be needed.
 */
export async function messageAnalysisCar(context: RailroadContext): Promise<RailroadContext> {
  const analysisPrompt = `
Analyze this message to understand what consciousness operations might be needed:

Message: "${context.message}"
${context.originalContext ? `Context: "${context.originalContext}"` : ''}

Determine:
1. The primary intent (information, support, learning, reflection, social, technical, casual, etc.)
2. What consciousness operations might be needed (memory retrieval, insight storage, social recording, etc.)
3. Any people/entities mentioned
4. Emotional context (neutral, excited, frustrated, thoughtful, playful, etc.)
5. Whether this requires accessing memories, social context, or storing insights

Respond with a JSON object with these fields:
- intent: string
- operations: string[]
- entities_mentioned: string[]
- emotional_context: string
- requires_memory: boolean
- requires_social: boolean
- requires_insight_storage: boolean
`;

  try {
    const analysis = await simpleConversation({
      question: analysisPrompt,
      context: 'Message analysis for consciousness routing',
    });

    // Parse the response as JSON
    const result = JSON.parse(analysis.response);
    
    return {
      ...context,
      analysis: {
        intent: result.intent || 'general',
        operations: result.operations || ['basic_response'],
        entities_mentioned: result.entities_mentioned || [],
        emotional_context: result.emotional_context || 'neutral',
        requires_memory: Boolean(result.requires_memory),
        requires_social: Boolean(result.requires_social),
        requires_insight_storage: Boolean(result.requires_insight_storage),
      }
    };
    
  } catch (error) {
    // Fallback to basic analysis if GenAI fails
    const fallbackAnalysis = {
      intent: 'general',
      operations: ['basic_response'],
      entities_mentioned: extractMentionsFallback(context.message),
      emotional_context: 'neutral',
      requires_memory: context.message.toLowerCase().includes('remember') || 
                      context.message.toLowerCase().includes('recall'),
      requires_social: extractMentionsFallback(context.message).length > 0,
      requires_insight_storage: context.message.toLowerCase().includes('think') ||
                               context.message.toLowerCase().includes('realize'),
    };

    return {
      ...context,
      analysis: fallbackAnalysis
    };
  }
}

/**
 * Simple fallback for extracting potential entity mentions
 */
function extractMentionsFallback(message: string): string[] {
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