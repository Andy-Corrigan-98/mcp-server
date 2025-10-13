/**
 * Standardized response builder for consistent API responses across the MCP server
 * Provides type-safe response construction with common patterns
 */

// Common response metadata
interface ResponseMetadata {
  timestamp: string;
  requestId?: string;
  version?: string;
}

// Success response structure
interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  metadata: ResponseMetadata;
}

// Error response structure
interface ErrorResponse {
  success: false;
  error: string;
  errorType?: string;
  context?: Record<string, unknown>;
  metadata: ResponseMetadata;
}

// Union type for all responses
type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Pagination information
interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Paginated response structure
interface PaginatedResponse<T = unknown> extends SuccessResponse<T> {
  pagination: PaginationInfo;
}

/**
 * Builder for creating consistent API responses
 */
export class ResponseBuilder {
  private static readonly DEFAULT_VERSION = '1.0.0';

  /**
   * Create a successful response
   */
  static success<T>(data: T, message?: string, options?: { requestId?: string; version?: string }): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: options?.requestId,
        version: options?.version || ResponseBuilder.DEFAULT_VERSION,
      },
    };
  }

  /**
   * Create an error response
   */
  static error(
    error: string,
    errorType?: string,
    context?: Record<string, unknown>,
    options?: { requestId?: string; version?: string }
  ): ErrorResponse {
    return {
      success: false,
      error,
      errorType,
      context,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: options?.requestId,
        version: options?.version || ResponseBuilder.DEFAULT_VERSION,
      },
    };
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
    },
    message?: string,
    options?: { requestId?: string; version?: string }
  ): PaginatedResponse<T[]> {
    const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);

    return {
      success: true,
      data,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: options?.requestId,
        version: options?.version || ResponseBuilder.DEFAULT_VERSION,
      },
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems: pagination.totalItems,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrevious: pagination.page > 1,
      },
    };
  }

  /**
   * Create a response for entity creation
   */
  static entityCreated<T>(
    entityType: string,
    identifier: string,
    data: T,
    options?: { requestId?: string; version?: string }
  ): SuccessResponse<T> {
    return ResponseBuilder.success(data, `${entityType} '${identifier}' created successfully`, options);
  }

  /**
   * Create a response for entity update
   */
  static entityUpdated<T>(
    entityType: string,
    identifier: string,
    data: T,
    options?: { requestId?: string; version?: string }
  ): SuccessResponse<T> {
    return ResponseBuilder.success(data, `${entityType} '${identifier}' updated successfully`, options);
  }

  /**
   * Create a response for entity deletion
   */
  static entityDeleted(
    entityType: string,
    identifier: string,
    options?: { requestId?: string; version?: string }
  ): SuccessResponse<{ deleted: true; identifier: string }> {
    return ResponseBuilder.success(
      { deleted: true, identifier },
      `${entityType} '${identifier}' deleted successfully`,
      options
    );
  }

  /**
   * Create a response for list operations
   */
  static list<T>(
    items: T[],
    totalCount?: number,
    message?: string,
    options?: { requestId?: string; version?: string }
  ): SuccessResponse<{ items: T[]; count: number; totalCount?: number }> {
    return ResponseBuilder.success(
      {
        items,
        count: items.length,
        totalCount,
      },
      message || `Retrieved ${items.length} items`,
      options
    );
  }

  /**
   * Create a response for search operations
   */
  static search<T>(
    results: T[],
    query: string,
    totalFound: number,
    options?: { requestId?: string; version?: string }
  ): SuccessResponse<{ results: T[]; query: string; found: number; totalFound: number }> {
    return ResponseBuilder.success(
      {
        results,
        query,
        found: results.length,
        totalFound,
      },
      `Found ${totalFound} results for query: ${query}`,
      options
    );
  }

  /**
   * Create a response for validation results
   */
  static validation(
    valid: boolean,
    errors: string[] = [],
    warnings: string[] = [],
    options?: { requestId?: string; version?: string }
  ): SuccessResponse<{ valid: boolean; errors: string[]; warnings: string[] }> {
    return ResponseBuilder.success(
      { valid, errors, warnings },
      valid ? 'Validation passed' : `Validation failed with ${errors.length} errors`,
      options
    );
  }

  /**
   * Create a response for operation status
   */
  static status(
    operation: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    progress?: number,
    details?: Record<string, unknown>,
    options?: { requestId?: string; version?: string }
  ): SuccessResponse<{ operation: string; status: string; progress?: number; details?: Record<string, unknown> }> {
    return ResponseBuilder.success(
      {
        operation,
        status,
        progress,
        details,
      },
      `Operation ${operation} is ${status}`,
      options
    );
  }

  /**
   * Transform existing response data into standard format
   */
  static wrap<T>(data: T, message?: string, options?: { requestId?: string; version?: string }): SuccessResponse<T> {
    return ResponseBuilder.success(data, message, options);
  }

  /**
   * Check if a response indicates success
   */
  static isSuccess<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
    return response.success === true;
  }

  /**
   * Check if a response indicates error
   */
  static isError<T>(response: ApiResponse<T>): response is ErrorResponse {
    return response.success === false;
  }

  /**
   * Extract data from a successful response
   */
  static getData<T>(response: ApiResponse<T>): T | null {
    return ResponseBuilder.isSuccess(response) ? response.data : null;
  }

  /**
   * Extract error message from an error response
   */
  static getError<T>(response: ApiResponse<T>): string | null {
    return ResponseBuilder.isError(response) ? response.error : null;
  }

  /**
   * Convert response to plain object (for JSON serialization)
   */
  static toPlainObject<T>(response: ApiResponse<T>): Record<string, unknown> {
    return {
      ...response,
      metadata: {
        ...response.metadata,
      },
    };
  }

  /**
   * Create response with custom metadata
   */
  static withMetadata<T>(response: ApiResponse<T>, additionalMetadata: Record<string, unknown>): ApiResponse<T> {
    return {
      ...response,
      metadata: {
        ...response.metadata,
        ...additionalMetadata,
      },
    };
  }

  /**
   * Chain multiple operations with consistent error handling
   */
  static async chain<T>(
    operations: Array<() => Promise<T>>,
    options?: { stopOnError?: boolean; requestId?: string }
  ): Promise<SuccessResponse<T[]> | ErrorResponse> {
    const results: T[] = [];
    const errors: string[] = [];

    for (let i = 0; i < operations.length; i++) {
      try {
        const result = await operations[i]();
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Operation ${i + 1}: ${errorMessage}`);

        if (options?.stopOnError) {
          return ResponseBuilder.error(
            `Chain failed at operation ${i + 1}: ${errorMessage}`,
            'CHAIN_OPERATION_FAILED',
            { operationIndex: i, totalOperations: operations.length, errors },
            options
          );
        }
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return ResponseBuilder.error(
        'All operations in chain failed',
        'CHAIN_COMPLETE_FAILURE',
        { errors, totalOperations: operations.length },
        options
      );
    }

    const message =
      errors.length > 0
        ? `Chain completed with ${errors.length} errors out of ${operations.length} operations`
        : `Chain completed successfully with ${operations.length} operations`;

    return ResponseBuilder.success(results, message, options);
  }
}

// Export types for external use
export type { ApiResponse, SuccessResponse, ErrorResponse, PaginatedResponse, PaginationInfo, ResponseMetadata };
