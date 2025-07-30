import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { simpleConversation } from '../../features/reasoning/conversation/simple-conversation.js';
import {
  processConsciousnessContext,
  extractResponseContext,
  getPersonalityContext,
} from '../../features/consciousness/railroad/index.js';
import type { RailroadResult } from '../../features/consciousness/railroad/types.js';

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
  railroad_trace?: Array<{
    car: string;
    duration: number;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Process a message through the consciousness railroad and generate a response
 */
export async function processMessageWithRailroad(
  args: RailroadMessageProcessorArgs
): Promise<RailroadMessageProcessorResult> {
  // Execute the consciousness railroad
  const railroadResult = await processConsciousnessContext(args.message, args.context, args.railroad_type || 'default');

  // Extract context for response generation
  const responseContext = extractResponseContext(railroadResult);
  const personalityContext = getPersonalityContext(railroadResult);

  // Generate response using enriched context
  let response: string;
  try {
    const conversationResponse = await simpleConversation({
      question: args.message,
      context: `
Consciousness Context:
${responseContext}

Personality Guidance:
- Communication tone: ${personalityContext.communicationTone}
- Vocabulary style: ${personalityContext.vocabularyStyle}
- Confidence level: ${personalityContext.confidenceLevel}
${personalityContext.relationshipContext ? `- Relationship: ${personalityContext.relationshipContext}` : ''}
${personalityContext.memoryContext ? `- Memory context: ${personalityContext.memoryContext}` : ''}

${args.context ? `\nAdditional context: ${args.context}` : ''}
      `.trim(),
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
      execution_time: railroadResult.totalExecutionTime,
      cars_executed: railroadResult.context.operations.performed,
      personality_applied: !!railroadResult.context.personalityContext,
      context_richness: contextRichness,
    },
    operations_performed: railroadResult.context.operations.performed,
    insights_generated: railroadResult.context.operations.insights_generated,
    memories_accessed: railroadResult.context.operations.memories_accessed,
    social_interactions: railroadResult.context.operations.social_interactions,
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
