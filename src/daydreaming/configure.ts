import { ConfigurationService } from '../core/db/configuration-service.js';
import { DaydreamingConfig } from '../daydreaming/types.js';

const MINUTES_TO_MS = 60000;

/**
 * Update daydreaming configuration settings
 */
export async function configureDaydreaming(
  args: Record<string, unknown>
): Promise<{ message: string; updatedConfig: Partial<DaydreamingConfig> }> {
  const configService = ConfigurationService.getInstance();
  const updates: Partial<DaydreamingConfig> = {};

  if (typeof args.enabled === 'boolean') {
    await configService.setValue(
      'daydreaming.enabled',
      args.enabled,
      'BOOLEAN' as any,
      'SYSTEM' as any,
      'Enable or disable Day-Dreaming Loop'
    );
    updates.enabled = args.enabled;
  }

  if (typeof args.sampling_interval_minutes === 'number') {
    const intervalMs = args.sampling_interval_minutes * MINUTES_TO_MS;
    await configService.setValue(
      'daydreaming.sampling_interval_ms',
      intervalMs,
      'NUMBER' as any,
      'SYSTEM' as any,
      'Sampling interval in milliseconds'
    );
    updates.samplingIntervalMs = intervalMs;
  }

  if (typeof args.novelty_threshold === 'number') {
    const threshold = Math.max(0, Math.min(1, args.novelty_threshold));
    await configService.setValue(
      'daydreaming.novelty_threshold',
      threshold,
      'NUMBER' as any,
      'SYSTEM' as any,
      'Minimum novelty score for storing insights'
    );
    updates.noveltyThreshold = threshold;
  }

  if (typeof args.max_cognitive_load === 'number') {
    const load = Math.max(0, Math.min(1, args.max_cognitive_load));
    await configService.setValue(
      'daydreaming.max_cognitive_load',
      load,
      'NUMBER' as any,
      'SYSTEM' as any,
      'Maximum cognitive load before pausing daydreaming'
    );
    updates.maxCognitiveLoad = load;
  }

  const configKeys = Object.keys(updates);
  const message =
    configKeys.length > 0 ? `Updated ${configKeys.join(', ')} configuration` : 'No configuration changes made';

  return {
    message,
    updatedConfig: updates,
  };
}








