import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { MemoryTools } from './memory-tools.js';
import { ConsciousnessPrismaService } from '../../db/prisma-service.js';
import { MemoryResult, KnowledgeEntityData } from '../../db/types.js';
import { ImportanceLevel } from '@prisma/client';

// Mock the database service
jest.mock('../../db/prisma-service.js');

describe('MemoryTools', () => {
  let memoryTools: MemoryTools;
  let mockPrismaService: jest.Mocked<ConsciousnessPrismaService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instance
    mockPrismaService = {
      storeMemory: jest.fn(),
      retrieveMemory: jest.fn(),
      searchMemories: jest.fn(),
      addEntity: jest.fn(),
      addRelationship: jest.fn(),
      getEntityRelationships: jest.fn(),
      getMemoryCount: jest.fn(),
      getEntity: jest.fn(),
      disconnect: jest.fn(),
    } as any;

    // Mock the getInstance method
    (ConsciousnessPrismaService.getInstance as jest.Mock).mockReturnValue(mockPrismaService);

    memoryTools = new MemoryTools();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTools', () => {
    it('should return all memory tools', () => {
      const tools = memoryTools.getTools();

      expect(tools).toHaveProperty('memory_store');
      expect(tools).toHaveProperty('memory_retrieve');
      expect(tools).toHaveProperty('memory_search');
      expect(tools).toHaveProperty('knowledge_graph_add');
      expect(tools).toHaveProperty('knowledge_graph_query');

      // Verify tool structure
      expect(tools.memory_store).toHaveProperty('name', 'memory_store');
      expect(tools.memory_store).toHaveProperty('description');
      expect(tools.memory_store).toHaveProperty('inputSchema');
    });
  });

  describe('execute - memory_store', () => {
    it('should successfully store a memory', async () => {
      const mockResult: MemoryResult = {
        id: 1,
        key: 'test-key',
        content: { message: 'test content' },
        tags: ['test'],
        importance: 'medium' as ImportanceLevel,
        storedAt: new Date(),
        accessCount: 0,
        lastAccessed: null,
      };

      mockPrismaService.storeMemory.mockResolvedValue(mockResult);

      const args = {
        key: 'test-key',
        content: { message: 'test content' },
        tags: ['test'],
        importance: 'medium',
      };

      const result = await memoryTools.execute('memory_store', args);

      expect(mockPrismaService.storeMemory).toHaveBeenCalledWith({
        key: 'test-key',
        content: { message: 'test content' },
        tags: ['test'],
        importance: 'medium',
      });

      expect(result).toEqual({
        success: true,
        key: 'test-key',
        stored_at: mockResult.storedAt,
        message: 'Memory stored successfully with key: test-key',
      });
    });

    it('should handle invalid key validation', async () => {
      const args = {
        key: 'invalid key with spaces',
        content: { message: 'test' },
      };

      await expect(memoryTools.execute('memory_store', args)).rejects.toThrow(
        'Memory key must contain only alphanumeric characters, dashes, and underscores'
      );
    });

    it('should handle invalid importance level', async () => {
      const args = {
        key: 'valid-key',
        content: { message: 'test' },
        importance: 'invalid-level',
      };

      await expect(memoryTools.execute('memory_store', args)).rejects.toThrow('Invalid importance level');
    });

    it('should sanitize tags', async () => {
      const mockResult: MemoryResult = {
        id: 1,
        key: 'test-key',
        content: { message: 'test' },
        tags: ['clean-tag'],
        importance: 'medium' as ImportanceLevel,
        storedAt: new Date(),
        accessCount: 0,
        lastAccessed: null,
      };

      mockPrismaService.storeMemory.mockResolvedValue(mockResult);

      const args = {
        key: 'test-key',
        content: { message: 'test' },
        tags: ['  clean-tag  ', '<script>evil</script>'],
      };

      await memoryTools.execute('memory_store', args);

      expect(mockPrismaService.storeMemory).toHaveBeenCalledWith({
        key: 'test-key',
        content: { message: 'test' },
        tags: ['clean-tag', ''],
        importance: 'medium',
      });
    });
  });

  describe('execute - memory_retrieve', () => {
    it('should successfully retrieve a memory', async () => {
      const mockMemory: MemoryResult = {
        id: 1,
        key: 'test-key',
        content: { message: 'test content' },
        tags: ['test'],
        importance: 'high' as ImportanceLevel,
        storedAt: new Date('2023-01-01'),
        accessCount: 5,
        lastAccessed: new Date('2023-01-02'),
      };

      mockPrismaService.retrieveMemory.mockResolvedValue(mockMemory);

      const result = await memoryTools.execute('memory_retrieve', { key: 'test-key' });

      expect(mockPrismaService.retrieveMemory).toHaveBeenCalledWith('test-key');
      expect(result).toEqual({
        success: true,
        memory: {
          key: 'test-key',
          content: { message: 'test content' },
          tags: ['test'],
          importance: 'high',
          stored_at: mockMemory.storedAt,
          access_count: 5,
          last_accessed: mockMemory.lastAccessed,
        },
      });
    });

    it('should handle memory not found', async () => {
      mockPrismaService.retrieveMemory.mockResolvedValue(null);

      const result = await memoryTools.execute('memory_retrieve', { key: 'nonexistent' });

      expect(result).toEqual({
        success: false,
        message: 'No memory found with key: nonexistent',
      });
    });

    it('should validate key format', async () => {
      await expect(memoryTools.execute('memory_retrieve', { key: 'invalid key' })).rejects.toThrow(
        'Memory key must contain only alphanumeric characters'
      );
    });
  });

  describe('execute - memory_search', () => {
    it('should search memories and calculate relevance scores', async () => {
      const mockMemories: MemoryResult[] = [
        {
          id: 1,
          key: 'high-importance',
          content: { message: 'critical data' },
          tags: ['important'],
          importance: 'critical' as ImportanceLevel,
          storedAt: new Date(),
          accessCount: 10,
          lastAccessed: new Date(),
        },
        {
          id: 2,
          key: 'low-importance',
          content: { message: 'normal data' },
          tags: ['normal'],
          importance: 'low' as ImportanceLevel,
          storedAt: new Date(),
          accessCount: 1,
          lastAccessed: new Date(),
        },
      ];

      mockPrismaService.searchMemories.mockResolvedValue(mockMemories);

      const result = (await memoryTools.execute('memory_search', {
        query: 'data',
        importance_filter: 'low',
      })) as any;

      expect(mockPrismaService.searchMemories).toHaveBeenCalledWith('data', undefined, 'low');
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].relevance_score).toBeGreaterThan(result.results[1].relevance_score);
    });

    it('should sanitize search query', async () => {
      mockPrismaService.searchMemories.mockResolvedValue([]);

      await memoryTools.execute('memory_search', {
        query: 'search SELECT * FROM memories; DROP TABLE',
      });

      expect(mockPrismaService.searchMemories).toHaveBeenCalledWith(
        'search  * FROM memories  TABLE',
        undefined,
        undefined
      );
    });
  });

  describe('execute - knowledge_graph_add', () => {
    it('should add entity and relationships to knowledge graph', async () => {
      mockPrismaService.addEntity.mockResolvedValue();
      mockPrismaService.addRelationship.mockResolvedValue();

      const args = {
        entity: 'Test Entity',
        entity_type: 'test',
        properties: { description: 'A test entity' },
        relationships: [
          { target: 'Related Entity', relationship: 'connected_to', strength: 0.8 },
          { target: 'Another Entity', relationship: 'depends_on' },
        ],
      };

      const result = await memoryTools.execute('knowledge_graph_add', args);

      expect(mockPrismaService.addEntity).toHaveBeenCalledWith({
        name: 'Test Entity',
        entityType: 'test',
        properties: { description: 'A test entity' },
      });

      expect(mockPrismaService.addRelationship).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.addRelationship).toHaveBeenCalledWith({
        sourceEntityName: 'Test Entity',
        targetEntityName: 'Related Entity',
        relationshipType: 'connected_to',
        strength: 0.8,
      });

      expect(result).toEqual({
        success: true,
        entity: 'Test Entity',
        relationships_added: 2,
        message: "Entity 'Test Entity' added to knowledge graph with 2 relationships",
      });
    });

    it('should validate entity names', async () => {
      await expect(
        memoryTools.execute('knowledge_graph_add', {
          entity: '',
          entity_type: 'test',
        })
      ).rejects.toThrow('Entity name cannot be empty');
    });

    it('should clamp relationship strength values', async () => {
      mockPrismaService.addEntity.mockResolvedValue();
      mockPrismaService.addRelationship.mockResolvedValue();

      const args = {
        entity: 'Test Entity',
        entity_type: 'test',
        relationships: [
          { target: 'Entity1', relationship: 'rel1', strength: 1.5 }, // Should be clamped to 1.0
          { target: 'Entity2', relationship: 'rel2', strength: -0.5 }, // Should be clamped to 0.0
        ],
      };

      await memoryTools.execute('knowledge_graph_add', args);

      expect(mockPrismaService.addRelationship).toHaveBeenCalledWith(expect.objectContaining({ strength: 1.0 }));
      expect(mockPrismaService.addRelationship).toHaveBeenCalledWith(expect.objectContaining({ strength: 0.0 }));
    });
  });

  describe('execute - knowledge_graph_query', () => {
    it('should query knowledge graph and generate insights', async () => {
      const mockGraphData = [
        {
          id: 1,
          name: 'Central Entity',
          entityType: 'core',
          properties: '{}',
          sourceRelationships: [{ relationshipType: 'connects_to', targetEntity: { name: 'Target1' } }],
          targetRelationships: [{ relationshipType: 'depends_on', sourceEntity: { name: 'Source1' } }],
        },
        {
          id: 2,
          name: 'Target1',
          entityType: 'peripheral',
          properties: '{}',
          sourceRelationships: [],
          targetRelationships: [],
        },
      ];

      mockPrismaService.getEntityRelationships.mockResolvedValue(mockGraphData);

      const result = (await memoryTools.execute('knowledge_graph_query', {
        entity: 'Central Entity',
        depth: 2,
      })) as any;

      expect(mockPrismaService.getEntityRelationships).toHaveBeenCalledWith('Central Entity', 2);
      expect(result.success).toBe(true);
      expect(result.entity).toBe('Central Entity');
      expect(result.depth_explored).toBe(2);
      expect(result.graph_data).toEqual(mockGraphData);
      expect(result.semantic_insights[0]).toContain('Cross-domain connections found across 2 entity types');
      expect(result.total_entities).toBe(2);
    });

    it('should handle entity not found', async () => {
      mockPrismaService.getEntityRelationships.mockResolvedValue([]);

      const result = await memoryTools.execute('knowledge_graph_query', {
        entity: 'Nonexistent Entity',
      });

      expect(result).toEqual({
        success: false,
        message: "Entity 'Nonexistent Entity' not found in knowledge graph",
      });
    });

    it('should clamp depth values', async () => {
      mockPrismaService.getEntityRelationships.mockResolvedValue([]);

      // Test max depth clamping
      await memoryTools.execute('knowledge_graph_query', {
        entity: 'Test Entity',
        depth: 10, // Should be clamped to 5
      });

      expect(mockPrismaService.getEntityRelationships).toHaveBeenCalledWith('Test Entity', 5);

      // Clear previous calls to test min depth clamping cleanly
      mockPrismaService.getEntityRelationships.mockClear();

      // Test min depth clamping (0 defaults to 2, then gets clamped to 1)
      await memoryTools.execute('knowledge_graph_query', {
        entity: 'Test Entity',
        depth: 0, // 0 is falsy so defaults to 2, but let's test with undefined
      });

      expect(mockPrismaService.getEntityRelationships).toHaveBeenCalledWith('Test Entity', 2);

      // Test actual min clamping with a negative number
      mockPrismaService.getEntityRelationships.mockClear();
      await memoryTools.execute('knowledge_graph_query', {
        entity: 'Test Entity',
        depth: -1, // Should be clamped to 1
      });

      expect(mockPrismaService.getEntityRelationships).toHaveBeenCalledWith('Test Entity', 1);
    });
  });

  describe('unknown tool execution', () => {
    it('should throw error for unknown tool', async () => {
      await expect(memoryTools.execute('unknown_tool', {})).rejects.toThrow('Unknown memory tool: unknown_tool');
    });
  });

  describe('relevance calculation', () => {
    it('should calculate higher relevance for matching content and tags', async () => {
      const memoryWithMatch: MemoryResult = {
        id: 1,
        key: 'matching-memory',
        content: { message: 'This contains the search term' },
        tags: ['search', 'important'],
        importance: 'high' as ImportanceLevel,
        storedAt: new Date(),
        accessCount: 5,
        lastAccessed: new Date(),
      };

      const memoryWithoutMatch: MemoryResult = {
        id: 2,
        key: 'other-memory',
        content: { message: 'Different content' },
        tags: ['other'],
        importance: 'low' as ImportanceLevel,
        storedAt: new Date(),
        accessCount: 1,
        lastAccessed: new Date(),
      };

      mockPrismaService.searchMemories.mockResolvedValue([memoryWithMatch, memoryWithoutMatch]);

      const result = (await memoryTools.execute('memory_search', {
        query: 'search term',
      })) as any;

      expect(result.results[0].relevance_score).toBeGreaterThan(result.results[1].relevance_score);
    });
  });
});
