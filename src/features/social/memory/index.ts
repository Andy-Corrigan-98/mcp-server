/**
 * Memory-social integration - single-responsibility modules
 *
 * Each file has exactly one reason to change:
 * - link-create.ts: Creating connections between memories and social entities
 * - search.ts: Searching for memories connected to social relationships
 * - context.ts: Rich context about shared memories and experiences
 */

// Operations
export { createMemorySocialLink } from './link-create.js';
export { searchMemorySocialLinks } from './search.js';
export { getSocialMemoryContext } from './context.js';
