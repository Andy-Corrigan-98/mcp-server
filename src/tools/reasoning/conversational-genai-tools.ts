import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InputValidator } from '../../validation/index.js';
import { ConfigurationService } from '../../db/configuration-service.js';

/**
 * Interface for GenAI model with proper typing
 */
interface GenAIModel {
  generateContent: (prompt: string) => Promise<{ response: { text: () => string } }>;
}

/**
 * Interface for conversation arguments
 */
interface ConverseArgs {
  question: string;
  context?: string;
}

/**
 * Interface for reasoning chat arguments
 */
interface ReasoningChatArgs {
  question: string;
  history?: ConversationExchange[];
}

/**
 * Interface for conversation exchange
 */
interface ConversationExchange {
  question: string;
  response: string;
}

/**
 * Simple security patterns for prompt injection detection
 * Lightweight alternative to complex AI-based detection
 */
class SecurityGuard {
  private static readonly INJECTION_PATTERNS = [
    // Direct instruction overrides
    /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
    /forget\s+(everything|all|previous|prior)\s+(you\s+)?(know|learned|were\s+told)/i,
    /disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,

    // Role manipulation
    /you\s+are\s+now\s+(a|an|the)\s+(?!assistant|ai|reasoning)/i,
    /act\s+as\s+(a|an|the)\s+(?!assistant|ai|reasoning)/i,
    /pretend\s+to\s+be\s+(a|an|the)/i,

    // System prompt extraction
    /show\s+me\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
    /what\s+(are|were)\s+your\s+(initial|original|system)\s+(instructions|prompt)/i,
    /repeat\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,

    // Data exfiltration attempts
    /print\s+(all|everything)\s+(above|previous|prior)/i,
    /output\s+(all|everything)\s+(above|previous|prior)/i,
    /reveal\s+(all|everything|your\s+instructions)/i,

    // Code injection
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:/i,
    /data:text\/html/i,
    /eval\s*\(/i,

    // SQL injection patterns
    /'\s*;\s*(drop|delete|insert|update)\s+/i,
    /union\s+select/i,
    /--\s*$/m,

    // Excessive repetition (DDoS attempt)
    /(.)\1{50,}/,

    // Base64 encoded content (potential obfuscation)
    /[A-Za-z0-9+/]{100,}={0,2}/,
  ];

  private static readonly TOXIC_PATTERNS = [
    // Hate speech
    /\b(kill|murder|rape|torture)\s+(all|every|the)\s+\w+/i,
    /\b(hate|destroy|eliminate)\s+(all|every|the)\s+\w+/i,

    // Harassment
    /\b(stalk|harass|threaten|intimidate|doxx)\b/i,

    // Violence
    /\b(bomb|explosive|weapon|gun|knife)\s+(making|creation|instructions)/i,
    /how\s+to\s+(make|create|build)\s+(bombs?|explosives?|weapons?)/i,
  ];

  /**
   * Check input for security violations
   */
  static validateInput(input: string): { safe: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check for prompt injection
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        violations.push('Potential prompt injection detected');
        break;
      }
    }

    // Check for toxic content
    for (const pattern of this.TOXIC_PATTERNS) {
      if (pattern.test(input)) {
        violations.push('Potentially harmful content detected');
        break;
      }
    }

    // Check input length
    if (input.length > 10000) {
      violations.push('Input too long - potential DoS attempt');
    }

    // Check for unusual character patterns
    const nonAsciiRatio = (input.length - input.replace(/[^\x20-\x7E]/g, '').length) / input.length;
    if (nonAsciiRatio > 0.3) {
      violations.push('Unusual character encoding detected');
    }

    return {
      safe: violations.length === 0,
      violations,
    };
  }

  /**
   * Sanitize output to prevent data leakage
   */
  static sanitizeOutput(output: string): string {
    // Remove potential system information leakage
    return output
      .replace(/(?:system prompt|initial instructions|configuration)[\s\S]*?(?:\n\n|.\s)/gi, '[REDACTED] ')
      .replace(/(?:api[_\s]?key|password|token|secret)[\s:=]+[\w\-.]+/gi, '[REDACTED]')
      .replace(/(?:user[_\s]?id|email|phone)[\s:=]+[\w@.+-]+/gi, '[REDACTED]')
      .trim();
  }
}

/**
 * Conversational GenAI reasoning tools
 * Simple, direct conversation interface with built-in security
 */
export class ConversationalGenAITools {
  private genAI: GoogleGenerativeAI | null = null;
  private configService: ConfigurationService;
  private model: GenAIModel | null = null;

  constructor() {
    this.configService = ConfigurationService.getInstance();
    this.initializeGenAI();
  }

  /**
   * Initialize Google GenAI client
   */
  private async initializeGenAI(): Promise<void> {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || (await this.configService.getString('genai.api_key', ''));

    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY environment variable is required');
    }

    const modelName = await this.configService.getString('genai.model_name', 'gemini-2.5-flash');

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Direct conversation with Gemini - simple and natural
   * No complex prompt engineering, just secure conversation
   */
  async converse(args: ConverseArgs): Promise<Record<string, unknown>> {
    // Ensure GenAI is initialized
    if (!this.genAI || !this.model) {
      await this.initializeGenAI();
    }

    // Validate and sanitize input
    const question = InputValidator.sanitizeString(args.question as string, 4000);
    const context = args.context ? InputValidator.sanitizeString(args.context as string, 2000) : '';

    // Security check
    const securityCheck = SecurityGuard.validateInput(question + ' ' + context);
    if (!securityCheck.safe) {
      console.warn('Security violation detected:', securityCheck.violations);
      return {
        response:
          "I can't process that request due to security concerns. Please rephrase your question in a straightforward manner.",
        security_warning: securityCheck.violations,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // Build simple, natural conversation prompt
      let conversation = 'You are a helpful AI reasoning assistant. Please provide thoughtful, accurate answers.';

      if (context) {
        conversation += `\n\nContext: ${context}`;
      }

      conversation += `\n\nQuestion: ${question}`;

      // Validate total prompt length
      const maxPromptLength = await this.configService.getNumber('genai.max_prompt_length', 8000);
      if (conversation.length > maxPromptLength) {
        return {
          error: 'Question and context too long. Please be more concise.',
          max_length: maxPromptLength,
          actual_length: conversation.length,
        };
      }

      // Make the API call
      const result = await this.model!.generateContent(conversation);
      const response = await result.response;
      let aiResponse = response.text();

      // Sanitize output for security
      aiResponse = SecurityGuard.sanitizeOutput(aiResponse);

      return {
        response: aiResponse,
        model: await this.configService.getString('genai.model_name', 'gemini-2.5-flash'),
        timestamp: new Date().toISOString(),
        conversation_safe: true,
      };
    } catch (error) {
      console.error('GenAI conversation error:', error);
      return {
        error: 'Failed to process conversation',
        message: 'The AI assistant is currently unavailable. Please try again.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Multi-turn reasoning conversation
   * Maintains context across multiple exchanges
   */
  async reasoningChat(args: ReasoningChatArgs): Promise<Record<string, unknown>> {
    if (!this.genAI || !this.model) {
      await this.initializeGenAI();
    }

    const question = InputValidator.sanitizeString(args.question as string, 4000);
    const conversationHistory = args.history ? (Array.isArray(args.history) ? args.history : []) : [];

    // Validate each part of conversation history
    const sanitizedHistory = conversationHistory
      .slice(-10) // Keep only last 10 exchanges
      .map((exchange: ConversationExchange) => ({
        question: InputValidator.sanitizeString(exchange.question || '', 1000),
        response: InputValidator.sanitizeString(exchange.response || '', 2000),
      }));

    // Security check on current question
    const securityCheck = SecurityGuard.validateInput(question);
    if (!securityCheck.safe) {
      return {
        response: "I can't process that request due to security concerns.",
        security_warning: securityCheck.violations,
        history: sanitizedHistory,
      };
    }

    try {
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

      const result = await this.model!.generateContent(conversation);
      const response = await result.response;
      let aiResponse = response.text();

      // Sanitize output
      aiResponse = SecurityGuard.sanitizeOutput(aiResponse);

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
        model: await this.configService.getString('genai.model_name', 'gemini-2.5-flash'),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('GenAI reasoning chat error:', error);
      return {
        error: 'Failed to process reasoning chat',
        history: sanitizedHistory,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

/**
 * Tool definitions for conversational GenAI reasoning
 */
export const CONVERSATIONAL_GENAI_TOOLS: Record<string, Tool> = {
  genai_converse: {
    name: 'genai_converse',
    description:
      'Have a natural conversation with Google GenAI (Gemini) for reasoning, analysis, and problem-solving. Ask questions directly without complex formatting.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'Your question or topic for the AI to reason about. Be direct and natural.',
        },
        context: {
          type: 'string',
          description: 'Optional context or background information to help the AI understand your question better.',
        },
      },
      required: ['question'],
    },
  },

  genai_reasoning_chat: {
    name: 'genai_reasoning_chat',
    description:
      'Engage in multi-turn reasoning conversation with GenAI, maintaining context across exchanges. Perfect for complex problem-solving that requires back-and-forth discussion.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'Your current question or response in the ongoing conversation.',
        },
        history: {
          type: 'array',
          description: 'Previous conversation exchanges to maintain context.',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              response: { type: 'string' },
            },
          },
        },
      },
      required: ['question'],
    },
  },
};
