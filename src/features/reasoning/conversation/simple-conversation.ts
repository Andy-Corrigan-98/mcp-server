/**
 * Simple Conversation Module
 * Handles direct Q&A interactions with GenAI
 * Extracted from ConversationalGenAITools for single-responsibility
 */

import { InputValidator } from '../../../validation/index.js';
import { validateInput, sanitizeOutput } from '../security/index.js';
import { initializeGenAIClient, validatePromptLength, handleGenAIError } from '../client/index.js';

// Constants to avoid magic numbers
const MAX_QUESTION_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 2000;

/**
 * Arguments for simple conversation
 */
export interface ConverseArgs {
  question: string;
  context?: string;
}

/**
 * Result of simple conversation
 */
export interface ConverseResult {
  response: string;
  model: string;
  timestamp: string;
  conversation_safe: boolean;
  security_warning?: string[];
  error?: string;
  max_length?: number;
  actual_length?: number;
}

/**
 * Direct conversation with Gemini - simple and natural
 * No complex prompt engineering, just secure conversation
 */
export async function simpleConversation(args: ConverseArgs): Promise<ConverseResult> {
  try {
    // Initialize GenAI client
    const { model, config } = await initializeGenAIClient();

    // Validate and sanitize input
    const question = InputValidator.sanitizeString(args.question, MAX_QUESTION_LENGTH);
    const context = args.context ? InputValidator.sanitizeString(args.context, MAX_CONTEXT_LENGTH) : '';

    // Security check
    const securityCheck = validateInput(question + ' ' + context);
    if (!securityCheck.safe) {
      console.warn('Security violation detected:', securityCheck.violations);
      return {
        response: "I can't process that request due to security concerns. Please rephrase your question in a straightforward manner.",
        model: config.modelName,
        timestamp: new Date().toISOString(),
        conversation_safe: false,
        security_warning: securityCheck.violations,
      };
    }

    // Build simple, natural conversation prompt
    let conversation = 'You are a helpful AI reasoning assistant. Please provide thoughtful, accurate answers.';

    if (context) {
      conversation += `\n\nContext: ${context}`;
    }

    conversation += `\n\nQuestion: ${question}`;

    // Validate prompt length
    const lengthCheck = validatePromptLength(conversation, config.maxPromptLength);
    if (!lengthCheck.valid) {
      return {
        response: '',
        model: config.modelName,
        timestamp: new Date().toISOString(),
        conversation_safe: true,
        error: 'Question and context too long. Please be more concise.',
        max_length: lengthCheck.maxLength,
        actual_length: lengthCheck.length,
      };
    }

    // Make the API call
    const result = await model.generateContent(conversation);
    const response = await result.response;
    let aiResponse = response.text();

    // Sanitize output for security
    aiResponse = sanitizeOutput(aiResponse);

    return {
      response: aiResponse,
      model: config.modelName,
      timestamp: new Date().toISOString(),
      conversation_safe: true,
    };
  } catch (error) {
    const errorResult = handleGenAIError(error, 'process conversation');
    return {
      response: '',
      model: 'unknown',
      timestamp: new Date().toISOString(),
      conversation_safe: true,
      ...errorResult,
    };
  }
} 