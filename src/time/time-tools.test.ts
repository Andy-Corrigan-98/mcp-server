import { describe, it, expect, beforeEach } from '@jest/globals';
import { TimeTools } from './time-tools.js';

describe('TimeTools', () => {
  let timeTools: TimeTools;

  beforeEach(() => {
    timeTools = new TimeTools();
  });

  describe('getTools', () => {
    it('should return all time tools', () => {
      const tools = timeTools.getTools();

      expect(tools).toHaveProperty('time_current');
      expect(tools).toHaveProperty('time_convert');
      expect(tools).toHaveProperty('time_awareness');
    });

    it('should return valid tool schemas', () => {
      const tools = timeTools.getTools();

      expect(tools.time_current.name).toBe('time_current');
      expect(tools.time_current.description).toBeDefined();
      expect(tools.time_current.inputSchema).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should get current time with default timezone', async () => {
      const result = await timeTools.execute('time_current', {});

      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('time');
      expect(result).toHaveProperty('unix');
    });

    it('should get current time with specified timezone', async () => {
      const result = await timeTools.execute('time_current', {
        timezone: 'America/New_York',
      });

      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('timezone', 'America/New_York');
      expect(result).toHaveProperty('time');
      expect(result).toHaveProperty('unix');
    });

    it('should convert time between timezones', async () => {
      const result = await timeTools.execute('time_convert', {
        time: '2023-01-01T12:00:00Z',
        from_timezone: 'UTC',
        to_timezone: 'America/New_York',
      });

      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('converted');
      expect(result).toHaveProperty('conversion_timestamp');
    });

    it('should get time awareness', async () => {
      const result = await timeTools.execute('time_awareness', {});

      expect(result).toHaveProperty('current_time');
      expect(result).toHaveProperty('temporal_state');
      expect(result).toHaveProperty('temporal_context');
    });

    it('should throw error for unknown tool', async () => {
      await expect(timeTools.execute('unknown_tool', {})).rejects.toThrow('Unknown time tool: unknown_tool');
    });
  });
});
