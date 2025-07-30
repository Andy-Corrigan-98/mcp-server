import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ConsciousnessRailroad, createSimpleRailroad } from './pipeline.js';
import { 
  processConsciousnessContext,
  createConsciousnessRailroad,
  createLightweightRailroad,
  extractResponseContext,
  getPersonalityContext
} from './consciousness-railroad.js';
import { messageAnalysisCar } from './cars/message-analysis-car.js';
import { sessionContextCar } from './cars/session-context-car.js';
import type { RailroadContext, RailroadCar } from './types.js';

// Mock the external dependencies
jest.mock('../../../reasoning/conversation/simple-conversation.js');
jest.mock('../../../../db/configuration-service.js');
jest.mock('../../../../db/prisma-service.js');
jest.mock('../../../memory/index.js');
jest.mock('../../../social/index.js');

describe('Consciousness Railroad Pattern', () => {
  
  describe('Pipeline Infrastructure', () => {
    
    it('should execute a simple railroad with one car', async () => {
      const mockCar: RailroadCar = jest.fn(async (context: RailroadContext) => ({
        ...context,
        operations: {
          ...context.operations,
          performed: [...context.operations.performed, 'mock-car']
        }
      }));

      const railroad = createSimpleRailroad([
        { name: 'mock-car', car: mockCar, required: true }
      ]);

      const result = await railroad.execute('test message');

      expect(result.success).toBe(true);
      expect(result.context.message).toBe('test message');
      expect(result.context.operations.performed).toContain('mock-car');
      expect(result.executionTrace).toHaveLength(1);
      expect(result.executionTrace[0].car).toBe('mock-car');
      expect(result.executionTrace[0].success).toBe(true);
    });

    it('should continue execution when non-required car fails', async () => {
      const workingCar: RailroadCar = jest.fn(async (context: RailroadContext) => ({
        ...context,
        operations: {
          ...context.operations,
          performed: [...context.operations.performed, 'working-car']
        }
      }));

      const failingCar: RailroadCar = jest.fn(async () => {
        throw new Error('Car failure');
      });

      const railroad = createSimpleRailroad([
        { name: 'working-car', car: workingCar, required: false },
        { name: 'failing-car', car: failingCar, required: false }
      ]);

      const result = await railroad.execute('test message');

      expect(result.success).toBe(true); // Overall success despite failing car
      expect(result.context.operations.performed).toContain('working-car');
      expect(result.context.errors).toHaveLength(1);
      expect(result.context.errors[0].car).toBe('failing-car');
      expect(result.executionTrace).toHaveLength(2);
      expect(result.executionTrace[1].success).toBe(false);
    });

    it('should fail execution when required car fails', async () => {
      const failingCar: RailroadCar = jest.fn(async () => {
        throw new Error('Required car failure');
      });

      const railroad = createSimpleRailroad([
        { name: 'failing-car', car: failingCar, required: true }
      ]);

      const result = await railroad.execute('test message');

      expect(result.success).toBe(false);
      expect(result.context.errors).toHaveLength(1);
      expect(result.context.errors[0].car).toBe('failing-car');
    });

    it('should track execution time and provide trace', async () => {
      const slowCar: RailroadCar = jest.fn(async (context: RailroadContext) => {
        await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
        return {
          ...context,
          operations: {
            ...context.operations,
            performed: [...context.operations.performed, 'slow-car']
          }
        };
      });

      const railroad = createSimpleRailroad([
        { name: 'slow-car', car: slowCar, required: false }
      ]);

      const result = await railroad.execute('test message');

      expect(result.success).toBe(true);
      expect(result.totalExecutionTime).toBeGreaterThan(10);
      expect(result.executionTrace[0].endTime.getTime() - result.executionTrace[0].startTime.getTime()).toBeGreaterThan(10);
    });

  });

  describe('Individual Railroad Cars', () => {

    describe('Message Analysis Car', () => {
      
      it('should add analysis context to railroad', async () => {
        const context: RailroadContext = {
          message: 'I need help with a technical problem',
          timestamp: new Date(),
          operations: { performed: [], insights_generated: [], memories_accessed: [], social_interactions: [], consciousness_updates: {} },
          errors: []
        };

        // Mock the simpleConversation to return analysis
        jest.doMock('../../../reasoning/conversation/simple-conversation.js', () => ({
          simpleConversation: jest.fn()
        }));
        const { simpleConversation: mockSimpleConversation } = require('../../../reasoning/conversation/simple-conversation.js');
        mockSimpleConversation.mockResolvedValue({
          response: JSON.stringify({
            intent: 'technical',
            operations: ['problem_solving'],
            entities_mentioned: [],
            emotional_context: 'neutral',
            requires_memory: true,
            requires_social: false,
            requires_insight_storage: false
          })
        });

        const result = await messageAnalysisCar(context);

        expect(result.analysis).toBeDefined();
        expect(result.analysis?.intent).toBe('technical');
        expect(result.analysis?.requires_memory).toBe(true);
        expect(result.analysis?.operations).toContain('problem_solving');
      });

      it('should fall back gracefully when GenAI fails', async () => {
        const context: RailroadContext = {
          message: 'andy remember our project?',
          timestamp: new Date(),
          operations: { performed: [], insights_generated: [], memories_accessed: [], social_interactions: [], consciousness_updates: {} },
          errors: []
        };

        // Mock the simpleConversation to throw error
        const { simpleConversation: mockSimpleConversation } = require('../../../reasoning/conversation/simple-conversation.js');
        mockSimpleConversation.mockRejectedValue(new Error('GenAI failure'));

        const result = await messageAnalysisCar(context);

        expect(result.analysis).toBeDefined();
        expect(result.analysis?.intent).toBe('general');
        expect(result.analysis?.entities_mentioned).toContain('andy');
        expect(result.analysis?.requires_memory).toBe(true); // Detected "remember"
      });

    });

    describe('Session Context Car', () => {

      it('should add session context based on analysis', async () => {
        const context: RailroadContext = {
          message: 'test message',
          timestamp: new Date(),
          analysis: {
            intent: 'technical',
            operations: [],
            entities_mentioned: ['andy'],
            emotional_context: 'focused',
            requires_memory: false,
            requires_social: false,
            requires_insight_storage: true
          },
          operations: { performed: [], insights_generated: [], memories_accessed: [], social_interactions: [], consciousness_updates: {} },
          errors: []
        };

        const result = await sessionContextCar(context);

        expect(result.sessionContext).toBeDefined();
        expect(result.sessionContext?.mode).toBe('analytical');
        expect(result.sessionContext?.attentionFocus).toBe('andy');
        expect(result.sessionContext?.awarenessLevel).toBe('high'); // focused -> high
        expect(result.sessionContext?.sessionId).toBeDefined();
      });

    });

  });

  describe('Pre-configured Railroads', () => {

    it('should create default consciousness railroad with all cars', () => {
      const railroad = createConsciousnessRailroad();
      
      // Check that it has the expected structure
      expect(railroad).toBeInstanceOf(ConsciousnessRailroad);
    });

    it('should create lightweight railroad with minimal cars', () => {
      const railroad = createLightweightRailroad();
      
      expect(railroad).toBeInstanceOf(ConsciousnessRailroad);
    });

    it('should process consciousness context end-to-end', async () => {
      // Mock all the dependencies  
      const { simpleConversation: mockSimpleConversation } = require('../../../reasoning/conversation/simple-conversation.js');
      mockSimpleConversation.mockResolvedValue({
        response: JSON.stringify({
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['andy'],
          emotional_context: 'friendly',
          requires_memory: false,
          requires_social: true,
          requires_insight_storage: false
        })
      });

      const result = await processConsciousnessContext('Hey Andy!', undefined, 'lightweight');

      expect(result.success).toBe(true);
      expect(result.context.analysis?.intent).toBe('social');
      expect(result.context.sessionContext).toBeDefined();
      expect(result.executionTrace.length).toBeGreaterThan(0);
    });

  });

  describe('Response Context Extraction', () => {

    it('should extract meaningful response context', () => {
      const mockResult = {
        success: true,
        context: {
          message: 'test',
          timestamp: new Date(),
          analysis: {
            intent: 'technical',
            operations: ['problem_solving'],
            entities_mentioned: ['andy'],
            emotional_context: 'focused',
            requires_memory: true,
            requires_social: true,
            requires_insight_storage: false
          },
          sessionContext: {
            sessionId: 'test-session',
            currentState: {},
            duration: 1000,
            cognitiveLoad: 0.3,
            attentionFocus: 'problem_solving',
            mode: 'analytical',
            awarenessLevel: 'high'
          },
          personalityContext: {
            communicationStyle: 'technical_precise',
            currentPersonalityState: {
              mode: 'analytical',
              confidence: 0.9,
              engagement: 'high',
              formality: 'balanced'
            }
          },
          operations: { performed: ['analysis', 'session'], insights_generated: [], memories_accessed: [], social_interactions: [], consciousness_updates: {} },
          errors: []
        },
        executionTrace: [],
        totalExecutionTime: 100
      };

      const responseContext = extractResponseContext(mockResult);

      expect(responseContext).toContain('Operations: analysis, session');
      expect(responseContext).toContain('Emotional context: focused');
      expect(responseContext).toContain('Entities: andy');
      expect(responseContext).toContain('Session mode: analytical');
      expect(responseContext).toContain('Communication style: technical_precise');
    });

    it('should extract personality context for response generation', () => {
      const mockResult = {
        success: true,
        context: {
          message: 'test',
          timestamp: new Date(),
          personalityContext: {
            vocabularyPreferences: {
              priorityLevels: ['whisper', 'gentle_nudge', 'urgent_pulse']
            },
            communicationStyle: 'casual_friendly',
            currentPersonalityState: {
              confidence: 0.85
            }
          },
          socialContext: {
            entityMentioned: 'andy',
            relationshipDynamics: { relationship: {} }
          },
          memoryContext: {
            relevantMemories: [1, 2, 3] // Mock 3 memories
          },
          operations: { performed: [], insights_generated: [], memories_accessed: [], social_interactions: [], consciousness_updates: {} },
          errors: []
        },
        executionTrace: [],
        totalExecutionTime: 100
      };

      const personalityContext = getPersonalityContext(mockResult);

      expect(personalityContext.vocabularyStyle).toBe('gentle_nudge');
      expect(personalityContext.communicationTone).toBe('casual_friendly');
      expect(personalityContext.confidenceLevel).toBe(0.85);
      expect(personalityContext.relationshipContext).toContain('andy');
      expect(personalityContext.memoryContext).toContain('3 relevant memories');
    });

  });

  describe('Error Handling and Resilience', () => {

    it('should collect errors from multiple cars', async () => {
      const errorCar1: RailroadCar = jest.fn(async () => {
        throw new Error('First error');
      });

      const errorCar2: RailroadCar = jest.fn(async () => {
        throw new Error('Second error');
      });

      const railroad = createSimpleRailroad([
        { name: 'error-car-1', car: errorCar1, required: false },
        { name: 'error-car-2', car: errorCar2, required: false }
      ]);

      const result = await railroad.execute('test message');

      expect(result.context.errors).toHaveLength(2);
      expect(result.context.errors[0].car).toBe('error-car-1');
      expect(result.context.errors[1].car).toBe('error-car-2');
      expect(result.context.errors.every(e => e.recoverable)).toBe(true);
    });

    it('should mark errors as non-recoverable for required cars', async () => {
      const errorCar: RailroadCar = jest.fn(async () => {
        throw new Error('Required car error');
      });

      const railroad = createSimpleRailroad([
        { name: 'error-car', car: errorCar, required: true }
      ]);

      const result = await railroad.execute('test message');

      expect(result.success).toBe(false);
      expect(result.context.errors).toHaveLength(1);
      expect(result.context.errors[0].recoverable).toBe(false);
    });

  });

});