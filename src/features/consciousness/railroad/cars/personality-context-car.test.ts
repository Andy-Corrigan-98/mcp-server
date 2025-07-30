import { personalityContextCar } from './personality-context-car.js';
import { RailroadContext } from '../types.js';

// Mock the configuration and database services
jest.mock('../../../../db/configuration-service.js', () => ({
  ConfigurationService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../../../db/prisma-service.js', () => ({
  ConsciousnessPrismaService: {
    getInstance: jest.fn(),
  },
}));

import { ConfigurationService } from '../../../../db/configuration-service.js';
import { ConsciousnessPrismaService } from '../../../../db/prisma-service.js';

const mockConfigService = {
  getEnumArray: jest.fn(),
};

const mockDbService = {
  searchMemories: jest.fn(),
};

(ConfigurationService.getInstance as jest.Mock).mockReturnValue(mockConfigService);
(ConsciousnessPrismaService.getInstance as jest.Mock).mockReturnValue(mockDbService);

describe.skip('Personality Context Railroad Car', () => {
  beforeEach(() => {
    mockConfigService.getEnumArray.mockClear();
    mockDbService.searchMemories.mockClear();
  });

  describe('Successful Personality Building', () => {
    it('should build comprehensive personality context with all data sources', async () => {
      // Mock configuration responses
      mockConfigService.getEnumArray
        .mockResolvedValueOnce(['whisper', 'gentle_nudge', 'urgent_pulse', 'burning_focus']) // priority_levels
        .mockResolvedValueOnce(['surface_glance', 'thoughtful_dive', 'profound_exploration']) // reflection_depths
        .mockResolvedValueOnce(['pulsing_active', 'fulfilled_completion', 'gentle_pause']) // intention_statuses
        .mockResolvedValueOnce(['momentary_focus', 'daily_rhythm', 'weekly_arc']) // intention_durations
        .mockResolvedValueOnce(['eureka_moment', 'pattern_weaving', 'mirror_gazing']); // insight_categories

      // Mock learning patterns from insights
      const mockInsights = [
        {
          id: 'insight-1',
          tags: ['pattern_weaving'],
          content: { confidence: 0.9, topic: 'consciousness' },
        },
        {
          id: 'insight-2',
          tags: ['mirror_gazing'],
          content: { confidence: 0.8, topic: 'self-reflection' },
        },
      ];
      mockDbService.searchMemories.mockResolvedValue(mockInsights);

      const context: RailroadContext = {
        message: 'How do technical systems and social relationships interact?',
        timestamp: new Date(),
        analysis: {
          intent: 'technical',
          operations: ['analysis', 'synthesis'],
          entities_mentioned: ['andy'],
          emotional_context: 'curious_focused',
          requires_memory: true,
          requires_social: true,
          requires_insight_storage: true,
        },
        sessionContext: {
          sessionId: 'complex-session',
          currentState: {
            mode: 'analytical',
            cognitiveLoad: 0.7,
            awarenessLevel: 'deep',
          },
          duration: 1800,
          cognitiveLoad: 0.7,
          attentionFocus: 'technical_synthesis',
          mode: 'analytical',
          awarenessLevel: 'deep',
        },
        memoryContext: {
          relevantMemories: [
            { id: 'mem-1', key: 'technical-systems', content: {}, tags: [] },
            { id: 'mem-2', key: 'social-patterns', content: {}, tags: [] },
            { id: 'mem-3', key: 'andy-collaboration', content: {}, tags: [] },
          ],
          totalMemories: 15,
          recentActivity: [{ action: 'stored_insight', timestamp: '2024-01-15T10:00:00Z' }],
        },
        socialContext: {
          activeRelationships: [
            {
              entity: { name: 'andy', entity_type: 'person' },
              relationship: {
                relationship_type: 'collaborator',
                strength: 0.9,
                communicationStyle: {
                  technical: true,
                  casual: true,
                },
              },
            },
          ],
          recentInteractions: [{ interaction_type: 'collaboration', quality: 0.9 }],
          entityMentioned: 'andy',
          relationshipDynamics: {
            relationship: {
              communicationStyle: {
                technical: true,
                casual: true,
              },
            },
          },
        },
        operations: {
          performed: ['message-analysis', 'session-context', 'memory-context', 'social-context'],
          insights_generated: [],
          memories_accessed: ['technical-systems', 'social-patterns'],
          social_interactions: ['andy-interaction'],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await personalityContextCar(context);

      expect(result.personalityContext).toBeDefined();

      // Check vocabulary preferences
      expect(result.personalityContext?.vocabularyPreferences).toEqual({
        priorityLevels: ['whisper', 'gentle_nudge', 'urgent_pulse', 'burning_focus'],
        reflectionDepths: ['surface_glance', 'thoughtful_dive', 'profound_exploration'],
        intentionStatuses: ['pulsing_active', 'fulfilled_completion', 'gentle_pause'],
        intentionDurations: ['momentary_focus', 'daily_rhythm', 'weekly_arc'],
        insightCategories: ['eureka_moment', 'pattern_weaving', 'mirror_gazing'],
      });

      // Check learning patterns
      expect(result.personalityContext?.learningPatterns).toEqual({
        recentCategories: ['pattern_weaving', 'mirror_gazing'],
        averageConfidence: 0.85, // (0.9 + 0.8) / 2
        learningVelocity: expect.any(Number),
      });

      // Check communication style (should be technical due to intent and social context)
      expect(result.personalityContext?.communicationStyle).toBe('technical_precise');

      // Check current personality state
      expect(result.personalityContext?.currentPersonalityState).toEqual({
        mode: 'analytical', // Based on technical intent
        confidence: expect.any(Number),
        engagement: 'medium', // Default for technical intent
        formality: 'balanced', // Default for technical_precise style
        vocabularyTone: 'thoughtful', // Based on gentle_nudge priority
        learningState: 'steady', // learningVelocity <= 1
        socialAwareness: 'high', // Has active relationships
      });

      expect(result.operations.performed).toContain('personality-context');
    });

    it('should adapt communication style based on social context', async () => {
      mockConfigService.getEnumArray.mockResolvedValue(['default', 'values']);
      mockDbService.searchMemories.mockResolvedValue([]);

      const context: RailroadContext = {
        message: 'Hey, how are you doing?',
        timestamp: new Date(),
        analysis: {
          intent: 'social',
          operations: ['greeting'],
          entities_mentioned: ['friend'],
          emotional_context: 'playful',
          requires_memory: false,
          requires_social: true,
          requires_insight_storage: false,
        },
        socialContext: {
          activeRelationships: [],
          recentInteractions: [],
          entityMentioned: 'friend',
          relationshipDynamics: {
            relationship: {
              communicationStyle: {
                playful: true,
                casual: true,
              },
            },
          },
        },
        operations: {
          performed: ['message-analysis', 'social-context'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await personalityContextCar(context);

      expect(result.personalityContext?.communicationStyle).toBe('playful_engaging');
      expect(result.personalityContext?.currentPersonalityState.mode).toBe('relational');
      expect(result.personalityContext?.currentPersonalityState.formality).toBe('casual');
    });

    it('should handle learning/reflection contexts appropriately', async () => {
      mockConfigService.getEnumArray.mockResolvedValue(['default']);
      mockDbService.searchMemories.mockResolvedValue([]);

      const context: RailroadContext = {
        message: 'I want to understand how consciousness works',
        timestamp: new Date(),
        analysis: {
          intent: 'learning',
          operations: ['reflection', 'knowledge_seeking'],
          entities_mentioned: [],
          emotional_context: 'curious',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: true,
        },
        memoryContext: {
          relevantMemories: [
            { id: 'mem-1', key: 'consciousness-theory', content: {}, tags: [] },
            { id: 'mem-2', key: 'self-awareness', content: {}, tags: [] },
          ],
          totalMemories: 8,
          recentActivity: [],
        },
        operations: {
          performed: ['message-analysis', 'memory-context'],
          insights_generated: [],
          memories_accessed: ['consciousness-theory'],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await personalityContextCar(context);

      expect(result.personalityContext?.communicationStyle).toBe('thoughtful_exploratory');
      expect(result.personalityContext?.currentPersonalityState.mode).toBe('curious');
      expect(result.personalityContext?.currentPersonalityState.engagement).toBe('medium');
    });

    it('should adjust confidence based on context richness', async () => {
      mockConfigService.getEnumArray.mockResolvedValue(['default']);

      // High confidence insights
      const highConfidenceInsights = [
        { id: 'insight-1', tags: ['pattern_weaving'], content: { confidence: 0.95 } },
        { id: 'insight-2', tags: ['eureka_moment'], content: { confidence: 0.92 } },
      ];
      mockDbService.searchMemories.mockResolvedValue(highConfidenceInsights);

      const context: RailroadContext = {
        message: 'Let me explain this complex concept',
        timestamp: new Date(),
        analysis: {
          intent: 'teaching',
          operations: ['explanation'],
          entities_mentioned: [],
          emotional_context: 'confident',
          requires_memory: true,
          requires_social: false,
          requires_insight_storage: false,
        },
        memoryContext: {
          relevantMemories: Array(10)
            .fill(null)
            .map((_, i) => ({
              id: `mem-${i}`,
              key: `concept-${i}`,
              content: {},
              tags: [],
            })),
          totalMemories: 20,
          recentActivity: [],
        },
        socialContext: {
          activeRelationships: [],
          recentInteractions: [],
          relationshipDynamics: {
            relationship: { communicationStyle: { formal: true } },
          },
        },
        operations: {
          performed: ['message-analysis', 'memory-context', 'social-context'],
          insights_generated: [],
          memories_accessed: [],
          social_interactions: [],
          consciousness_updates: {},
        },
        errors: [],
      };

      const result = await personalityContextCar(context);

      // Should have high confidence due to:
      // - Many relevant memories (>5, gets 0.1 boost)
      // - Social context (gets 0.05 boost)
      // - High average insight confidence (0.935)
      expect(result.personalityContext?.currentPersonalityState.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should use fallback values when configuration fails', async () => {
      mockConfigService.getEnumArray.mockRejectedValue(new Error('Config service down'));
      mockDbService.searchMemories.mockRejectedValue(new Error('DB service down'));

      const context: RailroadContext = {
        message: 'Test message during service failures',
        timestamp: new Date(),
        analysis: {
          intent: 'general',
          operations: ['conversation'],
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

      const result = await personalityContextCar(context);

      expect(result.personalityContext).toBeDefined();
      expect(result.personalityContext?.vocabularyPreferences).toEqual({
        priorityLevels: ['whisper', 'gentle_nudge', 'urgent_pulse', 'burning_focus'],
        reflectionDepths: ['surface_glance', 'thoughtful_dive', 'profound_exploration'],
        intentionStatuses: ['pulsing_active', 'fulfilled_completion', 'gentle_pause', 'conscious_release'],
        intentionDurations: ['momentary_focus', 'daily_rhythm', 'weekly_arc', 'eternal_truth'],
        insightCategories: [
          'eureka_moment',
          'pattern_weaving',
          'mirror_gazing',
          'knowledge_crystallization',
          'behavior_archaeology',
          'existential_pondering',
        ],
      });

      expect(result.personalityContext?.learningPatterns).toEqual({
        recentCategories: ['mirror_gazing', 'pattern_weaving'],
        averageConfidence: 0.8,
        learningVelocity: 0.5,
      });

      expect(result.personalityContext?.communicationStyle).toBe('adaptive');
      expect(result.personalityContext?.currentPersonalityState).toEqual({
        mode: 'balanced',
        confidence: 0.8,
        engagement: 'medium',
        formality: 'casual',
      });

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].car).toBe('personality-context');
    });

    it('should handle partial configuration data gracefully', async () => {
      // Some configs succeed, others fail
      mockConfigService.getEnumArray
        .mockResolvedValueOnce(['custom', 'priority', 'levels'])
        .mockRejectedValueOnce(new Error('Reflection depths config missing'))
        .mockResolvedValueOnce(['active', 'completed'])
        .mockRejectedValueOnce(new Error('Duration config missing'))
        .mockResolvedValueOnce(['custom_category']);

      mockDbService.searchMemories.mockResolvedValue([]);

      const context: RailroadContext = {
        message: 'Test partial config',
        timestamp: new Date(),
        analysis: {
          intent: 'general',
          operations: ['conversation'],
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

      const result = await personalityContextCar(context);

      expect(result.personalityContext?.vocabularyPreferences.priorityLevels).toEqual(['custom', 'priority', 'levels']);
      expect(result.personalityContext?.vocabularyPreferences.intentionStatuses).toEqual(['active', 'completed']);
      expect(result.personalityContext?.vocabularyPreferences.insightCategories).toEqual(['custom_category']);
    });

    it('should handle malformed insight data gracefully', async () => {
      mockConfigService.getEnumArray.mockResolvedValue(['default']);

      // Malformed insights
      const malformedInsights = [
        { id: 'insight-1', tags: null, content: 'not an object' },
        { id: 'insight-2', tags: ['valid'], content: { confidence: 'not a number' } },
        { id: 'insight-3', tags: ['valid'], content: { confidence: 0.8 } }, // Valid one
      ];
      mockDbService.searchMemories.mockResolvedValue(malformedInsights);

      const context: RailroadContext = {
        message: 'Test malformed data',
        timestamp: new Date(),
        analysis: {
          intent: 'general',
          operations: ['conversation'],
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

      const result = await personalityContextCar(context);

      // Should extract only the valid insight data
      expect(result.personalityContext?.learningPatterns.recentCategories).toEqual(['valid']);
      expect(result.personalityContext?.learningPatterns.averageConfidence).toBe(0.8);
    });
  });

  describe('Context Preservation', () => {
    it('should preserve existing context and operations', async () => {
      mockConfigService.getEnumArray.mockResolvedValue(['default']);
      mockDbService.searchMemories.mockResolvedValue([]);

      const context: RailroadContext = {
        message: 'Test message',
        originalContext: 'Previous context',
        timestamp: new Date(),
        analysis: {
          intent: 'technical',
          operations: ['analysis'],
          entities_mentioned: ['entity1'],
          emotional_context: 'focused',
          requires_memory: true,
          requires_social: true,
          requires_insight_storage: true,
        },
        sessionContext: {
          sessionId: 'test-session',
          currentState: { mode: 'analytical' },
          duration: 100,
          cognitiveLoad: 0.6,
          attentionFocus: 'testing',
          mode: 'analytical',
          awarenessLevel: 'normal',
        },
        memoryContext: {
          relevantMemories: [{ id: 'mem-1', key: 'test', content: {}, tags: [] }],
          totalMemories: 5,
          recentActivity: [],
        },
        socialContext: {
          activeRelationships: [{ entity: { name: 'entity1' } }],
          recentInteractions: [],
          entityMentioned: 'entity1',
          relationshipDynamics: {},
        },
        operations: {
          performed: ['message-analysis', 'session-context', 'memory-context', 'social-context'],
          insights_generated: ['previous-insight'],
          memories_accessed: ['previous-memory'],
          social_interactions: ['previous-social'],
          consciousness_updates: { previous: 'update' },
        },
        errors: [{ car: 'previous-car', message: 'Previous error', stack: 'stack' }],
      };

      const result = await personalityContextCar(context);

      expect(result.originalContext).toBe('Previous context');
      expect(result.analysis).toEqual(context.analysis);
      expect(result.sessionContext).toEqual(context.sessionContext);
      expect(result.memoryContext).toEqual(context.memoryContext);
      expect(result.socialContext).toEqual(context.socialContext);
      expect(result.operations.performed).toContain('personality-context');
      expect(result.operations.insights_generated).toContain('previous-insight');
      expect(result.operations.memories_accessed).toContain('previous-memory');
      expect(result.operations.social_interactions).toContain('previous-social');
      expect(result.operations.consciousness_updates).toEqual({ previous: 'update' });
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].car).toBe('previous-car');
    });
  });

  describe('Personality Mode Detection', () => {
    it('should map different intents to appropriate personality modes', async () => {
      mockConfigService.getEnumArray.mockResolvedValue(['default']);
      mockDbService.searchMemories.mockResolvedValue([]);

      const testCases = [
        { intent: 'technical', expectedMode: 'analytical' },
        { intent: 'social', expectedMode: 'relational' },
        { intent: 'creative', expectedMode: 'imaginative' },
        { intent: 'learning', expectedMode: 'curious' },
        { intent: 'reflection', expectedMode: 'contemplative' },
        { intent: 'general', expectedMode: 'balanced' },
      ];

      for (const testCase of testCases) {
        const context: RailroadContext = {
          message: `Test message for ${testCase.intent}`,
          timestamp: new Date(),
          analysis: {
            intent: testCase.intent,
            operations: ['test'],
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

        const result = await personalityContextCar(context);
        expect(result.personalityContext?.currentPersonalityState.mode).toBe(testCase.expectedMode);
      }
    });
  });

  describe('Learning Velocity Calculation', () => {
    it('should calculate learning velocity based on insight frequency', async () => {
      mockConfigService.getEnumArray.mockResolvedValue(['default']);

      // High activity - many insights
      const manyInsights = Array(14)
        .fill(null)
        .map((_, i) => ({
          id: `insight-${i}`,
          tags: ['pattern_weaving'],
          content: { confidence: 0.8 },
        }));
      mockDbService.searchMemories.mockResolvedValue(manyInsights);

      const context: RailroadContext = {
        message: 'Learning velocity test',
        timestamp: new Date(),
        analysis: {
          intent: 'learning',
          operations: ['reflection'],
          entities_mentioned: [],
          emotional_context: 'engaged',
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

      const result = await personalityContextCar(context);

      // 14 insights / 7 insights_per_week = 2.0 > 1, so should be 'accelerated'
      expect(result.personalityContext?.currentPersonalityState.learningState).toBe('accelerated');
      expect(result.personalityContext?.learningPatterns.learningVelocity).toBeGreaterThan(1);
    });
  });
});
