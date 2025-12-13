/**
 * Temporal Context Data Models
 * Defines the structure for activity burst tracking and temporal context
 */

export interface ActivityBurst {
  start: string; // ISO 8601 - when burst started
  end: string; // ISO 8601 - last interaction before gap (retroactive)
  interaction_count: number;
  gap_to_next_minutes?: number; // Gap before next burst (undefined for current burst)
}

export interface GlobalTemporalContext {
  last_global_activity: string; // ISO 8601
  last_timezone: string;
  activity_history: {
    timestamp: string;
    session_id: string;
    project: string;
    interaction_count: number;
  }[];
  context_switches: {
    timestamp: string;
    gap_hours: number;
    from_project: string;
    to_project: string;
  }[];
}

export interface TemporalContext {
  // Current temporal state
  current_datetime: string; // ISO 8601
  timezone: string;
  day_of_week: string;
  time_of_day: string; // "morning", "afternoon", "evening", "night"
  
  // Activity burst tracking (array-based, last 24 hours)
  activity_bursts: ActivityBurst[];
  current_burst: {
    start: string; // ISO 8601
    last_interaction: string; // ISO 8601 (updates each call)
    interaction_count: number;
  };
  burst_gap_threshold_minutes: number; // Configurable (default: 15)
  
  // Global tracking (file-based)
  last_global_activity: string; // ISO 8601 - last activity across ALL sessions
  days_since_last_activity: number;
  context_switch_detected: boolean; // True if gap > threshold

  // Time of day indicators
  is_late_night: boolean; // After 11 PM
  is_early_morning: boolean; // Before 6 AM

  // Temporal grounding metadata
  temporal_grounding: {
    current_date: string; // "December 7, 2024"
    current_time: string; // "4:30 AM EST"
    relative_time: string; // "now", "14 hours ago", etc.
    timezone_offset: string; // "+05:00"
  };
}

