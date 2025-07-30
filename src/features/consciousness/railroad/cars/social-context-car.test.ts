import { socialContextCar } from './social-context-car.js';
import { RailroadContext } from '../types.js';

// Mock the social module
jest.mock('../../../social/index.js', () => ({
  execute: jest.fn(),
}));

import * as social from '../../../social/index.js';

const mockSocialExecute = social.execute as jest.MockedFunction<typeof social.execute>;

describe('Social Context Railroad Car', () => {
  beforeEach(() => {
    mockSocialExecute.mockClear();
  });

  describe('Social Operations', () => {
    it('should process entity mentions and record interactions', async () => {
      const mockEntityContext = {
        entity: {
          name: 'andy',
          entity_type: 'person',
          display_name: 'Andy',
          description: 'Project collaborator',
        },
        relationship: {
          relationship_type: 'colleague',
          strength: 0.8,
          trust: 0.9,
          affinity: 0.7,
          communication_style: {
            casual: true,
            technical: true,
            preferred_tone: 'friendly',
          },
        },
        recent_interactions: [
          {
            interaction_type: 'collaboration',
            summary: 'Worked on API design',
            quality: 0.9,
            timestamp: '2024-01-15T10:00:00Z',
          },
        ],
      };

      const mockRecentInteractions = {
        interactions: [
          {
            id: 'interaction-1',
            interaction_type: 'conversation',
            summary: 'Discussed project requirements',
            quality: 0.8,
            timestamp: '2024-01-14T15:30:00Z',
          },
          {
            id: 'interaction-2',
            interaction_type: 'brainstorming',
            summary: 'Generated new feature ideas',
            quality: 0.9,
            timestamp: '2024-01-13T11:15:00Z',
          },
        ],
      };

      mockSocialExecute
        .mockResolvedValueOnce(mockEntityContext) // social_entity_get
        .mockResolvedValueOnce(undefined) // social_interaction_record (returns void)
        .mockResolvedValueOnce(mockRecentInteractions); // social_interaction_search

      const context: RailroadContext = {
        message: 'Hey Andy, how are you doing with the project?',
        originalContext: 'Project discussion',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting', 'inquiry'],
          entities_mentioned: ['andy'],
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

      const result = await socialContextCar(context);

      expect(result.socialContext).toBeDefined();
      expect(result.socialContext?.activeRelationships).toHaveLength(1);
      expect(result.socialContext?.entityMentioned).toBe('andy');
      expect(result.socialContext?.relationshipDynamics).toEqual(mockEntityContext);
      expect(result.socialContext?.recentInteractions).toHaveLength(2);

      expect(result.operations.performed).toContain('social-context');
      expect(result.operations.social_interactions).toContain('Recorded interaction with andy');

      // Verify social service calls
      expect(mockSocialExecute).toHaveBeenCalledWith('social_entity_get', {
        name: 'andy',
        include_relationship: true,
        include_interactions: true,
        include_shared_memories: true,
      });

      expect(mockSocialExecute).toHaveBeenCalledWith('social_interaction_record', {
        entity_name: 'andy',
        interaction_type: 'conversation',
        summary: 'Hey Andy, how are you doing with the project?',
        context: 'Project discussion',
        quality: 0.8,
      });

      expect(mockSocialExecute).toHaveBeenCalledWith('social_interaction_search', {
        entity_name: 'andy',
        limit: 5,
      });
    });

    it('should handle multiple entities in message', async () => {
      const mockEntityContext1 = {
        entity: { name: 'andy', entity_type: 'person' },
        relationship: { relationship_type: 'colleague', strength: 0.8 },
      };

      const mockEntityContext2 = {
        entity: { name: 'sarah', entity_type: 'person' },
        relationship: { relationship_type: 'collaborator', strength: 0.7 },
      };

      mockSocialExecute
        .mockResolvedValueOnce(mockEntityContext1) // andy entity_get
        .mockResolvedValueOnce(undefined) // andy interaction_record
        .mockResolvedValueOnce({ interactions: [] }) // andy interaction_search
        .mockResolvedValueOnce(mockEntityContext2) // sarah entity_get
        .mockResolvedValueOnce(undefined) // sarah interaction_record
        .mockResolvedValueOnce({ interactions: [] }); // sarah interaction_search

      const context: RailroadContext = {
        message: 'Can Andy and Sarah work together on this?',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['inquiry'],
          entities_mentioned: ['andy', 'sarah'],
          emotional_context: 'collaborative',
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

      const result = await socialContextCar(context);

      expect(result.socialContext?.activeRelationships).toHaveLength(2);
      expect(result.socialContext?.entityMentioned).toBe('andy'); // First entity mentioned
      expect(result.socialContext?.relationshipDynamics).toEqual(mockEntityContext1);
      expect(result.operations.social_interactions).toHaveLength(2);
      expect(result.operations.social_interactions).toContain('Recorded interaction with andy');
      expect(result.operations.social_interactions).toContain('Recorded interaction with sarah');
    });

    it('should skip social operations when not required', async () => {
      const context: RailroadContext = {
        message: 'What is 2 + 2?',
        timestamp: new Date(),
        analysis: {
          intent: 'technical',
          operations: ['calculation'],
          entities_mentioned: [],
          emotional_context: 'neutral',
          requires_memory: false,
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

      const result = await socialContextCar(context);

      expect(result.socialContext).toBeDefined();
      expect(result.socialContext?.activeRelationships).toHaveLength(0);
      expect(result.socialContext?.recentInteractions).toHaveLength(0);
      expect(result.socialContext?.entityMentioned).toBeUndefined();
      expect(result.socialContext?.relationshipDynamics).toBeUndefined();
      expect(result.operations.performed).toContain('social-context');
      expect(mockSocialExecute).not.toHaveBeenCalled();
    });

    it('should skip when no entities mentioned', async () => {
      const context: RailroadContext = {
        message: 'How do I improve my programming skills?',
        timestamp: new Date(),
        analysis: {
          intent: 'learning',
          operations: ['advice_seeking'],
          entities_mentioned: [],
          emotional_context: 'curious',
          requires_memory: true,
          requires_social: true, // Still requires social but no entities
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

      const result = await socialContextCar(context);

      expect(result.socialContext?.activeRelationships).toHaveLength(0);
      expect(result.socialContext?.entityMentioned).toBeUndefined();
      expect(mockSocialExecute).not.toHaveBeenCalled();
    });

    it('should truncate long messages in interaction summary', async () => {
      const longMessage = 'A'.repeat(300); // 300 characters
      const truncatedMessage = 'A'.repeat(200); // Should be truncated to 200

      mockSocialExecute
        .mockResolvedValueOnce({ entity: { name: 'test' } })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ interactions: [] });

      const context: RailroadContext = {
        message: longMessage,
        timestamp: new Date(),
        analysis: {
          intent: 'general',
          operations: ['conversation'],
          entities_mentioned: ['test'],
          emotional_context: 'neutral',
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

      await socialContextCar(context);

      expect(mockSocialExecute).toHaveBeenCalledWith('social_interaction_record', {
        entity_name: 'test',
        interaction_type: 'conversation',
        summary: truncatedMessage,
        context: 'General conversation',
        quality: 0.8,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle entity lookup failures gracefully', async () => {
      mockSocialExecute.mockRejectedValue(new Error('Entity service unavailable'));

      const context: RailroadContext = {
        message: 'Hey Andy, how are you?',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['andy'],
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

      const result = await socialContextCar(context);

      expect(result.socialContext?.activeRelationships).toHaveLength(0);
      expect(result.socialContext?.entityMentioned).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].car).toBe('social-context');
      expect(result.errors[0].error).toContain("Failed to process entity 'andy'");
    });

    it('should handle partial entity failures while continuing with others', async () => {
      const mockEntityContext = {
        entity: { name: 'sarah', entity_type: 'person' },
        relationship: { relationship_type: 'colleague' },
      };

      mockSocialExecute
        .mockRejectedValueOnce(new Error('Andy not found')) // andy fails
        .mockResolvedValueOnce(mockEntityContext) // sarah succeeds
        .mockResolvedValueOnce(undefined) // sarah interaction_record
        .mockResolvedValueOnce({ interactions: [] }); // sarah interaction_search

      const context: RailroadContext = {
        message: 'Andy and Sarah, can you help?',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['request'],
          entities_mentioned: ['andy', 'sarah'],
          emotional_context: 'collaborative',
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

      const result = await socialContextCar(context);

      expect(result.socialContext?.activeRelationships).toHaveLength(1);
      expect(result.socialContext?.entityMentioned).toBe('sarah');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain("Failed to process entity 'andy'");
      expect(result.operations.social_interactions).toContain('Recorded interaction with sarah');
    });

    it('should handle interaction recording failures', async () => {
      const mockEntityContext = {
        entity: { name: 'andy', entity_type: 'person' },
      };

      mockSocialExecute
        .mockResolvedValueOnce(mockEntityContext) // entity_get succeeds
        .mockRejectedValueOnce(new Error('Recording service down')) // interaction_record fails
        .mockResolvedValueOnce({ interactions: [] }); // interaction_search succeeds

      const context: RailroadContext = {
        message: 'Hi Andy',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['andy'],
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

      const result = await socialContextCar(context);

      expect(result.socialContext?.activeRelationships).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain("Failed to process entity 'andy'");
    });

    it('should handle complete social service failure', async () => {
      mockSocialExecute.mockRejectedValue(new Error('Social service completely down'));

      const context: RailroadContext = {
        message: 'Hey everyone!',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['everyone'],
          emotional_context: 'enthusiastic',
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

      const result = await socialContextCar(context);

      expect(result.socialContext).toBeDefined();
      expect(result.socialContext?.activeRelationships).toHaveLength(0);
      expect(result.socialContext?.recentInteractions).toHaveLength(0);
      expect(result.socialContext?.entityMentioned).toBeUndefined();
      expect(result.socialContext?.relationshipDynamics).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].car).toBe('social-context');
    });
  });

  describe('Context Preservation', () => {
    it('should preserve existing context and operations', async () => {
      mockSocialExecute
        .mockResolvedValueOnce({ entity: { name: 'test' } })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ interactions: [] });

      const context: RailroadContext = {
        message: 'Hi test',
        originalContext: 'Previous context',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['test'],
          emotional_context: 'friendly',
          requires_memory: false,
          requires_social: true,
          requires_insight_storage: false,
        },
        sessionContext: {
          sessionId: 'test-session',
          currentState: {},
          duration: 100,
          cognitiveLoad: 0.5,
          attentionFocus: 'testing',
          mode: 'social',
          awarenessLevel: 'normal',
        },
        memoryContext: {
          relevantMemories: [],
          totalMemories: 0,
          recentActivity: [],
        },
        operations: {
          performed: ['message-analysis', 'session-context', 'memory-context'],
          insights_generated: ['previous-insight'],
          memories_accessed: ['previous-memory'],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await socialContextCar(context);

      expect(result.originalContext).toBe('Previous context');
      expect(result.analysis).toEqual(context.analysis);
      expect(result.sessionContext).toEqual(context.sessionContext);
      expect(result.memoryContext).toEqual(context.memoryContext);
      expect(result.operations.performed).toContain('message-analysis');
      expect(result.operations.performed).toContain('session-context');
      expect(result.operations.performed).toContain('memory-context');
      expect(result.operations.performed).toContain('social-context');
      expect(result.operations.insights_generated).toContain('previous-insight');
      expect(result.operations.memories_accessed).toContain('previous-memory');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined entity context gracefully', async () => {
      mockSocialExecute
        .mockResolvedValueOnce(null) // entity_get returns null
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ interactions: [] });

      const context: RailroadContext = {
        message: 'Hi unknown',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['unknown'],
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

      const result = await socialContextCar(context);

      expect(result.socialContext?.activeRelationships).toHaveLength(0);
      expect(result.socialContext?.entityMentioned).toBeUndefined();
    });

    it('should handle malformed interaction search responses', async () => {
      mockSocialExecute
        .mockResolvedValueOnce({ entity: { name: 'test' } })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ interactions: null }); // Malformed response

      const context: RailroadContext = {
        message: 'Hi test',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['test'],
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

      const result = await socialContextCar(context);

      expect(result.socialContext?.recentInteractions).toHaveLength(0);
      expect(result.socialContext?.activeRelationships).toHaveLength(1);
    });
  });
});
