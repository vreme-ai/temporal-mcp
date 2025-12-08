/**
 * Behavior Context Manager
 * Manages file-based behavior pattern storage in ~/.vreme/
 *
 * EFFICIENT DESIGN:
 * - ONE session object per burst (updated in place)
 * - 30-minute gap threshold for context switches
 * - No duplicate entries for same session
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BehaviorContext, ActivitySession, SleepGap, LunchGap } from './behavior-context.js';

const CONTEXT_DIR = path.join(os.homedir(), '.vreme');
const BEHAVIOR_FILE = path.join(CONTEXT_DIR, 'behavior-context.json');
const DEFAULT_THRESHOLD_MINUTES = 30; // 30-minute gap = context switch

// Human pattern detection thresholds
const SLEEP_MIN_GAP_MINS = 150; // 2.5 hours minimum for sleep detection
const SLEEP_NIGHT_HOUR_START = 22; // 10pm
const SLEEP_NIGHT_HOUR_END = 6; // 6am
const LUNCH_MIN_GAP_MINS = 30; // 30 minutes minimum for lunch detection
const LUNCH_HOUR_START = 11; // 11am
const LUNCH_HOUR_END = 14; // 2pm

export class BehaviorContextManager {
  /**
   * Load behavior context from file
   */
  static loadBehaviorContext(): BehaviorContext {
    // Create directory if it doesn't exist
    if (!fs.existsSync(CONTEXT_DIR)) {
      fs.mkdirSync(CONTEXT_DIR, { recursive: true });
    }

    // Load or create default
    if (!fs.existsSync(BEHAVIOR_FILE)) {
      const defaultContext: BehaviorContext = {
        current_session: null,
        completed_sessions: [],
        estimated_sleep_gaps: [],
        estimated_lunch_gaps: [],
        context_switch_threshold_minutes: DEFAULT_THRESHOLD_MINUTES
      };
      this.saveBehaviorContext(defaultContext);
      return defaultContext;
    }

    try {
      const content = fs.readFileSync(BEHAVIOR_FILE, 'utf-8');
      const parsed = JSON.parse(content);

      // Migration: Add new fields if missing
      if (!parsed.estimated_sleep_gaps) {
        parsed.estimated_sleep_gaps = [];
      }
      if (!parsed.estimated_lunch_gaps) {
        parsed.estimated_lunch_gaps = [];
      }
      if (!parsed.context_switch_threshold_minutes) {
        parsed.context_switch_threshold_minutes = DEFAULT_THRESHOLD_MINUTES;
      }

      return parsed;
    } catch (error) {
      console.error('Error loading behavior context:', error);
      // Return default if file is corrupted
      const defaultContext: BehaviorContext = {
        current_session: null,
        completed_sessions: [],
        estimated_sleep_gaps: [],
        estimated_lunch_gaps: [],
        context_switch_threshold_minutes: DEFAULT_THRESHOLD_MINUTES
      };
      return defaultContext;
    }
  }

  /**
   * Save behavior context to file
   */
  static saveBehaviorContext(context: BehaviorContext): void {
    try {
      if (!fs.existsSync(CONTEXT_DIR)) {
        fs.mkdirSync(CONTEXT_DIR, { recursive: true });
      }
      fs.writeFileSync(BEHAVIOR_FILE, JSON.stringify(context, null, 2));
    } catch (error) {
      console.error('Error saving behavior context:', error);
    }
  }

  /**
   * Update session tracking
   * EFFICIENT: Updates ONE session object per burst, no duplicates
   */
  static updateSession(
    sessionId: string,
    lastGlobalActivity: Date | null,
    lastTimezone: string,
    project?: string,
    interactionCount: number = 1
  ): void {
    try {
      const context = this.loadBehaviorContext();
      const now = new Date();

      // Calculate gap from last activity
      const gapMinutes = lastGlobalActivity
        ? (now.getTime() - lastGlobalActivity.getTime()) / (1000 * 60)
        : 0;

      const isContextSwitch = gapMinutes > context.context_switch_threshold_minutes;

      // If context switch OR no current session, complete old session and start new one
      if (isContextSwitch || !context.current_session) {
        // Complete current session if exists
        if (context.current_session) {
          // Calculate session length
          const sessionStart = new Date(context.current_session.burst_start);
          const sessionEnd = new Date(context.current_session.burst_end);
          context.current_session.burst_length_mins =
            (sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60);

          context.completed_sessions.push(context.current_session);

          // Keep last 50 sessions
          if (context.completed_sessions.length > 50) {
            context.completed_sessions = context.completed_sessions.slice(-50);
          }

          // DETECT SLEEP GAP: 2.5+ hours gap during late night (10pm-6am)
          if (lastGlobalActivity && gapMinutes >= SLEEP_MIN_GAP_MINS) {
            const lastActivityHour = parseInt(lastGlobalActivity.toLocaleString('en-US', {
              hour: 'numeric',
              hour12: false,
              timeZone: lastTimezone
            }));

            // Check if last activity was during night hours (22:00 - 06:00)
            const isNightSession = lastActivityHour >= SLEEP_NIGHT_HOUR_START || lastActivityHour < SLEEP_NIGHT_HOUR_END;

            if (isNightSession) {
              const sleepGap: SleepGap = {
                gap_start: lastGlobalActivity.toISOString(),
                gap_end: now.toISOString(),
                gap_length_mins: Math.round(gapMinutes),
                detected_at_hour: lastActivityHour
              };
              context.estimated_sleep_gaps.push(sleepGap);

              // Keep last 30 sleep gaps
              if (context.estimated_sleep_gaps.length > 30) {
                context.estimated_sleep_gaps = context.estimated_sleep_gaps.slice(-30);
              }
            }
          }

          // DETECT LUNCH GAP: 30+ min gap during lunch hours (11am-2pm)
          if (lastGlobalActivity && gapMinutes >= LUNCH_MIN_GAP_MINS) {
            const gapStartHour = parseInt(lastGlobalActivity.toLocaleString('en-US', {
              hour: 'numeric',
              hour12: false,
              timeZone: lastTimezone
            }));

            // Check if gap started during lunch hours (11:00 - 14:00)
            const isLunchTime = gapStartHour >= LUNCH_HOUR_START && gapStartHour < LUNCH_HOUR_END;

            if (isLunchTime) {
              const lunchGap: LunchGap = {
                gap_start: lastGlobalActivity.toISOString(),
                gap_end: now.toISOString(),
                gap_length_mins: Math.round(gapMinutes),
                detected_at_hour: gapStartHour
              };
              context.estimated_lunch_gaps.push(lunchGap);

              // Keep last 30 lunch gaps
              if (context.estimated_lunch_gaps.length > 30) {
                context.estimated_lunch_gaps = context.estimated_lunch_gaps.slice(-30);
              }
            }
          }
        }

        // Start new session
        context.current_session = {
          session_id: sessionId,
          burst_start: now.toISOString(),
          burst_end: now.toISOString(),
          burst_length_mins: 0,
          interaction_count: interactionCount,
          project: project
        };
      } else {
        // Continue current session - just update end time, count, and length
        if (context.current_session) {
          context.current_session.burst_end = now.toISOString();
          context.current_session.interaction_count += interactionCount;

          // Update burst length
          const sessionStart = new Date(context.current_session.burst_start);
          context.current_session.burst_length_mins =
            (now.getTime() - sessionStart.getTime()) / (1000 * 60);

          // Update project if provided
          if (project && !context.current_session.project) {
            context.current_session.project = project;
          }
        }
      }

      this.saveBehaviorContext(context);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  /**
   * Get current session info (for debugging/monitoring)
   */
  static getCurrentSession(): ActivitySession | null {
    try {
      const context = this.loadBehaviorContext();
      return context.current_session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Get context switch threshold
   */
  static getThreshold(): number {
    try {
      const context = this.loadBehaviorContext();
      return context.context_switch_threshold_minutes;
    } catch (error) {
      console.error('Error getting threshold:', error);
      return DEFAULT_THRESHOLD_MINUTES;
    }
  }
}
