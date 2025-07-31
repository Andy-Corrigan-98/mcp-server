import { ConceptPair } from '../daydreaming/types.js';
import { randomStrategy } from './strategies/random.js';
import { importanceWeightedStrategy } from './strategies/importance-weighted.js';
import { recentBiasedStrategy } from './strategies/recent-biased.js';
import { crossDomainStrategy } from './strategies/cross-domain.js';

const MAX_CONCEPT_RESULTS = 10;
const MAX_ATTEMPTS_MULTIPLIER = 10;
const IDLE_THRESHOLD_HOURS = 6;

/**
 * Sample concept pairs using the specified strategy
 */
export async function sampleConceptPairs(
  count: number,
  focusArea?: string,
  strategy: string = 'importance_weighted',
  excludeRecent: boolean = true,
  recentlyExploredPairs?: Map<string, Date>
): Promise<ConceptPair[]> {
  const pairs: ConceptPair[] = [];
  const maxAttempts = count * MAX_ATTEMPTS_MULTIPLIER;
  let attempts = 0;

  while (pairs.length < count && attempts < maxAttempts) {
    attempts++;

    let concept1: ConceptPair['concept1'], concept2: ConceptPair['concept2'];

    // Use appropriate sampling strategy
    switch (strategy) {
      case 'random':
        [concept1, concept2] = await randomStrategy(focusArea);
        break;
      case 'importance_weighted':
        [concept1, concept2] = await importanceWeightedStrategy(focusArea);
        break;
      case 'recent_bias':
        [concept1, concept2] = await recentBiasedStrategy(focusArea);
        break;
      case 'cross_domain':
        [concept1, concept2] = await crossDomainStrategy(focusArea);
        break;
      default:
        [concept1, concept2] = await importanceWeightedStrategy(focusArea);
    }

    if (concept1 && concept2 && concept1.entity !== concept2.entity) {
      const pair: ConceptPair = {
        concept1,
        concept2,
        samplingReason: `${strategy} sampling${focusArea ? ` focused on ${focusArea}` : ''}`,
        sampledAt: new Date(),
      };

      // Check if we should exclude recently explored pairs
      if (excludeRecent && recentlyExploredPairs) {
        const pairKey = getConceptPairKey(pair);
        const recentThreshold = new Date();
        recentThreshold.setHours(recentThreshold.getHours() - IDLE_THRESHOLD_HOURS);

        const lastExplored = recentlyExploredPairs.get(pairKey);
        if (lastExplored && lastExplored > recentThreshold) {
          continue; // Skip this pair, try again
        }
      }

      pairs.push(pair);
    }
  }

  return pairs;
}

/**
 * Simple API for sampling concepts with default parameters
 */
export async function sampleConcepts(args: Record<string, unknown>): Promise<{ conceptPairs: ConceptPair[] }> {
  const count = Math.min((args.count as number) || 1, MAX_CONCEPT_RESULTS / 2);
  const strategy = (args.strategy as string) || 'importance_weighted';
  const excludeRecent = (args.exclude_recent as boolean) !== false;

  const conceptPairs = await sampleConceptPairs(count, undefined, strategy, excludeRecent);

  return { conceptPairs };
}

/**
 * Generate a unique key for a concept pair for tracking purposes
 */
function getConceptPairKey(pair: ConceptPair): string {
  const entities = [pair.concept1.entity, pair.concept2.entity].sort();
  return `${entities[0]}--${entities[1]}`;
}
