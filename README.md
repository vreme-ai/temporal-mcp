<p align="center">
  <a href="https://vreme.ai">
    <img src="https://www.gravatar.com/avatar/ff544f8e090d77cb8655b6762f80492c?s=200&d=identicon" alt="Vreme Logo" width="200"/>
  </a>
</p>

# Vreme Temporal MCP Server

MCP server providing temporal intelligence - timezone conversions, 31 cultural calendars, astronomical events, prayer times, **247+ countries' holiday data**, **5 financial markets**, business time calculations, and **personalized temporal awareness** that adapts to YOUR cognitive rhythms.

## ✨ What's New in v1.6.2

⚡ **Personalized Temporal Awareness** - Claude adapts to YOUR cognitive rhythms!
- **3 NEW MCP Tools** - `get_user_cognitive_state`, `analyze_work_patterns`, `predict_user_availability`
- **Local-only behavior analysis** - Analyzes your activity bursts to understand your cognitive rhythms
- **Smart context switching** - 30-minute gap detection for natural work session boundaries
- **Sleep pattern recognition** - Detects 2.5+ hour gaps during late night (10pm-6am)
- **Lunch break detection** - Recognizes 30+ min breaks during lunch hours (11am-2pm)
- **"Tomorrow" intelligence** - Work til 3am, say "tomorrow", sleep 3+ hrs → Claude knows you mean after you wake up
- **Dual context files** - `temporal-context.json` (current time) + `behavior-context.json` (your patterns)
- **Privacy-first** - All stored locally in `~/.vreme/` (no backend, no surveillance)

📝 **[Full Version History & Changelog](CHANGELOG.md)**

## Features

### 🌍 Global Holiday Intelligence (NEW in v1.5.0)
- **247+ countries** with comprehensive holiday data
- **Category support** - Filter by PUBLIC (govt closures), BANK, SCHOOL, OPTIONAL
- **National holidays** - Government-recognized public holidays
- **Bank holidays** - Financial market closures
- **Business day logic** - Not a PUBLIC holiday AND not a weekend
- **5 financial markets** - NYSE, NSE India, Brazil B3, ECB TARGET2, ICE Futures Europe
- **Trading holidays** - Know when stock exchanges are closed
- **Powered by python-holidays v0.86+** - Community-maintained, accurate data

### ⏰ Temporal Intelligence
- **Personalized Awareness** - Adapts to YOUR cognitive rhythms (sleep/wake, work bursts, lunch breaks)
- **Natural language queries** - "What time is it in Tokyo?", "Is it Ramadan?", "Can I call Berlin now?"
- **200+ timezones** - Complete pytz timezone database with DST handling
- **Astronomical events** - Sunrise, sunset, moon phases, twilight times
- **Activity appropriateness** - Smart recommendations for calls, meetings, work based on time and culture
- **Temporal Context Engine** - Deep temporal analysis for any date across all 31 calendars
- **Date Comparison** - Compare temporal significance of two dates
- **Temporal Density Scoring** - Quantify how "significant" any date is culturally (0-100)
- **Business Time Intelligence** - Calculate business days/hours accounting for country-specific weekends and holidays
- **Historical Temporal Context** - Get comprehensive temporal snapshot for any historical date
- **Context Switch Detection** - 30-minute gaps automatically detect natural cognitive boundaries
- **Privacy-First** - All behavioral data stored locally in `~/.vreme/` (no backend)

### 📅 Cultural Calendars (32 Systems)

**Major Religious & Cultural Calendars:**
- **Hebrew** - Shabbat detection, holiday observances, work restrictions, Torah portions
- **Islamic** - Ramadan fasting, prayer times, Eid celebrations, Islamic holidays
- **Chinese** - Lunisolar calendar, zodiac animals, 5 elements, 24 solar terms
- **Hindu** - Festival dates, Diwali, Holi, regional observances
- **Persian** - Nowruz, Zoroastrian heritage
- **Buddhist** - Vesak, meditation days, Buddhist observances
- **Sikh** - Vaisakhi, Gurpurab, Sikh festivals
- **Coptic** - Coptic Christmas, Egyptian Christian calendar
- **Orthodox Christian** - Eastern Orthodox holidays, saints' days (including Bulgarian)
- **Ethiopian** - Ethiopian calendar and observances
- **Bahá'í** - Bahá'í calendar system and holy days
- **Thai Buddhist** - Thai Buddhist calendar
- **Tibetan** - Tibetan calendar and festivals
- **Zoroastrian** - Ancient Persian calendar
- **Armenian** - Armenian Apostolic calendar
- **Javanese** - Traditional Javanese calendar
- **Mongolian** - Mongolian calendar system
- **Burmese** - Burmese calendar

**East Asian Calendars:**
- **Japanese** - Imperial eras, national holidays
- **Bengali** - Bengali calendar
- **Tamil** - Tamil calendar
- **Nepali** - Nepali calendar

**Western & Technical Calendars:**
- **Mayan** - Long count calendar
- **French Revolutionary** - French Republican calendar
- **Revised Julian** - Modified Julian calendar
- **Discordian** - Discordian calendar
- **Holocene** - Human Era calendar
- **Unix Epoch** - Unix timestamp
- **ISO Week Date** - ISO 8601 week calendar
- **Western Zodiac** - Astrological calendar
- **Star Trek Stardate** - TNG-era Stardate system

**Coverage:** 5+ billion people, 10+ religions, 300+ total observances

### Islamic Prayer Times
- **All 5 daily prayers** - Fajr, Dhuhr, Asr, Maghrib, Isha
- **7 calculation methods** - MWL, ISNA, Egypt, Makkah, Karachi, Tehran, Jafari
- **Qibla direction** - Direction to Mecca from any location
- **Next prayer countdown** - Time until next prayer

## Design Philosophy

Vreme is built on core principles that make it uniquely powerful:

### ⚡ Ultra-Fast & Lightweight
- **Stateless architecture** - No database queries, pure computation
- **Sub-100ms responses** - Optimized for speed
- **Infinitely scalable** - No user data = no bottlenecks
- **Zero overhead** - No accounts, no storage, no sessions

### 🎯 Laser-Focused Scope
Vreme does ONE thing perfectly: **Temporal Intelligence**

**What we ARE:**
- Temporal data provider (calendars, holidays, business days)
- Astronomical calculator (moon phases, sunrise/sunset)
- Cultural calendar expert (30+ systems, 195 countries)
- Time computation engine (conversions, comparisons, analysis)

**What we are NOT:**
- ❌ Meeting scheduler (use Calendly, Cal.com)
- ❌ Text generator (that's the LLM's job)
- ❌ Calendar app (no event storage)
- ❌ Notification service (no webhooks)

### 📊 Pure Structured Data
- **JSON responses only** - No HTML, no formatting
- **Maximum composability** - LLMs decide how to present it
- **Zero opinions** - We provide facts, AI provides context

### ✅ Factual & Authoritative
- Verified holiday data for 247+ countries (powered by python-holidays v0.86+)
- 31 calendar systems with cultural accuracy
- Astronomical calculations from trusted libraries
- **No predictions** - only computable facts

This focus makes Vreme fast, reliable, and perfect for AI integration.

## Installation

### Using NPX (Recommended)

```bash
npx -y @vreme/temporal-mcp
```

### Using Docker

```bash
docker pull vreme/temporal-mcp
docker run --rm -i vreme/temporal-mcp
```

## Configuration

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

**NPX:**
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

**Docker:**
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

### Usage with VS Code

For quick installation, click the installation buttons below.

[![Install with NPX in VS Code](https://img.shields.io/badge/VS_Code-NPM-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=vreme&config={"command":"npx","args":["-y","@vreme/temporal-mcp"]})
[![Install with Docker in VS Code](https://img.shields.io/badge/VS_Code-Docker-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=vreme&config={"command":"docker","args":["run","--rm","-i","vreme/temporal-mcp"]})

For manual installation, you can configure the MCP server using one of these methods:

**Method 1: User Configuration (Recommended)**

Add the configuration to your user-level MCP configuration file.

Open the Command Palette (`Ctrl + Shift + P`) and run `MCP: Open User Configuration`. This will open your user `mcp.json` file where you can add the server configuration.

**Method 2: Workspace Configuration**

Alternatively, you can add the configuration to a file called `.vscode/mcp.json` in your workspace. This will allow you to share the configuration with others.

> For more details about MCP configuration in VS Code, see the [official VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/mcp).

For NPX installation:
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

For Docker installation:
```json
{
  "servers": {
    "vreme": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "vreme/temporal-mcp"]
    }
  }
}
```

### Usage with Continue

Add to your Continue configuration following their MCP setup guide.

### Usage with Cline

Add to your Cline configuration following their MCP setup guide.

## Available Tools

### get_temporal_context
**🧠 NEW in v1.5.5:** Provides Claude with real-time temporal awareness and activity tracking. This tool gives Claude continuous temporal context including current time, date, timezone, time of day, and global activity history. **Claude may call this automatically to maintain temporal awareness throughout conversations.** No parameters required.

**What it provides:**
- Current datetime (ISO 8601) and timezone
- Day of week and time of day (morning/afternoon/evening/night)
- Human-readable date and time strings
- Last global activity timestamp
- Days since last activity
- Context switch detection (gaps > 1 hour)
- Cognitive state indicators (late night, early morning, boundary detection)

**Inputs:**
- None required - automatically provides full temporal context

**Use case:** Enables Claude to stay temporally grounded and understand when interactions are happening, how much time has passed, and detect context switches between conversations.

### get_current_time
**⏰ NEW in v1.5.4:** Get the current time in the user's system timezone. **USE THIS TOOL when user asks "What time is it?", "What's the time?", "Current time?", or any variation asking for the current time.** No parameters required - automatically detects and uses the user's system timezone. Returns current date, time, timezone, day of week, and time of day (morning/afternoon/evening/night).

**Inputs:**
- None required - automatically uses system timezone

**Example queries:**
- "What time is it?"
- "What's the time?"
- "Current time?"
- "What time is it now?"

**Why this tool exists:** Explicitly designed for simple "what time is it?" queries. Claude should call this immediately without asking for location/timezone clarification.

### query_time
Query temporal information using natural language. Returns comprehensive temporal context including:
- Current time and timezone
- 30 cultural calendars covering 5+ billion people worldwide
- Astronomical events (sunrise, sunset, moon phases)
- Religious fasting status and work restrictions
- Activity appropriateness for calls, meetings, work
- 300+ religious and cultural observances

**Inputs:**
- `query` (string, required): Natural language temporal query
- `user_timezone` (string, optional): Your timezone for relative time calculations

**Example queries:**
- "What time is it in Tokyo?"
- "Is it Shabbat in Jerusalem?"
- "Is it Ramadan?"
- "When is sunrise in Paris?"
- "What's the Chinese New Year date?"
- "When is Stefanovden?" (Bulgarian Orthodox saint's day)
- "When is Vaisakhi 2025?" (Sikh New Year)
- "What is the Coptic date today?"
- "When is Songkran?" (Thai New Year)

### query_prayer_times
Get Islamic prayer times (Salah/Namaz) for any location. Returns all 5 daily prayers, next prayer time, and Qibla direction to Mecca.

**Inputs:**
- `location` (string, required): Location name
- `prayer` (string, optional): Specific prayer to query ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')

**Example queries:**
- "What are prayer times in Dubai?"
- "When is Fajr in Istanbul?"
- "Prayer times in New York"

### check_activity_appropriateness
Check if the current time is appropriate for specific activities (calls, work, meetings) in a given location. Takes into account:
- Time of day (business hours, sleeping hours)
- Cultural/religious observances across 30 calendar systems
- Shabbat, Ramadan fasting, religious holidays from 10+ religions
- Work restrictions and local customs
- 300+ total observances worldwide

**Inputs:**
- `location` (string, required): Location name
- `activity` (string, optional): Type of activity ('call', 'work', 'meeting')
- `user_timezone` (string, optional): Your timezone for relative time calculations

**Example queries:**
- "Can I call someone in Tokyo right now?"
- "Is it appropriate for work in Jerusalem?"
- "Is it a good time for a meeting in Berlin?"

### analyze_temporal_context
Perform deep temporal analysis on any date. Returns comprehensive context including all 30 calendar representations, cultural observances, astronomical data, business context, seasonal information, and temporal density score (0-100).

**Inputs:**
- `date` (string, required): ISO 8601 date string (e.g., '2024-12-25T00:00:00')
- `location` (string, optional): Location for astronomical/timezone context
- `include_fields` (array, optional): Fields to include (calendars, observances, astronomical, business, seasonal, density)

**Use cases:**
- Analyze cultural significance of any date
- Plan global events accounting for all calendars
- Understand temporal context for historical dates
- Research religious and cultural observances

### compare_dates
Compare two dates and analyze their temporal significance. Returns time difference, observances on each date, shared observances, temporal density scores, and which date is more culturally significant.

**Inputs:**
- `date1` (string, required): First ISO 8601 date string
- `date2` (string, required): Second ISO 8601 date string
- `location` (string, optional): Optional location context

**Use cases:**
- Compare significance of different dates
- Understand cultural context differences
- Plan events by choosing more/less significant dates

### calculate_business_time
Calculate business time accounting for country-specific weekends and holidays. Supports adding business days, counting business days/hours between dates, and checking working days.

**Inputs:**
- `operation` (enum, required): 'add_days', 'days_between', 'hours_between', 'is_working_day'
- `start_date` (string, required): Start date (ISO 8601)
- `end_date` (string, optional): End date (required for days_between, hours_between)
- `business_days` (number, optional): Number of days to add (required for add_days)
- `country_code` (string, optional): ISO 3166-1 alpha-2 country code (default: 'US')
- `work_hours` (array, optional): Work hours [start, end] for hours_between (default: [9, 17])

**Use cases:**
- Calculate project deadlines in business days
- Find common business days across countries for international meetings
- Account for different weekend patterns (Fri-Sat in Middle East, etc.)
- Plan deliveries accounting for holidays

### list_holiday_countries
**🌍 NEW in v1.5.0:** Discover which countries have holiday data. Returns all 247+ supported countries with their codes and names.

**Inputs:**
- None required

**Use cases:**
- Discover which countries are supported
- Get country codes for other holiday tools
- Explore global coverage

### get_country_holidays
**📅 NEW in v1.5.0:** Get ALL holidays for a country in a specific year. Returns complete list with **category filtering** support.

**Inputs:**
- `country_code` (string, required): ISO 3166-1 alpha-2 country code (US, GB, JP, CN, IN, DE, FR, etc.)
- `year` (number, required): Year (e.g., 2024, 2025)
- `categories` (string, optional): Comma-separated categories to filter (e.g., 'public' for govt closures only, 'public,bank' for govt+bank holidays). If omitted, returns ALL categories.

**Categories:**
- **PUBLIC** - Government office closures (official days off)
- **BANK** - Banking holidays
- **SCHOOL** - School holidays
- **OPTIONAL** - Optional/regional holidays
- **GOVERNMENT** - Government employee holidays

**Use cases:**
- Get only government closure days: `categories='public'`
- Get all holidays including observances: omit `categories` parameter
- Plan annual schedules
- Understand local holiday patterns

### check_holiday
**✅ NEW in v1.5.0:** Check if a SPECIFIC date is a PUBLIC holiday (govt closure) in ONE country. Ultra-fast (<10ms) Yes/No answer.

**Inputs:**
- `country_code` (string, required): ISO 3166-1 alpha-2 country code (US, GB, JP, etc.)
- `date` (string, required): Date in YYYY-MM-DD format (e.g., '2024-12-25')

**Returns:** Holiday name if it's a PUBLIC holiday, or null if not.

**Use cases:**
- Quick holiday lookup for scheduling
- "Is tomorrow a holiday in Germany?"
- Event planning
- Checks PUBLIC category only (government closures)

### list_financial_markets_holidays
**🏦 NEW in v1.5.0:** Discover which financial markets have trading holiday calendars. Returns all 5 supported markets.

**Inputs:**
- None required

**Returns:** XNYS (NYSE), XNSE (NSE India), BVMF (Brazil B3), XECB (ECB TARGET2), IFEU (ICE Futures Europe)

**Use cases:**
- Discover which markets are supported
- Get market codes for trading holiday queries
- Explore financial market coverage

### get_market_holidays
**📈 NEW in v1.5.0:** Get trading holidays when a financial market is CLOSED. Know when stock exchanges don't trade.

**Inputs:**
- `market_code` (string, required): XNYS (NYSE), XNSE (NSE India), BVMF (Brazil), XECB (ECB), IFEU (ICE Futures)
- `year` (number, required): Year (e.g., 2024, 2025)

**Use cases:**
- "When is NYSE closed in 2024?"
- "What are NSE India trading holidays?"
- "Is the market open on this date?"
- Trading strategy planning
- Financial calendar integration

### check_business_day
**💼 NEW in v1.5.0:** Check if a date is a BUSINESS day (not PUBLIC holiday AND not weekend). Focus on work/no-work status.

**Inputs:**
- `country_code` (string, required): ISO 3166-1 alpha-2 country code
- `date` (string, required): Date in YYYY-MM-DD format

**Use cases:**
- "Is tomorrow a working day?"
- "Are offices open on this date?"
- Business logic for scheduling
- Delivery date calculations
- Checks PUBLIC holidays only (government closures)

### resolve_relative_date
**📅 NEW in v1.5.3:** Convert relative date expressions to actual dates. Uses simple, documented rules - no intent inference. Perfect for resolving ambiguous expressions like "next Monday" or "in 3 days".

**Inputs:**
- `expression` (string, required): Relative date expression
  - Basic: "today", "tomorrow", "yesterday"
  - Weekdays: "next Monday", "last Friday" (any weekday)
  - Offsets: "in 3 days", "5 days ago"
  - Weeks: "next week", "last week"
- `reference_datetime` (string, optional): Reference datetime (ISO 8601). Defaults to now.
- `use_elastic_tomorrow` (boolean, optional): Enable "Elastic Tomorrow" for night coders (default: false)
- `elastic_threshold_hour` (number, optional): Elastic boundary hour (default: 6 AM)

**Rules:**
- "next Monday" on Monday = next week's Monday (minimum 1 day)
- "last Friday" on Friday = last week's Friday (minimum 1 day)
- "Elastic Tomorrow": If reference time is before threshold (default 6 AM), "tomorrow" = today's calendar date (the day after you sleep)

**Use cases:**
- Resolve "next Monday" to actual date
- Convert "in 5 days" to specific date
- Handle "Elastic Tomorrow" for developers coding late at night
- Parse relative expressions with clear, documented rules

**Example queries:**
- "What date is next Monday?"
- "When is 3 days from now?"
- "Resolve 'last Friday' to a date"

## Example Usage

**Query:** "What time is it in Tokyo?"

**Response:**
```
## Sunday, November 30, 2025 at 1:36 PM JST

### Context

**Location:** Asia/Tokyo
**Time:** Sunday, November 30, 2025 at 1:36 PM JST

### Astronomical Information

**Sunrise:** 6:31 AM
**Sunset:** 4:28 PM
**Day length:** 9h 57m
**Moon:** Full Moon (70% illuminated)

### Cultural Calendars

**Hebrew Calendar:** 10 Kislev 5786
**Islamic Calendar:** 9 Jumada al-Thani 1447 AH
**Chinese Calendar:** Year 2025, Month 10, Day 11 (Metal Snake)

### Activity Appropriateness

**Time of day:** afternoon
**Appropriate for calls:** Yes
**Appropriate for work:** No
**Appropriate for meetings:** No
**Considerations:** Weekend

---

*Response generated in 87.43ms*
```

**Query:** "What are prayer times in Dubai?"

**Response:**
```
## Prayer times for Dubai

### Context

**Location:** Asia/Dubai
**Time:** Sunday, November 30, 2025 at 10:36 AM GST

### Prayer Times

**Method:** MWL (Muslim World League)

| Prayer | Time |
|--------|------|
| Fajr | 5:12 AM |
| Sunrise | 6:33 AM |
| Dhuhr | 12:07 PM |
| Asr | 3:18 PM |
| Maghrib | 5:41 PM |
| Isha | 7:11 PM |

**Next Prayer:** Dhuhr in 1 hour 31 minutes

**Qibla Direction:** 258.9° (West-Southwest from Dubai to Mecca)

---

*Response generated in 92.15ms*
```

**Query:** "Can I call someone in Jerusalem right now?"

**Response:**
```
## It's Saturday evening in Jerusalem - inappropriate for calls

### Context

**Location:** Asia/Jerusalem
**Time:** Saturday, November 30, 2025 at 2:36 AM IST

### Activity Appropriateness

**Time of day:** late_night
**Appropriate for calls:** No
**Appropriate for work:** No
**Appropriate for meetings:** No
**Considerations:** Very late night (2:36 AM), Weekend, Shabbat ends at 5:18 PM

**Work Restrictions:**
- Jewish: Shabbat
  Work prohibited on the Jewish Sabbath (Friday sunset to Saturday sunset)

---

*Response generated in 78.92ms*
```

## Architecture

```
AI Client (Claude Desktop / VS Code / Continue / Cline)
    ↓ (MCP Protocol)
@vreme/temporal-mcp
    ↓ (HTTPS)
api.vreme.ai
    ↓
Temporal Intelligence Engine
```

## Building

### Docker

```bash
docker build -t vreme/temporal-mcp .
```

### Local Development

```bash
npm install
npm run build
npm link
```

## Debugging

Running `tail -n 20 -f ~/Library/Logs/Claude/mcp*.log` will show the logs from the server and may help you debug any issues.

## API

This MCP server is powered by the public [Vreme Time API](https://api.vreme.ai).

**Endpoint:** `https://api.vreme.ai/query`

You can also use the API directly:

```bash
curl -X POST https://api.vreme.ai/query \
  -H "Content-Type": "application/json" \
  -d '{"query": "What time is it in Tokyo?"}'
```

## Links

- **Website:** [vreme.ai](https://vreme.ai)
- **API Documentation:** [api.vreme.ai/docs](https://api.vreme.ai/docs)
- **GitHub:** [github.com/vreme-ai/temporal-mcp](https://github.com/vreme-ai/temporal-mcp)
- **npm:** [@vreme/temporal-mcp](https://www.npmjs.com/package/@vreme/temporal-mcp)
- **Docker Hub:** [vreme/temporal-mcp](https://hub.docker.com/r/vreme/temporal-mcp)

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

## About Vreme

Vreme (Bulgarian: "time") is building temporal intelligence for AI systems.

**Mission:** Make AI temporally aware - understanding time, culture, and context across the globe.

---

Built with ❤️ for temporal awareness