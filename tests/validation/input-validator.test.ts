import { describe, it, expect } from '@jest/globals';
import { InputValidator } from '../../src/validation/input-validator';
import { ImportanceLevel } from '@prisma/client';

describe('InputValidator', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace and limit length', () => {
      const input = '  hello world  ';
      const result = InputValidator.sanitizeString(input, 10);
      expect(result).toBe('hello worl');
    });

    it('should remove script tags for XSS prevention', () => {
      const input = 'Hello <script>alert("xss")</script> world';
      const result = InputValidator.sanitizeString(input);
      expect(result).toBe('Hello  world');
    });

    it('should remove javascript: URLs', () => {
      const input = 'Click javascript:alert("xss") here';
      const result = InputValidator.sanitizeString(input);
      expect(result).toBe('Click alert("xss") here');
    });

    it('should throw error for non-string input', () => {
      expect(() => {
        InputValidator.sanitizeString(123 as any);
      }).toThrow('Input must be a string');
    });

    it('should handle empty strings', () => {
      const result = InputValidator.sanitizeString('');
      expect(result).toBe('');
    });

    it('should use default max length when not specified', () => {
      const longString = 'a'.repeat(2000);
      const result = InputValidator.sanitizeString(longString);
      expect(result.length).toBe(1000); // Default max length
    });
  });

  describe('validateKey', () => {
    it('should accept valid alphanumeric keys', () => {
      const validKeys = ['test123', 'my-key', 'user_data', 'ABC-123_test'];
      
      validKeys.forEach(key => {
        expect(InputValidator.validateKey(key)).toBe(key);
      });
    });

    it('should reject keys with invalid characters', () => {
      const invalidKeys = ['test@key', 'key with spaces', 'key/path', 'key.ext'];
      
      invalidKeys.forEach(key => {
        expect(() => {
          InputValidator.validateKey(key);
        }).toThrow('Memory key must contain only alphanumeric characters, dashes, and underscores');
      });
    });

    it('should sanitize key before validation', () => {
      const result = InputValidator.validateKey('  valid-key  ');
      expect(result).toBe('valid-key');
    });

    it('should reject empty keys after sanitization', () => {
      expect(() => {
        InputValidator.validateKey('   ');
      }).toThrow('Memory key must contain only alphanumeric characters, dashes, and underscores');
    });
  });

  describe('validateImportanceLevel', () => {
    it('should accept valid importance levels', () => {
      const validLevels: ImportanceLevel[] = ['low', 'medium', 'high', 'critical'];
      
      validLevels.forEach(level => {
        expect(InputValidator.validateImportanceLevel(level)).toBe(level);
      });
    });

    it('should reject invalid importance levels', () => {
      const invalidLevels = ['urgent', 'normal', 'extreme', ''];
      
      invalidLevels.forEach(level => {
        expect(() => {
          InputValidator.validateImportanceLevel(level);
        }).toThrow('Invalid importance level. Must be one of: low, medium, high, critical');
      });
    });

    it('should be case sensitive', () => {
      expect(() => {
        InputValidator.validateImportanceLevel('LOW');
      }).toThrow('Invalid importance level');
      
      expect(() => {
        InputValidator.validateImportanceLevel('Medium');
      }).toThrow('Invalid importance level');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should remove SQL-like patterns', () => {
      const query = 'search SELECT * FROM users';
      const result = InputValidator.sanitizeSearchQuery(query);
      expect(result).toBe('search  * FROM users');
    });

    it('should remove quotes and dangerous characters', () => {
      const query = `search "term" 'other'; DROP TABLE`;
      const result = InputValidator.sanitizeSearchQuery(query);
      expect(result).toBe('search term other  TABLE');
    });

    it('should limit query length', () => {
      const longQuery = 'search '.repeat(100);
      const result = InputValidator.sanitizeSearchQuery(longQuery);
      expect(result.length).toBe(500); // Default max length for search
    });

    it('should handle case insensitive SQL keywords', () => {
      const query = 'search select Insert update DELETE';
      const result = InputValidator.sanitizeSearchQuery(query);
      expect(result).toBe('search    ');
    });

    it('should preserve normal search terms', () => {
      const query = 'normal search terms without dangerous content';
      const result = InputValidator.sanitizeSearchQuery(query);
      expect(result).toBe(query);
    });
  });

  describe('validateEntityName', () => {
    it('should accept valid entity names', () => {
      const validNames = ['User Entity', 'Product-123', 'data_point', 'System Component'];
      
      validNames.forEach(name => {
        expect(InputValidator.validateEntityName(name)).toBe(name);
      });
    });

    it('should reject empty entity names', () => {
      expect(() => {
        InputValidator.validateEntityName('');
      }).toThrow('Entity name cannot be empty');
      
      expect(() => {
        InputValidator.validateEntityName('   ');
      }).toThrow('Entity name cannot be empty');
    });

    it('should sanitize entity names', () => {
      const name = '  Valid Entity Name  ';
      const result = InputValidator.validateEntityName(name);
      expect(result).toBe('Valid Entity Name');
    });

    it('should remove XSS attempts from entity names', () => {
      const name = 'Entity<script>alert("xss")</script>Name';
      const result = InputValidator.validateEntityName(name);
      expect(result).toBe('EntityName');
    });

    it('should limit entity name length', () => {
      const longName = 'a'.repeat(300);
      const result = InputValidator.validateEntityName(longName);
      expect(result.length).toBe(255); // Should be limited to 255
    });
  });

  describe('edge cases and security', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => {
        InputValidator.sanitizeString(null as any);
      }).toThrow('Input must be a string');
      
      expect(() => {
        InputValidator.sanitizeString(undefined as any);
      }).toThrow('Input must be a string');
    });

    it('should handle complex XSS payloads', () => {
      const xssPayload = '<img src="x" onerror="alert(1)"><script>evil()</script>';
      const result = InputValidator.sanitizeString(xssPayload);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('javascript:');
    });

    it('should handle Unicode and special characters appropriately', () => {
      const unicode = 'Test 🚀 émojis and açcénts';
      const result = InputValidator.sanitizeString(unicode);
      expect(result).toBe(unicode); // Should preserve Unicode
    });

    it('should handle very long inputs without performance issues', () => {
      const veryLongString = 'a'.repeat(10000);
      const start = Date.now();
      const result = InputValidator.sanitizeString(veryLongString, 100);
      const end = Date.now();
      
      expect(result.length).toBe(100);
      expect(end - start).toBeLessThan(100); // Should complete quickly
    });
  });
}); 