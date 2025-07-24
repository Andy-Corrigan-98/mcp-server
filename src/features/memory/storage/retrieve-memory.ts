import { InputValidator } from '../../../validation/index.js';
import { ConsciousnessPrismaService } from '../../../db/prisma-service.js';

/**
 * Retrieve information from agent consciousness memory
 */
export async function retrieveMemory(args: { key: string }): Promise<{
  success: boolean;
  memory?: {
    key: string;
    content: unknown;
    tags: string[];
    importance: string;
    stored_at: string;
    access_count: number;
    last_accessed: string;
  };
  message?: string;
}> {
  const db = ConsciousnessPrismaService.getInstance();

  // Validate inputs
  const key = InputValidator.validateKey(args.key);

  const memory = await db.retrieveMemory(key);

  if (!memory) {
    return {
      success: false,
      message: `No memory found with key: ${key}`,
    };
  }

  return {
    success: true,
    memory: {
      key: memory.key,
      content: memory.content,
      tags: memory.tags,
      importance: memory.importance,
      stored_at: memory.storedAt.toISOString(),
      access_count: memory.accessCount,
      last_accessed: memory.lastAccessed?.toISOString() || memory.storedAt.toISOString(),
    },
  };
}
