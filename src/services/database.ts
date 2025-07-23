import { ConsciousnessPrismaService } from '@/db/prisma-service.js';
import type { PrismaClient } from '@prisma/client';

/**
 * Pure database service functions
 * Replaces the singleton pattern with explicit dependency injection
 */

// Type for database operations with proper Prisma client typing
export type DatabaseOperation<T> = (prisma: PrismaClient) => Promise<T>;

/**
 * Execute a database operation with the singleton instance
 * This bridges the gap while we migrate away from singletons
 */
export const executeDatabase = async <T>(operation: DatabaseOperation<T>): Promise<T> => {
  const db = ConsciousnessPrismaService.getInstance();
  return db.execute(operation);
};

/**
 * Get the database instance (temporary bridge function)
 * Use this during migration, then remove once we eliminate singletons
 */
export const getDatabaseInstance = () => {
  return ConsciousnessPrismaService.getInstance();
};

/**
 * Database service interface for dependency injection
 */
export interface DatabaseService {
  execute: <T>(operation: DatabaseOperation<T>) => Promise<T>;
}

/**
 * Create a database service instance
 * Eventually this will replace the singleton pattern entirely
 */
export const createDatabaseService = (): DatabaseService => ({
  execute: executeDatabase,
});
