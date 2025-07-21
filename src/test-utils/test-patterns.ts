/**
 * Test Patterns - Common testing patterns and utilities
 * Provides reusable testing patterns for consistent test structure
 */

import { TestErrorChecker } from './error-testing.js';
import { TestConfigBuilder } from './config-testing.js';
import { TestResponseValidator } from './response-testing.js';
import { TestToolHarness } from './tool-testing.js';

export class TestPatterns {
  /**
   * Create a standard test suite structure
   */
  static createTestSuite(name: string, tests: Array<{ name: string; test: () => void | Promise<void> }>) {
    return {
      suiteName: name,
      tests,
      setup: async () => {
        // Standard setup logic
      },
      teardown: async () => {
        // Standard teardown logic
      }
    };
  }

  /**
   * Create error testing pattern
   */
  static createErrorTestPattern(errorType: string, expectedMessage: string) {
    return {
      pattern: 'error-validation',
      errorType,
      expectedMessage,
      validator: TestErrorChecker.validateMCPError
    };
  }

  /**
   * Create configuration testing pattern
   */
  static createConfigTestPattern(key: string, value: unknown, shouldSucceed: boolean = true) {
    return {
      pattern: 'config-validation',
      key,
      value,
      shouldSucceed,
      validator: shouldSucceed 
        ? TestConfigBuilder.createValidConfig 
        : TestConfigBuilder.createInvalidConfig
    };
  }

  /**
   * Create response testing pattern
   */
  static createResponseTestPattern(responseType: 'success' | 'error', expectedData?: unknown) {
    return {
      pattern: 'response-validation',
      responseType,
      expectedData,
      validator: responseType === 'success' 
        ? TestResponseValidator.validateSuccessResponse
        : TestResponseValidator.validateErrorResponse
    };
  }

  /**
   * Create tool testing pattern
   */
  static createToolTestPattern(toolName: string, args: Record<string, unknown>, expectedResult?: unknown) {
    return {
      pattern: 'tool-execution',
      toolName,
      args,
      expectedResult,
      executor: TestToolHarness.mockToolExecution
    };
  }

  /**
   * Create performance testing pattern
   */
  static createPerformancePattern(name: string, operation: () => Promise<void>, maxExecutionTime: number = 1000) {
    return {
      pattern: 'performance',
      name,
      operation,
      maxExecutionTime,
      measure: async () => {
        const startTime = performance.now();
        await operation();
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        return {
          executionTime,
          withinThreshold: executionTime <= maxExecutionTime,
          threshold: maxExecutionTime
        };
      }
    };
  }

  /**
   * Create integration testing pattern
   */
  static createIntegrationPattern(
    name: string, 
    steps: Array<{ description: string; action: () => Promise<unknown> }>
  ) {
    return {
      pattern: 'integration',
      name,
      steps,
      execute: async () => {
        const results = [];
        for (const step of steps) {
          try {
            const result = await step.action();
            results.push({
              description: step.description,
              success: true,
              result
            });
          } catch (error) {
            results.push({
              description: step.description,
              success: false,
              error
            });
            break; // Stop on first failure
          }
        }
        return results;
      }
    };
  }

  /**
   * Create validation testing pattern
   */
  static createValidationPattern<T>(
    name: string,
    input: T,
    validator: (input: T) => boolean,
    expectedValid: boolean = true
  ) {
    return {
      pattern: 'validation',
      name,
      input,
      validator,
      expectedValid,
      execute: () => {
        const isValid = validator(input);
        return {
          input,
          isValid,
          expectedValid,
          passed: isValid === expectedValid
        };
      }
    };
  }

  /**
   * Create mock testing pattern
   */
  static createMockPattern<T>(
    name: string,
    mockImplementation: () => T,
    expectations: Record<string, unknown>
  ) {
    return {
      pattern: 'mock',
      name,
      mockImplementation,
      expectations,
      verify: (actualResult: T) => {
        const results = [];
        for (const [key, expected] of Object.entries(expectations)) {
          const actual = (actualResult as Record<string, unknown>)[key];
          results.push({
            property: key,
            expected,
            actual,
            matches: actual === expected
          });
        }
        return results;
      }
    };
  }

  /**
   * Create test data generation pattern
   */
  static createDataPattern(type: 'user' | 'config' | 'error' | 'response', count: number = 1) {
    const generators = {
      user: () => ({
        id: Math.random().toString(36).substring(7),
        name: `Test User ${Math.floor(Math.random() * 1000)}`,
        email: `test${Math.floor(Math.random() * 1000)}@example.com`,
        createdAt: new Date().toISOString()
      }),
      config: () => ({
        key: `test.config.${Math.random().toString(36).substring(7)}`,
        value: `test-value-${Math.floor(Math.random() * 1000)}`,
        type: 'string',
        source: 'test'
      }),
      error: () => ({
        type: 'validation',
        message: `Test error ${Math.floor(Math.random() * 1000)}`,
        context: { testField: 'testValue' },
        timestamp: new Date().toISOString()
      }),
      response: () => ({
        success: Math.random() > 0.5,
        data: { id: Math.floor(Math.random() * 1000) },
        timestamp: new Date().toISOString()
      })
    };

    return {
      pattern: 'data-generation',
      type,
      count,
      generate: () => Array.from({ length: count }, () => generators[type]())
    };
  }

  /**
   * Create comprehensive test pattern combining multiple patterns
   */
  static createComprehensivePattern(name: string, patterns: Array<{ pattern: string; name?: string }>) {
    return {
      pattern: 'comprehensive',
      name,
      patterns,
      execute: async () => {
        const results = [];
        for (const pattern of patterns) {
          try {
            // Simple execution for demonstration
            const result = { pattern: pattern.pattern, executed: true };
            
            results.push({
              pattern: pattern.pattern,
              success: true,
              result
            });
          } catch (error) {
            results.push({
              pattern: pattern.pattern,
              success: false,
              error
            });
          }
        }
        return results;
      }
    };
  }
} 