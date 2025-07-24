/**
 * GenAI Client Module
 * Handles Google GenAI client initialization and configuration
 * Extracted from ConversationalGenAITools for reusability
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigurationService } from '../../../db/configuration-service.js';

// Constants to avoid magic numbers
const DEFAULT_MAX_PROMPT_LENGTH = 8000;
const DEFAULT_RESPONSE_TIMEOUT_MS = 30000;

/**
 * Interface for GenAI model with proper typing
 */
export interface GenAIModel {
  generateContent: (prompt: string) => Promise<{ response: { text: () => string } }>;
}

/**
 * GenAI client configuration
 */
export interface GenAIClientConfig {
  apiKey: string;
  modelName: string;
  maxPromptLength: number;
  responseTimeoutMs: number;
}

/**
 * Initialize Google GenAI client with configuration
 */
export async function initializeGenAIClient(): Promise<{
  client: GoogleGenerativeAI;
  model: GenAIModel;
  config: GenAIClientConfig;
}> {
  const configService = ConfigurationService.getInstance();

  const apiKey = process.env.GOOGLE_GENAI_API_KEY || (await configService.getString('genai.api_key', ''));

  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY environment variable is required for GenAI functionality');
  }

  const config: GenAIClientConfig = {
    apiKey,
    modelName: await configService.getString('genai.model_name', 'gemini-2.5-flash'),
    maxPromptLength: await configService.getNumber('genai.max_prompt_length', DEFAULT_MAX_PROMPT_LENGTH),
    responseTimeoutMs: await configService.getNumber('genai.response_timeout_ms', DEFAULT_RESPONSE_TIMEOUT_MS),
  };

  const client = new GoogleGenerativeAI(config.apiKey);
  const model = client.getGenerativeModel({ model: config.modelName });

  return { client, model, config };
}

/**
 * Validate prompt length against configuration
 */
export function validatePromptLength(
  prompt: string,
  maxLength: number
): {
  valid: boolean;
  length: number;
  maxLength: number;
} {
  return {
    valid: prompt.length <= maxLength,
    length: prompt.length,
    maxLength,
  };
}

/**
 * Handle GenAI API errors with consistent formatting
 */
export function handleGenAIError(error: unknown, operation: string): Record<string, unknown> {
  console.error(`GenAI ${operation} error:`, error);

  return {
    error: `Failed to ${operation}`,
    message: 'The AI assistant is currently unavailable. Please try again.',
    timestamp: new Date().toISOString(),
    operation,
  };
}
