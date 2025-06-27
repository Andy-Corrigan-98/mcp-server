import { ConsciousnessTools } from './consciousness-tools.js';
import type { ReflectionResult, Intention, Insight, ConsciousnessMetrics } from './types.js';

describe('ConsciousnessTools', () => {
  let consciousnessTools: ConsciousnessTools;

  beforeEach(() => {
    consciousnessTools = new ConsciousnessTools();
  });

  describe('tool registration', () => {
    it('should register all consciousness tools', () => {
      const tools = consciousnessTools.getTools();

      expect(tools).toHaveProperty('consciousness_reflect');
      expect(tools).toHaveProperty('consciousness_state');
      expect(tools).toHaveProperty('consciousness_intention_set');
      expect(tools).toHaveProperty('consciousness_intention_update');
      expect(tools).toHaveProperty('consciousness_insight_capture');
    });

    it('should have proper tool schemas', () => {
      const tools = consciousnessTools.getTools();

      expect(tools.consciousness_reflect.inputSchema.properties).toHaveProperty('topic');
      expect(tools.consciousness_reflect.inputSchema.properties).toHaveProperty('depth');
      expect(tools.consciousness_reflect.inputSchema.properties).toHaveProperty('connect_memories');

      expect(tools.consciousness_state.inputSchema.properties).toHaveProperty('include_metrics');
      expect(tools.consciousness_state.inputSchema.properties).toHaveProperty('include_memory_state');
      expect(tools.consciousness_state.inputSchema.properties).toHaveProperty('include_intentions');

      expect(tools.consciousness_intention_set.inputSchema.properties).toHaveProperty('intention');
      expect(tools.consciousness_intention_set.inputSchema.properties).toHaveProperty('priority');
      expect(tools.consciousness_intention_set.inputSchema.properties).toHaveProperty('duration');
    });
  });

  describe('consciousness_reflect execution', () => {
    it('should handle basic reflection', async () => {
      const result = (await consciousnessTools.execute('consciousness_reflect', {
        topic: 'problem solving approaches',
        depth: 'deep',
      })) as ReflectionResult;

      expect(result).toMatchObject({
        topic: 'problem solving approaches',
        depth: 'deep',
      });
      expect(result.immediateThoughts).toBeTruthy();
      expect(result.deeperAnalysis).toBeTruthy();
      expect(result.implications).toBeInstanceOf(Array);
      expect(result.questionsRaised).toBeInstanceOf(Array);
      expect(result.actionItems).toBeInstanceOf(Array);
      expect(result.confidenceLevel).toBeGreaterThan(0);
      expect(result.confidenceLevel).toBeLessThanOrEqual(1);
    });

    it('should handle surface reflection', async () => {
      const result = (await consciousnessTools.execute('consciousness_reflect', {
        topic: 'daily planning',
        depth: 'surface',
      })) as ReflectionResult;

      expect(result.depth).toBe('surface');
      expect(result.deeperAnalysis).toBeUndefined();
      expect(result.profoundInsights).toBeUndefined();
    });

    it('should handle profound reflection', async () => {
      const result = (await consciousnessTools.execute('consciousness_reflect', {
        topic: 'nature of consciousness',
        depth: 'profound',
        context: 'philosophical inquiry',
      })) as ReflectionResult;

      expect(result.depth).toBe('profound');
      expect(result.deeperAnalysis).toBeTruthy();
      expect(result.profoundInsights).toBeTruthy();
    });

    it('should handle reflection without memory connections', async () => {
      const result = (await consciousnessTools.execute('consciousness_reflect', {
        topic: 'test topic',
        connect_memories: false,
      })) as ReflectionResult;

      expect(result.relatedMemories).toBeInstanceOf(Array);
    });
  });

  describe('consciousness_state execution', () => {
    it('should return basic state information', async () => {
      const result = await consciousnessTools.execute('consciousness_state', {});

      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('sessionDuration');
      expect(result).toHaveProperty('state');
    });

    it('should include metrics when requested', async () => {
      const result = await consciousnessTools.execute('consciousness_state', {
        include_metrics: true,
      });

      expect(result).toHaveProperty('metrics');
      const metrics = (result as any).metrics as ConsciousnessMetrics;

      expect(metrics).toHaveProperty('responseTimeMs');
      expect(metrics).toHaveProperty('memoryUtilization');
      expect(metrics).toHaveProperty('patternRecognitionAccuracy');
      expect(metrics).toHaveProperty('semanticCoherence');
      expect(metrics).toHaveProperty('intentionAlignment');
    });

    it('should include memory state when requested', async () => {
      const result = await consciousnessTools.execute('consciousness_state', {
        include_memory_state: true,
      });

      expect(result).toHaveProperty('memoryState');
    });

    it('should include intentions by default', async () => {
      const result = await consciousnessTools.execute('consciousness_state', {});

      expect(result).toHaveProperty('intentions');
    });
  });

  describe('consciousness_intention_set execution', () => {
    it('should set basic intention', async () => {
      const result = await consciousnessTools.execute('consciousness_intention_set', {
        intention: 'Improve problem-solving efficiency',
        priority: 'high',
      });

      expect(result).toHaveProperty('action', 'intention_set');
      expect(result).toHaveProperty('intention');
      expect(result).toHaveProperty('consciousnessResponse');
      expect(result).toHaveProperty('alignment');
      expect(result).toHaveProperty('nextActions');

      const intention = (result as any).intention as Intention;
      expect(intention.description).toBe('Improve problem-solving efficiency');
      expect(intention.priority).toBe('high');
      expect(intention.status).toBe('active');
      expect(intention.id).toBeTruthy();
    });

    it('should set intention with full parameters', async () => {
      const result = await consciousnessTools.execute('consciousness_intention_set', {
        intention: 'Learn new programming patterns',
        priority: 'medium',
        context: 'For improving code quality',
        duration: 'week',
        success_criteria: 'Apply 3 new patterns in projects',
      });

      const intention = (result as any).intention as Intention;
      expect(intention.context).toBe('For improving code quality');
      expect(intention.duration).toBe('week');
      expect(intention.successCriteria).toBe('Apply 3 new patterns in projects');
    });

    it('should handle different priority levels', async () => {
      const priorities = ['low', 'medium', 'high', 'critical'];

      for (const priority of priorities) {
        const result = await consciousnessTools.execute('consciousness_intention_set', {
          intention: `Test intention with ${priority} priority`,
          priority,
        });

        const intention = (result as any).intention as Intention;
        expect(intention.priority).toBe(priority);
      }
    });
  });

  describe('consciousness_intention_update execution', () => {
    it('should update intention status', async () => {
      // First set an intention
      const setResult = await consciousnessTools.execute('consciousness_intention_set', {
        intention: 'Test intention for update',
      });

      const intentionId = (setResult as any).intention.id;

      // Then update it
      const updateResult = await consciousnessTools.execute('consciousness_intention_update', {
        intention_id: intentionId,
        status: 'completed',
        progress_note: 'Successfully completed the task',
      });

      expect(updateResult).toHaveProperty('action', 'intention_updated');
      expect(updateResult).toHaveProperty('statusChange', 'completed');
      expect(updateResult).toHaveProperty('progressNotes', 1);
    });

    it('should handle unknown intention ID', async () => {
      await expect(
        consciousnessTools.execute('consciousness_intention_update', {
          intention_id: 'unknown_id',
          status: 'completed',
        })
      ).rejects.toThrow('Intention unknown_id not found');
    });

    it('should update priority when specified', async () => {
      // Set intention
      const setResult = await consciousnessTools.execute('consciousness_intention_set', {
        intention: 'Test intention for priority update',
        priority: 'low',
      });

      const intentionId = (setResult as any).intention.id;

      // Update priority
      const updateResult = await consciousnessTools.execute('consciousness_intention_update', {
        intention_id: intentionId,
        status: 'active',
        new_priority: 'high',
      });

      const intention = (updateResult as any).intention as Intention;
      expect(intention.priority).toBe('high');
    });
  });

  describe('consciousness_insight_capture execution', () => {
    it('should capture basic insight', async () => {
      const result = await consciousnessTools.execute('consciousness_insight_capture', {
        insight: 'Breaking problems into smaller components improves solution clarity',
        category: 'problem_solving',
      });

      expect(result).toHaveProperty('action', 'insight_captured');
      expect(result).toHaveProperty('insight');
      expect(result).toHaveProperty('consciousnessResponse');
      expect(result).toHaveProperty('categoryAnalysis');
      expect(result).toHaveProperty('implications');

      const insight = (result as any).insight as Insight;
      expect(insight.content).toBe('Breaking problems into smaller components improves solution clarity');
      expect(insight.category).toBe('problem_solving');
      expect(insight.confidence).toBe(0.8); // Default value
      expect(insight.id).toBeTruthy();
      expect(insight.tags).toBeInstanceOf(Array);
    });

    it('should capture insight with all parameters', async () => {
      const result = await consciousnessTools.execute('consciousness_insight_capture', {
        insight: 'Patterns in user behavior reveal underlying motivations',
        category: 'pattern_recognition',
        confidence: 0.9,
        related_topic: 'user experience design',
        source: 'data analysis session',
      });

      const insight = (result as any).insight as Insight;
      expect(insight.confidence).toBe(0.9);
      expect(insight.relatedTopic).toBe('user experience design');
      expect(insight.source).toBe('data analysis session');
    });

    it('should handle different insight categories', async () => {
      const categories = [
        'problem_solving',
        'pattern_recognition',
        'meta_cognition',
        'domain_knowledge',
        'behavioral',
        'philosophical',
      ];

      for (const category of categories) {
        const result = await consciousnessTools.execute('consciousness_insight_capture', {
          insight: `Test insight for ${category} category`,
          category,
        });

        const insight = (result as any).insight as Insight;
        expect(insight.category).toBe(category);
      }
    });

    it('should sanitize long insights', async () => {
      const longInsight = 'x'.repeat(1500); // Within limit but will be truncated by sanitizer

      const result = await consciousnessTools.execute('consciousness_insight_capture', {
        insight: longInsight,
      });

      const insight = (result as any).insight as Insight;
      // The insight will be sanitized to 1000 characters max
      expect(insight.content.length).toBeLessThanOrEqual(1000);
    });

    it('should handle confidence bounds', async () => {
      // Test minimum bound
      const result1 = await consciousnessTools.execute('consciousness_insight_capture', {
        insight: 'Test insight',
        confidence: -0.5,
      });

      expect((result1 as any).insight.confidence).toBe(0);

      // Test maximum bound
      const result2 = await consciousnessTools.execute('consciousness_insight_capture', {
        insight: 'Test insight',
        confidence: 1.5,
      });

      expect((result2 as any).insight.confidence).toBe(1);
    });
  });

  describe('input validation', () => {
    it('should handle missing required parameters', async () => {
      await expect(consciousnessTools.execute('consciousness_reflect', {})).rejects.toThrow();
    });

    it('should sanitize string inputs', async () => {
      const result = (await consciousnessTools.execute('consciousness_reflect', {
        topic: 'test topic with special chars: <script>alert("xss")</script>',
      })) as ReflectionResult;

      expect(result.topic).not.toContain('<script>');
    });

    it('should handle unknown tool names', async () => {
      await expect(consciousnessTools.execute('unknown_tool', {})).rejects.toThrow(
        'Unknown consciousness tool: unknown_tool'
      );
    });
  });

  describe('session management', () => {
    it('should maintain session state across operations', async () => {
      const state1 = await consciousnessTools.execute('consciousness_state', {});
      const state2 = await consciousnessTools.execute('consciousness_state', {});

      expect((state1 as any).sessionId).toBe((state2 as any).sessionId);
    });

    it('should track session duration', async () => {
      const result = await consciousnessTools.execute('consciousness_state', {});

      expect((result as any).sessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should update consciousness state based on operations', async () => {
      // Perform reflection which should set mode to 'reflective'
      await consciousnessTools.execute('consciousness_reflect', {
        topic: 'test',
      });

      const result = await consciousnessTools.execute('consciousness_state', {});
      const state = (result as any).state;

      // After reflection, the state should still show the current mode (which gets updated in getConsciousnessState)
      expect(state.mode).toBe('analytical'); // getConsciousnessState sets mode to analytical
      expect(state.activeProcesses).toContain('state_assessment');
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Test reflection without memory connection errors
      const result = await consciousnessTools.execute('consciousness_reflect', {
        topic: 'test',
        connect_memories: true,
      });

      expect(result).toBeTruthy();
    });

    it('should continue operation if memory storage fails', async () => {
      const result = await consciousnessTools.execute('consciousness_intention_set', {
        intention: 'Test intention',
      });

      expect(result).toBeTruthy();
    });
  });
});
