/**
 * Get knowledge graph entities that can serve as concepts for daydreaming
 */
export async function getKnowledgeGraphEntities(_focusArea?: string): Promise<unknown[]> {
  try {
    // Query the knowledge graph for entities
    // For now, return empty array as this needs integration with the knowledge graph system
    // TODO: Implement actual knowledge graph querying when knowledge graph is available
    return [];
  } catch (error) {
    console.warn('Failed to fetch knowledge graph entities:', error);
    return [];
  }
}
