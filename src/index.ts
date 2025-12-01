#!/usr/bin/env node

/**
 * Vreme Time Service MCP Server
 * Connects AI assistants to Vreme Time Service API
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// API Configuration
const VREME_API_URL = process.env.VREME_API_URL || "https://api.vreme.ai";

interface QueryRequest {
  query: string;
  user_timezone?: string;
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
  version: "1.0.0",
});

server.registerTool("query_time", {
  description: "Query temporal information using natural language. Get current time, timezone info, 9 cultural calendars (Hebrew, Islamic, Chinese, Hindu, Persian, Buddhist, Bahá'í, Ethiopian, Mayan), astronomical events, religious fasting status, work restrictions, and activity appropriateness for any location.",
  inputSchema: {
    query: z.string().describe("Natural language temporal query"),
    user_timezone: z.string().optional().describe("Optional: Your timezone for relative time calculations"),
  },
}, async ({ query, user_timezone }) => {
  try {
    if (!query) throw new Error("Query parameter is required");
    const response = await queryVremeAPI({ query, user_timezone });
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
  description: "Get Islamic prayer times (Salah/Namaz) for any location. Returns all 5 daily prayers, next prayer time, and Qibla direction to Mecca.",
  inputSchema: {
    location: z.string().describe("Location name"),
    prayer: z.string().optional().describe("Optional: Specific prayer ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')"),
  },
}, async ({ location, prayer }) => {
  try {
    if (!location) throw new Error("Location parameter is required");
    const query = prayer ? `When is ${prayer} in ${location}?` : `What are prayer times in ${location}?`;
    const response = await queryVremeAPI({ query });
    return { content: [{ type: "text", text: formatResponse(response) }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

server.registerTool("check_activity_appropriateness", {
  description: "Check if the current time is appropriate for specific activities. Takes into account time of day, cultural/religious observances across 9 calendar systems, work restrictions, and local customs.",
  inputSchema: {
    location: z.string().describe("Location name"),
    activity: z.enum(["call", "work", "meeting"]).optional().describe("Optional: Type of activity to check"),
    user_timezone: z.string().optional().describe("Optional: Your timezone"),
  },
}, async ({ location, activity, user_timezone }) => {
  try {
    if (!location) throw new Error("Location parameter is required");
    let query = `Is it a good time to call someone in ${location}?`;
    if (activity === "work") query = `Is it appropriate for work in ${location}?`;
    else if (activity === "meeting") query = `Is it a good time for a meeting in ${location}?`;
    const response = await queryVremeAPI({ query, user_timezone });
    return { content: [{ type: "text", text: formatResponse(response) }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("=== VREME McpServer API v1.0.9 - NEW CODE RUNNING ===");
  console.error("Vreme Time Service MCP Server v1.0.9 running");
  console.error(`API URL: ${VREME_API_URL}`);
  console.error("Available tools: query_time, query_prayer_times, check_activity_appropriateness");
  console.error("=== If you see this message, you're running the FIXED code ===");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
