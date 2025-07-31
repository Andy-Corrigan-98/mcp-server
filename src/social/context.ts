import { executeDatabase } from '../core/services/database.js';
import { validateRequiredString } from '../core/services/validation.js';
import { ResponseBuilder } from '../core/utils/response-builder.js';
import { getEntityByName } from '../entities/get-by-name.js';

/**
 * Social memory context
 * Single responsibility: Getting rich context about shared memories and experiences
 */

/**
 * Get rich context about shared memories and experiences with someone
 */
export const getSocialMemoryContext = async (args: {
  entity_name: string;
  include_creation_memories?: boolean;
  include_learning_memories?: boolean;
  include_emotional_memories?: boolean;
  time_period?: string;
}): Promise<object> => {
  // Validate inputs
  const entityName = validateRequiredString(args.entity_name, 'entity_name', 100);
  const timePeriod = args.time_period || 'all_time';

  const includeCreationMemories = args.include_creation_memories !== false;
  const includeLearningMemories = args.include_learning_memories !== false;
  const includeEmotionalMemories = args.include_emotional_memories !== false;

  // Get the entity
  const entity = await getEntityByName(entityName);
  if (!entity) {
    throw new Error(`Social entity '${entityName}' not found`);
  }

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  switch (timePeriod) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default: // all_time
      startDate = new Date(2020, 0, 1); // Arbitrary old date
  }

  // Get memory-social links and associated data
  const memoryContext = await executeDatabase(async prisma => {
    const links = await prisma.memorySocialLink.findMany({
      where: {
        socialEntityId: entity.id,
        createdAt: { gte: startDate },
      },
      include: {
        interaction: {
          select: {
            id: true,
            interactionType: true,
            createdAt: true,
            summary: true,
            quality: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get all associated memories
    const memoryKeys = links.map((link: any) => link.memoryKey);
    const memories = await prisma.memory.findMany({
      where: {
        key: { in: memoryKeys },
      },
    });

    // Create memory lookup
    const memoryLookup = new Map();
    memories.forEach((memory: any) => {
      memoryLookup.set(memory.key, memory);
    });

    return {
      links,
      memories: memoryLookup,
    };
  });

  // Categorize memories by type
  const categorizedMemories: any = {
    creation: [],
    learning: [],
    emotional: [],
    other: [],
  };

  memoryContext.links.forEach((link: any) => {
    const memory = memoryContext.memories.get(link.memoryKey);
    if (!memory) return;

    const memoryData = {
      key: memory.key,
      content: memory.content,
      tags: memory.tags || [],
      importance: memory.importance,
      link_type: link.relationshipType,
      link_strength: link.strength,
      link_context: link.context,
      created_at: memory.createdAt,
      interaction: link.interaction,
    };

    // Categorize based on link type
    if (
      includeCreationMemories &&
      ['co_created', 'discovered_together', 'collaboration_outcome'].includes(link.relationshipType)
    ) {
      categorizedMemories.creation.push(memoryData);
    } else if (
      includeLearningMemories &&
      ['learned_from', 'taught_to', 'mentoring_moment'].includes(link.relationshipType)
    ) {
      categorizedMemories.learning.push(memoryData);
    } else if (
      includeEmotionalMemories &&
      ['emotional_support', 'celebration_shared'].includes(link.relationshipType)
    ) {
      categorizedMemories.emotional.push(memoryData);
    } else {
      categorizedMemories.other.push(memoryData);
    }
  });

  // Generate insights about memory patterns
  const insights = [];
  const totalMemories = Object.values(categorizedMemories).flat().length;

  if (categorizedMemories.creation.length > 0) {
    insights.push({
      pattern: 'creative_collaboration',
      examples: categorizedMemories.creation.slice(0, 3).map((m: any) => m.key),
      strength: categorizedMemories.creation.length / totalMemories,
    });
  }

  if (categorizedMemories.learning.length > 0) {
    insights.push({
      pattern: 'knowledge_exchange',
      examples: categorizedMemories.learning.slice(0, 3).map((m: any) => m.key),
      strength: categorizedMemories.learning.length / totalMemories,
    });
  }

  // Generate memory-based recommendations
  const recommendations = {
    memory_reminders: [] as string[],
    conversation_starters: [] as string[],
  };

  // Add recent high-strength memories as conversation starters
  const recentMemories = Object.values(categorizedMemories)
    .flat()
    .filter((m: any) => m.link_strength > 0.7)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  recommendations.conversation_starters = recentMemories.map(
    (m: any) => `Reference shared memory: ${m.key} (${m.link_type})`
  );

  return ResponseBuilder.success(
    {
      entity: {
        name: entity.name,
        display_name: entity.displayName,
      },
      time_period: timePeriod,
      memory_categories: {
        creation_memories: categorizedMemories.creation,
        learning_memories: categorizedMemories.learning,
        emotional_memories: categorizedMemories.emotional,
        other_memories: categorizedMemories.other,
      },
      memory_insights: insights,
      recommendations,
      summary: {
        total_shared_memories: totalMemories,
        strongest_connection_type:
          totalMemories > 0
            ? Object.entries(categorizedMemories).sort(
                ([, a], [, b]) => (b as any[]).length - (a as any[]).length
              )[0][0]
            : 'none',
      },
    },
    `Memory context prepared for '${entityName}' (${totalMemories} shared memories)`
  );
};








