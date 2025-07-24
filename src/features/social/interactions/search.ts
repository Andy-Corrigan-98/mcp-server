import { executeDatabase } from '../../../services/database.js';
import { sanitizeString } from '../../../services/validation.js';
import { ResponseBuilder } from '../../../utils/response-builder.js';
import { getEntityByName } from '../entities/get-by-name.js';

/**
 * Interaction search
 * Single responsibility: Searching for past social interactions
 */

/**
 * Search for past interactions with filtering
 */
export const searchInteractions = async (args: {
  entity_name?: string;
  interaction_type?: string;
  context_keywords?: string[];
  date_range?: {
    start?: string;
    end?: string;
  };
  limit?: number;
}): Promise<object> => {
  // TODO: Use config for advanced search features
  // const config = await loadInteractionConfig();
  const limit = Math.min(args.limit || 10, 50); // Cap at 50 results

  // Build query conditions
  const whereConditions: any = {};

  // Filter by entity if specified
  if (args.entity_name) {
    const entity = await getEntityByName(args.entity_name);
    if (!entity) {
      throw new Error(`Social entity '${args.entity_name}' not found`);
    }
    whereConditions.entityId = entity.id;
  }

  // Filter by interaction type
  if (args.interaction_type) {
    whereConditions.interactionType = sanitizeString(args.interaction_type, 50);
  }

  // Filter by date range
  if (args.date_range) {
    const dateFilter: any = {};
    if (args.date_range.start) {
      dateFilter.gte = new Date(args.date_range.start);
    }
    if (args.date_range.end) {
      dateFilter.lte = new Date(args.date_range.end);
    }
    if (Object.keys(dateFilter).length > 0) {
      whereConditions.createdAt = dateFilter;
    }
  }

  // Search for interactions
  const interactions = await executeDatabase(async prisma => {
    let query = prisma.socialInteraction.findMany({
      where: whereConditions,
      include: {
        entity: {
          select: {
            name: true,
            displayName: true,
            entityType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Apply keyword filtering if specified
    if (args.context_keywords && args.context_keywords.length > 0) {
      const keywordFilter = args.context_keywords
        .map(keyword => sanitizeString(keyword, 100))
        .filter((k): k is string => k !== undefined && k.length > 0);

      if (keywordFilter.length > 0) {
        const orConditions = keywordFilter.flatMap(keyword => [
          { context: { contains: keyword, mode: 'insensitive' as const } },
          { summary: { contains: keyword, mode: 'insensitive' as const } },
          { learningExtracted: { contains: keyword, mode: 'insensitive' as const } },
        ]);

        whereConditions.OR = orConditions;
        query = prisma.socialInteraction.findMany({
          where: whereConditions,
          include: {
            entity: {
              select: {
                name: true,
                displayName: true,
                entityType: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        });
      }
    }

    return query;
  });

  // Format results
  const formattedInteractions = interactions.map((interaction: any) => ({
    id: interaction.id,
    entity: {
      name: interaction.entity.name,
      display_name: interaction.entity.displayName,
      type: interaction.entity.entityType,
    },
    interaction_type: interaction.interactionType,
    context: interaction.context,
    summary: interaction.summary,
    duration: interaction.duration,
    quality: interaction.quality,
    learning_extracted: interaction.learningExtracted,
    emotional_tone: interaction.emotionalTone,
    created_at: interaction.createdAt,
  }));

  return ResponseBuilder.success(
    {
      interactions: formattedInteractions,
      total_found: formattedInteractions.length,
      search_criteria: {
        entity_name: args.entity_name,
        interaction_type: args.interaction_type,
        context_keywords: args.context_keywords,
        date_range: args.date_range,
        limit,
      },
    },
    `Found ${formattedInteractions.length} interactions`
  );
};
