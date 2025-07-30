import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { simpleConversation } from '../../features/reasoning/conversation/simple-conversation.js';

// Import all feature modules
import * as consciousness from '../../features/consciousness/index.js';
import * as memory from '../../features/memory/index.js';
import * as social from '../../features/social/index.js';

// Import new railroad pattern
import { 
  processConsciousnessContext, 
  extractResponseContext, 
  getPersonalityContext 
} from '../../features/consciousness/railroad/index.js';

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
 * 
 * @deprecated This function is deprecated in favor of the railroad pattern's message-analysis car.
 * The railroad pattern provides more consistent and traceable analysis.
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
 * Route to appropriate consciousness operations using railroad pattern
 * 
 * @deprecated This function now uses the railroad pattern instead of scattered operations.
 * Consider using processMessageWithRailroad directly for new implementations.
 */
async function executeConsciousnessOperations(
  message: string,
  analysis: Awaited<ReturnType<typeof analyzeMessage>>,
  context?: string
): Promise<MessageProcessorResult> {
  
  // Use the new railroad pattern instead of scattered operations
  const railroadResult = await processConsciousnessContext(
    message,
    context,
    'default' // Use default railroad configuration
  );
  
  // Extract context for response generation using railroad pattern
  const responseContext = extractResponseContext(railroadResult);
  const personalityContext = getPersonalityContext(railroadResult);
  
  // Generate response using enriched railroad context
  let response: string;
  try {
    const conversationResponse = await simpleConversation({
      question: message,
      context: `
Railroad Context:
${responseContext}

Personality Guidance:
- Communication tone: ${personalityContext.communicationTone}
- Vocabulary style: ${personalityContext.vocabularyStyle}
- Confidence level: ${personalityContext.confidenceLevel}
${personalityContext.relationshipContext ? `- Relationship: ${personalityContext.relationshipContext}` : ''}
${personalityContext.memoryContext ? `- Memory context: ${personalityContext.memoryContext}` : ''}

${context ? `\nAdditional context: ${context}` : ''}
      `.trim(),
    });
    response = conversationResponse.response;
  } catch {
    response = "I understand what you're saying. Let me process this thoughtfully.";
  }

  // Convert railroad results back to legacy format for compatibility
  return {
    response,
    operations_performed: railroadResult.context.operations.performed,
    consciousness_updates: railroadResult.context.operations.consciousness_updates,
    insights_generated: railroadResult.context.operations.insights_generated,
    memories_accessed: railroadResult.context.operations.memories_accessed,
    social_interactions: railroadResult.context.operations.social_interactions,
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
Process a message through the consciousness system using the railroad pattern for traceable personality context building.

🚂 RAILROAD PATTERN MIGRATION: This tool now uses the new railroad pattern internally, providing:
- Traceable execution through consciousness pipeline cars
- Comprehensive error handling with graceful degradation  
- Rich debugging information via execution traces
- Predictable personality context building
- Better testability and maintainability

The tool automatically:
- Analyzes message intent and emotional context
- Routes through consciousness railroad cars (session → memory → social → personality)
- Records social interactions when people are mentioned  
- Retrieves relevant memories when needed
- Stores insights for reflective content
- Updates session state with personality metrics
- Generates responses with consistent personality context

Much more reliable and debuggable than the previous scattered operations approach.
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
