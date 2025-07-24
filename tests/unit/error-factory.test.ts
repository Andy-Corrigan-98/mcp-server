/**
 * Unit Tests for ErrorFactory
 * Tests all error types, context handling, and formatting capabilities
 */

import { ErrorFactory, MCPError } from '../../src/utils/error-factory.js';
import { ErrorAssertions } from '../../src/test-utils/error-assertions.js';
import { TestDataFactory } from '../../src/test-utils/data-factory.js';

describe('ErrorFactory', () => {
  const errorData = TestDataFactory.createErrorTestData();

  describe('Error Creation', () => {
    test('should create validation errors with proper structure', () => {
      const error = ErrorFactory.validation(
        errorData.validationError.message,
        errorData.validationError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('validation');
      expect(error.message).toBe(errorData.validationError.message);
      expect(error.context).toEqual(errorData.validationError.context);
      expect(error.timestamp).toBeDefined();
      expect(error.stack).toBeDefined();
    });

    test('should create configuration errors with proper structure', () => {
      const error = ErrorFactory.configuration(
        errorData.configurationError.message,
        errorData.configurationError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('configuration');
      expect(error.message).toBe(errorData.configurationError.message);
      expect(error.context).toEqual(errorData.configurationError.context);
    });

    test('should create authentication errors with proper structure', () => {
      const error = ErrorFactory.authentication(
        errorData.authenticationError.message,
        errorData.authenticationError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('authentication');
      expect(error.message).toBe(errorData.authenticationError.message);
      expect(error.context).toEqual(errorData.authenticationError.context);
    });

    test('should create authorization errors with proper structure', () => {
      const error = ErrorFactory.authorization(
        errorData.authorizationError.message,
        errorData.authorizationError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('authorization');
      expect(error.message).toBe(errorData.authorizationError.message);
      expect(error.context).toEqual(errorData.authorizationError.context);
    });

    test('should create network errors with proper structure', () => {
      const error = ErrorFactory.network(
        errorData.networkError.message,
        errorData.networkError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('network');
      expect(error.message).toBe(errorData.networkError.message);
      expect(error.context).toEqual(errorData.networkError.context);
    });

    test('should create resource errors with proper structure', () => {
      const error = ErrorFactory.resource(
        errorData.resourceError.message,
        errorData.resourceError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('resource');
      expect(error.message).toBe(errorData.resourceError.message);
      expect(error.context).toEqual(errorData.resourceError.context);
    });

    test('should create operation errors with proper structure', () => {
      const error = ErrorFactory.operation(
        errorData.operationError.message,
        errorData.operationError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('operation');
      expect(error.message).toBe(errorData.operationError.message);
      expect(error.context).toEqual(errorData.operationError.context);
    });

    test('should create timeout errors with proper structure', () => {
      const error = ErrorFactory.timeout(
        errorData.timeoutError.message,
        errorData.timeoutError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('timeout');
      expect(error.message).toBe(errorData.timeoutError.message);
      expect(error.context).toEqual(errorData.timeoutError.context);
    });

    test('should create rate limit errors with proper structure', () => {
      const error = ErrorFactory.rateLimit(
        errorData.rateLimitError.message,
        errorData.rateLimitError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('rate_limit');
      expect(error.message).toBe(errorData.rateLimitError.message);
      expect(error.context).toEqual(errorData.rateLimitError.context);
    });

    test('should create concurrency errors with proper structure', () => {
      const error = ErrorFactory.concurrency(
        errorData.concurrencyError.message,
        errorData.concurrencyError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('concurrency');
      expect(error.message).toBe(errorData.concurrencyError.message);
      expect(error.context).toEqual(errorData.concurrencyError.context);
    });

    test('should create system errors with proper structure', () => {
      const error = ErrorFactory.system(
        errorData.systemError.message,
        errorData.systemError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('system');
      expect(error.message).toBe(errorData.systemError.message);
      expect(error.context).toEqual(errorData.systemError.context);
    });

    test('should create unknown errors with proper structure', () => {
      const error = ErrorFactory.unknown(
        errorData.unknownError.message,
        errorData.unknownError.context
      );

      expect(error).toBeInstanceOf(MCPError);
      expect(error.type).toBe('unknown');
      expect(error.message).toBe(errorData.unknownError.message);
      expect(error.context).toEqual(errorData.unknownError.context);
    });
  });

  describe('Error Wrapping', () => {
    test('should wrap standard errors with context', () => {
      const originalError = new Error('Original error message');
      const wrappedError = ErrorFactory.wrap(originalError, 'system', { component: 'test' });

      expect(wrappedError).toBeInstanceOf(MCPError);
      expect(wrappedError.type).toBe('system');
      expect(wrappedError.message).toBe('Original error message');
      expect(wrappedError.context).toEqual({ component: 'test' });
      expect(wrappedError.cause).toBe(originalError);
    });

    test('should preserve MCPError type when wrapping', () => {
      const originalError = ErrorFactory.validation('Validation failed');
      const wrappedError = ErrorFactory.wrap(originalError, 'operation');

      expect(wrappedError).toBeInstanceOf(MCPError);
      expect(wrappedError.type).toBe('validation'); // Should preserve original type
      expect(wrappedError.message).toBe('Validation failed');
    });

    test('should handle non-Error objects when wrapping', () => {
      const nonErrorObject = { message: 'Not an error object' };
      const wrappedError = ErrorFactory.wrap(nonErrorObject, 'unknown');

      expect(wrappedError).toBeInstanceOf(MCPError);
      expect(wrappedError.type).toBe('unknown');
      expect(wrappedError.message).toContain('Not an error object');
    });
  });

  describe('Type Guards', () => {
    test('should correctly identify MCPError instances', () => {
      const mcpError = ErrorFactory.validation('Test error');
      const standardError = new Error('Standard error');

      expect(ErrorFactory.isMCPError(mcpError)).toBe(true);
      expect(ErrorFactory.isMCPError(standardError)).toBe(false);
      expect(ErrorFactory.isMCPError(null)).toBe(false);
      expect(ErrorFactory.isMCPError(undefined)).toBe(false);
      expect(ErrorFactory.isMCPError('string')).toBe(false);
    });

    test('should correctly identify error types', () => {
      const validationError = ErrorFactory.validation('Test');
      const networkError = ErrorFactory.network('Test');

      expect(ErrorFactory.isErrorType(validationError, 'validation')).toBe(true);
      expect(ErrorFactory.isErrorType(validationError, 'network')).toBe(false);
      expect(ErrorFactory.isErrorType(networkError, 'network')).toBe(true);
      expect(ErrorFactory.isErrorType(networkError, 'validation')).toBe(false);
    });
  });

  describe('Error Formatting', () => {
    test('should format errors for logging', () => {
      const error = ErrorFactory.validation('Test error', { field: 'email' });
      const formatted = error.forLogging();

      expect(formatted).toContain('validation');
      expect(formatted).toContain('Test error');
      expect(formatted).toContain('field');
      expect(formatted).toContain('email');
      expect(formatted).toContain(error.timestamp);
    });

    test('should format errors for API responses', () => {
      const error = ErrorFactory.authentication('Auth failed', { provider: 'oauth' });
      const formatted = error.forAPI();

      expect(formatted).toHaveProperty('type', 'authentication');
      expect(formatted).toHaveProperty('message', 'Auth failed');
      expect(formatted).toHaveProperty('context', { provider: 'oauth' });
      expect(formatted).toHaveProperty('timestamp');
      expect(formatted).not.toHaveProperty('stack'); // Should not expose stack in API
    });

    test('should format errors for user display', () => {
      const error = ErrorFactory.network('Connection failed', { url: 'https://api.test.com' });
      const formatted = error.forUser();

      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('Connection failed');
      expect(formatted).not.toContain('stack'); // Should not expose technical details
    });

    test('should handle errors without context in formatting', () => {
      const error = ErrorFactory.system('System error');
      
      const logFormatted = error.forLogging();
      const apiFormatted = error.forAPI();
      const userFormatted = error.forUser();

      expect(logFormatted).toContain('system');
      expect(apiFormatted.type).toBe('system');
      expect(userFormatted).toContain('System error');
    });
  });

  describe('Context Handling', () => {
    test('should handle complex context objects', () => {
      const complexContext = {
        user: { id: 123, role: 'admin' },
        request: { method: 'POST', url: '/api/test' },
        metadata: { version: '1.0', timestamp: Date.now() }
      };

      const error = ErrorFactory.authorization('Access denied', complexContext);

      expect(error.context).toEqual(complexContext);
      expect(error.forAPI().context).toEqual(complexContext);
    });

    test('should handle null and undefined context gracefully', () => {
      const errorWithNull = ErrorFactory.validation('Test', null);
      const errorWithUndefined = ErrorFactory.validation('Test', undefined);

      expect(errorWithNull.context).toBeNull();
      expect(errorWithUndefined.context).toBeUndefined();
    });

    test('should merge context when wrapping errors', () => {
      const originalError = ErrorFactory.validation('Test', { field: 'email' });
      const wrappedError = ErrorFactory.wrap(originalError, 'operation', { step: 'validation' });

      expect(wrappedError.context).toEqual({ field: 'email' });
    });
  });

  describe('Error Chaining', () => {
    test('should preserve cause chain', () => {
      const rootCause = new Error('Root cause');
      const wrappedOnce = ErrorFactory.wrap(rootCause, 'network');
      const wrappedTwice = ErrorFactory.wrap(wrappedOnce, 'operation');

      expect(wrappedTwice.cause).toBe(wrappedOnce);
      expect(wrappedOnce.cause).toBe(rootCause);
    });

    test('should handle deep error chains in formatting', () => {
      const rootCause = new Error('Deep root error');
      const level1 = ErrorFactory.wrap(rootCause, 'network');
      const level2 = ErrorFactory.wrap(level1, 'operation');

      const formatted = level2.forLogging();
      expect(formatted).toContain('operation');
      expect(formatted).toContain('Deep root error');
    });
  });

  describe('Error Assertions (Integration)', () => {
    test('should work with fluent error assertions', () => {
      const error = ErrorFactory.validation('Test validation error', { field: 'email' });

      expect(() => {
        ErrorAssertions.expect(error)
          .toBeErrorType('validation')
          .toHaveMessage('Test validation error')
          .toHaveContext({ field: 'email' })
          .toHaveTimestamp();
      }).not.toThrow();
    });

    test('should fail error assertions correctly', () => {
      const error = ErrorFactory.network('Network error');

      expect(() => {
        ErrorAssertions.expect(error).toBeErrorType('validation');
      }).toThrow();
    });
  });

  describe('Performance', () => {
    test('should create errors efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        ErrorFactory.validation(`Error ${i}`, { index: i });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should create 1000 errors in less than 100ms
      expect(executionTime).toBeLessThan(100);
    });

    test('should format errors efficiently', () => {
      const errors = Array.from({ length: 100 }, (_, i) => 
        ErrorFactory.system(`Error ${i}`, { index: i })
      );

      const startTime = performance.now();
      
      errors.forEach(error => {
        error.forLogging();
        error.forAPI();
        error.forUser();
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should format 300 times (100 errors × 3 formats) in less than 50ms
      expect(executionTime).toBeLessThan(50);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = ErrorFactory.validation(longMessage);

      expect(error.message).toBe(longMessage);
      expect(error.forLogging()).toContain(longMessage);
    });

    test('should handle circular references in context', () => {
      const circularContext: any = { name: 'test' };
      circularContext.self = circularContext;

      const error = ErrorFactory.validation('Test', circularContext);
      
      // Should not throw when formatting
      expect(() => error.forLogging()).not.toThrow();
      expect(() => error.forAPI()).not.toThrow();
    });

    test('should handle special characters in error messages', () => {
      const specialMessage = 'Error with émojis 🚨 and ñ characters & symbols <>&"\'';
      const error = ErrorFactory.system(specialMessage);

      expect(error.message).toBe(specialMessage);
      expect(error.forUser()).toContain(specialMessage);
    });
  });
}); 