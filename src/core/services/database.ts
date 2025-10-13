/**
 * Database Service - v2 Consciousness Substrate
 * Provides unified database access layer for the consciousness railroad
 */

import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

/**
 * Get or create Prisma client instance
 */
function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

/**
 * Execute database operation with proper error handling and connection management
 */
export async function executeDatabase<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const prisma = getPrismaClient();
    const data = await operation(prisma);
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    console.error('Database operation failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Close database connection (for cleanup)
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}

/**
 * Test database connectivity
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}