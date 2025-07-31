import { ConceptPair } from '../../daydreaming/types.js';
import { getKnowledgeGraphEntities } from '../../sources/knowledge-graph.js';
import { getRecentMemories } from '../../sources/memory.js';

const DEFAULT_LIMIT = 10;

/**
 * Random concept sampling strategy
 */
export async function randomStrategy(focusArea?: string): Promise<[ConceptPair['concept1'], ConceptPair['concept2']]> {
  // Get available entities from knowledge graph
  const kgEntities = await getKnowledgeGraphEntities(focusArea);

  // Get recent memories
  const recentMemories = await getRecentMemories(focusArea);

  // Combine all concept sources
  const allConcepts = [...kgEntities, ...recentMemories];

  if (allConcepts.length < 2) {
    throw new Error('Insufficient concepts available for random sampling');
  }

  // Random selection with proper typing
  const concept1 = allConcepts[Math.floor(Math.random() * allConcepts.length)] as ConceptPair['concept1'];
  let concept2 = allConcepts[Math.floor(Math.random() * allConcepts.length)] as ConceptPair['concept2'];

  // Ensure we don't pick the same concept twice
  let attempts = 0;
  while (concept1.entity === concept2.entity && attempts < DEFAULT_LIMIT) {
    concept2 = allConcepts[Math.floor(Math.random() * allConcepts.length)] as ConceptPair['concept2'];
    attempts++;
  }

  return [concept1, concept2];
}
