# Changelog

All notable changes to the Vreme Temporal MCP Server are documented here.

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
- 31 cultural calendars (Hebrew, Islamic, Chinese, Hindu, Persian, Buddhist, etc.)
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
