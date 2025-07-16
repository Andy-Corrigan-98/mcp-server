import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { SocialTools } from './social-tools.js';
import { ConsciousnessPrismaService } from '../../db/index.js';
import { SocialContextResult } from './types.js';

// Mock the database service at the module level
jest.mock('../../db/index.js', () => ({
  ConsciousnessPrismaService: {
    getInstance: jest.fn(),
  },
}));

// Mock the configuration service
jest.mock('../../db/configuration-service.js');

describe('SocialTools', () => {
  let socialTools: SocialTools;
  let mockPrismaService: jest.Mocked<ConsciousnessPrismaService>;

  beforeEach(() => {
    // Clear all mocks and reset modules
    jest.clearAllMocks();
    jest.resetAllMocks();

    // Create fresh mock instance with comprehensive methods
    mockPrismaService = {
      execute: jest.fn(),
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

    // Ensure the mock is properly applied before creating SocialTools instance
    const getInstanceMock = ConsciousnessPrismaService.getInstance as jest.Mock;
    getInstanceMock.mockClear();
    getInstanceMock.mockReturnValue(mockPrismaService);

    // Create new instance for each test - this should now use the mocked service
    socialTools = new SocialTools();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTools', () => {
    it('should return all social consciousness tools including memory integration', () => {
      const tools = socialTools.getTools();

      // Original social tools
      expect(tools).toHaveProperty('social_entity_create');
      expect(tools).toHaveProperty('social_entity_update');
      expect(tools).toHaveProperty('social_entity_get');
      expect(tools).toHaveProperty('social_relationship_create');
      expect(tools).toHaveProperty('social_relationship_update');
      expect(tools).toHaveProperty('social_interaction_record');
      expect(tools).toHaveProperty('social_interaction_search');
      expect(tools).toHaveProperty('emotional_state_record');
      expect(tools).toHaveProperty('social_learning_record');
      expect(tools).toHaveProperty('social_context_prepare');
      expect(tools).toHaveProperty('social_pattern_analyze');

      // NEW: Memory-social integration tools
      expect(tools).toHaveProperty('memory_social_link_create');
      expect(tools).toHaveProperty('memory_social_search');
      expect(tools).toHaveProperty('social_memory_context');

      // Verify tool structure
      expect(tools.social_entity_create).toHaveProperty('name', 'social_entity_create');
      expect(tools.social_entity_create).toHaveProperty('description');
      expect(tools.social_entity_create).toHaveProperty('inputSchema');

      // Verify memory integration tool structure
      expect(tools.memory_social_link_create).toHaveProperty('name', 'memory_social_link_create');
      expect(tools.memory_social_link_create.inputSchema.properties).toHaveProperty('memory_key');
      expect(tools.memory_social_link_create.inputSchema.properties).toHaveProperty('entity_name');
      expect(tools.memory_social_link_create.inputSchema.properties).toHaveProperty('link_type');
    });

    it('should include enhanced social_entity_get with shared memories option', () => {
      const tools = socialTools.getTools();
      const getSocialEntity = tools.social_entity_get;

      expect(getSocialEntity.inputSchema.properties).toHaveProperty('include_shared_memories');
      expect((getSocialEntity.inputSchema.properties as any)?.include_shared_memories?.default).toBe(true);
    });

    it('should include enhanced social_interaction_record with related memories', () => {
      const tools = socialTools.getTools();
      const recordInteraction = tools.social_interaction_record;

      expect(recordInteraction.inputSchema.properties).toHaveProperty('related_memories');
      expect((recordInteraction.inputSchema.properties as any)?.related_memories?.type).toBe('array');
    });
  });

  describe('social_entity_create', () => {
    it('should successfully create a social entity', async () => {
      const mockEntity = {
        id: 1,
        name: 'john_doe',
        displayName: 'John Doe',
        entityType: 'person',
        description: 'A close friend and collaborator',
        createdAt: new Date(),
      };

      // Mock database calls in order:
      // 1. getSocialEntityByName() call to check if entity exists
      mockPrismaService.execute.mockResolvedValueOnce(null); // Check existing - should return null
      // 2. Create new entity call
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity); // Create new

      const args = {
        name: 'john_doe',
        entity_type: 'person',
        display_name: 'John Doe',
        description: 'A close friend and collaborator',
      };

      const result = await socialTools.execute('social_entity_create', args);

      expect(result).toEqual({
        success: true,
        entity: 'john_doe',
        entity_type: 'person',
        display_name: 'John Doe',
        entity_id: 1,
        message: "Social entity 'John Doe' created successfully",
      });
    });

    it('should prevent duplicate entity creation', async () => {
      const existingEntity = { id: 1, name: 'john_doe' };
      mockPrismaService.execute.mockResolvedValueOnce(existingEntity);

      const args = {
        name: 'john_doe',
        entity_type: 'person',
      };

      await expect(socialTools.execute('social_entity_create', args)).rejects.toThrow(
        "Social entity 'john_doe' already exists"
      );
    });
  });

  describe('memory_social_link_create', () => {
    it('should successfully create a memory-social link', async () => {
      const mockMemory = {
        id: 1,
        key: 'project_discussion',
        content: { topic: 'AI consciousness project' },
      };

      const mockEntity = {
        id: 2,
        name: 'alice',
        displayName: 'Alice',
      };

      const mockLink = {
        id: 1,
        memoryId: 1,
        socialEntityId: 2,
        relationshipType: 'co_created',
        strength: 0.9,
        context: 'Worked together on AI project',
        createdAt: new Date(),
      };

      // Mock database calls in the exact order they occur:
      // 1. Find memory by key in createMemorySocialLink
      mockPrismaService.execute.mockResolvedValueOnce(mockMemory);
      // 2. Find entity by name via getSocialEntityByName
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      // 3. Create the memory-social link
      mockPrismaService.execute.mockResolvedValueOnce(mockLink);

      const args = {
        memory_key: 'project_discussion',
        entity_name: 'alice',
        link_type: 'co_created',
        strength: 0.9,
        context: 'Worked together on AI project',
      };

      const result = await socialTools.execute('memory_social_link_create', args);

      expect(result).toEqual({
        success: true,
        link: {
          id: 1,
          memoryKey: 'project_discussion',
          entityName: 'alice',
          linkType: 'co_created',
          strength: 0.9,
          interactionId: undefined,
          context: 'Worked together on AI project',
        },
        message: "Memory 'project_discussion' successfully linked to 'alice' as 'co_created'",
      });
    });

    it('should handle memory not found error', async () => {
      mockPrismaService.execute.mockResolvedValueOnce(null); // Memory not found

      const args = {
        memory_key: 'nonexistent_memory',
        entity_name: 'alice',
        link_type: 'discussed_with',
      };

      const result = await socialTools.execute('memory_social_link_create', args);

      expect(result).toEqual({
        success: false,
        error: "Memory with key 'nonexistent_memory' not found",
        message: 'Failed to create memory-social link',
      });
    });

    it('should handle entity not found error', async () => {
      const mockMemory = { id: 1, key: 'test_memory' };

      // Mock database calls in order:
      // 1. Find memory (should succeed)
      mockPrismaService.execute.mockResolvedValueOnce(mockMemory);
      // 2. Find entity via getSocialEntityByName (should return null - entity not found)
      mockPrismaService.execute.mockResolvedValueOnce(null);

      const args = {
        memory_key: 'test_memory',
        entity_name: 'nonexistent_entity',
        link_type: 'discussed_with',
      };

      const result = await socialTools.execute('memory_social_link_create', args);

      expect(result).toEqual({
        success: false,
        error: "Social entity 'nonexistent_entity' not found",
        message: 'Failed to create memory-social link',
      });
    });

    it('should validate interaction belongs to entity', async () => {
      const mockMemory = { id: 1, key: 'test_memory' };
      const mockEntity = { id: 2, name: 'alice' };
      const mockInteraction = { id: 10, entityId: 999 }; // Wrong entity ID (doesn't match entity.id)

      // Mock database calls in order:
      // 1. Find memory (should succeed)
      mockPrismaService.execute.mockResolvedValueOnce(mockMemory);
      // 2. Find entity via getSocialEntityByName (should succeed)
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      // 3. Find interaction (should succeed but with wrong entityId)
      mockPrismaService.execute.mockResolvedValueOnce(mockInteraction);

      const args = {
        memory_key: 'test_memory',
        entity_name: 'alice',
        link_type: 'discussed_with',
        interaction_id: 10,
      };

      const result = await socialTools.execute('memory_social_link_create', args);

      expect(result).toEqual({
        success: false,
        error: 'Interaction 10 not found or does not belong to entity alice',
        message: 'Failed to create memory-social link',
      });
    });
  });

  describe('memory_social_search', () => {
    it('should search memories connected to social entities', async () => {
      const mockEntity = { id: 2, name: 'alice' };
      const mockLinks = [
        {
          id: 1,
          relationshipType: 'co_created',
          strength: 0.9,
          context: 'AI project work',
          createdAt: new Date(),
          memory: {
            key: 'project_discussion',
            content: { topic: 'AI consciousness' },
            tags: '["ai", "consciousness"]',
            importance: 'high',
            storedAt: new Date(),
          },
          socialEntity: {
            name: 'alice',
            displayName: 'Alice',
          },
          interaction: {
            id: 5,
            interactionType: 'collaboration',
            createdAt: new Date(),
            summary: 'Worked on AI project together',
            quality: 0.9,
          },
        },
      ];

      // Mock database calls in order for searchMemorySocialLinks:
      // 1. getSocialEntityByName to find the entity by name
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      // 2. Find memory links with the search criteria
      mockPrismaService.execute.mockResolvedValueOnce(mockLinks);

      const args = {
        entity_name: 'alice',
        link_types: ['co_created', 'learned_from'],
        min_strength: 0.8,
        limit: 10,
      };

      const result = (await socialTools.execute('memory_social_search', args)) as any;

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(result.results[0].memoryKey).toBe('project_discussion');
    });

    it('should filter by memory keywords', async () => {
      const mockEntity = { id: 2, name: 'alice' };
      const mockLinks = [
        {
          relationshipType: 'discussed_with',
          strength: 0.7,
          memory: {
            key: 'ai_discussion',
            content: { topic: 'artificial intelligence ethics' },
            tags: '["ai", "ethics"]',
          },
          socialEntity: { name: 'alice' },
          interaction: null,
        },
        {
          relationshipType: 'shared_experience',
          strength: 0.6,
          memory: {
            key: 'cooking_session',
            content: { topic: 'making pasta together' },
            tags: '["cooking", "food"]',
          },
          socialEntity: { name: 'alice' },
          interaction: null,
        },
      ];

      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      mockPrismaService.execute.mockResolvedValueOnce(mockLinks);

      const args = {
        entity_name: 'alice',
        memory_keywords: ['artificial intelligence'],
      };

      const result = (await socialTools.execute('memory_social_search', args)) as any;

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(result.results[0].memoryKey).toBe('ai_discussion');
    });
  });

  describe('social_memory_context', () => {
    it('should provide comprehensive shared memory context', async () => {
      const mockEntity = { id: 2, name: 'alice', displayName: 'Alice', entityType: 'person' };
      const mockLinks = [
        {
          id: 1,
          relationshipType: 'co_created',
          strength: 0.9,
          context: 'Built AI project together',
          createdAt: new Date('2023-01-15'),
          memory: {
            key: 'ai_project_start',
            content: { description: 'Started consciousness project' },
            tags: '["ai", "consciousness"]',
            importance: 'high',
            storedAt: new Date('2023-01-15'),
          },
          interaction: {
            id: 1,
            interactionType: 'collaboration',
            createdAt: new Date('2023-01-15'),
            summary: 'Project kickoff',
          },
        },
        {
          id: 2,
          relationshipType: 'learned_from',
          strength: 0.8,
          context: 'Learned ML techniques',
          createdAt: new Date('2023-02-01'),
          memory: {
            key: 'ml_techniques',
            content: { description: 'Advanced ML patterns' },
            tags: '["ml", "learning"]',
            importance: 'medium',
            storedAt: new Date('2023-02-01'),
          },
          interaction: null,
        },
      ];

      // Mock database calls in order for getSocialMemoryContext:
      // 1. getSocialEntityByName to find the entity
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      // 2. Get memory links for the entity
      mockPrismaService.execute.mockResolvedValueOnce(mockLinks);

      const args = {
        entity_name: 'alice',
        time_period: 'all_time',
      };

      const result = (await socialTools.execute('social_memory_context', args)) as any;

      expect(result.success).toBe(true);
      expect(result.entity.name).toBe('alice');
      expect(result.summary.totalSharedMemories).toBe(2);
      expect(result.summary.timePeriod).toBe('all_time');
    });

    it('should filter by time period', async () => {
      const mockEntity = { id: 2, name: 'alice', displayName: 'Alice', entityType: 'person' };

      // Mock recent links within the week
      const recentDate = new Date();
      const mockLinks = [
        {
          id: 1,
          relationshipType: 'discussed_with',
          strength: 0.7,
          createdAt: recentDate,
          memory: {
            key: 'recent_chat',
            content: { topic: 'Recent conversation' },
            tags: '["casual", "chat"]',
            importance: 'medium',
            storedAt: recentDate,
          },
          interaction: null,
        },
      ];

      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      mockPrismaService.execute.mockResolvedValueOnce(mockLinks);

      const args = {
        entity_name: 'alice',
        time_period: 'week',
      };

      const result = (await socialTools.execute('social_memory_context', args)) as any;

      expect(result.success).toBe(true);
      expect(result.summary.timePeriod).toBe('week');
      expect(result.summary.totalSharedMemories).toBe(1);
    });
  });

  describe('Enhanced social_entity_get with shared memories', () => {
    it('should include shared memories and insights when requested', async () => {
      const mockEntity = {
        id: 1,
        name: 'alice',
        displayName: 'Alice',
        entityType: 'person',
        description: 'AI researcher',
        lastInteraction: new Date(),
      };

      const mockMemoryLinks = [
        {
          relationshipType: 'co_created',
          strength: 0.9,
          memory: {
            key: 'project_alpha',
            content: { description: 'AI consciousness project' },
            tags: '["ai", "consciousness"]',
            importance: 'high',
            storedAt: new Date(),
          },
          interaction: null,
        },
      ];

      // Mock database calls in order for getSocialEntity method:
      // 1. getSocialEntityByName call to find the entity
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      // 2. Get relationship data (include_relationship = true by default)
      mockPrismaService.execute.mockResolvedValueOnce(null);
      // 3. Get recent interactions (include_interactions = true by default)
      mockPrismaService.execute.mockResolvedValueOnce([]);
      // 4. Get social learnings
      mockPrismaService.execute.mockResolvedValueOnce([]);
      // 5. Get shared memories from getSharedMemoriesForEntity (include_shared_memories = true)
      mockPrismaService.execute.mockResolvedValueOnce(mockMemoryLinks);

      const args = {
        name: 'alice',
        include_shared_memories: true,
      };

      const result = (await socialTools.execute('social_entity_get', args)) as SocialContextResult;

      expect(result.entity.name).toBe('alice');
      expect(result.sharedMemories).toHaveLength(1);
      expect(result.sharedMemories[0].key).toBe('project_alpha');
      expect(result.sharedMemories[0].linkType).toBe('co_created');
    });

    it('should exclude shared memories when requested', async () => {
      const mockEntity = {
        id: 1,
        name: 'alice',
        displayName: 'Alice',
        entityType: 'person',
      };

      // Mock database calls in order for getSocialEntity (exclude shared memories):
      // 1. getSocialEntityByName call to find the entity
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      // 2. Get relationship data (include_relationship = true by default)
      mockPrismaService.execute.mockResolvedValueOnce(null);
      // 3. Get recent interactions (include_interactions = true by default)
      mockPrismaService.execute.mockResolvedValueOnce([]);
      // 4. Get social learnings
      mockPrismaService.execute.mockResolvedValueOnce([]);
      // No shared memories call since include_shared_memories = false

      const args = {
        name: 'alice',
        include_shared_memories: false,
      };

      const result = (await socialTools.execute('social_entity_get', args)) as SocialContextResult;

      expect(result.sharedMemories).toHaveLength(0);
      expect(result.memoryInsights).toHaveLength(0);
    });
  });

  describe('Enhanced social_interaction_record with memory linking', () => {
    it('should automatically link related memories during interaction recording', async () => {
      const mockEntity = {
        id: 1,
        name: 'alice',
        displayName: 'Alice',
      };

      const mockInteraction = {
        id: 10,
        interactionType: 'collaboration',
        createdAt: new Date(),
      };

      // Mock database calls in order for recordInteraction:
      // 1. getSocialEntityByName to find the entity
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      // 2. Create the interaction
      mockPrismaService.execute.mockResolvedValueOnce(mockInteraction);
      // 3. Update entity's last interaction time
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);

      // Mock createMemorySocialLink calls (internal method calls)
      // This would be called for each related memory

      const args = {
        entity_name: 'alice',
        interaction_type: 'collaboration',
        summary: 'Worked on AI project features',
        related_memories: ['project_discussion', 'feature_planning'],
        quality: 0.9,
      };

      const result = (await socialTools.execute('social_interaction_record', args)) as any;

      expect(result.success).toBe(true);
      expect(result.interaction_id).toBe(10);
      expect(result.entity).toBe('alice');
    });

    it('should handle memory linking failures gracefully', async () => {
      const mockEntity = { id: 1, name: 'alice', displayName: 'Alice' };
      const mockInteraction = { id: 10, interactionType: 'casual_chat' };

      // Mock database calls in order for recordInteraction:
      // 1. getSocialEntityByName to find the entity
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      // 2. Create the interaction
      mockPrismaService.execute.mockResolvedValueOnce(mockInteraction);
      // 3. Update entity's last interaction time
      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);

      // Mock createMemorySocialLink internal calls
      mockPrismaService.execute.mockResolvedValueOnce(null); // Memory not found (createMemorySocialLink fails here)
      // No need to mock further calls since createMemorySocialLink should fail at memory lookup

      const args = {
        entity_name: 'alice',
        interaction_type: 'casual_chat',
        related_memories: ['nonexistent_memory'],
      };

      const result = (await socialTools.execute('social_interaction_record', args)) as any;

      expect(result.success).toBe(true);
      expect(result.memories_linked).toBe(0); // Failed to link but interaction succeeded
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock the first call (getSocialEntityByName) to fail with database error
      mockPrismaService.execute.mockRejectedValueOnce(new Error('Database connection failed'));

      const args = {
        name: 'test_entity',
        entity_type: 'person',
      };

      await expect(socialTools.execute('social_entity_create', args)).rejects.toThrow('Database connection failed');
    });

    it('should handle unknown tool execution', async () => {
      await expect(socialTools.execute('unknown_tool', {})).rejects.toThrow('Unknown social tool: unknown_tool');
    });
  });

  describe('Memory insights generation', () => {
    it('should generate meaningful insights from memory patterns', async () => {
      const mockEntity = { id: 1, name: 'alice', displayName: 'Alice', entityType: 'person' };
      const mockLinks = [
        {
          id: 1,
          relationshipType: 'co_created',
          strength: 0.9,
          createdAt: new Date('2023-01-15'),
          memory: {
            key: 'project1',
            content: { description: 'AI project' },
            tags: '["ai", "project"]',
            importance: 'high',
            storedAt: new Date('2023-01-15'),
          },
          interaction: null,
        },
        {
          id: 2,
          relationshipType: 'co_created',
          strength: 0.8,
          createdAt: new Date('2023-01-20'),
          memory: {
            key: 'project2',
            content: { description: 'ML project' },
            tags: '["ml", "project"]',
            importance: 'high',
            storedAt: new Date('2023-01-20'),
          },
          interaction: null,
        },
        {
          id: 3,
          relationshipType: 'learned_from',
          strength: 0.7,
          createdAt: new Date('2023-02-01'),
          memory: {
            key: 'lesson1',
            content: { description: 'Learning session' },
            tags: '["learning"]',
            importance: 'medium',
            storedAt: new Date('2023-02-01'),
          },
          interaction: null,
        },
      ];

      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      mockPrismaService.execute.mockResolvedValueOnce(mockLinks);

      const result = (await socialTools.execute('social_memory_context', {
        entity_name: 'alice',
      })) as any;

      expect(result.insights.linkTypeDistribution).toEqual({
        co_created: 2,
        learned_from: 1,
      });

      expect(result.summary.dominantPatterns[0]).toEqual({
        pattern: 'co_created',
        frequency: 2,
        percentage: 67,
      });
    });
  });

  describe('Memory-based recommendations', () => {
    it('should generate conversation starters from shared memories', async () => {
      const mockEntity = { id: 1, name: 'alice', displayName: 'Alice', entityType: 'person' };
      const mockLinks = [
        {
          id: 1,
          relationshipType: 'co_created',
          strength: 0.9,
          createdAt: new Date('2023-01-15'),
          memory: {
            key: 'project_alpha',
            content: { description: 'AI consciousness project' },
            tags: '["ai", "consciousness"]',
            importance: 'high',
            storedAt: new Date('2023-01-15'),
          },
          interaction: null,
        },
        {
          id: 2,
          relationshipType: 'learned_from',
          strength: 0.8,
          createdAt: new Date('2023-01-20'),
          memory: {
            key: 'ml_techniques',
            content: { description: 'Machine learning discussion' },
            tags: '["ml", "learning"]',
            importance: 'medium',
            storedAt: new Date('2023-01-20'),
          },
          interaction: null,
        },
      ];

      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      mockPrismaService.execute.mockResolvedValueOnce(mockLinks);

      const result = (await socialTools.execute('social_memory_context', {
        entity_name: 'alice',
      })) as any;

      expect(result.recommendations.conversationStarters.length).toBeGreaterThan(0);
    });

    it('should generate memory reminders from shared experiences', async () => {
      const mockEntity = { id: 1, name: 'alice', displayName: 'Alice', entityType: 'person' };
      const mockLinks = [
        {
          id: 1,
          relationshipType: 'emotional_support',
          strength: 0.9,
          context: 'Helped during difficult project',
          createdAt: new Date('2023-01-15'),
          memory: {
            key: 'support_moment',
            content: { description: 'Emotional support during crisis' },
            tags: '["emotional", "support"]',
            importance: 'high',
            storedAt: new Date('2023-01-15'),
          },
          interaction: null,
        },
      ];

      mockPrismaService.execute.mockResolvedValueOnce(mockEntity);
      mockPrismaService.execute.mockResolvedValueOnce(mockLinks);

      const result = (await socialTools.execute('social_memory_context', {
        entity_name: 'alice',
      })) as any;

      expect(result.recommendations.memoryReminders.length).toBeGreaterThan(0);
    });
  });
});
