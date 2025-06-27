import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MemoryTools } from '../src/tools/memory/index';

// Mock Prisma service
jest.mock('../src/db/prisma-service', () => ({
  ConsciousnessPrismaService: {
    getInstance: jest.fn(() => ({
      storeMemory: jest.fn(),
      retrieveMemory: jest.fn(),
      searchMemories: jest.fn(),
      addEntity: jest.fn(),
      addRelationship: jest.fn(),
      getEntityRelationships: jest.fn(),
    })),
  },
}));

describe('MemoryTools', () => {
  let memoryTools: MemoryTools;

  beforeEach(() => {
    memoryTools = new MemoryTools();
  });

  describe('getTools', () => {
    it('should return all memory tools', () => {
      const tools = memoryTools.getTools();
      
      expect(tools).toHaveProperty('memory_store');
      expect(tools).toHaveProperty('memory_retrieve');
      expect(tools).toHaveProperty('memory_search');
      expect(tools).toHaveProperty('knowledge_graph_add');
      expect(tools).toHaveProperty('knowledge_graph_query');
    });

    it('should return valid tool schemas', () => {
      const tools = memoryTools.getTools();
      
      expect(tools.memory_store.name).toBe('memory_store');
      expect(tools.memory_store.description).toBeDefined();
      expect(tools.memory_store.inputSchema).toBeDefined();
      expect(tools.memory_store.inputSchema.type).toBe('object');
      expect(tools.memory_store.inputSchema.properties).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should throw error for unknown tool', async () => {
      await expect(memoryTools.execute('unknown_tool', {}))
        .rejects.toThrow('Unknown memory tool: unknown_tool');
    });
  });
}); 