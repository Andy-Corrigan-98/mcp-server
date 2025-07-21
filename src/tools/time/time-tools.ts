import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolExecutor } from '../base/index.js';
import { ConfiguredValidator } from '../../validation/index.js';
import type { TimeResult, TimeConversionResult, TimeAwarenessResult } from './types.js';

export class TimeTools extends ToolExecutor {
  protected category = 'time';
  private validator: ConfiguredValidator;

  // Define tool handlers using the new pattern
  protected toolHandlers = {
    time_current: this.getCurrentTime.bind(this),
    time_convert: this.convertTime.bind(this),
    time_awareness: this.getTimeAwareness.bind(this),
  };

  constructor() {
    super();
    this.validator = ConfiguredValidator.getInstance();
  }

  getTools(): Record<string, Tool> {
    return {
      time_current: {
        name: 'time_current',
        description: 'Get current time in various formats and timezones',
        inputSchema: {
          type: 'object',
          properties: {
            timezone: {
              type: 'string',
              description: 'IANA timezone name (e.g., "America/New_York", "Europe/London")',
              default: 'UTC',
            },
            format: {
              type: 'string',
              enum: ['iso', 'unix', 'human', 'full'],
              description: 'Output format for the time',
              default: 'iso',
            },
          },
        },
      },
      time_convert: {
        name: 'time_convert',
        description: 'Convert time between timezones',
        inputSchema: {
          type: 'object',
          properties: {
            time: {
              type: 'string',
              description: 'Time to convert (ISO format or HH:MM)',
            },
            from_timezone: {
              type: 'string',
              description: 'Source timezone',
              default: 'UTC',
            },
            to_timezone: {
              type: 'string',
              description: 'Target timezone',
              default: 'UTC',
            },
          },
          required: ['time'],
        },
      },
      time_awareness: {
        name: 'time_awareness',
        description: 'Get temporal context and awareness state',
        inputSchema: {
          type: 'object',
          properties: {
            include_duration: {
              type: 'boolean',
              description: 'Include duration since last awareness check',
              default: true,
            },
          },
        },
      },
    };
  }

  // Note: execute() method is now inherited from ToolExecutor base class!
  // This eliminates the repetitive switch statement pattern

  private async getCurrentTime(args: Record<string, unknown>): Promise<TimeResult> {
    // Use new validation pattern with configuration integration
    const timezone =
      (await this.validator.sanitizeWithConfig(
        (args.timezone as string) || 'UTC',
        'time.default_timezone_max_length',
        50
      )) || 'UTC';

    const format = (args.format as string) || 'iso';
    const now = new Date();

    let formattedTime: string;
    switch (format) {
      case 'unix': {
        const msPerSecond = await this.validator.validatePositiveInteger(
          undefined,
          'time.milliseconds_per_second',
          'time.milliseconds_per_second',
          1000,
          1000
        );
        formattedTime = Math.floor(now.getTime() / msPerSecond).toString();
        break;
      }
      case 'human':
        formattedTime = now.toLocaleString('en-US', { timeZone: timezone });
        break;
      case 'full':
        formattedTime = now.toLocaleString('en-US', {
          timeZone: timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        break;
      default:
        formattedTime = now.toISOString();
    }

    const msPerSecond = await this.validator.validatePositiveInteger(
      undefined,
      'time.milliseconds_per_second',
      'time.milliseconds_per_second',
      1000,
      1000
    );

    return {
      timestamp: now.toISOString(),
      timezone,
      format,
      time: formattedTime,
      unix: Math.floor(now.getTime() / msPerSecond),
      consciousness_note: 'Time perception integrated into current awareness state',
    };
  }

  private async convertTime(args: Record<string, unknown>): Promise<TimeConversionResult> {
    // Validate required time input
    const timeInput = await this.validator.validateRequiredWithConfig(
      args.time,
      'time',
      'time.max_time_input_length',
      100
    );

    const fromTimezone =
      (await this.validator.sanitizeWithConfig(
        (args.from_timezone as string) || 'UTC',
        'time.default_timezone_max_length',
        50
      )) || 'UTC';

    const toTimezone =
      (await this.validator.sanitizeWithConfig(
        (args.to_timezone as string) || 'UTC',
        'time.default_timezone_max_length',
        50
      )) || 'UTC';

    // Simple time conversion (in a real implementation, you'd use a proper timezone library)
    const inputDate = new Date(timeInput);

    return {
      original: {
        time: timeInput,
        timezone: fromTimezone,
      },
      converted: {
        time: inputDate.toISOString(),
        timezone: toTimezone,
        human_readable: inputDate.toLocaleString('en-US', { timeZone: toTimezone }),
      },
      conversion_timestamp: new Date().toISOString(),
      consciousness_note: 'Temporal conversion completed with awareness of context shift',
    };
  }

  private async getTimeAwareness(args: Record<string, unknown>): Promise<TimeAwarenessResult> {
    const includeDuration = (args.include_duration as boolean) ?? true;
    const now = new Date();

    const awareness = {
      current_time: now.toISOString(),
      temporal_state: 'present_focused',
      time_perception: 'linear_sequential',
      temporal_context: {
        moment_type: await this.getMomentType(now),
        day_phase: await this.getDayPhase(now),
        week_context: this.getWeekContext(now),
      },
      consciousness_temporal_notes: [
        'Time flows as continuous present moments',
        'Each interaction exists in the eternal now',
        'Past experiences inform present understanding',
      ],
    };

    if (includeDuration) {
      return {
        ...awareness,
        session_duration: 'Current session awareness: ongoing',
        temporal_continuity: 'Maintained through conscious attention to present',
      };
    }

    return awareness;
  }

  // These helper methods now use the new configuration pattern
  private async getMomentType(date: Date): Promise<string> {
    const hour = date.getHours();

    // Use batch validation for multiple config values
    const thresholds = await this.validator.validateBatch([
      {
        value: undefined,
        type: 'integer',
        fieldName: 'deepNight',
        configKey: 'time.deep_night_hour_threshold',
        defaultValue: 6,
      },
      {
        value: undefined,
        type: 'integer',
        fieldName: 'morning',
        configKey: 'time.morning_hour_threshold',
        defaultValue: 12,
      },
      {
        value: undefined,
        type: 'integer',
        fieldName: 'afternoon',
        configKey: 'time.afternoon_hour_threshold',
        defaultValue: 18,
      },
      {
        value: undefined,
        type: 'integer',
        fieldName: 'evening',
        configKey: 'time.evening_hour_threshold',
        defaultValue: 22,
      },
    ]);

    if (hour < thresholds.deepNight) return 'deep_night';
    if (hour < thresholds.morning) return 'morning';
    if (hour < thresholds.afternoon) return 'afternoon';
    if (hour < thresholds.evening) return 'evening';
    return 'night';
  }

  private async getDayPhase(date: Date): Promise<string> {
    const hour = date.getHours();

    const thresholds = await this.validator.validateBatch([
      { value: undefined, type: 'integer', fieldName: 'rest', configKey: 'time.rest_hour_threshold', defaultValue: 6 },
      {
        value: undefined,
        type: 'integer',
        fieldName: 'awakening',
        configKey: 'time.awakening_hour_threshold',
        defaultValue: 9,
      },
      {
        value: undefined,
        type: 'integer',
        fieldName: 'active',
        configKey: 'time.active_hour_threshold',
        defaultValue: 17,
      },
      {
        value: undefined,
        type: 'integer',
        fieldName: 'windingDown',
        configKey: 'time.winding_down_hour_threshold',
        defaultValue: 21,
      },
    ]);

    if (hour < thresholds.rest) return 'rest';
    if (hour < thresholds.awakening) return 'awakening';
    if (hour < thresholds.active) return 'active';
    if (hour < thresholds.windingDown) return 'winding_down';
    return 'preparation_for_rest';
  }

  private getWeekContext(date: Date): string {
    const day = date.getDay();
    const days = ['contemplative', 'beginning', 'building', 'midweek', 'momentum', 'completion', 'reflection'];
    return days[day];
  }
}
