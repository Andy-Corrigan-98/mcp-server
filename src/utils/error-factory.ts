/**
 * Standardized error factory for predictable error patterns across the MCP server
 * Provides consistent error messages, types, and context for better debugging
 */

// Constants to avoid magic numbers
const JSON_INPUT_TRUNCATE_LENGTH = 100;

// Error type constants for categorization
export const ERROR_TYPES = {
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  API_KEY_MISSING: 'API_KEY_MISSING',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  TYPE_CONVERSION_ERROR: 'TYPE_CONVERSION_ERROR',
  JSON_PARSE_ERROR: 'JSON_PARSE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  OPERATION_NOT_SUPPORTED: 'OPERATION_NOT_SUPPORTED',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
} as const;

// Enhanced error class with additional context
export class MCPError extends Error {
  public readonly type: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(message: string, type: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'MCPError';
    this.type = type;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Ensure proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MCPError);
    }
  }
}

/**
 * Factory for creating standardized errors across the MCP server
 */
export class ErrorFactory {
  // Entity-related errors
  static entityNotFound(entityType: string, identifier: string, context?: Record<string, unknown>): MCPError {
    const message = `${entityType} '${identifier}' not found`;
    return new MCPError(message, ERROR_TYPES.ENTITY_NOT_FOUND, {
      entityType,
      identifier,
      ...context,
    });
  }

  static entityAlreadyExists(entityType: string, identifier: string, context?: Record<string, unknown>): MCPError {
    const message = `${entityType} '${identifier}' already exists`;
    return new MCPError(message, ERROR_TYPES.ENTITY_ALREADY_EXISTS, {
      entityType,
      identifier,
      ...context,
    });
  }

  // Tool and operation errors
  static toolNotFound(toolName: string, category?: string, context?: Record<string, unknown>): MCPError {
    const message = category ? `Unknown ${category} tool: ${toolName}` : `Tool '${toolName}' not found`;
    return new MCPError(message, ERROR_TYPES.TOOL_NOT_FOUND, {
      toolName,
      category,
      ...context,
    });
  }

  static operationNotSupported(operation: string, module: string, context?: Record<string, unknown>): MCPError {
    const message = `Operation '${operation}' not supported by ${module} module`;
    return new MCPError(message, ERROR_TYPES.OPERATION_NOT_SUPPORTED, {
      operation,
      module,
      ...context,
    });
  }

  // Validation errors
  static fieldRequired(fieldName: string, expectedType?: string, context?: Record<string, unknown>): MCPError {
    const typeInfo = expectedType ? ` and must be ${expectedType}` : '';
    const message = `Field '${fieldName}' is required${typeInfo}`;
    return new MCPError(message, ERROR_TYPES.VALIDATION_FAILED, {
      fieldName,
      expectedType,
      validationType: 'required',
      ...context,
    });
  }

  static fieldEmpty(fieldName: string, context?: Record<string, unknown>): MCPError {
    const message = `Field '${fieldName}' cannot be empty after sanitization`;
    return new MCPError(message, ERROR_TYPES.VALIDATION_FAILED, {
      fieldName,
      validationType: 'empty',
      ...context,
    });
  }

  static invalidValue(
    fieldName: string,
    value: unknown,
    expectedType: string,
    context?: Record<string, unknown>
  ): MCPError {
    const message = `Value '${value}' is not a valid ${expectedType}`;
    return new MCPError(message, ERROR_TYPES.VALIDATION_FAILED, {
      fieldName,
      value,
      expectedType,
      validationType: 'type',
      ...context,
    });
  }

  static valueOutOfRange(
    fieldName: string,
    value: number,
    min?: number,
    max?: number,
    context?: Record<string, unknown>
  ): MCPError {
    let message = `Value ${value} is out of range`;
    if (min !== undefined && max !== undefined) {
      message = `Value ${value} must be between ${min} and ${max}`;
    } else if (min !== undefined) {
      message = `Value ${value} must be >= ${min}`;
    } else if (max !== undefined) {
      message = `Value ${value} must be <= ${max}`;
    }

    return new MCPError(message, ERROR_TYPES.VALIDATION_FAILED, {
      fieldName,
      value,
      min,
      max,
      validationType: 'range',
      ...context,
    });
  }

  // Configuration errors
  static configurationNotFound(key: string, context?: Record<string, unknown>): MCPError {
    const message = `Configuration key '${key}' not found`;
    return new MCPError(message, ERROR_TYPES.CONFIGURATION_ERROR, {
      configKey: key,
      errorType: 'not_found',
      ...context,
    });
  }

  static configurationLoadFailed(module: string, reason?: string, context?: Record<string, unknown>): MCPError {
    const message = `Failed to load ${module} configuration${reason ? `: ${reason}` : ''}`;
    return new MCPError(message, ERROR_TYPES.CONFIGURATION_ERROR, {
      module,
      reason,
      errorType: 'load_failed',
      ...context,
    });
  }

  static unknownConfigurationType(type: string, context?: Record<string, unknown>): MCPError {
    const message = `Unknown configuration type: ${type}`;
    return new MCPError(message, ERROR_TYPES.CONFIGURATION_ERROR, {
      type,
      errorType: 'unknown_type',
      ...context,
    });
  }

  // API and external service errors
  static apiKeyMissing(service: string, keyName: string, context?: Record<string, unknown>): MCPError {
    const message = `${keyName} environment variable is required for ${service}`;
    return new MCPError(message, ERROR_TYPES.API_KEY_MISSING, {
      service,
      keyName,
      ...context,
    });
  }

  static externalServiceFailed(
    service: string,
    operation: string,
    reason?: string,
    context?: Record<string, unknown>
  ): MCPError {
    const message = `${service} ${operation} failed${reason ? `: ${reason}` : ''}`;
    return new MCPError(message, ERROR_TYPES.EXTERNAL_SERVICE_ERROR, {
      service,
      operation,
      reason,
      ...context,
    });
  }

  // Security errors
  static securityViolation(violations: string[], context?: Record<string, unknown>): MCPError {
    const message = `Security violations detected: ${violations.join(', ')}`;
    return new MCPError(message, ERROR_TYPES.SECURITY_VIOLATION, {
      violations,
      ...context,
    });
  }

  // Data processing errors
  static jsonParseFailed(input: string, context?: Record<string, unknown>): MCPError {
    const message = 'Invalid JSON provided';
    return new MCPError(message, ERROR_TYPES.JSON_PARSE_ERROR, {
      input: input.substring(0, JSON_INPUT_TRUNCATE_LENGTH), // Truncate for safety
      ...context,
    });
  }

  static jsonSerializeFailed(data: unknown, context?: Record<string, unknown>): MCPError {
    const message = 'Object cannot be serialized to JSON';
    return new MCPError(message, ERROR_TYPES.JSON_PARSE_ERROR, {
      dataType: typeof data,
      ...context,
    });
  }

  // Resource limit errors
  static resourceLimitExceeded(
    resource: string,
    limit: number,
    current: number,
    context?: Record<string, unknown>
  ): MCPError {
    const message = `${resource} limit exceeded: ${current} > ${limit}`;
    return new MCPError(message, ERROR_TYPES.RESOURCE_LIMIT_EXCEEDED, {
      resource,
      limit,
      current,
      ...context,
    });
  }

  // Tool execution errors
  static toolExecutionFailed(
    toolName: string,
    category: string,
    originalError: Error,
    context?: Record<string, unknown>
  ): MCPError {
    const message = `${category} tool '${toolName}' failed: ${originalError.message}`;
    return new MCPError(message, ERROR_TYPES.EXTERNAL_SERVICE_ERROR, {
      toolName,
      category,
      originalError: originalError.message,
      originalStack: originalError.stack,
      ...context,
    });
  }

  // Generic error wrapper for enhanced context
  static wrapError(originalError: Error, additionalContext?: Record<string, unknown>): MCPError {
    if (originalError instanceof MCPError) {
      // Already an MCPError, just add context if provided
      return new MCPError(originalError.message, originalError.type, {
        ...originalError.context,
        ...additionalContext,
      });
    }

    // Wrap regular Error in MCPError
    return new MCPError(originalError.message, 'UNKNOWN_ERROR', {
      originalName: originalError.name,
      originalStack: originalError.stack,
      ...additionalContext,
    });
  }

  // Utility methods for error checking
  static isEntityNotFound(error: unknown): error is MCPError {
    return error instanceof MCPError && error.type === ERROR_TYPES.ENTITY_NOT_FOUND;
  }

  static isValidationError(error: unknown): error is MCPError {
    return error instanceof MCPError && error.type === ERROR_TYPES.VALIDATION_FAILED;
  }

  static isConfigurationError(error: unknown): error is MCPError {
    return error instanceof MCPError && error.type === ERROR_TYPES.CONFIGURATION_ERROR;
  }

  static isSecurityError(error: unknown): error is MCPError {
    return error instanceof MCPError && error.type === ERROR_TYPES.SECURITY_VIOLATION;
  }

  // Error formatting for different outputs
  static formatForLogging(error: MCPError): string {
    const context = error.context ? ` | Context: ${JSON.stringify(error.context)}` : '';
    return `[${error.type}] ${error.message} | Time: ${error.timestamp}${context}`;
  }

  static formatForApi(error: MCPError): Record<string, unknown> {
    return {
      error: error.message,
      type: error.type,
      timestamp: error.timestamp,
      context: error.context,
    };
  }

  static formatForUser(error: MCPError): string {
    // User-friendly messages for common error types
    switch (error.type) {
      case ERROR_TYPES.ENTITY_NOT_FOUND:
        return `The requested ${error.context?.entityType || 'item'} was not found.`;
      case ERROR_TYPES.VALIDATION_FAILED:
        return `Invalid input: ${error.message}`;
      case ERROR_TYPES.API_KEY_MISSING:
        return 'Service configuration error. Please check your setup.';
      case ERROR_TYPES.SECURITY_VIOLATION:
        return 'Request blocked for security reasons. Please rephrase your input.';
      default:
        return error.message;
    }
  }
}
