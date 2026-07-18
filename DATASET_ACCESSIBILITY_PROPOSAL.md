# VizVoice Accessibility-Focused Dataset Proposal

**Purpose**: Design a comprehensive transit dataset that enables rich, context-aware conversations for blind and low-vision users navigating real-world transit scenarios.

**Last Updated**: 2026-07-18  
**Status**: Proposal (not yet implemented)

---

## Design Principles

The dataset must enable **actionable, safety-focused, independence-empowering** conversations:

1. **Actionable Information** — Data that helps users make decisions ("Which route should I take right now?")
2. **Safety & Comfort** — Information about crowding, accessibility, lighting, security
3. **Real-Time Relevance** — Current conditions, not just historical trends
4. **Alternative Recommendations** — If one option is bad, suggest another
5. **Multimodal Context** — Bus, train, paratransit, rideshare integration
6. **Independence Support** — Features that reduce reliance on asking strangers for help

---

## Core Schema Enhancements

### 1. Real-Time Transit Status

**Purpose**: Answer "Is the Blue Line running on time right now?"

```json
{
  "route_id": "Route_12",
  "route_name": "Mission District Express",
  "service_type": "Bus",
  "timestamp": "2026-07-18T15:30:00Z",
  "day_of_week": "Friday",
  "time_period": "Afternoon_Peak",
  "status": "On_Time",
  "next_arrival_min": 8,
  "following_arrival_min": 23,
  "service_frequency_min": 15,
  "current_location": "Approaching_Market_St",
  "crowding_level": "Moderate",
  "vehicle_capacity_pct": 65
}
```

**Fields**:
- `timestamp` — Exact date/time (enables "right now" queries)
- `day_of_week` — Monday-Sunday (enables "avoid Mondays" queries)
- `time_period` — Morning_Peak, Midday, Afternoon_Peak, Evening, Late_Night
- `status` — On_Time, Delayed, Cancelled, Diverted
- `next_arrival_min` — Minutes until next vehicle arrives
- `crowding_level` — Light, Moderate, Heavy, Very_Heavy

**Sample questions enabled**:
- "Is Route 12 running on time right now?"
- "How long until the next bus?"
- "Is the Blue Line crowded during afternoon rush hour?"
- "What's the wait time for Route 28?"

---

### 2. Delay & Disruption Details (Enhanced)

**Purpose**: Answer "Why is there a delay and what should I do instead?"

```json
{
  "delay_id": "D20260718-001",
  "route_id": "Blue_Line",
  "delay_reason": "Signal_Failure",
  "severity": "Major",
  "estimated_duration_min": 25,
  "affected_stops": ["Downtown", "Market_St", "Civic_Center"],
  "alternative_routes": ["Route_28", "Red_Line"],
  "alternative_modes": ["Rideshare", "Paratransit"],
  "last_updated": "2026-07-18T15:45:00Z",
  "user_impact": "Service suspended between Downtown and Civic Center",
  "resolution_eta": "2026-07-18T16:10:00Z"
}
```

**Fields**:
- `delay_reason` — Signal_Failure, Track_Work, Medical_Emergency, Weather, Traffic, Vehicle_Breakdown, Police_Activity
- `severity` — Minor, Moderate, Major, Service_Suspended
- `estimated_duration_min` — How long the delay will last
- `affected_stops` — Which stations/stops are impacted
- `alternative_routes` — Other transit options
- `alternative_modes` — Rideshare, paratransit, bike-share
- `user_impact` — Plain-language description

**Sample questions enabled**:
- "Why is the Blue Line delayed?"
- "How long will the delay last?"
- "What stops are affected?"
- "What alternative routes should I take?"
- "Should I call a rideshare instead?"

---

### 3. Station Accessibility Profiles

**Purpose**: Answer "Which stations work best for blind/wheelchair users?"

```json
{
  "station_id": "Civic_Center",
  "station_name": "Civic Center Station",
  "wheelchair_accessible": true,
  "elevator_count": 2,
  "elevator_status": ["Operational", "Operational"],
  "escalator_count": 1,
  "escalator_status": ["Out_of_Service"],
  "stairs_only_exits": false,
  "tactile_guidance_path": true,
  "tactile_paving_quality": "Good",
  "audio_signage": true,
  "audio_announcement_quality": "Excellent",
  "braille_maps": true,
  "braille_map_locations": ["Main_Entrance", "Platform_A"],
  "assistance_available": true,
  "assistance_hours": "6:00 AM - 11:00 PM",
  "lighting_quality": "Good",
  "lighting_level_lux": 500,
  "security_presence": "Yes",
  "security_hours": "24/7",
  "crowding_typical": "High_Peak",
  "transfer_connections": ["Red_Line", "Route_12", "Route_28"],
  "restroom_accessible": true,
  "restroom_location": "Mezzanine_Level",
  "last_inspection": "2026-07-10"
}
```

**Fields**:
- `elevator_status` — Real-time status per elevator (Operational, Out_of_Service, Under_Repair)
- `tactile_guidance_path` — Raised tiles/textured surface from entrance to platform
- `tactile_paving_quality` — Poor, Fair, Good, Excellent
- `audio_signage` — Real-time announcements available
- `audio_announcement_quality` — Clarity rating
- `braille_maps` — Physical tactile maps available
- `assistance_available` — Staff to help with navigation
- `lighting_quality` — Important for low-vision users
- `security_presence` — Safety consideration for solo travelers

**Sample questions enabled**:
- "Are the elevators working at Civic Center?"
- "Which stations have the best audio announcements?"
- "I'm blind and traveling alone. Which stations have assistance available?"
- "Where can I find tactile paving?"
- "Which stations have good lighting at night?"
- "Is the restroom accessible at Market Street?"

---

### 4. Rider Experience & Safety Data

**Purpose**: Answer "Is this route safe and comfortable for blind travelers?"

```json
{
  "route_id": "Route_12",
  "station_id": "Market_St",
  "date": "2026-07-18",
  "time_period": "Morning_Peak",
  "on_time_percentage": 87.5,
  "crowding_level": "High",
  "crowding_peak_time": "8:00 AM - 9:30 AM",
  "rider_satisfaction_score": 3.8,
  "accessibility_rating": 4.2,
  "safety_rating": 4.5,
  "cleanliness_rating": 4.0,
  "noise_level": "Moderate",
  "common_issues": ["Crowding", "Noise_Level"],
  "positive_feedback": ["Helpful_Drivers", "Clean_Vehicles", "Audio_Announcements_Clear"],
  "accessibility_incidents": 0,
  "security_incidents": 0
}
```

**Fields**:
- `crowding_peak_time` — When to avoid if possible
- `accessibility_rating` — User ratings for accessibility features
- `safety_rating` — Perceived safety (important for blind travelers alone)
- `noise_level` — Low, Moderate, High, Very_High (can be disorienting for blind users)
- `positive_feedback` — What works well (especially "Helpful_Drivers", "Audio_Announcements_Clear")
- `accessibility_incidents` — Count of reported accessibility issues
- `security_incidents` — Safety metric

**Sample questions enabled**:
- "Which route has the best accessibility rating?"
- "Is Route 12 usually crowded during morning rush hour?"
- "What time should I avoid traveling to skip peak crowding?"
- "Are the drivers helpful on the Blue Line?"
- "Which routes have the clearest audio announcements?"
- "Is it safe to travel alone on Route 28 at night?"

---

### 5. Route Journey Details

**Purpose**: Answer "What will my trip be like step-by-step?"

```json
{
  "journey_id": "J20260718-001",
  "origin_station": "Civic_Center",
  "destination_station": "Mission_District",
  "route_id": "Route_12",
  "estimated_duration_min": 18,
  "stop_count": 8,
  "transfers_required": 0,
  "wheelchair_accessible": true,
  "step_free_access": true,
  "audio_announcements_available": true,
  "crowding_expected": "Moderate",
  "journey_steps": [
    {
      "step": 1,
      "instruction": "Board Route 12 at Civic Center Station Platform B",
      "audio_cue": "Listen for 'Mission District Express' announcement",
      "tactile_landmark": "Tactile paving at platform edge",
      "wait_time_min": 5
    },
    {
      "step": 2,
      "instruction": "Ride for 8 stops (approximately 15 minutes)",
      "audio_cue": "Driver will announce each stop",
      "exit_cue": "Listen for 'Mission District final stop' announcement"
    },
    {
      "step": 3,
      "instruction": "Exit at Mission District Station",
      "audio_cue": "Chime sound before door opens",
      "tactile_landmark": "Yellow tactile strip marks exit path",
      "assistance_available": true
    }
  ]
}
```

**Fields**:
- `journey_steps` — Step-by-step instructions optimized for blind travelers
- `audio_cue` — What to listen for at each step
- `tactile_landmark` — Physical features to feel for orientation
- `assistance_available` — Whether staff can help at this step

**Sample questions enabled**:
- "I need to get from Civic Center to Mission District. What's the best accessible route?"
- "How many stops is it?"
- "Will I need to transfer?"
- "What should I listen for when I need to exit?"
- "Where can I find the tactile paving?"
- "Is there someone who can help me board?"

---

### 6. Alert & Notification Data

**Purpose**: Answer "Are there any service changes I should know about?"

```json
{
  "alert_id": "A20260718-001",
  "route_id": "Blue_Line",
  "alert_type": "Elevator_Outage",
  "severity": "High",
  "title": "Civic Center Elevator Out of Service",
  "description": "Main elevator at Civic Center is out of service. Stairs or escalator only. Alternative: Use Market Street station (2 blocks east) with working elevators.",
  "affected_users": ["Wheelchair", "Stroller", "Heavy_Luggage"],
  "start_time": "2026-07-18T06:00:00Z",
  "end_time": "2026-07-19T18:00:00Z",
  "alternative_stations": ["Market_St"],
  "alternative_routes": ["Route_28"],
  "last_updated": "2026-07-18T15:30:00Z"
}
```

**Fields**:
- `alert_type` — Elevator_Outage, Escalator_Outage, Audio_System_Down, Planned_Maintenance, Service_Change
- `affected_users` — Who this impacts most
- `alternative_stations` — Nearby stations with working accessibility features
- `alternative_routes` — Other transit options

**Sample questions enabled**:
- "Are there any elevator outages I should know about?"
- "Is there planned maintenance this weekend?"
- "Are all the accessibility features working at Civic Center?"
- "What's the alternative if the elevator is broken?"

---

## Sample Dataset (CSV Templates)

### transit_routes_realtime.csv

```csv
route_id,route_name,service_type,timestamp,day_of_week,time_period,status,next_arrival_min,crowding_level,wheelchair_accessible
Route_12,Mission District Express,Bus,2026-07-18T15:30:00Z,Friday,Afternoon_Peak,On_Time,8,Moderate,true
Blue_Line,Downtown-Mission Line,Light_Rail,2026-07-18T15:30:00Z,Friday,Afternoon_Peak,Delayed,15,Heavy,true
Red_Line,Civic Center Express,Light_Rail,2026-07-18T15:30:00Z,Friday,Afternoon_Peak,On_Time,5,Moderate,true
Route_28,Market Street Local,Bus,2026-07-18T15:30:00Z,Friday,Afternoon_Peak,On_Time,12,Light,true
Green_Line,Bay Area Connector,Light_Rail,2026-07-18T15:30:00Z,Friday,Afternoon_Peak,On_Time,10,Moderate,true
```

### station_accessibility.csv

```csv
station_id,station_name,wheelchair_accessible,elevator_count,elevator_status,tactile_guidance_path,audio_signage,braille_maps,assistance_available,lighting_quality,security_presence
Civic_Center,Civic Center Station,true,2,"Operational,Operational",true,true,true,true,Good,24/7
Market_St,Market Street Station,true,3,"Operational,Operational,Operational",true,true,true,true,Excellent,24/7
Mission_District,Mission District Station,true,1,Operational,true,true,false,false,Good,6AM-11PM
Downtown,Downtown Station,true,2,"Operational,Out_of_Service",true,false,true,true,Fair,24/7
Powell_St,Powell Street Station,false,0,N/A,false,true,false,false,Fair,6AM-Midnight
```

### transit_delays.csv

```csv
delay_id,route_id,delay_reason,severity,estimated_duration_min,affected_stops,alternative_routes,last_updated
D20260718-001,Blue_Line,Signal_Failure,Major,25,"Downtown,Market_St,Civic_Center","Route_28,Red_Line",2026-07-18T15:45:00Z
D20260718-002,Route_12,Traffic,Minor,5,"Market_St",Route_28,2026-07-18T14:30:00Z
D20260718-003,Green_Line,Track_Work,Moderate,15,"Bay_Area,Ocean_View",,2026-07-18T12:00:00Z
```

### rider_experience.csv

```csv
route_id,date,time_period,on_time_percentage,crowding_level,accessibility_rating,safety_rating,common_issues,positive_feedback
Route_12,2026-07-18,Morning_Peak,87.5,High,4.2,4.5,"Crowding,Noise_Level","Helpful_Drivers,Clean_Vehicles,Audio_Announcements_Clear"
Blue_Line,2026-07-18,Morning_Peak,92.3,Moderate,4.5,4.7,Occasional_Delays,"Smooth_Ride,Good_Lighting,Clear_Audio"
Red_Line,2026-07-18,Afternoon_Peak,89.1,Moderate,4.3,4.6,Crowding_Peak_Hours,"Frequent_Service,Staff_Helpful"
Route_28,2026-07-18,Evening,85.0,Light,3.9,4.2,"Infrequent_Service","Quiet,Comfortable_Seats"
Green_Line,2026-07-18,Midday,94.5,Light,4.6,4.8,,"Excellent_Audio,Clean,Well_Lit"
```

---

## Accessibility-Focused Query Scenarios

### Scenario 1: Blind User Needs Route Guidance

**User**: "I'm at Civic Center and need to get to Mission District. I'm blind and traveling alone. What's the best route?"

**Agent Response** (enabled by enhanced data):
> "Route 12 is your best option. It's direct with no transfers, boards at Platform B with tactile paving to guide you. The next bus arrives in 8 minutes. Drivers on Route 12 are rated highly for being helpful. The bus has clear audio announcements for each stop. Would you like step-by-step instructions?"

**Data used**:
- Real-time arrival (8 minutes)
- Accessibility features (tactile paving, audio announcements)
- Rider feedback (helpful drivers)
- Transfer count (0 = direct)
- Station accessibility (Platform B location)

---

### Scenario 2: Wheelchair User Needs Elevator Status

**User**: "I'm in a wheelchair. Are the elevators working at Civic Center?"

**Agent Response** (enabled by enhanced data):
> "Yes, both elevators at Civic Center are operational. If you need a backup option, Market Street station 2 blocks east also has 3 working elevators. Would you like me to check your destination station as well?"

**Data used**:
- Elevator status (real-time)
- Elevator count
- Alternative accessible stations
- Distance to alternatives

---

### Scenario 3: Safety-Conscious Evening Traveler

**User**: "I need to travel home after 10 PM. Which route is safest and well-lit?"

**Agent Response** (enabled by enhanced data):
> "The Red Line has the highest safety rating at 4.6 out of 5 and excellent lighting at all stations. Security is present 24/7. It runs every 15 minutes until midnight. Route 28 is an alternative with good lighting and security from 6 AM to 11 PM. Would you like real-time arrival info?"

**Data used**:
- Safety ratings
- Lighting quality
- Security presence hours
- Service frequency late evening
- Comparison across routes

---

### Scenario 4: Avoiding Crowding (Sensory Overload)

**User**: "Which route has the least crowding right now? I have sensory processing issues and need space."

**Agent Response** (enabled by enhanced data):
> "Route 28 currently has light crowding at only 35% capacity. The next bus arrives in 12 minutes. Green Line is also light right now. Both routes have good audio announcements and moderate noise levels. Which destination are you headed to?"

**Data used**:
- Real-time crowding levels
- Vehicle capacity percentage
- Noise level ratings
- Arrival times

---

### Scenario 5: Proactive Alert for Accessibility Issue

**User**: "I'm heading to Civic Center. Any issues I should know about?"

**Agent Response** (enabled by enhanced data):
> "Alert: The main elevator at Civic Center is out of service until tomorrow at 6 PM. Stairs or escalator only. Alternative: Market Street station 2 blocks east has 3 working elevators. The Blue Line stops at both stations. Would you like directions to Market Street instead?"

**Data used**:
- Alert system (elevator outages)
- Affected users (wheelchair, mobility issues)
- Alternative stations
- Transit connections to alternatives
- Estimated repair time

---

## Implementation Roadmap

### Phase 1: Data Collection

1. **Generate synthetic data** using CSV templates above
2. **Import to Data Cloud**:
   ```bash
   sf data import tree --plan data-import-plan.json --target-org vizvoice-dev
   ```
3. **Validate data quality** (completeness, consistency)

### Phase 2: Semantic Model Update

1. Update `C360_Semantic_Model_Extended_0ba` with new fields
2. Define relationships between entities:
   - Routes → Stations (many-to-many)
   - Delays → Routes (many-to-one)
   - Alerts → Stations/Routes (many-to-many)
3. Add calculated fields:
   - "Is accessible?" (elevator operational AND audio signage working)
   - "Safety score" (lighting + security presence + crowding inverse)
4. Test queries in Data Cloud UI

### Phase 3: Agent Testing

1. Test each sample query scenario
2. Validate agent can combine multiple data sources:
   - "Best route" = real-time + accessibility + rider feedback
3. Verify fallback behavior when data is missing
4. Tune agent system prompt with accessibility focus (already documented in `AGENT_PROMPT_UPDATES.md`)

### Phase 4: Tableau Dashboard Update

Create new visualizations:
- **Accessibility heatmap** (stations by accessibility rating)
- **Elevator status indicator** (operational vs. out-of-service)
- **Crowding timeline** (by route and time of day)
- **Safety ratings comparison** (by route)

---

## CSV Import Plan Template

```json
{
  "files": [
    {"file": "data/transit_routes_realtime.csv", "object": "TransitRoute__c"},
    {"file": "data/station_accessibility.csv", "object": "Station__c"},
    {"file": "data/transit_delays.csv", "object": "Delay__c"},
    {"file": "data/rider_experience.csv", "object": "RiderExperience__c"},
    {"file": "data/alerts.csv", "object": "Alert__c"}
  ]
}
```

---

## Benefits for Hackathon Demo

**Demonstrates**:
1. **Deep user empathy** — Dataset designed around real needs of blind/low-vision travelers
2. **AI for independence** — Reduces need to ask strangers for help
3. **Safety-first design** — Lighting, security, crowding data empower informed decisions
4. **Proactive assistance** — Alerts about accessibility issues before user encounters them
5. **Context-aware recommendations** — "Best route" considers accessibility + crowding + safety, not just speed

**Judges will see**:
- Not just WCAG compliance, but **designed for accessibility from the ground up**
- AI that **transforms independence** for disabled users
- **Actionable information** that matters in real-world scenarios

---

## Next Steps

1. **Review this proposal** with team and hackathon mentors
2. **Generate sample CSV files** using templates above
3. **Import to Data Cloud** and validate
4. **Update semantic model** with new fields
5. **Test agent** with sample query scenarios
6. **Update Tableau dashboard** with accessibility-focused visualizations
7. **Document in demo video** how enhanced data enables richer conversations

---

## Changelog

- **2026-07-18**: Initial proposal for accessibility-focused dataset enhancement
