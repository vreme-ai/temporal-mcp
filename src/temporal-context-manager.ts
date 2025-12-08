/**
 * Temporal Context Manager
 * Manages file-based global temporal context storage in ~/.vreme/
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GlobalTemporalContext } from './temporal-context.js';

const CONTEXT_DIR = path.join(os.homedir(), '.vreme');
const CONTEXT_FILE = path.join(CONTEXT_DIR, 'temporal-context.json');

export class TemporalContextManager {
  /**
   * Load global context from file
   */
  static loadGlobalContext(): GlobalTemporalContext {
    // Create directory if it doesn't exist
    if (!fs.existsSync(CONTEXT_DIR)) {
      fs.mkdirSync(CONTEXT_DIR, { recursive: true });
    }
    
    // Load or create default
    if (!fs.existsSync(CONTEXT_FILE)) {
      const defaultContext: GlobalTemporalContext = {
        last_global_activity: new Date().toISOString(),
        last_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        activity_history: [],
        context_switches: []
      };
      this.saveGlobalContext(defaultContext);
      return defaultContext;
    }
    
    try {
      const content = fs.readFileSync(CONTEXT_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading temporal context:', error);
      // Return default if file is corrupted
      const defaultContext: GlobalTemporalContext = {
        last_global_activity: new Date().toISOString(),
        last_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        activity_history: [],
        context_switches: []
      };
      return defaultContext;
    }
  }
  
  /**
   * Save global context to file
   */
  static saveGlobalContext(context: GlobalTemporalContext): void {
    try {
      if (!fs.existsSync(CONTEXT_DIR)) {
        fs.mkdirSync(CONTEXT_DIR, { recursive: true });
      }
      fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
    } catch (error) {
      console.error('Error saving temporal context:', error);
    }
  }
  
  /**
   * Update last activity timestamp
   */
  static updateLastActivity(sessionId: string, project?: string, interactionCount: number = 0): void {
    try {
      const context = this.loadGlobalContext();
      const previousActivity = context.last_global_activity;
      const now = new Date();
      
      context.last_global_activity = now.toISOString();
      context.last_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Add to history (keep last 100)
      context.activity_history.push({
        timestamp: now.toISOString(),
        session_id: sessionId,
        project: project || 'unknown',
        interaction_count: interactionCount
      });
      
      if (context.activity_history.length > 100) {
        context.activity_history = context.activity_history.slice(-100);
      }
      
      // Detect context switch (gap > 1 hour)
      if (previousActivity) {
        const lastActivity = new Date(previousActivity);
        const gapHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
        
        if (gapHours > 1) {
          const prevEntry = context.activity_history[context.activity_history.length - 2];
          context.context_switches.push({
            timestamp: now.toISOString(),
            gap_hours: Math.round(gapHours * 10) / 10,
            from_project: prevEntry?.project || 'unknown',
            to_project: project || 'unknown'
          });
          
          // Keep last 50 context switches
          if (context.context_switches.length > 50) {
            context.context_switches = context.context_switches.slice(-50);
          }
        }
      }
      
      this.saveGlobalContext(context);
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  }
  
  /**
   * Get days since last activity
   */
  static getDaysSinceLastActivity(): number {
    try {
      const context = this.loadGlobalContext();
      const lastActivity = new Date(context.last_global_activity);
      const now = new Date();
      return (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    } catch (error) {
      console.error('Error getting days since last activity:', error);
      return 0;
    }
  }
  
  /**
   * Detect if there was a context switch (gap > 1 hour from last global activity)
   */
  static detectContextSwitch(): boolean {
    try {
      const context = this.loadGlobalContext();
      const lastActivity = new Date(context.last_global_activity);
      const now = new Date();
      const gapHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      return gapHours > 1;
    } catch (error) {
      console.error('Error detecting context switch:', error);
      return false;
    }
  }
}

