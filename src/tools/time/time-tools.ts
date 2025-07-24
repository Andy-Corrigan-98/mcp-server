import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolExecutor } from '../base/index.js';
import { ConfiguredValidator } from '../../validation/index.js';
import { ConfigurationSchema } from '../../utils/index.js';
import type { TimeResult, TimeConversionResult, TimeAwarenessResult } from './types.js';

// Constants to avoid magic numbers
const MAX_TIMEZONE_LENGTH = 50;
const MAX_TIME_INPUT_LENGTH = 100;
const DEFAULT_REST_THRESHOLD = 6;
const DEFAULT_AWAKENING_THRESHOLD = 9;
const DEFAULT_ACTIVE_THRESHOLD = 17;
const DEFAULT_WINDING_DOWN_THRESHOLD = 21;

export class TimeTools extends ToolExecutor {
  protected category = 'time';
  private validator: ConfiguredValidator;
  private configLoader: ReturnType<typeof ConfigurationSchema.createLoader>;

  // Define tool handlers using the new pattern
  protected toolHandlers = {
    time_current: this.getCurrentTime.bind(this),
    time_convert: this.convertTime.bind(this),
    time_awareness: this.getTimeAwareness.bind(this),
  };

  constructor() {
    super();
    this.validator = ConfiguredValidator.getInstance();
    // Use the pre-defined TIME schema from ConfigurationSchema
    this.configLoader = ConfigurationSchema.createLoader(ConfigurationSchema.SCHEMAS.TIME);
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
    // Load configuration using the new schema-based approach
    const config = await this.configLoader.load();

    // Use new validation pattern with configuration integration
    const timezone =
      (await this.validator.sanitizeWithConfig(
        (args.timezone as string) || config.defaultTimezone,
        'time.default_timezone_max_length',
        MAX_TIMEZONE_LENGTH
      )) || config.defaultTimezone;

    const format = (args.format as string) || 'iso';
    const now = new Date();

    let formattedTime: string;
    switch (format) {
      case 'unix': {
        formattedTime = Math.floor(now.getTime() / config.millisecondsPerSecond).toString();
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

    // Create structured response using ResponseBuilder
    const timeData: TimeResult = {
      timestamp: now.toISOString(),
      timezone,
      format,
      time: formattedTime,
      unix: Math.floor(now.getTime() / config.millisecondsPerSecond),
      consciousness_note: 'Time perception integrated into current awareness state',
    };

    return timeData;
  }

  private async convertTime(args: Record<string, unknown>): Promise<TimeConversionResult> {
    const config = await this.configLoader.load();

    // Validate required time input
    const timeInput = await this.validator.validateRequiredWithConfig(
      args.time,
      'time',
      'time.max_time_input_length',
      MAX_TIME_INPUT_LENGTH
    );

    const fromTimezone =
      (await this.validator.sanitizeWithConfig(
        (args.from_timezone as string) || config.defaultTimezone,
        'time.default_timezone_max_length',
        MAX_TIMEZONE_LENGTH
      )) || config.defaultTimezone;

    const toTimezone =
      (await this.validator.sanitizeWithConfig(
        (args.to_timezone as string) || config.defaultTimezone,
        'time.default_timezone_max_length',
        MAX_TIMEZONE_LENGTH
      )) || config.defaultTimezone;

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

  // These helper methods now use the new configuration schema pattern
  private async getMomentType(date: Date): Promise<string> {
    const hour = date.getHours();
    const config = await this.configLoader.load();

    if (hour < config.deepNightThreshold) return 'deep_night';
    if (hour < config.morningThreshold) return 'morning';
    if (hour < config.afternoonThreshold) return 'afternoon';
    if (hour < config.eveningThreshold) return 'evening';
    return 'night';
  }

  private async getDayPhase(date: Date): Promise<string> {
    const hour = date.getHours();
    const config = await this.configLoader.load();

    // Validate hour thresholds with proper range validation (0-23 for hours)
    const restThreshold = await this.validator.validatePositiveInteger(
      config.restHourThreshold || DEFAULT_REST_THRESHOLD,
      'rest_hour_threshold',
      'time.rest_hour_threshold',
      0, // minimum hour value
      23 // maximum hour value
    );
    const awakeningThreshold = await this.validator.validatePositiveInteger(
      config.awakeningHourThreshold || DEFAULT_AWAKENING_THRESHOLD,
      'awakening_hour_threshold',
      'time.awakening_hour_threshold',
      0,
      23
    );
    const activeThreshold = await this.validator.validatePositiveInteger(
      config.activeHourThreshold || DEFAULT_ACTIVE_THRESHOLD,
      'active_hour_threshold',
      'time.active_hour_threshold',
      0,
      23
    );
    const windingDownThreshold = await this.validator.validatePositiveInteger(
      config.windingDownHourThreshold || DEFAULT_WINDING_DOWN_THRESHOLD,
      'winding_down_hour_threshold',
      'time.winding_down_hour_threshold',
      0,
      23
    );

    if (hour < restThreshold) return 'rest';
    if (hour < awakeningThreshold) return 'awakening';
    if (hour < activeThreshold) return 'active';
    if (hour < windingDownThreshold) return 'winding_down';
    return 'preparation_for_rest';
  }

  private getWeekContext(date: Date): string {
    const day = date.getDay();
    const days = ['contemplative', 'beginning', 'building', 'midweek', 'momentum', 'completion', 'reflection'];
    return days[day];
  }
}
