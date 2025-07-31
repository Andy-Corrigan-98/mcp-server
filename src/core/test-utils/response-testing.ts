import {
  ResponseBuilder,
  type ApiResponse,
  type SuccessResponse,
  type ErrorResponse,
  type PaginatedResponse,
} from '../utils/response-builder.js';
import type { ResponseTestCase, ResponseValidationResult } from './types.js';

/**
 * Response testing utilities designed around ResponseBuilder patterns
 * Provides comprehensive validation for API response structures and consistency
 */
export class TestResponseValidator {
  /**
   * Validate response structure and consistency
   */
  static validateResponse<T>(response: ApiResponse<T>): ResponseValidationResult {
    const result: ResponseValidationResult = {
      isValidResponse: false,
      hasCorrectStructure: false,
      metadataValid: false,
      dataValid: false,
      typeMatches: false,
    };

    // Check basic structure
    if (!response || typeof response !== 'object') {
      return result;
    }

    // Check required fields
    const hasRequiredFields = 'success' in response && 'metadata' in response;
    if (!hasRequiredFields) {
      return result;
    }
    result.hasCorrectStructure = true;

    // Validate metadata
    const metadata = response.metadata;
    result.metadataValid = Boolean(
      metadata &&
        typeof metadata === 'object' &&
        'timestamp' in metadata &&
        metadata.timestamp &&
        !isNaN(Date.parse(metadata.timestamp))
    );

    // Validate based on success/error type
    if (response.success) {
      const successResponse = response as SuccessResponse<T>;
      result.dataValid = 'data' in successResponse;
      result.typeMatches = true;
    } else {
      const errorResponse = response as ErrorResponse;
      result.dataValid = 'error' in errorResponse && typeof errorResponse.error === 'string';
      result.typeMatches = true;
    }

    // Check pagination if present
    if ('pagination' in response) {
      const paginatedResponse = response as PaginatedResponse<T>;
      result.paginationValid = TestResponseValidator.validatePagination(paginatedResponse);
    }

    result.isValidResponse =
      result.hasCorrectStructure && result.metadataValid && result.dataValid && result.typeMatches;

    return result;
  }

  /**
   * Validate pagination structure
   */
  static validatePagination<T>(response: PaginatedResponse<T>): boolean {
    const pagination = response.pagination;

    if (!pagination || typeof pagination !== 'object') {
      return false;
    }

    const requiredFields = ['page', 'pageSize', 'totalItems', 'totalPages', 'hasNext', 'hasPrevious'];
    const hasAllFields = requiredFields.every(field => field in pagination);

    if (!hasAllFields) {
      return false;
    }

    // Validate field types and logic
    const { page, pageSize, totalItems, totalPages, hasNext, hasPrevious } = pagination;

    return (
      typeof page === 'number' &&
      page >= 1 &&
      typeof pageSize === 'number' &&
      pageSize >= 1 &&
      typeof totalItems === 'number' &&
      totalItems >= 0 &&
      typeof totalPages === 'number' &&
      totalPages >= 0 &&
      typeof hasNext === 'boolean' &&
      typeof hasPrevious === 'boolean' &&
      totalPages === Math.ceil(totalItems / pageSize) &&
      hasNext === page < totalPages &&
      hasPrevious === page > 1
    );
  }

  /**
   * Create test responses for various scenarios
   */
  static createTestResponses() {
    return {
      successResponse: ResponseBuilder.success({ id: 1, name: 'Test Item' }, 'Test successful', {
        requestId: 'test-123',
      }),

      errorResponse: ResponseBuilder.error(
        'Test error occurred',
        'TEST_ERROR',
        { field: 'testField' },
        { requestId: 'test-456' }
      ),

      paginatedResponse: ResponseBuilder.paginated(
        [{ id: 1 }, { id: 2 }, { id: 3 }],
        { page: 1, pageSize: 10, totalItems: 25 },
        'Retrieved items',
        { requestId: 'test-789' }
      ),

      entityCreatedResponse: ResponseBuilder.entityCreated(
        'User',
        'user-123',
        { id: 'user-123', name: 'Test User' },
        { requestId: 'test-create' }
      ),

      entityUpdatedResponse: ResponseBuilder.entityUpdated(
        'User',
        'user-123',
        { id: 'user-123', name: 'Updated User' },
        { requestId: 'test-update' }
      ),

      entityDeletedResponse: ResponseBuilder.entityDeleted('User', 'user-123', { requestId: 'test-delete' }),

      listResponse: ResponseBuilder.list([{ id: 1 }, { id: 2 }], 10, 'Items retrieved', { requestId: 'test-list' }),

      searchResponse: ResponseBuilder.search([{ id: 1, name: 'Match 1' }], 'test query', 5, {
        requestId: 'test-search',
      }),

      validationResponse: ResponseBuilder.validation(false, ['Field is required'], ['Field might be deprecated'], {
        requestId: 'test-validation',
      }),

      statusResponse: ResponseBuilder.status(
        'data_processing',
        'running',
        75,
        { processedItems: 750, totalItems: 1000 },
        { requestId: 'test-status' }
      ),
    };
  }

  /**
   * Create response test cases for comprehensive testing
   */
  static createResponseTestCases(): ResponseTestCase[] {
    const testResponses = TestResponseValidator.createTestResponses();

    return [
      {
        name: 'Success Response',
        response: testResponses.successResponse,
        expectSuccess: true,
        expectedDataShape: { id: 'number', name: 'string' },
      },
      {
        name: 'Error Response',
        response: testResponses.errorResponse,
        expectSuccess: false,
        expectedMetadata: { requestId: 'string', timestamp: 'string' },
      },
      {
        name: 'Paginated Response',
        response: testResponses.paginatedResponse,
        expectSuccess: true,
        validatePagination: true,
      },
      {
        name: 'Entity Created Response',
        response: testResponses.entityCreatedResponse,
        expectSuccess: true,
        expectedDataShape: { id: 'string', name: 'string' },
      },
      {
        name: 'List Response',
        response: testResponses.listResponse,
        expectSuccess: true,
        expectedDataShape: { items: 'array', count: 'number', totalCount: 'number' },
      },
      {
        name: 'Search Response',
        response: testResponses.searchResponse,
        expectSuccess: true,
        expectedDataShape: { results: 'array', query: 'string', found: 'number', totalFound: 'number' },
      },
      {
        name: 'Validation Response',
        response: testResponses.validationResponse,
        expectSuccess: true,
        expectedDataShape: { valid: 'boolean', errors: 'array', warnings: 'array' },
      },
      {
        name: 'Status Response',
        response: testResponses.statusResponse,
        expectSuccess: true,
        expectedDataShape: { operation: 'string', status: 'string', progress: 'number', details: 'object' },
      },
    ];
  }

  /**
   * Test response utilities and helpers
   */
  static testResponseUtilities() {
    const testResponses = TestResponseValidator.createTestResponses();

    return {
      typeChecking: {
        isSuccess: {
          successResponse: ResponseBuilder.isSuccess(testResponses.successResponse),
          errorResponse: ResponseBuilder.isSuccess(testResponses.errorResponse),
        },
        isError: {
          successResponse: ResponseBuilder.isError(testResponses.successResponse),
          errorResponse: ResponseBuilder.isError(testResponses.errorResponse),
        },
      },

      dataExtraction: {
        fromSuccess: ResponseBuilder.getData(testResponses.successResponse),
        fromError: ResponseBuilder.getData(testResponses.errorResponse),
      },

      errorExtraction: {
        fromSuccess: ResponseBuilder.getError(testResponses.successResponse),
        fromError: ResponseBuilder.getError(testResponses.errorResponse),
      },

      serialization: {
        success: ResponseBuilder.toPlainObject(testResponses.successResponse),
        error: ResponseBuilder.toPlainObject(testResponses.errorResponse),
      },

      metadataHandling: {
        withAdditionalMetadata: ResponseBuilder.withMetadata(testResponses.successResponse, {
          customField: 'customValue',
          userId: 'user-123',
        }),
      },
    };
  }

  /**
   * Test response chaining functionality
   */
  static async testResponseChaining() {
    const operations = [
      () => Promise.resolve('Operation 1 Result'),
      () => Promise.resolve('Operation 2 Result'),
      () => Promise.resolve('Operation 3 Result'),
    ];

    const chainResult = await ResponseBuilder.chain(operations, { requestId: 'chain-test' });

    const operationsWithError = [
      () => Promise.resolve('Success 1'),
      () => Promise.reject(new Error('Operation 2 Failed')),
      () => Promise.resolve('Success 3'),
    ];

    const chainWithErrorResult = await ResponseBuilder.chain(operationsWithError, {
      stopOnError: false,
      requestId: 'chain-error-test',
    });

    const chainWithStopOnErrorResult = await ResponseBuilder.chain(operationsWithError, {
      stopOnError: true,
      requestId: 'chain-stop-test',
    });

    return {
      successfulChain: chainResult,
      chainWithContinue: chainWithErrorResult,
      chainWithStop: chainWithStopOnErrorResult,
    };
  }

  /**
   * Create edge case response scenarios
   */
  static createEdgeCaseScenarios() {
    return [
      {
        name: 'Empty data response',
        response: ResponseBuilder.success(null, 'Empty data'),
        expectedValidation: { dataValid: true },
      },
      {
        name: 'Large data response',
        response: ResponseBuilder.success(
          Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `item-${i}` })),
          'Large dataset'
        ),
        expectedValidation: { dataValid: true },
      },
      {
        name: 'Nested object response',
        response: ResponseBuilder.success({
          level1: {
            level2: {
              level3: {
                deeply: { nested: { data: 'value' } },
              },
            },
          },
        }),
        expectedValidation: { dataValid: true },
      },
      {
        name: 'Unicode string response',
        response: ResponseBuilder.success({
          unicode: '🎉 Test with émojis and ñ special châractërs 中文 العربية',
          mixed: 'ASCII + 🌟 Unicode',
        }),
        expectedValidation: { dataValid: true },
      },
      {
        name: 'Empty pagination response',
        response: ResponseBuilder.paginated([], { page: 1, pageSize: 10, totalItems: 0 }, 'No items found'),
        expectedValidation: { dataValid: true, paginationValid: true },
      },
    ];
  }

  /**
   * Performance testing for response creation and validation
   */
  static performResponsePerformanceTest() {
    const startTime = Date.now();

    // Create many responses quickly
    const responses = Array.from({ length: 1000 }, (_, i) =>
      ResponseBuilder.success({ id: i, data: `item-${i}` }, `Item ${i}`)
    );

    const creationTime = Date.now() - startTime;

    // Validate all responses
    const validationStartTime = Date.now();
    const validationResults = responses.map(response => TestResponseValidator.validateResponse(response));
    const validationTime = Date.now() - validationStartTime;

    return {
      responseCount: responses.length,
      creationTime,
      validationTime,
      allValid: validationResults.every(result => result.isValidResponse),
      averageCreationTime: creationTime / responses.length,
      averageValidationTime: validationTime / responses.length,
    };
  }

  /**
   * Validate a success response structure
   */
  static validateSuccessResponse(response: unknown): boolean {
    if (typeof response !== 'object' || response === null) {
      return false;
    }

    const res = response as Record<string, unknown>;
    return res.success === true && 'data' in res && 'timestamp' in res;
  }

  /**
   * Validate an error response structure
   */
  static validateErrorResponse(response: unknown): boolean {
    if (typeof response !== 'object' || response === null) {
      return false;
    }

    const res = response as Record<string, unknown>;
    return res.success === false && 'error' in res && 'timestamp' in res;
  }
}








