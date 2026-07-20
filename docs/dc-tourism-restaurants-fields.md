# Restaurants Table Field Descriptions

**Source DMO:** `dc_tourism_restaurants_timeseries__dll` (or similar)  
**Total Fields:** 38  
**Purpose:** Copy-paste these descriptions into Data 360 semantic model builder for the RESTAURANTS data source

---

## Field 1: Record_ID
**Type:** Text  
**Description:** Unique identifier for each restaurant record, formed from venue ID and date (e.g., "REST_FOUNDING_FARMERS_2022-01-07"). Primary key for the table.

---

## Field 2: Venue_ID
**Type:** Text  
**Description:** Unique venue identifier code (e.g., "REST_FOUNDING_FARMERS", "REST_OLD_EBBITT"). This is the JOIN KEY used to relate Hotels and Restaurants tables together. Use to group records by venue.

---

## Field 3: Venue_Name
**Type:** Text  
**Description:** Full name of the restaurant (e.g., "Founding Farmers", "Old Ebbitt Grill", "Maydan"). Display name for user-facing results.

---

## Field 4: Venue_Category
**Type:** Text  
**Description:** Always "Restaurant" for records in this table. Use this field to distinguish between Hotels and Restaurants in cross-table queries.

---

## Field 5: Subcategory
**Type:** Text  
**Description:** Fine-grained cuisine classification: American, Ethiopian, Vietnamese, Lebanese, Fine_Dining. Use for filtering and discovering restaurant types.

---

## Field 6: Latitude
**Type:** Number  
**Description:** Geographic latitude in decimal degrees (e.g., 38.9017 for Foggy Bottom). Use for map visualizations and proximity calculations.

---

## Field 7: Longitude
**Type:** Number  
**Description:** Geographic longitude in decimal degrees (e.g., -77.0405 for Foggy Bottom). Use for map visualizations and proximity calculations.

---

## Field 8: Street_Address
**Type:** Text  
**Description:** Full street address (currently empty; reserved for future use).

---

## Field 9: Neighborhood
**Type:** Text  
**Description:** DC neighborhood name (e.g., "Foggy Bottom", "U Street", "Penn Quarter", "14th Street"). Use for geographic grouping and filtering.

---

## Field 10: Ward
**Type:** Text  
**Description:** DC Ward number (1-8) for administrative grouping. Use for ward-level analysis and filled map visualizations.

---

## Field 11: Zip_Code
**Type:** Text  
**Description:** Five-digit zip code (e.g., "20009"). Use for regional filtering and analysis.

---

## Field 12: Distance_to_Metro
**Type:** Number  
**Description:** Distance in miles to the nearest accessible Metro station. Lower values indicate better transit access. Use for proximity-based queries like "restaurants within 0.5 miles of Metro".

---

## Field 13: Nearest_Metro_Station
**Type:** Text  
**Description:** Name of the nearest Metro station (e.g., "Metro_Center", "U Street"). Use for transit routing and accessibility analysis.

---

## Field 14: Metro_Line
**Type:** Text  
**Description:** Metro line color serving the nearest station (e.g., "Red", "Green", "Yellow"). Use for transit map visualizations.

---

## Field 15: Date
**Type:** Date  
**Description:** Full date in YYYY-MM-DD format (e.g., "2024-06-15"). Restaurants have weekly snapshot records from 2022-01-01 to 2024-12-31 (157 weeks per restaurant, sampled once per week). Use for time-series queries and trend analysis.

---

## Field 16: Day_of_Week
**Type:** Text  
**Description:** Day name (Monday, Tuesday, etc.). Use to identify weekly patterns (e.g., weekend vs. weekday wait times and noise levels).

---

## Field 17: Month
**Type:** Text  
**Description:** Full month name (January, February, etc.). Use for seasonal trend analysis.

---

## Field 18: Year
**Type:** Number  
**Description:** Four-digit year (2022, 2023, or 2024). Use for year-over-year comparisons and tracking the 2022-2024 accessibility transformation story.

---

## Field 19: Is_Weekend
**Type:** Boolean  
**Description:** TRUE if the date falls on Saturday or Sunday, FALSE otherwise. Use to filter weekend vs. weekday patterns in wait times and noise levels.

---

## Field 20: Is_Holiday
**Type:** Boolean  
**Description:** Currently FALSE for most restaurant records (holidays affect hotels more than restaurants in this dataset). Use to identify special event periods.

---

## Field 21: Season
**Type:** Text  
**Description:** Season name: Winter, Spring, Summer, or Fall. Use for seasonal analysis of restaurant demand.

---

## Field 22: Tourist_Season
**Type:** Text  
**Description:** Tourism demand level: "High" (May-August tourist season) or "Low" (off-season). Restaurants show less dramatic seasonal variation than hotels.

---

## Field 23: Has_Braille_Signage
**Type:** Boolean  
**Description:** TRUE if restaurant has braille menus or signage. Critical feature for blind diners. Adoption increased from 15% in 2022 to 60% in 2024 as part of the DC Restaurant Association accessibility training program.

---

## Field 24: Has_Large_Print_Materials
**Type:** Boolean  
**Description:** TRUE if restaurant provides large-print menus for low-vision guests. Often paired with braille menus (restaurants that add braille typically add large print too).

---

## Field 25: Has_Audio_Tour
**Type:** Boolean  
**Description:** Currently FALSE for all restaurants (audio tours are not applicable for dining establishments). Reserved field.

---

## Field 26: Has_Tactile_Maps
**Type:** Boolean  
**Description:** Currently FALSE for most restaurants (tactile maps are more relevant for hotels and museums). Some fine dining establishments added tactile table layouts for blind diners.

---

## Field 27: Guide_Dog_Friendly
**Type:** Boolean  
**Description:** TRUE if service animals (guide dogs) are permitted. Federal law requires this for most restaurants; use to confirm compliance.

---

## Field 28: Wheelchair_Accessible_Entrance
**Type:** Boolean  
**Description:** TRUE if restaurant has a ramp or level entrance (no steps). Critical for wheelchair users. Adoption increased from 25% in 2022 to 60% in 2024. Older buildings (especially in Georgetown) lag due to historic preservation restrictions.

---

## Field 29: Has_Elevator
**Type:** Boolean  
**Description:** FALSE for most restaurants (many are single-story or have stairs-only second floors). Use for filtering accessible multi-level restaurants.

---

## Field 30: Wheelchair_Accessible_Restrooms
**Type:** Boolean  
**Description:** TRUE if restaurant has ADA-compliant restrooms with grab bars and adequate space. Typically correlates with accessible entrance availability.

---

## Field 31: Average_Wait_Time
**Type:** Number  
**Description:** Average wait time in minutes for a table without a reservation. Weekend wait times (25-35 minutes) are significantly higher than weekday wait times (10-20 minutes). Use to identify busy periods and recommend optimal visit times to users. RESTAURANT-SPECIFIC FIELD (not in Hotels table).

---

## Field 32: Reservations_Available
**Type:** Boolean  
**Description:** TRUE if reservations are currently available for this date/time. FALSE indicates high demand or no reservation system. Use to help users plan dining times and avoid long waits. RESTAURANT-SPECIFIC FIELD (not in Hotels table).

---

## Field 33: Noise_Level_Rating
**Type:** Number  
**Description:** Subjective noise level rating from 1 (very quiet, whisper-level conversation) to 5 (very loud, hard to hear across table). Weekend evenings typically rate 3-5, weekday lunches rate 1-3. CRITICAL metric for sensory-sensitive diners, including those with hearing aids, autism, or sensory processing disorders. Use for quiet dining recommendations. RESTAURANT-SPECIFIC FIELD (not in Hotels table).

---

## Field 34: Price_Range
**Type:** Text  
**Description:** Price indicator using dollar signs: "$" (budget, under $15/person), "$$" (moderate, $15-30/person), "$$$" (upscale, $30-60/person), "$$$$" (fine dining, $60+/person). Use for budget filtering and recommendations. RESTAURANT-SPECIFIC FIELD (not in Hotels table).

---

## Field 35: Accessibility_Rating
**Type:** Number  
**Description:** Accessibility score from 1-100 based on user reviews and staff audits. KEY METRIC for the 2022-2024 story arc: restaurant ratings improved by an average of 17 points from 2022 (avg 55) to 2024 (avg 72) due to the DC Restaurant Association accessibility training program. Note: Restaurants improved slower than hotels (+17 vs +32 points) due to historic building constraints and smaller budgets. Use for filtering, ranking, and year-over-year improvement analysis.

---

## Field 36: Overall_Rating
**Type:** Number  
**Description:** General user rating from 1.0 to 5.0 (TripAdvisor-style). Correlates positively with accessibility rating (accessible restaurants tend to have better overall service quality). Use for quality filtering.

---

## Field 37: Last_Verified_Date
**Type:** Date  
**Description:** Date when accessibility information was last verified (user reviews). Use to assess data freshness; recent verification (within 6 months) indicates higher confidence. Typically updated on the first of each month.

---

## Field 38: Verified_By
**Type:** Text  
**Description:** Source of last verification: "User_Review" (most common for restaurants, guest feedback), "Staff_Report" (restaurant staff submission), or "Third_Party_Audit" (independent assessment). User reviews are the primary source for restaurant accessibility data.

---

## Summary

**Total Fields:** 38  
**Shared with Hotels:** Fields 1-30 (identical structure for joins)  
**Restaurant-Specific:** Fields 31-34 (Average_Wait_Time, Reservations_Available, Noise_Level_Rating, Price_Range)  
**Common Quality Metrics:** Fields 35-38 (Accessibility_Rating, Overall_Rating, verification fields)

**Key Story Arc Fields:**
- `Accessibility_Rating` - Shows 17-point improvement 2022→2024 (slower than hotels due to building constraints)
- `Has_Braille_Signage` - Adoption increased from 15% to 60% (2023 training program impact)
- `Wheelchair_Accessible_Entrance` - Adoption increased from 25% to 60%
- `Noise_Level_Rating` - Critical for sensory-sensitive diners (weekend evenings louder)
- `Average_Wait_Time` - Demand indicator (weekends 2-3× weekday wait times)

**Cross-Table Query Notes:**
- Compare hotel vs restaurant accessibility improvements: Hotels +32 points, Restaurants +17 points
- Geographic queries: "Show accessible venues in Georgetown" works across both tables via `Venue_ID` join
- Neighborhood analysis: "Which neighborhood has both accessible hotels and quiet restaurants?" requires joining both tables
