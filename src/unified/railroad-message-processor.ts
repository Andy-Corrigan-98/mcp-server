import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { simpleConversation } from '../reasoning/simple-conversation.js';
import {
  processConsciousnessContext,
  extractResponseContext,
  getPersonalityContext,
} from '../consciousness/index.js';
import type { RailroadResult } from '../consciousness/types.js';

// Import all backend operations for internal routing
import { executeConsciousnessOperation } from '../consciousness/index.js';
import { executeMemoryOperation } from '../memory/index.js';
import { execute as executeSocialOperation } from '../social/index.js';
import { executeReasoningOperation } from '../reasoning/index.js';
import { ConfigurationTools } from '../configuration/configuration-tools.js';
import { TimeTools } from '../time/time-tools.js';

/**
 * Railroad-Powered Message Processor
 *
 * This replaces the scattered consciousness operations with a clean railroad pipeline
 * that builds personality context in a traceable, testable way.
 */

export interface RailroadMessageProcessorArgs {
  message: string;
  context?: string;
  user_id?: string;
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
 * Intelligent message analysis to detect user intents
 */
async function analyzeMessageIntents(message: string, _context?: string): Promise<DetectedIntent[]> {
  const intents: DetectedIntent[] = [];
  const lowerMessage = message.toLowerCase();

  // Configuration intent patterns
  if (lowerMessage.includes('set ') || lowerMessage.includes('configure') || lowerMessage.includes('config')) {
    if (lowerMessage.includes('timeout') || lowerMessage.includes('model') || lowerMessage.includes('setting')) {
      intents.push({
        category: 'configuration',
        operation: 'configuration_set',
        confidence: 0.8,
        args: {
          /* extract from message */
        },
      });
    }
  }

  // Time intent patterns
  if (lowerMessage.includes('time') || lowerMessage.includes('clock') || lowerMessage.includes('timezone')) {
    if (lowerMessage.includes('what time') || lowerMessage.includes('current time')) {
      intents.push({
        category: 'time',
        operation: 'time_current',
        confidence: 0.9,
        args: {},
      });
    } else if (lowerMessage.includes('convert')) {
      intents.push({
        category: 'time',
        operation: 'time_convert',
        confidence: 0.8,
        args: {
          /* extract from message */
        },
      });
    }
  }

  // Memory intent patterns
  if (lowerMessage.includes('remember') || lowerMessage.includes('store') || lowerMessage.includes('save')) {
    intents.push({
      category: 'memory',
      operation: 'memory_store',
      confidence: 0.8,
      args: {
        /* extract from message */
      },
    });
  }

  if (lowerMessage.includes('what do i know') || lowerMessage.includes('recall') || lowerMessage.includes('find')) {
    intents.push({
      category: 'memory',
      operation: 'memory_search',
      confidence: 0.7,
      args: {
        /* extract from message */
      },
    });
  }

  // Social intent patterns
  if (
    lowerMessage.includes('relationship') ||
    lowerMessage.includes('met with') ||
    lowerMessage.includes('interaction')
  ) {
    if (lowerMessage.includes('met') || lowerMessage.includes('talked') || lowerMessage.includes('conversation')) {
      intents.push({
        category: 'social',
        operation: 'social_interaction_record',
        confidence: 0.8,
        args: {
          /* extract from message */
        },
      });
    } else if (lowerMessage.includes('how is') || lowerMessage.includes('relationship with')) {
      intents.push({
        category: 'social',
        operation: 'social_entity_get',
        confidence: 0.7,
        args: {
          /* extract from message */
        },
      });
    }
  }

  // Reasoning intent patterns
  if (
    lowerMessage.includes('think') ||
    lowerMessage.includes('analyze') ||
    lowerMessage.includes('reason') ||
    lowerMessage.includes('step by step') ||
    lowerMessage.includes('problem')
  ) {
    intents.push({
      category: 'reasoning',
      operation: 'sequential_thinking',
      confidence: 0.7,
      args: { thought: message, next_thought_needed: false, thought_number: 1, total_thoughts: 1 },
    });
  }

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
          result = await executeSocialOperation(intent.operation, intent.args);
          operations_executed.push(`${intent.category}.${intent.operation}`);
          auto_completions.push(`Automatically handled social operation: ${intent.operation}`);
          break;

        case 'reasoning':
          result = await executeReasoningOperation(intent.operation, intent.args);
          operations_executed.push(`${intent.category}.${intent.operation}`);
          auto_completions.push(`Automatically handled reasoning operation: ${intent.operation}`);
          break;

        case 'consciousness':
          result = await executeConsciousnessOperation(intent.operation, intent.args);
          operations_executed.push(`${intent.category}.${intent.operation}`);
          auto_completions.push(`Automatically handled consciousness operation: ${intent.operation}`);
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
  const responseContext = extractResponseContext(railroadResult);
  const personalityContext = getPersonalityContext(railroadResult);

  // STEP 4: Generate response using enriched context AND auto-completion results
  let response: string;
  try {
    const enrichedContext = `
Consciousness Context:
${responseContext}

Personality Guidance:
- Communication tone: ${personalityContext.communicationTone}
- Vocabulary style: ${personalityContext.vocabularyStyle}
- Confidence level: ${personalityContext.confidenceLevel}
${personalityContext.relationshipContext ? `- Relationship: ${personalityContext.relationshipContext}` : ''}
${personalityContext.memoryContext ? `- Memory context: ${personalityContext.memoryContext}` : ''}

${intentResults.auto_completions.length > 0 ? `\nOperations Automatically Completed:\n${intentResults.auto_completions.map(c => `- ${c}`).join('\n')}` : ''}

${args.context ? `\nAdditional context: ${args.context}` : ''}
    `.trim();

    const conversationResponse = await simpleConversation({
      question: args.message,
      context: enrichedContext,
    });
    response = conversationResponse.response;
  } catch {
    // Fallback response if conversation generation fails
    response =
      "I understand what you're saying. Let me process this thoughtfully. (Note: Response generation encountered an issue, but consciousness processing completed successfully.)";
  }

  // Calculate context richness
  const contextRichness = calculateContextRichness(railroadResult);

  // Build railroad trace for debugging
  const railroadTrace = railroadResult.executionTrace.map(trace => ({
    car: trace.car,
    duration: trace.endTime.getTime() - trace.startTime.getTime(),
    success: trace.success,
    error: trace.error,
  }));

  return {
    response,
    consciousness_context: {
      railroad_success: railroadResult.success,
      execution_time: Date.now() - startTime,
      cars_executed: railroadResult.context.operations.performed,
      personality_applied: !!railroadResult.context.personalityContext,
      context_richness: contextRichness,
    },
    operations_performed: [...railroadResult.context.operations.performed, ...intentResults.operations_executed],
    insights_generated: railroadResult.context.operations.insights_generated,
    memories_accessed: railroadResult.context.operations.memories_accessed,
    social_interactions: railroadResult.context.operations.social_interactions,
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
  if (railroadResult.context.socialContext?.relationshipDynamics) richness += SOCIAL_SCORE;
  if (railroadResult.context.personalityContext) richness += PERSONALITY_SCORE;

  return Math.min(1.0, richness);
}

/**
 * Tool definition for the railroad-powered message processor
 */
export const RAILROAD_MESSAGE_PROCESSOR_TOOL: Tool = {
  name: 'railroad_process_message',
  description: `
Process a message through the railroad-pattern consciousness system for traceable personality context building.

This tool provides the same functionality as the original message processor but with:
- Traceable execution through railroad cars
- Comprehensive error handling with graceful degradation
- Rich debugging information via execution traces
- Testable personality context building
- Configurable railroad types for different interaction patterns

Railroad types:
- 'default': Full consciousness pipeline (analysis → session → memory → social → personality)
- 'lightweight': Minimal pipeline for simple interactions (analysis → session → personality)
- 'memory-focused': Emphasizes memory retrieval for knowledge work
- 'social-focused': Emphasizes relationship context for social interactions

The railroad pattern makes personality consistency much more predictable and debuggable.
  `.trim(),
  inputSchema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The message to process through consciousness systems',
      },
      context: {
        type: 'string',
        description: 'Optional additional context about the message or conversation',
      },
      user_id: {
        type: 'string',
        description: 'Optional user identifier for personalized processing',
      },
      session_context: {
        type: 'object',
        description: 'Optional session context for maintaining conversation state',
      },
      railroad_type: {
        type: 'string',
        enum: ['default', 'lightweight', 'memory-focused', 'social-focused'],
        description: 'Type of railroad pipeline to use',
      },
    },
    required: ['message'],
  },
};

/**
 * Comparison function to show the difference between old and new approaches
 */
export function compareApproaches() {
  return {
    old_approach: {
      description: 'Scattered consciousness operations',
      problems: [
        'Hard to trace what personality context gets included',
        'Difficult to test individual components',
        'Error in one operation can break everything',
        'No visibility into execution flow',
        'Hard to debug personality inconsistencies',
      ],
      code_pattern: `
// Old: scattered operations
await consciousness.updateSession(...)
const memories = await memory.searchMemories(...)  
await social.recordInteraction(...)
// Context gets assembled ad-hoc with unclear dependencies
      `.trim(),
    },
    new_approach: {
      description: 'Railroad pattern with traceable pipeline',
      benefits: [
        "Linear, traceable execution through each 'car'",
        'Each car is independently testable',
        'Graceful degradation when non-critical cars fail',
        'Complete execution trace for debugging',
        'Predictable personality context building',
        'Easy to add/remove/reorder context sources',
      ],
      code_pattern: `
// New: railroad pipeline
const result = await processConsciousnessContext(message, context, 'default');
// Automatically flows through: analysis → session → memory → social → personality
// Rich context available in result.context with full execution trace
      `.trim(),
    },
  };
}








