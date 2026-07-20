# Data Cloud + Tableau Next Setup Guide

**Goal:** Upload DC Tourism data (TWO tables) → Create unified semantic model with relationship → Build Tableau dashboard → Test agent queries

**Architecture:** Relational model with two separate tables joined on `Venue_ID`
- **Hotels table:** 10,960 daily records (2022-2024)
- **Restaurants table:** 1,256 weekly records (2022-2024)
- **Shared dimensions:** Venue_ID, geographic fields, accessibility features
- **Expandable:** Can add Museums, Parks, Transit tables later

---

## Step 1: Upload Hotels CSV to Data Cloud

### Upload Process

1. **Navigate to Data Cloud:**
   - Go to: Setup → Data Cloud → Data Streams → New

2. **Upload Hotels CSV:**
   - Source: CSV Upload
   - File: `dc_tourism_hotels_timeseries.csv` (10,960 records)
   - Data Lake Object Label: `DC Tourism Hotels TimeSeries`
   - Data Lake Object API Name: `dc_tourism_hotels_timeseries`
   - **Category:** **Custom** (this is venue data, not person data)

**Expected Field Preview:**
- **37 fields detected**, including:
  - Shared dimensions: `Record_ID`, `Venue_ID`, `Venue_Name`, `Venue_Category`, `Latitude`, `Longitude`, `Neighborhood`
  - Time fields: `Date`, `Day_of_Week`, `Month`, `Year`
  - Hotel-specific: `Daily_Rate`, `Occupancy_Rate`, `Accessibility_Room_Available`
  - Sample data: The Watergate Hotel, Grand Hyatt Washington, etc.

### ⚠️ BEFORE Clicking "Next"

**Verify these field types in the Field Defaults tab:**

| Field Name | Required Type | Why It Matters |
|------------|--------------|----------------|
| `Date` | **Date** | Time-series queries require Date type, not Text |
| `Latitude` | **Number** | Map visualizations need numeric coordinates |
| `Longitude` | **Number** | Map visualizations need numeric coordinates |
| `Year` | **Number** | Filtering by year (2022, 2023, 2024) |
| `Accessibility_Rating` | **Number** | Aggregations (AVG, MAX, MIN) |
| `Daily_Rate` | **Number** | Pricing trends and averages |
| `Occupancy_Rate` | **Number** | Hotel capacity analysis |
| `Has_Braille_Signage` | **Boolean** | Accessibility filters (TRUE/FALSE) |
| `Wheelchair_Accessible_Entrance` | **Boolean** | Accessibility filters |
| `Has_Elevator` | **Boolean** | Accessibility filters |
| `Is_Weekend` | **Boolean** | Day-of-week filtering |

**Auto-Detected Fields (Usually Correct):**
- Text fields: `Venue_Name`, `Venue_Category`, `Neighborhood`, `Ward`, `Zip_Code`, `Day_of_Week`, `Month`, `Season`

### Next Steps in the Wizard

1. **Click "Next"** to proceed to field mapping

2. **Primary Key Selection:**
   - Select `Record_ID` from the dropdown
   - This is your unique identifier (e.g., `HOTEL_WATERGATE_2022-01-01`)

3. **Record Modified Field:**
   - Select `Date` or leave blank
   - Use `Date` if you want to track when records were added

4. **Organization Unit Identifier:**
   - Leave as default or select based on your org structure

5. **Field Mapping Screen:**
   - Verify the critical field types listed above
   - Click "Next" to create the Data Stream

6. **Data Stream Activation:**
   - Data Cloud will ingest the CSV (12,216 records)
   - Create a Data Model Object (DMO) automatically
   - Ingestion usually takes 1-2 minutes for this size

7. **Record the DMO API Name:**
   - After ingestion completes, you'll see the DMO name (e.g., `dc_tourism_hotels_timeseries__dll` or `DC_Tourism_Hotels__dlm`)
   - **Copy this down as "Hotels DMO"** → you need it for the semantic model creation

---

## Step 2: Upload Restaurants CSV to Data Cloud

**Repeat the same process for the second table:**

1. **Navigate to Data Cloud:**
   - Go to: Setup → Data Cloud → Data Streams → New

2. **Upload Restaurants CSV:**
   - Source: CSV Upload
   - File: `dc_tourism_restaurants_timeseries.csv` (1,256 records)
   - Data Lake Object Label: `DC Tourism Restaurants TimeSeries`
   - Data Lake Object API Name: `dc_tourism_restaurants_timeseries`
   - **Category:** **Custom**

**Expected Field Preview:**
- **38 fields detected**, including:
  - Shared dimensions: Same as Hotels (fields 1-30 identical)
  - Restaurant-specific: `Average_Wait_Time`, `Reservations_Available`, `Noise_Level_Rating`, `Price_Range`
  - Sample data: Founding Farmers, Old Ebbitt Grill, Maydan, etc.

### ⚠️ BEFORE Clicking "Next" (Both Tables)

**Verify these field types in the Field Defaults tab:**

| Field Name | Required Type | Why It Matters |
|------------|--------------|----------------|
| `Date` | **Date** | Time-series queries require Date type, not Text |
| `Latitude` | **Number** | Map visualizations need numeric coordinates |
| `Longitude` | **Number** | Map visualizations need numeric coordinates |
| `Year` | **Number** | Filtering by year (2022, 2023, 2024) |
| `Accessibility_Rating` | **Number** | Aggregations (AVG, MAX, MIN) |
| `Daily_Rate` | **Number** (hotels only) | Pricing trends |
| `Occupancy_Rate` | **Number** (hotels only) | Capacity analysis |
| `Average_Wait_Time` | **Number** (restaurants only) | Demand trends |
| `Noise_Level_Rating` | **Number** (restaurants only) | Sensory filtering |
| `Has_Braille_Signage` | **Boolean** | Accessibility filters (TRUE/FALSE) |
| `Wheelchair_Accessible_Entrance` | **Boolean** | Accessibility filters |
| `Is_Weekend` | **Boolean** | Day-of-week filtering |

### Complete Both Uploads

- **Primary Key for both:** `Record_ID`
- **Record Modified Field:** `Date` or leave blank
- **Wait for both DMO ingestion to complete** (1-2 minutes each)
- **Copy both DMO API names:**
  - Hotels DMO: `_______________________`
  - Restaurants DMO: `_______________________`

---

## Step 3: Salesforce CLI Upload Option (Advanced)

```bash
# 1. Check your target org
sf org display --target-org vizvoice-dev

# 2. Upload CSV via Data Loader or Bulk API
# (Data Cloud CSV upload via CLI is limited — UI is easier)

# For reference, the upload would look like:
sf data import --file scripts/dc_tourism_timeseries.csv \
  --target-org vizvoice-dev \
  --sobject C360_Semantic_Model_Extended_0ba
```

**Note:** Data Cloud CSV import is best done through the UI for semantic models. CLI support is limited.

---

## Step 4: Create Unified Semantic Model with Both Tables

**This is the KEY step:** Creating ONE semantic model that includes BOTH tables with a relationship.

1. **Navigate to Data 360:**
   - Setup → Data Cloud → Semantic Models → New Semantic Model

2. **Basic Info:**
   - Name: `DC Tourism TimeSeries`
   - API Name: `DC_Tourism_TimeSeries__dlm`
   - Description: `Hotels (daily) and restaurants (weekly) with accessibility features, pricing trends, and 2022-2024 transformation story. Relational model supports cross-category queries.`

3. **Add BOTH DMOs as Sources:**
   - **Source 1:** Hotels DMO (from Step 1)
     - Click "Add Source" → Select `dc_tourism_hotels_timeseries__dll`
     - Alias: `Hotels`
   - **Source 2:** Restaurants DMO (from Step 2)
     - Click "Add Source" → Select `dc_tourism_restaurants_timeseries__dll`
     - Alias: `Restaurants`

4. **Define Relationship (Join Key):**
   - Click "Add Relationship"
   - **Join Type:** Left Outer Join (or Inner Join)
   - **Join On:** `Hotels.Venue_ID` = `Restaurants.Venue_ID`
   - **Relationship Name:** `Venues`
   - **Purpose:** Enables cross-table queries like "Show hotels and restaurants in Georgetown"

5. **Add Fields from BOTH Tables:**
   Open `docs/dc-tourism-timeseries-semantic-model-fields.md` and **paste descriptions for each field**:

   **Shared dimension fields (appear in both tables):**
   - `Venue_ID` (Text) - **Join key**, venue identifier
   - `Venue_Name` (Text) - Display name
   - `Venue_Category` (Text) - "Hotel" or "Restaurant" (use to distinguish sources)
   - `Date` (Date) - Time-series key
   - `Year` (Number) - For year-over-year comparisons
   - `Neighborhood` (Text) - Geographic grouping
   - `Latitude`, `Longitude` (Number) - Map visualizations
   - `Has_Braille_Signage` (Boolean) - Accessibility filter
   - `Wheelchair_Accessible_Entrance` (Boolean) - Accessibility filter
   - `Accessibility_Rating` (Number) - Key metric across both tables

   **Hotel-specific fields:**
   - `Daily_Rate` (Number) - Hotel pricing
   - `Occupancy_Rate` (Number) - Hotel capacity
   - `Accessibility_Room_Available` (Boolean) - Hotel availability

   **Restaurant-specific fields:**
   - `Average_Wait_Time` (Number) - Restaurant demand
   - `Reservations_Available` (Boolean) - Restaurant availability
   - `Noise_Level_Rating` (Number) - Restaurant sensory metric
   - `Price_Range` (Text) - Restaurant price indicator ($$)

   **For each field:**
   - Set **Display Name** (user-friendly)
   - Set **Description** (paste from markdown doc — CRITICAL for NLU)
   - Set **Data Type** (Text, Number, Date, Boolean)
   - Mark **Filterable** and **Groupable** as appropriate
   - **Note which table it comes from** (Hotels, Restaurants, or Both)

6. **Configure Aggregations:**
   - For `Accessibility_Rating`: Enable AVG, MIN, MAX (both tables)
   - For `Daily_Rate`: Enable AVG, MIN, MAX (hotels only)
   - For `Average_Wait_Time`: Enable AVG, MIN, MAX (restaurants only)

7. **Set Default Measures:**
   - Primary measure: `Accessibility_Rating` (cross-table)
   - Secondary: `Daily_Rate` (hotels), `Average_Wait_Time` (restaurants)

8. **Save and Activate:**
   - Click **Save**
   - Click **Activate** to make it queryable
   - **Verify relationship:** Check that join on Venue_ID is active

---

## Step 5: Verify Semantic Model and Test Queries

### Test Queries in Data 360 UI:

Navigate to: Data Cloud → Semantic Models → `New_Semantic_Model_0ba` → **Query**

#### Query 1: Count Records by Table
```sql
SELECT Venue_Category, COUNT(*) as Record_Count
FROM DC_Tourism_TimeSeries__dlm
GROUP BY Venue_Category
```
**Expected:**
- Hotel: 10,960 records
- Restaurant: 1,256 records
- **Total: 12,216 records**

#### Query 2: Hotel-Only Query (Daily Pricing Trends)
```sql
SELECT Venue_Name, AVG(Daily_Rate) as Avg_Rate, AVG(Accessibility_Rating) as Avg_Accessibility
FROM DC_Tourism_TimeSeries__dlm
WHERE Venue_Category = 'Hotel' AND Year = 2024
GROUP BY Venue_Name
ORDER BY Avg_Accessibility DESC
```
**Expected:** 10 hotels with rates $180-$450, accessibility ratings 84-100

#### Query 3: Restaurant-Only Query (Weekly Wait Times)
```sql
SELECT Venue_Name, AVG(Average_Wait_Time) as Avg_Wait, AVG(Noise_Level_Rating) as Avg_Noise
FROM DC_Tourism_TimeSeries__dlm
WHERE Venue_Category = 'Restaurant' AND Year = 2024
GROUP BY Venue_Name
ORDER BY Avg_Wait
```
**Expected:** 8 restaurants with wait times 10-35 minutes, noise levels 1-5

#### Query 4: Cross-Table Query (Accessible Venues by Neighborhood)
```sql
SELECT Neighborhood, Venue_Category, COUNT(*) as Venue_Count
FROM DC_Tourism_TimeSeries__dlm
WHERE Accessibility_Rating > 80 AND Year = 2024
GROUP BY Neighborhood, Venue_Category
ORDER BY Neighborhood, Venue_Category
```
**Expected:** Grouped results showing BOTH hotels and restaurants per neighborhood
- Foggy Bottom: 1 hotel, 1 restaurant
- Georgetown: 0 hotels, 2 restaurants
- Penn Quarter: 2 hotels, 1 restaurant

#### Query 5: Verify Join Relationship (Cross-Category Comparison)
```sql
SELECT Neighborhood, 
       AVG(CASE WHEN Venue_Category = 'Hotel' THEN Accessibility_Rating END) as Hotel_Avg,
       AVG(CASE WHEN Venue_Category = 'Restaurant' THEN Accessibility_Rating END) as Restaurant_Avg
FROM DC_Tourism_TimeSeries__dlm
WHERE Year = 2024
GROUP BY Neighborhood
HAVING Hotel_Avg IS NOT NULL AND Restaurant_Avg IS NOT NULL
```
**Expected:** Neighborhoods with BOTH venue types, showing separate averages
- Tests that the relationship allows querying across both tables simultaneously

### Test with Agentforce (Manual):

1. Go to: Agentforce Builder → VizVoice agent → **Test** tab

2. Set test context:
   ```json
   {
     "targetEntityId": "DC_Tourism_TimeSeries__dlm",
     "targetEntityType": "sdm"
   }
   ```

3. **Test questions:**
   - "How many hotels are in the dataset?"
   - "Which hotel has the best accessibility rating in 2024?"
   - "Show me hotels with braille signage"
   - "How did hotel accessibility change from 2022 to 2024?"

4. **Verify responses:**
   - Agent should return accurate numbers
   - No visual language ("as you can see" → fail)
   - Numbers with context ("92 rating, above average")

---

## Step 4: Build Tableau Next Dashboard

### Prerequisites:
- Semantic model `DC_Tourism_TimeSeries__dlm` is active
- You have access to Tableau Next in the org

### Dashboard 1: Accessibility Map Explorer

1. **Create New Dashboard:**
   - Tableau Next → New Dashboard
   - Name: `DC Tourism - Hotels & Restaurants`

2. **Data Source:**
   - Connect to: `DC_Tourism_TimeSeries__dlm` semantic model

3. **Sheet 1: Accessibility Map (Symbol Map)**
   - Drag `Longitude` to Columns
   - Drag `Latitude` to Rows
   - Change mark type to **Circle**
   - Drag `Accessibility_Rating` to Color
   - Drag `Venue_Name` to Label
   - **Color scale:** Red (low) → Yellow (mid) → Green (high)
   - **Size:** Fixed or by `Accessibility_Rating`

4. **Filters (add to dashboard):**
   - `Venue_Category` (Hotel / Restaurant)
   - `Has_Braille_Signage` (TRUE/FALSE)
   - `Wheelchair_Accessible_Entrance` (TRUE/FALSE)
   - `Year` (2022, 2023, 2024)
   - `Neighborhood` (multi-select)

5. **Tooltip:**
   ```
   <Venue_Name>
   Category: <Venue_Category>
   Accessibility: <Accessibility_Rating>
   Features:
   - Braille: <Has_Braille_Signage>
   - Wheelchair: <Wheelchair_Accessible_Entrance>
   - Metro Distance: <Distance_to_Metro> miles
   ```

### Sheet 2: Hotel Pricing Trends (Line Chart)

1. **Drag `Date` to Columns** (continuous)
2. **Drag `Daily_Rate` to Rows** (AVG)
3. **Drag `Venue_Name` to Color** (shows separate line per hotel)
4. **Filter:** `Venue_Category = 'Hotel'`
5. **Highlight Cherry Blossom Season:**
   - Add reference band: March 25 - April 10
   - Color: light pink with annotation "Cherry Blossom +40%"

### Sheet 3: Accessibility Improvement (Bar Chart)

1. **Rows:** `Venue_Name`
2. **Columns:** `Accessibility_Rating` (AVG)
3. **Color:** `Year` (discrete)
4. **Filter:** Side-by-side bars showing 2022 vs 2024
5. **Sort:** By 2024 rating descending

### Sheet 4: Restaurant Noise Levels (Heatmap)

1. **Columns:** `Day_of_Week`
2. **Rows:** `Venue_Name`
3. **Color:** `Noise_Level_Rating` (AVG)
4. **Filter:** `Venue_Category = 'Restaurant'`
5. **Color scale:** Green (quiet) → Red (loud)

### Dashboard Layout:

```
+----------------------------------+----------------------------------+
|                                  |                                  |
|   Accessibility Map (large)      |   Filters Panel                  |
|   (symbol map with venue pins)   |   - Venue Category               |
|                                  |   - Year Slider                  |
|                                  |   - Has Braille                  |
|                                  |   - Wheelchair Access            |
+----------------------------------+----------------------------------+
|                                  |                                  |
|   Hotel Pricing Trends           |   Accessibility Improvement      |
|   (line chart over time)         |   (bar chart 2022 vs 2024)       |
|                                  |                                  |
+----------------------------------+----------------------------------+
```

### Dashboard Actions (Optional for Phase 2):

1. **Click venue on map → filter other sheets**
2. **Hover tooltip → show details**
3. **Year slider → update all visualizations**

---

## Step 5: Get Dashboard ID for UI Integration

1. **Open the dashboard** in Tableau Next

2. **Get Dashboard UUID from URL:**
   ```
   https://<instance>.my.salesforce.com/.../dashboard/<DASHBOARD_ID>
   ```
   Copy the `DASHBOARD_ID` value

3. **Update `dashboardConfig.ts`:**
   ```typescript
   {
     id: 'tourism',
     label: 'DC Accessible Tourism',
     tableauDashboardId: '<PASTE_DASHBOARD_ID_HERE>',  // ← Replace placeholder
     semanticModelId: 'DC_Tourism_TimeSeries__dlm',
     ...
   }
   ```

---

## Step 6: Test Agent Queries Against Dashboard

### From Agentforce Builder:

1. Set context variables:
   ```json
   {
     "targetEntityId": "DC_Tourism_TimeSeries__dlm",
     "targetEntityType": "sdm",
     "analyticsTabId": "<DASHBOARD_ID>"
   }
   ```

2. **Test drill-down questions:**
   - **Q1:** "Which hotels have braille signage?"
     - Expected: List of hotel names with `Has_Braille_Signage = TRUE`
   
   - **Q2:** "How has accessibility improved since 2022?"
     - Expected: "Hotel accessibility ratings increased by an average of 32 points from 2022 to 2024..."
   
   - **Q3:** "Show me hotels within 0.5 miles of Metro with accessible rooms"
     - Expected: Filtered list with `Distance_to_Metro < 0.5` AND `Wheelchair_Accessible_Entrance = TRUE`
   
   - **Q4:** "Which neighborhood has the most accessible restaurants?"
     - Expected: Aggregation by `Neighborhood`, ranked by avg `Accessibility_Rating` where `Venue_Category = 'Restaurant'`
   
   - **Q5:** "When are hotel prices highest?"
     - Expected: "Hotel prices peak during Cherry Blossom season (late March to early April) with rates 40% higher, and July 4th week with rates 50% higher"

3. **Verify visualization filters:**
   - Ask: "Filter to only show hotels"
   - Expected: Agent calls `CreateUpdateVisualization` action with filter `Venue_Category = 'Hotel'`
   - Dashboard updates to show only hotels

---

## Troubleshooting

### Issue: "Can't show visualization" / `postCdpQuerySql failed`

**Cause:** Dashboard viz tiles can't query the semantic model from embedded context.

**Fix:**
1. Open dashboard in Tableau Next authoring mode
2. For each viz tile, check **Data Source** connection
3. Re-bind tiles to the correct DMO: `DC_Tourism_TimeSeries__dlm`
4. **Republish** the dashboard

### Issue: Agent says "I need more context"

**Cause:** Agent requires both `targetEntityId` AND `analyticsTabId` to be set.

**Fix:**
1. Ensure you've opened a dashboard FIRST before querying
2. Pass both variables in the API call:
   ```json
   {
     "targetEntityId": "DC_Tourism_TimeSeries__dlm",
     "analyticsTabId": "<DASHBOARD_ID>"
   }
   ```

### Issue: Agent returns wrong numbers

**Cause:** Field descriptions are empty or missing in Data 360.

**Fix:**
1. Go to: Data Cloud → Semantic Models → `DC_Tourism_TimeSeries__dlm` → Edit
2. For EACH field, paste the description from `docs/dc-tourism-timeseries-semantic-model-fields.md`
3. Save and re-test

---

## Success Criteria

✅ **Data Cloud:**
- CSV uploaded successfully (12,216 records)
- DMO created with correct field types
- Semantic model active and queryable

✅ **Tableau Next:**
- Dashboard renders with map, charts, filters
- No "Can't show visualization" errors
- Filters work (Venue_Category, Year, Has_Braille_Signage)

✅ **Agentforce:**
- Agent answers 10+ sample questions correctly
- No visual language in responses
- Numbers stated with context
- Time-series queries work (2022 vs 2024)
- Geographic queries work (neighborhoods, Metro proximity)

---

## Next Steps After Dashboard is Ready

1. **Test the dashboard manually** (click filters, verify data shows correctly)
2. **Test agent queries** in Agentforce Builder with `analyticsTabId` set
3. **Record Dashboard ID** from URL
4. **Update `dashboardConfig.ts`** with real Dashboard ID
5. **Wire up UI** to use dashboard dropdown selector
6. **Deploy UI Bundle** and test voice interaction end-to-end

---

## Files Reference

- **CSV Data:** `scripts/dc_tourism_timeseries.csv` (12,216 records)
- **Field Descriptions:** `docs/dc-tourism-timeseries-semantic-model-fields.md`
- **Dashboard Config:** `force-app/.../vizvoice/src/lib/dashboardConfig.ts`
- **This Guide:** `DATA_CLOUD_SETUP.md`
