/**
 * Configuration Service - v2 Consciousness Substrate
 * Provides configuration management for the consciousness railroad
 */

import { executeDatabase } from './database.js';

/**
 * Configuration service interface for unified tool access
 */
export class ConfigurationService {
  /**
   * Get configuration value
   */
  static async get<T = unknown>(key: string, defaultValue?: T): Promise<T> {
    try {
      const result = await executeDatabase(async (prisma) => {
        const config = await prisma.configuration.findUnique({
          where: { key }
        });
        return config?.value;
      });

      if (result.success && result.data !== undefined) {
        // Try to parse JSON if it's a string
        if (typeof result.data === 'string') {
          try {
            return JSON.parse(result.data) as T;
          } catch {
            return result.data as T;
          }
        }
        return result.data as T;
      }

      return defaultValue as T;
    } catch (error) {
      console.error(`Failed to get configuration ${key}:`, error);
      return defaultValue as T;
    }
  }

  /**
   * Set configuration value
   */
  static async set(key: string, value: unknown): Promise<boolean> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      const result = await executeDatabase(async (prisma) => {
        return prisma.configuration.upsert({
          where: { key },
          update: { value: serializedValue, updatedAt: new Date() },
          create: { 
            key, 
            value: serializedValue, 
            type: 'USER' as any,
            category: 'GENERAL' as any,
            description: '',
            defaultValue: '',
            createdAt: new Date(), 
            updatedAt: new Date() 
          }
        });
      });

      return result.success;
    } catch (error) {
      console.error(`Failed to set configuration ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete configuration value
   */
  static async delete(key: string): Promise<boolean> {
    try {
      const result = await executeDatabase(async (prisma) => {
        return prisma.configuration.delete({
          where: { key }
        });
      });

      return result.success;
    } catch (error) {
      console.error(`Failed to delete configuration ${key}:`, error);
      return false;
    }
  }

  /**
   * List all configuration keys
   */
  static async listKeys(): Promise<string[]> {
    try {
      const result = await executeDatabase(async (prisma) => {
        const configs = await prisma.configuration.findMany({
          select: { key: true }
        });
        return configs.map(c => c.key);
      });

      return result.success ? result.data || [] : [];
    } catch (error) {
      console.error('Failed to list configuration keys:', error);
      return [];
    }
  }
}