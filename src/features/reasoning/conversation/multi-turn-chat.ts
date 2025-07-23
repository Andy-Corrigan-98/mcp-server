/**
 * Multi-turn Chat Module
 * Handles context-aware conversation management with GenAI
 * Extracted from ConversationalGenAITools for single-responsibility
 */

import { InputValidator } from '../../../validation/index.js';
import { validateInput, sanitizeOutput } from '../security/index.js';
import { initializeGenAIClient, handleGenAIError } from '../client/index.js';

// Constants to avoid magic numbers
const MAX_QUESTION_LENGTH = 4000;
const MAX_HISTORY_EXCHANGES = 10;
const MAX_HISTORY_QUESTION_LENGTH = 1000;
const MAX_HISTORY_RESPONSE_LENGTH = 2000;

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
    // Initialize GenAI client
    const { model, config } = await initializeGenAIClient();

    const question = InputValidator.sanitizeString(args.question, MAX_QUESTION_LENGTH);
    const conversationHistory = args.history ? (Array.isArray(args.history) ? args.history : []) : [];

    // Validate each part of conversation history
    const sanitizedHistory = conversationHistory
      .slice(-MAX_HISTORY_EXCHANGES) // Keep only last exchanges to manage context length
      .map((exchange: ConversationExchange) => ({
        question: InputValidator.sanitizeString(exchange.question || '', MAX_HISTORY_QUESTION_LENGTH),
        response: InputValidator.sanitizeString(exchange.response || '', MAX_HISTORY_RESPONSE_LENGTH),
      }));

    // Security check on current question
    const securityCheck = validateInput(question);
    if (!securityCheck.safe) {
      return {
        response: "I can't process that request due to security concerns.",
        history: sanitizedHistory,
        model: config.modelName,
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

    const result = await model.generateContent(conversation);
    const response = await result.response;
    let aiResponse = response.text();

    // Sanitize output
    aiResponse = sanitizeOutput(aiResponse);

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
      model: config.modelName,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorResult = handleGenAIError(error, 'process reasoning chat');
    return {
      response: '',
      history: args.history || [],
      model: 'unknown',
      timestamp: new Date().toISOString(),
      ...errorResult,
    };
  }
} 