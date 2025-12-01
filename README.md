<p align="center">
  <a href="https://vreme.ai">
    <img src="https://www.gravatar.com/avatar/ff544f8e090d77cb8655b6762f80492c?s=200&d=identicon" alt="Vreme Logo" width="200"/>
  </a>
</p>

# Vreme Temporal MCP Server

MCP server providing temporal intelligence - timezone conversions, cultural calendars, astronomical events, prayer times, and time-sensitive context.

## Features

### Temporal Intelligence
- **Natural language queries** - "What time is it in Tokyo?", "Is it Ramadan?", "Can I call Berlin now?"
- **200+ timezones** - Complete pytz timezone database with DST handling
- **Astronomical events** - Sunrise, sunset, moon phases, twilight times
- **Activity appropriateness** - Smart recommendations for calls, meetings, work based on time and culture

### Cultural Calendars (9 Systems)
- **Hebrew** - Shabbat detection, holiday observances, work restrictions
- **Islamic** - Ramadan fasting, prayer times, holiday detection
- **Chinese** - Lunisolar calendar, zodiac animals, elements
- **Hindu** - Festival dates and observances
- **Persian** - Nowruz and Persian calendar
- **Buddhist** - Vesak and Buddhist observances
- **Bahá'í** - Bahá'í calendar system
- **Ethiopian** - Ethiopian calendar
- **Mayan** - Long count calendar

### Islamic Prayer Times
- **All 5 daily prayers** - Fajr, Dhuhr, Asr, Maghrib, Isha
- **7 calculation methods** - MWL, ISNA, Egypt, Makkah, Karachi, Tehran, Jafari
- **Qibla direction** - Direction to Mecca from any location
- **Next prayer countdown** - Time until next prayer

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

### query_time
Query temporal information using natural language. Returns comprehensive temporal context including:
- Current time and timezone
- 9 cultural calendars (Hebrew, Islamic, Chinese, Hindu, Persian, Buddhist, Bahá'í, Ethiopian, Mayan)
- Astronomical events (sunrise, sunset, moon phases)
- Religious fasting status and work restrictions
- Activity appropriateness for calls, meetings, work

**Inputs:**
- `query` (string, required): Natural language temporal query
- `user_timezone` (string, optional): Your timezone for relative time calculations

**Example queries:**
- "What time is it in Tokyo?"
- "Is it Shabbat in Jerusalem?"
- "Is it Ramadan?"
- "When is sunrise in Paris?"
- "What's the Chinese New Year date?"

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
- Cultural/religious observances across 9 calendar systems
- Shabbat, Ramadan fasting, religious holidays
- Work restrictions and local customs

**Inputs:**
- `location` (string, required): Location name
- `activity` (string, optional): Type of activity ('call', 'work', 'meeting')
- `user_timezone` (string, optional): Your timezone for relative time calculations

**Example queries:**
- "Can I call someone in Tokyo right now?"
- "Is it appropriate for work in Jerusalem?"
- "Is it a good time for a meeting in Berlin?"

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