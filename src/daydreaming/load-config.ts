import { ConfigurationService } from '../core/db/configuration-service.js';
import { DaydreamingConfig, DEFAULT_DAYDREAMING_CONFIG } from '../daydreaming/types.js';

/**
 * Load daydreaming configuration from database
 */
export async function loadDaydreamingConfig(): Promise<DaydreamingConfig> {
  const configService = ConfigurationService.getInstance();

  try {
    const config: DaydreamingConfig = {
      enabled: await configService.getBoolean('daydreaming.enabled', DEFAULT_DAYDREAMING_CONFIG.enabled),
      samplingIntervalMs: await configService.getNumber(
        'daydreaming.sampling_interval_ms',
        DEFAULT_DAYDREAMING_CONFIG.samplingIntervalMs
      ),
      maxConceptPairsPerCycle: await configService.getNumber(
        'daydreaming.max_concept_pairs_per_cycle',
        DEFAULT_DAYDREAMING_CONFIG.maxConceptPairsPerCycle
      ),
      minIdleTimeMs: await configService.getNumber(
        'daydreaming.min_idle_time_ms',
        DEFAULT_DAYDREAMING_CONFIG.minIdleTimeMs
      ),
      maxCognitiveLoad: await configService.getNumber(
        'daydreaming.max_cognitive_load',
        DEFAULT_DAYDREAMING_CONFIG.maxCognitiveLoad
      ),

      recentMemoryWeight: await configService.getNumber(
        'daydreaming.recent_memory_weight',
        DEFAULT_DAYDREAMING_CONFIG.recentMemoryWeight
      ),
      importanceWeight: await configService.getNumber(
        'daydreaming.importance_weight',
        DEFAULT_DAYDREAMING_CONFIG.importanceWeight
      ),
      noveltyWeight: await configService.getNumber(
        'daydreaming.novelty_weight',
        DEFAULT_DAYDREAMING_CONFIG.noveltyWeight
      ),

      maxThoughtsPerConnection: await configService.getNumber(
        'daydreaming.max_thoughts_per_connection',
        DEFAULT_DAYDREAMING_CONFIG.maxThoughtsPerConnection
      ),
      explorationDepth: await configService.getNumber(
        'daydreaming.exploration_depth',
        DEFAULT_DAYDREAMING_CONFIG.explorationDepth
      ),

      noveltyThreshold: await configService.getNumber(
        'daydreaming.novelty_threshold',
        DEFAULT_DAYDREAMING_CONFIG.noveltyThreshold
      ),
      plausibilityThreshold: await configService.getNumber(
        'daydreaming.plausibility_threshold',
        DEFAULT_DAYDREAMING_CONFIG.plausibilityThreshold
      ),
      valueThreshold: await configService.getNumber(
        'daydreaming.value_threshold',
        DEFAULT_DAYDREAMING_CONFIG.valueThreshold
      ),

      useGenAIEvaluation: await configService.getBoolean(
        'daydreaming.use_genai_evaluation',
        DEFAULT_DAYDREAMING_CONFIG.useGenAIEvaluation
      ),
    };

    return config;
  } catch (error) {
    console.warn('Failed to load daydreaming configuration, using defaults:', error);
    return { ...DEFAULT_DAYDREAMING_CONFIG };
  }
}








