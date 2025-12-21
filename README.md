<p align="center">
  <a href="https://vreme.ai">
    <img src="https://www.gravatar.com/avatar/ff544f8e090d77cb8655b6762f80492c?s=200&d=identicon" alt="Vreme Logo" width="200"/>
  </a>
</p>

# Vreme Temporal MCP Server

**v1.9.4**

MCP server providing comprehensive temporal intelligence including timezone conversions, 32 cultural calendars, astronomical events, prayer times, 247+ country holiday data, 5 financial markets, business time calculations, astrology, observance tracking, timezone offset intelligence, and date range operations.

[![npm version](https://img.shields.io/npm/v/@vreme/temporal-mcp.svg)](https://www.npmjs.com/package/@vreme/temporal-mcp)
[![Docker Image](https://img.shields.io/docker/v/vreme/temporal-mcp?label=docker)](https://hub.docker.com/r/vreme/temporal-mcp)

## What's New in v1.9.4

**Date Range Operations** - 3 new tools for date range calculations and set operations:

- **`date_range_overlap`** - Check if two date ranges overlap and return overlap details (overlap dates, days count)
- **`date_range_contains`** - Check if a date is within a range and return position data (start/end/middle/before/after)
- **`date_range_operations`** - Perform set operations on date ranges (union, intersection, difference) with merged results

All tools return structured JSON data only (no formatted strings), following Vreme's data-first philosophy. Perfect for checking availability windows, finding common periods, detecting scheduling conflicts, or combining time ranges.

## Overview

Vreme Temporal MCP Server provides 59 specialized tools for temporal intelligence, organized into 10 categories:

- **Core Temporal Tools** (7) - Time queries, prayer times, activity appropriateness
- **Holiday & Business Time** (10) - 247+ countries, business day calculations
- **Advanced Temporal Processing** (18) - Time arithmetic, phrase resolution, conflict checking, duration calculations
- **Calendar & Recurrence** (4) - Multi-calendar alignment, RRULE expansion
- **Fuzzy Time** (3) - Uncertain time representations
- **Astronomical** (7) - Sunrise/sunset, zodiac, moon phases
- **Observances & Cultural** (3) - Awareness days, tech holidays, commemorations
- **Duration & Period** (5) - Duration calculations, period analysis, age calculations
- **Timezone Offset** (3) - Timezone offset calculations, DST transitions, timezone metadata
- **Date Range Operations** (3) - Date range overlap detection, containment checks, set operations

## Tools Reference

### Core Temporal Tools

**get_temporal_context** - Provides real-time temporal awareness. Call before every response to get current time, date, timezone, time of day, and activity tracking. No parameters required.

**get_current_time** - Get current time, date, and timezone information. Use when user asks 'What time is it?' or when writing dates in code/docs/changelogs. Returns ISO datetime, timezone, day_of_week, date_string, time_string, time_of_day. No parameters required.

**query_time** - Natural language queries about time, calendars, and observances. Use for: 'What time is it in Tokyo?', 'When is Ramadan?', 'Is it Diwali?', 'What's the moon phase?'. Returns rich context including calendars, astronomical events, and cultural observances.

**query_prayer_times** - Get precise Islamic prayer times (Salah/Namaz) for any location. Returns all 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), next prayer countdown, and Qibla direction to Mecca.

**check_activity_appropriateness** - Check if it's appropriate to call/work/meet with someone right now. Considers time of day, cultural observances (Shabbat, Ramadan fasting), religious work restrictions, and local customs across calendar systems.

**analyze_temporal_context** - Get comprehensive analysis of a specific date including all calendar representations, cultural observances, astronomical events, business context, seasonal info, and temporal density score (0-100 significance).

**compare_dates** - Compare two dates to understand temporal distance and significance. Returns time difference, observances on each date, shared observances, and which is more culturally significant.

### Holiday and Business Time

**calculate_business_time** - Arithmetic with business days/hours, accounting for weekends and holidays. Operations: add_days, days_between, hours_between, is_working_day.

**list_holiday_countries** - List all 247+ countries with holiday data support. Returns country codes and names.

**get_country_holidays** - Get all holidays for a country in a specific year. Returns every holiday with dates, names, and categories (PUBLIC, BANK, SCHOOL, OPTIONAL). Can filter by categories. Fast: <30ms.

**check_holiday** - Check if a date is a PUBLIC holiday (government closure) in a country. Returns holiday name if yes, or null if no. Fastest holiday tool (<10ms).

**list_financial_markets_holidays** - List all 5 supported financial markets with trading holiday calendars. Returns: XNYS (NYSE), XNSE (NSE India), BVMF (Brazil), XECB (ECB TARGET2), IFEU (ICE Futures Europe).

**get_market_holidays** - Get all trading holidays when a financial market is closed. Use for: 'When is NYSE closed in 2024?', 'What are NSE India trading holidays?'. Markets: XNYS, XNSE, BVMF, XECB, IFEU. Fast: <20ms.

**check_business_day** - Check if a date is a working day (not holiday AND not weekend). Returns Yes/No with detailed reason. Prefer this over check_holiday when user asks about 'business day' or 'working day'. Fast: <10ms.

**validate_date** - Validate if a date is valid (e.g., catch Feb 30, Month 13). Returns detailed errors and smart suggestions for fixes. Checks leap years, month boundaries, etc. Fast: <5ms.

**add_business_days_detailed** - Add/subtract business days and get detailed metadata about what was excluded. Shows weekends skipped, holidays skipped, calendar span. Fast: <20ms.

**resolve_relative_date** - Convert expressions like 'next Monday', 'tomorrow', 'in 3 days' to actual dates. Uses simple, documented rules. Supports 'Elastic Tomorrow' for night coders (opt-in).

### Advanced Temporal Processing

**execute_time_arithmetic** - Execute precise date/time math with business rules. Supports operations: add, subtract, set_time, set_date. Handles business_days with regional holiday calendars. Returns step-by-step execution trace with deterministic hashing.

**resolve_temporal_phrase** - Convert natural language phrases like 'tomorrow evening', 'end of week', 'early next week' to concrete time windows. Returns canonical window with start/end times, confidence score (0-1), and alternative interpretations.

**compare_temporal_phrases** - Compare two temporal phrases to analyze their relationship. Returns time difference, overlap analysis, which is earlier/later, and human-readable comparison.

**export_temporal_context_snapshot** - Export portable temporal context for Multi-LLM systems. Returns TemporalContextSnapshotV1 schema including current time, calendars, upcoming events, rhythm fingerprint, and optional artifacts.

**generate_temporal_prompt_prefix** - Convert temporal context snapshot to concise LLM-ready prompt prefix. Configurable max lines (default: 20). Optimized for system prompts.

**check_good_moment_for_activity** - Check if now is a good moment for activity. Activities: deep_work, financial_decision, hard_feedback, creative_play, exercise. Returns yes/no, score (0-1), reasons, and suggested alternative time.

**check_temporal_conflicts** - Analyze events for conflicts with holidays, weekends, sleep hours, work restrictions. Returns conflict analysis per event, overall risk level, summary. Multi-region holiday checking and sleep pattern analysis.

**explain_time_behavior** - Get simple explanations for complex time concepts. Topics: dst_transition (DST changes), business_days (how they work), timezone_difference (between two zones). Returns title, explanation, and key points.

**analyze_global_sacred_time** - Multi-region sacred time analysis for product launches, webinars, maintenance windows. Returns avoid windows (Ramadan, religious holidays), preferred windows. Supports religions: islam, christian, hindu, buddhist.

**get_weekly_sacred_rhythm** - Generate 7-day × 24-hour grid for multicultural teams. Shows aggregate scores for religious observances (Jumu'ah, Shabbat, Sunday worship) with severity scoring (0-1). Returns recommendations for recurring meetings.

**get_microseason_context** - Get seasonal micro-context for location and date. Returns microseason ID/name, day length, sunrise/sunset, description, suggested tone. Hemisphere-aware seasonal classification.

**convert_time_scale** - Convert between different time scales (Unix seconds, Unix millis, UTC ISO, Local ISO). Explicit timezone handling for local conversions. Batch conversion support.

**list_time_scales** - List all supported time scales with descriptions and examples. Shows: UNIX_SECONDS, UNIX_MILLIS, UTC_ISO, LOCAL_ISO (TAI, GPS planned).

### Duration & Period

**calculate_duration** - Calculate structured duration between two timestamps. Returns total_seconds, days, hours, minutes, seconds as separate numeric fields. Use for calculating time differences, elapsed time, or duration between events.

**calculate_period** - Calculate weeks, months, quarters, or years between two dates. Returns structured data with days, weeks, months, quarters, and years as separate numeric fields. Handles leap years and month boundaries accurately.

**age_from_birthdate** - Calculate age as structured data from birthdate. Returns years, months, days, and total_days as separate numeric fields. Handles leap years and month boundaries accurately.

**time_until** - Calculate time until a future timestamp. Returns structured duration data (total_seconds, days, hours, minutes, seconds) and indicates if the time is in the past.

**time_since** - Calculate time since a past timestamp. Returns structured duration data (total_seconds, days, hours, minutes, seconds) and indicates if the time is in the future.

### Timezone Offset

**get_timezone_offset** - Get offset between two timezones as structured data. Returns offset_seconds, offset_hours, is_dst status for both timezones, and DST transition information. Use for calculating time differences between timezones and understanding DST effects.

**compare_timezones** - Compare multiple timezones, return offset data for each pair. Returns structured comparison data showing offsets between all timezone pairs, current times in each timezone, and DST status.

**get_timezone_info** - Get timezone metadata including UTC offset, DST rules, and next/previous DST transitions. Returns structured data about timezone properties, current DST status, and transition information.

### Date Range Operations

**date_range_overlap** - Check if two date ranges overlap and return overlap details. Returns boolean, overlap start/end dates, and overlap days count. Use for checking if two time periods overlap, finding common availability windows, or detecting scheduling conflicts.

**date_range_contains** - Check if a date is within a range and return position data. Returns boolean, position (start/end/middle/before/after), and days from start/end. Use for checking if a date falls within a period, finding relative position of dates, or validating date membership in ranges.

**date_range_operations** - Perform set operations on date ranges (union, intersection, difference). Returns merged result ranges with total days and count. Use for combining availability windows, finding common periods, or subtracting blocked time from available periods.

### Calendar and Recurrence

**interval_operations** - Perform set operations on time intervals. Operations: UNION (merge intervals), INTERSECTION (find overlap), DIFFERENCE (subtract), GAPS (find gaps). Handles overlapping and adjacent intervals with normalized output.

**expand_recurrence** - Expand RRULE recurrence patterns (RFC 5545) to concrete occurrences within time window. Supports full RRULE syntax (FREQ=WEEKLY;BYDAY=MO,WE,FR). Safety limit: max 1000 occurrences.

**align_calendars** - Show single chronological instant across multiple calendar systems. Supports: Gregorian, Unix, ISO Week, Ordinal (more planned: Islamic, Hebrew, Chinese).

**find_partial_dates** - Find all dates matching partial specification within search range. Search by year, month, day constraints.

### Fuzzy Time

**create_fuzzy_time_circa** - Create fuzzy time representation from circa date expression with explicit uncertainty. Precision levels: year, month, day. Returns center point, window, confidence score (0-1). Use for 'circa 1990', historical dates with uncertainty.

**create_fuzzy_time_window** - Create fuzzy time from explicit time window with custom confidence scoring. Use for uncertain future events, flexible scheduling, time estimates. Returns center point, window bounds, confidence score.

**intersect_fuzzy_times** - Find intersection of two fuzzy times with refined confidence. When two uncertain time ranges overlap, this computes their intersection with combined confidence scoring.

### Astronomical

**get_astro_context** - Get sunrise, sunset, day length, twilight times, and moon phase for a date and location. Returns solar noon, day length in hours, civil twilight boundaries, and current moon phase.

**get_day_phase** - Classify a timestamp into day phase (pre_dawn, morning, midday, afternoon, evening, night) based on solar position. Returns phase, sun above/below horizon, and time relative to sunrise/sunset.

**get_season_context** - Get hemisphere-aware seasonal classification for a date and location. Returns season (winter, spring, summer, autumn with early/late variants), hemisphere, day of year, and contextual notes.

**get_zodiac_context** - Get planet positions, zodiac signs, and aspects for a timestamp. Returns ecliptic longitudes, signs (with element/modality), and aspects (conjunction, opposition, trine, square, sextile) between bodies.

**get_chinese_zodiac** - Get Chinese zodiac animal, element, and 60-year cycle for a date. Returns lunar year, animal (Rat to Pig), element (Wood/Fire/Earth/Metal/Water), yin/yang, and cycle indices.

**get_astro_events** - Get astronomical events in a time window. Returns sun ingresses (Sun entering each zodiac sign) and moon phases (new, first quarter, full, last quarter) with precise UTC timestamps.

**get_astro_calendar** - Get astrology calendar for a date range in user's timezone. Returns sun ingresses and moon phases with local times and human-readable descriptions.

### Observances and Cultural

**get_observances_on_date** - Get awareness days, fun days, commemorations, and cultural observances for a specific date. Categories: awareness_day, fun_day, tech, seasonal, commemoration, cultural, religious, corporate.

**get_today_story** - Get curated highlights for today - most relevant observances based on user's region and interests. Returns 1-3 observances with relevance scoring.

**get_observances_calendar** - Get calendar view of observances for a specific month. Returns all observances by day for planning and UI calendar displays.

## Features

### Global Holiday Intelligence

- 247+ countries with comprehensive holiday data
- Category support: PUBLIC (government closures), BANK, SCHOOL, OPTIONAL
- 5 financial markets: NYSE, NSE India, Brazil B3, ECB TARGET2, ICE Futures Europe
- Powered by python-holidays v0.86+

### Cultural Calendars

32 calendar systems covering religious, cultural, and technical calendars:

**Religious & Cultural:** Hebrew, Islamic, Chinese, Hindu, Persian, Buddhist, Sikh, Coptic, Orthodox Christian, Ethiopian, Bahá'í, Thai Buddhist, Tibetan, Zoroastrian, Armenian, Javanese, Mongolian, Burmese

**East Asian:** Japanese, Bengali, Tamil, Nepali

**Western & Technical:** Mayan, Roman, French Revolutionary, Revised Julian, Discordian, Holocene, Unix Epoch, ISO Week Date, Western Zodiac, Star Trek Stardate

Coverage: 5+ billion people, 10+ religions, 300+ observances

### Islamic Prayer Times

- All 5 daily prayers: Fajr, Dhuhr, Asr, Maghrib, Isha
- 7 calculation methods: MWL, ISNA, Egypt, Makkah, Karachi, Tehran, Jafari
- Qibla direction to Mecca
- Next prayer countdown

### Astronomical & Astrological Data

- Sunrise, sunset, twilight times
- Moon phases and lunar calendar
- Western zodiac: planet positions, signs, aspects
- Chinese zodiac: animal & element cycles
- Sun ingresses and astronomical events

## Installation

### Quick Start

```bash
npx -y @vreme/temporal-mcp
```

### Docker

```bash
docker pull vreme/temporal-mcp
docker run --rm -i vreme/temporal-mcp
```

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vreme": {
      "command": "npx",
      "args": ["-y", "@vreme/temporal-mcp"]
    }
  }
}
```

**Docker configuration:**

```json
{
  "mcpServers": {
    "vreme": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "vreme/temporal-mcp"]
    }
  }
}
```

### VS Code

[![Install with NPX](https://img.shields.io/badge/VS_Code-NPM-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=vreme&config={"command":"npx","args":["-y","@vreme/temporal-mcp"]})
[![Install with Docker](https://img.shields.io/badge/VS_Code-Docker-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=vreme&config={"command":"docker","args":["run","--rm","-i","vreme/temporal-mcp"]})

**Manual Configuration:**

Open Command Palette (`Ctrl + Shift + P`) → `MCP: Open User Configuration`

Add to your `mcp.json`:

```json
{
  "servers": {
    "vreme": {
      "command": "npx",
      "args": ["-y", "@vreme/temporal-mcp"]
    }
  }
}
```

[VS Code MCP Documentation](https://code.visualstudio.com/docs/copilot/mcp)

### Continue & Cline

Add to your MCP configuration following the respective setup guides.

## Example Queries

**Timezone & Time:**
- "What time is it in Tokyo?"
- "Is it a good time to call London?"

**Religious & Cultural:**
- "Is it Shabbat in Jerusalem?"
- "When is Ramadan this year?"
- "What are prayer times in Dubai?"

**Holidays & Business:**
- "Is tomorrow a holiday in Germany?"
- "Add 5 business days to December 20th"
- "When is NYSE closed in 2025?"

**Astronomical:**
- "When is sunrise in Paris?"
- "What's the moon phase today?"
- "What's my zodiac sign?"

**Calendars:**
- "What's the Hebrew date today?"
- "When is Chinese New Year?"
- "Show me this date in the Islamic calendar"

## Design Philosophy

Vreme focuses on temporal intelligence with a stateless, data-first architecture:

- **Stateless & Fast** - No database queries, sub-100ms responses, infinitely scalable
- **Structured Data Only** - JSON responses, no formatting or HTML, maximum composability
- **Factual & Authoritative** - Verified holiday data, accurate calendar systems, trusted astronomical calculations
- **Focused Scope** - Temporal data, calculations, and cultural calendars only. No scheduling, text generation, event storage, or notifications

## Architecture

```
AI Client (Claude Desktop / VS Code / Continue / Cline)
    ↓ MCP Protocol
@vreme/temporal-mcp
    ↓ HTTPS
vreme.ai API
    ↓
Temporal Intelligence Engine
```

## API Access

This MCP server is powered by the [Vreme Time API](https://api.vreme.ai).

Direct API usage:

```bash
curl -X POST https://api.vreme.ai/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What time is it in Tokyo?"}'
```

## Development

### Build from Source

```bash
npm install
npm run build
npm link
```

### Docker Build

```bash
docker build -t vreme/temporal-mcp .
```

### Debugging

View MCP server logs:

```bash
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

## Links

- **Website:** [vreme.ai](https://vreme.ai)
- **Documentation:** [vreme.ai/docs](https://vreme.ai/docs)
- **API Docs:** [api.vreme.ai/docs](https://api.vreme.ai/docs)
- **GitHub:** [github.com/vreme-ai/temporal-mcp](https://github.com/vreme-ai/temporal-mcp)
- **npm:** [@vreme/temporal-mcp](https://www.npmjs.com/package/@vreme/temporal-mcp)
- **Docker Hub:** [vreme/temporal-mcp](https://hub.docker.com/r/vreme/temporal-mcp)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## About Vreme

Vreme (Bulgarian: "time") builds temporal intelligence for AI systems. Our mission is to make AI temporally aware, understanding time, culture, and context across the globe.
