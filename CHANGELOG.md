# Changelog

All notable changes to the Vreme Temporal MCP Server are documented here.

## [1.7.6] - 2024-12-10

### 🚀 MAJOR RELEASE: TEMPORAL OS EXTENSIONS

**16 NEW MCP TOOLS** - Mathematical foundation + Observance awareness + Planet-aware time

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

#### Observance Universe (3 NEW tools)
- **`get_observances_on_date`** - Get awareness days, fun days, commemorations on a date
  - Categories: awareness_day, fun_day, tech, seasonal, commemoration, cultural, religious, corporate
  - Scope filtering: global, country, region, organization
  - Importance scoring (0-1)
  - Tag-based filtering
  - Use cases: "What awareness days are today?", "What tech holidays in March?", "Find health awareness days"

- **`get_today_story`** - Curated highlights for today
  - Personalized relevance scoring (importance + scope match + tag overlap)
  - Returns 1-3 most relevant observances
  - User context: region, interests, timezone
  - Use cases: "What's happening today?", "Show me relevant observances", "What should I know about today?"

- **`get_observances_calendar`** - Calendar view of observances for a month
  - Month-wide observance planning
  - Category and importance filtering
  - Country-specific filtering
  - Use cases: "What awareness days in June?", "Plan Pride Month content", "Find tech holidays this quarter"

#### Environmental / Planetary Time (4 NEW tools)
- **`get_astro_context`** - Astronomical context for date and location
  - Sunrise, sunset, solar noon times (timezone-aware)
  - Day length in hours
  - Civil twilight boundaries
  - Moon phase (8 phases: new_moon, waxing_crescent, first_quarter, waxing_gibbous, full_moon, waning_gibbous, last_quarter, waning_crescent)
  - Use cases: "When is sunrise in NYC?", "Day length on Dec 21", "Moon phase today"

- **`get_day_phase`** - Day phase classification based on solar position
  - 6 phases: pre_dawn, morning, midday, afternoon, evening, night
  - Sun above/below horizon status
  - Time relative to sunrise/sunset
  - Use cases: "What phase of day is 10pm?", "Is sun above horizon now?"

- **`get_season_context`** - Hemisphere-aware seasonal classification
  - 8 seasons: winter, early_spring, spring, early_summer, summer, early_autumn, autumn, early_winter
  - Automatic hemisphere adjustment (southern hemisphere seasons shifted)
  - Day of year tracking
  - Contextual notes
  - Use cases: "What season is it in Sydney in December?", "Season in NYC today"

- **`get_microseason_context`** - Fine-grained seasonal taxonomy
  - 8 microseasons per year for detailed seasonal awareness
  - Environmental band classification (7 bands: equatorial, tropical_north/south, mid_lat_north/south, polar_north/south)
  - Tone hints for LLM content adaptation (e.g., "reflective, cozy" for deep winter)
  - Display names and descriptions
  - Use cases: "What microseason is it?", "Seasonal tone for content", "Environmental context for date"

### Backend APIs (Python Service)

**16 NEW ENDPOINTS:**

Time & Calendar APIs (`/v1/time/*` and `/v1/calendars/*`):
- `POST /v1/time/scales/convert` - Time scale conversions
- `GET /v1/time/scales/list` - List time scales
- `POST /v1/time/intervals/ops` - Interval operations
- `POST /v1/time/recurrence/expand` - RRULE expansion
- `POST /v1/calendars/alignment` - Calendar alignment
- `POST /v1/calendars/partial_dates` - Partial date search
- `POST /v1/time/fuzzy/from_circa` - Circa fuzzy time
- `POST /v1/time/fuzzy/from_window` - Window fuzzy time
- `POST /v1/time/fuzzy/intersect` - Fuzzy time intersection

Observance APIs (`/v1/observances/*`):
- `POST /v1/observances/on_date` - Get observances on specific date
- `POST /v1/observances/today_story` - Get curated today's highlights
- `GET /v1/observances/calendar` - Get observances for entire month

Environmental APIs (`/v1/env/*`):
- `POST /v1/env/astro_context` - Get astronomical context (sunrise, sunset, moon phase)
- `POST /v1/env/day_phase` - Classify timestamp into day phase
- `POST /v1/env/season_context` - Get hemisphere-aware seasonal context
- `POST /v1/env/microseason_context` - Get microseason taxonomy with tone hints

### Core Engines (Python Service)

**9 NEW ENGINE MODULES** (~3,165 lines):

Clock & Calendar Engines:
- `time_scales_converter.py` (329 lines) - TimeScalesConverter class
- `interval_algebra.py` (386 lines) - IntervalAlgebra + RecurrenceExpander classes
- `multi_calendar_alignment.py` (274 lines) - MultiCalendarAlignment class
- `fuzzy_time.py` (471 lines) - FuzzyTime + FuzzyTimeBuilder + FuzzyTimeOperations classes

Observance Engines:
- `observance_registry.py` (320+ lines) - ObservanceRegistry + Observance + ObservanceRule classes
  - Curated database of awareness days, fun days, tech holidays, commemorations
  - RuleType support: FIXED (Pi Day 3/14), NTH_WEEKDAY (1st Friday of June), MONTH_RANGE (Pride Month)
  - Examples: Pi Day, Earth Day, National Donut Day, Pride Month, Black History Month, World Health Day

Environmental Engines:
- `environmental_time.py` (600+ lines) - EnvironmentalTimeEngine + Astronomical/Season/Microseason engines
  - AstronomicalEngine - Sunrise/sunset/moon phase calculations
  - DayPhaseClassifier - 6-phase classification (pre_dawn, morning, midday, afternoon, evening, night)
  - SeasonClassifier - 8-season taxonomy with hemisphere awareness
  - MicroseasonEngine - 8 microseasons per year with tone hints
  - EnvironmentalBands - 7 latitudinal bands (equatorial, tropical, mid-lat, polar)

### Architecture

- **Deterministic APIs** - All endpoints return versioned responses with input_hash
- **Singleton pattern** - All engines use efficient singleton instances
- **Modular route registration** - Clean separation of concerns
- **RFC 5545 compliance** - RRULE implementation follows standard
- **Safety limits** - Max iterations on searches and expansions

### Changed

- **Total MCP tools:** 47 (was 31) → **+16 new tools**
- **Python service:** Complete temporal OS integration
- **MCP server:** Updated with full temporal intelligence suite
- **Version:** 1.7.6

### Documentation

- Updated Python service README with all new features
- Updated MCP CHANGELOG with comprehensive release notes
- Updated website with feature highlights
- All tools include detailed descriptions and use cases

### Impact

**Before v1.7.6:**
- Time-aware with calendar intelligence
- Business day calculations
- Holiday awareness (official PUBLIC holidays only)

**After v1.7.6:**

✨ **Mathematical Foundation:**
- Set theory over time intervals (UNION, INTERSECTION, DIFFERENCE, GAPS)
- Scale-agnostic time representation (Unix, UTC, Local, TAI/GPS planned)
- Recurrence pattern evaluation (RFC 5545 RRULE)
- Multi-calendar alignment
- Explicit uncertainty representation (fuzzy time)

✨ **Cultural & Social Awareness:**
- Observance universe beyond official holidays
- Awareness days (Earth Day, World Health Day, Pride Month)
- Fun days (Pi Day, Talk Like a Pirate Day, National Donut Day)
- Tech holidays (Programmers' Day)
- Personalized relevance scoring

✨ **Planetary Intelligence:**
- Astronomical context (sunrise, sunset, twilight, moon phases)
- Day phase classification based on solar position
- Hemisphere-aware seasonal awareness
- Microseason taxonomy with LLM tone hints
- Environmental band classification (7 latitudinal zones)

This transforms Vreme from "time-aware" to a **Temporal Operating System** that understands
the mechanics, meaning, and planetary context of time.

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
  - `get_user_cognitive_state` - Current session duration & phase (warming_up, focused, deep_work, extended)
  - `analyze_work_patterns` - Peak productivity hours, session statistics, sleep/lunch patterns
  - `predict_user_availability` - Predicts when user will return based on gap type and historical patterns

### Changed
- **Separated temporal and behavior contexts:**
  - `temporal-context.json` - Current time/timezone only (for LLM)
  - `behavior-context.json` - Historical patterns (sessions, sleep, lunch)
- **Added timezone to all behavior objects** - Sessions, sleep gaps, and lunch gaps now include timezone
- **Sleep pattern recognition** - 2.5+ hour gaps during late night (10pm-6am)
- **Lunch break detection** - 30+ min breaks during lunch hours (11am-2pm)
- **30-minute context switch threshold** (was 1 hour) - Better cognitive boundary detection
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
- `get_temporal_context` tool - Personalized temporal awareness
- Cross-client temporal consistency (Claude Desktop, Continue, Cline)
- Cognitive rhythm awareness

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
