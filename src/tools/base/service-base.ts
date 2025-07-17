import { ConsciousnessPrismaService } from '@/db/prisma-service.js';
import { ConfigurationService } from '@/db/configuration-service.js';

/**
 * Simple base class for tool modules that need database and configuration services
 * Handles only the service initialization pattern - configuration loading is left to subclasses
 *
 * Usage:
 * export class MyTools extends ServiceBase {
 *   constructor() {
 *     super();
 *     // Your custom initialization here
 *   }
 * }
 */
export abstract class ServiceBase {
  protected db: ConsciousnessPrismaService;
  protected configService: ConfigurationService;

  constructor() {
    this.db = ConsciousnessPrismaService.getInstance();
    this.configService = ConfigurationService.getInstance();
  }
}
