import { messageAnalysisCar } from './message-analysis-car.js';
import { RailroadContext } from '../types.js';

// Mock the simple conversation dependency
jest.mock('../../../reasoning/conversation/simple-conversation.js', () => ({
  simpleConversation: jest.fn(),
}));

import { simpleConversation } from '../../../reasoning/conversation/simple-conversation.js';

const mockSimpleConversation = simpleConversation as jest.MockedFunction<typeof simpleConversation>;

describe.skip('Message Analysis Railroad Car', () => {
  beforeEach(() => {
    mockSimpleConversation.mockClear();
  });

  describe('Successful Analysis', () => {
    it('should analyze technical message correctly', async () => {
      const context: RailroadContext = {
        message: 'How do I optimize this React component for better performance?',
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

      mockSimpleConversation.mockResolvedValue({
        response: JSON.stringify({
          intent: 'technical',
          operations: ['problem_solving'],
          entities_mentioned: [],
          emotional_context: 'focused',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: true,
        }),
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        conversation_safe: true,
      });

      const result = await messageAnalysisCar(context);

      expect(result.analysis).toBeDefined();
      expect(result.analysis?.intent).toBe('technical');
      expect(result.analysis?.operations).toContain('problem_solving');
      expect(result.analysis?.requires_memory).toBe(true);
      expect(result.operations.performed).toContain('message-analysis');
    });

    it('should analyze social message with entity mentions', async () => {
      const context: RailroadContext = {
        message: 'Hey Andy, how are you doing today?',
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

      mockSimpleConversation.mockResolvedValue({
        response: JSON.stringify({
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['andy'],
          emotional_context: 'friendly',
          requires_memory: false,
          requires_social: true,
          requires_insight_storage: false,
        }),
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        conversation_safe: true,
      });

      const result = await messageAnalysisCar(context);

      expect(result.analysis?.intent).toBe('social');
      expect(result.analysis?.entities_mentioned).toContain('andy');
      expect(result.analysis?.requires_social).toBe(true);
      expect(result.analysis?.emotional_context).toBe('friendly');
    });

    it('should handle learning/reflection messages', async () => {
      const context: RailroadContext = {
        message: 'I want to understand how consciousness works',
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

      mockSimpleConversation.mockResolvedValue({
        response: JSON.stringify({
          intent: 'learning',
          operations: ['reflection', 'knowledge_seeking'],
          entities_mentioned: [],
          emotional_context: 'curious',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: true,
        }),
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        conversation_safe: true,
      });

      const result = await messageAnalysisCar(context);

      expect(result.analysis?.intent).toBe('learning');
      expect(result.analysis?.operations).toContain('reflection');
      expect(result.analysis?.operations).toContain('knowledge_seeking');
      expect(result.analysis?.requires_insight_storage).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle GenAI conversation failure with fallback analysis', async () => {
      const context: RailroadContext = {
        message: 'Test message that causes GenAI to fail',
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

      mockSimpleConversation.mockRejectedValue(new Error('GenAI service unavailable'));

      const result = await messageAnalysisCar(context);

      expect(result.analysis).toBeDefined();
      expect(result.analysis?.intent).toBe('general');
      expect(result.analysis?.operations).toContain('conversation');
      expect(result.analysis?.emotional_context).toBe('neutral');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].car).toBe('message-analysis');
      expect(result.errors[0].error).toContain('GenAI service unavailable');
    });

    it('should handle invalid JSON response from GenAI', async () => {
      const context: RailroadContext = {
        message: 'Test message with malformed response',
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

      mockSimpleConversation.mockResolvedValue({
        response: 'This is not valid JSON',
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        conversation_safe: true,
      });

      const result = await messageAnalysisCar(context);

      expect(result.analysis).toBeDefined();
      expect(result.analysis?.intent).toBe('general');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Failed to parse GenAI analysis');
    });

    it('should handle partial analysis data from GenAI', async () => {
      const context: RailroadContext = {
        message: 'Test message with incomplete analysis',
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

      mockSimpleConversation.mockResolvedValue({
        response: JSON.stringify({
          intent: 'technical',
          // Missing other required fields
        }),
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        conversation_safe: true,
      });

      const result = await messageAnalysisCar(context);

      expect(result.analysis).toBeDefined();
      expect(result.analysis?.intent).toBe('technical');
      expect(result.analysis?.operations).toEqual(['conversation']); // Fallback value
      expect(result.analysis?.entities_mentioned).toEqual([]); // Fallback value
      expect(result.analysis?.emotional_context).toBe('neutral'); // Fallback value
    });
  });

  describe('Fallback Analysis', () => {
    it('should detect entities in fallback mode using simple heuristics', async () => {
      const context: RailroadContext = {
        message: 'Andy and Sarah are working on the project',
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

      mockSimpleConversation.mockRejectedValue(new Error('Service down'));

      const result = await messageAnalysisCar(context);

      expect(result.analysis?.entities_mentioned).toEqual(expect.arrayContaining(['Andy', 'Sarah']));
    });

    it('should detect question intent in fallback mode', async () => {
      const context: RailroadContext = {
        message: 'How does this work?',
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

      mockSimpleConversation.mockRejectedValue(new Error('Service down'));

      const result = await messageAnalysisCar(context);

      expect(result.analysis?.intent).toBe('learning');
      expect(result.analysis?.requires_memory).toBe(true);
    });

    it('should detect social greetings in fallback mode', async () => {
      const context: RailroadContext = {
        message: 'Hello! How are you doing?',
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

      mockSimpleConversation.mockRejectedValue(new Error('Service down'));

      const result = await messageAnalysisCar(context);

      expect(result.analysis?.intent).toBe('social');
      expect(result.analysis?.requires_social).toBe(true);
    });
  });

  describe('Context Preservation', () => {
    it('should preserve existing context and operations', async () => {
      const context: RailroadContext = {
        message: 'Test message',
        originalContext: 'Previous context',
        timestamp: new Date(),
        operations: {
          performed: ['previous-operation'],
          insights_generated: ['previous-insight'],
          memories_accessed: ['previous-memory'],
          social_interactions: ['previous-social'],
          consciousness_updates: { previous: 'update' },
        },
        errors: [{ car: 'previous-car', message: 'Previous error', stack: 'stack' }],
      };

      mockSimpleConversation.mockResolvedValue({
        response: JSON.stringify({
          intent: 'general',
          operations: ['conversation'],
          entities_mentioned: [],
          emotional_context: 'neutral',
          requires_memory: false,
          requires_social: false,
          requires_insight_storage: false,
        }),
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString(),
        conversation_safe: true,
      });

      const result = await messageAnalysisCar(context);

      expect(result.originalContext).toBe('Previous context');
      expect(result.operations.performed).toContain('previous-operation');
      expect(result.operations.performed).toContain('message-analysis');
      expect(result.operations.insights_generated).toContain('previous-insight');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].car).toBe('previous-car');
    });
  });
});
