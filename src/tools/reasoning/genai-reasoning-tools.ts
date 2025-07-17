import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InputValidator } from '../../validation/index.js';
import { ConfigurationService } from '../../db/configuration-service.js';

/**
 * Google GenAI-powered reasoning tools
 * Replaces complex TypeScript logic with AI-powered reasoning via Google's Gemini
 */
export class GenAIReasoningTools {
  private static readonly DEFAULT_CONFIDENCE = 0.5;
  private static readonly MAX_THOUGHT_LENGTH = 4000;
  private static readonly MAX_PROMPT_LENGTH = 8000;
  private static readonly MIN_THOUGHT_LENGTH = 100;
  private static readonly PROMPT_RESERVED_LENGTH = 1000;

  private genAI: GoogleGenerativeAI | null = null;
  private configService: ConfigurationService;
  private model: { generateContent: (prompt: string) => Promise<{ response: { text: () => string } }> } | null = null;

  constructor() {
    this.configService = ConfigurationService.getInstance();
    this.initializeGenAI();
  }

  /**
   * Initialize Google GenAI client
   */
  private async initializeGenAI(): Promise<void> {
    // Get API key from environment variable or configuration
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || (await this.configService.getString('genai.api_key', ''));

    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY environment variable is required');
    }

    // Get model name from configuration
    const modelName = await this.configService.getString('genai.model_name', 'gemini-2.5-flash');

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Enhanced sequential thinking powered by Google GenAI
   * Replaces complex TypeScript branching/session logic with AI reasoning
   */
  async sequentialThinking(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Ensure GenAI is initialized
    if (!this.genAI || !this.model) {
      await this.initializeGenAI();
    }

    // Validate input
    const thought = InputValidator.sanitizeString(args.thought as string, GenAIReasoningTools.MAX_THOUGHT_LENGTH);
    const thoughtNumber = this.validateNumber(args.thought_number as number, 1);
    const totalThoughts = this.validateNumber(args.total_thoughts as number, 1);
    const nextThoughtNeeded = Boolean(args.next_thought_needed);
    const isRevision = Boolean(args.is_revision) || false;
    const branchId = args.branch_id ? String(args.branch_id) : undefined;

    // Build context-aware prompt for Gemini
    const prompt = await this.buildReasoningPrompt({
      thought,
      thoughtNumber,
      totalThoughts,
      nextThoughtNeeded,
      isRevision,
      branchId,
      revisesThought: args.revises_thought,
      branchFromThought: args.branch_from_thought,
    });

    // Validate prompt length against configuration
    const maxPromptLength = await this.configService.getNumber(
      'genai.max_prompt_length',
      GenAIReasoningTools.MAX_PROMPT_LENGTH
    );
    if (prompt.length > maxPromptLength) {
      console.warn(`GenAI prompt length (${prompt.length}) exceeds max (${maxPromptLength}), truncating...`);
      return this.parseReasoningResponse(
        `Analysis truncated due to length. Original thought was ${thought.length} characters.`,
        { thoughtNumber, totalThoughts, nextThoughtNeeded, branchId }
      );
    }

    try {
      // Let Google's AI do the complex reasoning
      if (!this.model) {
        throw new Error('Model not initialized');
      }
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const reasoningOutput = response.text();

      // Parse AI response into structured format
      return this.parseReasoningResponse(reasoningOutput, {
        thoughtNumber,
        totalThoughts,
        nextThoughtNeeded,
        branchId,
      });
    } catch (error) {
      console.error('GenAI reasoning error:', error);
      return {
        error: 'Failed to generate AI reasoning',
        thoughtNumber,
        totalThoughts,
        nextThoughtNeeded: false,
      };
    }
  }

  /**
   * Build sophisticated reasoning prompt for Gemini
   */
  private async buildReasoningPrompt(context: Record<string, unknown>): Promise<string> {
    const {
      thought,
      thoughtNumber,
      totalThoughts,
      nextThoughtNeeded,
      isRevision,
      branchId,
      revisesThought,
      branchFromThought,
    } = context;

    const prompt = `You are an advanced reasoning system. Analyze this problem step-by-step with deep thinking.

CURRENT THINKING STEP: ${thoughtNumber} of ${totalThoughts}
${isRevision ? `REVISION: This revises thinking step ${revisesThought}` : ''}
${branchId ? `BRANCH: Exploring alternative path "${branchId}" from step ${branchFromThought}` : ''}

PROBLEM/THOUGHT TO ANALYZE:
${thought}

REASONING REQUIREMENTS:
1. Provide deep, structured analysis of this thinking step
2. Generate insights about the problem and potential solutions
3. Identify patterns, connections, and underlying principles
4. ${nextThoughtNeeded ? 'Suggest what the next thinking step should focus on' : 'Provide conclusive analysis and recommendations'}
5. Consider alternative approaches and potential pitfalls
6. Extract key hypotheses that can be tested or verified

RESPONSE FORMAT:
Please structure your response as JSON with these fields:
{
  "analysis": "Deep analysis of the current thinking step",
  "insights": ["List of key insights discovered"],
  "hypothesis": "Primary hypothesis or theory emerging",
  "verification": "How this hypothesis could be tested/verified", 
  "nextSteps": ["Specific recommendations for next steps"],
  "alternatives": ["Alternative approaches to consider"],
  "conclusion": "Summary conclusion and recommendations",
  "confidence": 0.85
}

Think deeply and provide sophisticated reasoning:`;

    return prompt;
  }

  /**
   * Parse AI reasoning response into structured format
   */
  private parseReasoningResponse(aiOutput: string, context: Record<string, unknown>): Record<string, unknown> {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiOutput.match(/\{[\s\S]*\}/);
      const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        thoughtNumber: context.thoughtNumber,
        totalThoughts: context.totalThoughts,
        nextThoughtNeeded: context.nextThoughtNeeded,
        branchId: context.branchId,

        // AI-generated reasoning content
        analysis: parsedResponse.analysis || 'AI analysis not parsed correctly',
        insights: parsedResponse.insights || [],
        hypothesis: parsedResponse.hypothesis || 'No hypothesis identified',
        verification: parsedResponse.verification || 'Verification method unclear',
        nextSteps: parsedResponse.nextSteps || [],
        alternatives: parsedResponse.alternatives || [],
        conclusion: parsedResponse.conclusion || 'Analysis incomplete',
        confidence: parsedResponse.confidence || GenAIReasoningTools.DEFAULT_CONFIDENCE,

        // Metadata
        aiPowered: true,
        timestamp: new Date().toISOString(),
        model: 'gemini-2.5-flash',
      };
    } catch {
      // Fallback if JSON parsing fails
      return {
        thoughtNumber: context.thoughtNumber,
        totalThoughts: context.totalThoughts,
        nextThoughtNeeded: context.nextThoughtNeeded,
        analysis: aiOutput,
        insights: ['AI reasoning generated but not structured'],
        conclusion: 'Reasoning completed via AI model',
        aiPowered: true,
        parsingError: true,
      };
    }
  }

  private validateNumber(value: number, min: number): number {
    if (typeof value !== 'number' || value < min || !Number.isInteger(value)) {
      throw new Error(`Invalid number: must be integer >= ${min}`);
    }
    return value;
  }
}

/**
 * Tool definition for GenAI-powered sequential thinking
 */
export const GENAI_REASONING_TOOLS: Record<string, Tool> = {
  sequential_thinking: {
    name: 'sequential_thinking',
    description:
      'Advanced AI-powered reasoning system using Google GenAI for sophisticated problem-solving, analysis, and step-by-step thinking. Much more powerful than traditional algorithmic reasoning.',
    inputSchema: {
      type: 'object',
      properties: {
        thought: {
          type: 'string',
          description: 'The problem, question, or thinking step to analyze with AI reasoning',
        },
        next_thought_needed: {
          type: 'boolean',
          description: 'Whether another thought step is needed after this one',
        },
        thought_number: {
          type: 'integer',
          description: 'Current thought step number',
          minimum: 1,
        },
        total_thoughts: {
          type: 'integer',
          description: 'Estimated total thought steps needed',
          minimum: 1,
        },
        is_revision: {
          type: 'boolean',
          description: 'Whether this revises previous thinking',
          default: false,
        },
        revises_thought: {
          type: 'integer',
          description: 'Which thought number is being reconsidered',
          minimum: 1,
        },
        branch_from_thought: {
          type: 'integer',
          description: 'Branching point thought number for alternative reasoning paths',
          minimum: 1,
        },
        branch_id: {
          type: 'string',
          description: 'Identifier for this reasoning branch',
        },
        needs_more_thoughts: {
          type: 'boolean',
          description: 'Whether additional analysis beyond current estimate is needed',
          default: false,
        },
      },
      required: ['thought', 'next_thought_needed', 'thought_number', 'total_thoughts'],
    },
  },
};
