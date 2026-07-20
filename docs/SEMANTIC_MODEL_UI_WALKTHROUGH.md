# Semantic Model Optimization — UI Walkthrough

**Goal:** Optimize `New_Semantic_Model_0ba` for cross-table queries so the agent can answer "Show me all accessible venues in Penn Quarter" without asking for clarification.

**Time Estimate:** 45-60 minutes for full optimization

---

## Phase 1: Audit Current Configuration (10 minutes, READ-ONLY)

### Step 1.1: Access Data 360 Semantic Model Builder

1. **Navigate to:**
   - Setup (gear icon) → Setup Home
   - Search: "Data Cloud" or "Semantic Models"
   - Click: **Data Cloud** → **Semantic Models**

2. **Find your model:**
   - Search for: `New_Semantic_Model_0ba`
   - Click the model name to open

3. **Document Current State:**
   Take screenshots or notes of:
   - ✅ Model status (Active / Inactive)
   - ✅ Number of fields shown
   - ✅ Any warnings or errors displayed

---

### Step 1.2: Check Relationship Configuration

1. **Click the "Relationships" tab** (top navigation in semantic model editor)

2. **Look for:**
   - Do you see a relationship between Hotels and Restaurants?
   - What type of join? (LEFT, INNER, FULL OUTER)
   - What field is the join key?

3. **Document:**
   ```
   Relationship found: YES / NO
   Join type: _________
   Left table: _________
   Right table: _________
   Join condition: Hotels._______ = Restaurants._______
   ```

**If NO relationship exists:**
- ⚠️ This is the root cause of cross-table query failures
- We'll fix this in Phase 4

---

### Step 1.3: Review Field Descriptions

1. **Click "Fields" tab**

2. **Check a few sample fields:**
   - `Venue_ID` (shared field)
   - `Venue_Category` (shared field)
   - `Daily_Rate` (hotel-only field)
   - `Average_Wait_Time` (restaurant-only field)

3. **For each field, check:**
   - ✅ Description exists? (not empty)
   - ✅ Description mentions if field is shared/hotel-only/restaurant-only?
   - ✅ `Venue_ID` description mentions it's a JOIN KEY?

4. **Document gaps:**
   ```
   Fields with empty descriptions: _________
   Fields missing cross-table guidance: _________
   Venue_ID marked as JOIN KEY: YES / NO
   ```

---

### Step 1.4: Test Queries in Data 360 Query Tab

1. **Click "Query" tab** (in semantic model editor)

2. **Run Test Query 1 (Basic Cross-Table):**
   ```sql
   SELECT Venue_Name, Venue_Category, Neighborhood, Accessibility_Rating
   FROM New_Semantic_Model_0ba
   WHERE Neighborhood = 'Penn Quarter'
   ORDER BY Venue_Category, Accessibility_Rating DESC
   ```

3. **Expected Result:** Mixed list of hotels and restaurants

4. **Document:**
   ```
   Test 1 Result: SUCCESS / FAILED
   If failed, error message: _________
   If success, row count: _________
   ```

5. **Run Test Query 2 (Cross-Table Aggregation):**
   ```sql
   SELECT Neighborhood, Venue_Category, COUNT(*) as Venue_Count
   FROM New_Semantic_Model_0ba
   WHERE Accessibility_Rating > 80
   GROUP BY Neighborhood, Venue_Category
   ORDER BY Neighborhood, Venue_Category
   ```

6. **Expected Result:** Grouped counts like "Penn Quarter: Hotel=2, Restaurant=1"

7. **Document:**
   ```
   Test 2 Result: SUCCESS / FAILED
   If failed, error message: _________
   ```

**End of Phase 1 Audit** — Now you know what needs to be fixed.

---

## Phase 2: Enhance Field Descriptions (20-30 minutes)

### Step 2.1: Prepare Enhanced Descriptions

**Before editing in the UI, update your markdown files:**

1. **Open:** `docs/dc-tourism-hotels-fields.md`

2. **For Fields 1-30 (SHARED), add prefix:**
   ```markdown
   ## Field 2: Venue_ID
   **Type:** Text  
   **Description:** **[SHARED FIELD - PRIMARY JOIN KEY]** Unique venue identifier code...
   ```

3. **For Fields 31-33 (HOTEL ONLY), add prefix:**
   ```markdown
   ## Field 31: Daily_Rate
   **Type:** Number  
   **Description:** **[HOTEL ONLY - Not available in Restaurants table]** Hotel room rate in USD...
   ```

4. **Save the file**

5. **Repeat for `docs/dc-tourism-restaurants-fields.md`:**
   - Fields 1-30: `[SHARED FIELD]`
   - Fields 31-34: `[RESTAURANT ONLY - Not available in Hotels table]`

**Critical field updates:**

**Venue_ID (Field 2) — Must emphasize JOIN KEY:**
```
**[SHARED FIELD - PRIMARY JOIN KEY]** Unique venue identifier code (e.g., "HOTEL_WATERGATE", "REST_FOUNDING_FARMERS"). This is the JOIN KEY used to relate Hotels and Restaurants tables together in cross-table queries. When a user asks about "venues" or "places" without specifying type, this field enables querying BOTH tables simultaneously. Use this field to group records by venue across categories.
```

**Venue_Category (Field 4) — Must explain distinguishing role:**
```
**[SHARED FIELD]** Venue type: "Hotel" or "Restaurant". Use this field to distinguish between Hotels and Restaurants in unified query results. When presenting cross-table results to users, include this field to clarify which category each venue belongs to (e.g., "Grand Hyatt Washington (hotel), Old Ebbitt Grill (restaurant)").
```

---

### Step 2.2: Update Field Descriptions in Data 360 UI

1. **Go back to:** Data 360 → Semantic Models → `New_Semantic_Model_0ba` → **Fields** tab

2. **Find the first field:** `Record_ID`

3. **Click the field name** to open the edit panel (right sidebar usually)

4. **Copy-paste the enhanced description** from your markdown file

5. **Click "Save"** (or equivalent button)

6. **Repeat for all 75 fields** (yes, this is tedious but critical)

**Pro Tips:**
- ✅ Work in batches of 10 fields, then take a break
- ✅ Keep your markdown file open in a second window for easy copy-paste
- ✅ Pay extra attention to Venue_ID, Venue_Category, Neighborhood, Accessibility_Rating

**Shortcut if available:**
- Some orgs allow bulk field metadata import via CSV or API
- Check if your Data 360 UI has an "Import Field Descriptions" button
- If available, export current fields → update CSV → re-import

---

### Step 2.3: Save and Reactivate Semantic Model

1. **After editing all fields, click "Save"** (top-right)

2. **Click "Activate"** button (semantic models require reactivation after metadata changes)

3. **Wait for activation** (usually 1-2 minutes)

4. **Verify:** Status should show "Active" (green checkmark)

---

## Phase 3: Add Calculated Measures (5 minutes, if supported)

### Step 3.1: Check for Calculated Field Support

1. **In the Fields tab, look for:**
   - "Add Calculated Field" button
   - "New Measure" button
   - "New Dimension" button

2. **If available:**
   - Continue to Step 3.2
   - If NOT available:
   - ⚠️ Skip this phase — Data 360 may not support calculated fields yet
   - Document this limitation for future reference

---

### Step 3.2: Add Accessible_Venue_Flag (Boolean Measure)

1. **Click "Add Calculated Field"** (or equivalent)

2. **Fill in:**
   ```
   Name: Accessible_Venue_Flag
   Type: Boolean
   Formula: Accessibility_Rating > 80
   Description: [SHARED CALCULATED FIELD] TRUE if venue is considered accessible (rating above 80). Use this for filtering accessible venues in cross-table queries without needing to specify the threshold each time.
   ```

3. **Click "Save"**

---

### Step 3.3: Add Venue_Type_Label (Text Dimension)

1. **Click "Add Calculated Field"**

2. **Fill in:**
   ```
   Name: Venue_Type_Label
   Type: Text
   Formula: LOWER(Venue_Category)
   Description: [SHARED CALCULATED FIELD] Lowercase venue type label ('hotel' or 'restaurant'). Use this for formatting natural language results in responses to users, ensuring consistent lowercase presentation.
   ```

3. **Click "Save"**

---

### Step 3.4: Reactivate Model

1. **Click "Save"** → **"Activate"**

2. **Wait for activation**

---

## Phase 4: Fix or Verify Relationship Configuration (5-10 minutes)

### Step 4.1: Navigate to Relationships Tab

1. **Click "Relationships" tab** in semantic model editor

---

### Step 4.2: If Relationship EXISTS (from Phase 1 audit)

1. **Click the relationship** to inspect it

2. **Verify:**
   - Join type: Should be `LEFT OUTER JOIN` or `FULL OUTER JOIN` (NOT INNER JOIN)
   - Join condition: `Hotels.Venue_ID = Restaurants.Venue_ID`
   - Cardinality: 1:many or 1:1

3. **If incorrect:**
   - Click "Edit"
   - Update join type to `LEFT OUTER JOIN` or `FULL OUTER JOIN`
   - Save

---

### Step 4.3: If Relationship DOES NOT EXIST

**This is the likely root cause!**

1. **Click "Add Relationship"** button

2. **Fill in the form:**
   ```
   Relationship Name: Hotels_Restaurants_Venues
   
   Left Table: Hotels DMO (select from dropdown)
   Left Join Field: Venue_ID
   
   Right Table: Restaurants DMO (select from dropdown)
   Right Join Field: Venue_ID
   
   Join Type: LEFT OUTER JOIN  (or FULL OUTER JOIN if you want bidirectional)
   
   Cardinality: One-to-One  (since Venue_ID is unique per venue)
   
   Description: Joins Hotels and Restaurants tables on the shared Venue_ID field to enable cross-category queries like "show all venues in [neighborhood]".
   ```

3. **Click "Save"**

4. **Reactivate the semantic model:**
   - Click "Activate" button
   - Wait for activation to complete

---

### Step 4.4: Re-Test Queries

**Go back to Query tab and re-run Test Query 1 from Phase 1.4:**

```sql
SELECT Venue_Name, Venue_Category, Neighborhood, Accessibility_Rating
FROM New_Semantic_Model_0ba
WHERE Neighborhood = 'Penn Quarter'
ORDER BY Venue_Category, Accessibility_Rating DESC
```

**Expected Result:** Should now return BOTH hotels and restaurants

**If it still fails:**
- ⚠️ Check error message
- Relationship may not have been saved correctly
- Verify Venue_ID field types match (both Text)
- Contact Data 360 support if relationship configuration looks correct but queries still fail

---

## Phase 5: Test with Agentforce (10 minutes)

### Step 5.1: Navigate to Agentforce Builder

1. **Go to:** Setup → Agentforce → Agent Builder

2. **Open:** VizVoice agent

3. **Click "Test" tab**

---

### Step 5.2: Set Context Variables

1. **In the test interface, set variables:**
   ```json
   {
     "targetEntityId": "New_Semantic_Model_0ba",
     "targetEntityType": "sdm"
   }
   ```

2. **Verify variables are set** (usually shown in a side panel)

---

### Step 5.3: Run Cross-Table Test Query

**Test Input:**
```
Show me all accessible venues in Penn Quarter
```

**Expected Output:**
```
Penn Quarter has three accessible venues: Grand Hyatt Washington and Kimpton Hotel Monaco (hotels), plus Old Ebbitt Grill (restaurant). All three have accessibility ratings above 85.
```

**Success Criteria:**
- ✅ Agent queries BOTH tables without asking for clarification
- ✅ Results distinguish venue type (hotel vs restaurant)
- ✅ No visual language ("as you can see") — only accessibility language
- ✅ Provides specific names and ratings

---

### Step 5.4: Run Regression Test (Single-Table Query)

**Test Input:**
```
Which hotels have braille signage?
```

**Expected Output:**
```
Six hotels currently offer braille signage: The Watergate Hotel, Hotel Zena, The Line DC, Kimpton Hotel Monaco, Canopy by Hilton, and Embassy Suites Dupont Circle.
```

**Success Criteria:**
- ✅ Agent queries Hotels table only (doesn't include restaurants)
- ✅ Returns specific hotel names
- ✅ Provides count ("six hotels")

---

### Step 5.5: Document Results

**Create file:** `docs/semantic-model-optimization-results.md`

**Document:**
```markdown
# Semantic Model Optimization Results

## Test Date: [YYYY-MM-DD]

### Phase 1 Audit Findings:
- Relationship existed: YES / NO
- Field descriptions had cross-table markers: YES / NO
- Test queries in Data 360 Query Editor: PASSED / FAILED

### Optimizations Applied:
- [ ] Enhanced 75 field descriptions with [SHARED], [HOTEL ONLY], [RESTAURANT ONLY] markers
- [ ] Added/fixed relationship between Hotels and Restaurants on Venue_ID
- [ ] Added calculated measures (if supported): Accessible_Venue_Flag, Venue_Type_Label
- [ ] Reactivated semantic model

### Test Results:

#### Cross-Table Query Test (Q10):
**Query:** "Show me all accessible venues in Penn Quarter"
**Result:** PASS / FAIL
**Agent Response:** [paste response here]
**Issues:** [if any]

#### Single-Table Regression Test:
**Query:** "Which hotels have braille signage?"
**Result:** PASS / FAIL
**Agent Response:** [paste response here]
**Issues:** [if any]

### Next Steps:
- [ ] Test additional cross-table queries (Q9, Q11, Q12 from dc-tourism-agent-test-questions.md)
- [ ] Update dashboardConfig.ts if agent still struggles
- [ ] Document any remaining limitations
```

---

## Troubleshooting Guide

### Issue: Relationship Configuration Keeps Reverting

**Symptoms:** After saving and reactivating, relationship disappears or changes back

**Possible Causes:**
1. Venue_ID field types don't match (one is Text, other is Number)
2. Relationship validation failed (Venue_ID values don't actually match between tables)
3. Data 360 UI bug

**Fix:**
1. Go to Fields tab → Check Venue_ID field type in BOTH DMOs
2. If types don't match, change one to match the other
3. Re-create relationship
4. If still failing, check Venue_ID values in raw data (query both tables, verify overlapping values exist)

---

### Issue: Test Queries Return Duplicate Rows

**Symptoms:** "Penn Quarter" query returns 6 rows instead of 3 (each venue appears twice)

**Possible Cause:** JOIN type is wrong (creating Cartesian product)

**Fix:**
1. Change join type from INNER JOIN to LEFT OUTER JOIN
2. Verify cardinality is set to 1:1 (not 1:many)
3. Reactivate model and re-test

---

### Issue: Agent Still Asks for Clarification After All Optimizations

**Symptoms:** "Which venues would you like to know about: hotels or restaurants?"

**Possible Causes:**
1. Enhanced field descriptions not saving correctly
2. Relationship exists but agent instructions don't leverage it
3. AnalyzeSemanticData action doesn't support cross-table queries (fundamental limitation)

**Fix:**
1. **Check field descriptions saved:** Go back to Fields tab, spot-check a few — do they still have [SHARED] markers?
2. **Update dashboardConfig.ts:** Add explicit cross-table query guidance (see plan Phase 5)
3. **If still failing:** Consider Alternative Approach B (Agent Orchestration Layer) from plan — agent makes TWO separate calls and merges results

---

## Summary Checklist

Before moving to code changes:

- [ ] Phase 1 audit completed — documented current state
- [ ] Phase 2 field descriptions enhanced (all 75 fields)
- [ ] Phase 3 calculated measures added (if supported)
- [ ] Phase 4 relationship verified or created (Hotels ↔ Restaurants on Venue_ID)
- [ ] Phase 5 agent tests completed — at least one cross-table query working
- [ ] Results documented in semantic-model-optimization-results.md

If all checked ✅, proceed to updating `dashboardConfig.ts` and code changes.

If any ❌, revisit that phase or escalate to Data 360 support.
