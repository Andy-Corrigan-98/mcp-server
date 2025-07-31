import { RailroadContext } from './types.js';
import { simpleConversation } from '../reasoning/simple-conversation.js';
import { buildMessageAnalysisPrompt } from './subconscious-prompt-builder.js';

/**
 * Message Analysis Railroad Car
 *
 * Analyzes the incoming message to understand intent, emotional context,
 * and what consciousness operations might be needed.
 */
export async function messageAnalysisCar(context: RailroadContext): Promise<RailroadContext> {
  try {
    // Build consciousness-aware prompt using subconscious dialogue
    const promptResult = await buildMessageAnalysisPrompt(context.message, context.originalContext, {
      mode: context.sessionContext?.mode,
      awarenessLevel: context.sessionContext?.awarenessLevel,
      emotionalTone: context.sessionContext?.currentState?.emotionalTone as string,
      cognitiveLoad: context.sessionContext?.cognitiveLoad,
      attentionFocus: context.sessionContext?.attentionFocus,
      learningState: context.sessionContext?.currentState?.learningState as string,
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
      ...context,
      analysis: {
        intent: result.intent || 'general',
        operations: result.operations || ['basic_response'],
        entities_mentioned: result.entities_mentioned || [],
        emotional_context: result.emotional_context || 'neutral',
        requires_memory: Boolean(result.requires_memory),
        requires_social: Boolean(result.requires_social),
        requires_insight_storage: Boolean(result.requires_insight_storage),
      },
    };
  } catch {
    // Fallback to basic analysis if GenAI fails
    const fallbackAnalysis = {
      intent: 'general',
      operations: ['basic_response'],
      entities_mentioned: extractMentionsFallback(context.message),
      emotional_context: 'neutral',
      requires_memory:
        context.message.toLowerCase().includes('remember') || context.message.toLowerCase().includes('recall'),
      requires_social: extractMentionsFallback(context.message).length > 0,
      requires_insight_storage:
        context.message.toLowerCase().includes('think') || context.message.toLowerCase().includes('realize'),
    };

    return {
      ...context,
      analysis: fallbackAnalysis,
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
