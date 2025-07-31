import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { MCPError } from '../utils/error-factory.js';
import type { ApiResponse } from '../utils/response-builder.js';

/**
 * Core test configuration interface
 */
export interface TestConfig {
  enableDebugLogging?: boolean;
  testDatabaseUrl?: string;
  skipCleanup?: boolean;
  timeoutMs?: number;
  parallel?: boolean;
}

/**
 * Test scenario definition for consistent test structure
 */
export interface TestScenario<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  input: TInput;
  expectedOutput?: TOutput;
  expectError?: boolean;
  expectedErrorType?: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  timeout?: number;
}

/**
 * Test data set with multiple scenarios
 */
export interface TestDataSet<TInput = unknown, TOutput = unknown> {
  category: string;
  scenarios: TestScenario<TInput, TOutput>[];
  globalSetup?: () => Promise<void>;
  globalTeardown?: () => Promise<void>;
}

/**
 * Error testing configuration
 */
export interface ErrorTestCase {
  name: string;
  errorType: string;
  expectedMessage?: string;
  expectedContext?: Record<string, unknown>;
  shouldHaveTimestamp?: boolean;
  shouldHaveStack?: boolean;
}

/**
 * Response testing configuration
 */
export interface ResponseTestCase {
  name: string;
  response: ApiResponse;
  expectSuccess?: boolean;
  expectedDataShape?: Record<string, unknown>;
  expectedMetadata?: Record<string, unknown>;
  validatePagination?: boolean;
}

/**
 * Tool testing configuration
 */
export interface ToolTestCase {
  name: string;
  toolName: string;
  input: Record<string, unknown>;
  expectedOutputShape?: Record<string, unknown>;
  expectError?: boolean;
  expectedErrorType?: string;
  validateExecution?: boolean;
}

/**
 * Integration test options
 */
export interface IntegrationTestOptions {
  setupDatabase?: boolean;
  useTransactions?: boolean;
  isolateTests?: boolean;
  cleanupBetweenTests?: boolean;
  maxConcurrent?: number;
  timeoutMs?: number;
}

/**
 * Database test management options
 */
export interface DatabaseTestOptions {
  useTestDatabase?: boolean;
  resetBetweenTests?: boolean;
  seedData?: boolean;
  enableLogging?: boolean;
  transactionMode?: 'auto' | 'manual' | 'none';
}

/**
 * Tool execution result for testing
 */
export interface ToolExecutionResult {
  success: boolean;
  result?: unknown;
  error?: MCPError;
  executionTime?: number;
  toolName: string;
  input: Record<string, unknown>;
}

/**
 * Configuration test result
 */
export interface ConfigTestResult {
  loaded: boolean;
  values: Record<string, unknown>;
  errors: string[];
  warnings: string[];
  validationPassed: boolean;
}

/**
 * Error validation result
 */
export interface ErrorValidationResult {
  isValidMCPError: boolean;
  hasCorrectType: boolean;
  hasTimestamp: boolean;
  hasContext: boolean;
  contextValid: boolean;
  messageValid: boolean;
}

/**
 * Response validation result
 */
export interface ResponseValidationResult {
  isValidResponse: boolean;
  hasCorrectStructure: boolean;
  metadataValid: boolean;
  dataValid: boolean;
  paginationValid?: boolean;
  typeMatches: boolean;
}

/**
 * Test assertion helpers type
 */
export interface TestAssertions {
  expectMCPError: (error: unknown, expectedType?: string) => void;
  expectSuccessResponse: <T>(response: ApiResponse<T>) => void;
  expectErrorResponse: (response: ApiResponse) => void;
  expectValidPagination: (response: ApiResponse) => void;
  expectValidTimestamp: (timestamp: string) => void;
  expectValidToolSchema: (tool: Tool) => void;
}

/**
 * Mock configuration for testing
 */
export interface MockConfig {
  mockDatabaseCalls?: boolean;
  mockExternalServices?: boolean;
  mockTimeOperations?: boolean;
  customMocks?: Record<string, unknown>;
}

/**
 * Performance test metrics
 */
export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  dbQueries: number;
  errorCount: number;
  successRate: number;
}

/**
 * Test report generation options
 */
export interface TestReportOptions {
  includePerformance?: boolean;
  includeCoverage?: boolean;
  includeErrorDetails?: boolean;
  outputFormat?: 'json' | 'html' | 'markdown';
  outputPath?: string;
}








