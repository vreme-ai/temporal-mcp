# Activity Tracking Implementation - How It Works

## The Core Use Case

**Scenario:** Stefan works until 3 AM with short stops since 10 PM

- Stefan: "Let's finish this tomorrow"
- 🤔 **Problem:** "Tomorrow" technically means Dec 8 (current calendar date)
- 💡 **Reality:** Stefan means "after I wake up" (even though it's the same calendar date)

**How Vreme Solves This:**

1. **Activity Tracking** - Stefan stops activity for 3+ hours
2. **Sleep Detection** - Vreme infers Stefan went to bed
3. **Context Switch** - When Stefan returns, Vreme knows there was a cognitive boundary
4. **"Tomorrow" Intelligence** - Claude understands "tomorrow" = after the sleep cycle, not the calendar date

## Implementation Details

### Global Cross-Session Tracking

**Storage:** `~/.vreme/temporal-context.json`

```json
{
  "last_global_activity": "2025-12-08T03:15:42.123Z",
  "last_timezone": "America/New_York",
  "activity_history": [
    {
      "timestamp": "2025-12-08T03:15:42.123Z",
      "session_id": "claude-desktop-session-xyz",
      "project": "vreme-mcp",
      "interaction_count": 47
    }
  ],
  "context_switches": [
    {
      "timestamp": "2025-12-08T09:30:12.456Z",
      "gap_hours": 6.2,
      "from_project": "vreme-mcp",
      "to_project": "vreme-mcp"
    }
  ]
}
```

### Detection Thresholds

- **Context Switch:** Gap > 1 hour between activities
- **Sleep Inference:** Gap > 3 hours (typical sleep duration)
- **Cognitive Boundary:** Late night (11pm-6am) + long gap

### Cross-Client Support

**Key Point:** We don't care which MCP client the activity happens in.

All activity tracked globally:
- Claude Desktop session at 2am ✅
- Continue session at 2:30am ✅
- Cline session at 3am ✅
- **All tracked in same `~/.vreme/temporal-context.json`**

When Stefan returns at 9am in ANY client → Vreme knows:
- Last activity: 3:15 AM
- Gap: 6.2 hours
- Context switch detected: YES
- Likely sleep occurred: YES
- "Tomorrow" now means: CURRENT time (after wake)

## Tools That Use This Data

### `get_temporal_context`

Returns:
```json
{
  "current_datetime": "2025-12-08T09:30:12.456Z",
  "timezone": "America/New_York",
  "time_of_day": "morning",
  "last_global_activity": "2025-12-08T03:15:42.123Z",
  "days_since_last_activity": 0.26,
  "context_switch_detected": true,
  "is_late_night": false,
  "is_early_morning": true,
  "cognitive_day_boundary": false
}
```

Claude can now understand:
- "Last time we talked was 6 hours ago at 3am"
- "User likely slept since then"
- "When they said 'tomorrow', they meant after waking"
- "This is a new cognitive session"

### `get_current_time`

Returns:
```json
{
  "current_time": "9:30 AM EST",
  "timezone": "America/New_York",
  "date": "Sunday, December 8, 2025",
  "iso_datetime": "2025-12-08T09:30:12.456Z",
  "day_of_week": "Sunday",
  "time_of_day": "morning"
}
```

**Never again will an LLM not know what time it is for the user.**

## Marketing Message

### The Problem We Solve

❌ **Before Vreme:**
- User: "Let's finish tomorrow" (at 3am)
- Claude: "Okay! December 8th" (wrong - it's already Dec 8)
- User: "No, I mean after I sleep!"
- Claude: 🤷

✅ **With Vreme:**
- User: "Let's finish tomorrow" (at 3am)
- *User sleeps 6 hours*
- *User returns at 9am*
- Claude: "Ready to finish that task now!" (correct - understands the sleep boundary)

### Key Features

1. **Cross-session activity tracking** - Doesn't matter which MCP client
2. **Sleep/wake cycle detection** - Gaps > 3 hours + late night = likely sleep
3. **Context switch awareness** - Gaps > 1 hour = new cognitive session
4. **Cognitive boundaries** - Late night, early morning, time of day
5. **"Tomorrow" intelligence** - Understands relative time from user's perspective

## Technical Architecture

```
┌─────────────────────────────────────────┐
│  Any MCP Client                         │
│  (Claude Desktop, Continue, Cline)      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Vreme MCP Server                       │
│  - get_current_time                     │
│  - get_temporal_context                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  ~/.vreme/temporal-context.json         │
│  - Global activity timestamps           │
│  - Context switches                     │
│  - Cross-client tracking                │
└─────────────────────────────────────────┘
```

## Why This Matters

Humans don't think in absolute calendar dates. We think in cognitive boundaries:
- "Tomorrow" = after I sleep
- "Later" = after this context switch
- "Today" = my current waking period

Vreme gives Claude the same temporal awareness humans have.

No more confusion about "tomorrow" at 3am. 🌙→☀️
