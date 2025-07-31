import { ConceptPair } from '../../daydreaming/types.js';
import { randomStrategy } from './random.js';

/**
 * Cross-domain concept sampling strategy
 * TODO: Implement selection ensuring concepts come from different entity types/domains
 */
export async function crossDomainStrategy(
  focusArea?: string
): Promise<[ConceptPair['concept1'], ConceptPair['concept2']]> {
  // Implementation would ensure concepts come from different entity types
  // For now, fall back to random sampling
  return randomStrategy(focusArea);
}
