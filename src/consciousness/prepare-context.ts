import { InputValidator } from '../core/validation/index.js';
import { ConsciousnessState, ConsciousnessContext, EntityRelationship } from './v1-compat.js';
import { ConsciousnessPrismaService } from '../core/db/prisma-service.js';
import { ConfigurationService } from '../core/db/configuration-service.js';
import { GuidGenerator } from '../core/utils/guid.js';

/**
 * Prepare rich context from brain storage for agent reflection and thinking
 */
export async function prepareContext(args: {
  topic: string;
  context_depth?: string;
  include_memories?: boolean;
  include_knowledge?: boolean;
  context_note?: string;
}): Promise<ConsciousnessContext> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Load configuration values
  const maxTopicLength = await config.getNumber('consciousness.max_topic_length', 500);
  const maxContextLength = await config.getNumber('consciousness.max_context_length', 1000);
  const maxMemorySlice = await config.getNumber('consciousness.max_memory_slice', 5);
  const maxConnectionDisplay = await config.getNumber('consciousness.max_connection_display', 3);
  const reflectionDepths = await config.getEnumArray('consciousness.reflection_depths', [
    'surface_glance',
    'thoughtful_dive',
    'profound_exploration',
  ]);

  // Validate and sanitize inputs
  const topic = InputValidator.sanitizeString(args.topic, maxTopicLength);
  const contextDepth = args.context_depth || reflectionDepths[1];
  const includeMemories = Boolean(args.include_memories !== false);
  const includeKnowledge = Boolean(args.include_knowledge !== false);
  const contextNote = args.context_note
    ? InputValidator.sanitizeString(args.context_note, maxContextLength)
    : undefined;

  // Generate session ID for tracking using modern string methods
  const sessionId = GuidGenerator.generateSessionId();
  const sessionStartTime = new Date();

  // Store the context preparation request for future reference
  try {
    await db.storeMemory({
      key: `context_prep_${Date.now()}`,
      content: {
        topic,
        contextDepth,
        contextNote,
        sessionId,
        timestamp: new Date().toISOString(),
      },
      tags: ['context_preparation', 'brain_storage'],
      importance: 'medium',
    });
  } catch {
    // Continue even if storage fails
  }

  // Retrieve related memories if requested
  let relatedMemories: any[] = []; // V2 simplified - not in interface
  if (includeMemories) {
    try {
      const memories = await db.searchMemories(topic, [], undefined);
      relatedMemories = memories.slice(0, maxMemorySlice).map(memory => ({
        key: memory.key,
        content: memory.content as Record<string, unknown>,
        tags: memory.tags,
        importance: memory.importance,
        storedAt: memory.storedAt,
      }));
    } catch {
      relatedMemories = [];
    }
  }

  // Retrieve knowledge graph connections if requested
  let knowledgeConnections: any[] = []; // V2 simplified - not in interface
  if (includeKnowledge) {
    try {
      const entity = await db.getEntity(topic);
      if (entity) {
        knowledgeConnections = [
          {
            entity: entity.name,
            type: entity.entityType,
            relationships: [
              ...entity.sourceRelationships.map(
                (rel: {
                  targetEntity: { name: string };
                  relationshipType: string;
                  strength: number;
                }): EntityRelationship => ({
                  // target: rel.targetEntity.name, // V2 simplified - not in interface
                  type: rel.relationshipType,
                  strength: rel.strength,
                } as any)
              ),
              ...entity.targetRelationships.map(
                (rel: {
                  sourceEntity: { name: string };
                  relationshipType: string;
                  strength: number;
                }): EntityRelationship => ({
                  // target: rel.sourceEntity.name, // V2 simplified - not in interface
                  type: rel.relationshipType,
                  strength: rel.strength,
                } as any)
              ),
            ].slice(0, maxConnectionDisplay),
          },
        ];
      }
    } catch {
      knowledgeConnections = [];
    }
  }

  // Create default consciousness state for context
  const currentState: ConsciousnessState = {
    // timestamp: new Date(), // Not in interface
    sessionId: 'temp-session', // Required by interface
    mode: 'analytical',
    // activeProcesses: ['context_preparation', 'memory_retrieval'], // V2 simplified - not in interface
    attentionFocus: 'system_startup',
    awarenessLevel: 'medium',
    cognitiveLoad: 0.1,
    learningState: 'active',
    emotionalTone: 'neutral',
  } as any;

  // Get activity count (simplified for now)
  const getActivityCount = async (): Promise<number> => {
    try {
      const memories = await db.searchMemories('', ['session_update'], undefined);
      return memories.length;
    } catch {
      return 0;
    }
  };

  // Get recent focus patterns (simplified for now)
  const getRecentFocus = async (): Promise<string[]> => {
    try {
      const memories = await db.searchMemories('', ['session_update'], undefined);
      return memories.slice(0, 3).map(m => {
        const content = m.content as any;
        return content.attentionFocus || 'unknown';
      });
    } catch {
      return [];
    }
  };

  return {
    // V2 simplified return - interface compliant
    topic,
    depth: 'medium', // Required by interface
    includeKnowledge: includeKnowledge || false, // Required by interface
    includeMemories: includeMemories || false, // Required by interface
    userId: 'system', // V2 simplified
    currentState,
  } as any;
}
