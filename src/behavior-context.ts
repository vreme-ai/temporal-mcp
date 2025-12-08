/**
 * Behavior Context Data Models
 * Defines the structure for historical behavior patterns
 */

export interface ActivitySession {
  session_id: string;
  burst_start: string; // ISO 8601 - when burst started
  burst_end: string; // ISO 8601 - last interaction (continuously updated)
  burst_length_mins: number; // Duration of this session in minutes
  interaction_count: number;
  timezone: string; // Timezone during this session (user may travel/change timezone)
  project?: string;
}

export interface SleepGap {
  gap_start: string; // ISO 8601 - when last activity before sleep ended
  gap_end: string; // ISO 8601 - when activity resumed
  gap_length_mins: number; // Duration of sleep gap in minutes
  detected_at_hour: number; // What hour (local) was the last activity before sleep (e.g., 23 = 11pm)
  timezone: string; // Timezone when gap was detected
}

export interface LunchGap {
  gap_start: string; // ISO 8601 - when activity paused for lunch
  gap_end: string; // ISO 8601 - when activity resumed
  gap_length_mins: number; // Duration of lunch gap in minutes
  detected_at_hour: number; // What hour (local) was the gap detected (11-14 = lunch hours)
  timezone: string; // Timezone when gap was detected
}

export interface BehaviorContext {
  current_session: ActivitySession | null; // Active session being updated
  completed_sessions: ActivitySession[]; // Past bursts (kept last 50)
  estimated_sleep_gaps: SleepGap[]; // Detected sleep patterns (kept last 30)
  estimated_lunch_gaps: LunchGap[]; // Detected lunch breaks (kept last 30)
  context_switch_threshold_minutes: number; // Default: 30
}
