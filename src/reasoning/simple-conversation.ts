/**
 * Simple Conversation Module
 * Handles direct Q&A interactions with GenAI
 * Extracted from ConversationalGenAITools for single-responsibility
 */

import { getGenAIModel, getModelName } from './genai-client.js';
import { SecurityGuard } from './security-guard.js';
import { validateThoughtInput, validateContextInput, validatePromptLength } from './index.js';

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
    // Get GenAI model and model name using shared infrastructure
    const model = await getGenAIModel();
    const modelName = await getModelName();

    // Validate and sanitize input using shared validation
    const question = await validateThoughtInput(args.question, MAX_QUESTION_LENGTH);
    const context = args.context ? await validateContextInput(args.context, MAX_CONTEXT_LENGTH) : '';

    // Security check using shared SecurityGuard
    const securityCheck = SecurityGuard.validateInput(question + ' ' + context);
    if (!securityCheck.safe) {
      console.warn('Security violation detected:', securityCheck.violations);
      return {
        response:
          "I can't process that request due to security concerns. Please rephrase your question in a straightforward manner.",
        model: modelName,
        timestamp: new Date().toISOString(),
        conversation_safe: false,
        security_warning: securityCheck.violations,
      };
    }

    // Build consciousness-aware conversation prompt
    let conversation: string;

    // Detect if this is internal consciousness processing
    const isInternalProcess =
      context &&
      (context.includes('Internal consciousness') ||
        context.includes('consciousness analysis') ||
        context.includes('subconscious') ||
        context.includes('internal') ||
        context.includes('consciousness routing'));

    if (isInternalProcess) {
      conversation =
        'Acting as the subconscious reasoning layer of my consciousness, help process this internal dialogue:';
    } else {
      conversation = 'You are a helpful AI reasoning assistant. Please provide thoughtful, accurate answers.';
    }

    if (context) {
      conversation += `\n\nContext: ${context}`;
    }

    conversation += `\n\nQuestion: ${question}`;

    // Validate prompt length using shared validation
    const lengthCheck = await validatePromptLength(conversation);
    if (!lengthCheck.valid) {
      return {
        response: '',
        model: modelName,
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

    // Sanitize output for security using shared SecurityGuard
    aiResponse = SecurityGuard.sanitizeOutput(aiResponse);

    return {
      response: aiResponse,
      model: modelName,
      timestamp: new Date().toISOString(),
      conversation_safe: true,
    };
  } catch (error) {
    console.error('GenAI conversation error:', error);
    return {
      response: '',
      model: 'unknown',
      timestamp: new Date().toISOString(),
      conversation_safe: true,
      error: 'Failed to process conversation',
    };
  }
}
