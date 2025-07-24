/**
 * Unit Tests for ResponseBuilder
 * Tests response creation, validation, and chaining capabilities
 */

import { ResponseBuilder, ApiResponse } from '../../src/utils/response-builder.js';
import { ErrorFactory } from '../../src/utils/error-factory.js';
import { ResponseAssertions } from '../../src/test-utils/response-assertions.js';
import { TestDataFactory } from '../../src/test-utils/data-factory.js';

describe('ResponseBuilder', () => {
  const responseData = TestDataFactory.createResponseTestData();

  describe('Success Response Creation', () => {
    test('should create simple success response', () => {
      const data = { id: 1, name: 'Test Item' };
      const response = ResponseBuilder.success(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
      expect(response.timestamp).toBeDefined();
    });

    test('should create success response with message', () => {
      const data = { id: 1, name: 'Test Item' };
      const message = 'Operation completed successfully';
      const response = ResponseBuilder.success(data, message);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe(message);
    });

    test('should create success response with metadata', () => {
      const data = { users: [{ id: 1, name: 'John' }] };
      const metadata = { total: 1, source: 'database' };
      
      const response = ResponseBuilder.success(data)
        .withMetadata(metadata);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.metadata).toEqual(metadata);
    });
  });

  describe('Error Response Creation', () => {
    test('should create error response from MCPError', () => {
      const error = ErrorFactory.validation('Invalid input', { field: 'email' });
      const response = ResponseBuilder.error(error);

      expect(response.success).toBe(false);
      expect(response.data).toBeUndefined();
      expect(response.error).toEqual(error.forAPI());
      expect(response.timestamp).toBeDefined();
    });

    test('should create error response from string', () => {
      const errorMessage = 'Something went wrong';
      const response = ResponseBuilder.error(errorMessage);

      expect(response.success).toBe(false);
      expect(response.error).toEqual({
        type: 'unknown',
        message: errorMessage,
        timestamp: expect.any(String)
      });
    });

    test('should create error response from standard Error', () => {
      const error = new Error('Standard error');
      const response = ResponseBuilder.error(error);

      expect(response.success).toBe(false);
      expect(response.error).toEqual({
        type: 'unknown',
        message: 'Standard error',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Paginated Response Creation', () => {
    test('should create paginated response with all pagination info', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const pagination = {
        currentPage: 1,
        totalPages: 5,
        totalItems: 15,
        itemsPerPage: 3,
        hasNext: true,
        hasPrev: false
      };

      const response = ResponseBuilder.paginated(data, pagination);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.pagination).toEqual(pagination);
    });

    test('should create paginated response with automatic calculations', () => {
      const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      
      const response = ResponseBuilder.paginatedAuto(data, {
        currentPage: 2,
        itemsPerPage: 5,
        totalItems: 25
      });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.pagination).toEqual({
        currentPage: 2,
        totalPages: 5,
        totalItems: 25,
        itemsPerPage: 5,
        hasNext: true,
        hasPrev: true
      });
    });
  });

  describe('Entity CRUD Responses', () => {
    test('should create entity created response', () => {
      const entity = { id: 123, name: 'New Entity', createdAt: '2024-01-01T00:00:00Z' };
      const response = ResponseBuilder.created(entity);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(entity);
      expect(response.message).toContain('created');
    });

    test('should create entity updated response', () => {
      const entity = { id: 123, name: 'Updated Entity', updatedAt: '2024-01-01T00:00:00Z' };
      const response = ResponseBuilder.updated(entity);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(entity);
      expect(response.message).toContain('updated');
    });

    test('should create entity deleted response', () => {
      const entityId = 123;
      const response = ResponseBuilder.deleted(entityId);

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: entityId, deleted: true });
      expect(response.message).toContain('deleted');
    });

    test('should create entity retrieved response', () => {
      const entity = { id: 123, name: 'Retrieved Entity' };
      const response = ResponseBuilder.retrieved(entity);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(entity);
      expect(response.message).toContain('retrieved');
    });
  });

  describe('Search and Query Responses', () => {
    test('should create search response with results', () => {
      const results = [{ id: 1, name: 'Result 1' }, { id: 2, name: 'Result 2' }];
      const query = 'test search';
      
      const response = ResponseBuilder.searchResults(results, query);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(results);
      expect(response.metadata).toEqual({
        query,
        resultCount: results.length,
        hasResults: true
      });
    });

    test('should create search response with no results', () => {
      const response = ResponseBuilder.searchResults([], 'no matches');

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
      expect(response.metadata.hasResults).toBe(false);
      expect(response.metadata.resultCount).toBe(0);
    });

    test('should create search response with filters', () => {
      const results = [{ id: 1, category: 'electronics' }];
      const query = 'laptop';
      const filters = { category: 'electronics', priceRange: '100-500' };
      
      const response = ResponseBuilder.searchResults(results, query)
        .withSearchFilters(filters);

      expect(response.metadata.filters).toEqual(filters);
    });
  });

  describe('Validation Responses', () => {
    test('should create validation success response', () => {
      const validatedData = { email: 'test@example.com', age: 25 };
      const response = ResponseBuilder.validationSuccess(validatedData);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(validatedData);
      expect(response.message).toContain('validation');
    });

    test('should create validation error response', () => {
      const errors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'age', message: 'Age must be positive' }
      ];
      
      const response = ResponseBuilder.validationError(errors);

      expect(response.success).toBe(false);
      expect(response.error.type).toBe('validation');
      expect(response.error.details).toEqual(errors);
    });
  });

  describe('Status Responses', () => {
    test('should create status response with health check', () => {
      const status = {
        healthy: true,
        uptime: 3600,
        version: '1.0.0'
      };
      
      const response = ResponseBuilder.status(status);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(status);
      expect(response.message).toContain('status');
    });

    test('should create not found response', () => {
      const response = ResponseBuilder.notFound('User', '123');

      expect(response.success).toBe(false);
      expect(response.error.type).toBe('resource');
      expect(response.error.message).toContain('User');
      expect(response.error.message).toContain('123');
    });

    test('should create unauthorized response', () => {
      const response = ResponseBuilder.unauthorized('Invalid token');

      expect(response.success).toBe(false);
      expect(response.error.type).toBe('authentication');
      expect(response.error.message).toContain('Invalid token');
    });

    test('should create forbidden response', () => {
      const response = ResponseBuilder.forbidden('Insufficient permissions');

      expect(response.success).toBe(false);
      expect(response.error.type).toBe('authorization');
      expect(response.error.message).toContain('Insufficient permissions');
    });
  });

  describe('Response Chaining', () => {
    test('should chain multiple modifications', () => {
      const data = { id: 1, name: 'Test' };
      const metadata = { source: 'api' };
      const message = 'Success';
      
      const response = ResponseBuilder.success(data)
        .withMessage(message)
        .withMetadata(metadata)
        .withTimestamp('2024-01-01T00:00:00Z');

      expect(response.data).toEqual(data);
      expect(response.message).toBe(message);
      expect(response.metadata).toEqual(metadata);
      expect(response.timestamp).toBe('2024-01-01T00:00:00Z');
    });

    test('should chain pagination and metadata', () => {
      const data = [{ id: 1 }];
      const pagination = { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10, hasNext: false, hasPrev: false };
      const metadata = { queryTime: 15 };
      
      const response = ResponseBuilder.paginated(data, pagination)
        .withMetadata(metadata);

      expect(response.pagination).toEqual(pagination);
      expect(response.metadata).toEqual(metadata);
    });
  });

  describe('Response Validation', () => {
    test('should validate response structure', () => {
      const response = ResponseBuilder.success({ id: 1 });
      const isValid = ResponseBuilder.validate(response);

      expect(isValid).toBe(true);
    });

    test('should detect invalid response structure', () => {
      const invalidResponse = { success: true } as ApiResponse; // Missing required fields
      const isValid = ResponseBuilder.validate(invalidResponse);

      expect(isValid).toBe(false);
    });

    test('should validate pagination structure', () => {
      const response = ResponseBuilder.paginated([{ id: 1 }], {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false
      });

      const isValid = ResponseBuilder.validatePagination(response);
      expect(isValid).toBe(true);
    });
  });

  describe('Response Serialization', () => {
    test('should convert response to JSON safely', () => {
      const data = { id: 1, date: new Date('2024-01-01') };
      const response = ResponseBuilder.success(data);
      
      const json = ResponseBuilder.toJSON(response);
      const parsed = JSON.parse(json);

      expect(parsed.success).toBe(true);
      expect(parsed.data.id).toBe(1);
      expect(typeof parsed.data.date).toBe('string');
    });

    test('should handle circular references in serialization', () => {
      const circular: any = { id: 1 };
      circular.self = circular;
      
      const response = ResponseBuilder.success(circular);
      
      expect(() => ResponseBuilder.toJSON(response)).not.toThrow();
    });
  });

  describe('Integration with Test Utilities', () => {
    test('should work with ResponseAssertions for success responses', () => {
      const response = ResponseBuilder.success({ id: 1, name: 'Test' });

      expect(() => {
        ResponseAssertions.expect(response)
          .toBeSuccessful()
          .toHaveData({ id: 1, name: 'Test' })
          .toHaveTimestamp();
      }).not.toThrow();
    });

    test('should work with ResponseAssertions for error responses', () => {
      const error = ErrorFactory.validation('Invalid input');
      const response = ResponseBuilder.error(error);

      expect(() => {
        ResponseAssertions.expect(response)
          .toBeError()
          .toHaveErrorType('validation')
          .toHaveErrorMessage('Invalid input');
      }).not.toThrow();
    });

    test('should work with ResponseAssertions for pagination', () => {
      const response = ResponseBuilder.paginated([{ id: 1 }], {
        currentPage: 1,
        totalPages: 2,
        totalItems: 15,
        itemsPerPage: 10,
        hasNext: true,
        hasPrev: false
      });

      expect(() => {
        ResponseAssertions.expect(response)
          .toBeSuccessful()
          .toHavePagination()
          .toHaveCurrentPage(1)
          .toHaveTotalPages(2);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should create responses efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        ResponseBuilder.success({ id: i, name: `Item ${i}` });
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should create 1000 responses in less than 50ms
      expect(executionTime).toBeLessThan(50);
    });

    test('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ 
        id: i, 
        data: `Item ${i}`.repeat(10) 
      }));

      const startTime = performance.now();
      const response = ResponseBuilder.success(largeDataset);
      const endTime = performance.now();

      expect(response.data).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('Edge Cases', () => {
    test('should handle null and undefined data', () => {
      const nullResponse = ResponseBuilder.success(null);
      const undefinedResponse = ResponseBuilder.success(undefined);

      expect(nullResponse.success).toBe(true);
      expect(nullResponse.data).toBeNull();
      
      expect(undefinedResponse.success).toBe(true);
      expect(undefinedResponse.data).toBeUndefined();
    });

    test('should handle very large error messages', () => {
      const largeMessage = 'Error: ' + 'A'.repeat(10000);
      const response = ResponseBuilder.error(largeMessage);

      expect(response.success).toBe(false);
      expect(response.error.message).toBe(largeMessage);
    });

    test('should handle complex nested data structures', () => {
      const complexData = {
        users: [
          { id: 1, profile: { name: 'John', settings: { theme: 'dark' } } }
        ],
        metadata: {
          pagination: { total: 100 },
          filters: { active: true }
        }
      };

      const response = ResponseBuilder.success(complexData);

      expect(response.data).toEqual(complexData);
    });

    test('should handle special characters in messages', () => {
      const specialMessage = 'Success with émojis 🎉 and ñ characters & symbols <>&"\'';
      const response = ResponseBuilder.success({}, specialMessage);

      expect(response.message).toBe(specialMessage);
    });
  });
}); 