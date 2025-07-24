import { executeDatabase } from '../../../services/database.js';
import { sanitizeString } from '../../../services/validation.js';
import { ResponseBuilder } from '../../../utils/response-builder.js';
import { getEntityByName } from '../entities/get-by-name.js';

/**
 * Memory-social search
 * Single responsibility: Searching for memories connected to social entities or interactions
 */

/**
 * Search for memories connected to social entities or interactions
 */
export const searchMemorySocialLinks = async (args: {
  entity_name?: string;
  link_types?: string[];
  memory_keywords?: string[];
  interaction_type?: string;
  min_strength?: number;
  limit?: number;
}): Promise<object> => {
  const limit = Math.min(args.limit || 10, 50); // Cap at 50 results
  const minStrength = Math.max(0, Math.min(1, args.min_strength ?? 0.5));

  // Build search conditions
  const searchConditions: any = {
    strength: { gte: minStrength },
  };

  // Filter by entity if specified
  if (args.entity_name) {
    const entity = await getEntityByName(args.entity_name);
    if (!entity) {
      throw new Error(`Social entity '${args.entity_name}' not found`);
    }
    searchConditions.socialEntityId = entity.id;
  }

  // Filter by link types
  if (args.link_types && args.link_types.length > 0) {
    const linkTypes = args.link_types
      .map(type => sanitizeString(type, 50))
      .filter((t): t is string => t !== undefined && t.length > 0);
    if (linkTypes.length > 0) {
      searchConditions.relationshipType = { in: linkTypes };
    }
  }

  // Search for links and associated memories
  const results = await executeDatabase(async prisma => {
    const query = prisma.memorySocialLink.findMany({
      where: searchConditions,
      include: {
        socialEntity: {
          select: {
            name: true,
            displayName: true,
            entityType: true,
          },
        },
        interaction: {
          select: {
            id: true,
            interactionType: true,
            createdAt: true,
            summary: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const links = await query;

    // Get associated memories
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

    return links.map((link: any) => {
      const memory = memoryLookup.get(link.memoryKey);
      return {
        link,
        memory,
        entity: link.socialEntity,
        interaction: link.interaction,
      };
    });
  });

  // Apply keyword filtering to memory content if specified
  let filteredResults = results;
  if (args.memory_keywords && args.memory_keywords.length > 0) {
    const keywords = args.memory_keywords
      .map(keyword => sanitizeString(keyword, 100))
      .filter((k): k is string => k !== undefined && k.length > 0);

    if (keywords.length > 0) {
      filteredResults = results.filter((result: any) => {
        if (!result.memory || !result.memory.content) return false;

        const contentStr = JSON.stringify(result.memory.content).toLowerCase();
        return keywords.some((keyword: string) => contentStr.includes(keyword.toLowerCase()));
      });
    }
  }

  // Format results
  const formattedResults = filteredResults.map((result: any) => ({
    memory: {
      key: result.memory?.key,
      content: result.memory?.content,
      tags: result.memory?.tags || [],
      importance: result.memory?.importance,
      created_at: result.memory?.createdAt,
    },
    link: {
      id: result.link.id,
      link_type: result.link.relationshipType,
      strength: result.link.strength,
      context: result.link.context,
      created_at: result.link.createdAt,
    },
    entity: {
      name: result.entity.name,
      display_name: result.entity.displayName,
      type: result.entity.entityType,
    },
    interaction: result.interaction
      ? {
          id: result.interaction.id,
          type: result.interaction.interactionType,
          date: result.interaction.createdAt,
          summary: result.interaction.summary,
        }
      : undefined,
  }));

  return ResponseBuilder.success(
    {
      memories: formattedResults,
      total_found: formattedResults.length,
      search_criteria: {
        entity_name: args.entity_name,
        link_types: args.link_types,
        memory_keywords: args.memory_keywords,
        interaction_type: args.interaction_type,
        min_strength: minStrength,
        limit,
      },
    },
    `Found ${formattedResults.length} memory-social connections`
  );
};
