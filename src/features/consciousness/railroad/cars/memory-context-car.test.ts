import { memoryContextCar } from './memory-context-car.js';
import { RailroadContext } from '../types.js';

// Mock the memory module
jest.mock('../../../memory/index.js', () => ({
  searchMemories: jest.fn(),
}));

import * as memory from '../../../memory/index.js';

const mockSearchMemories = memory.searchMemories as jest.MockedFunction<typeof memory.searchMemories>;

describe('Memory Context Railroad Car', () => {
  beforeEach(() => {
    mockSearchMemories.mockClear();
  });

  describe('Memory Retrieval', () => {
    it('should retrieve relevant memories when required by analysis', async () => {
      const mockMemories = [
        {
          id: 'memory-1',
          key: 'consciousness-understanding',
          content: { topic: 'consciousness', insights: ['awareness', 'reflection'] },
          tags: ['consciousness', 'philosophy'],
          importance: 'high',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          id: 'memory-2',
          key: 'learning-patterns',
          content: { patterns: ['iterative', 'collaborative'] },
          tags: ['learning', 'patterns'],
          importance: 'medium',
          timestamp: '2024-01-14T15:30:00Z',
        },
      ];

      const mockRecentActivity = [
        { action: 'stored_insight', timestamp: '2024-01-15T09:45:00Z', topic: 'consciousness' },
      ];

      mockSearchMemories.mockResolvedValueOnce({ results: mockMemories, total: 15 }); // searchMemories

      const context: RailroadContext = {
        message: 'How does consciousness and learning work together?',
        timestamp: new Date(),
        analysis: {
          intent: 'learning',
          operations: ['reflection'],
          entities_mentioned: [],
          emotional_context: 'curious',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: true,
        },
        operations: {
          performed: ['message-analysis'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await memoryContextCar(context);

      expect(result.memoryContext).toBeDefined();
      expect(result.memoryContext?.relevantMemories).toHaveLength(2);
      expect(result.memoryContext?.totalMemories).toBe(15);
      expect(result.memoryContext?.recentActivity).toHaveLength(1);
      expect(result.memoryContext?.searchQuery).toBe('consciousness learning work together');
      expect(result.operations.performed).toContain('memory-context');
      expect(result.operations.memories_accessed).toContain('consciousness-understanding');
      expect(result.operations.memories_accessed).toContain('learning-patterns');

      expect(mockSearchMemories).toHaveBeenCalledWith('memory_search', {
        query: 'consciousness learning work together',
        tags: undefined,
        importance_filter: undefined,
      });
    });

    it('should skip memory operations when not required by analysis', async () => {
      const context: RailroadContext = {
        message: 'Hello there!',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['user'],
          emotional_context: 'friendly',
          requires_memory: false,
          requires_social: true,
          requires_insight_storage: false,
        },
        operations: {
          performed: ['message-analysis'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await memoryContextCar(context);

      expect(result.memoryContext).toBeDefined();
      expect(result.memoryContext?.relevantMemories).toHaveLength(0);
      expect(result.memoryContext?.totalMemories).toBe(0);
      expect(result.memoryContext?.recentActivity).toHaveLength(0);
      expect(result.memoryContext?.searchQuery).toBeUndefined();
      expect(result.operations.performed).toContain('memory-context');
      expect(mockSearchMemories).not.toHaveBeenCalled();
    });

    it('should handle memory search with entity-specific queries', async () => {
      const mockMemories = [
        {
          id: 'memory-3',
          key: 'andy-collaboration',
          content: { collaboration: 'project work', relationship: 'productive' },
          tags: ['andy', 'collaboration'],
          importance: 'high',
        },
      ];

      mockSearchMemories
        .mockResolvedValueOnce({ results: mockMemories, total: 3 })
        .mockResolvedValueOnce({ activities: [] });

      const context: RailroadContext = {
        message: 'Andy, can you help me with this project?',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['request'],
          entities_mentioned: ['andy'],
          emotional_context: 'collaborative',
          requires_memory: true,
          requires_social: true,
          requires_insight_storage: false,
        },
        operations: {
          performed: ['message-analysis'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await memoryContextCar(context);

      expect(result.memoryContext?.searchQuery).toBe('Andy help project andy');
      expect(result.memoryContext?.relevantMemories).toHaveLength(1);
      expect(result.operations.memories_accessed).toContain('andy-collaboration');
    });

    it('should filter memories by importance when specified', async () => {
      const highImportanceMemories = [
        {
          id: 'critical-memory',
          key: 'important-insight',
          content: { critical: true },
          tags: ['critical'],
          importance: 'critical',
        },
      ];

      mockSearchMemories
        .mockResolvedValueOnce({ results: highImportanceMemories, total: 1 })
        .mockResolvedValueOnce({ activities: [] });

      const context: RailroadContext = {
        message: 'What are the most important things I need to know?',
        timestamp: new Date(),
        analysis: {
          intent: 'learning',
          operations: ['knowledge_seeking'],
          entities_mentioned: [],
          emotional_context: 'focused',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: false,
        },
        operations: {
          performed: ['message-analysis'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await memoryContextCar(context);

      expect(mockSearchMemories).toHaveBeenCalledWith('memory_search', {
        query: 'important things know',
        tags: undefined,
        importance_filter: 'high', // Should filter for high importance
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle memory search failure gracefully', async () => {
      mockSearchMemories.mockRejectedValue(new Error('Memory service unavailable'));

      const context: RailroadContext = {
        message: 'Tell me about consciousness',
        timestamp: new Date(),
        analysis: {
          intent: 'learning',
          operations: ['reflection'],
          entities_mentioned: [],
          emotional_context: 'curious',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: true,
        },
        operations: {
          performed: ['message-analysis'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await memoryContextCar(context);

      expect(result.memoryContext).toBeDefined();
      expect(result.memoryContext?.relevantMemories).toHaveLength(0);
      expect(result.memoryContext?.totalMemories).toBe(0);
      expect(result.memoryContext?.recentActivity).toHaveLength(0);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].car).toBe('memory-context');
      expect(result.errors[0].error).toContain('Memory service unavailable');
    });

    it('should handle partial memory service failures', async () => {
      const mockMemories = [{ id: 'memory-1', key: 'test', content: {}, tags: [], importance: 'medium' }];

      mockSearchMemories
        .mockResolvedValueOnce({ results: mockMemories, total: 1 }) // searchMemories succeeds
        .mockRejectedValueOnce(new Error('Recent activity service down')); // getRecentActivity fails

      const context: RailroadContext = {
        message: 'Test message',
        timestamp: new Date(),
        analysis: {
          intent: 'general',
          operations: ['conversation'],
          entities_mentioned: [],
          emotional_context: 'neutral',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: false,
        },
        operations: {
          performed: ['message-analysis'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await memoryContextCar(context);

      expect(result.memoryContext?.relevantMemories).toHaveLength(1);
      expect(result.memoryContext?.recentActivity).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Recent activity service down');
    });

    it('should handle malformed memory responses', async () => {
      mockSearchMemories
        .mockResolvedValueOnce({ results: null }) // Invalid response
        .mockResolvedValueOnce({ activities: undefined }); // Invalid response

      const context: RailroadContext = {
        message: 'Test with malformed response',
        timestamp: new Date(),
        analysis: {
          intent: 'general',
          operations: ['conversation'],
          entities_mentioned: [],
          emotional_context: 'neutral',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: false,
        },
        operations: {
          performed: ['message-analysis'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await memoryContextCar(context);

      expect(result.memoryContext?.relevantMemories).toHaveLength(0);
      expect(result.memoryContext?.recentActivity).toHaveLength(0);
      expect(result.memoryContext?.totalMemories).toBe(0);
    });
  });

  describe('Context Preservation', () => {
    it('should preserve existing context and operations', async () => {
      mockSearchMemories.mockResolvedValueOnce({ results: [], total: 0 }).mockResolvedValueOnce({ activities: [] });

      const context: RailroadContext = {
        message: 'Test message',
        originalContext: 'Previous context',
        timestamp: new Date(),
        analysis: {
          intent: 'technical',
          operations: ['analysis'],
          entities_mentioned: [],
          emotional_context: 'focused',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: true,
        },
        sessionContext: {
          sessionId: 'test-session',
          currentState: {},
          duration: 100,
          cognitiveLoad: 0.5,
          attentionFocus: 'testing',
          mode: 'analytical',
          awarenessLevel: 'normal',
        },
        operations: {
          performed: ['message-analysis', 'session-context'],
          insights_generated: ['previous-insight'],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await memoryContextCar(context);

      expect(result.originalContext).toBe('Previous context');
      expect(result.analysis).toEqual(context.analysis);
      expect(result.sessionContext).toEqual(context.sessionContext);
      expect(result.operations.performed).toContain('message-analysis');
      expect(result.operations.performed).toContain('session-context');
      expect(result.operations.performed).toContain('memory-context');
      expect(result.operations.insights_generated).toContain('previous-insight');
    });
  });

  describe('Query Construction', () => {
    it('should build comprehensive search queries from message and entities', async () => {
      mockSearchMemories.mockResolvedValueOnce({ results: [], total: 0 }).mockResolvedValueOnce({ activities: [] });

      const context: RailroadContext = {
        message: 'How does neural network optimization work for Sarah and Tom?',
        timestamp: new Date(),
        analysis: {
          intent: 'technical',
          operations: ['problem_solving'],
          entities_mentioned: ['Sarah', 'Tom'],
          emotional_context: 'focused',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: true,
        },
        operations: {
          performed: ['message-analysis'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      await memoryContextCar(context);

      expect(mockSearchMemories).toHaveBeenCalledWith('memory_search', {
        query: 'neural network optimization work Sarah Tom',
        tags: undefined,
        importance_filter: undefined,
      });
    });

    it('should handle empty or minimal messages', async () => {
      mockSearchMemories.mockResolvedValueOnce({ results: [], total: 0 }).mockResolvedValueOnce({ activities: [] });

      const context: RailroadContext = {
        message: 'Hi',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: [],
          emotional_context: 'friendly',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: false,
        },
        operations: {
          performed: ['message-analysis'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      await memoryContextCar(context);

      expect(mockSearchMemories).toHaveBeenCalledWith('memory_search', {
        query: 'Hi',
        tags: undefined,
        importance_filter: undefined,
      });
    });
  });
});
