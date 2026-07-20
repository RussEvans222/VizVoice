# Hotels Table Field Descriptions

**Source DMO:** `dc_tourism_hotels_timeseries__dll` (or similar)  
**Total Fields:** 37  
**Purpose:** Copy-paste these descriptions into Data 360 semantic model builder for the HOTELS data source

---

## Field 1: Record_ID
**Type:** Text  
**Description:** Unique identifier for each hotel record, formed from venue ID and date (e.g., "HOTEL_WATERGATE_2022-01-01"). Primary key for the table.

---

## Field 2: Venue_ID
**Type:** Text  
**Description:** Unique venue identifier code (e.g., "HOTEL_WATERGATE", "HOTEL_HAY_ADAMS"). This is the JOIN KEY used to relate Hotels and Restaurants tables together. Use to group records by venue.

---

## Field 3: Venue_Name
**Type:** Text  
**Description:** Full name of the hotel (e.g., "The Watergate Hotel", "Grand Hyatt Washington"). Display name for user-facing results.

---

## Field 4: Venue_Category
**Type:** Text  
**Description:** Always "Hotel" for records in this table. Use this field to distinguish between Hotels and Restaurants in cross-table queries.

---

## Field 5: Subcategory
**Type:** Text  
**Description:** Fine-grained hotel classification: Luxury, Boutique, Business, Historic, Convention, Trendy, Modern, Mid_Range. Use for filtering and comparisons within hotel category.

---

## Field 6: Latitude
**Type:** Number  
**Description:** Geographic latitude in decimal degrees (e.g., 38.8973 for Foggy Bottom). Use for map visualizations and proximity calculations.

---

## Field 7: Longitude
**Type:** Number  
**Description:** Geographic longitude in decimal degrees (e.g., -77.0566 for Foggy Bottom). Use for map visualizations and proximity calculations.

---

## Field 8: Street_Address
**Type:** Text  
**Description:** Full street address (currently empty; reserved for future use).

---

## Field 9: Neighborhood
**Type:** Text  
**Description:** DC neighborhood name (e.g., "Foggy Bottom", "Georgetown", "Penn Quarter", "Dupont Circle"). Use for geographic grouping and filtering.

---

## Field 10: Ward
**Type:** Text  
**Description:** DC Ward number (1-8) for administrative grouping. Use for ward-level analysis and filled map visualizations.

---

## Field 11: Zip_Code
**Type:** Text  
**Description:** Five-digit zip code (e.g., "20037"). Use for regional filtering and analysis.

---

## Field 12: Distance_to_Metro
**Type:** Number  
**Description:** Distance in miles to the nearest accessible Metro station. Lower values indicate better transit access. Use for proximity-based queries like "hotels within 0.5 miles of Metro".

---

## Field 13: Nearest_Metro_Station
**Type:** Text  
**Description:** Name of the nearest Metro station (e.g., "Metro_Center", "Dupont Circle"). Use for transit routing and accessibility analysis.

---

## Field 14: Metro_Line
**Type:** Text  
**Description:** Metro line color serving the nearest station (e.g., "Red", "Blue", "Orange"). Use for transit map visualizations.

---

## Field 15: Date
**Type:** Date  
**Description:** Full date in YYYY-MM-DD format (e.g., "2024-06-15"). Hotels have daily records from 2022-01-01 to 2024-12-31 (1,096 days per hotel). Use for time-series queries and trend analysis.

---

## Field 16: Day_of_Week
**Type:** Text  
**Description:** Day name (Monday, Tuesday, etc.). Use to identify weekly patterns (e.g., weekend vs. weekday occupancy).

---

## Field 17: Month
**Type:** Text  
**Description:** Full month name (January, February, etc.). Use for seasonal trend analysis like Cherry Blossom season pricing spikes.

---

## Field 18: Year
**Type:** Number  
**Description:** Four-digit year (2022, 2023, or 2024). Use for year-over-year comparisons and tracking the 2022-2024 accessibility transformation story.

---

## Field 19: Is_Weekend
**Type:** Boolean  
**Description:** TRUE if the date falls on Saturday or Sunday, FALSE otherwise. Use to filter weekend vs. weekday patterns in occupancy and pricing.

---

## Field 20: Is_Holiday
**Type:** Boolean  
**Description:** TRUE if the date is a federal holiday or peak tourism event. Use to identify demand spikes and pricing premiums.

---

## Field 21: Season
**Type:** Text  
**Description:** Season name: Winter, Spring, Summer, or Fall. Use for seasonal analysis of occupancy and accessibility room availability.

---

## Field 22: Tourist_Season
**Type:** Text  
**Description:** Tourism demand level: "High" (peak season like Cherry Blossom, July 4th), "Medium" (shoulder season), or "Low" (off-season like winter). Use to understand seasonal pricing and availability patterns.

---

## Field 23: Has_Braille_Signage
**Type:** Boolean  
**Description:** TRUE if hotel has braille signage (elevator buttons, room numbers). Critical feature for blind travelers. Many hotels added this feature in 2023 as part of the DC Accessible Capital Initiative.

---

## Field 24: Has_Large_Print_Materials
**Type:** Boolean  
**Description:** TRUE if hotel provides large-print brochures, signage, or key cards for low-vision guests. Often paired with braille signage (hotels that add braille typically add large print too).

---

## Field 25: Has_Audio_Tour
**Type:** Boolean  
**Description:** Currently FALSE for all hotels (this feature is more common in museums). Reserved for future use if hotels add audio-guided property tours.

---

## Field 26: Has_Tactile_Maps
**Type:** Boolean  
**Description:** TRUE if hotel provides 3D tactile maps or tactile room number plates. Hotels added this feature during 2023-2024 renovations. Use to identify hotels with advanced visual accessibility features.

---

## Field 27: Guide_Dog_Friendly
**Type:** Boolean  
**Description:** TRUE if service animals (guide dogs) are permitted. Federal law requires this for most hotels; use to confirm compliance.

---

## Field 28: Wheelchair_Accessible_Entrance
**Type:** Boolean  
**Description:** TRUE if hotel has a ramp or level entrance (no steps). Critical for wheelchair users and stroller access. Most hotels in dataset are TRUE.

---

## Field 29: Has_Elevator
**Type:** Boolean  
**Description:** TRUE if multi-story hotel has an elevator. Most hotels are TRUE. Use for mobility accessibility filtering.

---

## Field 30: Wheelchair_Accessible_Restrooms
**Type:** Boolean  
**Description:** TRUE if hotel has ADA-compliant public restrooms with grab bars and adequate space. Correlates with accessible entrance and elevator availability.

---

## Field 31: Daily_Rate
**Type:** Number  
**Description:** Hotel room rate in USD for this date. Varies with seasonal demand: Cherry Blossom season (late March-early April) shows +40% premium, July 4th week shows +50% premium, winter months show -20% discount. Use for pricing trend analysis and affordability filtering. HOTEL-SPECIFIC FIELD (not in Restaurants table).

---

## Field 32: Occupancy_Rate
**Type:** Number  
**Description:** Percentage of hotel rooms occupied (0-100). Higher during peak tourism seasons (Cherry Blossom, July 4th, summer months). Use for demand analysis and capacity planning. HOTEL-SPECIFIC FIELD (not in Restaurants table).

---

## Field 33: Accessibility_Room_Available
**Type:** Boolean  
**Description:** TRUE if accessible hotel rooms are available for booking on this date. Availability drops significantly during peak seasons (Cherry Blossom drops to 30% availability, July 4th drops to 35% availability). This is a KEY metric for the 2022-2024 story: availability improved from 30% baseline in 2022 to 70% baseline in 2024. HOTEL-SPECIFIC FIELD (not in Restaurants table).

---

## Field 34: Accessibility_Rating
**Type:** Number  
**Description:** Accessibility score from 1-100 based on user reviews and staff audits. KEY METRIC for the 2022-2024 story arc: hotel ratings improved by an average of 32 points from 2022 (avg 65) to 2024 (avg 97) due to the DC Accessible Capital Initiative. Higher scores indicate more accessible hotels. Use for filtering, ranking, and year-over-year improvement analysis.

---

## Field 35: Overall_Rating
**Type:** Number  
**Description:** General user rating from 1.0 to 5.0 (TripAdvisor-style). Correlates positively with accessibility rating (accessible hotels tend to be better maintained overall). Use for quality filtering.

---

## Field 36: Last_Verified_Date
**Type:** Date  
**Description:** Date when accessibility information was last verified (monthly staff reports). Use to assess data freshness; recent verification (within 6 months) indicates higher confidence. Typically updated on the first of each month.

---

## Field 37: Verified_By
**Type:** Text  
**Description:** Source of last verification: "Staff_Report" (hotel staff submission, higher confidence), "User_Review" (guest feedback), or "Third_Party_Audit" (independent assessment). Staff reports are most reliable for accuracy.

---

## Summary

**Total Fields:** 37  
**Shared with Restaurants:** Fields 1-30 (identical structure for joins)  
**Hotel-Specific:** Fields 31-33 (Daily_Rate, Occupancy_Rate, Accessibility_Room_Available)  
**Common Quality Metrics:** Fields 34-37 (Accessibility_Rating, Overall_Rating, verification fields)

**Key Story Arc Fields:**
- `Accessibility_Rating` - Shows 32-point improvement 2022→2024
- `Accessibility_Room_Available` - Shows availability improvement from 30% to 70%
- `Has_Braille_Signage`, `Has_Tactile_Maps` - Feature adoption dates track 2023 initiative
- `Daily_Rate` - Seasonal pricing patterns (Cherry Blossom +40%, July 4th +50%)
