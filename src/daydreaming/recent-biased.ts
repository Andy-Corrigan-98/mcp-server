import { ConceptPair } from '../../daydreaming/types.js';
import { randomStrategy } from './random.js';

/**
 * Recent-biased concept sampling strategy
 * TODO: Implement bias towards recently accessed concepts
 */
export async function recentBiasedStrategy(
  focusArea?: string
): Promise<[ConceptPair['concept1'], ConceptPair['concept2']]> {
  // Implementation would prefer recently accessed concepts
  // For now, fall back to random sampling
  return randomStrategy(focusArea);
}
