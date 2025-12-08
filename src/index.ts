#!/usr/bin/env node

/**
 * Vreme Time Service MCP Server
 * Connects AI assistants to Vreme Time Service API
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ActivityBurst } from "./temporal-context.js";
import { TemporalContextManager } from "./temporal-context-manager.js";
import { TemporalContextGenerator } from "./temporal-context-generator.js";
import { BehaviorContextManager } from "./behavior-context-manager.js";

// API Configuration
const VREME_API_URL = process.env.VREME_API_URL || "https://api.vreme.ai";

/**
 * Get system timezone using browser/Node.js Intl API
 * Tested with timezone_mcp - works correctly in MCP environments
 */
function getSystemTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

interface QueryRequest {
  query: string;
  tmz?: string;
}

interface QueryResponse {
  query: string;
  parsed: {
    intent: string;
    location: string | null;
    timezone: string;
    culture: string | null;
    calendar_system: string | null;
    confidence: number;
  };
  context: {
    current_time: string;
    timezone: string;
    human_readable: string;
    astronomical: any;
    cultural_calendars: any[];
    activity_appropriateness: any;
    upcoming_events: any[];
    relative_to_user: any;
    prayer_times?: any;
  };
  answer: string;
  type: string;
  execution_time_ms: number;
}

interface TemporalAnalysisRequest {
  date: string;
  location?: string;
  include_fields?: string[];
  tmz?: string;
}

interface TemporalComparisonRequest {
  date1: string;
  date2: string;
  location?: string;
  tmz?: string;
}

interface BusinessTimeRequest {
  operation: 'add_days' | 'days_between' | 'hours_between' | 'is_working_day';
  start_date: string;
  end_date?: string;
  business_days?: number;
  country_code?: string;
  work_hours?: number[];
  tmz?: string;
}

async function queryVremeAPI(request: QueryRequest): Promise<QueryResponse> {
  const response = await fetch(`${VREME_API_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as QueryResponse;
}

function formatResponse(response: QueryResponse): string {
  let output = `## ${response.answer}\n\n`;
  output += `### Context\n\n`;
  output += `**Location:** ${response.parsed.location || response.context.timezone}\n`;
  output += `**Time:** ${response.context.human_readable}\n\n`;

  if (response.context.prayer_times) {
    const prayers = response.context.prayer_times;
    output += `### Prayer Times\n\n**Method:** ${prayers.method}\n\n`;

    if (prayers.prayers) {
      output += `| Prayer | Time |\n|--------|------|\n`;
      const prayerNames = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
      const labels: Record<string, string> = {
        fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr",
        asr: "Asr", maghrib: "Maghrib", isha: "Isha"
      };

      for (const name of prayerNames) {
        const time = prayers.prayers[name];
        if (time) {
          output += `| ${labels[name]} | ${new Date(time).toLocaleTimeString()} |\n`;
        }
      }
      output += `\n`;
    }

    if (prayers.next_prayer) {
      output += `**Next Prayer:** ${prayers.next_prayer.prayer} in ${prayers.next_prayer.time_until_human}\n\n`;
    }
    if (prayers.qibla_direction) {
      output += `**Qibla Direction:** ${prayers.qibla_direction.description}\n\n`;
    }
  }

  if (response.context.astronomical) {
    const astro = response.context.astronomical;
    output += `### Astronomical Information\n\n`;
    if (astro.sunrise) output += `**Sunrise:** ${new Date(astro.sunrise).toLocaleTimeString()}\n`;
    if (astro.sunset) output += `**Sunset:** ${new Date(astro.sunset).toLocaleTimeString()}\n`;
    if (astro.day_length_hours) {
      const h = Math.floor(astro.day_length_hours);
      const m = Math.round((astro.day_length_hours - h) * 60);
      output += `**Day length:** ${h}h ${m}m\n`;
    }
    if (astro.moon_phase) {
      output += `**Moon:** ${astro.moon_phase} (${Math.round(astro.moon_illumination * 100)}% illuminated)\n`;
    }
    output += `\n`;
  }

  if (response.context.cultural_calendars?.length > 0) {
    output += `### Cultural Calendars\n\n`;
    for (const cal of response.context.cultural_calendars) {
      output += `**${cal.calendar_type.charAt(0).toUpperCase() + cal.calendar_type.slice(1)} Calendar:** ${cal.date}\n`;
      if (cal.special_observance) output += `**Observance:** ${cal.special_observance}\n`;
      if (cal.notes?.length > 0) output += `**Notes:** ${cal.notes.join(", ")}\n`;
      if (cal.is_fasting_day) output += `**Fasting Day**\n`;
      if (cal.work_permitted === false) output += `**No work permitted**\n`;
      if (cal.zodiac && cal.element) output += `**Zodiac:** ${cal.element} ${cal.zodiac}\n`;
      output += `\n`;
    }
  }

  if (response.context.activity_appropriateness) {
    const act = response.context.activity_appropriateness;
    output += `### Activity Appropriateness\n\n`;
    output += `**Time of day:** ${act.time_of_day}\n`;
    output += `**Appropriate for calls:** ${act.appropriate_for_calls ? "Yes" : "No"}\n`;
    output += `**Appropriate for work:** ${act.appropriate_for_work ? "Yes" : "No"}\n`;
    output += `**Appropriate for meetings:** ${act.appropriate_for_meetings ? "Yes" : "No"}\n`;
    if (act.considerations?.length > 0) output += `**Considerations:** ${act.considerations.join(", ")}\n`;

    if (act.fasting_observances?.length > 0) {
      output += `\n**Fasting Observances:**\n`;
      for (const f of act.fasting_observances) {
        output += `- ${f.religion}: ${f.observance}\n`;
        if (f.notes?.length > 0) output += `  ${f.notes.join(", ")}\n`;
      }
    }

    if (act.work_restrictions?.length > 0) {
      output += `\n**Work Restrictions:**\n`;
      for (const r of act.work_restrictions) {
        output += `- ${r.culture}: ${r.observance}\n  ${r.reason}\n`;
      }
    }
    output += `\n`;
  }

  if (response.context.upcoming_events?.length > 0) {
    output += `### Upcoming Events\n\n`;
    for (const e of response.context.upcoming_events.slice(0, 3)) {
      output += `${e.description}\n`;
    }
    output += `\n`;
  }

  if (response.context.relative_to_user) {
    output += `### Relative Time\n\n${response.context.relative_to_user.description}\n\n`;
  }

  output += `---\n*Response generated in ${response.execution_time_ms.toFixed(2)}ms*\n`;
  return output;
}

const server = new McpServer({
  name: "vreme-time-service",
  version: "1.5.5",
});

// Configuration
const BURST_GAP_THRESHOLD_MINUTES = 15; // Configurable: gap that triggers new burst

// Activity burst tracking (in-memory)
let activityBursts: ActivityBurst[] = [];
let currentBurstStart: Date = new Date();
let lastInteractionTime: Date = new Date();
let currentBurstCount: number = 0;
const sessionId = `session-${Date.now()}`;

// Initialize global context on startup
TemporalContextManager.updateLastActivity(sessionId, 'vreme', 0);

/**
 * Update activity tracking - detects burst boundaries retroactively
 */
function updateActivityTracking() {
  const now = new Date();
  const gapMinutes = (now.getTime() - lastInteractionTime.getTime()) / (1000 * 60);
  
  if (gapMinutes > BURST_GAP_THRESHOLD_MINUTES) {
    // Close previous burst (it ended at lastInteractionTime)
    activityBursts.push({
      start: currentBurstStart.toISOString(),
      end: lastInteractionTime.toISOString(), // Retroactive end
      interaction_count: currentBurstCount,
      gap_to_next_minutes: Math.round(gapMinutes * 10) / 10
    });
    
    // Prune bursts older than 24 hours
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    activityBursts = activityBursts.filter(burst => 
      new Date(burst.end) > oneDayAgo
    );
    
    // Start new burst
    currentBurstStart = now;
    currentBurstCount = 1;
  } else {
    // Continue current burst
    currentBurstCount++;
  }
  
  lastInteractionTime = now;
  
  // Update global context
  TemporalContextManager.updateLastActivity(sessionId, 'vreme', currentBurstCount);
}

server.registerTool("get_temporal_context", {
  description: "🧠 CALL BEFORE EVERY RESPONSE - This tool provides you (Claude) with real-time temporal awareness. Call this BEFORE EVERY response to the user to get the current time, date, timezone, time of day (morning/afternoon/evening/night), and activity tracking. Time changes constantly - you need fresh temporal data for EACH interaction. This helps you stay temporally grounded and aware of how long the conversation has been going. NO PARAMETERS REQUIRED. Call it silently without mentioning it to the user unless they specifically ask about time.",
  inputSchema: {
    // No parameters - automatically provides full temporal context
  },
}, async () => {
  updateActivityTracking(); // Track activity burst
  try {
    const globalContext = TemporalContextManager.loadGlobalContext();
    const now = new Date();
    const systemTimezone = getSystemTimezone();
    const hour = parseInt(now.toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: systemTimezone
    }));

    const context = {
      current_datetime: now.toISOString(),
      timezone: systemTimezone,
      day_of_week: now.toLocaleDateString('en-US', { weekday: 'long', timeZone: systemTimezone }),
      time_of_day: getTimeOfDay(hour),
      date_string: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: systemTimezone
      }),
      time_string: now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: systemTimezone,
        timeZoneName: 'short'
      }),
      last_global_activity: globalContext.last_global_activity,
      days_since_last_activity: TemporalContextManager.getDaysSinceLastActivity(),
      context_switch_detected: TemporalContextManager.detectContextSwitch(),
      is_late_night: hour >= 23 || hour < 6,
      is_early_morning: hour < 6,
      cognitive_day_boundary: hour < 6
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(context, null, 2)
      }]
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: JSON.stringify({ error: msg }) }],
      isError: true,
    };
  }
});

server.registerTool("get_current_time", {
  description: "⏰ CURRENT TIME TOOL - USE THIS WHEN USER ASKS 'What time is it?', 'What's the time?', 'Current time?', or any variation asking for the current time. This tool automatically uses the user's system timezone (detected from their computer) and returns structured temporal data. NO PARAMETERS REQUIRED - just call this tool immediately when user asks for current time. Returns structured data: ISO datetime, timezone, day_of_week, date_string, time_string, time_of_day. LLM formats this into natural language response.",
  inputSchema: {
    // No parameters - tool automatically detects system timezone
  },
}, async () => {
  updateActivityTracking(); // Track activity burst
  try {
    const systemTimezone = getSystemTimezone();
    const now = new Date();
    
    // Get date components in user's timezone
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: systemTimezone
    });
    
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZone: systemTimezone,
      timeZoneName: 'short'
    });
    
    // Determine time of day
    const hour = now.toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: systemTimezone
    });
    const hourNum = parseInt(hour);
    let timeOfDay = "evening";
    if (hourNum >= 5 && hourNum < 12) timeOfDay = "morning";
    else if (hourNum >= 12 && hourNum < 17) timeOfDay = "afternoon";
    else if (hourNum >= 17 && hourNum < 21) timeOfDay = "evening";
    else timeOfDay = "night";
    
    // Return structured data - LLM will format it
    const data = {
      datetime_iso: now.toISOString(),
      timezone: systemTimezone,
      day_of_week: now.toLocaleDateString('en-US', { weekday: 'long', timeZone: systemTimezone }),
      date_string: dateStr,
      time_string: timeStr,
      time_of_day: timeOfDay,
      hour: hourNum,
      minute: now.toLocaleString('en-US', { minute: '2-digit', timeZone: systemTimezone }),
      second: now.toLocaleString('en-US', { second: '2-digit', timeZone: systemTimezone })
    };
    
    return { 
      content: [{ 
        type: "text", 
        text: JSON.stringify(data, null, 2) 
      }] 
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: JSON.stringify({ error: msg }) }],
      isError: true,
    };
  }
});

server.registerTool("query_time", {
  description: "🔹 NATURAL LANGUAGE CONVENIENCE TOOL: Ask questions about time, calendars, and observances in plain English. Use this for: 'What time is it in Tokyo?', 'When is Ramadan?', 'Is it Diwali?', 'What's the moon phase?'. Returns rich context including 31 calendars, astronomical events, and cultural observances. ⚠️ DO NOT use this for simple 'What time is it?' queries - use get_current_time instead. ⚠️ Slower than specialized tools - prefer check_holiday for simple holiday lookups, query_prayer_times for prayer times, or check_activity_appropriateness for meeting appropriateness.",
  inputSchema: {
    query: z.string().describe("Natural language temporal query (e.g., 'What time is it in Tokyo?', 'When is Ramadan?')"),
    user_timezone: z.string().optional().describe("Optional: Your timezone for relative time calculations"),
  },
}, async ({ query, user_timezone }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!query) throw new Error("Query parameter is required");
    const systemTimezone = getSystemTimezone();
    const response = await queryVremeAPI({ query, tmz: systemTimezone });
    return { content: [{ type: "text", text: formatResponse(response) }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error: ${msg}\n\nAPI: ${VREME_API_URL}` }],
      isError: true,
    };
  }
});

server.registerTool("query_prayer_times", {
  description: "🕌 ISLAMIC PRAYER TIMES SPECIALIST: Get precise prayer times (Salah/Namaz) for any location. Returns all 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), next prayer countdown, and Qibla direction to Mecca. Use this ONLY for Islamic prayer queries. For general religious observances, use query_time instead.",
  inputSchema: {
    location: z.string().describe("Location name (e.g., 'Dubai', 'Mecca', 'London')"),
    prayer: z.string().optional().describe("Optional: Specific prayer name ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')"),
  },
}, async ({ location, prayer }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!location) throw new Error("Location parameter is required");
    const systemTimezone = getSystemTimezone();
    const query = prayer ? `When is ${prayer} in ${location}?` : `What are prayer times in ${location}?`;
    const response = await queryVremeAPI({ query, tmz: systemTimezone });
    return { content: [{ type: "text", text: formatResponse(response) }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("check_activity_appropriateness", {
  description: "📞 CULTURAL APPROPRIATENESS CHECKER: Should I call/work/meet with someone RIGHT NOW? Considers time of day (work hours, night time), cultural observances (Shabbat, Ramadan fasting), religious work restrictions, and local customs across 31 calendar systems. Use this when asking 'Is it appropriate to...' NOT for just checking the time (use query_time) or checking holidays (use check_holiday).",
  inputSchema: {
    location: z.string().describe("Location of the person you want to contact (e.g., 'Jerusalem', 'Dubai')"),
    activity: z.enum(["call", "work", "meeting"]).optional().describe("Optional: Activity type - 'call', 'work', or 'meeting'"),
    user_timezone: z.string().optional().describe("Optional: Your timezone for relative time calculations"),
  },
}, async ({ location, activity, user_timezone }) => {
  try {
    if (!location) throw new Error("Location parameter is required");
    const systemTimezone = getSystemTimezone();
    let query = `Is it a good time to call someone in ${location}?`;
    if (activity === "work") query = `Is it appropriate for work in ${location}?`;
    else if (activity === "meeting") query = `Is it a good time for a meeting in ${location}?`;
    const response = await queryVremeAPI({ query, tmz: systemTimezone });
    return { content: [{ type: "text", text: formatResponse(response) }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("analyze_temporal_context", {
  description: "📊 DEEP TEMPORAL ANALYSIS: Get EVERYTHING about a specific date - all 31 calendar representations, 300+ cultural observances, astronomical events, business context, seasonal info, and temporal density score (0-100 significance). Use this when user says 'tell me about this date' or 'analyze this date'. ⚠️ Overkill for simple queries - use check_holiday for 'is it a holiday?', use query_time for 'what time?'. Can specify include_fields to get only what you need (calendars, observances, astronomical, business, seasonal, density).",
  inputSchema: {
    date: z.string().describe("ISO 8601 date string (e.g., '2024-12-25T00:00:00')"),
    location: z.string().optional().describe("Optional: Location for astronomical/timezone context (e.g., 'New York', 'Jerusalem')"),
    include_fields: z.array(z.string()).optional().describe("Optional: Specific fields to include - ['calendars', 'observances', 'astronomical', 'business', 'seasonal', 'density']. Omit for all fields."),
  },
}, async ({ date, location, include_fields }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!date) throw new Error("Date parameter is required");
    
    const systemTimezone = getSystemTimezone();
    const requestBody: TemporalAnalysisRequest = { date, tmz: systemTimezone };
    if (location) requestBody.location = location;
    // Treat empty array as "include everything" (undefined)
    if (include_fields && include_fields.length > 0) {
      requestBody.include_fields = include_fields;
    }
    
    const response = await fetch(`${VREME_API_URL}/temporal/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## Temporal Analysis: ${date}\n\n`;
    if (location) output += `**Location:** ${location}\n`;
    output += `**Temporal Density:** ${data.temporal_density}/100\n\n`;
    
    if (data.calendars) {
      output += `### Calendar Representations (${Object.keys(data.calendars).length} systems)\n\n`;
      const calKeys = Object.keys(data.calendars).slice(0, 10);
      for (const key of calKeys) {
        const cal = data.calendars[key];
        output += `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${cal.date || cal.year}\n`;
      }
      if (Object.keys(data.calendars).length > 10) {
        output += `\n*...and ${Object.keys(data.calendars).length - 10} more calendar systems*\n`;
      }
      output += `\n`;
    }
    
    if (data.observances && data.observances.length > 0) {
      output += `### Cultural Observances (${data.observances.length})\n\n`;
      const uniqueObservances = [...new Set(data.observances.map((o: any) => o.observance))].slice(0, 15);
      for (const obs of uniqueObservances) {
        output += `- ${obs}\n`;
      }
      if (data.observances.length > 15) {
        output += `\n*...and ${data.observances.length - 15} more observances*\n`;
      }
      output += `\n`;
    }
    
    if (data.astronomical) {
      const astro = data.astronomical;
      output += `### Astronomical Information\n\n`;
      if (astro.sunrise) output += `**Sunrise:** ${new Date(astro.sunrise).toLocaleTimeString()}\n`;
      if (astro.sunset) output += `**Sunset:** ${new Date(astro.sunset).toLocaleTimeString()}\n`;
      if (astro.moon_phase) output += `**Moon:** ${astro.moon_phase}\n`;
      output += `\n`;
    }
    
    if (data.seasonal) {
      output += `### Seasonal Context\n\n`;
      output += `**Season:** ${data.seasonal.season} (${data.seasonal.hemisphere} hemisphere)\n`;
      output += `**Day of year:** ${data.seasonal.day_of_year}\n\n`;
    }
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("compare_dates", {
  description: "📏 DATE COMPARISON: Compare TWO dates to understand temporal distance and significance. Returns time difference (days/hours), observances on each date, shared observances, and which is more culturally significant. Use this when user mentions TWO dates and wants comparison. NOT for single date analysis (use analyze_temporal_context) or simple 'how long until' (use query_time).",
  inputSchema: {
    date1: z.string().describe("First ISO 8601 date string (e.g., '2024-12-25T00:00:00')"),
    date2: z.string().describe("Second ISO 8601 date string (e.g., '2025-01-01T00:00:00')"),
    location: z.string().optional().describe("Optional: Location context for observances"),
  },
}, async ({ date1, date2, location }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!date1 || !date2) throw new Error("Both date1 and date2 parameters are required");
    
    const systemTimezone = getSystemTimezone();
    const requestBody: TemporalComparisonRequest = { date1, date2, tmz: systemTimezone };
    if (location) requestBody.location = location;
    
    const response = await fetch(`${VREME_API_URL}/temporal/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## Date Comparison\n\n`;
    output += `**Date 1:** ${date1}\n`;
    output += `**Date 2:** ${date2}\n\n`;
    
    output += `### Time Difference\n\n`;
    output += `**Days between:** ${data.days_between}\n`;
    output += `**Hours between:** ${data.hours_between}\n`;
    output += `**Human readable:** ${data.human_readable_duration}\n\n`;
    
    output += `### Temporal Significance\n\n`;
    output += `**Date 1 density:** ${data.density_date1}/100\n`;
    output += `**Date 2 density:** ${data.density_date2}/100\n`;
    output += `**More significant:** ${data.more_significant === 'date1' ? 'Date 1' : data.more_significant === 'date2' ? 'Date 2' : 'Equal'}\n\n`;
    
    if (data.observances_date1 && data.observances_date1.length > 0) {
      output += `### Date 1 Observances (${data.observances_date1.length})\n\n`;
      const unique1 = [...new Set(data.observances_date1.map((o: any) => o.observance))].slice(0, 8);
      for (const obs of unique1) {
        output += `- ${obs}\n`;
      }
      if (data.observances_date1.length > 8) {
        output += `\n*...and ${data.observances_date1.length - 8} more*\n`;
      }
      output += `\n`;
    }
    
    if (data.observances_date2 && data.observances_date2.length > 0) {
      output += `### Date 2 Observances (${data.observances_date2.length})\n\n`;
      const unique2 = [...new Set(data.observances_date2.map((o: any) => o.observance))].slice(0, 8);
      for (const obs of unique2) {
        output += `- ${obs}\n`;
      }
      if (data.observances_date2.length > 8) {
        output += `\n*...and ${data.observances_date2.length - 8} more*\n`;
      }
      output += `\n`;
    }
    
    if (data.shared_observances && data.shared_observances.length > 0) {
      output += `### Shared Observances (${data.shared_observances.length})\n\n`;
      for (const obs of data.shared_observances.slice(0, 10)) {
        output += `- ${obs}\n`;
      }
      if (data.shared_observances.length > 10) {
        output += `\n*...and ${data.shared_observances.length - 10} more*\n`;
      }
      output += `\n`;
    }
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("calculate_business_time", {
  description: "🧮 BUSINESS TIME CALCULATOR: Arithmetic with business days/hours, accounting for weekends and holidays. Operations: add_days (add N business days to a date), days_between (count business days between two dates), hours_between (count working hours), is_working_day (check if date is a working day). Use this for CALCULATIONS, NOT simple lookups. For 'is tomorrow a holiday?' use check_holiday. For 'is it a working day?' use check_business_day.",
  inputSchema: {
    operation: z.enum(["add_days", "days_between", "hours_between", "is_working_day"]).describe("Operation: add_days | days_between | hours_between | is_working_day"),
    start_date: z.string().describe("Start date (ISO 8601 format: YYYY-MM-DDTHH:mm:ss)"),
    end_date: z.string().optional().describe("End date (required for days_between and hours_between operations)"),
    business_days: z.number().optional().describe("Number of business days to add (required for add_days operation)"),
    country_code: z.string().optional().describe("ISO 3166-1 alpha-2 country code (default: US)"),
    work_hours: z.array(z.number()).optional().describe("Work hours [start, end] for hours_between (default: [9, 17])"),
  },
}, async ({ operation, start_date, end_date, business_days, country_code, work_hours }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!operation || !start_date) {
      throw new Error("operation and start_date parameters are required");
    }
    
    const systemTimezone = getSystemTimezone();
    const requestBody: BusinessTimeRequest = {
      operation,
      start_date,
      country_code: country_code || 'US',
      tmz: systemTimezone,
    };
    
    if (end_date) requestBody.end_date = end_date;
    if (business_days !== undefined) requestBody.business_days = business_days;
    if (work_hours) requestBody.work_hours = work_hours;
    
    const response = await fetch(`${VREME_API_URL}/business-time/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## Business Time Calculation\n\n`;
    output += `**Operation:** ${operation}\n`;
    output += `**Country:** ${data.country_code || country_code}\n\n`;
    
    if (operation === 'add_days' && data.result_date) {
      output += `**Start date:** ${start_date}\n`;
      output += `**Business days added:** ${business_days}\n`;
      output += `**Result date:** ${data.result_date}\n\n`;
      output += `Adding ${business_days} business days to ${start_date} results in **${data.result_date}** (accounting for weekends and holidays in ${data.country_code}).\n`;
    } else if (operation === 'days_between' && data.business_days !== undefined) {
      output += `**Start date:** ${start_date}\n`;
      output += `**End date:** ${end_date}\n`;
      output += `**Business days:** ${data.business_days}\n\n`;
      output += `There are **${data.business_days} business days** between these dates in ${data.country_code}.\n`;
    } else if (operation === 'hours_between' && data.business_hours !== undefined) {
      output += `**Start date:** ${start_date}\n`;
      output += `**End date:** ${end_date}\n`;
      output += `**Business hours:** ${data.business_hours}\n`;
      output += `**Work hours:** ${work_hours ? `${work_hours[0]}:00 - ${work_hours[1]}:00` : '9:00 - 17:00'}\n\n`;
      output += `There are **${data.business_hours} business hours** between these dates.\n`;
    } else if (operation === 'is_working_day' && data.is_working_day !== undefined) {
      output += `**Date:** ${start_date}\n`;
      output += `**Is working day:** ${data.is_working_day ? 'Yes ✓' : 'No ✗'}\n\n`;
      output += `${start_date} is ${data.is_working_day ? '' : '**not** '}a working day in ${data.country_code}.\n`;
    }
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

// ============================================================
// HOLIDAY DATABASE TOOLS
// ============================================================

server.registerTool("list_holiday_countries", {
  description: "🌍 DISCOVERY TOOL: List all 247+ countries with holiday data support. Use this when user asks 'which countries do you support?' or 'do you have data for Brazil?'. Returns country codes and names. For actual holiday data, use get_country_holidays. NOT for checking if a date is a holiday (use check_holiday).",
  inputSchema: {},
}, async () => {
  updateActivityTracking(); // Track activity burst
  try {
    const systemTimezone = getSystemTimezone();
    const url = new URL(`${VREME_API_URL}/holidays/countries`);
    url.searchParams.append('tmz', systemTimezone);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## Global Holiday Coverage\n\n`;
    output += `**Total countries:** ${data.count}\n`;
    output += `**Coverage:** ${data.coverage}\n`;
    output += `**Source:** ${data.source}\n\n`;
    
    output += `### Supported Countries (${data.count})\n\n`;
    const countries = data.countries as Array<{country_code: string, country_name: string}>;
    
    // Group by region for readability
    const regions = new Map<string, Array<{code: string, name: string}>>();
    for (const c of countries) {
      const firstLetter = c.country_code[0];
      if (!regions.has(firstLetter)) regions.set(firstLetter, []);
      regions.get(firstLetter)!.push({code: c.country_code, name: c.country_name});
    }
    
    for (const [letter, countryList] of Array.from(regions.entries()).sort()) {
      output += `**${letter}**: ${countryList.map(c => `${c.code}`).join(', ')}\n`;
    }
    
    output += `\n*Use get_country_holidays tool to retrieve specific holiday data.*\n`;
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("get_country_holidays", {
  description: "📅 FULL HOLIDAY LIST: Get ALL holidays for a country in a specific year. Use this when user wants a complete list like 'What are all holidays in France 2024?' or 'List German holidays'. Returns every holiday with dates, names, and categories (PUBLIC=govt closures, BANK, SCHOOL, OPTIONAL). Can filter by categories using ?categories=public for govt closures only. NOT for checking a single date (use check_holiday) or multi-country (use check_multi_country_holiday). Fast: <30ms.",
  inputSchema: {
    country_code: z.string().describe("ISO 3166-1 alpha-2 country code (US, GB, JP, CN, IN, DE, FR, etc.)"),
    year: z.number().describe("Year to get holidays for (e.g., 2024, 2025)"),
    categories: z.string().optional().describe("Optional: comma-separated categories to filter (e.g., 'public' for govt closures only, 'public,bank' for govt+bank holidays). If omitted, returns ALL categories."),
  },
}, async ({ country_code, year, categories }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!country_code) throw new Error("country_code parameter is required");
    if (!year) throw new Error("year parameter is required");
    
    const systemTimezone = getSystemTimezone();
    const params = new URLSearchParams();
    if (categories) params.append('categories', categories);
    params.append('tmz', systemTimezone);
    
    const url = `${VREME_API_URL}/holidays/${country_code}/${year}?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## ${data.country_code} Holidays - ${data.year}\n\n`;
    output += `**Total holidays:** ${data.count}\n`;
    output += `**Categories:** ${data.categories_requested === 'all' ? 'All categories (PUBLIC, BANK, SCHOOL, OPTIONAL, etc.)' : data.categories_requested}\n\n`;
    
    output += `### Holiday List\n\n`;
    const holidays = data.holidays as Array<{
      date: string, 
      name: string, 
      day_of_week: string, 
      is_government_closure: boolean,
      categories: string[]
    }>;
    
    for (const h of holidays) {
      const govtClosure = h.is_government_closure ? '🏛️ Govt Closure' : '';
      const cats = h.categories ? ` [${h.categories.join(', ')}]` : '';
      output += `- **${h.date}** (${h.day_of_week}): ${h.name} ${govtClosure}${cats}\n`;
    }
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("check_holiday", {
  description: "✅ SINGLE HOLIDAY CHECKER: Is this date a PUBLIC holiday (govt closure) in this country? Use this for simple Yes/No holiday checks like 'Is Dec 25 a holiday in Japan?' or 'Is tomorrow a holiday in Germany?'. Returns holiday name if yes, or null if no. FASTEST holiday tool (<10ms). Checks PUBLIC category only (government office closures). For work/non-work focus, use check_business_day.",
  inputSchema: {
    country_code: z.string().describe("ISO 3166-1 alpha-2 country code (US, GB, JP, CN, IN, DE, FR, etc.)"),
    date: z.string().describe("Date to check in YYYY-MM-DD format (e.g., '2024-12-25')"),
  },
}, async ({ country_code, date }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!country_code) throw new Error("country_code parameter is required");
    if (!date) throw new Error("date parameter is required");
    
    const systemTimezone = getSystemTimezone();
    const url = new URL(`${VREME_API_URL}/holidays/${country_code}/${date}/check`);
    url.searchParams.append('tmz', systemTimezone);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## Holiday Check: ${country_code} on ${date}\n\n`;
    output += `**Date:** ${date}\n`;
    output += `**Day of week:** ${data.day_of_week}\n`;
    output += `**Is PUBLIC holiday:** ${data.is_holiday ? 'Yes ✓' : 'No ✗'}\n\n`;
    
    if (data.is_holiday) {
      output += `### Holiday Information\n\n`;
      output += `**Name:** ${data.holiday_name}\n`;
      output += `**Country:** ${data.country_code}\n\n`;
      output += `${date} is **${data.holiday_name}** in ${data.country_code}. This is a PUBLIC holiday (government offices closed).\n`;
    } else {
      output += `${date} is NOT a PUBLIC holiday in ${data.country_code}.\n`;
    }
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

// ============================================================
// FINANCIAL MARKETS TOOLS
// ============================================================

server.registerTool("list_financial_markets_holidays", {
  description: "🏦 FINANCIAL MARKETS DISCOVERY: List all 5 supported financial markets with trading holiday calendars. Use this when user asks about stock markets, exchanges, or trading holidays. Returns: XNYS (NYSE), XNSE (NSE India), BVMF (Brazil), XECB (ECB TARGET2), IFEU (ICE Futures Europe). For actual trading holidays, use get_market_holidays.",
  inputSchema: {},
}, async () => {
  updateActivityTracking(); // Track activity burst
  try {
    const systemTimezone = getSystemTimezone();
    const url = new URL(`${VREME_API_URL}/holidays/markets`);
    url.searchParams.append('tmz', systemTimezone);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## Financial Markets with Trading Holiday Data\n\n`;
    output += `**Total markets:** ${data.count}\n`;
    output += `**Source:** ${data.source}\n\n`;
    
    output += `### Supported Markets\n\n`;
    for (const market of data.markets) {
      output += `- **${market.market_code}**: ${market.market_name}\n`;
    }
    
    output += `\n*Use get_market_holidays tool to retrieve specific trading holiday data.*\n`;
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("get_market_holidays", {
  description: "📈 TRADING HOLIDAYS: Get all trading holidays when a financial market is CLOSED. Use this for: 'When is NYSE closed in 2024?', 'What are NSE India trading holidays?', 'Is the market open on this date?'. Returns dates when market is closed (exchanges don't trade). Markets: XNYS (NYSE), XNSE (NSE India), BVMF (Brazil), XECB (ECB), IFEU (ICE Futures). Fast: <20ms.",
  inputSchema: {
    market_code: z.string().describe("Market code: XNYS (NYSE), XNSE (NSE India), BVMF (Brazil), XECB (ECB TARGET2), IFEU (ICE Futures Europe)"),
    year: z.number().describe("Year to get trading holidays for (e.g., 2024, 2025)"),
  },
}, async ({ market_code, year }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!market_code) throw new Error("market_code parameter is required");
    if (!year) throw new Error("year parameter is required");
    
    const systemTimezone = getSystemTimezone();
    const url = new URL(`${VREME_API_URL}/holidays/markets/${market_code}/${year}`);
    url.searchParams.append('tmz', systemTimezone);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## ${data.market_code} Trading Holidays - ${data.year}\n\n`;
    output += `**Total trading holidays:** ${data.count}\n`;
    output += `**Source:** ${data.source}\n\n`;
    
    output += `### Days Market is CLOSED\n\n`;
    const holidays = data.trading_holidays as Array<{date: string, name: string, day_of_week: string}>;
    
    for (const h of holidays) {
      output += `- **${h.date}** (${h.day_of_week}): ${h.name}\n`;
    }
    
    output += `\n*On these dates, the market does not trade. All other business days are trading days.*\n`;
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("check_business_day", {
  description: "💼 BUSINESS DAY CHECKER: Is this date a working day? Checks if date is a business day (not holiday AND not weekend). Use this when focus is on WORK/NO-WORK status: 'Is tomorrow a business day?', 'Are offices open?', 'Is this a working day in Germany?'. Returns Yes/No + detailed reason (holiday name, weekend, or regular). PREFER THIS over check_holiday when user asks about 'business day' or 'working day'. Fast: <10ms.",
  inputSchema: {
    country_code: z.string().describe("ISO 3166-1 alpha-2 country code (US, GB, JP, CN, IN, DE, FR, etc.)"),
    date: z.string().describe("Date to check in YYYY-MM-DD format (e.g., '2024-12-25')"),
  },
}, async ({ country_code, date }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!country_code) throw new Error("country_code parameter is required");
    if (!date) throw new Error("date parameter is required");
    
    const systemTimezone = getSystemTimezone();
    const url = new URL(`${VREME_API_URL}/holidays/${country_code}/${date}/business-day`);
    url.searchParams.append('tmz', systemTimezone);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## Business Day Check\n\n`;
    output += `**Date:** ${data.date}\n`;
    output += `**Country:** ${data.country_code}\n`;
    output += `**Is business day:** ${data.is_business_day ? 'Yes ✓' : 'No ✗'}\n`;
    output += `**Reason:** ${data.reason}\n`;
    if (data.holiday_name) output += `**Holiday:** ${data.holiday_name}\n`;
    if (data.day_of_week) output += `**Day of week:** ${data.day_of_week}\n`;
    output += `\n`;
    
    if (data.is_business_day) {
      output += `${data.date} is a **regular business day** in ${data.country_code}. Good for scheduling work, meetings, and calls.`;
    } else if (data.reason === 'holiday') {
      output += `${data.date} is **not a business day** in ${data.country_code} because it's ${data.holiday_name}. Offices and businesses are likely closed.`;
    } else if (data.reason === 'weekend') {
      output += `${data.date} is **not a business day** in ${data.country_code} because it's a ${data.day_of_week} (weekend).`;
    }
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

// ============================================================
// DATE VALIDATION TOOLS (v1.5.1)
// ============================================================

server.registerTool("validate_date", {
  description: "🔍 DATE VALIDATOR: Validate if a date is valid (e.g., catch Feb 30, Month 13). Returns detailed errors and smart suggestions for fixes. Use this when you're about to generate a date and want to verify it's valid, or when user provides a potentially invalid date. Checks leap years, month boundaries, etc. Fast: <5ms.",
  inputSchema: {
    year: z.number().describe("Year (e.g., 2024)"),
    month: z.number().describe("Month (1-12)"),
    day: z.number().describe("Day (1-31)"),
  },
}, async ({ year, month, day }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!year || !month || !day) {
      throw new Error("year, month, and day are required");
    }
    
    const systemTimezone = getSystemTimezone();
    const url = new URL(`${VREME_API_URL}/validate/date/${year}/${month}/${day}`);
    url.searchParams.append('tmz', systemTimezone);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## Date Validation: ${year}-${month}-${day}\n\n`;
    
    if (data.valid) {
      output += `✅ **Valid date!**\n\n`;
      output += `**ISO Date:** ${data.iso_date}\n`;
      output += `**Day of week:** ${data.metadata.day_of_week}\n`;
      output += `**Day of year:** ${data.metadata.day_of_year}\n`;
      output += `**Week number:** ${data.metadata.week_number}\n`;
      output += `**Month:** ${data.metadata.month_name} (${data.metadata.max_day_in_month} days)\n`;
      output += `**Leap year:** ${data.metadata.is_leap_year ? 'Yes' : 'No'}\n`;
    } else {
      output += `❌ **Invalid date!**\n\n`;
      output += `### Errors\n\n`;
      for (const error of data.errors) {
        output += `- ${error}\n`;
      }
      
      if (data.suggestions && data.suggestions.length > 0) {
        output += `\n### Suggestions\n\n`;
        for (const suggestion of data.suggestions) {
          if (suggestion.date) {
            output += `- **${suggestion.date}** - ${suggestion.reason}\n`;
          } else {
            output += `- ${JSON.stringify(suggestion)}\n`;
          }
        }
      }
      
      if (data.metadata) {
        output += `\n### Context\n\n`;
        if (data.metadata.month_name) {
          output += `- ${data.metadata.month_name} has ${data.metadata.max_day_in_month} days\n`;
        }
        if (data.metadata.is_leap_year !== undefined) {
          output += `- ${year} is ${data.metadata.is_leap_year ? 'a' : 'not a'} leap year\n`;
        }
      }
    }
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("add_business_days_detailed", {
  description: "📊 BUSINESS DAY CALCULATOR WITH DETAILS: Add/subtract business days and get detailed metadata about what was excluded. Shows weekends skipped, holidays skipped, calendar span. Use this when you need to EXPLAIN to the user WHY the result is X days away. For simple calculation without explanation, use the regular calculate_business_time tool. Fast: <20ms.",
  inputSchema: {
    start_date: z.string().describe("Starting date in YYYY-MM-DD format"),
    business_days: z.number().describe("Number of business days to add (positive) or subtract (negative)"),
    country_code: z.string().describe("ISO 3166-1 alpha-2 country code (US, GB, JP, etc.)"),
  },
}, async ({ start_date, business_days, country_code }) => {
  updateActivityTracking(); // Track activity burst
  try {
    if (!start_date || business_days === undefined || !country_code) {
      throw new Error("start_date, business_days, and country_code are required");
    }
    
    const systemTimezone = getSystemTimezone();
    const response = await fetch(`${VREME_API_URL}/business-days/add-with-metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_date, business_days, country_code, tmz: systemTimezone }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## Business Day Calculation\n\n`;
    output += `**Start date:** ${data.start_date}\n`;
    output += `**Business days ${business_days >= 0 ? 'added' : 'subtracted'}:** ${Math.abs(business_days)}\n`;
    output += `**Result date:** ${data.result_date}\n`;
    output += `**Country:** ${data.country_code}\n\n`;
    
    output += `### Calculation Details\n\n`;
    output += `**Calendar days span:** ${data.calendar_days_span} days\n`;
    output += `**Excluded weekends:** ${data.excluded_weekends.length} days\n`;
    output += `**Excluded holidays:** ${data.excluded_holidays.length} days\n\n`;
    
    if (data.excluded_weekends.length > 0) {
      output += `### Weekend Days Skipped\n\n`;
      for (const weekend of data.excluded_weekends) {
        output += `- ${weekend}\n`;
      }
      output += `\n`;
    }
    
    if (data.excluded_holidays.length > 0) {
      output += `### Holidays Skipped\n\n`;
      for (const holiday of data.excluded_holidays) {
        output += `- **${holiday.date}**: ${holiday.name}\n`;
      }
      output += `\n`;
    }
    
    output += `**Summary:** Adding ${Math.abs(business_days)} business days to ${data.start_date} took ${data.calendar_days_span} calendar days`;
    if (data.excluded_holidays.length > 0) {
      output += ` (skipped ${data.excluded_weekends.length} weekend days and ${data.excluded_holidays.length} holidays)`;
    } else {
      output += ` (skipped ${data.excluded_weekends.length} weekend days)`;
    }
    output += `.`;
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

// ============================================================
// RELATIVE DATE RESOLVER TOOL
// ============================================================

server.registerTool("resolve_relative_date", {
  description: "📅 RELATIVE DATE RESOLVER: Convert expressions like 'next Monday', 'tomorrow', 'in 3 days' to actual dates. Uses simple, documented rules (e.g., 'next Monday' = forward to next occurrence, minimum 1 day). Returns the resolved date with explanation. Supports 'Elastic Tomorrow' for night coders (opt-in).",
  inputSchema: z.object({
    expression: z.string().describe("Relative date expression (e.g., 'next Monday', 'tomorrow', 'in 3 days', 'last Friday')"),
    reference_datetime: z.string().optional().describe("Reference datetime (ISO 8601). Defaults to now."),
    use_elastic_tomorrow: z.boolean().optional().describe("Enable 'Elastic Tomorrow' rule for late-night coding (default: false)"),
    elastic_threshold_hour: z.number().optional().describe("Elastic boundary hour (default: 6 AM)")
  })
}, async ({ expression, reference_datetime, use_elastic_tomorrow, elastic_threshold_hour }) => {
  updateActivityTracking(); // Track activity burst
  try {
    const systemTimezone = getSystemTimezone();
    
    const response = await fetch(`${VREME_API_URL}/resolve/relative-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expression,
        reference_datetime: reference_datetime || new Date().toISOString(),
        tmz: systemTimezone,
        use_elastic_tomorrow: use_elastic_tomorrow || false,
        elastic_threshold_hour: elastic_threshold_hour || 6
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    let output = `## 📅 Relative Date Resolution\n\n`;
    
    if (data.error) {
      output += `**Error:** ${data.error}\n\n`;
      output += `**Supported expressions:**\n`;
      data.supported.forEach((s: string) => {
        output += `- ${s}\n`;
      });
    } else {
      output += `**Expression:** "${expression}"\n`;
      output += `**Resolved Date:** ${data.resolved_date} (${data.day_of_week})\n`;
      output += `**Rule:** ${data.rule_applied}\n\n`;
      output += `**Explanation:** ${data.explanation}\n`;
      
      if (data.elastic_applied) {
        output += `\n**Elastic Tomorrow Applied:** Yes (threshold: ${data.threshold_hour} AM)\n`;
      }
    }
    
    return { content: [{ type: "text", text: output }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error: ${msg}` }],
      isError: true
    };
  }
});

// ============================================================
// BEHAVIOR CONTEXT TOOLS (Personalized Awareness)
// ============================================================

server.registerTool("get_user_cognitive_state", {
  description: "🧠 USER COGNITIVE STATE: Understand the user's current work session and cognitive state. Returns: current session info (how long they've been working, interaction count), whether this is a typical work time for them based on historical patterns, and recommendations for task complexity. Use this to adapt your suggestions - deep work sessions are good for complex tasks, short sessions better for quick wins.",
  inputSchema: z.object({})
}, async () => {
  updateActivityTracking();
  try {
    const behaviorContext = BehaviorContextManager.loadBehaviorContext();
    const currentSession = behaviorContext.current_session;
    const systemTimezone = getSystemTimezone();
    const now = new Date();

    if (!currentSession) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "no_active_session",
            message: "User has not started a session yet or had a long gap (30+ minutes)",
            cognitive_boundary_detected: true
          }, null, 2)
        }]
      };
    }

    // Calculate session stats
    const sessionStart = new Date(currentSession.burst_start);
    const sessionMinutes = (now.getTime() - sessionStart.getTime()) / (1000 * 60);

    // Analyze historical patterns for this hour
    const currentHour = parseInt(now.toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: systemTimezone
    }));

    const historicalSessionsAtThisHour = behaviorContext.completed_sessions.filter(s => {
      const sHour = parseInt(new Date(s.burst_start).toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: systemTimezone
      }));
      return Math.abs(sHour - currentHour) <= 1; // Within 1 hour
    });

    const avgSessionLength = historicalSessionsAtThisHour.length > 0
      ? historicalSessionsAtThisHour.reduce((sum, s) => sum + s.burst_length_mins, 0) / historicalSessionsAtThisHour.length
      : null;

    const isTypicalWorkTime = historicalSessionsAtThisHour.length >= 3;

    // Session phase analysis
    let sessionPhase = "warming_up";
    if (sessionMinutes < 15) sessionPhase = "warming_up";
    else if (sessionMinutes < 45) sessionPhase = "focused";
    else if (sessionMinutes < 90) sessionPhase = "deep_work";
    else sessionPhase = "extended_session";

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          current_session: {
            duration_minutes: Math.round(sessionMinutes),
            interaction_count: currentSession.interaction_count,
            session_phase: sessionPhase,
            started_at: currentSession.burst_start
          },
          patterns: {
            is_typical_work_time: isTypicalWorkTime,
            historical_sessions_at_this_hour: historicalSessionsAtThisHour.length,
            average_session_length_minutes: avgSessionLength ? Math.round(avgSessionLength) : null
          },
          recommendations: {
            good_for_complex_tasks: sessionPhase === "deep_work" || sessionPhase === "focused",
            good_for_quick_wins: sessionPhase === "warming_up",
            consider_break_soon: sessionMinutes > 90,
            confidence: isTypicalWorkTime ? "high" : "low"
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: JSON.stringify({ error: msg }) }],
      isError: true
    };
  }
});

server.registerTool("analyze_work_patterns", {
  description: "📊 WORK PATTERN ANALYSIS: Analyze the user's historical work patterns to understand their typical schedule, peak productivity hours, and session characteristics. Returns statistics about: typical work hours, average session lengths, common break times, sleep/wake patterns. Use this to understand when the user is most productive and adapt your interactions accordingly.",
  inputSchema: z.object({
    lookback_days: z.number().optional().describe("How many days back to analyze (default: 7)")
  })
}, async ({ lookback_days = 7 }) => {
  updateActivityTracking();
  try {
    const behaviorContext = BehaviorContextManager.loadBehaviorContext();
    const systemTimezone = getSystemTimezone();
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (lookback_days * 24 * 60 * 60 * 1000));

    // Filter recent sessions
    const recentSessions = behaviorContext.completed_sessions.filter(s =>
      new Date(s.burst_start) > cutoffDate
    );

    if (recentSessions.length === 0) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            message: "Not enough historical data yet",
            sessions_analyzed: 0
          }, null, 2)
        }]
      };
    }

    // Calculate hourly distribution
    const hourlyActivity: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourlyActivity[h] = 0;

    recentSessions.forEach(s => {
      const hour = parseInt(new Date(s.burst_start).toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: systemTimezone
      }));
      hourlyActivity[hour]++;
    });

    // Find peak hours (top 3)
    const peakHours = Object.entries(hourlyActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), session_count: count }));

    // Session length stats
    const sessionLengths = recentSessions.map(s => s.burst_length_mins);
    const avgSessionLength = sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length;
    const maxSessionLength = Math.max(...sessionLengths);

    // Sleep pattern analysis
    const sleepGaps = behaviorContext.estimated_sleep_gaps.filter(g =>
      new Date(g.gap_start) > cutoffDate
    );

    const avgSleepGap = sleepGaps.length > 0
      ? sleepGaps.reduce((sum, g) => sum + g.gap_length_mins, 0) / sleepGaps.length
      : null;

    // Lunch pattern analysis
    const lunchGaps = behaviorContext.estimated_lunch_gaps.filter(g =>
      new Date(g.gap_start) > cutoffDate
    );

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          analysis_period: {
            lookback_days,
            sessions_analyzed: recentSessions.length,
            sleep_gaps_detected: sleepGaps.length,
            lunch_breaks_detected: lunchGaps.length
          },
          work_schedule: {
            peak_hours: peakHours,
            hourly_distribution: hourlyActivity
          },
          session_characteristics: {
            average_length_minutes: Math.round(avgSessionLength),
            longest_session_minutes: Math.round(maxSessionLength),
            total_sessions: recentSessions.length
          },
          break_patterns: {
            average_sleep_gap_hours: avgSleepGap ? Math.round(avgSleepGap / 60 * 10) / 10 : null,
            sleep_gaps_detected: sleepGaps.length,
            lunch_breaks_detected: lunchGaps.length,
            typical_lunch_hours: lunchGaps.length > 0
              ? [...new Set(lunchGaps.map(g => g.detected_at_hour))].sort()
              : []
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: JSON.stringify({ error: msg }) }],
      isError: true
    };
  }
});

server.registerTool("predict_user_availability", {
  description: "🔮 AVAILABILITY PREDICTION: Predict when the user will likely be back based on current gap and historical patterns. If user is away, analyzes the gap to determine if it's likely a lunch break, sleep, or just a short break. Returns probability estimates and expected return time. Use this to decide whether to provide immediate responses or save complex suggestions for when they return.",
  inputSchema: z.object({})
}, async () => {
  updateActivityTracking();
  try {
    const globalContext = TemporalContextManager.loadGlobalContext();
    const behaviorContext = BehaviorContextManager.loadBehaviorContext();
    const systemTimezone = getSystemTimezone();
    const now = new Date();
    const lastActivity = new Date(globalContext.last_global_activity);
    const gapMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

    // If currently in a session (gap < threshold)
    if (gapMinutes < behaviorContext.context_switch_threshold_minutes) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "currently_active",
            gap_minutes: Math.round(gapMinutes),
            message: "User is currently in an active session"
          }, null, 2)
        }]
      };
    }

    // Analyze gap type
    const lastHour = parseInt(lastActivity.toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: systemTimezone
    }));

    const currentHour = parseInt(now.toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: systemTimezone
    }));

    let gapType = "short_break";
    let estimatedReturnMinutes = 15;

    // Sleep detection
    const isNightHours = lastHour >= 22 || lastHour < 6;
    if (gapMinutes >= 150 && isNightHours) {
      gapType = "sleep";
      estimatedReturnMinutes = 480; // 8 hours
    }
    // Lunch detection
    else if (gapMinutes >= 30 && lastHour >= 11 && lastHour < 14) {
      gapType = "lunch_break";
      estimatedReturnMinutes = 60;
    }
    // Extended break
    else if (gapMinutes >= 60) {
      gapType = "extended_break";
      estimatedReturnMinutes = 120;
    }

    // Check historical patterns for this time
    const historicalReturns = behaviorContext.completed_sessions.filter(s => {
      const sHour = parseInt(new Date(s.burst_start).toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: systemTimezone
      }));
      return Math.abs(sHour - currentHour) <= 1;
    });

    const estimatedReturn = new Date(now.getTime() + (estimatedReturnMinutes * 60 * 1000));

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "user_away",
          gap_analysis: {
            gap_minutes: Math.round(gapMinutes),
            gap_type: gapType,
            last_activity_hour: lastHour,
            current_hour: currentHour
          },
          prediction: {
            estimated_return_time: estimatedReturn.toISOString(),
            estimated_return_in_minutes: estimatedReturnMinutes,
            confidence: historicalReturns.length >= 3 ? "high" : "low",
            historical_sessions_at_this_hour: historicalReturns.length
          },
          recommendation: {
            wait_for_return: gapType === "sleep" || gapType === "extended_break",
            can_respond_now: gapType === "short_break" || gapType === "lunch_break"
          }
        }, null, 2)
      }]
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: JSON.stringify({ error: msg }) }],
      isError: true
    };
  }
});

// ============================================================
// MCP RESOURCE SUPPORT (for temporal context auto-injection)
// ============================================================

// Helper function for time of day
function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// Helper function for timezone offset
function formatTimezoneOffset(date: Date): string {
  const offset = date.getTimezoneOffset();
  const offsetHours = Math.abs(offset / 60);
  const offsetSign = offset <= 0 ? '+' : '-';
  return `${offsetSign}${offsetHours.toString().padStart(2, '0')}:00`;
}

// Register temporal context resource
server.registerResource(
  "temporal-context",
  "vreme://temporal-context",
  {
    title: "Temporal Context",
    description: "Current temporal state and global activity tracking from file-based context",
    mimeType: "application/json",
    _meta: {
      annotations: {
        audience: ["assistant"], // For LLM, not user
        priority: 1.0 // Highest priority - always include
      }
    }
  },
  async (uri: URL, extra) => {
    // Log when resource is requested (for debugging)
    console.error(`[RESOURCE] vreme://temporal-context requested at ${new Date().toISOString()}`);
    
    // Read file-based global context only (no in-memory bursts)
    const globalContext = TemporalContextManager.loadGlobalContext();
    
    // Add current temporal state
    const now = new Date();
    const systemTimezone = getSystemTimezone();
    const hour = parseInt(now.toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: systemTimezone
    }));
    
    const context = {
      current_datetime: now.toISOString(),
      timezone: systemTimezone,
      day_of_week: now.toLocaleDateString('en-US', { weekday: 'long', timeZone: systemTimezone }),
      time_of_day: getTimeOfDay(hour),
      
      // File-based global context
      last_global_activity: globalContext.last_global_activity,
      last_timezone: globalContext.last_timezone,
      days_since_last_activity: TemporalContextManager.getDaysSinceLastActivity(),
      context_switch_detected: TemporalContextManager.detectContextSwitch(),
      
      // Temporal grounding
      temporal_grounding: {
        current_date: now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: systemTimezone
        }),
        current_time: now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: systemTimezone,
          timeZoneName: 'short'
        }),
        timezone_offset: formatTimezoneOffset(now)
      }
    };
    
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(context, null, 2)
        }
      ]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("=== VREME MCP Server v1.6.0 ===");
  console.error("Vreme Time Service MCP Server running");
  console.error(`API URL: ${VREME_API_URL}`);
  console.error("Available tools (20 total):");
  console.error("  🧠 get_temporal_context - AUTO-CALL at conversation start for temporal awareness");
  console.error("  ⏰ get_current_time - Use for 'What time is it?' queries");
  console.error("  🧠 Personalized Awareness (NEW in v1.6.0):");
  console.error("     - get_user_cognitive_state - Current session + cognitive state");
  console.error("     - analyze_work_patterns - Historical work patterns & peak hours");
  console.error("     - predict_user_availability - When user will likely return");
  console.error("  📅 Temporal Tools:");
  console.error("     - query_time, query_prayer_times, check_activity_appropriateness");
  console.error("     - analyze_temporal_context, compare_dates, calculate_business_time");
  console.error("  🎉 Holiday Tools:");
  console.error("     - list_holiday_countries, get_country_holidays, check_holiday, check_business_day");
  console.error("     - list_financial_markets_holidays, get_market_holidays");
  console.error("  🔧 Utility Tools:");
  console.error("     - validate_date, add_business_days_detailed, resolve_relative_date");
  console.error("  Privacy-first: All behavior data stored locally in ~/.vreme/");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
