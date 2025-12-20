<p align="center">
  <a href="https://vreme.ai">
    <img src="https://www.gravatar.com/avatar/ff544f8e090d77cb8655b6762f80492c?s=200&d=identicon" alt="Vreme Logo" width="200"/>
  </a>
</p>

# Vreme Temporal MCP Server

**v1.9.1**

MCP server providing comprehensive temporal intelligence including timezone conversions, 32 cultural calendars, astronomical events, prayer times, 247+ country holiday data, 5 financial markets, business time calculations, astrology, and observance tracking.

[![npm version](https://img.shields.io/npm/v/@vreme/temporal-mcp.svg)](https://www.npmjs.com/package/@vreme/temporal-mcp)
[![Docker Image](https://img.shields.io/docker/v/vreme/temporal-mcp?label=docker)](https://hub.docker.com/r/vreme/temporal-mcp)

## Overview

Vreme Temporal MCP Server provides 48 specialized tools for temporal intelligence, organized into 7 categories:

- **Core Temporal Tools** (7) - Time queries, prayer times, activity appropriateness
- **Holiday & Business Time** (10) - 247+ countries, business day calculations
- **Advanced Temporal Processing** (13) - Time arithmetic, phrase resolution, conflict checking
- **Calendar & Recurrence** (4) - Multi-calendar alignment, RRULE expansion
- **Fuzzy Time** (3) - Uncertain time representations
- **Astronomical** (7) - Sunrise/sunset, zodiac, moon phases
- **Observances & Cultural** (3) - Awareness days, tech holidays, commemorations

[Complete Tools Reference](MCP_TOOLS_REFERENCE.md)

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
