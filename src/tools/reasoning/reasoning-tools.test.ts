import { describe, it, expect, beforeEach } from '@jest/globals';
import { ReasoningTools } from './reasoning-tools.js';
import type { ThinkingResult } from './types.js';

describe('ReasoningTools', () => {
  let reasoningTools: ReasoningTools;

  beforeEach(() => {
    reasoningTools = new ReasoningTools();
  });

  describe('getTools', () => {
    it('should return sequential_thinking tool definition', () => {
      const tools = reasoningTools.getTools();

      expect(tools).toHaveProperty('sequential_thinking');
      expect(tools.sequential_thinking.name).toBe('sequential_thinking');
      expect(tools.sequential_thinking.description).toContain('dynamic and reflective problem-solving');
    });

    it('should have required schema properties', () => {
      const tools = reasoningTools.getTools();
      const schema = tools.sequential_thinking.inputSchema;

      expect(schema.type).toBe('object');
      expect(schema.properties).toHaveProperty('thought');
      expect(schema.properties).toHaveProperty('next_thought_needed');
      expect(schema.properties).toHaveProperty('thought_number');
      expect(schema.properties).toHaveProperty('total_thoughts');
      expect(schema.required).toEqual(['thought', 'next_thought_needed', 'thought_number', 'total_thoughts']);
    });
  });

  describe('sequential_thinking execution', () => {
    it('should handle basic sequential thinking', async () => {
      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: 'This is my first thought about the problem',
        next_thought_needed: true,
        thought_number: 1,
        total_thoughts: 3,
      })) as ThinkingResult;

      expect(result).toMatchObject({
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branches: [],
        thoughtHistoryLength: 1,
      });

      expect(result.sessionSummary).toContain('Session: 1 thoughts');
    });

    it('should handle thought completion', async () => {
      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: 'This is my final conclusion',
        next_thought_needed: false,
        thought_number: 3,
        total_thoughts: 3,
      })) as ThinkingResult;

      expect(result).toMatchObject({
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
      });

      expect(result.conclusion).toContain('Sequential thinking completed');
    });

    it('should handle thought revisions', async () => {
      await reasoningTools.execute('sequential_thinking', {
        thought: 'Initial thought',
        next_thought_needed: true,
        thought_number: 1,
        total_thoughts: 2,
      });

      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: 'Revised thinking about the first point',
        next_thought_needed: false,
        thought_number: 2,
        total_thoughts: 2,
        is_revision: true,
        revises_thought: 1,
      })) as ThinkingResult;

      expect(result.insights).toContain('Demonstrated reflective thinking with 1 revision(s)');
    });

    it('should handle branching thoughts', async () => {
      await reasoningTools.execute('sequential_thinking', {
        thought: 'Main thought',
        next_thought_needed: true,
        thought_number: 1,
        total_thoughts: 3,
      });

      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: 'Alternative approach',
        next_thought_needed: false,
        thought_number: 2,
        total_thoughts: 3,
        branch_from_thought: 1,
        branch_id: 'alt_approach',
      })) as ThinkingResult;

      expect(result.branches).toContain('alt_approach');
      expect(result.insights).toContain('Explored 1 alternative approach(es)');
    });

    it('should extract hypothesis from thoughts', async () => {
      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: 'My hypothesis is that this approach will work better',
        next_thought_needed: false,
        thought_number: 1,
        total_thoughts: 1,
      })) as ThinkingResult;

      expect(result.hypothesis).toContain('My hypothesis is that this approach will work better');
    });

    it('should extract verification from thoughts', async () => {
      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: 'I need to verify this assumption by testing the edge cases',
        next_thought_needed: false,
        thought_number: 1,
        total_thoughts: 1,
      })) as ThinkingResult;

      expect(result.verification).toContain('I need to verify this assumption');
    });

    it('should handle dynamic scope adjustments', async () => {
      await reasoningTools.execute('sequential_thinking', {
        thought: 'Starting with simple scope',
        next_thought_needed: true,
        thought_number: 1,
        total_thoughts: 2,
      });

      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: 'Realizing this needs more thoughts',
        next_thought_needed: true,
        thought_number: 2,
        total_thoughts: 5, // Adjusted scope
        needs_more_thoughts: true,
      })) as ThinkingResult;

      expect(result.insights).toContain('Dynamically adjusted scope as understanding deepened');
    });

    it('should validate input parameters', async () => {
      await expect(
        reasoningTools.execute('sequential_thinking', {
          thought: 'Test',
          next_thought_needed: true,
          thought_number: 0, // Invalid: should be >= 1
          total_thoughts: 2,
        })
      ).rejects.toThrow('Invalid number: must be integer >= 1');

      await expect(
        reasoningTools.execute('sequential_thinking', {
          thought: 'Test',
          next_thought_needed: true,
          thought_number: 1.5, // Invalid: not integer
          total_thoughts: 2,
        })
      ).rejects.toThrow('Invalid number: must be integer >= 1');
    });

    it('should sanitize long thoughts', async () => {
      const longThought = 'x'.repeat(3000); // Exceeds 2000 char limit

      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: longThought,
        next_thought_needed: false,
        thought_number: 1,
        total_thoughts: 1,
      })) as ThinkingResult;

      // Should be truncated to 2000 characters
      expect(result.conclusion?.length).toBeLessThanOrEqual(2200); // Allowing for added text in conclusion
    });

    it('should handle unknown tool names', async () => {
      await expect(reasoningTools.execute('unknown_tool', {})).rejects.toThrow('Unknown reasoning tool: unknown_tool');
    });
  });

  describe('session management', () => {
    it('should track session duration', async () => {
      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: 'Test thought',
        next_thought_needed: false,
        thought_number: 1,
        total_thoughts: 1,
      })) as ThinkingResult;

      expect(result.sessionSummary).toMatch(/\d+s duration/);
    });

    it('should clean up completed sessions', async () => {
      // Start a session
      await reasoningTools.execute('sequential_thinking', {
        thought: 'First thought',
        next_thought_needed: true,
        thought_number: 1,
        total_thoughts: 2,
      });

      // Complete the session
      await reasoningTools.execute('sequential_thinking', {
        thought: 'Final thought',
        next_thought_needed: false,
        thought_number: 2,
        total_thoughts: 2,
      });

      // Session should be cleaned up - next call creates new session
      const result = (await reasoningTools.execute('sequential_thinking', {
        thought: 'New session thought',
        next_thought_needed: false,
        thought_number: 1,
        total_thoughts: 1,
      })) as ThinkingResult;

      expect(result.thoughtHistoryLength).toBe(1); // New session
    });
  });
});
