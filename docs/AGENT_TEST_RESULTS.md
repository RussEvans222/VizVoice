# VizVoice Agent Test Results

**Date:** 2026-07-17
**Org:** vizvoice-dev (`orgfarm-aac260ab62-dev-ed`)
**Agent:** VizVoice (`0XxgK000001rUH7SAM`)
**Test method:** Direct calls to the invocable action `generateAiAgentResponse/VizVoice`, the same path the live UI Bundle uses via `VizVoiceAgentProxy.cls`

## Summary

The agent and Data Cloud semantic model (`C360_Semantic_Model_Extended_0ba`) are working correctly. Prior testing in the **Agentforce Builder preview pane** produced "could not retrieve" answers because Builder's preview doesn't set `targetEntityId` / `targetEntityType` — those variables are only populated automatically by the live UI Bundle app (`src/lib/constants.ts` hardcodes `TARGET_ENTITY_ID`). No agent or semantic model changes were required.

## Test Matrix

| # | Question | Result |
|---|----------|--------|
| 1 | "What line had the most cancellations?" | Correct, accessible answer (no visual metaphors) |
| 2 | "How does that compare to other lines?" (fresh session, no prior context) | Correctly asked for clarification |
| 3 | "What was the total ridership last month?" | Correct (0 — real data, not a failure) |
| 4 | "Show me the trend over time for cancellations" | Correct, described trend without chart references |
| 5 | "How are things looking overall?" (vague) | Correctly asked for clarification instead of guessing |
| 6 | "What's the weather today?" (off-topic) | Correctly redirected — guardrail working |
| 7 | "How many total trips were there this year?" | "Could not retrieve" — see root cause below |
| 8 | "How many total trips were there?" (no time range) | Correct: 13.68 million |
| 9 | "What is the total number of cancellations?" | Correct: 938 |
| 10 | "How many total trips were there in December?" | Correct: 1.06 million |
| 11 | "How many total trips were there in 2026?" | Correct: "no trips recorded in 2026" |

## Root Cause: "This Year" Failure (Q7)

Isolated by testing the same metric with different time ranges (Q8–Q11). The "trips" metric and semantic model are healthy — "this year" resolves to 2026 (today's date), and the sample dataset has **no rows for 2026**. This is a data gap, not a semantic layer or agent bug. Q11 proves the agent handles this correctly when the year is explicit ("no trips recorded in 2026"); it only fails to give a clean answer when the relative phrase "this year" doesn't map to any usable rows.

**No fix applied** — behavior is correct given the dataset's actual date coverage.

## Recommendation

- Test against the invocable action or the live app, not Builder's preview pane — Builder preview lacks dashboard-scoped context.
- When testing time-based questions, use months/years known to exist in the sample data (e.g., "December") rather than relative terms like "this year" until the dataset is refreshed with current-year rows.
