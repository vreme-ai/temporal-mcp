# Temporal Context Implementation

## Overview
The Vreme MCP server now provides temporal awareness to Claude through the `get_temporal_context` tool.

## Implementation: Option A (Tool-based)

### Why This Approach?
- ✅ **More reliable** - LLMs respond better to explicit tool descriptions than resource hints
- ✅ **Testable** - Can verify in logs when Claude calls it
- ✅ **Cross-client compatible** - Works in all MCP clients (Claude Desktop, VS Code, etc.)
- ✅ **Explicit control** - Clear instructions vs. hoping auto-injection works

### The Tool

**Name:** `get_temporal_context`

**Description Key Phrases:**
```
🧠 CALL BEFORE EVERY RESPONSE
Call this BEFORE EVERY response to the user
Time changes constantly - you need fresh temporal data for EACH interaction
This helps you stay temporally grounded
NO PARAMETERS REQUIRED
Call it silently without mentioning it to the user
```

**Key Change:** Updated from "START OF CONVERSATION" to "BEFORE EVERY RESPONSE" to ensure continuous temporal awareness throughout the entire conversation, not just at the beginning.

**What It Returns:**
```json
{
  "current_datetime": "2025-12-07T19:30:00.000Z",
  "timezone": "America/New_York",
  "day_of_week": "Saturday",
  "time_of_day": "evening",
  "date_string": "December 7, 2025",
  "time_string": "7:30 PM EST",
  "last_global_activity": "2025-12-07T16:04:32.482Z",
  "days_since_last_activity": 0.14,
  "context_switch_detected": false,
  "is_late_night": false,
  "is_early_morning": false,
  "cognitive_day_boundary": false
}
```

## Backup: Resource Still Available

The `vreme://temporal-context` resource is still registered (line 974) as a fallback if Claude Desktop or other clients add better resource auto-injection support in the future.

## Data Persistence

**File:** `~/.vreme/temporal-context.json`

**Updated by:**
- Every tool call (via `updateActivityTracking()`)
- Tracks activity history across all sessions
- Detects context switches (gaps > 1 hour)

**Sample Data:**
```json
{
  "last_global_activity": "2025-12-07T16:04:32.482Z",
  "last_timezone": "America/New_York",
  "activity_history": [...],
  "context_switches": []
}
```

## How to Verify It's Working

### Method 1: Check MCP Logs
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

Look for:
- Tool calls to `get_temporal_context`
- Activity tracking updates

### Method 2: Check Persistence File
```bash
cat ~/.vreme/temporal-context.json
```

Should update with each interaction.

### Method 3: Continuous Usage
Claude should call `get_temporal_context` before EVERY response throughout the conversation to maintain continuous temporal awareness (if the description works as intended).

## Why This Works Better Than Resources

### Tool Approach (Implemented):
1. **Explicit instructions** in description → High compliance
2. **Observable behavior** → Can debug
3. **Universal support** → All MCP clients support tools

### Resource Approach (Backup):
1. **Implicit hints** (`audience: ["assistant"]`, `priority: 1.0`) → Variable compliance
2. **Client-dependent** → Not all clients auto-inject resources
3. **Harder to debug** → Can't see when/if it's used

## Version History

- **v1.5.5** - Added `get_temporal_context` tool with AUTO-CALL instructions
- **v1.5.4** - Added `get_current_time` tool
- **v1.5.1** - Added date validation tools
- **v1.5.0** - Added holiday database with 247+ countries

## Next Steps for Testing

1. **Publish to npm** (if not already done)
2. **Restart Claude Desktop** to pick up changes
3. **Start a NEW conversation** and observe if Claude calls the tool
4. **Check logs** to verify the tool is being called
5. **Check `~/.vreme/temporal-context.json`** to see activity tracking

## Files Modified

- `src/index.ts` - Added `get_temporal_context` tool (line 242)
- `src/temporal-context.ts` - Interfaces for temporal data
- `src/temporal-context-manager.ts` - File persistence logic
- `src/temporal-context-generator.ts` - Context generation logic

---

**Built:** December 7, 2025
**Version:** 1.5.5
**Approach:** Tool-based (Option A)
