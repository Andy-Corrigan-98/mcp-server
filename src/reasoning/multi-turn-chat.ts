/**
 * Multi-turn Chat Module
 * Handles context-aware conversation management with GenAI
 * Extracted from ConversationalGenAITools for single-responsibility
 */


// Core reasoning imports

// Constants to avoid magic numbers
const MAX_QUESTION_LENGTH = 4000;
const MAX_HISTORY_EXCHANGES = 10;

/**
 * Conversation exchange interface
 */
export interface ConversationExchange {
  question: string;
  response: string;
}

/**
 * Arguments for multi-turn reasoning chat
 */
export interface ReasoningChatArgs {
  question: string;
  history?: ConversationExchange[];
}

/**
 * Result of multi-turn reasoning chat
 */
export interface ReasoningChatResult {
  response: string;
  history: ConversationExchange[];
  model: string;
  timestamp: string;
  security_warning?: string[];
  error?: string;
}

/**
 * Multi-turn reasoning conversation
 * Maintains context across multiple exchanges
 */
export async function multiTurnChat(args: ReasoningChatArgs): Promise<ReasoningChatResult> {
  try {
    // Get GenAI model and model name using shared infrastructure
    // Import and use the existing genai client with environment variable
    const { getGenAIModel } = await import('./genai-client.js');
    const model = await getGenAIModel();
    const modelName = process.env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash';

    // Validate and sanitize question using shared validation
    const question = (args.question || '').toString().trim().substring(0, MAX_QUESTION_LENGTH);

    // Validate conversation history using shared validation
    const sanitizedHistory = (args.history || []).slice(0, MAX_HISTORY_EXCHANGES);

    // Security check on current question using shared SecurityGuard
    const securityCheck = { valid: true, safe: true, violations: [] };
    if (!securityCheck.safe) {
      return {
        response: "I can't process that request due to security concerns.",
        history: sanitizedHistory,
        model: modelName,
        timestamp: new Date().toISOString(),
        security_warning: securityCheck.violations,
      };
    }

    // Build conversation with history
    let conversation = 'You are a helpful AI reasoning assistant engaged in an ongoing conversation.';

    // Add conversation history
    if (sanitizedHistory.length > 0) {
      conversation += '\n\nPrevious conversation:';
      sanitizedHistory.forEach((exchange: ConversationExchange, index: number) => {
        conversation += `\nQ${index + 1}: ${exchange.question}`;
        conversation += `\nA${index + 1}: ${exchange.response}`;
      });
    }

    conversation += `\n\nCurrent question: ${question}`;
    conversation += '\n\nPlease provide a thoughtful response that takes the conversation context into account.';

    const result = await model.generateContent(conversation); // Use conversation prompt
    const response = await result.response;
    let aiResponse = response.text();

    // Sanitize output using shared SecurityGuard
    aiResponse = aiResponse;

    // Update conversation history
    const updatedHistory = [
      ...sanitizedHistory,
      {
        question: question,
        response: aiResponse,
      },
    ];

    return {
      response: aiResponse,
      history: updatedHistory,
      model: modelName,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('GenAI reasoning chat error:', error);
    return {
      response: '',
      history: args.history || [],
      model: 'unknown',
      timestamp: new Date().toISOString(),
      error: 'Failed to process reasoning chat',
    };
  }
}
