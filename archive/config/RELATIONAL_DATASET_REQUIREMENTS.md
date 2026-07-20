# Relational Dataset Requirements — DC Accessible Tourism

**Date:** 2026-07-19  
**Status:** User directive to do it right the first time  
**Current State:** Combined CSV uploaded, needs to be deleted and replaced

---

## User Requirements

### Architecture Decision
**TWO separate tables, ONE semantic model**

- **Table 1:** Hotels (time-series, daily records)
- **Table 2:** Restaurants (time-series, weekly records)
- **Relationship:** Both tables share common dimension fields (Venue_ID, geographic data) to enable joins in the semantic model
- **Expansion Path:** Can add Museums table, Parks table, Transit Stations table later without restructuring

### Why This Matters
- **Relational integrity:** Proper star schema with shared dimensions
- **Different granularity:** Hotels need daily data (pricing fluctuates), restaurants need weekly (less volatile)
- **Semantic model flexibility:** Data 360 can join on Venue_ID and query across both tables
- **Story for demo:** "We built this to be expandable — watch how we can add more venue types"
- **Agent query richness:** "Show me hotels and restaurants in Georgetown" requires cross-table join

---

## User Asks — Documented

### 1. Delete Current Combined Data Stream
**Action:** User will manually delete the `dc_tourism_timeseries.csv` Data Stream in the Data Cloud UI

**Reason:** Combined CSV with NULL values doesn't support relational modeling or future expansion

---

### 2. Generate Two Separate CSVs with Shared Schema

#### Table 1: Hotels Time-Series
**File:** `scripts/dc_tourism_hotels_timeseries.csv`

**Records:** 10 hotels × 1,096 days (2022-01-01 to 2024-12-31) = **10,960 records**

**Schema:**
- **Shared dimension fields:** `Venue_ID`, `Venue_Name`, `Venue_Category`, `Latitude`, `Longitude`, `Neighborhood`, `Ward`, `Zip_Code`, `Distance_to_Metro`, `Nearest_Metro_Station`
- **Time fields:** `Date`, `Day_of_Week`, `Month`, `Year`, `Is_Weekend`, `Is_Holiday`, `Season`, `Tourist_Season`
- **Accessibility features:** `Has_Braille_Signage`, `Has_Large_Print_Materials`, `Has_Tactile_Maps`, `Wheelchair_Accessible_Entrance`, `Has_Elevator`, `Guide_Dog_Friendly`
- **Hotel-specific metrics:** `Daily_Rate`, `Occupancy_Rate`, `Accessibility_Room_Available`, `Subcategory` (Luxury, Boutique, etc.)
- **Quality metrics:** `Accessibility_Rating`, `Overall_Rating`, `Last_Verified_Date`, `Verified_By`

**Key:** `Record_ID` = `{Venue_ID}_{Date}` (e.g., `HOTEL_WATERGATE_2022-01-01`)

---

#### Table 2: Restaurants Time-Series
**File:** `scripts/dc_tourism_restaurants_timeseries.csv`

**Records:** 8 restaurants × 157 weeks (2022-01-01 to 2024-12-31, weekly snapshots) = **1,256 records**

**Schema:**
- **Shared dimension fields:** Same as Hotels (for join compatibility)
- **Time fields:** Same as Hotels (but one record per week, not daily)
- **Accessibility features:** Same as Hotels
- **Restaurant-specific metrics:** `Average_Wait_Time`, `Reservations_Available`, `Noise_Level_Rating`, `Price_Range` ($$), `Subcategory` (American, Ethiopian, etc.)
- **Quality metrics:** Same as Hotels

**Key:** `Record_ID` = `{Venue_ID}_{Date}` (e.g., `REST_FOUNDING_FARMERS_2022-01-07`)

---

### 3. Data Cloud Setup — Two Data Streams, One Semantic Model

#### Step 1: Upload Hotels CSV
- Data Cloud → Data Streams → New → CSV Upload
- File: `dc_tourism_hotels_timeseries.csv`
- Category: **Custom**
- Primary Key: `Record_ID`
- DMO Name: `DC_Tourism_Hotels__dlm`

#### Step 2: Upload Restaurants CSV
- Data Cloud → Data Streams → New → CSV Upload
- File: `dc_tourism_restaurants_timeseries.csv`
- Category: **Custom**
- Primary Key: `Record_ID`
- DMO Name: `DC_Tourism_Restaurants__dlm`

#### Step 3: Create Unified Semantic Model
- Data Cloud → Semantic Models → New Semantic Model
- Name: `DC_Tourism_TimeSeries__dlm`
- **Add both DMOs as sources:**
  - Source 1: `DC_Tourism_Hotels__dlm`
  - Source 2: `DC_Tourism_Restaurants__dlm`
- **Define relationship:** Join on `Venue_ID` (shared dimension)
- **Result:** Agent can query across both tables seamlessly

---

### 4. Enhanced Agent Questions (Cross-Table Queries)

With relational structure, the agent can now answer:

#### Cross-Category Queries
- **"Show me all accessible venues in Georgetown"** → JOIN Hotels + Restaurants WHERE Neighborhood = 'Georgetown' AND Accessibility_Rating > 80
- **"Which neighborhood has the most accessible hotels and restaurants combined?"** → GROUP BY Neighborhood, COUNT(*) across both tables
- **"Compare hotel and restaurant accessibility in Foggy Bottom"** → Separate aggregations, then compare

#### Temporal Comparisons Across Categories
- **"Did hotels or restaurants improve accessibility faster from 2022 to 2024?"** → Calculate delta per category, compare
- **"Which venue type benefited most from the 2023 Accessible Capital Initiative?"** → Compare improvement slopes

#### Geographic Proximity Queries
- **"Show me accessible restaurants within 0.5 miles of accessible hotels"** → Spatial join on Lat/Long across tables
- **"Which Metro stations have both accessible hotels AND restaurants nearby?"** → GROUP BY Nearest_Metro_Station with JOIN

#### Feature Correlation Across Types
- **"Do hotels with braille signage tend to be near restaurants with braille menus?"** → Geographic + feature clustering analysis
- **"Which neighborhoods lead in both hotel and restaurant accessibility?"** → Cross-table aggregation

#### Budget Planning Queries
- **"Show me neighborhoods with affordable accessible hotels and mid-range accessible restaurants"** → Multi-table filter: Daily_Rate < 200 AND Price_Range = '$$' AND Accessibility_Rating > 75

---

### 5. Data Generation Script Updates

**Current script:** `scripts/generate_dc_tourism_data.py`

**Required changes:**
1. **Split output:** Generate two separate CSV files instead of one combined
2. **Schema alignment:** Ensure shared dimension fields have identical names/types across both tables
3. **Remove NULL padding:** Hotels CSV should NOT have restaurant-specific columns, and vice versa
4. **Verify join compatibility:** Test that Venue_ID format is identical in both (e.g., `HOTEL_WATERGATE` vs `REST_FOUNDING_FARMERS`)

**Output files:**
- `scripts/dc_tourism_hotels_timeseries.csv` (10,960 records)
- `scripts/dc_tourism_restaurants_timeseries.csv` (1,256 records)

---

### 6. Semantic Model Field Descriptions

**Current doc:** `docs/dc-tourism-timeseries-semantic-model-fields.md`

**Required updates:**
- Add section: "Relational Model Structure" explaining the two-table design
- Add note: "Hotels and Restaurants tables can be joined on Venue_ID for cross-category queries"
- Update field descriptions to indicate which fields are shared dimensions vs. table-specific metrics
- Add example cross-table queries in the sample questions section

---

### 7. Tableau Dashboard Enhancements

With relational data, dashboards can now show:

#### Dashboard 1: Cross-Category Accessibility Map
- **Symbol map:** Show BOTH hotels and restaurants on same map
- **Color:** By Venue_Category (blue = hotel, green = restaurant)
- **Size:** By Accessibility_Rating
- **Filter:** Accessibility features apply to both tables

#### Dashboard 2: Neighborhood Comparison
- **Dual-axis chart:** Hotels (bar) vs Restaurants (line) by Neighborhood
- **Metric:** Average Accessibility_Rating
- **Insight:** Which neighborhoods excel in both categories vs. specialize

#### Dashboard 3: Temporal Trends (Cross-Category)
- **Stacked area chart:** Hotels + Restaurants accessibility improvement over time
- **Line chart:** Separate lines per category showing improvement velocity
- **Reference line:** Mark the 2023 Accessible Capital Initiative start date

---

### 8. Agent Context Updates

**File:** `force-app/main/default/uiBundles/vizvoice/src/lib/dashboardConfig.ts`

**Update the tourism dashboard config:**
```typescript
{
  id: 'tourism',
  label: 'DC Accessible Tourism',
  tableauDashboardId: 'dc_tourism_dashboard_uuid',
  semanticModelId: 'DC_Tourism_TimeSeries__dlm',
  semanticModelType: 'sdm',
  agentContext: `You are analyzing Washington DC accessible tourism data from 2022-2024.

RELATIONAL DATA STRUCTURE:
- Two related tables: Hotels (daily records) and Restaurants (weekly records)
- Both share common dimensions: Venue_ID, geographic data, accessibility features
- You can query across both tables using Venue_ID as the join key

STORY ARC (2022-2024): DC underwent a major accessibility transformation:
- 2022 Baseline: Hotels avg 65 accessibility rating, restaurants avg 55
- 2023 Advocacy: DC Accessible Capital Initiative launched, federal funding
- 2024 Transformation: Hotels avg 97 rating (+32 points), restaurants avg 72 (+17 points)

CROSS-CATEGORY INSIGHTS:
- Hotels improved faster than restaurants (32 vs 17 point improvement)
- Georgetown: restaurants lagged in 2022-2023, caught up in 2024
- Foggy Bottom: both categories maintained high accessibility throughout
- U Street: restaurants led accessibility, hotels followed

QUERY CAPABILITIES:
- Cross-table joins: "Show me neighborhoods with both accessible hotels and restaurants"
- Category comparisons: "Did hotels or restaurants improve faster?"
- Geographic proximity: "Accessible restaurants within 0.5 miles of accessible hotels"
- Temporal analysis: "Which category benefited most from the 2023 initiative?"

CRITICAL:
- Use ordinal language ("highest-rated", "nearest") not visual metaphors
- State numbers with context ("Hotels improved 32 points, nearly double the 17-point restaurant improvement")
- Explain cross-category relationships when relevant
- Handle different granularity: hotels have daily data, restaurants have weekly data
`,
  description: 'Washington DC hotels and restaurants with accessibility features, pricing trends, and 2022-2024 transformation story. Relational model supports cross-category queries.',
}
```

---

## Success Criteria

✅ **Data Structure:**
- Two separate CSV files with no NULL padding for missing columns
- Shared dimension fields have identical schemas across both tables
- Venue_ID format is consistent (join-compatible)
- Total records: 12,216 (10,960 hotels + 1,256 restaurants)

✅ **Data Cloud Setup:**
- Two separate Data Streams created
- One unified Semantic Model with both DMOs as sources
- Relationship defined on Venue_ID
- Both tables queryable independently AND via join

✅ **Agent Capabilities:**
- Can answer hotel-only questions: "Which hotel has the best accessibility rating?"
- Can answer restaurant-only questions: "Which restaurants have quiet hours?"
- Can answer cross-table questions: "Show me neighborhoods with both accessible hotels and restaurants"
- Can compare categories: "Did hotels or restaurants improve faster?"
- Can perform spatial joins: "Restaurants near accessible hotels"

✅ **Tableau Dashboards:**
- Symbol map shows both venue types on one map
- Dual-axis charts compare categories
- Filters apply across both tables
- Tooltips indicate venue type

✅ **Expandability:**
- Can add Museums table later without restructuring Hotels or Restaurants
- Can add Parks table with same shared dimensions
- Semantic model accommodates new tables via same Venue_ID join pattern

---

## Current Status

- [x] User identified issue with combined CSV approach
- [x] User decided to delete combined Data Stream
- [ ] Regenerate two separate CSVs with relational structure
- [ ] Update data generation script
- [ ] Update semantic model field descriptions doc
- [ ] Upload Hotels CSV to Data Cloud
- [ ] Upload Restaurants CSV to Data Cloud
- [ ] Create unified semantic model with relationship
- [ ] Test cross-table queries in Data 360 UI
- [ ] Build Tableau dashboards with dual-category visualizations
- [ ] Update agent context in dashboardConfig.ts
- [ ] Test enhanced agent questions
- [ ] Verify expandability by discussing Phase 2 (Museums table addition)

---

## Next Immediate Actions

1. **User:** Delete the `dc_tourism_timeseries.csv` Data Stream in Data Cloud UI
2. **Claude:** Update `generate_dc_tourism_data.py` script to output two separate CSVs
3. **Claude:** Regenerate both CSVs with proper relational structure
4. **Claude:** Update `docs/dc-tourism-timeseries-semantic-model-fields.md` with relational model docs
5. **Claude:** Update `DATA_CLOUD_SETUP.md` with two-table upload instructions
6. **User:** Upload both CSVs and create semantic model with relationship
7. **Both:** Test cross-table queries and verify join works correctly
