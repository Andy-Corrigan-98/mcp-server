import {
  processConsciousnessContext,
  extractResponseContext,
  getPersonalityContext,
  createDefaultRailroad,
  createLightweightRailroad,
  createMemoryFocusedRailroad,
  createSocialFocusedRailroad,
} from './consciousness-railroad.js';
import { RailroadContext, RailroadResult } from './types.js';

// Mock all the railroad cars
jest.mock('./cars/message-analysis-car.js', () => ({
  messageAnalysisCar: jest.fn(),
}));

jest.mock('./cars/session-context-car.js', () => ({
  sessionContextCar: jest.fn(),
}));

jest.mock('./cars/memory-context-car.js', () => ({
  memoryContextCar: jest.fn(),
}));

jest.mock('./cars/social-context-car.js', () => ({
  socialContextCar: jest.fn(),
}));

jest.mock('./cars/personality-context-car.js', () => ({
  personalityContextCar: jest.fn(),
}));

import { messageAnalysisCar } from './cars/message-analysis-car.js';
import { sessionContextCar } from './cars/session-context-car.js';
import { memoryContextCar } from './cars/memory-context-car.js';
import { socialContextCar } from './cars/social-context-car.js';
import { personalityContextCar } from './cars/personality-context-car.js';

const mockMessageAnalysisCar = messageAnalysisCar as jest.MockedFunction<typeof messageAnalysisCar>;
const mockSessionContextCar = sessionContextCar as jest.MockedFunction<typeof sessionContextCar>;
const mockMemoryContextCar = memoryContextCar as jest.MockedFunction<typeof memoryContextCar>;
const mockSocialContextCar = socialContextCar as jest.MockedFunction<typeof socialContextCar>;
const mockPersonalityContextCar = personalityContextCar as jest.MockedFunction<typeof personalityContextCar>;

describe('Consciousness Railroad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Railroad Factory Functions', () => {
    it('should create default railroad with all cars', () => {
      const railroad = createDefaultRailroad();
      const cars = railroad.getCars();

      expect(cars).toHaveLength(5);
      expect(cars.map(car => car.name)).toEqual([
        'message-analysis',
        'session-context',
        'memory-context',
        'social-context',
        'personality-context',
      ]);
      expect(cars.every(car => car.required)).toBe(true);
    });

    it('should create lightweight railroad with minimal cars', () => {
      const railroad = createLightweightRailroad();
      const cars = railroad.getCars();

      expect(cars).toHaveLength(2);
      expect(cars.map(car => car.name)).toEqual(['message-analysis', 'personality-context']);
      expect(cars.every(car => car.required)).toBe(true);
    });

    it('should create memory-focused railroad', () => {
      const railroad = createMemoryFocusedRailroad();
      const cars = railroad.getCars();

      expect(cars).toHaveLength(4);
      expect(cars.map(car => car.name)).toEqual([
        'message-analysis',
        'session-context',
        'memory-context',
        'personality-context',
      ]);
      expect(cars[0].required).toBe(true); // message-analysis
      expect(cars[1].required).toBe(false); // session-context (optional)
      expect(cars[2].required).toBe(true); // memory-context
      expect(cars[3].required).toBe(true); // personality-context
    });

    it('should create social-focused railroad', () => {
      const railroad = createSocialFocusedRailroad();
      const cars = railroad.getCars();

      expect(cars).toHaveLength(4);
      expect(cars.map(car => car.name)).toEqual([
        'message-analysis',
        'session-context',
        'social-context',
        'personality-context',
      ]);
      expect(cars[0].required).toBe(true); // message-analysis
      expect(cars[1].required).toBe(false); // session-context (optional)
      expect(cars[2].required).toBe(true); // social-context
      expect(cars[3].required).toBe(true); // personality-context
    });
  });

  describe('Process Consciousness Context', () => {
    it('should process complete consciousness context successfully', async () => {
      const mockFinalContext: RailroadContext = {
        message: 'How does consciousness work?',
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
        sessionContext: {
          sessionId: 'test-session',
          currentState: { mode: 'curious' },
          duration: 300,
          cognitiveLoad: 0.6,
          attentionFocus: 'learning',
          mode: 'curious',
          awarenessLevel: 'engaged',
        },
        memoryContext: {
          relevantMemories: [{ id: 'mem-1', key: 'consciousness-theory', content: {}, tags: [] }],
          totalMemories: 10,
          recentActivity: [],
        },
        socialContext: {
          activeRelationships: [],
          recentInteractions: [],
          entityMentioned: undefined,
          relationshipDynamics: undefined,
        },
        personalityContext: {
          vocabularyPreferences: {
            priorityLevels: ['gentle_nudge', 'thoughtful_dive'],
          },
          learningPatterns: {
            recentCategories: ['mirror_gazing'],
            averageConfidence: 0.85,
            learningVelocity: 1.2,
          },
          communicationStyle: 'thoughtful_exploratory',
          currentPersonalityState: {
            mode: 'curious',
            confidence: 0.87,
            engagement: 'high',
            formality: 'balanced',
          },
        },
        operations: {
          performed: ['message-analysis', 'session-context', 'memory-context', 'social-context', 'personality-context'],
          insights_generated: [],
          memories_accessed: ['consciousness-theory'],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      // Mock each car to add its piece sequentially
      mockMessageAnalysisCar.mockImplementation(async ctx => ({
        ...ctx,
        analysis: mockFinalContext.analysis,
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'message-analysis'] },
      }));

      mockSessionContextCar.mockImplementation(async ctx => ({
        ...ctx,
        sessionContext: mockFinalContext.sessionContext,
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'session-context'] },
      }));

      mockMemoryContextCar.mockImplementation(async ctx => ({
        ...ctx,
        memoryContext: mockFinalContext.memoryContext,
        operations: {
          ...ctx.operations,
          performed: [...ctx.operations.performed, 'memory-context'],
          memories_accessed: mockFinalContext.operations.memories_accessed,
        },
      }));

      mockSocialContextCar.mockImplementation(async ctx => ({
        ...ctx,
        socialContext: mockFinalContext.socialContext,
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'social-context'] },
      }));

      mockPersonalityContextCar.mockImplementation(async ctx => ({
        ...ctx,
        personalityContext: mockFinalContext.personalityContext,
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'personality-context'] },
      }));

      const result = await processConsciousnessContext('How does consciousness work?', 'Learning session', 'default');

      expect(result.success).toBe(true);
      expect(result.context.analysis).toEqual(mockFinalContext.analysis);
      expect(result.context.sessionContext).toEqual(mockFinalContext.sessionContext);
      expect(result.context.memoryContext).toEqual(mockFinalContext.memoryContext);
      expect(result.context.socialContext).toEqual(mockFinalContext.socialContext);
      expect(result.context.personalityContext).toEqual(mockFinalContext.personalityContext);
      expect(result.context.operations.performed).toHaveLength(5);
      expect(result.executionTrace).toHaveLength(5);
      expect(result.totalExecutionTime).toBeGreaterThan(0);
    });

    it('should handle lightweight railroad type', async () => {
      mockMessageAnalysisCar.mockImplementation(async ctx => ({
        ...ctx,
        analysis: {
          intent: 'general',
          operations: ['conversation'],
          entities_mentioned: [],
          emotional_context: 'neutral',
          requires_memory: false,
          requires_social: false,
          requires_insight_storage: false,
        },
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'message-analysis'] },
      }));

      mockPersonalityContextCar.mockImplementation(async ctx => ({
        ...ctx,
        personalityContext: {
          vocabularyPreferences: {},
          learningPatterns: {},
          communicationStyle: 'adaptive',
          currentPersonalityState: {},
        },
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'personality-context'] },
      }));

      const result = await processConsciousnessContext('Hello', undefined, 'lightweight');

      expect(result.success).toBe(true);
      expect(result.context.operations.performed).toHaveLength(2);
      expect(result.context.operations.performed).toEqual(['message-analysis', 'personality-context']);
      expect(result.executionTrace).toHaveLength(2);

      // Should not have called memory or social cars
      expect(mockMemoryContextCar).not.toHaveBeenCalled();
      expect(mockSocialContextCar).not.toHaveBeenCalled();
    });

    it('should handle railroad execution failures', async () => {
      mockMessageAnalysisCar.mockRejectedValue(new Error('Message analysis failed'));

      const result = await processConsciousnessContext('Test message', undefined, 'default');

      expect(result.success).toBe(false);
      expect(result.context.errors).toHaveLength(1);
      expect(result.context.errors[0].message).toBe('Message analysis failed');
    });

    it('should handle partial failures in non-required cars', async () => {
      mockMessageAnalysisCar.mockImplementation(async ctx => ({
        ...ctx,
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['andy'],
          emotional_context: 'friendly',
          requires_memory: true,
          requires_social: true,
          requires_insight_storage: false,
        },
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'message-analysis'] },
      }));

      mockSessionContextCar.mockRejectedValue(new Error('Session service down'));

      mockMemoryContextCar.mockImplementation(async ctx => ({
        ...ctx,
        memoryContext: {
          relevantMemories: [],
          totalMemories: 0,
          recentActivity: [],
        },
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'memory-context'] },
      }));

      mockSocialContextCar.mockImplementation(async ctx => ({
        ...ctx,
        socialContext: {
          activeRelationships: [],
          recentInteractions: [],
          entityMentioned: 'andy',
          relationshipDynamics: {},
        },
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'social-context'] },
      }));

      mockPersonalityContextCar.mockImplementation(async ctx => ({
        ...ctx,
        personalityContext: {
          vocabularyPreferences: {},
          learningPatterns: {},
          communicationStyle: 'casual_friendly',
          currentPersonalityState: {},
        },
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'personality-context'] },
      }));

      const result = await processConsciousnessContext('Hi Andy!', undefined, 'social-focused');

      expect(result.success).toBe(true); // Overall success despite session failure
      expect(result.context.errors).toHaveLength(1);
      expect(result.context.operations.performed).toContain('message-analysis');
      expect(result.context.operations.performed).toContain('social-context');
      expect(result.context.operations.performed).toContain('personality-context');
      expect(result.context.operations.performed).not.toContain('session-context');
    });
  });

  describe('Extract Response Context', () => {
    it('should extract comprehensive response context', () => {
      const mockResult: RailroadResult = {
        success: true,
        context: {
          message: 'Test question about consciousness',
          timestamp: new Date(),
          analysis: {
            intent: 'learning',
            operations: ['reflection', 'knowledge_seeking'],
            entities_mentioned: ['andy'],
            emotional_context: 'curious_engaged',
            requires_memory: true,
            requires_social: true,
            requires_insight_storage: true,
          },
          sessionContext: {
            sessionId: 'test-session',
            currentState: { mode: 'curious' },
            duration: 450,
            cognitiveLoad: 0.7,
            attentionFocus: 'deep_learning',
            mode: 'curious',
            awarenessLevel: 'heightened',
          },
          personalityContext: {
            vocabularyPreferences: {},
            learningPatterns: {},
            communicationStyle: 'thoughtful_exploratory',
            currentPersonalityState: {
              mode: 'curious',
              engagement: 'high',
              formality: 'balanced',
            },
          },
          memoryContext: {
            relevantMemories: [
              { id: 'mem-1', key: 'consciousness-research', content: {}, tags: [] },
              { id: 'mem-2', key: 'andy-discussions', content: {}, tags: [] },
            ],
            totalMemories: 15,
            recentActivity: [],
          },
          socialContext: {
            activeRelationships: [{ entity: { name: 'andy' } }],
            recentInteractions: [],
            entityMentioned: 'andy',
            relationshipDynamics: {},
          },
          operations: {
            performed: [
              'message-analysis',
              'session-context',
              'memory-context',
              'social-context',
              'personality-context',
            ],
            insights_generated: [],
            memories_accessed: ['consciousness-research'],
            social_interactions: ['andy-interaction'],
            consciousness_updates: {},
          },
          errors: [],
        },
        executionTrace: [],
        totalExecutionTime: 150,
      };

      const responseContext = extractResponseContext(mockResult);

      expect(responseContext).toContain('Intent: learning');
      expect(responseContext).toContain('Operations: reflection, knowledge_seeking');
      expect(responseContext).toContain('Emotional context: curious_engaged');
      expect(responseContext).toContain('Entities: andy');
      expect(responseContext).toContain('Session mode: curious');
      expect(responseContext).toContain('Cognitive load: 0.7');
      expect(responseContext).toContain('Personality: curious mode, high engagement');
      expect(responseContext).toContain('Communication style: thoughtful_exploratory');
      expect(responseContext).toContain('Relevant memories: 2 found');
      expect(responseContext).toContain('Active relationship context available');
      expect(responseContext).toContain(
        'Operations completed: message-analysis, session-context, memory-context, social-context, personality-context'
      );
    });

    it('should handle minimal context gracefully', () => {
      const mockResult: RailroadResult = {
        success: true,
        context: {
          message: 'Hi',
          timestamp: new Date(),
          operations: {
            performed: ['message-analysis'],
            insights_generated: [],
            memories_accessed: [],
            social_interactions: [],
            consciousness_updates: {},
          },
          errors: [],
        },
        executionTrace: [],
        totalExecutionTime: 50,
      };

      const responseContext = extractResponseContext(mockResult);

      expect(responseContext).toContain('Operations completed: message-analysis');
      expect(responseContext).not.toContain('Intent:');
      expect(responseContext).not.toContain('Session mode:');
    });

    it('should include error information when present', () => {
      const mockResult: RailroadResult = {
        success: true,
        context: {
          message: 'Test message',
          timestamp: new Date(),
          operations: {
            performed: ['message-analysis'],
            insights_generated: [],
            memories_accessed: [],
            social_interactions: [],
            consciousness_updates: {},
          },
          errors: [
            { car: 'session-context', message: 'Service temporarily unavailable', stack: 'stack trace' },
            { car: 'memory-context', message: 'Cache miss', stack: 'stack trace' },
          ],
        },
        executionTrace: [],
        totalExecutionTime: 100,
      };

      const responseContext = extractResponseContext(mockResult);

      expect(responseContext).toContain('Processing notes: 2 non-critical services experienced temporary issues');
    });
  });

  describe('Get Personality Context', () => {
    it('should extract comprehensive personality context', () => {
      const mockResult: RailroadResult = {
        success: true,
        context: {
          message: 'Test message',
          timestamp: new Date(),
          personalityContext: {
            vocabularyPreferences: {
              priorityLevels: ['whisper', 'gentle_nudge', 'urgent_pulse'],
            },
            learningPatterns: {},
            communicationStyle: 'technical_precise',
            currentPersonalityState: {
              confidence: 0.92,
            },
          },
          socialContext: {
            activeRelationships: [],
            recentInteractions: [],
            entityMentioned: 'andy',
            relationshipDynamics: {},
          },
          memoryContext: {
            relevantMemories: [{ id: 'mem-1', key: 'test', content: {}, tags: [] }],
            totalMemories: 5,
            recentActivity: [],
          },
          operations: {
            performed: [],
            insights_generated: [],
            memories_accessed: [],
            social_interactions: [],
            consciousness_updates: {},
          },
          errors: [],
        },
        executionTrace: [],
        totalExecutionTime: 100,
      };

      const personalityContext = getPersonalityContext(mockResult);

      expect(personalityContext.vocabularyStyle).toBe('thoughtful'); // gentle_nudge -> thoughtful
      expect(personalityContext.communicationTone).toBe('technical_precise');
      expect(personalityContext.confidenceLevel).toBe(0.92);
      expect(personalityContext.relationshipContext).toBe('Active relationship with andy');
      expect(personalityContext.memoryContext).toBe('1 relevant memories');
    });

    it('should handle missing personality context with defaults', () => {
      const mockResult: RailroadResult = {
        success: true,
        context: {
          message: 'Test message',
          timestamp: new Date(),
          operations: {
            performed: [],
            insights_generated: [],
            memories_accessed: [],
            social_interactions: [],
            consciousness_updates: {},
          },
          errors: [],
        },
        executionTrace: [],
        totalExecutionTime: 50,
      };

      const personalityContext = getPersonalityContext(mockResult);

      expect(personalityContext.vocabularyStyle).toBe('balanced');
      expect(personalityContext.communicationTone).toBe('adaptive');
      expect(personalityContext.confidenceLevel).toBe(0.8);
      expect(personalityContext.relationshipContext).toBeUndefined();
      expect(personalityContext.memoryContext).toBeUndefined();
    });

    it('should handle edge cases in memory and social context', () => {
      const mockResult: RailroadResult = {
        success: true,
        context: {
          message: 'Test message',
          timestamp: new Date(),
          memoryContext: {
            relevantMemories: [],
            totalMemories: 0,
            recentActivity: [],
          },
          socialContext: {
            activeRelationships: [],
            recentInteractions: [],
            entityMentioned: undefined,
            relationshipDynamics: undefined,
          },
          operations: {
            performed: [],
            insights_generated: [],
            memories_accessed: [],
            social_interactions: [],
            consciousness_updates: {},
          },
          errors: [],
        },
        executionTrace: [],
        totalExecutionTime: 25,
      };

      const personalityContext = getPersonalityContext(mockResult);

      expect(personalityContext.relationshipContext).toBeUndefined();
      expect(personalityContext.memoryContext).toBeUndefined();
    });
  });

  describe('Railroad Type Selection', () => {
    it('should default to default railroad for unknown types', async () => {
      mockMessageAnalysisCar.mockImplementation(async ctx => ({
        ...ctx,
        operations: { ...ctx.operations, performed: [...ctx.operations.performed, 'message-analysis'] },
      }));

      const result = await processConsciousnessContext('Test message', undefined, 'unknown-type' as any);

      // Should have used default railroad (5 cars)
      expect(mockMessageAnalysisCar).toHaveBeenCalled();
      expect(mockSessionContextCar).toHaveBeenCalled();
      expect(mockMemoryContextCar).toHaveBeenCalled();
      expect(mockSocialContextCar).toHaveBeenCalled();
      expect(mockPersonalityContextCar).toHaveBeenCalled();
    });
  });
});
