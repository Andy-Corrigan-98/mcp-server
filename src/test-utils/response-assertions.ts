import { ResponseBuilder, type ApiResponse, type SuccessResponse, type ErrorResponse, type PaginatedResponse } from '../utils/response-builder.js';
import { TestResponseValidator } from './response-testing.js';

/**
 * Jest-compatible response assertion helpers designed around ResponseBuilder patterns
 * Provides fluent assertions for API response testing
 */
export class ResponseAssertions {
  /**
   * Assert that response is a valid success response
   */
  static expectSuccessResponse<T>(response: ApiResponse<T>): asserts response is SuccessResponse<T> {
    const validation = TestResponseValidator.validateResponse(response);
    
    expect(validation.isValidResponse).toBe(true);
    expect(validation.hasCorrectStructure).toBe(true);
    expect(validation.metadataValid).toBe(true);
    expect(validation.dataValid).toBe(true);
    
    expect(response.success).toBe(true);
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('metadata');
    expect(response.metadata).toHaveProperty('timestamp');
  }

  /**
   * Assert that response is a valid error response
   */
  static expectErrorResponse(response: ApiResponse): asserts response is ErrorResponse {
    const validation = TestResponseValidator.validateResponse(response);
    
    expect(validation.isValidResponse).toBe(true);
    expect(validation.hasCorrectStructure).toBe(true);
    expect(validation.metadataValid).toBe(true);
    expect(validation.dataValid).toBe(true);
    
    expect(response.success).toBe(false);
    expect(response).toHaveProperty('error');
    expect(response).toHaveProperty('metadata');
    expect(typeof (response as ErrorResponse).error).toBe('string');
  }

  /**
   * Assert that response has valid pagination
   */
  static expectValidPagination<T>(response: ApiResponse<T>): asserts response is PaginatedResponse<T> {
    ResponseAssertions.expectSuccessResponse(response);
    
    const paginatedResponse = response as PaginatedResponse<T>;
    expect(paginatedResponse).toHaveProperty('pagination');
    
    const isValid = TestResponseValidator.validatePagination(paginatedResponse);
    expect(isValid).toBe(true);
    
    const pagination = paginatedResponse.pagination;
    expect(pagination.page).toBeGreaterThanOrEqual(1);
    expect(pagination.pageSize).toBeGreaterThanOrEqual(1);
    expect(pagination.totalItems).toBeGreaterThanOrEqual(0);
    expect(pagination.totalPages).toBeGreaterThanOrEqual(0);
    expect(typeof pagination.hasNext).toBe('boolean');
    expect(typeof pagination.hasPrevious).toBe('boolean');
  }

  /**
   * Assert response metadata properties
   */
  static expectValidMetadata(
    response: ApiResponse,
    expectedProperties?: Record<string, unknown>
  ): void {
    expect(response.metadata).toBeDefined();
    expect(response.metadata.timestamp).toBeDefined();
    expect(new Date(response.metadata.timestamp)).toBeInstanceOf(Date);
    
    if (expectedProperties) {
      for (const [key, value] of Object.entries(expectedProperties)) {
        expect(response.metadata).toHaveProperty(key, value);
      }
    }
  }

  /**
   * Assert response data shape
   */
  static expectResponseDataShape<T>(
    response: SuccessResponse<T>,
    expectedShape: Record<string, string>
  ): void {
    ResponseAssertions.expectSuccessResponse(response);
    
    const validation = TestResponseValidator.validateResponse(response);
    expect(validation.dataValid).toBe(true);
    
    // Validate data structure
    expect(response.data).toBeDefined();
    
    if (typeof response.data === 'object' && response.data !== null) {
      const data = response.data as Record<string, unknown>;
      
      for (const [key, expectedType] of Object.entries(expectedShape)) {
        expect(data).toHaveProperty(key);
        
        const value = data[key];
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        expect(actualType).toBe(expectedType);
      }
    }
  }

  /**
   * Assert entity creation response
   */
  static expectEntityCreatedResponse<T>(
    response: ApiResponse<T>,
    entityType: string,
    identifier: string
  ): void {
    ResponseAssertions.expectSuccessResponse(response);
    expect(response.message).toContain(entityType);
    expect(response.message).toContain(identifier);
    expect(response.message).toContain('created successfully');
  }

  /**
   * Assert entity update response
   */
  static expectEntityUpdatedResponse<T>(
    response: ApiResponse<T>,
    entityType: string,
    identifier: string
  ): void {
    ResponseAssertions.expectSuccessResponse(response);
    expect(response.message).toContain(entityType);
    expect(response.message).toContain(identifier);
    expect(response.message).toContain('updated successfully');
  }

  /**
   * Assert entity deletion response
   */
  static expectEntityDeletedResponse(
    response: ApiResponse,
    entityType: string,
    identifier: string
  ): void {
    ResponseAssertions.expectSuccessResponse(response);
    expect(response.message).toContain(entityType);
    expect(response.message).toContain(identifier);
    expect(response.message).toContain('deleted successfully');
    
    const data = response.data as { deleted: boolean; identifier: string };
    expect(data.deleted).toBe(true);
    expect(data.identifier).toBe(identifier);
  }

  /**
   * Assert list response structure
   */
  static expectListResponse<T>(
    response: ApiResponse,
    expectedItemCount?: number
  ): void {
    ResponseAssertions.expectSuccessResponse(response);
    
    const data = response.data as { items: T[]; count: number; totalCount?: number };
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.count).toBe('number');
    expect(data.count).toBe(data.items.length);
    
    if (expectedItemCount !== undefined) {
      expect(data.count).toBe(expectedItemCount);
    }
  }

  /**
   * Assert search response structure
   */
  static expectSearchResponse<T>(
    response: ApiResponse,
    expectedQuery: string,
    expectedTotalFound?: number
  ): void {
    ResponseAssertions.expectSuccessResponse(response);
    
    const data = response.data as { 
      results: T[]; 
      query: string; 
      found: number; 
      totalFound: number 
    };
    
    expect(data).toHaveProperty('results');
    expect(data).toHaveProperty('query', expectedQuery);
    expect(data).toHaveProperty('found');
    expect(data).toHaveProperty('totalFound');
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.found).toBe(data.results.length);
    
    if (expectedTotalFound !== undefined) {
      expect(data.totalFound).toBe(expectedTotalFound);
    }
  }

  /**
   * Assert validation response structure
   */
  static expectValidationResponse(
    response: ApiResponse,
    expectedValid: boolean,
    expectedErrorCount?: number,
    expectedWarningCount?: number
  ): void {
    ResponseAssertions.expectSuccessResponse(response);
    
    const data = response.data as { 
      valid: boolean; 
      errors: string[]; 
      warnings: string[] 
    };
    
    expect(data).toHaveProperty('valid', expectedValid);
    expect(data).toHaveProperty('errors');
    expect(data).toHaveProperty('warnings');
    expect(Array.isArray(data.errors)).toBe(true);
    expect(Array.isArray(data.warnings)).toBe(true);
    
    if (expectedErrorCount !== undefined) {
      expect(data.errors).toHaveLength(expectedErrorCount);
    }
    
    if (expectedWarningCount !== undefined) {
      expect(data.warnings).toHaveLength(expectedWarningCount);
    }
  }

  /**
   * Assert status response structure
   */
  static expectStatusResponse(
    response: ApiResponse,
    expectedOperation: string,
    expectedStatus: string,
    expectedProgress?: number
  ): void {
    ResponseAssertions.expectSuccessResponse(response);
    
    const data = response.data as { 
      operation: string; 
      status: string; 
      progress?: number; 
      details?: Record<string, unknown> 
    };
    
    expect(data).toHaveProperty('operation', expectedOperation);
    expect(data).toHaveProperty('status', expectedStatus);
    
    if (expectedProgress !== undefined) {
      expect(data).toHaveProperty('progress', expectedProgress);
      expect(data.progress).toBeGreaterThanOrEqual(0);
      expect(data.progress).toBeLessThanOrEqual(100);
    }
  }

  /**
   * Assert response utilities work correctly
   */
  static expectResponseUtilities<T>(response: ApiResponse<T>): void {
    // Test type checking
    const isSuccess = ResponseBuilder.isSuccess(response);
    const isError = ResponseBuilder.isError(response);
    
    expect(isSuccess).toBe(response.success);
    expect(isError).toBe(!response.success);
    expect(isSuccess).not.toBe(isError);
    
    // Test data extraction
    const data = ResponseBuilder.getData(response);
    const error = ResponseBuilder.getError(response);
    
    if (response.success) {
      expect(data).toBe((response as SuccessResponse<T>).data);
      expect(error).toBeNull();
    } else {
      expect(data).toBeNull();
      expect(error).toBe((response as ErrorResponse).error);
    }
    
    // Test serialization
    const plainObject = ResponseBuilder.toPlainObject(response);
    expect(plainObject).toMatchObject(response);
    expect(typeof plainObject).toBe('object');
  }

  /**
   * Assert response chain results
   */
  static expectChainResponse<T>(
    response: ApiResponse<T[]>,
    expectedSuccessCount: number,
    expectedErrorCount?: number
  ): void {
    if (expectedErrorCount === 0 || expectedErrorCount === undefined) {
      ResponseAssertions.expectSuccessResponse(response);
      const data = response.data as T[];
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(expectedSuccessCount);
    } else {
      // Chain with errors may be success or error depending on configuration
      if (response.success) {
        ResponseAssertions.expectSuccessResponse(response);
        expect(response.message).toContain('error');
      } else {
        ResponseAssertions.expectErrorResponse(response);
      }
    }
  }
} 