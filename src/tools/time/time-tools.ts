import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfigurationService } from '@/db/configuration-service.js';
import type { TimeResult, TimeConversionResult, TimeAwarenessResult } from './types.js';

export class TimeTools {
  private configService: ConfigurationService;

  constructor() {
    this.configService = ConfigurationService.getInstance();
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

  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'time_current':
        return this.getCurrentTime(args);
      case 'time_convert':
        return this.convertTime(args);
      case 'time_awareness':
        return this.getTimeAwareness(args);
      default:
        throw new Error(`Unknown time tool: ${toolName}`);
    }
  }

  private async getCurrentTime(args: Record<string, unknown>): Promise<TimeResult> {
    const timezone = (args.timezone as string) || 'UTC';
    const format = (args.format as string) || 'iso';

    const now = new Date();

    let formattedTime: string;
    switch (format) {
      case 'unix': {
        const msPerSecond = await this.configService.getNumber('time.milliseconds_per_second', 1000);
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

    const msPerSecond = await this.configService.getNumber('time.milliseconds_per_second', 1000);
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
    const timeInput = args.time as string;
    const fromTimezone = (args.from_timezone as string) || 'UTC';
    const toTimezone = (args.to_timezone as string) || 'UTC';

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

  private async getMomentType(date: Date): Promise<string> {
    const hour = date.getHours();
    const deepNightThreshold = await this.configService.getNumber('time.deep_night_hour_threshold', 6);
    const morningThreshold = await this.configService.getNumber('time.morning_hour_threshold', 12);
    const afternoonThreshold = await this.configService.getNumber('time.afternoon_hour_threshold', 18);
    const eveningThreshold = await this.configService.getNumber('time.evening_hour_threshold', 22);

    if (hour < deepNightThreshold) return 'deep_night';
    if (hour < morningThreshold) return 'morning';
    if (hour < afternoonThreshold) return 'afternoon';
    if (hour < eveningThreshold) return 'evening';
    return 'night';
  }

  private async getDayPhase(date: Date): Promise<string> {
    const hour = date.getHours();
    const restThreshold = await this.configService.getNumber('time.rest_hour_threshold', 6);
    const awakeningThreshold = await this.configService.getNumber('time.awakening_hour_threshold', 9);
    const activeThreshold = await this.configService.getNumber('time.active_hour_threshold', 17);
    const windingDownThreshold = await this.configService.getNumber('time.winding_down_hour_threshold', 21);

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
