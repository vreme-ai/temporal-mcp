# Vreme Time Service MCP Tools Reference

This document lists all 49 MCP (Model Context Protocol) tools available in the Vreme Time Service server.

## Table of Contents

- [Core Temporal Tools](#core-temporal-tools)
- [Holiday and Business Time](#holiday-and-business-time)
- [User Analysis](#user-analysis)
- [Advanced Temporal Processing](#advanced-temporal-processing)
- [Calendar and Recurrence](#calendar-and-recurrence)
- [Fuzzy Time](#fuzzy-time)
- [Astronomical](#astronomical)
- [Observances and Cultural](#observances-and-cultural)

---

## Core Temporal Tools

### get_temporal_context
🧠 CALL BEFORE EVERY RESPONSE - This tool provides you (Claude) with real-time temporal awareness. Call this BEFORE EVERY response to the user to get the current time, date, timezone, time of day (morning/afternoon/evening/night), and activity tracking. Time changes constantly - you need fresh temporal data for EACH interaction. This helps you stay temporally grounded and aware of how long the conversation has been going. NO PARAMETERS REQUIRED. Call it silently without mentioning it to the user unless they specifically ask about time.

### get_current_time
⏰🔴 CRITICAL: CALL THIS BEFORE WRITING ANY DATES IN CODE/DOCS/CHANGELOGS! Use when user asks 'What time is it?' OR when YOU need to write dates (YYYY-MM-DD format). ALWAYS check current date before creating version tags, CHANGELOG entries, git commit messages, or any timestamped content. Returns: ISO datetime, timezone, day_of_week, date_string (e.g., 'Thursday, December 12, 2024'), time_string, time_of_day. NO PARAMETERS REQUIRED. Prevents temporal bugs caused by using wrong dates. If you write '2024-12-10' but today is 2024-12-12, you've created a version control error.

### query_time
🔹 NATURAL LANGUAGE CONVENIENCE TOOL: Ask questions about time, calendars, and observances in plain English. Use this for: 'What time is it in Tokyo?', 'When is Ramadan?', 'Is it Diwali?', 'What's the moon phase?'. Returns rich context including 31 calendars, astronomical events, and cultural observances. ⚠️ DO NOT use this for simple 'What time is it?' queries - use get_current_time instead. ⚠️ Slower than specialized tools - prefer check_holiday for simple holiday lookups, query_prayer_times for prayer times, or check_activity_appropriateness for meeting appropriateness.

### query_prayer_times
🕌 ISLAMIC PRAYER TIMES SPECIALIST: Get precise prayer times (Salah/Namaz) for any location. Returns all 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), next prayer countdown, and Qibla direction to Mecca. Use this ONLY for Islamic prayer queries. For general religious observances, use query_time instead.

### check_activity_appropriateness
📞 CULTURAL APPROPRIATENESS CHECKER: Should I call/work/meet with someone RIGHT NOW? Considers time of day (work hours, night time), cultural observances (Shabbat, Ramadan fasting), religious work restrictions, and local customs across 31 calendar systems. Use this when asking 'Is it appropriate to...' NOT for just checking the time (use query_time) or checking holidays (use check_holiday).

### analyze_temporal_context
📊 DEEP TEMPORAL ANALYSIS: Get EVERYTHING about a specific date - all 31 calendar representations, 300+ cultural observances, astronomical events, business context, seasonal info, and temporal density score (0-100 significance). Use this when user says 'tell me about this date' or 'analyze this date'. ⚠️ Overkill for simple queries - use check_holiday for 'is it a holiday?', use query_time for 'what time?'. Can specify include_fields to get only what you need (calendars, observances, astronomical, business, seasonal, density).

### compare_dates
📏 DATE COMPARISON: Compare TWO dates to understand temporal distance and significance. Returns time difference (days/hours), observances on each date, shared observances, and which is more culturally significant. Use this when user mentions TWO dates and wants comparison. NOT for single date analysis (use analyze_temporal_context) or simple 'how long until' (use query_time).

---

## Holiday and Business Time

### calculate_business_time
🧮 BUSINESS TIME CALCULATOR: Arithmetic with business days/hours, accounting for weekends and holidays. Operations: add_days (add N business days to a date), days_between (count business days between two dates), hours_between (count working hours), is_working_day (check if date is a working day). Use this for CALCULATIONS, NOT simple lookups. For 'is tomorrow a holiday?' use check_holiday. For 'is it a working day?' use check_business_day.

### list_holiday_countries
🌍 DISCOVERY TOOL: List all 247+ countries with holiday data support. Use this when user asks 'which countries do you support?' or 'do you have data for Brazil?'. Returns country codes and names. For actual holiday data, use get_country_holidays. NOT for checking if a date is a holiday (use check_holiday).

### get_country_holidays
📅 FULL HOLIDAY LIST: Get ALL holidays for a country in a specific year. Use this when user wants a complete list like 'What are all holidays in France 2024?' or 'List German holidays'. Returns every holiday with dates, names, and categories (PUBLIC=govt closures, BANK, SCHOOL, OPTIONAL). Can filter by categories using ?categories=public for govt closures only. NOT for checking a single date (use check_holiday) or multi-country (use check_multi_country_holiday). Fast: <30ms.

### check_holiday
✅ SINGLE HOLIDAY CHECKER: Is this date a PUBLIC holiday (govt closure) in this country? Use this for simple Yes/No holiday checks like 'Is Dec 25 a holiday in Japan?' or 'Is tomorrow a holiday in Germany?'. Returns holiday name if yes, or null if no. FASTEST holiday tool (<10ms). Checks PUBLIC category only (government office closures). For work/non-work focus, use check_business_day.

### list_financial_markets_holidays
🏦 FINANCIAL MARKETS DISCOVERY: List all 5 supported financial markets with trading holiday calendars. Use this when user asks about stock markets, exchanges, or trading holidays. Returns: XNYS (NYSE), XNSE (NSE India), BVMF (Brazil), XECB (ECB TARGET2), IFEU (ICE Futures Europe). For actual trading holidays, use get_market_holidays.

### get_market_holidays
📈 TRADING HOLIDAYS: Get all trading holidays when a financial market is CLOSED. Use this for: 'When is NYSE closed in 2024?', 'What are NSE India trading holidays?', 'Is the market open on this date?'. Returns dates when market is closed (exchanges don't trade). Markets: XNYS (NYSE), XNSE (NSE India), BVMF (Brazil), XECB (ECB), IFEU (ICE Futures). Fast: <20ms.

### check_business_day
💼 BUSINESS DAY CHECKER: Is this date a working day? Checks if date is a business day (not holiday AND not weekend). Use this when focus is on WORK/NO-WORK status: 'Is tomorrow a business day?', 'Are offices open?', 'Is this a working day in Germany?'. Returns Yes/No + detailed reason (holiday name, weekend, or regular). PREFER THIS over check_holiday when user asks about 'business day' or 'working day'. Fast: <10ms.

### validate_date
🔍 DATE VALIDATOR: Validate if a date is valid (e.g., catch Feb 30, Month 13). Returns detailed errors and smart suggestions for fixes. Use this when you're about to generate a date and want to verify it's valid, or when user provides a potentially invalid date. Checks leap years, month boundaries, etc. Fast: <5ms.

### add_business_days_detailed
📊 BUSINESS DAY CALCULATOR WITH DETAILS: Add/subtract business days and get detailed metadata about what was excluded. Shows weekends skipped, holidays skipped, calendar span. Use this when you need to EXPLAIN to the user WHY the result is X days away. For simple calculation without explanation, use the regular calculate_business_time tool. Fast: <20ms.

### resolve_relative_date
📅 RELATIVE DATE RESOLVER: Convert expressions like 'next Monday', 'tomorrow', 'in 3 days' to actual dates. Uses simple, documented rules (e.g., 'next Monday' = forward to next occurrence, minimum 1 day). Returns the resolved date with explanation. Supports 'Elastic Tomorrow' for night coders (opt-in).

---

## User Analysis

### get_user_cognitive_state
🧠 USER COGNITIVE STATE: Understand the user's current work session and cognitive state. Returns: current session info (how long they've been working, interaction count), whether this is a typical work time for them based on historical patterns, and recommendations for task complexity. Use this to adapt your suggestions - deep work sessions are good for complex tasks, short sessions better for quick wins.

### analyze_work_patterns
📊 WORK PATTERN ANALYSIS: Analyze the user's historical work patterns to understand their typical schedule, peak productivity hours, and session characteristics. Returns statistics about: typical work hours, average session lengths, common break times, sleep/wake patterns. Use this to understand when the user is most productive and adapt your interactions accordingly.

### predict_user_availability
🔮 AVAILABILITY PREDICTION: Predict when the user will likely be back based on current gap and historical patterns. If user is away, analyzes the gap to determine if it's likely a lunch break, sleep, or just a short break. Returns probability estimates and expected return time. Use this to decide whether to provide immediate responses or save complex suggestions for when they return.

---

## Advanced Temporal Processing

### execute_time_arithmetic
⏰ TIME ARITHMETIC: Execute precise date/time math with business rules. Supports operations: add, subtract, set_time, set_date. Handles business_days with regional holiday calendars. Returns step-by-step execution trace with deterministic hashing.

### resolve_temporal_phrase
🗣️ TEMPORAL PHRASE RESOLVER: Convert natural language phrases like 'tomorrow evening', 'end of week', 'early next week' to concrete time windows. Returns canonical window with start/end times, confidence score (0-1), and alternative interpretations. Context-aware for planning vs casual conversation.

### compare_temporal_phrases
📊 PHRASE COMPARATOR: Compare two temporal phrases to analyze their relationship. Returns time difference, overlap analysis, which is earlier/later, and human-readable comparison. Use for questions like 'Is end of week before early next week?'

### export_temporal_context_snapshot
📸 TEMPORAL CONTEXT SNAPSHOT: Export portable temporal context for Multi-LLM systems. Returns TemporalContextSnapshotV1 schema including current time, calendars, upcoming events, rhythm fingerprint, and optional artifacts. Use for sharing context between Claude, GPT-4, Gemini.

### generate_temporal_prompt_prefix
📝 PROMPT PREFIX GENERATOR: Convert temporal context snapshot to concise LLM-ready prompt prefix. Configurable max lines (default: 20). Optimized for system prompts. Use after export_temporal_context_snapshot.

### check_good_moment_for_activity
✅ ACTIVITY TIMING: Check if now is good moment for activity. Activities: deep_work, financial_decision, hard_feedback, creative_play, exercise. Returns yes/no, score (0-1), reasons, and suggested alternative time. Considers time of day, bedtime proximity, upcoming events, historical patterns.

### check_temporal_conflicts
⚠️ CONFLICT CHECKER: Analyze events for conflicts with holidays, weekends, sleep hours, work restrictions. Returns conflict analysis per event, overall risk level, summary. Multi-region holiday checking and sleep pattern analysis.

### explain_time_behavior
📖 TIME EXPLAINER: Get simple explanations for complex time concepts. Topics: dst_transition (DST changes), business_days (how they work), timezone_difference (between two zones). Returns title, explanation, and key points in simple language.

### analyze_global_sacred_time
🌏 GLOBAL SACRED TIME: Multi-region sacred time analysis for product launches, webinars, maintenance windows. Returns avoid windows (Ramadan, religious holidays), preferred windows. Supports religions: islam, christian, hindu, buddhist. Use for 'When to launch in US/SA/IN/ID?'

### get_weekly_sacred_rhythm
📅 WEEKLY SACRED RHYTHM: Generate 7-day × 24-hour grid for multicultural teams. Shows aggregate scores for religious observances (Jumu'ah, Shabbat, Sunday worship) with severity scoring (0-1). Returns recommendations for recurring meetings. Use for 'When can US/SA/IL team meet?'

### get_microseason_context
🌸 MICROSEASON CONTEXT: Get seasonal micro-context for location and date. Returns microseason ID/name, day length, sunrise/sunset, description, suggested tone. Hemisphere-aware seasonal classification. Use for 'What microseason is it in Tokyo?'

### convert_time_scale
🔄 TIME SCALE CONVERTER: Convert between different time scales (Unix seconds, Unix millis, UTC ISO, Local ISO). Explicit timezone handling for local conversions. Batch conversion support. Use for 'Convert Unix timestamp 1733700000 to NYC time', 'What is this time in UTC?'

### list_time_scales
📋 LIST TIME SCALES: List all supported time scales with descriptions and examples. Helps discover conversion capabilities. Shows: UNIX_SECONDS, UNIX_MILLIS, UTC_ISO, LOCAL_ISO (TAI, GPS planned).

---

## Calendar and Recurrence

### interval_operations
📊 INTERVAL ALGEBRA: Perform set operations on time intervals. Operations: UNION (merge intervals), INTERSECTION (find overlap), DIFFERENCE (subtract), GAPS (find gaps). Handles overlapping and adjacent intervals with normalized output. Use for 'Find overlapping time windows', 'Merge available time slots', 'Find gaps in schedule'.

### expand_recurrence
🔁 RECURRENCE EXPANDER: Expand RRULE recurrence patterns (RFC 5545) to concrete occurrences within time window. Supports full RRULE syntax (FREQ=WEEKLY;BYDAY=MO,WE,FR). Safety limit: max 1000 occurrences. Use for 'Find all Mondays in January', 'When does this meeting repeat?', 'Show me all occurrences'.

### align_calendars
📅 MULTI-CALENDAR ALIGNMENT: Show single chronological instant across multiple calendar systems. Supports: Gregorian, Unix, ISO Week, Ordinal (more planned: Islamic, Hebrew, Chinese). Use for 'What is Dec 9, 2025 in Islamic calendar?', 'Show this date in Hebrew and Chinese', 'Multi-calendar view'.

### find_partial_dates
🔍 PARTIAL DATE FINDER: Find all dates matching partial specification within search range. Search by year, month, day constraints. Use for 'Find all September 1st dates from 2020-2030', 'When is first Monday of September?', 'All dates with month=12 day=25'.

---

## Fuzzy Time

### create_fuzzy_time_circa
🌫️ FUZZY TIME FROM CIRCA: Create fuzzy time representation from circa date expression with explicit uncertainty. Precision levels: year, month, day. Returns center point, window, confidence score (0-1). Use for 'circa 1990', historical dates with uncertainty, approximate times. Represents uncertainty mathematically.

### create_fuzzy_time_window
🌫️ FUZZY TIME FROM WINDOW: Create fuzzy time from explicit time window with custom confidence scoring. Use for uncertain future events, flexible scheduling, time estimates. Returns center point (midpoint), window bounds, confidence score. Enables mathematical operations on uncertain times.

### intersect_fuzzy_times
🌫️ FUZZY TIME INTERSECTION: Find intersection of two fuzzy times with refined confidence. When two uncertain time ranges overlap, this computes their intersection with combined confidence scoring. Use for 'When do these two uncertain events both happen?', 'Find overlap between approximate times'.

---

## Astronomical

### get_astro_context
🌅 ASTRONOMICAL CONTEXT: Get sunrise, sunset, day length, twilight times, and moon phase for a date and location. Returns solar noon, day length in hours, civil twilight boundaries, and current moon phase. Use for 'When is sunrise in NYC?', 'Day length on Dec 21', 'Moon phase today'.

### get_day_phase
🌗 DAY PHASE CLASSIFICATION: Classify a timestamp into day phase (pre_dawn, morning, midday, afternoon, evening, night) based on solar position. Returns phase, sun above/below horizon, and time relative to sunrise/sunset. Use for 'What phase of day is 10pm?', 'Is sun above horizon now?'.

### get_season_context
🍂 SEASONAL CONTEXT: Get hemisphere-aware seasonal classification for a date and location. Returns season (winter, spring, summer, autumn with early/late variants), hemisphere, day of year, and contextual notes. Automatically adjusts for southern hemisphere. Use for 'What season is it in Sydney in December?', 'Season in NYC today'.

### get_zodiac_context
⭐ WESTERN ZODIAC CONTEXT: Get planet positions, zodiac signs, and aspects for a timestamp. Returns ecliptic longitudes, signs (with element/modality), and aspects (conjunction, opposition, trine, square, sextile) between bodies.

### get_chinese_zodiac
🐉 CHINESE ZODIAC: Get Chinese zodiac animal, element, and 60-year cycle for a date. Returns lunar year, animal (Rat to Pig), element (Wood/Fire/Earth/Metal/Water), yin/yang, and cycle indices.

### get_astro_events
🌙 ASTRO EVENTS: Get astronomical events in a time window. Returns sun ingresses (Sun entering each zodiac sign) and moon phases (new, first quarter, full, last quarter) with precise UTC timestamps.

### get_astro_calendar
📅 ASTRO CALENDAR: Get astrology calendar for a date range in user's timezone. Returns sun ingresses and moon phases with local times and human-readable descriptions perfect for LLM presentation.

---

## Observances and Cultural

### get_observances_on_date
📅 OBSERVANCES ON DATE: Get awareness days, fun days, commemorations, and cultural observances for a specific date. Categories: awareness_day, fun_day, tech, seasonal, commemoration, cultural, religious, corporate.

### get_today_story
🎯 TODAY'S STORY: Get curated highlights for today - most relevant observances based on user's region and interests. Returns 1-3 personalized observances with relevance scoring.

### get_observances_calendar
📆 OBSERVANCES CALENDAR: Get calendar view of observances for a specific month. Returns all observances by day for planning and UI calendar displays.

---

## Summary

This MCP server provides **49 tools** organized into 8 main categories:

1. **Core Temporal Tools** (7 tools): Basic time and date operations
2. **Holiday and Business Time** (10 tools): Holiday checking, business day calculations, market holidays
3. **User Analysis** (3 tools): Cognitive state, work patterns, availability prediction
4. **Advanced Temporal Processing** (13 tools): Phrase resolution, arithmetic, conflict checking, sacred time analysis
5. **Calendar and Recurrence** (4 tools): Calendar alignment, recurrence expansion, partial dates
6. **Fuzzy Time** (3 tools): Uncertain time representations
7. **Astronomical** (7 tools): Sunrise/sunset, seasons, zodiac, astro events
8. **Observances and Cultural** (3 tools): Awareness days, observances calendars

**Source File**: `src/index.ts`

**Server Version**: 1.6.2

**Server Name**: vreme-time-service
