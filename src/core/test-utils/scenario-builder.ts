/**
 * Test Scenario Builder - Creates complex test scenarios combining multiple patterns
 * Builds structured test scenarios for error handling, configuration, responses, and tool execution
 */

import { TestDataFactory } from './data-factory.js';
import type { TestConfig, ErrorTestCase, ResponseTestCase, ToolTestCase } from './types.js';

// Extended test scenario interface for scenario builder
interface BuilderTestScenario {
  name: string;
  description?: string;
  config?: TestConfig;
  tags?: string[];
  setup?: () => Promise<void> | void;
  teardown?: () => Promise<void> | void;
  errorTests?: ErrorTestCase[];
  responseTests?: ResponseTestCase[];
  toolTests?: ToolTestCase[];
  tests?: Array<{ name: string; type: string; input?: unknown; expectedSuccess: boolean }>;
}

export class TestScenarioBuilder {
  private scenario: Partial<BuilderTestScenario> = {};

  constructor(name?: string) {
    if (name) {
      this.scenario.name = name;
    }
  }

  // Static factory methods
  static create(name?: string): TestScenarioBuilder {
    return new TestScenarioBuilder(name);
  }

  static errorHandlingScenario(): TestScenarioBuilder {
    return new TestScenarioBuilder('Error Handling Scenarios')
      .withDescription('Comprehensive error handling test cases')
      .withConfig({ timeoutMs: 5000 });
  }

  static configurationValidationScenario(): TestScenarioBuilder {
    return new TestScenarioBuilder('Configuration Validation Scenarios')
      .withDescription('Configuration schema validation test cases')
      .withConfig({ timeoutMs: 1000 });
  }

  static responseValidationScenario(): TestScenarioBuilder {
    return new TestScenarioBuilder('Response Validation Scenarios')
      .withDescription('API response structure validation test cases')
      .withConfig({ timeoutMs: 2000 });
  }

  static toolExecutionScenario(): TestScenarioBuilder {
    return new TestScenarioBuilder('Tool Execution Scenarios')
      .withDescription('Tool executor integration test cases')
      .withConfig({ timeoutMs: 10000 });
  }

  static integrationScenario(): TestScenarioBuilder {
    return new TestScenarioBuilder('Integration Test Scenarios')
      .withDescription('End-to-end integration test cases')
      .withConfig({ timeoutMs: 30000 });
  }

  // Builder methods
  withName(name: string): TestScenarioBuilder {
    this.scenario.name = name;
    return this;
  }

  withDescription(description: string): TestScenarioBuilder {
    this.scenario.description = description;
    return this;
  }

  withConfig(config: TestConfig): TestScenarioBuilder {
    this.scenario.config = { ...this.scenario.config, ...config };
    return this;
  }

  withTags(tags: string[]): TestScenarioBuilder {
    this.scenario.tags = tags;
    return this;
  }

  addTag(tag: string): TestScenarioBuilder {
    if (!this.scenario.tags) {
      this.scenario.tags = [];
    }
    this.scenario.tags.push(tag);
    return this;
  }

  withSetup(setup: () => Promise<void> | void): TestScenarioBuilder {
    this.scenario.setup = setup;
    return this;
  }

  withTeardown(teardown: () => Promise<void> | void): TestScenarioBuilder {
    this.scenario.teardown = teardown;
    return this;
  }

  // Error test case builders
  addErrorTest(testCase: ErrorTestCase): TestScenarioBuilder {
    if (!this.scenario.errorTests) {
      this.scenario.errorTests = [];
    }
    this.scenario.errorTests.push(testCase);
    return this;
  }

  addAllErrorTests(): TestScenarioBuilder {
    const errorData = TestDataFactory.createErrorTestData();

    Object.entries(errorData).forEach(([key, data]) => {
      this.addErrorTest({
        name: `should handle ${key}`,
        errorType: data.type,
        expectedMessage: data.message,
        expectedContext: data.context,
      });
    });

    return this;
  }

  addValidationErrorTests(): TestScenarioBuilder {
    const errorData = TestDataFactory.createErrorTestData();

    return this.addErrorTest({
      name: 'should handle validation errors',
      errorType: errorData.validationError.type,
      expectedMessage: errorData.validationError.message,
      expectedContext: errorData.validationError.context,
    });
  }

  addNetworkErrorTests(): TestScenarioBuilder {
    const errorData = TestDataFactory.createErrorTestData();

    return this.addErrorTest({
      name: 'should handle network errors',
      errorType: errorData.networkError.type,
      expectedMessage: errorData.networkError.message,
      expectedContext: errorData.networkError.context,
    });
  }

  // Response test case builders
  addResponseTest(testCase: ResponseTestCase): TestScenarioBuilder {
    if (!this.scenario.responseTests) {
      this.scenario.responseTests = [];
    }
    this.scenario.responseTests.push(testCase);
    return this;
  }

  addSuccessResponseTests(): TestScenarioBuilder {
    const responseData = TestDataFactory.createResponseTestData();

    Object.entries(responseData.successResponses).forEach(([key, response]) => {
      this.addResponseTest({
        name: `should create ${key} success response`,
        response: {
          success: true,
          data: response.data,
          metadata: { timestamp: new Date().toISOString() },
        },
        expectSuccess: true,
        expectedDataShape: typeof response.data === 'object' ? (response.data as Record<string, unknown>) : {},
      });
    });

    return this;
  }

  addErrorResponseTests(): TestScenarioBuilder {
    const responseData = TestDataFactory.createResponseTestData();

    Object.entries(responseData.errorResponses).forEach(([key, response]) => {
      this.addResponseTest({
        name: `should create ${key} error response`,
        response: {
          success: false,
          error:
            typeof response.error === 'object' ? response.error.message || 'Unknown error' : String(response.error),
          metadata: { timestamp: new Date().toISOString() },
        },
        expectSuccess: false,
      });
    });

    return this;
  }

  addPaginationResponseTests(): TestScenarioBuilder {
    const responseData = TestDataFactory.createResponseTestData();

    return this.addResponseTest({
      name: 'should create paginated response',
      response: {
        success: true,
        data: responseData.successResponses.paginated.data,
        metadata: { timestamp: new Date().toISOString() },
      },
      expectSuccess: true,
      validatePagination: true,
    });
  }

  // Tool test case builders
  addToolTest(testCase: ToolTestCase): TestScenarioBuilder {
    if (!this.scenario.toolTests) {
      this.scenario.toolTests = [];
    }
    this.scenario.toolTests.push(testCase);
    return this;
  }

  addValidToolTests(): TestScenarioBuilder {
    const toolData = TestDataFactory.createToolTestData();

    Object.entries(toolData.validTools).forEach(([_key, tool]) => {
      this.addToolTest({
        name: `should execute ${tool.name}`,
        toolName: tool.name,
        input: tool.arguments,
        expectedOutputShape: tool.expectedResult ? (tool.expectedResult as Record<string, unknown>) : {},
      });
    });

    return this;
  }

  addInvalidToolTests(): TestScenarioBuilder {
    const toolData = TestDataFactory.createToolTestData();

    Object.entries(toolData.invalidTools).forEach(([key, tool]) => {
      this.addToolTest({
        name: `should reject ${tool.name} with ${key}`,
        toolName: tool.name,
        input: tool.arguments,
        expectError: true,
        expectedErrorType:
          typeof tool.expectedError === 'object' ? tool.expectedError.type || 'unknown' : String(tool.expectedError),
      });
    });

    return this;
  }

  addPerformanceToolTests(): TestScenarioBuilder {
    const toolData = TestDataFactory.createToolTestData();

    Object.entries(toolData.performanceScenarios).forEach(([_key, scenario]) => {
      this.addToolTest({
        name: `should execute ${scenario.name} within ${scenario.maxExecutionTimeMs}ms`,
        toolName: scenario.name,
        input: scenario.arguments,
        validateExecution: true,
      });
    });

    return this;
  }

  // Configuration test builders
  addConfigurationTests(): TestScenarioBuilder {
    const configData = TestDataFactory.createConfigurationTestData();

    // Add valid configuration tests
    Object.entries(configData.validConfigs).forEach(([key, config]) => {
      this.addTest({
        name: `should load valid ${key}`,
        type: 'configuration',
        input: config,
        expectedSuccess: true,
      });
    });

    // Add invalid configuration tests
    Object.entries(configData.invalidConfigs).forEach(([key, config]) => {
      this.addTest({
        name: `should reject invalid ${key}`,
        type: 'configuration',
        input: config,
        expectedSuccess: false,
      });
    });

    return this;
  }

  // Generic test builder
  addTest(test: { name: string; type: string; input?: unknown; expectedSuccess: boolean }): TestScenarioBuilder {
    if (!this.scenario.tests) {
      this.scenario.tests = [];
    }
    this.scenario.tests.push(test);
    return this;
  }

  // Preset scenario builders
  buildComprehensiveErrorScenario(): BuilderTestScenario {
    return this.withName('Comprehensive Error Testing')
      .withDescription('Tests all error types with proper context and formatting')
      .addTag('error-handling')
      .addTag('comprehensive')
      .addAllErrorTests()
      .build();
  }

  buildResponseValidationScenario(): BuilderTestScenario {
    return this.withName('Response Validation Testing')
      .withDescription('Tests all response types and structures')
      .addTag('response-validation')
      .addTag('api')
      .addSuccessResponseTests()
      .addErrorResponseTests()
      .addPaginationResponseTests()
      .build();
  }

  buildToolIntegrationScenario(): BuilderTestScenario {
    return this.withName('Tool Integration Testing')
      .withDescription('Tests tool execution with valid and invalid inputs')
      .addTag('tool-integration')
      .addTag('execution')
      .addValidToolTests()
      .addInvalidToolTests()
      .addPerformanceToolTests()
      .build();
  }

  buildFullStackScenario(): BuilderTestScenario {
    return this.withName('Full Stack Testing')
      .withDescription('Comprehensive testing across all patterns')
      .addTag('full-stack')
      .addTag('integration')
      .addAllErrorTests()
      .addSuccessResponseTests()
      .addErrorResponseTests()
      .addValidToolTests()
      .addConfigurationTests()
      .build();
  }

  // Build the final scenario
  build(): BuilderTestScenario {
    const built = { ...this.scenario };

    // Set defaults if not provided
    if (!built.name) {
      built.name = 'Test Scenario';
    }
    if (!built.config) {
      built.config = { timeoutMs: 5000 };
    }
    if (!built.tags) {
      built.tags = [];
    }

    return built as BuilderTestScenario;
  }

  // Create multiple scenarios
  static createStandardScenarios(): BuilderTestScenario[] {
    return [
      TestScenarioBuilder.errorHandlingScenario().buildComprehensiveErrorScenario(),
      TestScenarioBuilder.responseValidationScenario().buildResponseValidationScenario(),
      TestScenarioBuilder.toolExecutionScenario().buildToolIntegrationScenario(),
      TestScenarioBuilder.integrationScenario().buildFullStackScenario(),
    ];
  }

  // Utilities for scenario collections
  static combineScenarios(scenarios: BuilderTestScenario[], name: string): BuilderTestScenario {
    const combined = new TestScenarioBuilder(name);

    scenarios.forEach(scenario => {
      if (scenario.errorTests) {
        scenario.errorTests.forEach((test: ErrorTestCase) => combined.addErrorTest(test));
      }
      if (scenario.responseTests) {
        scenario.responseTests.forEach((test: ResponseTestCase) => combined.addResponseTest(test));
      }
      if (scenario.toolTests) {
        scenario.toolTests.forEach((test: ToolTestCase) => combined.addToolTest(test));
      }
      if (scenario.tests) {
        scenario.tests.forEach((test: { name: string; type: string; input?: unknown; expectedSuccess: boolean }) =>
          combined.addTest(test)
        );
      }
      if (scenario.tags) {
        scenario.tags.forEach((tag: string) => combined.addTag(tag));
      }
    });

    return combined.build();
  }
}








