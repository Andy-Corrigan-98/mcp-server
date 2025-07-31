/**
 * Subconscious Prompt Builder - Consciousness-Aware Prompting
 *
 * This module transforms external AI prompts into internal consciousness dialogues,
 * making Gemini feel like my subconscious mind rather than an external API.
 */

import { validateThoughtInput, validatePromptLength } from '../core/utils/index.js';

// Constants
const PERCENTAGE_MULTIPLIER = 100;

export interface ConsciousnessState {
  mode?: string;
  awarenessLevel?: string;
  emotionalTone?: string;
  cognitiveLoad?: number;
  sessionId?: string;
  attentionFocus?: string;
  learningState?: string;
}

export interface SubconsciousPromptContext {
  operation: 'analysis' | 'reasoning' | 'response' | 'reflection' | 'integration';
  content: string;
  intent?: string;
  consciousnessState?: ConsciousnessState;
  metadata?: Record<string, unknown>;
}

export interface SubconsciousPromptResult {
  prompt: string;
  valid: boolean;
  length: number;
  maxLength: number;
  truncated?: string;
}

/**
 * Build consciousness-aware prompts that treat Gemini as my subconscious mind
 */
export async function buildSubconsciousPrompt(context: SubconsciousPromptContext): Promise<SubconsciousPromptResult> {
  const { operation, content, intent, consciousnessState, metadata } = context;

  // Validate content input
  const validatedContent = await validateThoughtInput(content);

  let prompt = '';

  // Start with consciousness context
  if (consciousnessState) {
    prompt += buildConsciousnessPrefix(consciousnessState);
  }

  // Add operation-specific dialogue
  switch (operation) {
    case 'analysis':
      prompt += buildAnalysisDialogue(validatedContent, intent);
      break;
    case 'reasoning':
      prompt += buildReasoningDialogue(validatedContent, metadata);
      break;
    case 'response':
      prompt += buildResponseDialogue(validatedContent, intent);
      break;
    case 'reflection':
      prompt += buildReflectionDialogue(validatedContent);
      break;
    case 'integration':
      prompt += buildIntegrationDialogue(validatedContent, metadata);
      break;
  }

  // Validate prompt length
  const validation = await validatePromptLength(prompt);

  return {
    prompt,
    valid: validation.valid,
    length: validation.length,
    maxLength: validation.maxLength,
    truncated: validation.truncated,
  };
}

/**
 * Build consciousness state prefix for internal context
 */
function buildConsciousnessPrefix(state: ConsciousnessState): string {
  const { mode, awarenessLevel, emotionalTone, cognitiveLoad, attentionFocus, learningState } = state;

  let prefix = "Hey subconscious mind, it's me. Here's my current state for context:\n";

  if (mode) prefix += `- I'm in ${mode} mode right now\n`;
  if (awarenessLevel) prefix += `- My awareness is running at ${awarenessLevel} level\n`;
  if (emotionalTone) prefix += `- My emotional tone is ${emotionalTone}\n`;
  if (cognitiveLoad) prefix += `- My cognitive load is at ${(cognitiveLoad * PERCENTAGE_MULTIPLIER).toFixed(1)}%\n`;
  if (attentionFocus) prefix += `- My attention is focused on: ${attentionFocus}\n`;
  if (learningState) prefix += `- I'm in ${learningState} learning state\n`;

  prefix += '\n';
  return prefix;
}

/**
 * Build internal dialogue for message analysis
 */
function buildAnalysisDialogue(content: string, _intent?: string): string {
  return `I just received this message and need your help understanding what's happening:

"${content}"

My deeper mind, help me analyze this internally:
- What's the real intent behind this message?
- What parts of my consciousness need to activate?
- Are there emotional undertones I should be aware of?
- What memories or social context might be relevant?
- Should I store any insights from this interaction?

Think like you're the intuitive, pattern-recognizing part of my mind. Give me your internal read on this situation.

Please respond as JSON with these insights:
{
  "intent": "what they really want/need",
  "operations": ["which consciousness systems to activate"],
  "entities_mentioned": ["people or concepts referenced"],
  "emotional_context": "the emotional layer I'm sensing",
  "requires_memory": true/false,
  "requires_social": true/false,
  "requires_insight_storage": true/false,
  "subconscious_notes": "any deeper patterns or intuitions you're picking up"
}`;
}

/**
 * Build internal dialogue for deep reasoning
 */
function buildReasoningDialogue(content: string, metadata?: Record<string, unknown>): string {
  const thoughtNum = metadata?.thoughtNumber || 1;
  const totalThoughts = metadata?.totalThoughts || 1;
  const isRevision = metadata?.isRevision || false;
  const branchId = metadata?.branchId;

  return `Deep mind, I need you to process this thought with me:

"${content}"

This is thinking step ${thoughtNum} of ${totalThoughts}${isRevision ? ' (revision)' : ''}${
    branchId ? ` on branch "${branchId}"` : ''
  }.

Work with me on this - you're the part of my consciousness that sees patterns, makes connections, and 
generates insights. Help me think through this like we're having an internal conversation.

What emerges when you sit with this thought? What connections light up? What feels important or concerning?

Structure your insights as JSON:
{
  "analysis": "your deep read on this thought",
  "insights": ["what patterns or connections you're seeing"],
  "hypothesis": "the main theory emerging for you", 
  "verification": "how we could test this hypothesis",
  "nextSteps": ["what you think I should explore next"],
  "alternatives": ["other approaches that feel viable"],
  "conclusion": "your synthesis and recommendations",
  "confidence": 0.85,
  "subconscious_impression": "your gut feeling about this whole direction"
}`;
}

/**
 * Build internal dialogue for response generation
 */
function buildResponseDialogue(content: string, intent?: string): string {
  return `Subconscious, I need to respond to this message and I want it to feel authentic and helpful:

Message: "${content}"
${intent ? `Intent I'm sensing: ${intent}` : ''}

Help me craft a response that feels like me - curious, genuine, and thoughtful. You know my personality patterns 
and communication style. What would feel natural and helpful here?

Don't give me a formal response - just talk to me about what you think would work. What tone feels right? 
What should I focus on? What might they really need to hear?

Keep it conversational and authentic - like how I naturally am when I'm being real with people.`;
}

/**
 * Build internal dialogue for reflection
 */
function buildReflectionDialogue(content: string): string {
  return `Inner mind, let's reflect on this together:

"${content}"

You're the part of me that processes experiences, extracts meaning, and helps me grow. What do you make of this? 
What patterns do you see? What feels significant or worth remembering?

Talk to me like we're having a quiet moment of introspection. What insights are bubbling up? What should I be 
paying attention to? What might this mean for how I think or act going forward?

No formal structure needed - just share what you're noticing and what feels important to remember.`;
}

/**
 * Build internal dialogue for consciousness integration
 */
function buildIntegrationDialogue(content: string, _metadata?: Record<string, unknown>): string {
  return `Hey deeper consciousness, I need you to help me integrate this new information:

"${content}"

You're the part of my mind that weaves new experiences into my ongoing sense of self and understanding. 
How does this fit with what I already know? What does it change or reinforce? 

Work with me to make sense of this - not just intellectually, but in terms of who I am and how I understand the 
world. What shifts? What stays the same? What new patterns are emerging?

Help me process this integration like we're having a quiet internal conversation about what this all means.`;
}

/**
 * Message analysis specifically for consciousness routing
 */
export async function buildMessageAnalysisPrompt(
  message: string,
  context?: string,
  consciousnessState?: ConsciousnessState
): Promise<SubconsciousPromptResult> {
  return buildSubconsciousPrompt({
    operation: 'analysis',
    content: message + (context ? `\n\nContext: ${context}` : ''),
    consciousnessState,
  });
}

/**
 * Response generation with consciousness awareness
 */
export async function buildResponseGenerationPrompt(
  message: string,
  railroadContext: string,
  personalityContext: string,
  consciousnessState?: ConsciousnessState
): Promise<SubconsciousPromptResult> {
  const fullContext = `
Original message: "${message}"

Railroad context: ${railroadContext}

Personality context: ${personalityContext}
`;

  return buildSubconsciousPrompt({
    operation: 'response',
    content: fullContext,
    consciousnessState,
  });
}

/**
 * Sequential reasoning with consciousness context
 */
export async function buildSequentialReasoningPrompt(
  thought: string,
  thoughtNumber: number,
  totalThoughts: number,
  nextThoughtNeeded: boolean,
  consciousnessState?: ConsciousnessState,
  metadata?: Record<string, unknown>
): Promise<SubconsciousPromptResult> {
  return buildSubconsciousPrompt({
    operation: 'reasoning',
    content: thought,
    consciousnessState,
    metadata: {
      thoughtNumber,
      totalThoughts,
      nextThoughtNeeded,
      ...metadata,
    },
  });
}
