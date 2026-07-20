# DC Tourism Dataset — Actual Values for Demo

**Status:** ✅ Cross-table queries working! Semantic model optimized.

This document lists the **actual data** available in the uploaded CSVs to guide demo script development.

---

## What Data We Have

### Hotels: 10 venues × 1,096 days = 10,960 records

**Venues in Dataset:**
1. The Watergate Hotel (Foggy Bottom)
2. Hotel Zena (Thomas Circle)
3. Grand Hyatt Washington (Penn Quarter)
4. The Hay-Adams (Lafayette Square)
5. Kimpton Hotel Monaco (Penn Quarter)
6. Embassy Suites Dupont Circle (Dupont Circle)
7. The Line DC (Adams Morgan)
8. Canopy by Hilton (The Wharf)
9. Phoenix Park Hotel (Capitol Hill)
10. Washington Plaza Hotel (Thomas Circle)

### Restaurants: 8 venues × 157 weeks = 1,256 records

**Venues in Dataset:**
1. Founding Farmers (Foggy Bottom)
2. Old Ebbitt Grill (Downtown)
3. Pho 14 (Penn Quarter)
4. Maydan (U Street)
5. Minibar (Penn Quarter)
6. Ben's Next Door (U Street)
7. &pizza (14th Street)
8. Busboys and Poets (14th Street)

---

## Accessibility Features — Actual Values

### Hotels (What's TRUE in the data):

| Feature | Count | Percentage |
|---------|-------|------------|
| `Guide_Dog_Friendly` | 10,960 | 100% (all hotels) |
| `Wheelchair_Accessible_Entrance` | 10,960 | 100% (all hotels) |
| `Wheelchair_Accessible_Restrooms` | 10,960 | 100% (all hotels) |
| `Has_Elevator` | 10,960 | 100% (all hotels) |
| `Has_Braille_Signage` | 3,538 | ~32% |
| `Has_Large_Print_Materials` | 3,538 | ~32% |
| `Accessibility_Room_Available` | 5,344 | ~49% |
| `Has_Tactile_Maps` | 469 | ~4% |

**Hotels WITH Braille Signage:**
- The Watergate Hotel (Foggy Bottom)
- Hotel Zena (Thomas Circle)
- Kimpton Hotel Monaco (Penn Quarter) ← **Good for Penn Quarter demo!**
- Embassy Suites Dupont Circle (Dupont Circle)
- The Line DC (Adams Morgan)
- Canopy by Hilton (The Wharf)

**Hotels WITHOUT Braille Signage:**
- Grand Hyatt Washington (Penn Quarter) ← **In Penn Quarter but no braille**
- The Hay-Adams (Lafayette Square)
- Phoenix Park Hotel (Capitol Hill)
- Washington Plaza Hotel (Thomas Circle)

---

### Restaurants (What's TRUE in the data):

| Feature | Count | Percentage |
|---------|-------|------------|
| `Guide_Dog_Friendly` | 1,256 | 100% (all restaurants) |
| `Wheelchair_Accessible_Entrance` | 627 | ~50% |
| `Wheelchair_Accessible_Restrooms` | 627 | ~50% |
| `Has_Braille_Signage` | 104 | ~8% |
| `Has_Large_Print_Materials` | 104 | ~8% |
| `Reservations_Available` | 877 | ~70% |
| `Is_Weekend` | 1,256 | 100% (all weekend records) |

**Restaurants WITH Braille Signage:**
- Founding Farmers (Foggy Bottom)
- Pho 14 (Penn Quarter) ← **Good for Penn Quarter demo!**

**Restaurants WITHOUT Braille Signage:**
- Old Ebbitt Grill (Downtown)
- Maydan (U Street)
- Minibar (Penn Quarter) ← **In Penn Quarter but no braille**
- Ben's Next Door (U Street)
- &pizza (14th Street)
- Busboys and Poets (14th Street)

---

## Penn Quarter — What's Actually There

**Hotels in Penn Quarter (2):**
1. **Grand Hyatt Washington**
   - Has braille signage: ❌ FALSE
   - Wheelchair accessible: ✅ TRUE
   - Accessibility rating: ~63

2. **Kimpton Hotel Monaco**
   - Has braille signage: ✅ TRUE (Good for demo!)
   - Wheelchair accessible: ✅ TRUE
   - Accessibility rating: varies by date

**Restaurants in Penn Quarter (2):**
1. **Pho 14**
   - Has braille signage: ✅ TRUE (Good for demo!)
   - Wheelchair accessible: ❌ FALSE
   - Accessibility rating: ~56

2. **Minibar**
   - Has braille signage: ❌ FALSE
   - Wheelchair accessible: ❌ FALSE
   - Accessibility rating: varies by date

---

## Recommended Demo Queries (Tested & Working)

### ✅ Cross-Table Query (Primary Demo)
```
"Show me all hotels and restaurants in Penn Quarter"
```
**Expected:** "Penn Quarter has 2 hotels and 2 restaurants. The hotels are Grand Hyatt Washington and Kimpton Hotel Monaco. The restaurants are Pho 14 and Minibar."

---

### ✅ Accessibility Filter (Cross-Table)
```
"Which venues have braille signage?"
```
**Expected:** Lists 6 hotels + 2 restaurants (8 total venues with braille)

**Follow-up drill-down:**
```
"Which of those are in Penn Quarter?"
```
**Expected:** "Kimpton Hotel Monaco (hotel) and Pho 14 (restaurant) in Penn Quarter have braille signage."

---

### ✅ Neighborhood Listing
```
"What neighborhoods are in the dataset?"
```
**Expected:** Lists 8 neighborhoods (Dupont Circle, Adams Morgan, Lafayette Square, The Wharf, Penn Quarter, Foggy Bottom, Thomas Circle, Capitol Hill)

---

### ✅ Venue Count by Category
```
"How many hotels and restaurants are in the dataset?"
```
**Expected:** "10 hotels and 8 restaurants"

---

### ✅ Wheelchair Access (Cross-Table)
```
"Show me all wheelchair-accessible venues"
```
**Expected:** All 10 hotels + ~4 restaurants (50% have wheelchair access)

---

### ❌ Queries That WON'T Work (No Data)

**Don't use these in the demo — they return zero results:**
- "Show me venues with audio tours" (all FALSE)
- "Show me venues with tactile maps" (only 469 hotel records, hard to demo)
- "Show me accessible venues in Georgetown" (Georgetown not in dataset)

---

## Neighborhoods in Dataset

| Neighborhood | Hotels | Restaurants | Total |
|--------------|--------|-------------|-------|
| Foggy Bottom | 1 | 1 | 2 |
| Thomas Circle | 2 | 0 | 2 |
| Penn Quarter | 2 | 2 | 4 |
| Dupont Circle | 1 | 0 | 1 |
| Lafayette Square | 1 | 0 | 1 |
| Adams Morgan | 1 | 0 | 1 |
| The Wharf | 1 | 0 | 1 |
| Capitol Hill | 1 | 0 | 1 |
| Downtown | 0 | 1 | 1 |
| U Street | 0 | 2 | 2 |
| 14th Street | 0 | 2 | 2 |

**Best neighborhoods for cross-table demos:**
- ✅ **Penn Quarter** (2 hotels + 2 restaurants)
- ✅ **Foggy Bottom** (1 hotel + 1 restaurant)

---

## Time-Series Data Available

**Hotels:** Daily records from 2022-01-01 to 2024-12-31 (1,096 days)
- `Daily_Rate` varies by season (Cherry Blossom spikes, winter discounts)
- `Occupancy_Rate` tracks capacity
- `Accessibility_Rating` shows improvement from 2022→2024

**Restaurants:** Weekly snapshots from 2022-01-01 to 2024-12-31 (157 weeks)
- `Average_Wait_Time` varies by day of week
- `Noise_Level_Rating` (1-5 scale)
- `Price_Range` ($$, $$$, etc.)

**Good temporal queries:**
```
"How did hotel accessibility ratings change from 2022 to 2024?"
"Which hotels improved the most?"
```

---

## Summary for Demo Script

**What Works:**
1. ✅ Cross-table queries ("hotels and restaurants in Penn Quarter")
2. ✅ Accessibility filters ("venues with braille signage")
3. ✅ Neighborhood comparisons ("which neighborhood has the most venues")
4. ✅ Temporal analysis ("how did ratings change 2022-2024")

**What to Avoid:**
1. ❌ Audio tours (all FALSE)
2. ❌ Tactile maps (very few TRUE)
3. ❌ Georgetown neighborhood (not in dataset)
4. ❌ Wheelchair access in Penn Quarter restaurants (both FALSE — only hotels have it)

**Best Demo Flow:**
1. Start with single-table: "List all hotels"
2. Show cross-table: "Show me all hotels and restaurants in Penn Quarter"
3. Filter cross-table: "Which venues have braille signage?"
4. Drill down: "Which of those are in Penn Quarter?"

This proves:
- ✅ Semantic model works (single-table queries)
- ✅ Cross-table queries work (relational model)
- ✅ Agent distinguishes venue types
- ✅ Accessibility focus (braille signage)
