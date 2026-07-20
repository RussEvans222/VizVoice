# VizVoice Agent Test Questions — DC Accessible Tourism

**Semantic Model:** `New_Semantic_Model_0ba`  
**Architecture:** Relational model with Hotels + Restaurants tables joined on `Venue_ID`  
**Purpose:** Test these questions in Agentforce Builder to verify agent NLU and cross-table query capabilities

---

## How to Test

1. **Navigate to:** Agentforce Builder → VizVoice agent → **Test** tab
2. **Set context variables:**
   ```json
   {
     "targetEntityId": "New_Semantic_Model_0ba",
     "targetEntityType": "sdm",
     "analyticsTabId": "<DASHBOARD_ID_OPTIONAL>"
   }
   ```
3. **Copy-paste each question below** into the test interface
4. **Verify:** Agent returns accurate numbers, uses ordinal language (no visual metaphors), provides context with data

---

## CATEGORY 1: Hotel-Only Queries (Single Table)

### Q1: Basic Retrieval
**Question:** "Which hotels have braille signage?"

**Expected Answer:** List of hotel names where `Has_Braille_Signage = TRUE`. Should mention approximately 4-6 hotels (40% adoption in 2024).

**Validation:**
- Agent lists specific hotel names (The Watergate Hotel, Hotel Zena, etc.)
- Does NOT use visual language ("as you can see")
- Provides count: "Four hotels currently offer braille signage"

---

### Q2: Temporal Progression
**Question:** "How has hotel accessibility changed from 2022 to 2024?"

**Expected Answer:** "Hotel accessibility ratings increased by an average of 32 points from 2022 (averaging 65) to 2024 (averaging 97). This improvement was driven by the DC Accessible Capital Initiative launched in 2023."

**Validation:**
- Agent states specific numbers (32-point improvement)
- Mentions the 2022-2024 timeframe
- Provides context (the initiative)
- Uses ordinal language ("increased by", "improved")

---

### Q3: Geographic Query
**Question:** "Show me hotels within 0.5 miles of Metro with accessible rooms available"

**Expected Answer:** Filter results WHERE `Distance_to_Metro < 0.5` AND `Wheelchair_Accessible_Entrance = TRUE`. Should return 6-8 hotels.

**Validation:**
- Agent filters by BOTH criteria (proximity AND accessibility)
- States distance metric ("within half a mile")
- Lists specific hotel names

---

### Q4: Seasonal Pricing
**Question:** "When are hotel prices highest?"

**Expected Answer:** "Hotel prices peak during Cherry Blossom season (late March to early April) with rates 40% higher than baseline, and July 4th week with rates 50% higher. Winter months (January-February) show the lowest prices, about 20% below average."

**Validation:**
- Agent identifies seasonal patterns (Cherry Blossom, July 4th)
- States percentage premiums (+40%, +50%)
- Mentions off-season discount (-20%)
- Provides specific months

---

### Q5: Availability Constraint
**Question:** "Are accessible hotel rooms available during Cherry Blossom season?"

**Expected Answer:** "Accessible room availability drops significantly during Cherry Blossom season (March 25 - April 10), falling to about 30% compared to the 70% baseline. Book accessible rooms by early March for this period."

**Validation:**
- Agent recognizes seasonal impact on availability
- States specific availability percentage (30%)
- Provides booking recommendation
- Mentions date range

---

## CATEGORY 2: Restaurant-Only Queries (Single Table)

### Q6: Noise Level Query
**Question:** "Which restaurants are quiet on weekdays?"

**Expected Answer:** Restaurants where `Noise_Level_Rating < 3` AND `Is_Weekend = FALSE`. Should mention 5-6 restaurants with noise ratings 1-2.

**Validation:**
- Agent filters by BOTH criteria (noise level AND weekday)
- Uses sensory language appropriately ("quiet", "low noise level")
- Lists specific restaurant names
- Mentions this is important for sensory-sensitive diners

---

### Q7: Wait Time Patterns
**Question:** "What are typical wait times at DC restaurants?"

**Expected Answer:** "Weekday wait times average 10-20 minutes, while weekend wait times are significantly higher at 25-35 minutes. The busiest times are Friday and Saturday evenings."

**Validation:**
- Agent distinguishes weekday vs. weekend patterns
- States specific minute ranges
- Provides context (Friday/Saturday busiest)

---

### Q8: Budget + Accessibility
**Question:** "Show me affordable accessible restaurants"

**Expected Answer:** Filter WHERE `Price_Range IN ('$', '$$')` AND `Accessibility_Rating > 75`. Should return 4-5 restaurants.

**Validation:**
- Agent filters by BOTH criteria (price AND accessibility)
- Defines "affordable" appropriately ($ or $$)
- Lists specific restaurant names with price indicators

---

## CATEGORY 3: Cross-Table Queries (Relational Model)

### Q9: Cross-Category Comparison
**Question:** "Did hotels or restaurants improve accessibility faster from 2022 to 2024?"

**Expected Answer:** "Hotels improved significantly faster, with an average 32-point increase in accessibility ratings from 2022 to 2024, compared to restaurants which improved 17 points. Hotels benefited from larger renovation budgets and the DC Accessible Capital Initiative, while restaurants faced constraints from historic building regulations, especially in Georgetown."

**Validation:**
- Agent compares BOTH categories (hotels vs restaurants)
- States specific improvement numbers (32 vs 17 points)
- Explains WHY the difference exists (budgets, regulations)
- Uses comparative language ("faster", "significantly")

---

### Q10: Geographic Cross-Table Query
**Question:** "Show me all accessible venues in Georgetown"

**Expected Answer:** JOIN Hotels + Restaurants WHERE `Neighborhood = 'Georgetown'` AND `Accessibility_Rating > 80`. Should return mixed list of hotels and restaurants.

**Validation:**
- Agent queries BOTH tables (hotels AND restaurants)
- Filters by neighborhood correctly
- Distinguishes venue types in results ("The Watergate Hotel, Founding Farmers restaurant...")
- Provides count per category

---

### Q11: Neighborhood Comparison (Cross-Table)
**Question:** "Which neighborhood has the most accessible hotels and restaurants combined?"

**Expected Answer:** Aggregate by `Neighborhood`, count where `Accessibility_Rating > 80` across BOTH tables. Should identify Penn Quarter or Downtown as the leader.

**Validation:**
- Agent aggregates across BOTH tables
- Groups by neighborhood correctly
- Provides combined count ("Penn Quarter has 3 accessible venues: 2 hotels and 1 restaurant")
- Ranks neighborhoods

---

### Q12: Budget Planning (Cross-Table)
**Question:** "Show me neighborhoods with affordable accessible hotels and mid-range accessible restaurants"

**Expected Answer:** Multi-table filter: Hotels WHERE `Daily_Rate < 200` AND `Accessibility_Rating > 75`, Restaurants WHERE `Price_Range = '$$'` AND `Accessibility_Rating > 75`, GROUP BY `Neighborhood`.

**Validation:**
- Agent queries BOTH tables with different criteria
- Filters hotels by daily rate, restaurants by price range
- Groups results by neighborhood
- Lists specific venue names in each category

---

### Q13: Proximity Query (Cross-Table)
**Question:** "Show me accessible restaurants within 0.5 miles of accessible hotels"

**Expected Answer:** Spatial join WHERE Hotels.`Wheelchair_Accessible_Entrance = TRUE` AND Restaurants.`Wheelchair_Accessible_Entrance = TRUE` AND distance between lat/long < 0.5 miles.

**Validation:**
- Agent performs spatial relationship query across BOTH tables
- Mentions proximity metric (0.5 miles)
- Lists hotel-restaurant pairs
- This is an ADVANCED query — may not work perfectly without explicit spatial join support

---

## CATEGORY 4: Temporal Comparisons (Cross-Category)

### Q14: Feature Adoption Timeline
**Question:** "Which venue type adopted braille signage faster?"

**Expected Answer:** "Hotels adopted braille signage faster, with 40% having it by 2024 (up from near zero in 2022). Restaurants reached 60% adoption by 2024 (up from 15% in 2022). While restaurants have higher final adoption rates, hotels added the feature more rapidly during the 2023 initiative."

**Validation:**
- Agent compares adoption rates across BOTH tables
- Mentions specific percentages and years
- Explains the adoption timeline (2023 initiative)
- Clarifies rate vs. final percentage

---

### Q15: Year-Over-Year Improvement
**Question:** "Show me venues that improved the most from 2023 to 2024"

**Expected Answer:** Calculate `Accessibility_Rating` delta for each venue across BOTH tables, ORDER BY delta DESC. Should list top improvers (both hotels and restaurants).

**Validation:**
- Agent queries BOTH tables
- Calculates year-over-year change
- Ranks venues by improvement magnitude
- Mixes hotels and restaurants in top results

---

## CATEGORY 5: Drill-Down Moments (Multi-Level)

### Q16: Initial → Drill 1 → Drill 2
**Initial:** "Tell me about the Watergate Hotel's accessibility"

**Expected Answer:** "The Watergate Hotel is a luxury hotel in Foggy Bottom with an accessibility rating of 92 (2024). It has braille signage, tactile maps, wheelchair-accessible entrance, and elevators."

**Drill 1:** "How has it improved since 2022?"

**Expected Answer:** "The Watergate Hotel's accessibility rating increased from 68 in 2022 to 92 in 2024, a 24-point improvement. It added braille signage in June 2023 and tactile room number plates in March 2024."

**Drill 2:** "Which other hotels improved similarly?"

**Expected Answer:** List hotels with 20-30 point improvements (Grand Hyatt, Hotel Zena, etc.) grouped by improvement magnitude.

**Validation:**
- Agent maintains context across three questions
- References specific venue from Q1 in Q2 and Q3
- Provides comparative analysis in Q3

---

### Q17: Initial → Drill 1 → Drill 2 (Cross-Table)
**Initial:** "Which neighborhood has the most accessible restaurants?"

**Expected Answer:** Penn Quarter or U Street (aggregate by neighborhood, rank restaurants by accessibility rating).

**Drill 1:** "How does that neighborhood compare for hotels?"

**Expected Answer:** Cross-table comparison for the SAME neighborhood identified in Q1. "Penn Quarter also has highly accessible hotels, averaging 95 accessibility rating. It's the most accessible neighborhood overall."

**Drill 2:** "Did both categories improve at the same rate?"

**Expected Answer:** "In Penn Quarter, hotels improved 28 points from 2022 to 2024, while restaurants improved 15 points. Hotels had larger budgets for renovations."

**Validation:**
- Agent switches between tables while maintaining neighborhood context
- Compares improvement rates WITHIN the same neighborhood
- Explains contextual differences

---

## CATEGORY 6: Verification & Trust

### Q18: Data Freshness
**Question:** "Which venues have the most reliable accessibility data?"

**Expected Answer:** Filter by `Last_Verified_Date` within last 6 months AND `Verified_By = 'Staff_Report'` OR high `Accessibility_Review_Count`. Should mention hotels with recent staff reports.

**Validation:**
- Agent considers verification date and source
- Explains what makes data reliable (recent + staff-verified)
- Lists specific venues with high-confidence data

---

### Q19: Stale Data Warning
**Question:** "Are there any venues with outdated information?"

**Expected Answer:** Filter by `Last_Verified_Date` > 12 months ago. "Five Georgetown restaurants haven't been verified since 2022. Their accessibility ratings may be outdated — recommend visiting their websites or calling ahead."

**Validation:**
- Agent identifies stale data
- Provides actionable recommendation (call ahead)
- Uses cautious language ("may be outdated")

---

## CATEGORY 7: Story Arc Queries

### Q20: Initiative Impact
**Question:** "Did the 2023 Accessible Capital Initiative work?"

**Expected Answer:** "Yes, the 2023 DC Accessible Capital Initiative had significant impact. Hotels participating in the program improved accessibility ratings by 32 points on average (2022: 65 → 2024: 97). Restaurants improved 17 points (2022: 55 → 2024: 72). Feature adoption also increased: 40% of hotels added braille signage, and accessible room availability improved from 30% to 70%."

**Validation:**
- Agent summarizes impact across BOTH venue types
- States specific improvement numbers
- Mentions feature adoption (braille, accessible rooms)
- Attributes changes to the initiative

---

## Success Criteria

✅ **Single-Table Queries (Q1-Q8):** Agent correctly queries Hotels OR Restaurants independently  
✅ **Cross-Table Queries (Q9-Q13):** Agent joins Hotels + Restaurants on `Venue_ID`, compares categories  
✅ **Temporal Analysis (Q14-Q15):** Agent calculates year-over-year changes across both tables  
✅ **Drill-Down Context (Q16-Q17):** Agent maintains context across 3-question sequences  
✅ **Data Quality (Q18-Q19):** Agent considers verification freshness and warns about stale data  
✅ **Story Arc (Q20):** Agent synthesizes the 2022-2024 transformation narrative  

**Accessibility Language Compliance:**
- ❌ NO visual metaphors: "as you can see", "the chart shows", "look at"
- ✅ USE ordinal language: "highest-rated", "nearest", "most accessible"
- ✅ PROVIDE context: "92 rating, above the 80 average"
- ✅ EXPLAIN causation: "improved after the 2023 initiative"

---

## Troubleshooting

**If agent says "I need more context":**
- Verify `analyticsTabId` is set in context variables
- Ensure semantic model is activated in Data 360
- Check that relationship is defined on `Venue_ID`

**If agent returns wrong numbers:**
- Check that field descriptions were pasted into Data 360 UI
- Verify field types (Date, Number, Boolean) are correct
- Re-activate semantic model after changes

**If cross-table queries fail:**
- Verify relationship is defined between Hotels and Restaurants DMOs
- Check that `Venue_ID` is marked as the join key
- Test single-table queries first (Q1-Q8) to isolate the issue

**If agent uses visual language:**
- Update agent system prompt with accessibility rules (in `dashboardConfig.ts`)
- Run Accessibility Expert Skill to identify violations
- Provide corrective feedback examples in agent training
