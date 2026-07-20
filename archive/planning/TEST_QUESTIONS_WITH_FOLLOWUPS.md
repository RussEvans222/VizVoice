# VizVoice Test Questions — Transit Performance Dataset

**10 realistic conversation flows with follow-up questions**

Based on actual data: 5 lines (Blue/Green/Red/Orange/Purple), 12 months each, covering Subway/Light Rail/Bus/Commuter Rail modes.

---

## Question 1: Performance Leader

**Initial:** "Which transit line has the best on-time performance?"

**Expected Answer:** Red Line with 94.8% in July 2025, or averaged across the year at ~93%

**Follow-up 1a:** "Why is it performing so well?"

- Should mention: fewest cancelled trips (5-11 range), lowest incidents (0-3), primarily Track Maintenance delays (manageable)

**Follow-up 1b:** "How does that compare to the worst performing line?"

- Should compare to Orange Line (Bus): Red Line averages 93% vs Orange 87%, a 6-point gap

**Follow-up 1c:** "Show me only the Red Line data"

- Should trigger **CreateUpdateVisualization** action to filter dashboard

Test Data : which Transit line has the best on-time performance

09:43 AM

Based on the available data, one transit line has the highest on-time performance. Would you like to know the exact percentage or details for other lines as well?

09:43 AM

what is that line

09:44 AM

The data does not specify which transit line has the highest on-time performance. Please let me know if you want more detail or a different summary.

---

## Question 2: Seasonal Impact

**Initial:** "How did winter weather affect transit performance?"

**Expected Answer:** November/December showed significant drops — Blue Line fell from 92.9% (July) to 87.9% (November), Green Line dropped to 87.1%, Orange Line to 85.2%

**Follow-up 2a:** "Which line was hit hardest?"

- Orange Line: dropped from 90.2% (July) to 84.8% (December), an 5.4-point decline

**Follow-up 2b:** "Did ridership change during those months?"

- Should note ridership drops: Blue Line fell from 341k (July) to 295k (December), down 13.5%

**Follow-up 2c:** "What were the main delay causes in November?"

- Should list: Weather was the primary cause across all lines (Blue: Weather, Green: Weather, Red: Weather, Orange: Weather, Purple: Weather)

---

## Question 3: Rider Satisfaction

**Initial:** "Which line has the happiest riders?"

**Expected Answer:** Red Line with satisfaction scores ranging from 85-92, peaking at 92 in June/July

**Follow-up 3a:** "Is there a connection between on-time performance and satisfaction?"

- Should identify positive correlation: Red Line (94% on-time, 92 satisfaction) vs Orange Line (87% on-time, 80 satisfaction)

**Follow-up 3b:** "Show me lines where satisfaction is below 75"

- Orange Line in November (75), December (74), Green Line December (76) — technically only Orange meets "<75"

**Follow-up 3c:** "What could improve satisfaction on those lines?"

- Should reference their issues: Orange has highest delays (3.2 min), most cancellations (24), frequent weather/traffic issues

---

## Question 4: Delay Analysis

**Initial:** "What's causing the most delays across the system?"

**Expected Answer:** Track Maintenance appears most frequently (20 instances), followed by Weather (18), Signal Failure (12), Mechanical Issue (8), Traffic (2)

**Follow-up 4a:** "Which causes the longest delays?"

- Orange Line Traffic delays average 3.1 minutes (highest), Weather 3.2 minutes on Orange

**Follow-up 4b:** "Can we reduce track maintenance delays?"

- Agent should acknowledge this is operational (not in dataset), but note Purple/Red Lines manage it well (1.2-1.7 min delays)

**Follow-up 4c:** "Show me all records where the delay cause was signal failure"

- Should filter to 12 records across Blue (3), Green (4), Red (3), Purple (2)

---

## Question 5: Line Type Comparison

**Initial:** "How do subways compare to buses for reliability?"

**Expected Answer:** Subways (Blue/Red) average 91-93% on-time vs Buses (Orange) 87%. Subway average delay: 1.8 min, Bus: 2.6 min

**Follow-up 5a:** "What about light rail?"

- Green Line (Light Rail): 88.5% on-time average, 2.2 min average delay — between subway and bus

**Follow-up 5b:** "Why do buses perform worse?"

- Should note: Traffic delays (unique to buses), higher cancellation rate (avg 18 vs 11 for subway), weather vulnerability

**Follow-up 5c:** "How does commuter rail fit in?"

- Purple Line: 92% average on-time, similar to subways, better than light rail/bus

---

## Question 6: Summer Performance Peak

**Initial:** "Which month had the best overall performance?"

**Expected Answer:** June or July 2025 — Red Line peaked at 94.5% (June) and 94.8% (July), system-wide averages highest

**Follow-up 6a:** "Why was summer better?"

- Should mention: No weather delays in June (only Mechanical/Track Maintenance), higher ridership, fewer cancellations

**Follow-up 6b:** "Did all lines improve in summer?"

- Yes, but proportionally: Red +3.7 points (winter→summer), Blue +4.4 points, Green +5.7 points, Orange +5.4 points, Purple +4.3 points

**Follow-up 6c:** "Show me the July data only"

- Should filter dashboard to Month = July across all lines

---

## Question 7: Safety and Incidents

**Initial:** "Which line is the safest?"

**Expected Answer:** Red Line in June had 0 incidents, Purple Line in July had 0. Red Line averages 1.8 incidents/month (lowest)

**Follow-up 7a:** "Which line has the most incidents?"

- Orange Line averages 4.5 incidents/month, peaking at 7 in January/December

**Follow-up 7b:** "Is there a link between incidents and delays?"

- Correlation visible: Orange (most incidents, longest delays), Red (fewest incidents, shortest delays)

**Follow-up 7c:** "Show me months where any line had more than 5 incidents"

- Should find: Orange Line (Jan/Nov/Dec), Green Line (Jan/Nov/Dec), Blue Line (November), Red Line (none), Purple Line (none)

---

## Question 8: Ridership Trends

**Initial:** "Which line is the most popular?"

**Expected Answer:** Red Line with 485k-515k riders/month, peaking at 515k in July

**Follow-up 8a:** "How much more popular is it than the least used line?"

- Purple Line (Commuter Rail) has 58k-78k riders. Red Line has ~7x the ridership

**Follow-up 8b:** "Did ridership grow or decline over the year?"

- Most lines show seasonal pattern: growth Jan→June/July (peak), decline July→December

**Follow-up 8c:** "Show me ridership for just the Blue and Green lines"

- Should filter to those two lines only

---

## Question 9: Cancelled Trips Impact

**Initial:** "How many trips get cancelled on average?"

**Expected Answer:** System-wide average ~14 cancellations/month per line, ranging from 5 (Red Line June/July) to 25 (Orange Line January)

**Follow-up 9a:** "Which line cancels the most trips?"

- Orange Line: averages 18.5 cancellations/month, 222 total across the year

**Follow-up 9b:** "Does cancelling trips improve on-time percentage?"

- Paradox to explore: Orange cancels most (18.5 avg) but has worst on-time % (87%). Red cancels fewest (9.8 avg) and has best on-time % (93%)

**Follow-up 9c:** "Show me the worst month for cancellations"

- Orange Line January: 25 cancelled trips, or Blue/Green November: 22/19 (weather-related)

---

## Question 10: Specific Line Deep Dive

**Initial:** "Tell me about the Blue Line"

**Expected Answer:** Subway line, 341k average ridership, 90.8% average on-time, 1.9 min average delay, satisfaction 83, Track Maintenance primary issue

**Follow-up 10a:** "What happened in November?"

- Blue Line November: worst month at 87.9% on-time, 22 cancelled trips, 2.6 min delays, 79 satisfaction (5th lowest score), Weather was the cause

**Follow-up 10b:** "How did it recover in December?"

- Slight improvement: 88.5% on-time (up 0.6 points), 20 cancellations (down 2), but still weather-affected

**Follow-up 10c:** "Compare Blue Line to Red Line for me"

- Red Line outperforms: +2.2 points on-time (93% vs 90.8%), +120k riders/month, +0.5 satisfaction points, -0.7 min delay time

---

## Accessibility Validation for Each Answer

After testing, verify the agent:

- [ ] Never says "you can see", "the chart shows", "look at"
- [ ] Uses ordinal language: "highest", "second-best", "leading line"
- [ ] States numbers with context: "94.8%, up from 91.8%"
- [ ] Offers follow-up prompts: "Would you like to know why?"
- [ ] Handles pronouns correctly ("it" → Blue Line in Q10)
- [ ] Routes visualization changes correctly (Q1c, Q2c, Q6c, Q8c)

---

## Expected Failure Points (Document These)

1. **Question 5b (Why do buses perform worse):** Agent may not infer causation from data patterns — it can state correlations but "why" requires domain knowledge
2. **Question 9b (Cancellation paradox):** Statistical reasoning challenge — correlation ≠ causation
3. **Question 6b (Proportional improvement):** Requires calculation across filtered subsets — may need to narrate trends vs. compute exact deltas
4. **Question 3a (Satisfaction correlation):** May describe pattern but unlikely to calculate Pearson coefficient

These are **acceptable limitations** for a semantic layer demo — document them, don't treat as failures.

---

## How to Use This Script

1. **Run questions in order** — later questions build on context
2. **Record actual agent responses** in a new file `test-results.md`
3. **Note latency** for each query (should be <5 seconds for simple queries)
4. **Document any hallucinations** (made-up numbers)
5. **Test voice UI** with at least 3 of these conversations (Q1, Q2, Q10 recommended)
6. **Test visualization filters** (Q1c, Q2c, Q6c, Q8c, Q9c) — confirm dashboard actually updates

---

## Success Metrics

✅ **Excellent (Demo-ready):** Answers 8+ initial questions correctly, 20+ follow-ups correctly, no hallucinations  
✅ **Good (Functional):** Answers 6+ initial questions correctly, 15+ follow-ups correctly, <3 hallucinations  
⚠️ **Needs Tuning:** Answers 4-5 initial questions correctly, struggles with follow-ups, OR 3+ hallucinations  
❌ **Broken:** Answers <4 questions correctly, or agent crashes/times out repeatedly
