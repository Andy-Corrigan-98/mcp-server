import { MemoryData } from '../core/db/index.js';
import { InputValidator } from '../core/validation/index.js';
import { ConsciousnessPrismaService } from '../core/db/prisma-service.js';
import { ConfigurationService } from '../core/db/configuration-service.js';

/**
 * Store information in agent consciousness memory
 */
export async function storeMemory(args: {
  key: string;
  content: unknown;
  tags?: string[];
  importance?: string;
}): Promise<{
  success: boolean;
  key: string;
  stored_at: string;
  message: string;
}> {
  const config = ConfigurationService.getInstance();
  const db = ConsciousnessPrismaService.getInstance();

  // Get configuration values
  const maxTagLength = await config.getNumber('memory.max_tag_length', 100);

  // Validate and sanitize inputs
  const key = InputValidator.validateKey(args.key);
  const content = args.content;
  const tags = (args.tags as string[]) || [];
  const importance = InputValidator.validateImportanceLevel((args.importance as string) || 'medium');

  // Sanitize tags
  const sanitizedTags = tags.map(tag => InputValidator.sanitizeString(tag, maxTagLength));

  const memoryData: MemoryData = {
    key,
    content: content as Record<string, unknown>,
    tags: sanitizedTags || [],
    importance,
  };

  const result = await db.storeMemory({
    key: memoryData.key,
    content: memoryData.content as Record<string, unknown>,
    tags: memoryData.tags || [],
    importance: (memoryData.importance as any) || 'medium'
  });

  return {
    success: true,
    key: result.key,
    stored_at: result.storedAt.toISOString(),
    message: `Memory stored successfully with key: ${key}`,
  };
}
