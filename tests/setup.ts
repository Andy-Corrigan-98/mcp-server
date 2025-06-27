// Test setup and configuration
import { jest } from '@jest/globals';

// Mock environment variables for testing
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000); 