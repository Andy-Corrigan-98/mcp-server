/**
 * Integration Test Runner - Orchestrates end-to-end integration tests
 * Coordinates testing across ErrorFactory, ConfigurationSchema, ResponseBuilder, and ToolExecutor
 */

import { TestDataFactory } from './data-factory.js';
import { TestErrorChecker } from './error-testing.js';
import { TestConfigBuilder } from './config-testing.js';
import { TestResponseValidator } from './response-testing.js';
import { TestToolHarness } from './tool-testing.js';
import type { IntegrationTestOptions, PerformanceMetrics } from './types.js';

export class IntegrationTestRunner {
  private options: IntegrationTestOptions;
  private metrics: PerformanceMetrics = {
    executionTime: 0,
    memoryUsage: 0,
    dbQueries: 0,
    errorCount: 0,
    successRate: 0,
  };

  constructor(options: IntegrationTestOptions = {}) {
    this.options = {
      setupDatabase: false,
      useTransactions: true,
      isolateTests: true,
      cleanupBetweenTests: true,
      maxConcurrent: 5,
      timeoutMs: 30000,
      ...options,
    };
  }

  // Run comprehensive integration test suite
  async runFullSuite(): Promise<{ success: boolean; metrics: PerformanceMetrics; report: string }> {
    const startTime = Date.now();
    const results = [];

    try {
      console.log('🚀 Starting Full Integration Test Suite');

      // Phase 1: Error handling integration
      console.log('Phase 1: Error Handling Integration');
      const errorResults = await this.runErrorIntegrationTests();
      results.push(errorResults);

      // Phase 2: Configuration integration
      console.log('Phase 2: Configuration Integration');
      const configResults = await this.runConfigurationIntegrationTests();
      results.push(configResults);

      // Phase 3: Response handling integration
      console.log('Phase 3: Response Handling Integration');
      const responseResults = await this.runResponseIntegrationTests();
      results.push(responseResults);

      // Phase 4: Tool execution integration
      console.log('Phase 4: Tool Execution Integration');
      const toolResults = await this.runToolIntegrationTests();
      results.push(toolResults);

      // Phase 5: Cross-pattern integration
      console.log('Phase 5: Cross-Pattern Integration');
      const crossPatternResults = await this.runCrossPatternTests();
      results.push(crossPatternResults);

      const totalTests = results.reduce((sum, r) => sum + r.totalTests, 0);
      const passedTests = results.reduce((sum, r) => sum + r.passedTests, 0);

      this.metrics.executionTime = Date.now() - startTime;
      this.metrics.successRate = totalTests > 0 ? passedTests / totalTests : 0;

      const report = this.generateReport(results);

      return {
        success: this.metrics.successRate > 0.95, // 95% pass rate threshold
        metrics: this.metrics,
        report,
      };
    } catch (error) {
      this.metrics.errorCount++;
      this.metrics.executionTime = Date.now() - startTime;

      return {
        success: false,
        metrics: this.metrics,
        report: `Integration test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Error handling integration tests
  private async runErrorIntegrationTests(): Promise<{
    phase: string;
    totalTests: number;
    passedTests: number;
    details: string[];
  }> {
    const details: string[] = [];
    let passedTests = 0;
    let totalTests = 0;

    const errorData = TestDataFactory.createErrorTestData();

    for (const [errorType, data] of Object.entries(errorData)) {
      totalTests++;
      try {
        // Test error creation and validation
        const isValid = TestErrorChecker.validateErrorType(data.type);
        const hasContext = TestErrorChecker.checkErrorContext(data.context || {});

        if (isValid && hasContext) {
          passedTests++;
          details.push(`✅ ${errorType}: Valid error structure`);
        } else {
          details.push(`❌ ${errorType}: Invalid error structure`);
        }
      } catch (error) {
        details.push(
          `❌ ${errorType}: Test execution failed - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      phase: 'Error Handling',
      totalTests,
      passedTests,
      details,
    };
  }

  // Configuration integration tests
  private async runConfigurationIntegrationTests(): Promise<{
    phase: string;
    totalTests: number;
    passedTests: number;
    details: string[];
  }> {
    const details: string[] = [];
    let passedTests = 0;
    let totalTests = 0;

    const configData = TestDataFactory.createConfigurationTestData();

    // Test valid configurations
    for (const [configName, config] of Object.entries(configData.validConfigs)) {
      totalTests++;
      try {
        const result = TestConfigBuilder.createValidConfig(config.key, config.value);
        if (result.loaded && result.validationPassed) {
          passedTests++;
          details.push(`✅ ${configName}: Valid configuration loaded`);
        } else {
          details.push(`❌ ${configName}: Configuration validation failed`);
        }
      } catch (error) {
        details.push(
          `❌ ${configName}: Test execution failed - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Test invalid configurations
    for (const [configName, config] of Object.entries(configData.invalidConfigs)) {
      totalTests++;
      try {
        const result = TestConfigBuilder.createInvalidConfig(config.key, config.value);
        if (!result.loaded || !result.validationPassed) {
          passedTests++;
          details.push(`✅ ${configName}: Invalid configuration properly rejected`);
        } else {
          details.push(`❌ ${configName}: Invalid configuration incorrectly accepted`);
        }
      } catch (error) {
        details.push(
          `❌ ${configName}: Test execution failed - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      phase: 'Configuration',
      totalTests,
      passedTests,
      details,
    };
  }

  // Response handling integration tests
  private async runResponseIntegrationTests(): Promise<{
    phase: string;
    totalTests: number;
    passedTests: number;
    details: string[];
  }> {
    const details: string[] = [];
    let passedTests = 0;
    let totalTests = 0;

    const responseData = TestDataFactory.createResponseTestData();

    // Test success responses
    for (const [responseName, response] of Object.entries(responseData.successResponses)) {
      totalTests++;
      try {
        const isValid = TestResponseValidator.validateSuccessResponse(response);
        if (isValid) {
          passedTests++;
          details.push(`✅ ${responseName}: Valid success response`);
        } else {
          details.push(`❌ ${responseName}: Invalid success response structure`);
        }
      } catch (error) {
        details.push(
          `❌ ${responseName}: Test execution failed - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Test error responses
    for (const [responseName, response] of Object.entries(responseData.errorResponses)) {
      totalTests++;
      try {
        const isValid = TestResponseValidator.validateErrorResponse(response);
        if (isValid) {
          passedTests++;
          details.push(`✅ ${responseName}: Valid error response`);
        } else {
          details.push(`❌ ${responseName}: Invalid error response structure`);
        }
      } catch (error) {
        details.push(
          `❌ ${responseName}: Test execution failed - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      phase: 'Response Handling',
      totalTests,
      passedTests,
      details,
    };
  }

  // Tool execution integration tests
  private async runToolIntegrationTests(): Promise<{
    phase: string;
    totalTests: number;
    passedTests: number;
    details: string[];
  }> {
    const details: string[] = [];
    let passedTests = 0;
    let totalTests = 0;

    const toolData = TestDataFactory.createToolTestData();

    // Test valid tool executions
    for (const [toolName, tool] of Object.entries(toolData.validTools)) {
      totalTests++;
      try {
        const result = await TestToolHarness.mockToolExecution(tool.name, tool.arguments, tool.expectedResult);
        if (result.success) {
          passedTests++;
          details.push(`✅ ${toolName}: Tool executed successfully`);
        } else {
          details.push(`❌ ${toolName}: Tool execution failed`);
        }
      } catch (error) {
        details.push(
          `❌ ${toolName}: Test execution failed - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Test invalid tool executions
    for (const [toolName, tool] of Object.entries(toolData.invalidTools)) {
      totalTests++;
      try {
        const result = await TestToolHarness.mockToolExecution(tool.name, tool.arguments);
        if (!result.success && result.error) {
          passedTests++;
          details.push(`✅ ${toolName}: Invalid tool properly rejected`);
        } else {
          details.push(`❌ ${toolName}: Invalid tool incorrectly accepted`);
        }
      } catch (error) {
        details.push(
          `❌ ${toolName}: Test execution failed - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      phase: 'Tool Execution',
      totalTests,
      passedTests,
      details,
    };
  }

  // Cross-pattern integration tests
  private async runCrossPatternTests(): Promise<{
    phase: string;
    totalTests: number;
    passedTests: number;
    details: string[];
  }> {
    const details: string[] = [];
    let passedTests = 0;
    let totalTests = 0;

    // Test error handling in configuration loading
    totalTests++;
    try {
      const invalidConfig = TestConfigBuilder.createInvalidConfig('invalid.key', 'invalid-value');
      if (!invalidConfig.loaded && invalidConfig.errors.length > 0) {
        passedTests++;
        details.push('✅ Error handling in configuration: Proper error propagation');
      } else {
        details.push('❌ Error handling in configuration: Missing error propagation');
      }
    } catch (error) {
      details.push(
        `❌ Error handling in configuration: Test failed - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test response building with error factory
    totalTests++;
    try {
      const errorData = TestDataFactory.createErrorTestData();

      const errorResponse = {
        success: false,
        error: errorData.validationError,
      };

      const isValid = TestResponseValidator.validateErrorResponse(errorResponse);
      if (isValid) {
        passedTests++;
        details.push('✅ Response building with errors: Proper error formatting');
      } else {
        details.push('❌ Response building with errors: Invalid error formatting');
      }
    } catch (error) {
      details.push(
        `❌ Response building with errors: Test failed - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test tool execution with configuration
    totalTests++;
    try {
      const configData = TestDataFactory.createConfigurationTestData();

      const result = await TestToolHarness.mockToolExecution(
        'configuration_get',
        {
          key: configData.validConfigs.stringConfig.key,
        },
        {
          key: configData.validConfigs.stringConfig.key,
          value: configData.validConfigs.stringConfig.value,
          source: 'test',
        }
      );

      if (result.success) {
        passedTests++;
        details.push('✅ Tool execution with configuration: Successful integration');
      } else {
        details.push('❌ Tool execution with configuration: Integration failed');
      }
    } catch (error) {
      details.push(
        `❌ Tool execution with configuration: Test failed - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return {
      phase: 'Cross-Pattern Integration',
      totalTests,
      passedTests,
      details,
    };
  }

  // Generate comprehensive test report
  private generateReport(
    results: Array<{ phase: string; totalTests: number; passedTests: number; details: string[] }>
  ): string {
    const lines = [];

    lines.push('# Integration Test Report');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    // Summary
    const totalTests = results.reduce((sum, r) => sum + r.totalTests, 0);
    const totalPassed = results.reduce((sum, r) => sum + r.passedTests, 0);
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';

    lines.push('## Summary');
    lines.push(`- Total Tests: ${totalTests}`);
    lines.push(`- Passed: ${totalPassed}`);
    lines.push(`- Failed: ${totalTests - totalPassed}`);
    lines.push(`- Success Rate: ${successRate}%`);
    lines.push(`- Execution Time: ${this.metrics.executionTime}ms`);
    lines.push('');

    // Phase details
    lines.push('## Phase Results');
    results.forEach(result => {
      lines.push(`### ${result.phase}`);
      lines.push(`Passed: ${result.passedTests}/${result.totalTests}`);
      lines.push('');
      result.details.forEach(detail => lines.push(`- ${detail}`));
      lines.push('');
    });

    return lines.join('\n');
  }

  // Utility methods for specific test scenarios
  async runErrorOnlyTests(): Promise<boolean> {
    const result = await this.runErrorIntegrationTests();
    return result.passedTests === result.totalTests;
  }

  async runConfigOnlyTests(): Promise<boolean> {
    const result = await this.runConfigurationIntegrationTests();
    return result.passedTests === result.totalTests;
  }

  async runResponseOnlyTests(): Promise<boolean> {
    const result = await this.runResponseIntegrationTests();
    return result.passedTests === result.totalTests;
  }

  async runToolOnlyTests(): Promise<boolean> {
    const result = await this.runToolIntegrationTests();
    return result.passedTests === result.totalTests;
  }

  // Performance testing
  async measurePerformance(iterations: number = 100): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    const initialMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      await this.runCrossPatternTests();
    }

    const endTime = Date.now();
    const finalMemory = process.memoryUsage().heapUsed;

    return {
      executionTime: endTime - startTime,
      memoryUsage: finalMemory - initialMemory,
      dbQueries: 0, // Would be tracked if database was involved
      errorCount: this.metrics.errorCount,
      successRate: this.metrics.successRate,
    };
  }
}








