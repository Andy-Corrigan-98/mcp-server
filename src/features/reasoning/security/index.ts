/**
 * Security Module for GenAI Interactions
 * Provides prompt injection detection and content sanitization
 */

export {
  SecurityGuard,
  validateInput,
  sanitizeOutput,
  containsSensitiveInfo,
  type SecurityValidationResult
} from './security-guard.js'; 