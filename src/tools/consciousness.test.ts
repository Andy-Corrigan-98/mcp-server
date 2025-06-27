import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConsciousnessTools } from './consciousness.js';

describe('ConsciousnessTools', () => {
  let consciousnessTools: ConsciousnessTools;

  beforeEach(() => {
    consciousnessTools = new ConsciousnessTools();
  });

  describe('getTools', () => {
    it('should return all consciousness tools', () => {
      const tools = consciousnessTools.getTools();

      expect(tools).toHaveProperty('consciousness_reflect');
      expect(tools).toHaveProperty('consciousness_state');
      expect(tools).toHaveProperty('consciousness_intention_set');
      expect(tools).toHaveProperty('consciousness_intention_update');
      expect(tools).toHaveProperty('consciousness_insight_capture');
    });

    it('should return valid tool schemas', () => {
      const tools = consciousnessTools.getTools();

      expect(tools.consciousness_reflect.name).toBe('consciousness_reflect');
      expect(tools.consciousness_reflect.description).toBeDefined();
      expect(tools.consciousness_reflect.inputSchema).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should execute reflection tool', async () => {
      const result = await consciousnessTools.execute('consciousness_reflect', {
        topic: 'testing consciousness reflection',
      });

      expect(result).toHaveProperty('topic', 'testing consciousness reflection');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('depth');
      expect(result).toHaveProperty('immediateThoughts');
      expect(result).toHaveProperty('implications');
      expect(result).toHaveProperty('questionsRaised');
      expect(result).toHaveProperty('actionItems');
      expect(result).toHaveProperty('confidenceLevel');
    });

    it('should get consciousness state', async () => {
      const result = await consciousnessTools.execute('consciousness_state', {});

      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('intentions');

      const state = (result as any).state;
      expect(state).toHaveProperty('mode');
      expect(state).toHaveProperty('activeProcesses');
      expect(state).toHaveProperty('awarenessLevel');
    });

    it('should set consciousness intention', async () => {
      const result = await consciousnessTools.execute('consciousness_intention_set', {
        intention: 'test goal',
        priority: 'high',
      });

      expect(result).toHaveProperty('intention');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('consciousnessResponse');
      expect(result).toHaveProperty('action', 'intention_set');
      expect(result).toHaveProperty('alignment');
      expect(result).toHaveProperty('nextActions');
    });

    it('should throw error for unknown tool', async () => {
      await expect(consciousnessTools.execute('unknown_tool', {})).rejects.toThrow(
        'Unknown consciousness tool: unknown_tool'
      );
    });
  });
});
