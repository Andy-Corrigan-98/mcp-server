import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigurationService } from '../../db/configuration-service.js';
import { ConnectionHypothesis, ConnectionEvaluation } from './types.js';

/**
 * Google GenAI-powered daydreaming evaluation tools
 * Replaces random placeholder evaluation with intelligent AI assessment
 */
export class GenAIDaydreamingTools {
  private static readonly DEFAULT_SCORE = 0.5;
  private static readonly MAX_PROMPT_LENGTH = 8000;
  private static readonly DEFAULT_THRESHOLD = 0.6;
  private static readonly PLAUSIBILITY_THRESHOLD = 0.5;
  private static readonly QUARTER_DIVISOR = 4;
  private static readonly NOVELTY_MAX = 0.9;
  private static readonly NOVELTY_MULTIPLIER = 0.7;
  private static readonly NOVELTY_BASE = 0.2;
  private static readonly PLAUSIBILITY_MAX = 0.8;
  private static readonly PLAUSIBILITY_MULTIPLIER = 0.3;
  private static readonly VALUE_MAX = 0.8;
  private static readonly VALUE_DIVISOR = 50;
  private static readonly VALUE_MULTIPLIER = 0.6;
  private static readonly VALUE_BASE = 0.3;
  private static readonly ACTIONABILITY_MULTIPLIER = 0.4;
  private static readonly MIN_DISTANCE = 0.1;

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
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || 
                   await this.configService.getString('genai.api_key', '');
    
    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY environment variable is required for daydreaming evaluation');
    }

    // Get model name from configuration
    const modelName = await this.configService.getString('genai.model_name', 'gemini-2.5-flash');

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Intelligent evaluation of connection hypotheses using Gemini
   * Replaces the random number evaluation with actual AI assessment
   */
  async evaluateConnectionHypothesis(hypothesis: ConnectionHypothesis): Promise<ConnectionEvaluation> {
    // Ensure GenAI is initialized
    if (!this.genAI || !this.model) {
      await this.initializeGenAI();
    }

    try {
      // Build evaluation prompt for Gemini
      const prompt = await this.buildEvaluationPrompt(hypothesis);

      // Validate prompt length
      const maxPromptLength = await this.configService.getNumber('genai.max_prompt_length', GenAIDaydreamingTools.MAX_PROMPT_LENGTH);
      if (prompt.length > maxPromptLength) {
        console.warn(`GenAI evaluation prompt too long (${prompt.length}), using fallback evaluation`);
        return this.createFallbackEvaluation(hypothesis);
      }

      // Get AI evaluation
      if (!this.model) {
        throw new Error('Model not initialized');
      }
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const evaluationOutput = response.text();

      // Parse AI response into structured evaluation
      return await this.parseEvaluationResponse(evaluationOutput, hypothesis);

    } catch (error) {
      console.error('GenAI daydreaming evaluation error:', error);
      return this.createFallbackEvaluation(hypothesis);
    }
  }

  /**
   * Build sophisticated evaluation prompt for Gemini
   */
  private async buildEvaluationPrompt(
    hypothesis: ConnectionHypothesis
  ): Promise<string> {
    const { conceptPair, hypothesis: connectionHypothesis, explorationSteps } = hypothesis;

    const prompt = `You are an expert at evaluating creative insights and conceptual connections. Please analyze this connection hypothesis across four key dimensions.

CONNECTION TO EVALUATE:
Concept 1: "${conceptPair.concept1.entity}" (${conceptPair.concept1.type})
Concept 2: "${conceptPair.concept2.entity}" (${conceptPair.concept2.type})

Connection Hypothesis: ${connectionHypothesis}

Exploration Context: ${explorationSteps.join(' → ')}

EVALUATION CRITERIA:

1. NOVELTY (0.0-1.0): How unexpected, surprising, or original is this connection?
   - 0.0-0.3: Obvious, conventional, well-known connection
   - 0.4-0.6: Somewhat creative, has interesting aspects
   - 0.7-1.0: Highly original, surprising, breakthrough insight

2. PLAUSIBILITY (0.0-1.0): How logical, coherent, and well-reasoned is this connection?
   - 0.0-0.3: Illogical, contradictory, nonsensical
   - 0.4-0.6: Some logical basis, partially convincing
   - 0.7-1.0: Highly logical, well-reasoned, convincing

3. VALUE (0.0-1.0): How useful, interesting, or practically relevant is this insight?
   - 0.0-0.3: Not particularly useful or interesting
   - 0.4-0.6: Moderately interesting, some potential value
   - 0.7-1.0: Highly valuable, could lead to important insights

4. ACTIONABILITY (0.0-1.0): Does this connection suggest concrete next steps or applications?
   - 0.0-0.3: Abstract with no clear applications
   - 0.4-0.6: Some potential applications, needs development
   - 0.7-1.0: Clear actionable implications, ready to pursue

RESPONSE FORMAT:
Please respond with a JSON object containing your detailed evaluation:

{
  "novelty": 0.75,
  "novelty_explanation": "Why this score for novelty",
  "plausibility": 0.65,
  "plausibility_explanation": "Why this score for plausibility", 
  "value": 0.80,
  "value_explanation": "Why this score for value",
  "actionability": 0.55,
  "actionability_explanation": "Why this score for actionability",
  "overall_assessment": "Summary of the connection's strengths and weaknesses",
  "key_insights": ["Specific insights extracted from this connection"],
  "suggested_applications": ["Concrete ways this could be applied or explored"],
  "improvement_suggestions": ["How this connection could be strengthened"],
  "confidence": 0.85
}

Please provide thoughtful, nuanced evaluation based on the actual content:`;

    return prompt;
  }

  /**
   * Parse AI evaluation response into structured ConnectionEvaluation
   */
  private async parseEvaluationResponse(aiOutput: string, hypothesis: ConnectionHypothesis): Promise<ConnectionEvaluation> {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiOutput.match(/\{[\s\S]*\}/);
      const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      // Extract metrics with fallbacks
      const novelty = this.validateScore(parsedResponse.novelty, GenAIDaydreamingTools.DEFAULT_SCORE);
      const plausibility = this.validateScore(parsedResponse.plausibility, GenAIDaydreamingTools.DEFAULT_SCORE);
      const value = this.validateScore(parsedResponse.value, GenAIDaydreamingTools.DEFAULT_SCORE);
      const actionability = this.validateScore(parsedResponse.actionability, GenAIDaydreamingTools.DEFAULT_SCORE);

      // Calculate overall score
      const overallScore = (novelty + plausibility + value + actionability) / GenAIDaydreamingTools.QUARTER_DIVISOR;

      // Determine if should store based on thresholds
      const shouldStore = await this.shouldStoreInsight(novelty, plausibility, value);

      return {
        hypothesis,
        novelty,
        plausibility,
        value,
        actionability,
        overallScore,
        shouldStore,
        reason: parsedResponse.overall_assessment || 'AI evaluation completed',
        evaluatedAt: new Date(),
        
        // Additional AI insights
        genAIMetadata: {
          noveltyExplanation: parsedResponse.novelty_explanation || '',
          plausibilityExplanation: parsedResponse.plausibility_explanation || '',
          valueExplanation: parsedResponse.value_explanation || '',
          actionabilityExplanation: parsedResponse.actionability_explanation || '',
          keyInsights: parsedResponse.key_insights || [],
          suggestedApplications: parsedResponse.suggested_applications || [],
                      improvementSuggestions: parsedResponse.improvement_suggestions || [],
            aiConfidence: parsedResponse.confidence || GenAIDaydreamingTools.DEFAULT_SCORE,
            model: 'gemini-2.5-flash',
            evaluatedWithAI: true
        }
      };

    } catch (error) {
      console.error('Failed to parse GenAI evaluation response:', error);
      return this.createFallbackEvaluation(hypothesis);
    }
  }

  /**
   * Create fallback evaluation when AI evaluation fails
   */
  private createFallbackEvaluation(hypothesis: ConnectionHypothesis): ConnectionEvaluation {
    // Use basic heuristics as fallback instead of random numbers
    const wordCount = hypothesis.hypothesis.split(' ').length;
    const conceptDistance = this.estimateConceptDistance(
      hypothesis.conceptPair.concept1.entity,
      hypothesis.conceptPair.concept2.entity
    );

    // Basic heuristic scoring
    const novelty = Math.min(0.9, conceptDistance * 0.7 + 0.2); // Cross-domain = more novel
    const plausibility = Math.max(0.2, 0.8 - (conceptDistance * 0.3)); // Closer concepts = more plausible
    const value = Math.min(0.8, (wordCount / 50) * 0.6 + 0.3); // Longer hypotheses might be more developed
    const actionability = Math.random() * 0.4 + 0.3; // Still random for this one

    const overallScore = (novelty + plausibility + value + actionability) / 4;

    return {
      hypothesis,
      novelty,
      plausibility,
      value,
      actionability,
      overallScore,
      shouldStore: overallScore > GenAIDaydreamingTools.DEFAULT_THRESHOLD,
      reason: 'Fallback evaluation used due to AI evaluation failure',
      evaluatedAt: new Date(),
      genAIMetadata: {
        evaluatedWithAI: false,
        fallbackReason: 'AI evaluation failed, used heuristic scoring'
      }
    };
  }

  /**
   * Simple heuristic to estimate conceptual distance
   */
  private estimateConceptDistance(concept1: string, concept2: string): number {
    // Very basic heuristic - could be improved with actual semantic analysis
    const words1 = concept1.toLowerCase().split(/\s+/);
    const words2 = concept2.toLowerCase().split(/\s+/);
    
    // Check for word overlap
    const overlap = words1.filter(word => words2.includes(word)).length;
    const totalWords = Math.max(words1.length, words2.length);
    
    // Distance is inverse of overlap ratio
    return Math.max(GenAIDaydreamingTools.MIN_DISTANCE, 1 - (overlap / totalWords));
  }

  /**
   * Validate score is between 0 and 1
   */
  private validateScore(score: any, fallback: number): number {
    const num = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(num) || num < 0 || num > 1) {
      return fallback;
    }
    return num;
  }

  /**
   * Determine if insight should be stored based on configured thresholds
   */
  private async shouldStoreInsight(novelty: number, plausibility: number, value: number): Promise<boolean> {
    const noveltyThreshold = await this.configService.getNumber('daydreaming.novelty_threshold', GenAIDaydreamingTools.DEFAULT_THRESHOLD);
    const plausibilityThreshold = await this.configService.getNumber('daydreaming.plausibility_threshold', GenAIDaydreamingTools.PLAUSIBILITY_THRESHOLD);
    const valueThreshold = await this.configService.getNumber('daydreaming.value_threshold', GenAIDaydreamingTools.DEFAULT_THRESHOLD);

    return novelty >= noveltyThreshold && 
           plausibility >= plausibilityThreshold && 
           value >= valueThreshold;
  }
} 