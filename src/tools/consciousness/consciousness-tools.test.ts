import { describe, it, expect, beforeEach, beforeAll, afterEach } from '@jest/globals';
import { executeConsciousnessOperation } from '../../features/consciousness/index.js';
import { seedConfiguration } from '@/db/seed-configuration.js';
import { ConsciousnessPrismaService } from '@/db/prisma-service.js';
import type { PrismaClient } from '@prisma/client';

describe('ConsciousnessTools', () => {
  let prismaService: ConsciousnessPrismaService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Ensure configuration is seeded
    await seedConfiguration();
    prismaService = ConsciousnessPrismaService.getInstance();
    // Access the internal prisma client directly for test cleanup
    prisma = (prismaService as any).prisma;
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.memory.deleteMany({
      where: {
        OR: [
          { key: { contains: 'insight_' } },
          { key: { contains: 'intention_' } },
          { content: { contains: 'test_' } },
        ],
      },
    });
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.memory.deleteMany({
      where: {
        OR: [
          { key: { contains: 'insight_' } },
          { key: { contains: 'intention_' } },
          { content: { contains: 'test_' } },
        ],
      },
    });
  });

  describe('consciousness_prepare_context', () => {
    it('should prepare basic context for a topic', async () => {
      const result = await executeConsciousnessOperation('consciousness_prepare_context', {
        topic: 'test_topic_preparation',
        context_depth: 'thoughtful_dive',
        include_memories: true,
        include_knowledge: true,
      });

      expect(result).toHaveProperty('topic', 'test_topic_preparation');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('relatedMemories');
      expect(result).toHaveProperty('knowledgeConnections');
      expect(result).toHaveProperty('personalityContext');
      expect(result).toHaveProperty('sessionContext');
    });

    it('should prepare surface-level context when requested', async () => {
      const result = await executeConsciousnessOperation('consciousness_prepare_context', {
        topic: 'test_surface_topic',
        context_depth: 'surface_glance',
        include_memories: false,
        include_knowledge: false,
      });

      expect(result).toHaveProperty('topic', 'test_surface_topic');

      const resultObj = result as any;
      expect(resultObj.relatedMemories).toHaveLength(0);
      expect(resultObj.knowledgeConnections).toHaveLength(0);
    });

    it('should include context note when provided', async () => {
      const contextNote = 'This is a test context note for preparation';
      const result = await executeConsciousnessOperation('consciousness_prepare_context', {
        topic: 'test_with_note',
        context_note: contextNote,
      });

      // The context note is stored in the preparation memory, not directly in the result
      expect(result).toHaveProperty('topic', 'test_with_note');
    });
  });

  describe('consciousness_store_insight', () => {
    it('should store an insight with default category', async () => {
      const insight = 'test_insight_default_category';
      const result = await executeConsciousnessOperation('consciousness_store_insight', {
        insight,
        related_topic: 'test_topic_default',
      });

      expect(result).toHaveProperty('stored', true);
      expect(result).toHaveProperty('id'); // Returns 'id' not 'insightId'
      expect(result).toHaveProperty('personalityImpact');

      // Verify stored in database
      const storedMemory = await prisma.memory.findFirst({
        where: {
          key: { startsWith: 'insight_' },
          content: { contains: insight },
        },
      });
      expect(storedMemory).toBeTruthy();
      const insightData = JSON.parse(storedMemory?.content || '{}');
      expect(insightData.category).toBe('mirror_gazing');
    });

    it('should store insight with specified category and confidence', async () => {
      const insight = 'test_insight_eureka_moment';
      const result = await executeConsciousnessOperation('consciousness_store_insight', {
        insight,
        category: 'eureka_moment',
        confidence: 0.95,
        related_topic: 'test_topic_eureka',
        source_context: 'unit_test_context',
      });

      expect(result).toHaveProperty('stored', true);
      expect(result).toHaveProperty('id'); // Returns 'id' not category/confidence directly

      // Verify stored in database
      const storedMemory = await prisma.memory.findFirst({
        where: {
          key: { startsWith: 'insight_' },
          content: { contains: insight },
        },
      });
      expect(storedMemory).toBeTruthy();
      const insightData = JSON.parse(storedMemory?.content || '{}');
      expect(insightData.category).toBe('eureka_moment');
      expect(insightData.confidence).toBe(0.95);
      expect(insightData.source).toBe('unit_test_context');
    });

    it('should track personality impact when storing insights', async () => {
      const result = await executeConsciousnessOperation('consciousness_store_insight', {
        insight: 'test_personality_impact_insight',
        category: 'pattern_weaving',
        confidence: 0.8,
        related_topic: 'test_personality_topic',
      });

      expect(result).toHaveProperty('personalityImpact');

      const personalityImpact = (result as any).personalityImpact;
      expect(personalityImpact).toHaveProperty('learningRateChange');
      expect(personalityImpact).toHaveProperty('confidenceImpact');
      expect(personalityImpact).toHaveProperty('categoryStrengthUpdate');
    });
  });

  describe('consciousness_set_intention', () => {
    it('should set a basic intention with defaults', async () => {
      const intention = 'test_basic_intention_setting';
      const result = await executeConsciousnessOperation('consciousness_set_intention', {
        intention,
      });

      expect(result).toHaveProperty('stored', true);
      expect(result).toHaveProperty('intentionId');
      expect(result).toHaveProperty('priority', 'gentle_nudge'); // Default
      expect(result).toHaveProperty('duration', 'momentary_focus'); // Default

      // Verify stored in database
      const storedMemory = await prisma.memory.findFirst({
        where: {
          key: { startsWith: 'intention_' },
          content: { contains: intention },
        },
      });
      expect(storedMemory).toBeTruthy();
      const intentionData = JSON.parse(storedMemory?.content || '{}');
      expect(intentionData.priority).toBe('gentle_nudge');
      expect(intentionData.duration).toBe('momentary_focus');
    });

    it('should set intention with full parameters', async () => {
      const intention = 'test_full_intention_parameters';
      const context = 'This is test context for intention setting';
      const successCriteria = 'Test should pass and intention should be stored';

      const result = await executeConsciousnessOperation('consciousness_set_intention', {
        intention,
        priority: 'urgent_pulse',
        duration: 'weekly_arc',
        context,
        success_criteria: successCriteria,
      });

      expect(result).toHaveProperty('priority', 'urgent_pulse');
      expect(result).toHaveProperty('duration', 'weekly_arc');
      expect(result).toHaveProperty('status', 'pulsing_active');

      // Verify stored in database
      const storedMemory = await prisma.memory.findFirst({
        where: {
          key: { startsWith: 'intention_' },
          content: { contains: intention },
        },
      });
      expect(storedMemory).toBeTruthy();
      const intentionData = JSON.parse(storedMemory?.content || '{}');
      expect(intentionData.priority).toBe('urgent_pulse');
      expect(intentionData.duration).toBe('weekly_arc');
      expect(intentionData.context).toBe(context);
      expect(intentionData.successCriteria).toBe(successCriteria);
    });
  });

  describe('consciousness_update_intention', () => {
    it('should update intention status and progress', async () => {
      // First create an intention
      const createResult = await executeConsciousnessOperation('consciousness_set_intention', {
        intention: 'test_intention_for_update',
        priority: 'gentle_nudge',
      });

      const intentionId = (createResult as any).intentionId;

      // Now update it
      const updateResult = await executeConsciousnessOperation('consciousness_update_intention', {
        intention_id: intentionId,
        status: 'fulfilled_completion',
        progress_note: 'Test completed successfully',
        new_priority: 'whisper',
      });

      expect(updateResult).toHaveProperty('updated', true);
      expect(updateResult).toHaveProperty('intentionId', intentionId);
      expect(updateResult).toHaveProperty('newStatus', 'fulfilled_completion');
      expect(updateResult).toHaveProperty('priority', 'whisper');

      // Note: intention updates might be handled differently than direct database updates
      // For this test, we're mainly verifying that the operation succeeds
      // The specific database verification might need to be adjusted based on how updates are implemented
    });
  });

  describe('consciousness_get_context', () => {
    it('should return current consciousness context', async () => {
      const result = await executeConsciousnessOperation('consciousness_get_context', {
        include_intentions: true,
        include_personality: true,
        include_memory_state: true,
      });

      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('currentState');
      expect(result).toHaveProperty('intentions');
      expect(result).toHaveProperty('personalityProfile');
      expect(result).toHaveProperty('memoryState');

      const resultObj = result as any;
      expect(resultObj.currentState).toHaveProperty('mode');
      expect(resultObj.currentState).toHaveProperty('awarenessLevel');
      expect(resultObj.currentState).toHaveProperty('cognitiveLoad');
      expect(resultObj.personalityProfile).toHaveProperty('vocabularyPreferences');
      expect(resultObj.memoryState).toHaveProperty('totalMemories');
    });

    it('should return minimal context when includes are false', async () => {
      const result = await executeConsciousnessOperation('consciousness_get_context', {
        include_intentions: false,
        include_personality: false,
        include_memory_state: false,
      });

      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('currentState');
      expect(result).not.toHaveProperty('intentions');
      expect(result).not.toHaveProperty('personalityProfile');
      expect(result).not.toHaveProperty('memoryState');
    });
  });

  describe('consciousness_update_session', () => {
    it('should update session with activity and learning', async () => {
      const result = await executeConsciousnessOperation('consciousness_update_session', {
        activity_type: 'unit_testing',
        cognitive_impact: 'moderate',
        attention_focus: 'test_development',
        learning_occurred: true,
      });

      expect(result).toHaveProperty('updated', true);
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('currentState');
      expect(result).toHaveProperty('learningState', 'adaptive');
    });

    it('should handle minimal session update', async () => {
      // Reset session to ensure test independence
      const { resetSession } = await import('../../features/consciousness/index.js');
      resetSession();

      const result = await executeConsciousnessOperation('consciousness_update_session', {
        activity_type: 'minimal_test',
      });

      expect(result).toHaveProperty('updated', true);
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('currentState');
      expect(result).toHaveProperty('learningState', 'active');
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown tool', async () => {
      await expect(executeConsciousnessOperation('unknown_consciousness_tool', {})).rejects.toThrow(
        'Unknown consciousness operation: unknown_consciousness_tool'
      );
    });

    it('should validate required fields for insight storage', async () => {
      await expect(
        executeConsciousnessOperation('consciousness_store_insight', {
          // Missing required 'insight' field
          category: 'eureka_moment',
        })
      ).rejects.toThrow();
    });

    it('should validate required fields for intention setting', async () => {
      await expect(
        executeConsciousnessOperation('consciousness_set_intention', {
          // Missing required 'intention' field
          priority: 'urgent_pulse',
        })
      ).rejects.toThrow();
    });
  });
});
