/**
 * Relationship management functions
 * Barrel export for single-responsibility relationship functions
 */

// Export configuration
export { loadRelationshipConfig, type RelationshipConfig, DEFAULT_CONFIG } from './load-config.js';

// Export CRUD operations
export { createRelationship } from './create.js';
export { updateRelationship } from './update.js';
export { deleteRelationship } from './delete.js';

// Export query operations
export { getRelationshipByEntityId } from './get-by-id.js';
// export { getRelationshipByEntityName } from './get-by-name.js'; // V1 function - removed
export { listRelationships } from './list.js';
