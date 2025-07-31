/**
 * Shared response parsing utilities for GenAI tools
 * Single responsibility: Parse and extract structured data from AI responses
 */

/**
 * Extract JSON from AI response text
 */
export const extractJsonFromResponse = (response: string): unknown | null => {
  try {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn('Failed to extract JSON from AI response:', error);
    return null;
  }
};

/**
 * Parse AI response with fallback handling
 */
export const parseAIResponse = <T>(
  response: string,
  fallbackData: Partial<T>,
  requiredFields: (keyof T)[] = []
): T & { parsingSuccess: boolean; parsingError?: string } => {
  const extracted = extractJsonFromResponse(response);

  if (!extracted || typeof extracted !== 'object') {
    return {
      ...fallbackData,
      parsingSuccess: false,
      parsingError: 'No valid JSON found in response',
    } as T & { parsingSuccess: boolean; parsingError: string };
  }

  // Check for required fields
  const missingFields = requiredFields.filter(field => !(field in extracted));
  if (missingFields.length > 0) {
    return {
      ...fallbackData,
      ...extracted,
      parsingSuccess: false,
      parsingError: `Missing required fields: ${missingFields.join(', ')}`,
    } as T & { parsingSuccess: boolean; parsingError: string };
  }

  return {
    ...fallbackData,
    ...extracted,
    parsingSuccess: true,
  } as T & { parsingSuccess: boolean };
};

/**
 * Validate and normalize score values (0.0 to 1.0)
 */
export const validateScore = (value: unknown, fallback: number = 0.5): number => {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num) || num < 0 || num > 1) {
    return fallback;
  }
  return num;
};

/**
 * Validate and normalize confidence values (0.0 to 1.0)
 */
export const validateConfidence = (value: unknown, fallback: number = 0.5): number => {
  return validateScore(value, fallback);
};

/**
 * Clean and truncate text content
 */
export const cleanTextContent = (text: unknown, maxLength: number = 1000): string => {
  const str = String(text || '').trim();
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
};

/**
 * Parse array of strings from AI response
 */
export const parseStringArray = (value: unknown, fallback: string[] = []): string[] => {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }
  return fallback;
};








