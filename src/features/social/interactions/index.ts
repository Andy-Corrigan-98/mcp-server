/**
 * Social interactions - single-responsibility modules
 *
 * Each file has exactly one reason to change:
 * - load-config.ts: Configuration loading for interactions
 * - record.ts: Recording new social interactions
 * - search.ts: Searching and filtering past interactions
 */

// Configuration
export { loadInteractionConfig, type InteractionConfig } from './load-config.js';

// Operations
export { recordInteraction } from './record.js';
export { searchInteractions } from './search.js';
