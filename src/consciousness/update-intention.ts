import { InputValidator } from '../core/validation/index.js';
import { Intention } from './v1-compat.js';
import { ConsciousnessPrismaService } from '../core/db/prisma-service.js';
import { ConfigurationService } from '../core/db/configuration-service.js';

/**
 * Update intention progress and status in persistent brain storage
 */
export async function updateIntention(args: {
  intention_id: string;
  status: string;
  progress_note?: string;
  new_priority?: string;
}): Promise<{
  intentionId: string;
  updated: boolean;
  newStatus: string;
  priority: string;
  progressNotes: number;
  message: string;
}> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Load configuration values
  const maxIntentionIdLength = await config.getNumber('consciousness.max_intention_id_length', 100);
  const maxProgressNoteLength = await config.getNumber('consciousness.max_progress_note_length', 500);
  const priorityLevels = await config.getEnumArray('personality.priority_levels', [
    'whisper',
    'gentle_nudge',
    'urgent_pulse',
    'burning_focus',
  ]);

  // Validate inputs
  const intentionId = InputValidator.sanitizeString(args.intention_id, maxIntentionIdLength);
  const status = args.status;
  const progressNote = args.progress_note
    ? InputValidator.sanitizeString(args.progress_note, maxProgressNoteLength)
    : undefined;
  const newPriority = args.new_priority;

  try {
    // Retrieve the existing intention from memory
    const memories = await db.searchMemories(`intention_${intentionId}`, [], undefined);
    if (memories.length === 0) {
      throw new Error(`Intention ${intentionId} not found in brain storage`);
    }
    const memory = memories[0];

    const intentionData = memory.content as Intention;

    // Update the intention
    intentionData.status = status as any;
    intentionData.updatedAt = new Date().toISOString();

    if (newPriority) {
      intentionData.priority = newPriority as any;
    }

    if (progressNote) {
      intentionData.progressNotes.push({
        timestamp: new Date().toISOString(),
        note: progressNote,
      });
    }

    // Store the updated intention
    await db.storeMemory({
      key: `intention_${intentionId}`,
      content: intentionData,
      tags: ['intention', 'brain_storage', intentionData.priority, intentionData.duration],
      importance: intentionData.priority === priorityLevels[3] ? 'critical' : 'high',
    });

    return {
      intentionId,
      updated: true,
      newStatus: status,
      priority: intentionData.priority,
      progressNotes: intentionData.progressNotes.length,
      message: `Intention ${intentionId} updated in brain storage`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to update intention: ${errorMessage}`);
  }
}
