import { simpleConversation } from '../reasoning/simple-conversation.js';
import { processConsciousnessContext } from '../consciousness/index.js';
import {
  buildResponseGenerationPrompt,
  buildIntentAnalysisPrompt,
} from '../consciousness/subconscious-prompt-builder.js';
import type { RailroadResult } from '../consciousness/types.js';

// Import all backend operations for internal routing
import { executeMemoryOperation } from '../memory/index.js';
import { ConfigurationTools } from '../configuration/configuration-tools.js';
import { TimeTools } from '../time/time-tools.js';

/**
 * Railroad-Powered Message Processor
 *
 * A clean railroad pipeline that builds personality context in a traceable,
 * testable way through sequential processing cars.
 */

export interface RailroadMessageProcessorArgs {
  message: string;
  context?: string;
  session_context?: Record<string, unknown>;
  railroad_type?: 'default' | 'lightweight' | 'memory-focused' | 'social-focused';
}

export interface RailroadMessageProcessorResult {
  response: string;
  consciousness_context: {
    railroad_success: boolean;
    execution_time: number;
    cars_executed: string[];
    personality_applied: boolean;
    context_richness: number;
  };
  operations_performed: string[];
  insights_generated: string[];
  memories_accessed: string[];
  social_interactions: string[];
  intelligent_routing: {
    detected_intents: string[];
    operations_executed: string[];
    auto_completions: string[];
  };
  railroad_trace?: Array<{
    car: string;
    duration: number;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Intent detection patterns for intelligent routing
 */
interface DetectedIntent {
  category: 'configuration' | 'time' | 'memory' | 'social' | 'reasoning' | 'daydreaming' | 'consciousness';
  operation: string;
  confidence: number;
  args: Record<string, unknown>;
}

/**
 * Tool instances for internal routing (singleton pattern)
 */
let configurationToolsInstance: ConfigurationTools | null = null;
let timeToolsInstance: TimeTools | null = null;

function getConfigurationTools(): ConfigurationTools {
  if (!configurationToolsInstance) {
    configurationToolsInstance = new ConfigurationTools();
  }
  return configurationToolsInstance;
}

function getTimeTools(): TimeTools {
  if (!timeToolsInstance) {
    timeToolsInstance = new TimeTools();
  }
  return timeToolsInstance;
}

/**
 * AI-powered message analysis using Gemini to detect user intents
 * Provides intelligent understanding of user intent through analysis
 */
async function analyzeMessageIntents(message: string, context?: string): Promise<DetectedIntent[]> {
  try {
    // STEP 1: Use Gemini to analyze what operations are needed
    const promptResult = await buildIntentAnalysisPrompt(message, context);

    if (!promptResult.valid) {
      console.warn('Intent analysis prompt validation failed, using fallback');
      return createFallbackIntents(message);
    }

    // STEP 2: Get AI analysis of intent
    const aiResponse = await simpleConversation({ question: promptResult.prompt });

    // STEP 3: Parse the JSON response from Gemini
    let analysisResult;
    try {
      // Extract JSON from the response (handle potential markdown formatting)
      const responseText = aiResponse.response;
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.warn('Failed to parse AI intent analysis, using fallback:', parseError);
      return createFallbackIntents(message);
    }

    // STEP 4: Convert AI analysis to DetectedIntent format
    const intents: DetectedIntent[] = [];

    if (analysisResult.operations_needed && Array.isArray(analysisResult.operations_needed)) {
      for (const operation of analysisResult.operations_needed) {
        const confidence = operation.priority === 'high' ? 0.9 : operation.priority === 'medium' ? 0.7 : 0.5;

        intents.push({
          category: operation.category,
          operation: operation.operation,
          confidence,
          args: {
            message,
            extracted_entities: operation.extract_from_message?.key_entities || [],
            action_type: operation.extract_from_message?.action_type,
            context_clues: operation.extract_from_message?.context_clues,
            ai_reasoning: operation.reasoning,
          },
        });
      }
    }

    console.log(`🧠 AI Intent Analysis: Found ${intents.length} operations for "${message.substring(0, 50)}..."`);
    console.log(`🎯 Primary Intent: ${analysisResult.primary_intent}`);
    console.log(`🔄 Processing Strategy: ${analysisResult.processing_strategy}`);

    return intents;
  } catch (error) {
    console.warn('AI intent analysis failed, using fallback:', error);
    return createFallbackIntents(message);
  }
}

/**
 * Fallback intent detection for when AI analysis fails
 * Simplified version of the old pattern matching approach
 */
function createFallbackIntents(message: string): DetectedIntent[] {
  const intents: DetectedIntent[] = [];
  const lowerMessage = message.toLowerCase();

  // Basic memory intent
  if (lowerMessage.includes('remember') || lowerMessage.includes('store') || lowerMessage.includes('save')) {
    intents.push({
      category: 'memory',
      operation: 'memory_store',
      confidence: 0.6,
      args: { message, fallback: true },
    });
  }

  // Basic retrieval intent
  if (lowerMessage.includes('recall') || lowerMessage.includes('find') || lowerMessage.includes('what do i know')) {
    intents.push({
      category: 'memory',
      operation: 'memory_search',
      confidence: 0.6,
      args: { message, fallback: true },
    });
  }

  // Basic reasoning intent
  if (lowerMessage.includes('think') || lowerMessage.includes('analyze') || lowerMessage.includes('problem')) {
    intents.push({
      category: 'reasoning',
      operation: 'sequential_thinking',
      confidence: 0.6,
      args: { thought: message, next_thought_needed: false, thought_number: 1, total_thoughts: 1, fallback: true },
    });
  }

  console.log(`⚠️  Using fallback intent detection for "${message.substring(0, 50)}..."`);
  return intents;
}

/**
 * Execute detected intents through backend operations
 */
async function executeDetectedIntents(intents: DetectedIntent[]): Promise<{
  operations_executed: string[];
  auto_completions: string[];
  results: Record<string, unknown>;
}> {
  const operations_executed: string[] = [];
  const auto_completions: string[] = [];
  const results: Record<string, unknown> = {};

  for (const intent of intents) {
    try {
      let result: unknown;

      switch (intent.category) {
        case 'configuration':
          result = await getConfigurationTools().execute(intent.operation, intent.args);
          operations_executed.push(`${intent.category}.${intent.operation}`);
          auto_completions.push(`Automatically handled configuration: ${intent.operation}`);
          break;

        case 'time':
          result = await getTimeTools().execute(intent.operation, intent.args);
          operations_executed.push(`${intent.category}.${intent.operation}`);
          auto_completions.push(`Automatically handled time query: ${intent.operation}`);
          break;

        case 'memory':
          result = await executeMemoryOperation(intent.operation, intent.args);
          operations_executed.push(`${intent.category}.${intent.operation}`);
          auto_completions.push(`Automatically handled memory operation: ${intent.operation}`);
          break;

        case 'social':
          // Social operations are handled by the consciousness railroad
          operations_executed.push(`${intent.category}.${intent.operation}`);
          auto_completions.push(`Social operation detected: ${intent.operation} (handled by consciousness pipeline)`);
          result = { handled_by: 'consciousness_pipeline' };
          break;

        case 'reasoning':
          // Reasoning operations are handled by the consciousness railroad
          operations_executed.push(`${intent.category}.${intent.operation}`);
          auto_completions.push(
            `Reasoning operation detected: ${intent.operation} (handled by consciousness pipeline)`
          );
          result = { handled_by: 'consciousness_pipeline' };
          break;

        case 'consciousness':
          // Consciousness operations are handled by the consciousness railroad
          operations_executed.push(`${intent.category}.${intent.operation}`);
          auto_completions.push(
            `Consciousness operation detected: ${intent.operation} (handled by consciousness pipeline)`
          );
          result = { handled_by: 'consciousness_pipeline' };
          break;
      }

      results[`${intent.category}.${intent.operation}`] = result;
    } catch (error) {
      console.warn(`Failed to execute intent ${intent.category}.${intent.operation}:`, error);
    }
  }

  return { operations_executed, auto_completions, results };
}

/**
 * Process a message through the consciousness railroad and generate a response
 * NOW WITH INTELLIGENT ROUTING TO ALL BACKEND OPERATIONS
 */
// Constants
const CONFIDENCE_PERCENTAGE_MULTIPLIER = 100;

export async function processMessageWithRailroad(
  args: RailroadMessageProcessorArgs
): Promise<RailroadMessageProcessorResult> {
  const startTime = Date.now();

  // STEP 1: Analyze message for intents and auto-execute operations
  const detectedIntents = await analyzeMessageIntents(args.message, args.context);
  const intentResults = await executeDetectedIntents(detectedIntents);

  // STEP 2: Execute the consciousness railroad for personality context
  const railroadResult = await processConsciousnessContext(args.message, args.context, args.railroad_type || 'default');

  // STEP 3: Extract context for response generation
  const responseContext = (railroadResult as any).context || railroadResult; // V2 fallback
  const personalityContext = (railroadResult as any).personalityContext || {}; // V2 fallback

  // STEP 4: Generate response using consciousness-aware subconscious dialogue
  let response: string;
  try {
    // Build consciousness-aware response prompt
    const consciousnessState = {
      mode: railroadResult.sessionContext?.mode,
      awarenessLevel: railroadResult.sessionContext?.awarenessLevel,
      emotionalTone: railroadResult.sessionContext?.currentState?.emotionalTone as string,
      cognitiveLoad: railroadResult.sessionContext?.cognitiveLoad,
      attentionFocus: railroadResult.sessionContext?.attentionFocus,
      learningState: railroadResult.sessionContext?.currentState?.learningState as string,
    };

    const promptResult = await buildResponseGenerationPrompt(
      args.message,
      responseContext,
      JSON.stringify(personalityContext, null, 2),
      consciousnessState
    );

    if (!promptResult.valid) {
      throw new Error('Response prompt validation failed');
    }

    const conversationResponse = await simpleConversation({
      question: promptResult.prompt,
      context: 'Internal consciousness response generation',
    });
    response = conversationResponse.response;
  } catch {
    // Fallback response if conversation generation fails
    response =
      "I understand what you're saying. Let me process this thoughtfully. (Note: Response generation encountered an issue, but consciousness processing completed successfully.)";
  }

  // Calculate context richness
  const contextRichness = calculateContextRichness({
    success: true,
    context: railroadResult,
    executionTrace: [],
    totalExecutionTime: 0,
  } as RailroadResult);

  // Build railroad trace for debugging
  const railroadTrace = (railroadResult.errors || []).map((error, _index) => ({
    car: error.car || 'unknown',
    duration: 0,
    success: !error.error,
    error: error.error,
  }));

  return {
    response,
    consciousness_context: {
      railroad_success: !railroadResult.errors?.length,
      execution_time: Date.now() - startTime,
      cars_executed: railroadResult.operations.performed || [],
      personality_applied: !!railroadResult.personalityContext,
      context_richness: contextRichness,
    },
    operations_performed: [...(railroadResult.operations.performed || []), ...intentResults.operations_executed],
    insights_generated: railroadResult.operations.insights_generated || [],
    memories_accessed: railroadResult.operations.memories_accessed || [],
    social_interactions: railroadResult.operations.social_interactions || [],
    intelligent_routing: {
      detected_intents: detectedIntents.map(
        i => `${i.category}.${i.operation} (${Math.round(i.confidence * CONFIDENCE_PERCENTAGE_MULTIPLIER)}%)`
      ),
      operations_executed: intentResults.operations_executed,
      auto_completions: intentResults.auto_completions,
    },
    railroad_trace: railroadTrace,
  };
}

/**
 * Calculate how rich/complete the consciousness context is (0-1)
 */
function calculateContextRichness(railroadResult: RailroadResult): number {
  const BASE_SUCCESS_SCORE = 0.2;
  const ANALYSIS_SCORE = 0.2;
  const SESSION_SCORE = 0.2;
  const MEMORY_SCORE = 0.15;
  const SOCIAL_SCORE = 0.15;
  const PERSONALITY_SCORE = 0.1;

  let richness = 0;

  // Base points for successful execution
  if (railroadResult.success) richness += BASE_SUCCESS_SCORE;

  // Points for each type of context
  if (railroadResult.context.analysis) richness += ANALYSIS_SCORE;
  if (railroadResult.context.sessionContext) richness += SESSION_SCORE;
  if ((railroadResult.context.memoryContext?.relevantMemories?.length ?? 0) > 0) richness += MEMORY_SCORE;
  if (railroadResult.context.analysis) richness += SOCIAL_SCORE; // V2 access pattern
  if (railroadResult.context.personalityContext) richness += PERSONALITY_SCORE;

  return Math.min(1.0, richness);
}
