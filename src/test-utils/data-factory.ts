/**
 * Test Data Factory - Generates test data for Phase 1/2 pattern utilities
 * Creates realistic test data for ErrorFactory, ConfigurationSchema, ResponseBuilder, and ToolExecutor
 */

// Types are imported when needed

// Constants to avoid magic numbers
const MAX_PORT_NUMBER = 65536;
const DEFAULT_STRING_LENGTH = 10;
const UUID_RADIX = 16;
const STRING_RADIX_OFFSET = 20;
const RANDOM_PROBABILITY = 0.5;
const DEFAULT_ARRAY_LENGTH = 5;
const EMAIL_USERNAME_LENGTH = 8;
const EMAIL_DOMAIN_LENGTH = 6;
const UUID_HEX_MASK = 0x3;
const UUID_VERSION_BITS = 0x8;
const DAYS_IN_YEAR = 365;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;
const DEFAULT_MAX_RANDOM = 100;

export class TestDataFactory {
  // Error Factory Test Data
  static createErrorTestData() {
    return {
      validationError: {
        type: 'validation' as const,
        message: 'Invalid input provided',
        context: { field: 'email', value: 'invalid-email' },
        cause: new Error('Email format validation failed'),
      },

      configurationError: {
        type: 'configuration' as const,
        message: 'Missing required configuration',
        context: { key: 'database.host', source: 'environment' },
      },

      authenticationError: {
        type: 'authentication' as const,
        message: 'Authentication failed',
        context: { provider: 'oauth2', reason: 'invalid_token' },
      },

      authorizationError: {
        type: 'authorization' as const,
        message: 'Insufficient permissions',
        context: { resource: '/admin/users', requiredRole: 'admin' },
      },

      networkError: {
        type: 'network' as const,
        message: 'Network request failed',
        context: { url: 'https://api.example.com', statusCode: 500, timeout: 5000 },
      },

      resourceError: {
        type: 'resource' as const,
        message: 'Resource not found',
        context: { resourceType: 'user', resourceId: '12345' },
      },

      operationError: {
        type: 'operation' as const,
        message: 'Operation failed',
        context: { operation: 'file_upload', step: 'validation' },
      },

      timeoutError: {
        type: 'timeout' as const,
        message: 'Operation timed out',
        context: { operation: 'database_query', timeoutMs: 10000 },
      },

      rateLimitError: {
        type: 'rate_limit' as const,
        message: 'Rate limit exceeded',
        context: { limit: 100, window: '1h', retryAfter: 3600 },
      },

      concurrencyError: {
        type: 'concurrency' as const,
        message: 'Concurrent modification detected',
        context: { resource: 'document', version: 5, expectedVersion: 4 },
      },

      systemError: {
        type: 'system' as const,
        message: 'System error occurred',
        context: { component: 'database', severity: 'critical' },
      },

      unknownError: {
        type: 'unknown' as const,
        message: 'An unknown error occurred',
        context: { originalError: 'TypeError: Cannot read property of undefined' },
      },
    };
  }

  // Configuration Schema Test Data
  static createConfigurationTestData() {
    return {
      validConfigs: {
        stringConfig: {
          key: 'app.name',
          value: 'Test Application',
          type: 'string' as const,
          required: true,
          defaultValue: 'Default App',
        },

        numberConfig: {
          key: 'server.port',
          value: 3000,
          type: 'number' as const,
          required: true,
          validator: (value: number) => value > 0 && value < MAX_PORT_NUMBER,
        },

        booleanConfig: {
          key: 'debug.enabled',
          value: true,
          type: 'boolean' as const,
          required: false,
          defaultValue: false,
        },

        arrayConfig: {
          key: 'cors.origins',
          value: ['http://localhost:3000', 'https://app.example.com'],
          type: 'array' as const,
          required: false,
          defaultValue: [],
        },
      },

      invalidConfigs: {
        missingRequired: {
          key: 'database.url',
          value: undefined,
          type: 'string' as const,
          required: true,
        },

        invalidType: {
          key: 'server.port',
          value: 'not-a-number',
          type: 'number' as const,
          required: true,
        },

        failedValidation: {
          key: 'server.port',
          value: -1,
          type: 'number' as const,
          required: true,
          validator: (value: number) => value > 0 && value < MAX_PORT_NUMBER,
        },
      },

      predefinedSchemas: {
        TIME: ['time.default_timezone', 'time.format', 'time.awareness_check_interval'],
        VALIDATION: ['validation.strict_mode', 'validation.max_errors', 'validation.timeout'],
        CONSCIOUSNESS: ['consciousness.max_topic_length', 'consciousness.enable_deep_thinking'],
      },
    };
  }

  // Response Builder Test Data
  static createResponseTestData() {
    return {
      successResponses: {
        simple: {
          success: true,
          data: { id: 1, name: 'Test Item' },
          message: 'Operation completed successfully',
        },

        withMetadata: {
          success: true,
          data: {
            users: [
              { id: 1, name: 'John' },
              { id: 2, name: 'Jane' },
            ],
          },
          metadata: { total: 2, page: 1, pageSize: 10 },
          message: 'Users retrieved successfully',
        },

        paginated: {
          success: true,
          data: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` })),
          pagination: {
            currentPage: 1,
            totalPages: 3,
            totalItems: 15,
            itemsPerPage: 5,
            hasNext: true,
            hasPrev: false,
          },
        },
      },

      errorResponses: {
        validation: {
          success: false,
          error: {
            type: 'validation',
            message: 'Validation failed',
            context: { field: 'email', value: 'invalid' },
          },
        },

        notFound: {
          success: false,
          error: {
            type: 'resource',
            message: 'Resource not found',
            context: { resourceType: 'user', resourceId: '999' },
          },
        },

        serverError: {
          success: false,
          error: {
            type: 'system',
            message: 'Internal server error',
            context: { component: 'database', severity: 'critical' },
          },
        },
      },

      crudResponses: {
        created: {
          success: true,
          data: { id: 123, name: 'New Item', createdAt: new Date().toISOString() },
          message: 'Item created successfully',
        },

        updated: {
          success: true,
          data: { id: 123, name: 'Updated Item', updatedAt: new Date().toISOString() },
          message: 'Item updated successfully',
        },

        deleted: {
          success: true,
          data: { id: 123, deletedAt: new Date().toISOString() },
          message: 'Item deleted successfully',
        },
      },
    };
  }

  // Tool Executor Test Data
  static createToolTestData() {
    return {
      validTools: {
        timeCurrentTool: {
          name: 'time_current',
          description: 'Get current time',
          inputSchema: {
            type: 'object',
            properties: {
              format: { type: 'string', enum: ['iso', 'unix', 'human'] },
              timezone: { type: 'string' },
            },
          },
          arguments: {
            format: 'iso',
            timezone: 'UTC',
          },
          expectedResult: {
            time: '2024-01-01T00:00:00.000Z',
            timezone: 'UTC',
            format: 'iso',
          },
        },

        configurationGetTool: {
          name: 'configuration_get',
          description: 'Get configuration value',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string' },
            },
            required: ['key'],
          },
          arguments: {
            key: 'app.name',
          },
          expectedResult: {
            key: 'app.name',
            value: 'Test Application',
            source: 'default',
          },
        },
      },

      invalidTools: {
        missingArguments: {
          name: 'configuration_get',
          arguments: {}, // Missing required 'key'
          expectedError: {
            type: 'validation',
            message: 'Missing required argument: key',
          },
        },

        invalidArguments: {
          name: 'time_current',
          arguments: {
            format: 'invalid-format', // Invalid enum value
            timezone: 123, // Invalid type
          },
          expectedError: {
            type: 'validation',
            message: 'Invalid argument format',
          },
        },
      },

      performanceScenarios: {
        fast: {
          name: 'time_current',
          arguments: { format: 'iso' },
          maxExecutionTimeMs: 10,
        },

        moderate: {
          name: 'configuration_get',
          arguments: { key: 'app.name' },
          maxExecutionTimeMs: 50,
        },
      },
    };
  }

  // Integration Test Data
  static createIntegrationTestData() {
    return {
      scenarios: {
        userWorkflow: {
          name: 'Complete User Workflow',
          steps: [
            {
              description: 'Create user',
              tool: 'user_create',
              arguments: { name: 'Test User', email: 'test@example.com' },
              expectedSuccess: true,
            },
            {
              description: 'Get user',
              tool: 'user_get',
              arguments: { id: '${previous.data.id}' },
              expectedSuccess: true,
            },
            {
              description: 'Update user',
              tool: 'user_update',
              arguments: { id: '${previous.data.id}', name: 'Updated User' },
              expectedSuccess: true,
            },
            {
              description: 'Delete user',
              tool: 'user_delete',
              arguments: { id: '${previous.data.id}' },
              expectedSuccess: true,
            },
          ],
        },

        errorHandling: {
          name: 'Error Handling Scenarios',
          steps: [
            {
              description: 'Invalid input validation',
              tool: 'user_create',
              arguments: { name: '', email: 'invalid-email' },
              expectedSuccess: false,
              expectedError: { type: 'validation' },
            },
            {
              description: 'Resource not found',
              tool: 'user_get',
              arguments: { id: 'nonexistent' },
              expectedSuccess: false,
              expectedError: { type: 'resource' },
            },
          ],
        },
      },
    };
  }

  // Generate random test data
  static generateRandomData() {
    const randomString = (length: number = DEFAULT_STRING_LENGTH) =>
      Math.random()
        .toString(UUID_RADIX + STRING_RADIX_OFFSET)
        .substring(2, length + 2);

    const randomNumber = (min: number = 0, max: number = DEFAULT_MAX_RANDOM) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const randomBoolean = () => Math.random() < RANDOM_PROBABILITY;

    const randomArray = <T>(generator: () => T, length: number = DEFAULT_ARRAY_LENGTH) =>
      Array.from({ length }, generator);

    return {
      string: randomString,
      number: randomNumber,
      boolean: randomBoolean,
      array: randomArray,

      // Specialized generators
      email: () => `${randomString(EMAIL_USERNAME_LENGTH)}@${randomString(EMAIL_DOMAIN_LENGTH)}.com`,
      url: () => `https://${randomString(EMAIL_USERNAME_LENGTH)}.com/${randomString(EMAIL_DOMAIN_LENGTH)}`,
      uuid: () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = (Math.random() * UUID_RADIX) | 0;
          const v = c === 'x' ? r : (r & UUID_HEX_MASK) | UUID_VERSION_BITS;
          return v.toString(UUID_RADIX);
        }),
      date: () =>
        new Date(
          Date.now() -
            randomNumber(0, DAYS_IN_YEAR) * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND
        ).toISOString(),
    };
  }
}
