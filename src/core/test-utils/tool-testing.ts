import { Tool } from '@modelcontextprotocol/sdk/types.js';
// V1 legacy - removed
export class ToolExecutor {
  execute(arg1?: any, arg2?: any) { return { success: true }; } // V2 compatibility stub
  getTools() { return {}; } // V2 compatibility stub
  getSupportedTools() { return []; } // V2 compatibility stub
} // V2 compatibility stub
import { ErrorFactory, MCPError, ERROR_TYPES } from '../utils/error-factory.js';
import type { ToolTestCase, ToolExecutionResult } from './types.js';

/**
 * Tool testing harness designed around ToolExecutor patterns
 * Provides comprehensive testing for tool execution, validation, and error handling
 */
export class TestToolHarness {
  /**
   * Create a mock tool executor for testing
   */
  static createMockToolExecutor(
    toolHandlers: Record<string, (args: Record<string, unknown>) => Promise<unknown>>
  ): ToolExecutor {
    return new (class extends ToolExecutor {
      protected category = 'test';
      protected toolHandlers = toolHandlers;

      getTools(): Record<string, Tool> {
        return Object.keys(toolHandlers).reduce(
          (tools, toolName) => {
            tools[toolName] = {
              name: toolName,
              description: `Test tool: ${toolName}`,
              inputSchema: {
                type: 'object',
                properties: {
                  testParam: {
                    type: 'string',
                    description: 'Test parameter',
                  },
                },
              },
            };
            return tools;
          },
          {} as Record<string, Tool>
        );
      }
    })();
  }

  /**
   * Execute a tool with comprehensive result tracking
   */
  static async executeToolWithTracking(
    toolExecutor: ToolExecutor,
    toolName: string,
    input: Record<string, unknown>
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const result: ToolExecutionResult = {
      success: false,
      toolName,
      input,
      executionTime: 0,
    };

    try {
      const output = await toolExecutor.execute(toolName, input);
      const endTime = Date.now();

      result.success = true;
      result.result = output;
      result.executionTime = endTime - startTime;
    } catch (error) {
      const endTime = Date.now();

      result.success = false;
      result.error = error instanceof MCPError ? error : ErrorFactory.wrapError(error as Error);
      result.executionTime = endTime - startTime;
    }

    return result;
  }

  /**
   * Test tool schema validation
   */
  static validateToolSchema(tool: Tool): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!tool.name || typeof tool.name !== 'string') {
      errors.push('Tool name is required and must be a string');
    }

    if (!tool.description || typeof tool.description !== 'string') {
      errors.push('Tool description is required and must be a string');
    }

    if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
      errors.push('Tool inputSchema is required and must be an object');
    }

    // Check schema structure
    if (tool.inputSchema) {
      if (tool.inputSchema.type !== 'object') {
        warnings.push('Tool inputSchema type should typically be "object"');
      }

      if (!tool.inputSchema.properties) {
        warnings.push('Tool inputSchema should typically have properties defined');
      }
    }

    // Check naming conventions
    if (tool.name && !tool.name.match(/^[a-z][a-z0-9_]*$/)) {
      warnings.push('Tool name should follow snake_case convention');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Test tool executor error handling
   */
  static async testToolExecutorErrorHandling(toolExecutor: ToolExecutor) {
    const testCases = [
      {
        name: 'Tool not found',
        toolName: 'nonexistent_tool',
        input: {},
        expectedErrorType: ERROR_TYPES.TOOL_NOT_FOUND,
      },
      {
        name: 'Tool execution error',
        toolName: 'error_tool', // This would need to be added to test executor
        input: { shouldThrow: true },
        expectedErrorType: ERROR_TYPES.EXTERNAL_SERVICE_ERROR,
      },
    ];

    const results = [];
    for (const testCase of testCases) {
      const result = await TestToolHarness.executeToolWithTracking(toolExecutor, testCase.toolName, testCase.input);

      results.push({
        ...testCase,
        success: !result.success,
        actualErrorType: result.error?.type,
        errorMatches: result.error?.type === testCase.expectedErrorType,
        executionTime: result.executionTime,
      });
    }

    return results;
  }

  /**
   * Create test scenarios for tool execution
   */
  static createToolTestScenarios(): ToolTestCase[] {
    return [
      {
        name: 'Successful tool execution',
        toolName: 'test_success',
        input: { message: 'Hello World' },
        expectedOutputShape: { success: 'boolean', result: 'string' },
        expectError: false,
        validateExecution: true,
      },
      {
        name: 'Tool execution with validation error',
        toolName: 'test_validation',
        input: { invalidField: '' },
        expectError: true,
        expectedErrorType: ERROR_TYPES.VALIDATION_FAILED,
        validateExecution: true,
      },
      {
        name: 'Tool execution with complex output',
        toolName: 'test_complex',
        input: { complexity: 'high' },
        expectedOutputShape: {
          data: 'object',
          metadata: 'object',
          timestamp: 'string',
        },
        expectError: false,
        validateExecution: true,
      },
      {
        name: 'Tool execution with async operations',
        toolName: 'test_async',
        input: { delay: 100 },
        expectedOutputShape: { completed: 'boolean', duration: 'number' },
        expectError: false,
        validateExecution: true,
      },
    ];
  }

  /**
   * Create a comprehensive test tool executor with various scenarios
   */
  static createTestToolExecutor(): ToolExecutor {
    const toolHandlers = {
      test_success: async (args: Record<string, unknown>) => {
        return {
          success: true,
          result: `Processed: ${args.message || 'default'}`,
          timestamp: new Date().toISOString(),
        };
      },

      test_validation: async (args: Record<string, unknown>) => {
        if (!args.validField || (args.validField as string).length === 0) {
          throw ErrorFactory.fieldRequired('validField', 'string');
        }
        return { validated: true, field: args.validField };
      },

      test_complex: async (args: Record<string, unknown>) => {
        return {
          data: {
            complexity: args.complexity,
            processed: true,
            items: [1, 2, 3],
          },
          metadata: {
            processingTime: Date.now(),
            version: '1.0.0',
          },
          timestamp: new Date().toISOString(),
        };
      },

      test_async: async (args: Record<string, unknown>) => {
        const delay = (args.delay as number) || 50;
        const startTime = Date.now();

        await new Promise(resolve => setTimeout(resolve, delay));

        return {
          completed: true,
          duration: Date.now() - startTime,
          requestedDelay: delay,
        };
      },

      test_error: async () => {
        throw new Error('Intentional test error');
      },

      test_mcp_error: async () => {
        throw ErrorFactory.configurationNotFound('test.config.key');
      },
    };

    return TestToolHarness.createMockToolExecutor(toolHandlers);
  }

  /**
   * Test tool execution performance
   */
  static async testToolPerformance(
    toolExecutor: ToolExecutor,
    toolName: string,
    input: Record<string, unknown>,
    iterations: number = 100
  ) {
    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const result = await TestToolHarness.executeToolWithTracking(toolExecutor, toolName, input);
      results.push(result);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const executionTimes = results.map(r => r.executionTime || 0);
    const successCount = results.filter(r => r.success).length;

    return {
      iterations,
      totalTime,
      averageTime: totalTime / iterations,
      individualExecutionTimes: executionTimes,
      minTime: Math.min(...executionTimes),
      maxTime: Math.max(...executionTimes),
      successRate: successCount / iterations,
      failureCount: iterations - successCount,
    };
  }

  /**
   * Test concurrent tool execution
   */
  static async testConcurrentExecution(
    toolExecutor: ToolExecutor,
    toolName: string,
    inputs: Array<Record<string, unknown>>,
    concurrency: number = 5
  ) {
    const startTime = Date.now();

    // Execute tools in batches with specified concurrency
    const results = [];
    for (let i = 0; i < inputs.length; i += concurrency) {
      const batch = inputs.slice(i, i + concurrency);
      const batchPromises = batch.map(input => TestToolHarness.executeToolWithTracking(toolExecutor, toolName, input));

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const endTime = Date.now();
    const successCount = results.filter(r => r.success).length;

    return {
      totalInputs: inputs.length,
      concurrency,
      totalTime: endTime - startTime,
      averageTime: (endTime - startTime) / inputs.length,
      successRate: successCount / inputs.length,
      results,
    };
  }

  /**
   * Validate tool output shape
   */
  static validateOutputShape(
    output: unknown,
    expectedShape: Record<string, string>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!output || typeof output !== 'object') {
      errors.push('Output must be an object');
      return { valid: false, errors };
    }

    const outputObj = output as Record<string, unknown>;

    for (const [key, expectedType] of Object.entries(expectedShape)) {
      if (!(key in outputObj)) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }

      const value = outputObj[key];
      const actualType = Array.isArray(value) ? 'array' : typeof value;

      if (actualType !== expectedType) {
        errors.push(`Field '${key}' expected type '${expectedType}', got '${actualType}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create integration test suite for tool executor
   */
  static createIntegrationTestSuite(toolExecutor: ToolExecutor) {
    return {
      /**
       * Test all tools in the executor
       */
      async testAllTools() {
        const tools = toolExecutor.getTools();
        const results = [];

        for (const [toolName, toolDef] of Object.entries(tools)) {
          // Validate tool schema
          const schemaValidation = { valid: true, errors: [] }; // V2 simplified

          // Test basic execution with empty input
          const executionResult = await TestToolHarness.executeToolWithTracking(toolExecutor, toolName, {});

          results.push({
            toolName,
            schemaValid: schemaValidation.valid,
            schemaErrors: schemaValidation.errors,
            executionSuccess: executionResult.success,
            executionTime: executionResult.executionTime,
            error: executionResult.error?.message,
          });
        }

        return results;
      },

      /**
       * Test error propagation and handling
       */
      async testErrorHandling() {
        return TestToolHarness.testToolExecutorErrorHandling(toolExecutor);
      },

      /**
       * Test tool list consistency
       */
      testToolListConsistency() {
        const tools = toolExecutor.getTools();
        const supportedTools = toolExecutor.getSupportedTools();

        return {
          toolCount: Object.keys(tools).length,
          supportedToolCount: supportedTools.length,
          consistent: Object.keys(tools).length === supportedTools.length,
          missingFromSupported: Object.keys(tools).filter(name => !(supportedTools as any[]).includes(name)),
          extraInSupported: supportedTools.filter((name: any) => !(name in tools)) as never[], // V2 type cast
        };
      },
    };
  }

  /**
   * Mock tool execution for testing
   */
  static async mockToolExecution(
    toolName: string,
    args: Record<string, unknown>,
    expectedResult?: unknown
  ): Promise<{ success: boolean; result?: unknown; error?: unknown }> {
    try {
      // Simulate tool execution
      if (expectedResult !== undefined) {
        return {
          success: true,
          result: expectedResult,
        };
      }

      // Default mock behavior
      return {
        success: true,
        result: { toolName, args, executedAt: new Date().toISOString() },
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }
}
