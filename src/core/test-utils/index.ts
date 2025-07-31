/**
 * Modern Test Utilities for Phase 3 Testing Architecture
 * Designed around Phase 1/2 patterns (ErrorFactory, ConfigurationSchema, ResponseBuilder, ToolExecutor)
 */

// Core test utilities
export { TestErrorChecker } from './error-testing.js';
export { TestConfigBuilder } from './config-testing.js';
export { TestResponseValidator } from './response-testing.js';
export { TestToolHarness } from './tool-testing.js';

// Test data factories
export { TestDataFactory } from './data-factory.js';
export { TestScenarioBuilder } from './scenario-builder.js';

// Integration test utilities
export { IntegrationTestRunner } from './integration-testing.js';
export { DatabaseTestManager } from './database-testing.js';

// Assertion helpers
export { ErrorAssertions } from './error-assertions.js';
export { ResponseAssertions } from './response-assertions.js';

// Test patterns and builders
export { TestPatterns } from './test-patterns.js';

// Types for test utilities
export type {
  TestConfig,
  TestScenario,
  TestDataSet,
  ErrorTestCase,
  ResponseTestCase,
  ToolTestCase,
  IntegrationTestOptions,
  DatabaseTestOptions,
} from './types.js';








