# Current VizVoice Transit Dataset — Question Guide

**Purpose**: This document explains what questions work well with the current transit dataset and what questions cannot be answered due to missing fields. Use this as a reference for testing and demonstrating VizVoice capabilities.

**Last Updated**: 2026-07-18  
**Data Source**: `C360_Semantic_Model_Extended_0ba` (Data Cloud semantic model)

---

## What Questions Work Well ✅

These questions can be answered accurately with the current dataset:

### Cancellations

**Total counts**:
- "How many canceled trips have there been?" → **938 total cancelled trips**
- "Tell me about cancelled trips" → Breakdown available

**By line**:
- "What line had the most cancellations?" → **Route 12 with 250 cancelled trips**
- "Which line had the fewest cancellations?" → **Red Line with 124 cancelled trips**

**By month**:
- "How many cancellations in December?" → Specific counts available
- "Break down cancelled trips by line for December" → **Route 12: 38, others available**

**Comparisons**:
- "Compare December to November cancellations" → **December: higher, specific numbers provided**

### Delays

**Delay causes**:
- "What was the reason for the most delays?" → **Weather (67.7 min average delay)**
- "How many delays were caused by traffic?" → **12 delays**
- "What lines had traffic delays?" → **Route 28 and Route 12 (6 delays each)**

**By line**:
- "Tell me about delays on specific lines" → Available for Blue Line, Route 12, Route 28

**Seasonal patterns**:
- "What caused delays on the Blue Line in December?" → **Weather was the only recorded cause**

### Line-Specific Analysis

**Performance by line**:
- "Tell me about the Blue Line" → Delay data, cancellation data available
- "How is Route 12 performing?" → Cancellations (250), delays, causes available

**Month filters work**:
- December
- November  
- February
- October
- September

### Follow-Up Questions

The agent handles these well after initial queries:
- "Tell me more about [previous topic]"
- "How does that compare to other lines?"
- "What about [different month]?"
- "Break that down by [dimension]"

---

## What Questions DON'T Work ❌

These questions **cannot be answered** due to missing data fields:

### Time-Based Limitations

**No date/timestamp field**:
- ❌ "What was the total ridership last month?"
- ❌ "How many cancellations happened this week?"
- ❌ "Show me a trend over time"
- ❌ "What's the ridership for Q3?"

**No day-of-week**:
- ❌ "Should I avoid traveling on Mondays?"
- ❌ "What day has the most delays?"
- ❌ "Are weekends better than weekdays?"

**No time-of-day**:
- ❌ "When is rush hour least crowded?"
- ❌ "What time should I leave to avoid delays?"
- ❌ "Are there delays during morning commute?"

### Duration & Timing

**No delay duration**:
- ❌ "How long was I delayed?"
- ❌ "What's the average delay time for traffic?"
- ❌ "Which delay cause takes longest to resolve?"

**No ETA or schedule**:
- ❌ "When does the next bus arrive?"
- ❌ "How long until the Red Line gets here?"
- ❌ "What's the Blue Line schedule?"

### Location & Geography

**No stop/station details**:
- ❌ "Are there delays near downtown?"
- ❌ "Which stops are affected?"
- ❌ "Where is the Blue Line delayed?"

**No transfer information**:
- ❌ "What lines connect at Market Street?"
- ❌ "How do I transfer from Route 12 to the Blue Line?"

### Real-Time & Forecasting

**No current status**:
- ❌ "Is the Blue Line running right now?"
- ❌ "Are there any active delays?"
- ❌ "What's the current wait time?"

**No forecast data**:
- ❌ "Will there be delays tomorrow?"
- ❌ "What's the weather forecast for my commute?"
- ❌ "Should I expect problems this afternoon?"

### Accessibility Features

**No accessibility metadata**:
- ❌ "Are the elevators working at Civic Center?"
- ❌ "Which stations have audio announcements?"
- ❌ "Is Route 12 wheelchair accessible?"
- ❌ "Where can I find tactile paving?"

### Alternative Routes & Recommendations

**No route planning**:
- ❌ "What's the best route from A to B?"
- ❌ "Give me an alternative to the Blue Line"
- ❌ "How should I get to Market Street?"

**No crowding data**:
- ❌ "Which route is least crowded right now?"
- ❌ "Is the 5 PM train usually packed?"

**No service alerts**:
- ❌ "Is there planned maintenance this weekend?"
- ❌ "Are there any service changes?"

---

## Data Schema (Inferred from Agent Responses)

### Available Fields

| Dimension | Values | Notes |
|-----------|--------|-------|
| **Lines/Routes** | Green Line, Red Line, Blue Line, Route 12, Route 28 | Mixed rail/bus naming |
| **Months** | December, November, February, October, September | No full date, just month names |
| **Delay Causes** | Weather, Traffic | Limited set of causes |
| **Metrics** | Cancellations (count), Delays (count), Ridership (partial), Satisfaction (exists) | Ridership missing date dimension |

### Missing Fields

Critical gaps for accessibility use cases:
- **Timestamp** — Full date/time not available (only month)
- **Day of week** — Monday, Tuesday, etc.
- **Time period** — Morning peak, afternoon, evening, etc.
- **Duration** — How long delays lasted
- **Location** — Stops, stations, segments
- **Accessibility** — Elevators, ramps, audio, tactile features
- **Real-time status** — Current conditions
- **Crowding** — Passenger load
- **Safety** — Lighting, security presence
- **Alternatives** — Route suggestions

---

## Data Semantics

### How the agent interprets queries:

**"Last month"**:
- Agent cannot determine which month is "last" because there's no date field
- Response: "I cannot provide total ridership for last month because the data does not include a date field"

**"Most" / "Least"**:
- Agent can rank by count (cancellations, delays)
- Works: "Route 12 had the most cancellations"

**"By line" / "By month"**:
- Agent can filter and group on these dimensions
- Works: "Break down cancelled trips by line"

**Time references**:
- Only month names work (December, November, etc.)
- No support for: "this week", "Q3", "today", "last 30 days"

---

## Testing Recommendations

### Good Test Questions

Use these to demonstrate working functionality:

1. "What line had the most cancellations?"
2. "Tell me about delays caused by weather"
3. "How many canceled trips were there in December?"
4. "Compare Route 12 to the Red Line for cancellations"
5. "What caused delays on the Blue Line?"
6. "Break down cancelled trips by line"

### Questions That Show Limitations

Use these to acknowledge data gaps honestly:

1. "What was the total ridership last month?" → Explains date field missing
2. "When is the next bus?" → Explains no real-time data
3. "Which route is least crowded?" → Explains no crowding data
4. "Are the elevators working?" → Explains no accessibility status

### Conversation Flow Examples

**Good flow** (stays within data scope):
```
User: "What line had the most cancellations?"
Agent: "Route 12 had the most cancellations with 250 trips."

User: "How does that compare to other lines?"
Agent: "Route 12 had 250 cancellations, the Red Line had 124. That's 126 more on Route 12."

User: "What about December specifically?"
Agent: "Route 12 had 38 cancelled trips in December."
```

**Limited flow** (hits data boundary):
```
User: "What line had the most cancellations?"
Agent: "Route 12 had the most cancellations with 250 trips."

User: "Why were they cancelled?"
Agent: "I don't have data about cancellation reasons. Would you like to know about delays and their causes instead?"
```

---

## For Hackathon Judges

**What to highlight**:
- The agent **honestly acknowledges** data limitations instead of hallucinating
- Responses are **accessibility-optimized** (no visual metaphors)
- The agent **guides users** toward questions that work

**What to explain**:
- This is a **proof-of-concept dataset** demonstrating voice-first accessibility
- The **proposed enhanced dataset** (see `DATASET_ACCESSIBILITY_PROPOSAL.md`) would enable much richer conversations
- Current data validates the **agent architecture and voice UI** work correctly

---

## Next Steps for Dataset Enhancement

See **`DATASET_ACCESSIBILITY_PROPOSAL.md`** for:
- Proposed schema additions (real-time status, accessibility features, crowding, safety)
- Sample questions the enhanced dataset would enable
- CSV templates for importing robust accessibility-focused transit data

---

## Changelog

- **2026-07-18**: Initial version documenting current dataset capabilities
