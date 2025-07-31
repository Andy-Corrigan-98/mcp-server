import { MCPError, ERROR_TYPES } from '../utils/error-factory.js';
import { TestErrorChecker } from './error-testing.js';

/**
 * Jest-compatible error assertion helpers designed around ErrorFactory patterns
 * Provides fluent assertions for error testing
 */
export class ErrorAssertions {
  /**
   * Assert that an error is a valid MCPError with expected properties
   */
  static expectMCPError(
    error: unknown,
    expectedType?: string,
    expectedMessageFragment?: string,
    expectedContextProperties?: string[]
  ): asserts error is MCPError {
    // Use our comprehensive error checker
    const validation = TestErrorChecker.validateMCPError(error, expectedType);

    expect(validation.isValidMCPError).toBe(true);
    expect(validation.hasCorrectType).toBe(true);
    expect(validation.hasTimestamp).toBe(true);
    expect(validation.messageValid).toBe(true);

    const mcpError = error as MCPError;

    if (expectedMessageFragment) {
      expect(mcpError.message).toContain(expectedMessageFragment);
    }

    if (expectedContextProperties) {
      expect(mcpError.context).toBeDefined();
      for (const prop of expectedContextProperties) {
        expect(mcpError.context).toHaveProperty(prop);
      }
    }
  }

  /**
   * Assert that an error is of a specific type
   */
  static expectErrorType(error: unknown, expectedType: string): void {
    ErrorAssertions.expectMCPError(error, expectedType);
  }

  /**
   * Assert entity not found error
   */
  static expectEntityNotFound(error: unknown, entityType?: string, identifier?: string): void {
    ErrorAssertions.expectMCPError(error, ERROR_TYPES.ENTITY_NOT_FOUND);

    const mcpError = error as MCPError;
    if (entityType) {
      expect(mcpError.context?.entityType).toBe(entityType);
    }
    if (identifier) {
      expect(mcpError.context?.identifier).toBe(identifier);
    }
  }

  /**
   * Assert validation error
   */
  static expectValidationError(error: unknown, fieldName?: string): void {
    ErrorAssertions.expectMCPError(error, ERROR_TYPES.VALIDATION_FAILED);

    if (fieldName) {
      const mcpError = error as MCPError;
      expect(mcpError.context?.fieldName).toBe(fieldName);
    }
  }

  /**
   * Assert tool not found error
   */
  static expectToolNotFound(error: unknown, toolName?: string, category?: string): void {
    ErrorAssertions.expectMCPError(error, ERROR_TYPES.TOOL_NOT_FOUND);

    const mcpError = error as MCPError;
    if (toolName) {
      expect(mcpError.context?.toolName).toBe(toolName);
    }
    if (category) {
      expect(mcpError.context?.category).toBe(category);
    }
  }

  /**
   * Assert configuration error
   */
  static expectConfigurationError(error: unknown, configKey?: string): void {
    ErrorAssertions.expectMCPError(error, ERROR_TYPES.CONFIGURATION_ERROR);

    if (configKey) {
      const mcpError = error as MCPError;
      expect(mcpError.context?.configKey).toBe(configKey);
    }
  }

  /**
   * Assert security violation error
   */
  static expectSecurityViolation(error: unknown, expectedViolations?: string[]): void {
    ErrorAssertions.expectMCPError(error, ERROR_TYPES.SECURITY_VIOLATION);

    if (expectedViolations) {
      const mcpError = error as MCPError;
      expect(mcpError.context?.violations).toEqual(expect.arrayContaining(expectedViolations));
    }
  }

  /**
   * Assert that error formatting works correctly
   */
  static expectValidErrorFormatting(error: MCPError): void {
    const formatting = TestErrorChecker.testErrorFormatting(error);

    // Validate logging format
    expect(formatting.logging).toContain(error.type);
    expect(formatting.logging).toContain(error.message);
    expect(formatting.logging).toContain(error.timestamp);

    // Validate API format
    expect(formatting.api).toHaveProperty('error', error.message);
    expect(formatting.api).toHaveProperty('type', error.type);
    expect(formatting.api).toHaveProperty('timestamp', error.timestamp);

    // Validate user format
    expect(formatting.user).toBeTruthy();
    expect(typeof formatting.user).toBe('string');
  }

  /**
   * Assert that error context contains expected properties
   */
  static expectErrorContext(error: MCPError, expectedContext: Record<string, unknown>): void {
    expect(error.context).toBeDefined();

    for (const [key, value] of Object.entries(expectedContext)) {
      expect(error.context).toHaveProperty(key, value);
    }
  }

  /**
   * Assert that error wrapping works correctly
   */
  static expectErrorWrapping(originalError: Error, wrappedError: MCPError): void {
    expect(wrappedError).toBeInstanceOf(MCPError);
    expect(wrappedError.message).toBe(originalError.message);

    if (originalError instanceof MCPError) {
      expect(wrappedError.type).toBe(originalError.type);
    } else {
      expect(wrappedError.type).toBe('UNKNOWN_ERROR');
      expect(wrappedError.context?.originalName).toBe(originalError.name);
    }
  }

  /**
   * Assert that async function throws expected error
   */
  static async expectAsyncError<T>(
    asyncFn: () => Promise<T>,
    expectedType: string,
    expectedMessageFragment?: string
  ): Promise<MCPError> {
    let thrownError: unknown;

    try {
      await asyncFn();
      throw new Error('Expected function to throw an error, but it did not');
    } catch (error) {
      thrownError = error;
    }

    ErrorAssertions.expectMCPError(thrownError, expectedType, expectedMessageFragment);
    return thrownError as MCPError;
  }

  /**
   * Assert that error type checking utilities work correctly
   */
  static expectErrorTypeChecking(errors: MCPError[]): void {
    const typeChecking = TestErrorChecker.testTypeChecking(errors);

    // Each error should be correctly identified by at least one type checker
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      const hasMatchingChecker =
        (error.type === ERROR_TYPES.ENTITY_NOT_FOUND && typeChecking.isEntityNotFound[i]) ||
        (error.type === ERROR_TYPES.VALIDATION_FAILED && typeChecking.isValidationError[i]) ||
        (error.type === ERROR_TYPES.CONFIGURATION_ERROR && typeChecking.isConfigurationError[i]) ||
        (error.type === ERROR_TYPES.SECURITY_VIOLATION && typeChecking.isSecurityError[i]);

      expect(hasMatchingChecker).toBe(true);
    }
  }
}
