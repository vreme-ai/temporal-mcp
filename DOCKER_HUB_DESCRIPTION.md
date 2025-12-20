# Vreme Temporal MCP Server

**Version 1.9.2** - Duration & Period Intelligence

## Overview

MCP server providing comprehensive temporal intelligence for AI assistants. **53 specialized tools** for timezone conversions, 32 cultural calendars, astronomical events, prayer times, 247+ country holiday data, 5 financial markets, business time calculations, astrology, observance tracking, and **NEW: duration & period calculations**.

## What's New in v1.9.2

**5 NEW Tools - Duration & Period Intelligence:**
- `calculate_duration` - Structured duration between timestamps
- `calculate_period` - Weeks, months, quarters, years between dates
- `age_from_birthdate` - Age calculation as structured data
- `time_until` - Time until future timestamp
- `time_since` - Time since past timestamp

All tools return structured JSON data only (no formatted strings), following Vreme's data-first philosophy.

## Features

### 53 Specialized Tools Organized into 8 Categories

- **Core Temporal Tools** (7) - Time queries, prayer times, activity appropriateness
- **Holiday & Business Time** (10) - 247+ countries, business day calculations
- **Advanced Temporal Processing** (18) - Time arithmetic, phrase resolution, conflict checking, duration calculations
- **Calendar & Recurrence** (4) - Multi-calendar alignment, RRULE expansion
- **Fuzzy Time** (3) - Uncertain time representations
- **Astronomical** (7) - Sunrise/sunset, zodiac, moon phases
- **Observances & Cultural** (3) - Awareness days, tech holidays, commemorations
- **Duration & Period** (5) - Duration calculations, period analysis, age calculations

### Global Coverage

- **200+ timezones** with DST handling
- **32 cultural calendars** covering 5+ billion people (Hebrew, Islamic, Chinese, Hindu, Persian, Buddhist, Coptic, Sikh, Orthodox, and more)
- **247+ countries** holiday database with category filtering (PUBLIC/BANK/SCHOOL/OPTIONAL)
- **5 financial markets** trading holidays (NYSE, NSE India, Brazil B3, ECB TARGET2, ICE Futures Europe)
- **Islamic prayer times** with Qibla direction
- **Astronomical calculations** (sunrise, sunset, moon phases, zodiac)
- **Astrology** (Western zodiac, Chinese zodiac, planet positions, aspects, sun ingresses)

## Quick Start

### Pull the Image

```bash
docker pull vreme/temporal-mcp
```

### Run the Server

```bash
docker run --rm -i vreme/temporal-mcp
```

### Configure with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

### Configure with VS Code

Install the MCP extension and add:

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

## Compatible Clients

Works with any Model Context Protocol compatible client:
- Claude Desktop
- VS Code
- Cursor
- Continue
- Cline
- Aider
- LM Studio
- Jan
- Open WebUI
- And more...

## Architecture

- **Stateless:** No database, pure computation. Every request is independent.
- **Fast:** Sub-100ms response times for most queries.
- **Scalable:** Horizontal scaling with no shared state.
- **Privacy-first:** All data stored locally in `~/.vreme/` (no backend storage).

## Documentation

- **Website:** https://www.vreme.ai
- **Documentation:** https://www.vreme.ai/docs
- **GitHub:** https://github.com/vreme-ai/temporal-mcp
- **NPM Package:** https://www.npmjs.com/package/@vreme/temporal-mcp

## Example Queries

- "What time is it in Tokyo?"
- "When is Ramadan this year?"
- "Is it a good time to call Berlin?"
- "Calculate the duration between two timestamps"
- "What's my age in years, months, and days?"
- "How long until December 25th?"

## License

MIT License - Open source and free forever.

## Support

- **Issues:** https://github.com/vreme-ai/temporal-mcp/issues
- **Website:** https://www.vreme.ai

---

**Tags:** `latest`, `1.9.2`, `1.9`, `1`

