export interface TimeResult {
  timestamp: string;
  timezone: string;
  format: string;
  time: string;
  unix: number;
  consciousness_note: string;
}

export interface TimeConversionResult {
  original: {
    time: string;
    timezone: string;
  };
  converted: {
    time: string;
    timezone: string;
    human_readable: string;
  };
  conversion_timestamp: string;
  consciousness_note: string;
}

export interface TimeAwarenessResult {
  current_time: string;
  temporal_state: string;
  time_perception: string;
  temporal_context: {
    moment_type: string;
    day_phase: string;
    week_context: string;
  };
  consciousness_temporal_notes: string[];
  session_duration?: string;
  temporal_continuity?: string;
}

export type TIME_TOOLS = 'time_current' | 'time_convert' | 'time_awareness';

export interface TimeCurrentArgs {
  timezone?: string;
  format?: 'iso' | 'unix' | 'human' | 'full';
}

export interface TimeConvertArgs {
  time: string;
  from_timezone?: string;
  to_timezone?: string;
}

export interface TimeAwarenessArgs {
  include_duration?: boolean;
}








