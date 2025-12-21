# Changelog

All notable changes to the Vreme Temporal MCP Server are documented here.

## [1.9.4] - 2024-12-20

### Date Range Operations

**3 NEW MCP TOOLS (59 total)** - Date range overlap detection, containment checks, and set operations

### Added

#### Date Range Operations Tools (3 NEW tools)
- **`date_range_overlap`** - Check if two date ranges overlap and return overlap details
  - Returns boolean, overlap start/end dates, and overlap days count
  - Use for checking if two time periods overlap, finding common availability windows, or detecting scheduling conflicts
  - Handles edge cases (adjacent ranges, fully contained ranges)

- **`date_range_contains`** - Check if a date is within a range and return position data
  - Returns boolean, position (start/end/middle/before/after), and days from start/end
  - Use for checking if a date falls within a period, finding relative position of dates, or validating date membership in ranges
  - Provides detailed position information for precise date analysis

- **`date_range_operations`** - Perform set operations on date ranges (union, intersection, difference)
  - Returns merged result ranges with total days and count
  - Operations: union (merge ranges), intersection (find common periods), difference (subtract ranges)
  - Use for combining availability windows, finding common periods, or subtracting blocked time from available periods
  - Automatically merges overlapping/adjacent ranges in results

### Design Philosophy

All new tools follow Vreme's data-first architecture:
- **Structured JSON only** - No formatted strings, LLM formats as needed
- **Pure computational operations** - No scheduling logic, just set operations
- **Stateless operations** - Fast, scalable, no storage
- **Authoritative calculations** - Returns structured facts about range relationships

### Changed

- **Total MCP tools:** 56 (was 56) → **+3 new tools = 59 total**
- **Python service:** Added DateRangeOperations engine module
- **Python service:** Added 3 new endpoints at `/v1/time/ranges/*`
- **MCP server:** Updated startup message with v1.9.4 tools

### Documentation

- Updated README.md with new tools in Date Range Operations category
- Updated package.json description (56 → 59 tools)
- Updated Python service README with new endpoints

## [1.9.3] - 2024-12-20

### Timezone Offset Intelligence

**3 NEW MCP TOOLS (56 total)** - Timezone offset calculations, DST transitions, and timezone metadata

### Added

#### Timezone Offset Tools (3 NEW tools)
- **`get_timezone_offset`** - Get offset between two timezones as structured data
  - Returns offset_seconds, offset_hours, is_dst status for both timezones
  - Includes DST transition information for both timezones
  - Use for calculating time differences between timezones and understanding DST effects
  - Supports all IANA timezone identifiers

- **`compare_timezones`** - Compare multiple timezones, return offset data for each pair
  - Returns structured comparison data showing offsets between all timezone pairs
  - Shows current times in each timezone and DST status
  - Use for coordinating across multiple timezones or understanding global time relationships
  - Minimum 2 timezones required

- **`get_timezone_info`** - Get timezone metadata including UTC offset, DST rules, and transitions
  - Returns structured data about timezone properties
  - Shows current DST status and next/previous DST transitions
  - Use for understanding timezone behavior, planning around DST changes, or getting timezone details
  - Supports all IANA timezone identifiers

### Design Philosophy

All new tools follow Vreme's data-first architecture:
- **Structured JSON only** - No formatted strings, LLM formats as needed
- **DST-aware calculations** - Accurate handling of daylight saving time transitions
- **Stateless operations** - Fast, scalable, no storage
- **Authoritative data** - Returns structured facts about timezone offsets and transitions

### Changed

- **Total MCP tools:** 53 (was 53) → **+3 new tools = 56 total**
- **Python service:** Added TimezoneIntelligence engine module
- **Python service:** Added 3 new endpoints at `/v1/timezone/*`
- **MCP server:** Updated startup message with v1.9.3 tools

### Documentation

- Updated README.md with new tools in Timezone Offset category
- Updated package.json description (53 → 56 tools)
- Updated Python service README with new endpoints

## [1.9.2] - 2024-12-20

### Duration & Period Intelligence

**5 NEW MCP TOOLS (53 total)** - Structured duration and period calculations

### Added

#### Duration & Period Tools (5 NEW tools)
- **`calculate_duration`** - Calculate structured duration between two timestamps
  - Returns total_seconds, days, hours, minutes, seconds as separate numeric fields
  - Handles timezone-aware calculations
  - Use for calculating time differences, elapsed time, or duration between events

- **`calculate_period`** - Calculate weeks, months, quarters, or years between dates
  - Returns structured data with days, weeks, months, quarters, and years
  - Handles leap years and month boundaries accurately
  - Supports all period types: days, weeks, months, quarters, years

- **`age_from_birthdate`** - Calculate age as structured data from birthdate
  - Returns years, months, days, and total_days as separate numeric fields
  - Handles leap years and month boundaries accurately
  - Optional reference date support (defaults to today)

- **`time_until`** - Calculate time until a future timestamp
  - Returns structured duration data (total_seconds, days, hours, minutes, seconds)
  - Indicates if the time is in the past
  - Optional current_time parameter (defaults to now)

- **`time_since`** - Calculate time since a past timestamp
  - Returns structured duration data (total_seconds, days, hours, minutes, seconds)
  - Indicates if the time is in the future
  - Optional current_time parameter (defaults to now)

### Design Philosophy

All new tools follow Vreme's data-first architecture:
- **Structured JSON only** - No formatted strings, LLM formats as needed
- **Pure computational facts** - No opinions or suggestions
- **Stateless operations** - Fast, scalable, no storage
- **Authoritative calculations** - Accurate handling of edge cases (leap years, DST, month boundaries)

### Changed

- **Total MCP tools:** 48 (was 48) → **+5 new tools = 53 total**
- **Python service:** Added DurationCalculator engine module
- **Python service:** Added 5 new endpoints at `/v1/time/duration/*`
- **MCP server:** Updated startup message with v1.9.2 tools

### Documentation

- Updated README.md with new tools in Duration & Period category
- Updated package.json description (48 → 53 tools)
- Updated Python service README with new endpoints

## [1.9.1] - 2024-12-20

### Documentation

- Professional documentation cleanup across all files
- Removed emojis from README.md, MCP_TOOLS_REFERENCE.md, and CHANGELOG.md
- Streamlined README structure and removed marketing language
- Updated package.json description to be concise and professional
- Enhanced package.json with bugs, engines, and author metadata fields

## [1.9.0] - 2024-12-13

### Removed Features (Breaking Change)

- **Removed behavior context tracking system** - Deleted user cognitive state analysis, work pattern tracking, and availability prediction
- **Removed 3 tools:** `get_user_cognitive_state`, `analyze_work_patterns`, `predict_user_availability`
- **Tool count reduced:** 51 → 48 tools
- Removed `cognitive_day_boundary` field from temporal context
- Removed all "personalized awareness" and "cognitive rhythm" marketing language
- File `~/.vreme/behavior-context.json` is now obsolete (safe to delete)

### Changes

- Renamed "Cognitive state indicators" to "Time of day indicators" in code comments
- Updated help text from "behavior data" to "context data"
- Kept: `is_late_night` and `is_early_morning` indicators (time-based, not behavior-based)
- Kept: Temporal context tracking and activity burst tracking

### Documentation

- Updated all documentation to remove behavior context references
- Updated website to remove personalized awareness features
- Added MIGRATION_NOTE.md for users upgrading from v1.8.4 or earlier

## [1.8.5] - 2024-12-13

### Docs Cleanup

- Documentation cleanup
- Version sync across all code bases 

## [1.8.4] - 2024-12-12

### Design Principle Compliance

- **Fixed text generation violation** in `temporal_context_snapshot.py`
  - Refactored `generate_prompt_prefix()` to return structured data instead of generated text
  - Removed prescriptive suggestions like "Keep suggestions tonight light and avoid starting large new tasks"
  - Now returns pure structured context: `current_time`, `rhythm`, `recent_activity`, `upcoming_events`, `sacred_time_flags`, `time_of_day_classification`
  - LLM now interprets raw temporal data rather than receiving pre-written instructions
  - Aligns with core principle: "We are NOT text generators (that's the LLM's job)"

## [1.8.3] - 2024-12-12

### Bug Fixes

- Fixed duplicate `get_microseason_context` tool registration causing server crash
- Added `skyfield==1.53` dependency to Python requirements.txt

## [1.8.2] - 2024-12-12

### ASTROLOGY + OBSERVANCE UNIVERSE

**7 NEW MCP TOOLS (51 total)** - Astronomy-backed astrology + cultural observances

### Added

#### Astrology Layer (4 NEW tools)
- **`get_zodiac_context`** - Western zodiac signs, planet positions, aspects
  - Sun, Moon, Mercury, Venus, Mars positions in tropical zodiac
  - Aspect detection: conjunctions (0°), oppositions (180°), trines (120°), squares (90°), sextiles (60°)
  - Astronomy-backed using Skyfield + JPL DE421 ephemeris
  - Returns sign, degree in sign, element, modality, aspect orbs

- **`get_chinese_zodiac`** - Chinese zodiac animal & element cycles
  - 60-year sexagenary cycle: 12 animals × 10 elements with yin/yang
  - Lunar year calculation (Rat, Ox, Tiger... Pig)
  - Element: Wood, Fire, Earth, Metal, Water

- **`get_astro_events`** - Sun ingresses & moon phases in time window
  - Sun ingresses: when Sun enters new zodiac sign (12 per year)
  - Moon phases: new moon, first quarter, full moon, last quarter
  - Returns UTC times + event types

- **`get_astro_calendar`** - Astrology calendar with local times
  - Monthly/yearly astro event calendar
  - Converts UTC to user's timezone
  - Filters by event type (sun_ingress, moon_phase, or both)

#### Observance Universe (3 NEW tools)
- **`get_observances_on_date`** - Awareness days, fun days, commemorations
  - Categories: awareness_day, fun_day, tech, seasonal, commemoration, cultural, religious, corporate
  - Scope filtering: global, country, region, organization
  - Importance scoring (0-1) and tag-based filtering

- **`get_today_story`** - Curated highlights for today
  - Returns 1-3 most relevant observances
  - User context: region, interests, timezone

- **`get_observances_calendar`** - Monthly observance calendar
  - Month-wide observance planning
  - Category and importance filtering
  - UI calendar display support

### Design Philosophy
- Astrology as **time structure**, not fortune-telling
- **Stateless architecture** - no database, all calculations on-demand
- **Astronomy-backed** - JPL DE421 ephemeris (1900-2050)
- **Deterministic & versioned** - astro_v1 model version for reproducibility
- **Privacy-first** - no data storage, pure computation

## [1.7.0 + Phase A] - 2024-12-09

### TEMPORAL OS EXTENSIONS - Phase A: Clock & Calendar Completion

**9 NEW MCP TOOLS** - Mathematical foundation for temporal reasoning

### Added

#### Time Scales & Conversions (2 NEW tools)
- **`convert_time_scale`** - Convert between time scales
  - Supports: UNIX_SECONDS, UNIX_MILLIS, UTC_ISO, LOCAL_ISO
  - Planned: TAI, GPS time scales
  - Explicit timezone handling
  - Batch conversion support
  - Use cases: "Convert Unix timestamp to UTC", "What is 1733700000 in New York time?"

- **`list_time_scales`** - List supported time scales
  - Shows all available scales with descriptions and examples
  - Helps discover conversion capabilities

#### Interval Algebra (2 NEW tools)
- **`interval_operations`** - Set operations on time intervals
  - Operations: UNION (merge), INTERSECTION (overlap), DIFFERENCE (subtract), GAPS (find gaps)
  - Handles overlapping and adjacent intervals
  - Normalized output
  - Use cases: "Find overlapping time windows", "Merge available time slots", "Find gaps in schedule"

- **`expand_recurrence`** - RRULE recurrence pattern expansion
  - Full RFC 5545 RRULE syntax support
  - Expand to concrete occurrences within window
  - Safety limit: max 1000 occurrences
  - Use cases: "Find all Mondays in January", "When does this meeting repeat?"

#### Multi-Calendar System (2 NEW tools)
- **`align_calendars`** - Multi-calendar alignment
  - Show single instant across multiple calendar systems
  - Supports: Gregorian, Unix, ISO Week, Ordinal (more planned)
  - Use cases: "What is Dec 9, 2025 in Islamic calendar?", "Show this date in Hebrew and Chinese"

- **`find_partial_dates`** - Partial date matching
  - Find all dates matching partial specification
  - Search by year, month, day constraints
  - Use cases: "Find all September 1st dates", "When is first Monday of September?"

#### Fuzzy/Uncertain Time (3 NEW tools)
- **`create_fuzzy_time_circa`** - Fuzzy time from circa expressions
  - Represent uncertainty explicitly with window + confidence
  - Precision levels: year, month, day
  - Use cases: "circa 1990", historical dates, approximate times

- **`create_fuzzy_time_window`** - Fuzzy time from explicit window
  - Custom confidence scoring
  - Use cases: Uncertain future events, flexible scheduling, time estimates

- **`intersect_fuzzy_times`** - Intersection of two fuzzy times
  - Find overlap between uncertain time ranges
  - Combined confidence scoring
  - Use cases: "When do these uncertain events both happen?", "Find overlap"

### Backend APIs (Python Service)

**9 NEW ENDPOINTS** at `/v1/time/*` and `/v1/calendars/*`:
- `POST /v1/time/scales/convert` - Time scale conversions
- `GET /v1/time/scales/list` - List time scales
- `POST /v1/time/intervals/ops` - Interval operations
- `POST /v1/time/recurrence/expand` - RRULE expansion
- `POST /v1/calendars/alignment` - Calendar alignment
- `POST /v1/calendars/partial_dates` - Partial date search
- `POST /v1/time/fuzzy/from_circa` - Circa fuzzy time
- `POST /v1/time/fuzzy/from_window` - Window fuzzy time
- `POST /v1/time/fuzzy/intersect` - Fuzzy time intersection

### Core Engines (Python Service)

**5 NEW ENGINE MODULES** (~1,815 lines):
- `time_scales_converter.py` (329 lines) - TimeScalesConverter class
- `interval_algebra.py` (386 lines) - IntervalAlgebra + RecurrenceExpander classes
- `multi_calendar_alignment.py` (274 lines) - MultiCalendarAlignment class
- `fuzzy_time.py` (471 lines) - FuzzyTime + FuzzyTimeBuilder + FuzzyTimeOperations classes
- `phase_a_routes.py` (355 lines) - Route registration for Phase A

### Architecture

- **Deterministic APIs** - All endpoints return versioned responses with input_hash
- **Singleton pattern** - All engines use efficient singleton instances
- **Modular route registration** - `phase_a_routes.py` for clean integration
- **RFC 5545 compliance** - RRULE implementation follows standard
- **Safety limits** - Max iterations on searches and expansions

### Changed

- **Total MCP tools:** 40 (was 31) → **+9 new tools**
- **Python service:** Added Phase A integration to main.py
- **MCP server:** Updated startup message with Phase A tools

### Documentation

- Updated Python service README with Phase A features
- Updated MCP CHANGELOG with comprehensive Phase A entry
- All tools include detailed descriptions and use cases

### Impact

**Before Phase A:**
- Time-aware with calendar intelligence
- Business day calculations
- Holiday awareness

**After Phase A:**
- Mathematical foundation for temporal reasoning
- Set theory over time intervals
- Scale-agnostic time representation
- Recurrence pattern evaluation
- Multi-calendar alignment
- Explicit uncertainty representation

This establishes Vreme as having a **complete mathematical foundation** for temporal reasoning,
transforming it from "time-aware" to a **Temporal Operating System**.

## [1.6.2] - 2024-12-08

### Added
- **Roman Calendar Support** - Ancient Roman calendar with Kalends, Nones, and Ides dating system
  - AUC (Ab Urbe Condita) year notation
  - Roman festivals and observances (Saturnalia, Lupercalia, etc.)
  - Famous dates (Ides of March assassination)
  - Proper Roman date expressions
- **Enhanced Cultural Calendar Coverage** - Now supports 31 calendar systems (was 30)

## [1.6.1] - 2024-12-08

### Added
- **3 NEW MCP Tools for Behavior Analysis:**

### Changed
  - `temporal-context.json` - Current time/timezone only (for LLM)
- **Added timezone to all behavior objects** - Sessions, sleep gaps, and lunch gaps now include timezone
- **Sleep pattern recognition** - 2.5+ hour gaps during late night (10pm-6am)
- **Lunch break detection** - 30+ min breaks during lunch hours (11am-2pm)
- **Efficient storage** - One session object per burst (updated in place, no duplicates)

### Features
- Local-only behavior tracking (privacy-first, no backend)
- "Tomorrow" intelligence - Understands user's actual day boundaries
- Session phase analysis for task complexity recommendations
- Travel detection via timezone changes

## [1.5.6] - 2024-12-07

### Added
- Efficient storage architecture for activity sessions
- Auto-migration from old storage format

### Changed
- Context switch threshold reduced from 1 hour to 30 minutes

## [1.5.5] - 2024-12-06

### Added
- `get_current_time` tool - Never again will an LLM not know what time it is
- Cross-client temporal consistency (Claude Desktop, Continue, Cline)

### Features
- Local-only personalization in `~/.vreme/temporal-context.json`
- Sleep/wake cycle understanding
- Late night session detection

## [1.5.3] - 2024-11-28

### Added
- Enhanced temporal context resource

## [1.5.1] - 2024-11-25

### Added
- `validate_date` tool - Date validation and parsing
- `add_business_days_detailed` tool - Enhanced business day calculations with detailed explanations
- Common business days finder for international teams

### Changed
- Improved date handling across all tools

## [1.5.0] - 2024-11-20

### Added
- **Global Holiday Intelligence** - 247+ countries with comprehensive holiday data
- **Category filtering** - PUBLIC, BANK, SCHOOL, OPTIONAL, GOVERNMENT
- **5 Financial Markets** - NYSE, NSE India, Brazil B3, ECB TARGET2, ICE Futures Europe
- **6 New Holiday Tools:**
  - `list_holiday_countries` - Discover all 247+ supported countries
  - `get_country_holidays` - Get ALL holidays for a country with category filtering
  - `check_holiday` - Quick PUBLIC holiday check (<10ms)
  - `list_financial_markets_holidays` - List supported financial markets
  - `get_market_holidays` - Get trading holidays for a market
  - `check_business_day` - Check if date is a business day

### Changed
- Powered by python-holidays v0.86+
- Business day logic: Not PUBLIC holiday AND not weekend

## [1.4.x] - Earlier Versions

### Core Features
- 200+ timezone support with DST handling
- 31 cultural calendars (Hebrew, Islamic, Chinese, Hindu, Persian, Buddhist, Roman, etc.)
- Islamic prayer times with Qibla direction
- Astronomical calculations (sunrise, sunset, moon phases)
- Activity appropriateness detection
- Temporal density scoring
- Natural language query interface
- Stateless architecture for scalability

---

**Links:**
- [npm Package](https://www.npmjs.com/package/@vreme/temporal-mcp)
- [GitHub Repository](https://github.com/vreme-ai/temporal-mcp)
- [Website](https://vreme.ai)
