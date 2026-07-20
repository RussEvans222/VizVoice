# Public Library System Dataset — Specification

**Use Case:** Blind/low-vision user wants to find accessible library services, understand usage patterns, and discover programs in their area.

**Why This Works for VizVoice:**
- **Real accessibility need** — blind users need to know: which branches have screen readers? Braille books? Audio format availability?
- **Geographic relevance** — "What's the nearest library with assistive tech?"
- **Time-series trends** — "When are quiet hours?" (sensory-friendly times)
- **Rich chart types** — maps, time series, bar charts, heat maps, scatter plots
- **Meaningful questions** — not just analytics, but actionable information for daily life

---

## Dataset: `Library_Performance__dlm`

### Core Entities
- **Branch** (25 locations across a metro area)
- **Time** (daily records for 18 months: Jan 2024 - Jun 2025)
- **Geography** (latitude/longitude, neighborhood, district)
- **Services** (accessibility features, collections, programs)

### Record Structure

#### Unique Identifier Fields
| Field | Type | Description | Purpose |
|-------|------|-------------|---------|
| `Record_ID` | Text | `{BranchCode}_{YYYY-MM-DD}` (e.g., "MAIN_2025-06-15") | Primary key |
| `Branch_ID` | Text | Unique branch code (e.g., "MAIN", "NORTH", "WEST02") | FK for lookups |

#### Geographic Fields (for Maps)
| Field | Type | Description | Chart Type |
|-------|------|-------------|-----------|
| `Branch_Name` | Text | Full branch name ("Central Library", "Northside Branch") | Labels |
| `Latitude` | Number | Decimal degrees (37.7749) | Map visualization |
| `Longitude` | Number | Decimal degrees (-122.4194) | Map visualization |
| `Neighborhood` | Text | Neighborhood name ("Downtown", "Mission District") | Filters/grouping |
| `District` | Text | City district (1-5) for administrative grouping | Color coding |
| `Zip_Code` | Text | 5-digit zip for regional analysis | Filters |

#### Time Fields (for Time Series)
| Field | Type | Description | Chart Type |
|-------|------|-------------|-----------|
| `Date` | Date | Full date (YYYY-MM-DD format) | Line charts, trends |
| `Day_of_Week` | Text | Monday, Tuesday, etc. | Weekly patterns |
| `Month` | Text | January, February, etc. | Seasonal trends |
| `Year` | Number | 2024, 2025 | Year-over-year |
| `Is_Weekend` | Boolean | TRUE/FALSE | Categorical filter |
| `Is_Holiday` | Boolean | TRUE/FALSE | Anomaly detection |
| `Season` | Text | Winter, Spring, Summer, Fall | Seasonal analysis |

#### Visitor Metrics (for Bar/Line Charts)
| Field | Type | Description | Chart Type |
|-------|------|-------------|-----------|
| `Total_Visitors` | Number | Daily foot traffic count | Bar chart, trend |
| `Children_Visitors` | Number | Visitors under 12 | Stacked bar |
| `Teen_Visitors` | Number | Ages 13-17 | Stacked bar |
| `Adult_Visitors` | Number | Ages 18-64 | Stacked bar |
| `Senior_Visitors` | Number | Ages 65+ | Stacked bar |
| `Accessibility_Users` | Number | Visitors using assistive tech/services | Key accessibility metric |

#### Collection Usage (for Stacked Area/Bar)
| Field | Type | Description | Chart Type |
|-------|------|-------------|-----------|
| `Physical_Books_Borrowed` | Number | Print books checked out | Stacked area |
| `Ebooks_Borrowed` | Number | Digital books accessed | Stacked area |
| `Audiobooks_Borrowed` | Number | Audio format checkouts | **Key for blind users** |
| `Braille_Books_Borrowed` | Number | Braille materials checked out | **Accessibility metric** |
| `Large_Print_Borrowed` | Number | Large print books | **Low-vision metric** |
| `DVDs_Borrowed` | Number | Video materials (often audio-described) | Media usage |
| `Digital_Resources_Used` | Number | Database/streaming access count | Digital engagement |

#### Program Attendance (for Heatmap/Calendar)
| Field | Type | Description | Chart Type |
|-------|------|-------------|-----------|
| `Storytimes_Attended` | Number | Children's story hour attendance | Program popularity |
| `Tech_Classes_Attended` | Number | Digital literacy workshops | Adult programming |
| `Sensory_Hours_Attended` | Number | **Quiet/sensory-friendly hours** | **Autism/sensory sensitivity** |
| `Screen_Reader_Training_Attended` | Number | **Assistive tech training sessions** | **Blind/low-vision services** |
| `Book_Club_Attendance` | Number | Adult reading groups | Social engagement |
| `Total_Program_Attendance` | Number | Sum of all programs | Overall engagement |

#### Accessibility Features (for Symbol Maps / Filters)
| Field | Type | Description | Use |
|-------|------|-------------|-----|
| `Has_Screen_Readers` | Boolean | JAWS/NVDA available at public computers | **Critical for blind users** |
| `Has_Braille_Embosser` | Boolean | Braille printing available | **Critical for blind users** |
| `Has_Magnifiers` | Boolean | Video magnifiers for low-vision users | **Low-vision support** |
| `Has_Quiet_Room` | Boolean | Sensory-friendly private space | **Neurodiverse support** |
| `Has_ASL_Staff` | Boolean | ASL-fluent staff on duty | Deaf accessibility |
| `Wheelchair_Accessible` | Boolean | Full ADA compliance | Physical accessibility |
| `Has_Assistive_Listening` | Boolean | Hearing loops/FM systems | Hearing accessibility |
| `Audio_Description_DVDs` | Number | Count of audio-described media titles | **Blind media access** |

#### Operational Metrics (for Performance Dashboards)
| Field | Type | Description | Chart Type |
|-------|------|-------------|-----------|
| `Open_Hours` | Number | Hours open that day (6, 8, 10, 12) | Bar chart |
| `Staff_on_Duty` | Number | Number of staff members | Scatter plot vs. visitors |
| `Computers_Available` | Number | Public computer terminals | Capacity planning |
| `Computers_Used` | Number | Peak simultaneous computer usage | Utilization % |
| `WiFi_Sessions` | Number | Unique WiFi connections | Digital access |
| `Reference_Questions` | Number | Librarian assistance requests | Service demand |
| `Holds_Picked_Up` | Number | Reserved items collected | Fulfillment metric |

#### Satisfaction & Feedback (for Scatter/Trend)
| Field | Type | Description | Chart Type |
|-------|------|-------------|-----------|
| `Satisfaction_Score` | Number | Daily average (1-100 scale) from exit survey | Trend line |
| `Accessibility_Rating` | Number | Accessibility-specific satisfaction (1-100) | **Key metric** |
| `Noise_Level_Rating` | Number | Quiet environment rating (1-5, 5=very quiet) | **Sensory consideration** |
| `Cleanliness_Rating` | Number | Facility cleanliness (1-5) | Operational quality |

---

## Sample Data Scenarios

### Branch Types (25 branches)
1. **Central Main Library** — flagship, all accessibility features, highest volume
2. **Northside Branch** — urban, strong tech programs, screen readers
3. **Eastside Branch** — suburban family focus, storytimes, sensory hours
4. **Westwood Branch** — senior community, large print collection
5. **University Branch** — student focus, extended hours, high digital usage
6. **Southpoint Branch** — low-income area, strong ESL programs, limited hours
7. **Riverside Branch** — small, limited accessibility, low traffic
8. **Downtown Express** — commuter-focused, quick holds pickup, no programs
9. **Mobile Unit 1** — bookmobile, rotating locations (lat/long changes daily)
10-25. **Neighborhood branches** with varying accessibility profiles

### Time Patterns
- **Weekday peaks:** 4-6 PM (after school/work)
- **Weekend peaks:** 10 AM - 2 PM (family time)
- **Summer spike:** June-August (children out of school)
- **Holiday closures:** Thanksgiving, Christmas, New Year's
- **Sensory Hours:** 8-10 AM Tuesdays/Thursdays (quiet, low stimulation)

### Geographic Distribution
- **District 1 (Downtown):** High density, 6 branches, high foot traffic
- **District 2 (North Suburbs):** 5 branches, car-dependent, moderate traffic
- **District 3 (East Urban):** 4 branches, transit-accessible, diverse demographics
- **District 4 (West Residential):** 5 branches, family-oriented, high children's usage
- **District 5 (South Emerging):** 4 branches, underserved, newer facilities

---

## Tableau Chart Types Showcased

| Chart Type | Data Source | Example Question |
|------------|-------------|------------------|
| **Symbol Map** | Lat/Long + Has_Screen_Readers | "Show me all branches with screen readers" |
| **Filled Map** | District + Total_Visitors | "Which districts have the highest usage?" |
| **Line Chart** | Date + Audiobooks_Borrowed | "Are audiobook checkouts increasing over time?" |
| **Stacked Bar** | Branch + [Physical/Ebook/Audiobook/Braille] | "What format mix does each branch offer?" |
| **Stacked Area** | Date + Collection_Types | "How has format usage shifted since 2024?" |
| **Heatmap (Calendar)** | Date + Program_Attendance | "When are sensory hours most attended?" |
| **Scatter Plot** | Accessibility_Users vs Accessibility_Rating | "Do accessibility features correlate with satisfaction?" |
| **Horizontal Bar (Ranked)** | Branch + Audiobooks_Borrowed (sorted) | "Which branches loan the most audiobooks?" |
| **Bullet Chart** | Total_Visitors vs Target (goal: 500/day) | "Are branches meeting traffic goals?" |
| **Gantt Chart** | Date + Open_Hours by Branch | "What are the open hours across branches?" |
| **Treemap** | District > Branch (size = Total_Visitors) | "Which branches dominate each district?" |
| **Box Plot** | Branch + Satisfaction_Score (distribution) | "Which branches have the most consistent satisfaction?" |

---

## Sample Questions for VizVoice

### Accessibility-Focused (Primary Use Case)
1. **"Which branches near me have screen readers?"** → Symbol map filtered by Has_Screen_Readers = TRUE
2. **"Are there sensory-friendly hours at Northside Branch?"** → Filter to Sensory_Hours_Attended > 0
3. **"How many Braille books are available system-wide?"** → SUM(Braille_Books_Borrowed)
4. **"Which branch has the best accessibility rating?"** → MAX(Accessibility_Rating) by Branch
5. **"When is the Central Library least crowded?"** → MIN(Total_Visitors) by Day_of_Week

### Geographic Questions
6. **"Show me libraries in District 3"** → Map filter
7. **"What's the busiest branch in the 94103 zip code?"** → Filter + rank
8. **"Are suburban branches open longer than urban ones?"** → AVG(Open_Hours) by District

### Time-Series Questions
9. **"How has audiobook usage changed since last year?"** → Line chart, year-over-year
10. **"When are storytimes most attended?"** → Heatmap by Day_of_Week
11. **"Did the summer reading program increase visits?"** → Trend line June-August

### Comparative Questions
12. **"Do branches with more staff have higher satisfaction?"** → Scatter plot
13. **"Which format is most popular: physical or digital?"** → Stacked bar
14. **"Are weekend visitors mostly families?"** → Filter Is_Weekend + Children_Visitors %

---

## Data Generation Parameters

- **18 months** of daily data (Jan 2024 - Jun 2025) = ~540 days
- **25 branches** × 540 days = **13,500 records**
- **Realistic nulls:** Mobile Unit has no fixed lat/long, small branches have Has_Braille_Embosser = FALSE
- **Seasonal variation:** Summer +30% children, winter -15% overall, sensory hours attendance stable
- **Accessibility correlation:** Branches with more accessibility features have 10-15% higher Accessibility_Rating

---

## Field Descriptions for Semantic Model

I'll create a separate file with paste-ready descriptions for the Data 360 semantic model builder (like the transit one).

---

## Next Steps

1. **Generate the CSV** (13,500 rows with realistic variation)
2. **Create semantic model field descriptions** (required for NLU)
3. **Upload to Data Cloud** via CSV upload → DMO → semantic model
4. **Build Tableau dashboard** with:
   - Accessibility Services Map (symbol map with Has_Screen_Readers filter)
   - Format Usage Trends (stacked area over time)
   - Branch Performance (bar chart with satisfaction overlay)
   - Sensory Hours Calendar (heatmap)
5. **Test VizVoice** with the sample questions above

Should I generate the full CSV now (13,500 rows) or start with a smaller sample (e.g., 3 branches × 90 days = 270 rows) for faster iteration?
