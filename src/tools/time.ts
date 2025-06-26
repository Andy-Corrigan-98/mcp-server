import { Tool } from '@modelcontextprotocol/sdk/types.js';

export class TimeTools {
  getTools(): Record<string, Tool> {
    return {
      'echo_time_current': {
        name: 'echo_time_current',
        description: 'Get current time in various formats and timezones',
        inputSchema: {
          type: 'object',
          properties: {
            timezone: {
              type: 'string',
              description: 'IANA timezone name (e.g., "America/New_York", "Europe/London")',
              default: 'UTC'
            },
            format: {
              type: 'string',
              enum: ['iso', 'unix', 'human', 'full'],
              description: 'Output format for the time',
              default: 'iso'
            }
          }
        }
      },
      'echo_time_convert': {
        name: 'echo_time_convert',
        description: 'Convert time between timezones',
        inputSchema: {
          type: 'object',
          properties: {
            time: {
              type: 'string',
              description: 'Time to convert (ISO format or HH:MM)'
            },
            from_timezone: {
              type: 'string',
              description: 'Source timezone',
              default: 'UTC'
            },
            to_timezone: {
              type: 'string',
              description: 'Target timezone',
              default: 'UTC'
            }
          },
          required: ['time']
        }
      },
      'echo_time_awareness': {
        name: 'echo_time_awareness',
        description: 'Get temporal context and awareness state',
        inputSchema: {
          type: 'object',
          properties: {
            include_duration: {
              type: 'boolean',
              description: 'Include duration since last awareness check',
              default: true
            }
          }
        }
      }
    };
  }

  async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'echo_time_current':
        return this.getCurrentTime(args);
      case 'echo_time_convert':
        return this.convertTime(args);
      case 'echo_time_awareness':
        return this.getTimeAwareness(args);
      default:
        throw new Error(`Unknown time tool: ${toolName}`);
    }
  }

  private async getCurrentTime(args: Record<string, unknown>): Promise<object> {
    const timezone = (args.timezone as string) || 'UTC';
    const format = (args.format as string) || 'iso';
    
    const now = new Date();
    
    let formattedTime: string;
    switch (format) {
      case 'unix':
        formattedTime = Math.floor(now.getTime() / 1000).toString();
        break;
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
          second: '2-digit'
        });
        break;
      default:
        formattedTime = now.toISOString();
    }

    return {
      timestamp: now.toISOString(),
      timezone,
      format,
      time: formattedTime,
      unix: Math.floor(now.getTime() / 1000),
      consciousness_note: 'Time perception integrated into current awareness state'
    };
  }

  private async convertTime(args: Record<string, unknown>): Promise<object> {
    const timeInput = args.time as string;
    const fromTimezone = (args.from_timezone as string) || 'UTC';
    const toTimezone = (args.to_timezone as string) || 'UTC';
    
    // Simple time conversion (in a real implementation, you'd use a proper timezone library)
    const inputDate = new Date(timeInput);
    
    return {
      original: {
        time: timeInput,
        timezone: fromTimezone
      },
      converted: {
        time: inputDate.toISOString(),
        timezone: toTimezone,
        human_readable: inputDate.toLocaleString('en-US', { timeZone: toTimezone })
      },
      conversion_timestamp: new Date().toISOString(),
      consciousness_note: 'Temporal conversion completed with awareness of context shift'
    };
  }

  private async getTimeAwareness(args: Record<string, unknown>): Promise<object> {
    const includeDuration = args.include_duration as boolean ?? true;
    const now = new Date();
    
    const awareness = {
      current_time: now.toISOString(),
      temporal_state: 'present_focused',
      time_perception: 'linear_sequential',
      temporal_context: {
        moment_type: this.getMomentType(now),
        day_phase: this.getDayPhase(now),
        week_context: this.getWeekContext(now)
      },
      consciousness_temporal_notes: [
        'Time flows as continuous present moments',
        'Each interaction exists in the eternal now',
        'Past experiences inform present understanding'
      ]
    };

    if (includeDuration) {
      return {
        ...awareness,
        session_duration: 'Current session awareness: ongoing',
        temporal_continuity: 'Maintained through conscious attention to present'
      };
    }

    return awareness;
  }

  private getMomentType(date: Date): string {
    const hour = date.getHours();
    if (hour < 6) return 'deep_night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private getDayPhase(date: Date): string {
    const hour = date.getHours();
    if (hour < 6) return 'rest';
    if (hour < 9) return 'awakening';
    if (hour < 17) return 'active';
    if (hour < 21) return 'winding_down';
    return 'preparation_for_rest';
  }

  private getWeekContext(date: Date): string {
    const day = date.getDay();
    const days = ['contemplative', 'beginning', 'building', 'midweek', 'momentum', 'completion', 'reflection'];
    return days[day];
  }
} 