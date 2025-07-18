import { InputValidator } from '../../../validation/index.js';
import { Intention } from '../../../tools/consciousness/types.js';
import { ConsciousnessPrismaService } from '../../../db/prisma-service.js';
import { ConfigurationService } from '../../../db/configuration-service.js';
import { GuidGenerator } from '../../../utils/guid.js';

/**
 * Store persistent intentions in brain storage for tracking across sessions
 */
export async function setIntention(args: {
  intention: string;
  priority?: string;
  context?: string;
  duration?: string;
  success_criteria?: string;
}): Promise<{
  intentionId: string;
  stored: boolean;
  priority: string;
  duration: string;
  status: string;
  message: string;
}> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Load configuration values
  const maxIntentionLength = await config.getNumber('consciousness.max_intention_length', 500);
  const maxContextLength = await config.getNumber('consciousness.max_context_length', 1000);
  const priorityLevels = await config.getEnumArray('personality.priority_levels', [
    'whisper',
    'gentle_nudge',
    'urgent_pulse',
    'burning_focus',
  ]);
  const intentionStatuses = await config.getEnumArray('personality.intention_statuses', [
    'pulsing_active',
    'fulfilled_completion',
    'gentle_pause',
    'conscious_release',
  ]);
  const intentionDurations = await config.getEnumArray('personality.intention_durations', [
    'momentary_focus',
    'daily_rhythm',
    'weekly_arc',
    'eternal_truth',
  ]);

  // Validate and sanitize inputs
  const intention = InputValidator.sanitizeString(args.intention, maxIntentionLength);
  const priority = args.priority || priorityLevels[1];
  const context = args.context ? InputValidator.sanitizeString(args.context, maxContextLength) : undefined;
  const duration = args.duration || intentionDurations[0];
  const successCriteria = args.success_criteria
    ? InputValidator.sanitizeString(args.success_criteria, maxIntentionLength)
    : undefined;

  const intentionId = GuidGenerator.generateIntentionId();

  const intentionData: Intention = {
    id: intentionId,
    description: intention,
    priority,
    context,
    duration,
    successCriteria,
    status: intentionStatuses[0], // Default to first status (e.g., 'pulsing_active')
    createdAt: new Date(),
    updatedAt: new Date(),
    progressNotes: [],
  };

  // Store the intention in memory
  await db.storeMemory({
    key: `intention_${intentionId}`,
    content: intentionData,
    tags: ['intention', 'brain_storage', priority, duration],
    importance: priority === priorityLevels[3] ? 'critical' : 'high', // burning_focus = critical
  });

  return {
    intentionId,
    stored: true,
    priority,
    duration,
    status: intentionData.status,
    message: `Intention stored in brain storage with ${priority} priority`,
  };
}
