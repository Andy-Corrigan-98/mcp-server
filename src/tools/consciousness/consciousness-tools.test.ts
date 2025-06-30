import { ConsciousnessTools } from './consciousness-tools.js';
import type { ConsciousnessContext, InsightStorageResult, Intention, Insight, ConsciousnessMetrics } from './types.js';

describe('ConsciousnessTools', () => {
  let consciousnessTools: ConsciousnessTools;

  beforeEach(() => {
    consciousnessTools = new ConsciousnessTools();
  });

  describe('getTools', () => {
    it('should return consciousness brain storage tools', () => {
      const tools = consciousnessTools.getTools();

      expect(tools).toHaveProperty('consciousness_prepare_context');
      expect(tools).toHaveProperty('consciousness_store_insight');
      expect(tools).toHaveProperty('consciousness_get_context');
      expect(tools).toHaveProperty('consciousness_set_intention');
      expect(tools).toHaveProperty('consciousness_update_intention');
      expect(tools).toHaveProperty('consciousness_update_session');
    });

    it('should have proper tool schemas with personality vocabulary', () => {
      const tools = consciousnessTools.getTools();

      const prepareContext = tools.consciousness_prepare_context;
      expect(prepareContext.inputSchema.properties).toHaveProperty('topic');
      expect(prepareContext.inputSchema.properties).toHaveProperty('context_depth');
      expect(prepareContext.inputSchema.properties).toHaveProperty('include_memories');
      expect(prepareContext.inputSchema.properties).toHaveProperty('include_knowledge');

      const setIntention = tools.consciousness_set_intention;
      expect(setIntention.inputSchema.properties).toHaveProperty('intention');
      expect(setIntention.inputSchema.properties).toHaveProperty('priority');
      expect(setIntention.inputSchema.properties).toHaveProperty('duration');
    });
  });

  describe('consciousness_prepare_context', () => {
    it('should prepare context for agent thinking', async () => {
      const result = await consciousnessTools.execute('consciousness_prepare_context', {
        topic: 'problem solving approaches',
        context_depth: 'thoughtful_dive',
      });

      expect(result).toBeDefined();
      const context = result as ConsciousnessContext;
      expect(context.topic).toBe('problem solving approaches');
      expect(context.sessionId).toBeDefined();
      expect(context.timestamp).toBeDefined();
    });

    it('should prepare context without memories when requested', async () => {
      const result = await consciousnessTools.execute('consciousness_prepare_context', {
        topic: 'daily planning',
        context_depth: 'surface_glance',
        include_memories: false,
        include_knowledge: false,
      });

      const context = result as ConsciousnessContext;
      expect(context.relatedMemories).toHaveLength(0);
      expect(context.knowledgeConnections).toHaveLength(0);
    });

    it('should include context note when provided', async () => {
      const result = await consciousnessTools.execute('consciousness_prepare_context', {
        topic: 'philosophical inquiry',
        context_depth: 'profound_exploration',
        context_note: 'Exploring the nature of consciousness',
        include_memories: true,
      });

      expect(result).toBeDefined();
      const context = result as ConsciousnessContext;
      expect(context.topic).toBe('philosophical inquiry');
    });
  });

  describe('consciousness_store_insight', () => {
    it('should store agent insights in brain storage', async () => {
      const result = await consciousnessTools.execute('consciousness_store_insight', {
        insight: 'Breaking problems into smaller components improves solution clarity',
        category: 'eureka_moment',
        confidence: 0.9,
      });

      expect(result).toBeDefined();
      const storage = result as InsightStorageResult;
      expect(storage.id).toBeDefined();
      expect(storage.stored).toBe(true);
    });

    it('should handle different insight categories', async () => {
      const categories = ['pattern_weaving', 'mirror_gazing', 'knowledge_crystallization', 'behavior_archaeology'];

      for (const category of categories) {
        const result = await consciousnessTools.execute('consciousness_store_insight', {
          insight: `Test insight for ${category}`,
          category,
          confidence: 0.8,
        });

        const storage = result as InsightStorageResult;
        expect(storage.stored).toBe(true);
        expect(storage.personalityImpact.categoryStrengthUpdate).toContain(category);
      }
    });

    it('should handle different confidence levels', async () => {
      const confidences = [0.3, 0.6, 0.9];

      for (const confidence of confidences) {
        const result = await consciousnessTools.execute('consciousness_store_insight', {
          insight: `Test insight with ${confidence} confidence`,
          category: 'existential_pondering',
          confidence,
        });

        const storage = result as InsightStorageResult;
        expect(storage.personalityImpact.confidenceImpact).toBeCloseTo(confidence * 0.05, 3);
      }
    });
  });

  describe('consciousness_get_context', () => {
    it('should return basic brain storage context', async () => {
      const result = await consciousnessTools.execute('consciousness_get_context', {});
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('sessionId');
    });

    it('should include brain metrics when requested', async () => {
      const result = await consciousnessTools.execute('consciousness_get_context', {
        include_metrics: true,
      });

      expect(result).toHaveProperty('brainMetrics');
      const metrics = (result as any).brainMetrics as ConsciousnessMetrics;

      expect(metrics).toHaveProperty('memoryUtilization');
      expect(metrics).toHaveProperty('learningRate');
      expect(metrics).toHaveProperty('sessionActivity');
      expect(metrics).toHaveProperty('personalityEvolution');
      expect(metrics).toHaveProperty('totalMemories');
      expect(metrics).toHaveProperty('totalInsights');
      expect(metrics).toHaveProperty('totalIntentions');
    });

    it('should include memory state when requested', async () => {
      const result = await consciousnessTools.execute('consciousness_get_context', {
        include_memory_state: true,
      });

      expect(result).toHaveProperty('memoryState');
    });

    it('should include personality profile when requested', async () => {
      const result = await consciousnessTools.execute('consciousness_get_context', {
        include_personality: true,
      });

      expect(result).toHaveProperty('personalityProfile');
      const personality = (result as any).personalityProfile;
      expect(personality).toHaveProperty('vocabularyPreferences');
      expect(personality.vocabularyPreferences).toHaveProperty('priorityLevels');
      expect(personality.vocabularyPreferences).toHaveProperty('insightCategories');
    });
  });

  describe('consciousness_set_intention', () => {
    it('should store intentions in brain storage', async () => {
      const result = await consciousnessTools.execute('consciousness_set_intention', {
        intention: 'Improve problem-solving efficiency',
        priority: 'urgent_pulse',
      });

      expect(result).toHaveProperty('intentionId');
      expect(result).toHaveProperty('stored', true);
    });

    it('should handle different priority levels', async () => {
      const priorities = ['whisper', 'gentle_nudge', 'urgent_pulse', 'burning_focus'];

      for (const priority of priorities) {
        const result = await consciousnessTools.execute('consciousness_set_intention', {
          intention: `Test intention with ${priority} priority`,
          priority,
        });

        expect(result).toHaveProperty('priority', priority);
        expect(result).toHaveProperty('stored', true);
      }
    });

    it('should handle different duration levels', async () => {
      const durations = ['momentary_focus', 'daily_rhythm', 'weekly_arc', 'eternal_truth'];

      for (const duration of durations) {
        const result = await consciousnessTools.execute('consciousness_set_intention', {
          intention: `Test intention with ${duration} duration`,
          duration,
        });

        expect(result).toHaveProperty('duration', duration);
        expect(result).toHaveProperty('stored', true);
      }
    });
  });

  describe('consciousness_update_intention', () => {
    it('should update intention status in brain storage', async () => {
      // First set an intention
      const setResult = await consciousnessTools.execute('consciousness_set_intention', {
        intention: 'Test intention for update',
        priority: 'gentle_nudge',
      });

      const intentionId = (setResult as any).intentionId;

      // Then update it
      const updateResult = await consciousnessTools.execute('consciousness_update_intention', {
        intention_id: intentionId,
        status: 'fulfilled_completion',
        progress_note: 'Successfully completed the task',
      });

      expect(updateResult).toHaveProperty('updated', true);
      expect(updateResult).toHaveProperty('newStatus', 'fulfilled_completion');
      expect(updateResult).toHaveProperty('progressNotes', 1);
    });

    it('should handle unknown intention ID', async () => {
      await expect(
        consciousnessTools.execute('consciousness_update_intention', {
          intention_id: 'unknown_id',
          status: 'fulfilled_completion',
        })
      ).rejects.toThrow();
    });

    it('should update priority when specified', async () => {
      // Set intention
      const setResult = await consciousnessTools.execute('consciousness_set_intention', {
        intention: 'Test intention for priority update',
        priority: 'whisper',
      });

      const intentionId = (setResult as any).intentionId;

      // Update priority
      const updateResult = await consciousnessTools.execute('consciousness_update_intention', {
        intention_id: intentionId,
        status: 'pulsing_active',
        new_priority: 'burning_focus',
      });

      expect(updateResult).toHaveProperty('priority', 'burning_focus');
    });
  });

  describe('consciousness_update_session', () => {
    it('should update session state based on agent activity', async () => {
      const result = await consciousnessTools.execute('consciousness_update_session', {
        activity_type: 'reflection',
        cognitive_impact: 'significant',
      });

      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('updated', true);
    });

    it('should handle different activity types', async () => {
      const activities = ['problem_solving', 'learning', 'creativity', 'conversation'];

      for (const activity of activities) {
        const result = await consciousnessTools.execute('consciousness_update_session', {
          activity_type: activity,
          cognitive_impact: 'moderate',
        });

        expect(result).toHaveProperty('updated', true);
        const state = (result as any).currentState;
        expect(['problem_solving', 'learning', 'creative', 'conversational', 'analytical']).toContain(state.mode);
      }
    });

    it('should handle different cognitive impact levels', async () => {
      const impacts = ['minimal', 'moderate', 'significant', 'transformative'];

      for (const impact of impacts) {
        const result = await consciousnessTools.execute('consciousness_update_session', {
          activity_type: 'learning',
          cognitive_impact: impact,
        });

        expect(result).toHaveProperty('updated', true);
        const cognitiveLoad = (result as any).cognitiveLoad;
        expect(cognitiveLoad).toBeGreaterThan(0);
        expect(cognitiveLoad).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('error handling', () => {
    it('should handle unknown tool names', async () => {
      await expect(consciousnessTools.execute('unknown_tool', {})).rejects.toThrow(
        'Unknown consciousness tool: unknown_tool'
      );
    });

    it('should handle empty topic for prepare_context', async () => {
      const result = await consciousnessTools.execute('consciousness_prepare_context', {
        topic: '', // empty topic is allowed but results in empty context
      });
      expect(result).toBeDefined();
    });

    it('should handle empty insight for store_insight', async () => {
      const result = await consciousnessTools.execute('consciousness_store_insight', {
        insight: '', // empty insight is allowed but stored
      });
      expect(result).toBeDefined();
      const storage = result as InsightStorageResult;
      expect(storage.stored).toBe(true);
    });

    it('should handle invalid confidence values', async () => {
      const result = await consciousnessTools.execute('consciousness_store_insight', {
        insight: 'Test insight',
        confidence: 1.5, // should be clamped to 1.0
      });

      const storage = result as InsightStorageResult;
      expect(storage.stored).toBe(true);
    });
  });
});
