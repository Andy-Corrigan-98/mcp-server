import { sessionContextCar } from './session-context-car.js';
import { RailroadContext } from '../types.js';

// Mock the consciousness context getter
jest.mock('../../context/get-context.js', () => ({
  getContext: jest.fn(),
}));

import { getContext } from '../../context/get-context.js';

const mockGetContext = getContext as jest.MockedFunction<typeof getContext>;

describe('Session Context Railroad Car', () => {
  beforeEach(() => {
    mockGetContext.mockClear();
  });

  describe('Successful Context Retrieval', () => {
    it('should add comprehensive session context', async () => {
      const mockConsciousnessState = {
        sessionId: 'test-session-123',
        mode: 'analytical',
        activeProcesses: ['message_processing', 'memory_search'],
        attentionFocus: 'technical_problem_solving',
        cognitiveLoad: 0.6,
        awarenessLevel: 'heightened',
        learningState: {
          currentFocus: 'consciousness_patterns',
          retentionRate: 0.85,
          confidenceLevel: 0.9,
        },
        emotionalTone: 'curious_engaged',
        lastActivity: new Date().toISOString(),
        personality: {
          currentMode: 'analytical',
          confidence: 0.8,
          engagement: 'high',
          formality: 'balanced',
        },
      };

      mockGetContext.mockResolvedValue({
        consciousness_state: mockConsciousnessState,
        session_duration: 1847, // seconds
        memory_utilization: 0.45,
        recent_insights: ['pattern_recognition', 'knowledge_synthesis'],
        active_intentions: [{ id: 'intention-1', content: 'Help user understand concepts', priority: 'gentle_nudge' }],
      });

      const context: RailroadContext = {
        message: 'How does consciousness work?',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await sessionContextCar(context);

      expect(result.sessionContext).toBeDefined();
      expect(result.sessionContext?.sessionId).toBe('test-session-123');
      expect(result.sessionContext?.currentState).toEqual(mockConsciousnessState);
      expect(result.sessionContext?.duration).toBe(1847);
      expect(result.sessionContext?.cognitiveLoad).toBe(0.6);
      expect(result.sessionContext?.attentionFocus).toBe('technical_problem_solving');
      expect(result.sessionContext?.mode).toBe('analytical');
      expect(result.sessionContext?.awarenessLevel).toBe('heightened');
      expect(result.operations.performed).toContain('session-context');
    });

    it('should handle minimal session state', async () => {
      const mockConsciousnessState = {
        sessionId: 'minimal-session',
        mode: 'balanced',
        cognitiveLoad: 0.3,
        awarenessLevel: 'normal',
      };

      mockGetContext.mockResolvedValue({
        consciousness_state: mockConsciousnessState,
        session_duration: 0,
        memory_utilization: 0.1,
      });

      const context: RailroadContext = {
        message: 'Hello',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await sessionContextCar(context);

      expect(result.sessionContext).toBeDefined();
      expect(result.sessionContext?.sessionId).toBe('minimal-session');
      expect(result.sessionContext?.mode).toBe('balanced');
      expect(result.sessionContext?.duration).toBe(0);
      expect(result.sessionContext?.cognitiveLoad).toBe(0.3);
    });

    it('should extract learning state metrics', async () => {
      const mockLearningState = {
        currentFocus: 'social_interaction_patterns',
        retentionRate: 0.92,
        confidenceLevel: 0.88,
        recentGrowthAreas: ['empathy', 'communication'],
        learningVelocity: 1.2,
      };

      mockGetContext.mockResolvedValue({
        consciousness_state: {
          sessionId: 'learning-session',
          mode: 'curious',
          cognitiveLoad: 0.7,
          awarenessLevel: 'deep',
          learningState: mockLearningState,
        },
        session_duration: 3600,
        memory_utilization: 0.65,
      });

      const context: RailroadContext = {
        message: 'I want to learn more about relationships',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await sessionContextCar(context);

      expect(result.sessionContext?.currentState.learningState).toEqual(mockLearningState);
    });
  });

  describe('Error Handling', () => {
    it('should handle context retrieval failure with defaults', async () => {
      mockGetContext.mockRejectedValue(new Error('Context service unavailable'));

      const context: RailroadContext = {
        message: 'Test message during service failure',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await sessionContextCar(context);

      expect(result.sessionContext).toBeDefined();
      expect(result.sessionContext?.sessionId).toMatch(/^session-\d+$/);
      expect(result.sessionContext?.mode).toBe('balanced');
      expect(result.sessionContext?.cognitiveLoad).toBe(0.5);
      expect(result.sessionContext?.awarenessLevel).toBe('normal');
      expect(result.sessionContext?.duration).toBe(0);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].car).toBe('session-context');
      expect(result.errors[0].message).toContain('Context service unavailable');
    });

    it('should handle partial context data gracefully', async () => {
      mockGetContext.mockResolvedValue({
        consciousness_state: {
          // Missing sessionId and other required fields
          mode: 'analytical',
        },
      });

      const context: RailroadContext = {
        message: 'Test with partial data',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await sessionContextCar(context);

      expect(result.sessionContext).toBeDefined();
      expect(result.sessionContext?.sessionId).toMatch(/^session-\d+$/); // Generated fallback
      expect(result.sessionContext?.mode).toBe('analytical'); // From partial data
      expect(result.sessionContext?.cognitiveLoad).toBe(0.5); // Default
      expect(result.sessionContext?.awarenessLevel).toBe('normal'); // Default
    });

    it('should handle null/undefined consciousness state', async () => {
      mockGetContext.mockResolvedValue({
        consciousness_state: null,
        session_duration: 100,
      });

      const context: RailroadContext = {
        message: 'Test with null state',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await sessionContextCar(context);

      expect(result.sessionContext).toBeDefined();
      expect(result.sessionContext?.sessionId).toMatch(/^session-\d+$/);
      expect(result.sessionContext?.currentState).toMatchObject({
        sessionId: expect.stringMatching(/^session-\d+$/),
        mode: 'balanced',
        cognitiveLoad: 0.5,
        awarenessLevel: 'normal',
      });
    });
  });

  describe('Context Preservation', () => {
    it('should preserve existing context and operations', async () => {
      mockGetContext.mockResolvedValue({
        consciousness_state: {
          sessionId: 'preserve-test',
          mode: 'analytical',
          cognitiveLoad: 0.4,
          awarenessLevel: 'focused',
        },
        session_duration: 500,
      });

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
        operations: {
          performed: ['message-analysis'],
          insights_generated: ['previous-insight'],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await sessionContextCar(context);

      expect(result.originalContext).toBe('Previous context');
      expect(result.analysis).toEqual(context.analysis);
      expect(result.operations.performed).toContain('message-analysis');
      expect(result.operations.performed).toContain('session-context');
      expect(result.operations.insights_generated).toContain('previous-insight');
    });
  });

  describe('Session ID Generation', () => {
    it('should generate unique session IDs for different contexts', async () => {
      mockGetContext.mockResolvedValue({
        consciousness_state: {},
        session_duration: 0,
      });

      const context1: RailroadContext = {
        message: 'First message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const context2: RailroadContext = {
        message: 'Second message',
        timestamp: new Date(),
        operations: {
          performed: [],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result1 = await sessionContextCar(context1);
      const result2 = await sessionContextCar(context2);

      expect(result1.sessionContext?.sessionId).not.toBe(result2.sessionContext?.sessionId);
      expect(result1.sessionContext?.sessionId).toMatch(/^session-\d+$/);
      expect(result2.sessionContext?.sessionId).toMatch(/^session-\d+$/);
    });
  });
});
