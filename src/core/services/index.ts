/**
 * Core Services Index - v2 Consciousness Substrate
 * Exports all core services for the consciousness railroad
 */

// Database service
export { executeDatabase, closeDatabaseConnection, testDatabaseConnection } from './database.js';

// Configuration service
export { ConfigurationService } from './configuration.js';

// Validation service
export {
  validateRequiredString,
  validateOptionalString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateThoughtInput,
  validatePromptLength,
  validateConversationHistory,
  sanitizeString,
  validateProbability,
  validateEnum,
  validateAndStringifyJson
} from './validation.js';