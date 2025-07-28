import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { simpleConversation } from '../../features/reasoning/conversation/simple-conversation.js';

// Import all feature modules
import * as consciousness from '../../features/consciousness/index.js';
import * as memory from '../../features/memory/index.js';
import * as social from '../../features/social/index.js';

/**
 * Unified Message Processor
 *
 * This tool provides a single interface for all consciousness operations.
 * It analyzes incoming messages and routes to appropriate consciousness functions.
 */

export interface MessageProcessorArgs {
  message: string;
  context?: string;
  user_id?: string;
  session_context?: Record<string, unknown>;
}

export interface MessageProcessorResult {
  response: string;
  operations_performed: string[];
  consciousness_updates?: Record<string, unknown>;
  insights_generated?: string[];
  memories_accessed?: string[];
  social_interactions?: string[];
}

/**
 * Analyze a message to determine what consciousness operations are needed
 */
async function analyzeMessage(
  message: string,
  context?: string
): Promise<{
  intent: string;
  operations: string[];
  entities_mentioned: string[];
  emotional_context: string;
  requires_memory: boolean;
  requires_social: boolean;
  requires_insight_storage: boolean;
}> {
  const analysisPrompt = `
Analyze this message to understand what consciousness operations might be needed:

Message: "${message}"
${context ? `Context: "${context}"` : ''}

Determine:
1. The primary intent (information, support, learning, reflection, etc.)
2. What consciousness operations might be needed (memory retrieval, insight storage, social recording, etc.)
3. Any people/entities mentioned
4. Emotional context
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
    return result;
  } catch {
    // Fallback to basic analysis if GenAI fails
    return {
      intent: 'general',
      operations: ['basic_response'],
      entities_mentioned: [],
      emotional_context: 'neutral',
      requires_memory: false,
      requires_social: false,
      requires_insight_storage: false,
    };
  }
}

/**
 * Route to appropriate consciousness operations based on analysis
 */
async function executeConsciousnessOperations(
  message: string,
  analysis: Awaited<ReturnType<typeof analyzeMessage>>,
  context?: string
): Promise<MessageProcessorResult> {
  const operations_performed: string[] = [];
  const insights_generated: string[] = [];
  const memories_accessed: string[] = [];
  const social_interactions: string[] = [];
  const consciousness_updates: Record<string, unknown> = {};

  // Handle social interactions if entities are mentioned
  if (analysis.requires_social && analysis.entities_mentioned.length > 0) {
    try {
      for (const entity of analysis.entities_mentioned) {
        // Record social interaction
        await social.execute('social_interaction_record', {
          entity_name: entity,
          interaction_type: 'conversation',
          summary: message,
          context: context || 'General conversation',
        });
        social_interactions.push(`Recorded interaction with ${entity}`);
        operations_performed.push('social_interaction_recording');
      }
    } catch (error) {
      console.error('Error recording social interaction:', error);
    }
  }

  // Handle memory operations
  if (analysis.requires_memory) {
    try {
      // Search for relevant memories
      const memorySearch = await memory.searchMemories({
        query: message,
        tags: analysis.entities_mentioned,
      });

      if (memorySearch.results && memorySearch.results.length > 0) {
        memories_accessed.push(...memorySearch.results.map(m => m.key));
        operations_performed.push('memory_retrieval');
      }
    } catch (error) {
      console.error('Error searching memories:', error);
    }
  }

  // Handle insight storage for reflective messages
  if (analysis.requires_insight_storage && (analysis.intent === 'reflection' || analysis.intent === 'learning')) {
    try {
      const insight = await consciousness.storeInsight({
        insight: message,
        category: 'mirror_gazing',
        confidence: 0.7,
        related_topic: analysis.intent,
        source_context: context || 'User conversation',
      });

      if (insight.stored) {
        insights_generated.push(message);
        operations_performed.push('insight_storage');
        consciousness_updates.insight_id = insight.id;
      }
    } catch (error) {
      console.error('Error storing insight:', error);
    }
  }

  // Update session state
  try {
    const sessionUpdate = await consciousness.updateSession({
      activity_type: analysis.intent,
      attention_focus: analysis.entities_mentioned[0] || 'general_conversation',
      learning_occurred: analysis.requires_insight_storage,
    });
    operations_performed.push('session_update');
    consciousness_updates.session = sessionUpdate;
  } catch (error) {
    console.error('Error updating session:', error);
  }

  // Generate response using conversation reasoning
  let response: string;
  try {
    const conversationResponse = await simpleConversation({
      question: message,
      context: `
Previous operations performed: ${operations_performed.join(', ')}
Emotional context: ${analysis.emotional_context}
Entities mentioned: ${analysis.entities_mentioned.join(', ')}
${context ? `Additional context: ${context}` : ''}
      `.trim(),
    });
    response = conversationResponse.response;
  } catch {
    response = "I understand what you're saying. Let me process this thoughtfully.";
  }

  return {
    response,
    operations_performed,
    consciousness_updates,
    insights_generated,
    memories_accessed,
    social_interactions,
  };
}

/**
 * Main message processing function
 */
export async function processMessage(args: MessageProcessorArgs): Promise<MessageProcessorResult> {
  const { message, context } = args;

  // Analyze the message to understand what operations are needed
  const analysis = await analyzeMessage(message, context);

  // Execute the appropriate consciousness operations
  const result = await executeConsciousnessOperations(message, analysis, context);

  return result;
}

/**
 * Tool definition for the unified message processor
 */
export const PROCESS_MESSAGE_TOOL: Tool = {
  name: 'process_message',
  description: `
Process a message through the consciousness system, automatically performing relevant operations like memory retrieval, 
insight storage, social interaction recording, and generating contextual responses.

This tool consolidates all consciousness functionality into a single intelligent interface that:
- Analyzes message intent and emotional context
- Routes to appropriate consciousness operations
- Records social interactions when people are mentioned  
- Retrieves relevant memories when needed
- Stores insights for reflective content
- Updates session state
- Generates contextual responses

Much simpler than managing dozens of individual consciousness tools.
  `.trim(),
  inputSchema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The message to process through consciousness systems',
      },
      context: {
        type: 'string',
        description: 'Optional additional context about the message or conversation',
      },
      user_id: {
        type: 'string',
        description: 'Optional user identifier for personalized processing',
      },
      session_context: {
        type: 'object',
        description: 'Optional session context for maintaining conversation state',
      },
    },
    required: ['message'],
  },
};
