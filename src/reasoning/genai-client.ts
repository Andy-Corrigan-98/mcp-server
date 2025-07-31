import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigurationService } from '../../core/db/configuration-service.js';

/**
 * Interface for GenAI model with proper typing
 */
export interface GenAIModel {
  generateContent: (prompt: string) => Promise<{ response: { text: () => string } }>;
}

/**
 * Shared GenAI client management
 * Single responsibility: Initialize and manage Google GenAI connections
 */
export class GenAIClient {
  private static instance: GenAIClient | null = null;
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenAIModel | null = null;
  private configService: ConfigurationService;
  private initialized = false;

  private constructor() {
    this.configService = ConfigurationService.getInstance();
  }

  /**
   * Get singleton instance of GenAI client
   */
  static getInstance(): GenAIClient {
    if (!GenAIClient.instance) {
      GenAIClient.instance = new GenAIClient();
    }
    return GenAIClient.instance;
  }

  /**
   * Initialize Google GenAI client if not already initialized
   */
  async initialize(): Promise<void> {
    if (this.initialized && this.genAI && this.model) {
      return; // Already initialized
    }

    // Get API key from environment variable or configuration
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || (await this.configService.getString('genai.api_key', ''));

    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY environment variable is required');
    }

    // Get model name from configuration
    const modelName = await this.configService.getString('genai.model_name', 'gemini-2.5-flash');

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    this.initialized = true;
  }

  /**
   * Get the initialized model
   */
  async getModel(): Promise<GenAIModel> {
    await this.initialize();

    if (!this.model) {
      throw new Error('GenAI model not initialized');
    }

    return this.model;
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.genAI !== null && this.model !== null;
  }

  /**
   * Get current model name from configuration
   */
  async getModelName(): Promise<string> {
    return await this.configService.getString('genai.model_name', 'gemini-2.5-flash');
  }

  /**
   * Reset client (useful for testing or configuration changes)
   */
  reset(): void {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
  }
}

/**
 * Functional wrapper for easier use in functional modules
 */
export const getGenAIModel = async (): Promise<GenAIModel> => {
  const client = GenAIClient.getInstance();
  return await client.getModel();
};

export const getModelName = async (): Promise<string> => {
  const client = GenAIClient.getInstance();
  return await client.getModelName();
};








