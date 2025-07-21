import { MCPError, ErrorFactory, ERROR_TYPES } from '../utils/error-factory.js';
import type { ErrorTestCase, ErrorValidationResult } from './types.js';

// Constants to avoid magic numbers
const DEFAULT_PERFORMANCE_THRESHOLD = 100;
const STRESS_TEST_ITERATIONS = 150;

/**
 * Comprehensive error testing utilities designed around ErrorFactory patterns
 * Provides consistent validation for all error types and contexts
 */
export class TestErrorChecker {
  /**
   * Validate that an error is a properly formed MCPError
   */
  static validateMCPError(error: unknown, expectedType?: string): ErrorValidationResult {
    const result: ErrorValidationResult = {
      isValidMCPError: false,
      hasCorrectType: false,
      hasTimestamp: false,
      hasContext: false,
      contextValid: false,
      messageValid: false
    };

    // Check if it's an MCPError
    if (!(error instanceof MCPError)) {
      return result;
    }
    result.isValidMCPError = true;

    // Check type
    if (expectedType) {
      result.hasCorrectType = error.type === expectedType;
    } else {
      result.hasCorrectType = Object.values(ERROR_TYPES).includes(error.type as typeof ERROR_TYPES[keyof typeof ERROR_TYPES]);
    }

    // Check timestamp
    result.hasTimestamp = Boolean(error.timestamp && !isNaN(Date.parse(error.timestamp)));

    // Check context
    result.hasContext = error.context !== undefined;
    if (result.hasContext) {
      result.contextValid = typeof error.context === 'object' && error.context !== null;
    }

    // Check message
    result.messageValid = Boolean(error.message && typeof error.message === 'string' && error.message.length > 0);

    return result;
  }

  /**
   * Validate that an error type is valid
   */
  static validateErrorType(errorType: string): boolean {
    return Object.values(ERROR_TYPES).includes(errorType as typeof ERROR_TYPES[keyof typeof ERROR_TYPES]);
  }

  /**
   * Check if error context is valid and contains expected data
   */
  static checkErrorContext(context: Record<string, unknown>): boolean {
    return typeof context === 'object' && context !== null;
  }

  /**
   * Create test cases for all error types
   */
  static createErrorTestCases(): ErrorTestCase[] {
    return [
      {
        name: 'Entity Not Found Error',
        errorType: ERROR_TYPES.ENTITY_NOT_FOUND,
        expectedMessage: 'Test Entity \'test-id\' not found',
        expectedContext: { entityType: 'Test Entity', identifier: 'test-id' },
        shouldHaveTimestamp: true,
        shouldHaveStack: true
      },
      {
        name: 'Validation Failed Error',
        errorType: ERROR_TYPES.VALIDATION_FAILED,
        expectedMessage: 'Field \'testField\' is required',
        expectedContext: { fieldName: 'testField', validationType: 'required' },
        shouldHaveTimestamp: true
      },
      {
        name: 'Tool Not Found Error',
        errorType: ERROR_TYPES.TOOL_NOT_FOUND,
        expectedMessage: 'Unknown test tool: nonexistent_tool',
        expectedContext: { toolName: 'nonexistent_tool', category: 'test' },
        shouldHaveTimestamp: true
      },
      {
        name: 'Configuration Error',
        errorType: ERROR_TYPES.CONFIGURATION_ERROR,
        expectedMessage: 'Configuration key \'test.key\' not found',
        expectedContext: { configKey: 'test.key', errorType: 'not_found' },
        shouldHaveTimestamp: true
      },
      {
        name: 'Security Violation Error',
        errorType: ERROR_TYPES.SECURITY_VIOLATION,
        expectedMessage: 'Security violations detected: test violation',
        expectedContext: { violations: ['test violation'] },
        shouldHaveTimestamp: true
      }
    ];
  }

  /**
   * Generate test errors for each error type
   */
  static generateTestErrors(): Record<string, MCPError> {
    return {
      entityNotFound: ErrorFactory.entityNotFound('Test Entity', 'test-id'),
      entityAlreadyExists: ErrorFactory.entityAlreadyExists('Test Entity', 'test-id'),
      toolNotFound: ErrorFactory.toolNotFound('nonexistent_tool', 'test'),
      fieldRequired: ErrorFactory.fieldRequired('testField', 'string'),
      fieldEmpty: ErrorFactory.fieldEmpty('testField'),
      invalidValue: ErrorFactory.invalidValue('testField', 'invalid', 'number'),
      valueOutOfRange: ErrorFactory.valueOutOfRange('testField', STRESS_TEST_ITERATIONS, 0, DEFAULT_PERFORMANCE_THRESHOLD),
      configurationNotFound: ErrorFactory.configurationNotFound('test.key'),
      configurationLoadFailed: ErrorFactory.configurationLoadFailed('test module', 'connection failed'),
      apiKeyMissing: ErrorFactory.apiKeyMissing('Test Service', 'TEST_API_KEY'),
      securityViolation: ErrorFactory.securityViolation(['test violation']),
      jsonParseFailed: ErrorFactory.jsonParseFailed('invalid json'),
      resourceLimitExceeded: ErrorFactory.resourceLimitExceeded('memory', DEFAULT_PERFORMANCE_THRESHOLD, STRESS_TEST_ITERATIONS),
      toolExecutionFailed: ErrorFactory.toolExecutionFailed('test_tool', 'test', new Error('test error'))
    };
  }

  /**
   * Test error formatting for different outputs
   */
  static testErrorFormatting(error: MCPError): {
    logging: string;
    api: Record<string, unknown>;
    user: string;
  } {
    return {
      logging: ErrorFactory.formatForLogging(error),
      api: ErrorFactory.formatForApi(error),
      user: ErrorFactory.formatForUser(error)
    };
  }

  /**
   * Test error type checking utilities
   */
  static testTypeChecking(errors: MCPError[]): Record<string, boolean[]> {
    return {
      isEntityNotFound: errors.map(e => ErrorFactory.isEntityNotFound(e)),
      isValidationError: errors.map(e => ErrorFactory.isValidationError(e)),
      isConfigurationError: errors.map(e => ErrorFactory.isConfigurationError(e)),
      isSecurityError: errors.map(e => ErrorFactory.isSecurityError(e))
    };
  }

  /**
   * Create error scenarios for comprehensive testing
   */
  static createErrorScenarios(): Array<{
    name: string;
    createError: () => MCPError;
    expectedType: string;
    expectedProperties: string[];
    contextValidation: (context: Record<string, unknown>) => boolean;
  }> {
    return [
      {
        name: 'Entity Not Found with Context',
        createError: () => ErrorFactory.entityNotFound('User', 'user-123', { requestId: 'req-456' }),
        expectedType: ERROR_TYPES.ENTITY_NOT_FOUND,
        expectedProperties: ['entityType', 'identifier', 'requestId'],
        contextValidation: (ctx) => ctx.entityType === 'User' && ctx.identifier === 'user-123'
      },
      {
        name: 'Validation Error with Range',
        createError: () => ErrorFactory.valueOutOfRange('age', STRESS_TEST_ITERATIONS, 0, DEFAULT_PERFORMANCE_THRESHOLD, { field: 'user.age' }),
        expectedType: ERROR_TYPES.VALIDATION_FAILED,
        expectedProperties: ['fieldName', 'value', 'min', 'max', 'field'],
        contextValidation: (ctx) => ctx.min === 0 && ctx.max === DEFAULT_PERFORMANCE_THRESHOLD && ctx.value === STRESS_TEST_ITERATIONS
      },
      {
        name: 'Tool Execution Error with Stack',
        createError: () => {
          const originalError = new Error('Database connection timeout');
          return ErrorFactory.toolExecutionFailed('user_create', 'social', originalError, { userId: 'user-123' });
        },
        expectedType: ERROR_TYPES.EXTERNAL_SERVICE_ERROR,
        expectedProperties: ['toolName', 'category', 'originalError', 'userId'],
        contextValidation: (ctx) => ctx.toolName === 'user_create' && ctx.category === 'social'
      }
    ];
  }

  /**
   * Test error wrapping functionality
   */
  static testErrorWrapping(): {
    wrappedMCPError: MCPError;
    wrappedRegularError: MCPError;
  } {
    const originalMCPError = ErrorFactory.entityNotFound('Test', 'test-1');
    const wrappedMCPError = ErrorFactory.wrapError(originalMCPError, { additionalContext: 'test' });

    const originalRegularError = new Error('Regular error message');
    const wrappedRegularError = ErrorFactory.wrapError(originalRegularError, { source: 'test' });

    return {
      wrappedMCPError,
      wrappedRegularError
    };
  }

  /**
   * Utility to assert error properties in tests
   */
  static assertError(
    error: unknown,
    expectedType: string,
    expectedMessageFragment?: string,
    expectedContextProperties?: string[]
  ): asserts error is MCPError {
    if (!(error instanceof MCPError)) {
      throw new Error(`Expected MCPError, got ${typeof error}`);
    }

    if (error.type !== expectedType) {
      throw new Error(`Expected error type ${expectedType}, got ${error.type}`);
    }

    if (expectedMessageFragment && !error.message.includes(expectedMessageFragment)) {
      throw new Error(`Expected message to contain "${expectedMessageFragment}", got "${error.message}"`);
    }

    if (expectedContextProperties && error.context) {
      for (const prop of expectedContextProperties) {
        if (!(prop in error.context)) {
          throw new Error(`Expected context property "${prop}" not found`);
        }
      }
    }

    // Validate timestamp format
    if (!error.timestamp || isNaN(Date.parse(error.timestamp))) {
      throw new Error('Expected valid timestamp in ISO format');
    }
  }
} 