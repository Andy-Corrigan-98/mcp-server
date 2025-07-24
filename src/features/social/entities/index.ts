/**
 * Social entities - single-responsibility modules
 *
 * Each file has exactly one reason to change:
 * - load-config.ts: Configuration loading and validation
 * - create.ts: Entity creation logic
 * - update.ts: Entity modification logic
 * - get-by-id.ts: ID-based retrieval operations
 * - get-by-name.ts: Name-based retrieval operations
 * - list.ts: Entity listing and filtering
 * - delete.ts: Entity deletion operations
 */

// Configuration
export { loadEntityConfig, type EntityConfig } from './load-config.js';

// CRUD operations
export { createEntity } from './create.js';
export { updateEntity } from './update.js';
export { getEntityById } from './get-by-id.js';
export { getEntityByName } from './get-by-name.js';
export { listEntities } from './list.js';
export { deleteEntity } from './delete.js';
