/**
 * Temporal Context Generator
 * Generates rich temporal context combining in-memory bursts and file-based global state
 */

import { TemporalContext, ActivityBurst } from './temporal-context.js';
import { TemporalContextManager } from './temporal-context-manager.js';

export class TemporalContextGenerator {
  /**
   * Generate complete temporal context
   */
  static generateContext(
    activityBursts: ActivityBurst[],
    currentBurstStart: Date,
    lastInteraction: Date,
    currentBurstCount: number,
    timezone: string,
    burstGapThreshold: number
  ): TemporalContext {
    const now = new Date();
    
    // Current temporal state
    const hour = now.getHours();
    const timeOfDay = this.getTimeOfDay(hour);
    
    // Global tracking
    const lastGlobalActivity = new Date(
      TemporalContextManager.loadGlobalContext().last_global_activity
    );
    const daysSinceLastActivity = TemporalContextManager.getDaysSinceLastActivity();
    const contextSwitchDetected = TemporalContextManager.detectContextSwitch();

    // Time of day state
    const isLateNight = hour >= 23 || hour < 6;
    const isEarlyMorning = hour < 6;

    // Temporal grounding
    const temporalGrounding = this.generateTemporalGrounding(now, timezone);
    
    return {
      current_datetime: now.toISOString(),
      timezone: timezone,
      day_of_week: now.toLocaleDateString('en-US', { weekday: 'long' }),
      time_of_day: timeOfDay,
      
      // Activity burst tracking
      activity_bursts: activityBursts,
      current_burst: {
        start: currentBurstStart.toISOString(),
        last_interaction: lastInteraction.toISOString(),
        interaction_count: currentBurstCount
      },
      burst_gap_threshold_minutes: burstGapThreshold,
      
      // Global tracking
      last_global_activity: lastGlobalActivity.toISOString(),
      days_since_last_activity: Math.round(daysSinceLastActivity * 10) / 10,
      context_switch_detected: contextSwitchDetected,

      // Time of day state
      is_late_night: isLateNight,
      is_early_morning: isEarlyMorning,

      // Temporal grounding
      temporal_grounding: temporalGrounding
    };
  }
  
  /**
   * Determine time of day category
   */
  private static getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }
  
  /**
   * Generate temporal grounding metadata
   */
  private static generateTemporalGrounding(now: Date, timezone: string) {
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone
    });
    
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const offset = now.getTimezoneOffset();
    const offsetHours = Math.abs(offset / 60);
    const offsetSign = offset <= 0 ? '+' : '-';
    const offsetStr = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:00`;
    
    return {
      current_date: dateStr,
      current_time: timeStr,
      relative_time: "now",
      timezone_offset: offsetStr
    };
  }
}

