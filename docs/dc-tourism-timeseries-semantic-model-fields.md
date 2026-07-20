# DC Tourism TimeSeries Semantic Model — Field Descriptions

**Model:** `DC_Tourism_TimeSeries__dlm`  
**Architecture:** Relational model with TWO tables joined on `Venue_ID`
- **Hotels Table:** 10,960 daily records (37 fields)
- **Restaurants Table:** 1,256 weekly records (38 fields)
- **Shared Dimensions:** Fields 1-30 identical across both tables (for joins)
- **Table-Specific Metrics:** Hotels (31-33), Restaurants (31-34)

**Purpose:** Paste these descriptions into the Data 360 semantic model builder UI for ALL 87 total fields (37 from Hotels + 38 from Restaurants + 12 computed cross-table fields).

> Field descriptions must be set in the **Data 360 semantic model builder UI**. They cannot be reliably pushed from the CLI onto an already-deployed semantic model.

---

## Field Count Summary

| Category | Count | Details |
|----------|-------|---------|
| **Shared Dimension Fields** | 34 | Fields 1-34 exist in BOTH Hotels and Restaurants tables with identical structure |
| **Hotel-Specific Fields** | 3 | Daily_Rate, Occupancy_Rate, Accessibility_Room_Available |
| **Restaurant-Specific Fields** | 4 | Average_Wait_Time, Reservations_Available, Noise_Level_Rating, Price_Range |
| **Total Unique Fields** | 41 | 34 shared + 7 table-specific |
| **Total Field Descriptions** | 38 | (34 shared fields + 3 hotel + 4 restaurant = 41, but 3 overlap with naming) |

**Data 360 UI Note:** When adding fields to the semantic model, you'll see:
- **37 fields from Hotels table** (34 shared + 3 hotel-specific)
- **38 fields from Restaurants table** (34 shared + 4 restaurant-specific)
- **Total: 75 field descriptions to paste** (some shared fields may only need one description if Data 360 merges them)

## How to Use This Document

1. **Upload both CSVs to Data Cloud** (Hotels DMO + Restaurants DMO)
2. **Create unified semantic model** with both DMOs as sources
3. **Define relationship:** JOIN on `Venue_ID`
4. **For each field below:** Copy the description and paste into Data 360 UI
5. **For shared fields:** Mark as available from BOTH sources (Hotels + Restaurants)
6. **For table-specific fields:** Mark source as Hotels-only OR Restaurants-only

---

## SHARED DIMENSION FIELDS (Both Hotels & Restaurants)

These fields exist in BOTH tables with identical structure. They enable cross-table queries and joins.

### Identifier Fields (Source: Both Tables)

| Field | Type | Description |
|-------|------|-------------|
| `Record_ID` | Text | Unique identifier for each record, formed from venue ID and date (e.g., "HOTEL_WATERGATE_2022-01-01" or "REST_FOUNDING_FARMERS_2024-12-28"). Primary key for the table. |
| `Venue_ID` | Text | **[JOIN KEY]** Unique venue identifier code (e.g., "HOTEL_WATERGATE", "REST_FOUNDING_FARMERS"). Use to group records by venue and to join Hotels and Restaurants tables together. |
| `Venue_Name` | Text | Full name of the venue (e.g., "The Watergate Hotel", "Founding Farmers"). Display name for user-facing results. |
| `Venue_Category` | Text | Type of venue: "Hotel" for lodging or "Restaurant" for dining establishments. Use this field to distinguish which table a record comes from in cross-table queries. |
| `Subcategory` | Text | Fine-grained classification. For hotels: Luxury, Boutique, Business, Historic, etc. For restaurants: American, Ethiopian, Vietnamese, Fine_Dining, etc. |

---

### Geographic Fields (Source: Both Tables)

| Field | Type | Description |
|-------|------|-------------|
| `Latitude` | Number | Geographic latitude in decimal degrees (e.g., 38.8973 for Foggy Bottom). Use for map visualizations and proximity calculations. |
| `Longitude` | Number | Geographic longitude in decimal degrees (e.g., -77.0566 for Foggy Bottom). Use for map visualizations and proximity calculations. |
| `Street_Address` | Text | Full street address (currently empty; reserved for future use). |
| `Neighborhood` | Text | DC neighborhood name (e.g., "Foggy Bottom", "Georgetown", "Penn Quarter", "U Street"). Use for geographic grouping and filtering. |
| `Ward` | Text | DC Ward number (1-8) for administrative grouping. Use for ward-level analysis and filled map visualizations. |
| `Zip_Code` | Text | Five-digit zip code (e.g., "20037"). Use for regional filtering and analysis. |
| `Distance_to_Metro` | Number | Distance in miles to the nearest accessible Metro station. Lower values indicate better transit access. Use for proximity-based queries. |
| `Nearest_Metro_Station` | Text | Name of the nearest Metro station (e.g., "Metro_Center", "Dupont Circle"). Use for transit routing and accessibility analysis. |
| `Metro_Line` | Text | Metro line color serving the nearest station (e.g., "Red", "Blue", "Orange"). Use for transit map visualizations. |

---

### Time Fields (Source: Both Tables)

| Field | Type | Description |
|-------|------|-------------|
| `Date` | Date | Full date in YYYY-MM-DD format (e.g., "2024-06-15"). Hotels have daily records; restaurants have weekly snapshots. Use for time-series queries and trend analysis. |
| `Day_of_Week` | Text | Day name (Monday, Tuesday, etc.). Use to identify weekly patterns (e.g., weekend vs. weekday demand). |
| `Month` | Text | Full month name (January, February, etc.). Use for seasonal trend analysis. |
| `Year` | Number | Four-digit year (2022, 2023, or 2024). Use for year-over-year comparisons and tracking the 2022-2024 accessibility transformation story. |
| `Is_Weekend` | Boolean | TRUE if the date falls on Saturday or Sunday, FALSE otherwise. Use to filter weekend vs. weekday patterns. |
| `Is_Holiday` | Boolean | TRUE if the date is a federal holiday or peak tourism event. Use to identify demand spikes. |
| `Season` | Text | Season name: Winter, Spring, Summer, or Fall. Use for seasonal analysis. |
| `Tourist_Season` | Text | Tourism demand level: "High" (peak season), "Medium" (shoulder season), or "Low" (off-season). Use to understand seasonal pricing and availability patterns. |

---

### Accessibility Features — Visual Impairment (Source: Both Tables)

| Field | Type | Description |
|-------|------|-------------|
| `Has_Braille_Signage` | Boolean | TRUE if venue has braille signage (elevator buttons, room numbers, or menus). Critical feature for blind travelers. |
| `Has_Large_Print_Materials` | Boolean | TRUE if venue provides large-print menus, brochures, or signage for low-vision guests. Often paired with braille. |
| `Has_Audio_Tour` | Boolean | TRUE if venue offers guided audio tours. Currently FALSE for all hotels and restaurants (museums would have this). |
| `Has_Tactile_Maps` | Boolean | TRUE if venue provides 3D tactile maps or tactile room number plates. Hotels added this feature during 2023-2024 renovations. |
| `Guide_Dog_Friendly` | Boolean | TRUE if service animals (guide dogs) are permitted. Federal law requires this for most venues; use to confirm compliance. |

---

### Accessibility Features — Mobility (Source: Both Tables)

| Field | Type | Description |
|-------|------|-------------|
| `Wheelchair_Accessible_Entrance` | Boolean | TRUE if venue has a ramp or level entrance (no steps). Critical for wheelchair users and stroller access. |
| `Has_Elevator` | Boolean | TRUE if multi-story venue has an elevator. Hotels typically TRUE; single-story restaurants may be FALSE. |
| `Wheelchair_Accessible_Restrooms` | Boolean | TRUE if venue has ADA-compliant restrooms with grab bars and adequate space. Correlates with accessible entrance for restaurants. |

---

### Common Quality Metrics (Source: Both Tables)

| Field | Type | Description |
|-------|------|-------------|
| `Accessibility_Rating` | Number | Accessibility score from 1-100 based on user reviews and staff audits. **Key metric for the 2022-2024 story arc**: ratings improved by 20-32 points on average from 2022 to 2024 due to the DC Accessible Capital Initiative. Higher scores indicate more accessible venues. Available for both hotels and restaurants. |
| `Overall_Rating` | Number | General user rating from 1.0 to 5.0 (TripAdvisor-style). Correlates positively with accessibility rating (accessible venues tend to be better maintained). Available for both hotels and restaurants. |
| `Last_Verified_Date` | Date | Date when accessibility information was last verified (monthly staff reports or user reviews). Use to assess data freshness; recent verification = higher confidence. Available for both hotels and restaurants. |
| `Verified_By` | Text | Source of last verification: "Staff_Report" (venue staff), "User_Review" (guest feedback), or "Third_Party_Audit" (independent assessment). Staff reports have higher confidence. Available for both hotels and restaurants. |

---

## TABLE-SPECIFIC FIELDS

These fields only exist in ONE table (either Hotels OR Restaurants), not both.

### Hotel-Specific Metrics (Source: Hotels Table ONLY)

| Field | Type | Description |
|-------|------|-------------|
| `Daily_Rate` | Number | Hotel room rate in USD for this date. Varies with seasonal demand (Cherry Blossom season +40%, July 4th week +50%, winter months -20%). Use for pricing trend analysis. This field exists ONLY in the Hotels table, NOT in Restaurants. |
| `Occupancy_Rate` | Number | Percentage of hotel rooms occupied (0-100). Higher during peak tourism seasons. Use for demand analysis and capacity planning. This field exists ONLY in the Hotels table, NOT in Restaurants. |
| `Accessibility_Room_Available` | Boolean | TRUE if accessible hotel rooms are available for booking on this date. Availability drops significantly during peak seasons (Cherry Blossom drops to 30%, July 4th drops to 35%). This field exists ONLY in the Hotels table, NOT in Restaurants. |

---

### Restaurant-Specific Metrics (Source: Restaurants Table ONLY)

| Field | Type | Description |
|-------|------|-------------|
| `Average_Wait_Time` | Number | Average wait time in minutes for a table without a reservation. Higher on weekends (25-35 minutes) and lower on weekdays (10-20 minutes). Use to identify busy periods and recommend optimal visit times. This field exists ONLY in the Restaurants table, NOT in Hotels. |
| `Reservations_Available` | Boolean | TRUE if reservations are currently available for this date/time. FALSE indicates high demand or no reservation system. Use to help users plan dining times. This field exists ONLY in the Restaurants table, NOT in Hotels. |
| `Noise_Level_Rating` | Number | Subjective noise level rating from 1 (very quiet, whisper-level conversation) to 5 (very loud, hard to hear across table). Typically higher on weekend evenings. Critical metric for sensory-sensitive diners, including those with hearing aids or autism. This field exists ONLY in the Restaurants table, NOT in Hotels. |
| `Price_Range` | Text | Price indicator using dollar signs: "$" (budget, under $15/person), "$$" (moderate, $15-30/person), "$$$" (upscale, $30-60/person), "$$$$" (fine dining, $60+/person). Use for budget filtering and recommendations. This field exists ONLY in the Restaurants table, NOT in Hotels. |


---

## Story Arc Context (for Agent Understanding)

This dataset tells the story of **Washington DC's accessibility transformation from 2022 to 2024**:

### 2022 Baseline
- Hotels averaged 65 accessibility rating (range 55-79)
- Only 30% of hotels had accessible rooms consistently available
- 15% of restaurants had braille menus, 25% had accessible entrances

### 2023 Advocacy Year
- DC Mayor announced "Accessible Capital Initiative" (fictional but realistic)
- Federal funding for accessibility upgrades
- Hotels began adding braille signage and tactile features (renovation dates visible in data)
- Restaurant association launched accessibility training (40% participation)

### 2024 Transformation
- Hotels averaged 97 accessibility rating (range 84-100) — **+32 points improvement**
- 70% of hotels have accessible rooms widely available
- 60% of restaurants have at least one accessibility feature
- Metro system completed elevator audio upgrades (reflected in proximity queries)

### Key Data Patterns to Highlight
- **Correlation:** Accessibility rating vs. overall rating (+0.6 correlation)
- **Price-accessibility:** Luxury hotels invest more, but mid-range hotels closed the gap by 2024
- **Seasonal impact:** Accessible room availability drops 40% during Cherry Blossom season
- **Neighborhood effects:** Downtown/Penn Quarter highest accessibility; Georgetown improved fastest 2023-2024
- **Feature clustering:** Venues with braille signage are 3x more likely to also have large-print materials

---

## Sample Agent Queries (Test These)

### Temporal Queries
1. "How has hotel accessibility changed since 2022?" → Should show +32 point improvement
2. "When did hotels start adding braille signage?" → Should identify 2023 as inflection point
3. "Which hotels improved the most from 2022 to 2024?" → Should rank by accessibility_rating delta

### Geographic Queries
4. "Which neighborhood has the most accessible restaurants?" → Should aggregate by neighborhood
5. "Show me hotels within 0.5 miles of Metro with braille signage" → Filter distance_to_metro < 0.5 AND has_braille_signage = TRUE

### Price & Availability Queries
6. "How much do hotel prices increase during Cherry Blossom season?" → Compare daily_rate March 25-April 10 vs. baseline
7. "Are accessible hotel rooms available during July 4th?" → Check accessibility_room_available for July 1-7

### Accessibility Feature Queries
8. "Which restaurants have both braille menus and accessible entrances?" → Filter has_braille_signage = TRUE AND wheelchair_accessible_entrance = TRUE
9. "Show me quiet restaurants (noise level < 3) with accessibility features" → Filter noise_level_rating < 3

### Comparative Queries
10. "Do accessible hotels cost more than average?" → Compare daily_rate grouped by accessibility_rating ranges

---

## Data Upload Instructions

1. **Upload CSV to Data Cloud:**
   ```bash
   sf data import --file dc_tourism_timeseries.csv \
     --target-org vizvoice-dev \
     --object C360_Semantic_Model_Extended_0ba
   ```

2. **Create Semantic Model in Data 360 UI:**
   - Navigate to: Data Cloud → Semantic Models → New Semantic Model
   - Name: `DC_Tourism_TimeSeries__dlm`
   - Source: `C360_Semantic_Model_Extended_0ba`
   - Add all fields from this document with descriptions

3. **Configure Agent in Agentforce Builder:**
   - Set `targetEntityId` variable: `DC_Tourism_TimeSeries__dlm`
   - Set `targetEntityType` variable: `sdm`
   - Update system prompt with story context (2022-2024 transformation)

4. **Test with VizVoice:**
   - Use dashboard dropdown to select "DC Tourism - Hotels & Restaurants"
   - Ask sample queries from section above
   - Verify agent uses correct semantic model and returns accurate results

---

## Notes

- **Restaurant records are weekly snapshots** (157 weeks × 8 restaurants = 1,256 records). Date filtering works but shows one data point per week, not daily.
- **Hotel records are daily** (1,096 days × 10 hotels = 10,960 records). Full time-series granularity.
- **NULL values:** Restaurant records have NULL for hotel-specific fields (Daily_Rate, Occupancy_Rate, Accessibility_Room_Available). Hotel records have NULL for restaurant-specific fields (Average_Wait_Time, Noise_Level_Rating).
- **Accessibility improvement is non-linear:** Some venues improved in 2023, others in 2024. The data reflects renovation timing and training participation.
- **Geographic coordinates are real:** Lat/long values are accurate for actual DC venues and can be verified on Google Maps.
