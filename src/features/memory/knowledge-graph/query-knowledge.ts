import { InputValidator } from '../../../validation/index.js';
import { ConsciousnessPrismaService } from '../../../db/prisma-service.js';
import { ConfigurationService } from '../../../db/configuration-service.js';

/**
 * Query the agent knowledge graph for related concepts
 */
export async function queryKnowledgeGraph(args: {
  entity: string;
  depth?: number;
  relationship_types?: string[];
}): Promise<{
  success: boolean;
  entity?: string;
  depth_explored?: number;
  graph_data?: unknown[];
  semantic_insights?: string[];
  total_entities?: number;
  message?: string;
}> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Get configuration values
  const minGraphDepth = await config.getNumber('memory.min_graph_depth', 1);
  const maxGraphDepth = await config.getNumber('memory.max_graph_depth', 5);

  // Validate and sanitize inputs
  const entityName = InputValidator.validateEntityName(args.entity);
  const depth = Math.max(minGraphDepth, Math.min(maxGraphDepth, args.depth || 2));

  const graphData = await db.getEntityRelationships(entityName, depth);

  if (graphData.length === 0) {
    return {
      success: false,
      message: `Entity '${entityName}' not found in knowledge graph`,
    };
  }

  const insights = generateSemanticInsights(graphData);

  return {
    success: true,
    entity: entityName,
    depth_explored: depth,
    graph_data: graphData,
    semantic_insights: insights,
    total_entities: graphData.length,
  };
}

/**
 * Generate semantic insights from knowledge graph data
 */
function generateSemanticInsights(graphData: unknown[]): string[] {
  const insights: string[] = [];

  // Simple insight generation
  const entities = graphData as Array<{
    entityType: string;
    sourceRelationships?: Array<{ relationshipType: string }>;
    targetRelationships?: Array<{ relationshipType: string }>;
  }>;

  const entityTypes = [...new Set(entities.map(e => e.entityType))];
  if (entityTypes.length > 1) {
    insights.push(
      `Cross-domain connections found across ${entityTypes.length} entity types: ${entityTypes.join(', ')}`
    );
  }

  const relationshipTypes = new Set();
  entities.forEach(entity => {
    entity.sourceRelationships?.forEach(rel => relationshipTypes.add(rel.relationshipType));
    entity.targetRelationships?.forEach(rel => relationshipTypes.add(rel.relationshipType));
  });

  if (relationshipTypes.size > 0) {
    insights.push(`Relationship patterns: ${Array.from(relationshipTypes).join(', ')}`);
  }

  return insights;
}
