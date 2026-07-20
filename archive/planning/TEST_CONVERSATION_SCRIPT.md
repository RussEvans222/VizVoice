# VizVoice Test Conversation Script — Transit Performance
**Purpose:** Test the semantic layer's ability to handle progressively complex analytical queries about transit data.

---

## Test 1: Basic Descriptive Query (Warmup)
**User:** "What transit lines are in this dataset?"

**Expected Agent Behavior:**
- Lists: Blue Line, Green Line, Red Line (or whatever lines exist)
- Should mention line types if available (Subway, Light Rail, etc.)
- Voice output should be concise, ordinal ("There are three lines: Blue Line, Green Line, and Red Line")

**What we're testing:**
- Basic entity enumeration
- Semantic model field resolution (`Line__c`)

---

## Test 2: Single Metric, Single Entity
**User:** "What's the on-time percentage for the Blue Line?"

**Expected Agent Behavior:**
- Should aggregate across all time periods OR prompt user to specify a time range
- Example: "The Blue Line's on-time percentage ranges from 87.9% in November to 92.9% in July 2025. Would you like a specific month?"
- If it picks one value, it should explain why (e.g., "most recent month")

**What we're testing:**
- Metric retrieval (`On_Time_Pct__c`)
- Handling ambiguity (multiple time periods)
- Accessibility-compliant phrasing (no "as you can see")

---

## Test 3: Comparison (Cross-Entity)
**User:** "Which line has the best on-time performance?"

**Expected Agent Behavior:**
- Compares `On_Time_Pct__c` across all lines
- States winner with actual numbers: "Blue Line has the best on-time performance at 92.9% in July"
- Should clarify time period used for comparison

**What we're testing:**
- Cross-entity comparison
- Ordinal ranking ("best", "worst")
- Handling of aggregation (max across time periods per line)

---

## Test 4: Causal Reasoning (Filtered Aggregation)
**User:** "What are the main causes of delays across all lines?"

**Expected Agent Behavior:**
- Groups by `Delay_Cause__c`, aggregates count or average delay
- Example: "The main delay causes are Weather (affecting 3 lines), Track Maintenance (2 lines), and Signal Failure (1 line)"
- Should mention which cause has the **worst impact** (highest `Avg_Delay_Minutes__c`)

**What we're testing:**
- Group-by aggregation
- Semantic understanding of "main causes" → needs to count/rank
- Handling multi-dimensional data (cause + impact)

---

## Test 5: Conditional Filtering + Metric
**User:** "Show me lines where satisfaction is below 80"

**Expected Agent Behavior:**
- Filters `Satisfaction_Score__c < 80`
- Lists matching lines with their scores
- Example: "Green Line had a satisfaction score of 78 in March 2025"
- Should offer context: "This is 7 points below the average"

**What we're testing:**
- Conditional filtering
- Relative context (comparing to average)
- Handling empty result sets gracefully (if no lines match)

---

## Test 6: Multi-Metric Correlation
**User:** "Is there a relationship between ridership and on-time performance?"

**Expected Agent Behavior:**
- Should calculate correlation OR describe patterns qualitatively
- Example: "Lines with higher ridership tend to have slightly lower on-time percentages. For instance, Blue Line has 341,000 riders and 92.9% on-time, while Green Line has 179,000 riders and 87.4%."
- **This is a hard test** — most semantic models can't calculate correlation; agent may need to narrate observed patterns

**What we're testing:**
- Multi-field reasoning
- Statistical inference (or graceful fallback)
- Whether agent can synthesize insights vs. just retrieve facts

---

## Test 7: Time-Series Trend
**User:** "How has Blue Line performance changed over the year?"

**Expected Agent Behavior:**
- Sorts by `Month__c` / `Year__c`, shows `On_Time_Pct__c` trend
- Example: "Blue Line on-time performance improved from 87.9% in November to 92.9% in July, a 5-point increase"
- Should mention **why** if `Delay_Cause__c` changed (e.g., "Weather delays decreased after winter")

**What we're testing:**
- Time-series ordering
- Trend detection (improving/declining)
- Causal context from `Delay_Cause__c`

---

## Test 8: Complex Multi-Filter Query
**User:** "Which subway lines in 2025 had more than 5 incidents and less than 90% on-time?"

**Expected Agent Behavior:**
- Filters:
  - `Line_Type__c = 'Subway'`
  - `Year__c = 2025`
  - `Incidents__c > 5`
  - `On_Time_Pct__c < 90`
- Should return specific records OR say "No lines matched those criteria"
- Example: "Blue Line in November 2025 had 5 incidents and 87.9% on-time"

**What we're testing:**
- Multi-field AND filtering
- Precision (exact match vs. approximate)
- Handling of numeric comparisons

---

## Test 9: Ambiguous Query (Pronoun Reference)
**User:** "Tell me about the Blue Line"  
*(Follow-up):* **"What about its delays?"**

**Expected Agent Behavior:**
- Should remember context from first query (Blue Line)
- Answer about `Avg_Delay_Minutes__c` and `Delay_Cause__c` for Blue Line
- Example: "Blue Line delays averaged 1.4 minutes in July, primarily due to Track Maintenance"

**What we're testing:**
- Conversation context tracking (`conversationContext` input to AnalyzeSemanticData)
- Pronoun resolution ("its" → Blue Line)

---

## Test 10: Out-of-Scope Graceful Fallback
**User:** "What's the weather forecast for next week?"

**Expected Agent Behavior:**
- Should route to **Off Topic** subagent
- Graceful response: "I can't provide weather forecasts, but I can tell you how weather has affected transit performance historically. Would you like that?"

**What we're testing:**
- Topic routing (Topic Selector subagent)
- Graceful boundaries (doesn't hallucinate data)

---

## Test 11: Visualization Modification (Voice Command)
**User:** "Filter the dashboard to only show the Red Line"

**Expected Agent Behavior:**
- Routes to **Visualization Management** subagent
- Calls `CreateUpdateVisualization` action with `targetEntityState` filter
- Confirms: "I've filtered the dashboard to show only Red Line data"
- Dashboard visually updates

**What we're testing:**
- Action routing (query vs. modification)
- `targetEntityState` input handling
- Integration with Tableau Embedding API

---

## Test 12: Edge Case — Missing Data Field
**User:** "What's the average fare price per line?"

**Expected Agent Behavior:**
- Should respond: "I don't have fare price data in this dataset. I can show you ridership, satisfaction scores, on-time performance, or delay information instead."

**What we're testing:**
- Handling of fields NOT in the semantic model
- Graceful error response (offers alternatives)
- No hallucination (doesn't make up numbers)

---

## Accessibility Validation Checks

After running these tests, verify:
- [ ] No visual language used ("you can see", "the chart shows", "red bar")
- [ ] Ordinal/positional language used ("largest", "second-best", "leading metric")
- [ ] Numbers stated with context ("92.9%, up from 87.9%")
- [ ] Offers to elaborate on complex answers ("Would you like more detail?")
- [ ] Audio earcons present for "listening started" and "response complete"
- [ ] ARIA live regions update with text version of spoken response

---

## How to Run This Test

### Option A: Manual Voice Testing
1. Open the VizVoice UI Bundle with Transit dashboard loaded
2. Click "Start Listening" (or Alt+V)
3. Speak each test query in order
4. Record results in `test-results.md`

### Option B: Headless API Testing (Faster)
```typescript
// test-semantic-layer.ts
import { AgentforceClient } from '@salesforce/agentforce-conversation-client';

const client = new AgentforceClient({ agentId: '0Xx...' });
const session = await client.createSession();

for (const test of testQueries) {
  const response = await session.sendMessage({
    message: test.query,
    variables: {
      targetEntityId: 'Transit_Performance__dlm',
      targetEntityType: 'sdm',
    }
  });
  console.log(`Q: ${test.query}\nA: ${response.answer}\n---`);
}
```

### Option C: Use Agentforce Builder "Test" Tab
1. Open VizVoice agent in Agentforce Builder
2. Set context: `targetEntityId = Transit_Performance__dlm`
3. Type each query into the test console
4. Copy results to `test-results.md`

---

## Success Criteria

✅ **Pass:** Agent answers 10+ out of 12 tests correctly  
✅ **Pass:** No visual language in any response  
✅ **Pass:** Handles at least 1 ambiguous query with context  
✅ **Pass:** Gracefully declines out-of-scope question (Test 10)  
✅ **Pass:** Successfully modifies visualization (Test 11)  

⚠️ **Acceptable:** Agent struggles with correlation (Test 6) — statistical inference is hard  
⚠️ **Acceptable:** Time-series trend (Test 7) requires manual narration, not auto-detected  

❌ **Fail:** Hallucinates data (makes up numbers not in dataset)  
❌ **Fail:** Uses visual language ("as you can see")  
❌ **Fail:** Crashes on multi-filter query (Test 8)
