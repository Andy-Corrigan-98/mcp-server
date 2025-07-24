import { ConfigurationService } from '../../../db/configuration-service.js';

/**
 * Configuration for social interactions
 */
export interface InteractionConfig {
  maxSummaryLength: number;
  maxContextLength: number;
  maxLearningLength: number;
  defaultQuality: number;
  maxRelatedMemories: number;
}

/**
 * Load and validate interaction configuration
 */
export async function loadInteractionConfig(): Promise<InteractionConfig> {
  const configService = ConfigurationService.getInstance();

  return {
    maxSummaryLength: await configService.getNumber('social.max_summary_length', 500),
    maxContextLength: await configService.getNumber('social.max_context_length', 500),
    maxLearningLength: await configService.getNumber('social.max_learning_length', 300),
    defaultQuality: await configService.getNumber('social.default_quality', 0.5),
    maxRelatedMemories: await configService.getNumber('social.max_related_memories', 10),
  };
}
