# Transit_Performance Semantic Model — Field Descriptions

**Model:** `Transit_Performance__dlm` (data lives in `C360_Semantic_Model_Extended_0ba`)  
**Purpose:** Paste these descriptions into the Data 360 / semantic model builder UI. Empty  
field descriptions break the agent's NLU — good descriptions directly improve answer quality.

> Field descriptions must be set in the **Data 360 / semantic model builder UI** (or DMO field  
> metadata). They cannot be reliably pushed from the CLI onto an already-deployed semantic model.

## Business fields (the agent should reason over these)

| Field                   | Type       | Description                                                                                                                                      |
| ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Record_Id__c`          | Text       | Unique identifier for each transit performance record, formed from the line name and reporting month (e.g., "Blue_Line_July_2025"). Primary key. |
| `Line__c`               | Text       | Name of the transit line the record covers, such as Blue Line, Green Line, or Red Line.                                                          |
| `Line_Type__c`          | Text       | Category of transit line: Subway, Light Rail, Bus, or Commuter Rail. Used to group performance by mode of transport.                             |
| `Month__c`              | Text       | Calendar month the metrics were recorded, spelled out (e.g., "July"). Combine with Year for the full reporting period.                           |
| `Year__c`               | Number     | Calendar year the metrics were recorded (e.g., 2025).                                                                                            |
| `On_Time_Pct__c`        | Number (%) | Percentage of trips that arrived on schedule during the period, from 0 to 100. The primary reliability metric; higher is better.                 |
| `Avg_Delay_Minutes__c`  | Number     | Average delay per delayed trip, in minutes, for the line during the period. Lower is better.                                                     |
| `Ridership__c`          | Number     | Total number of passenger trips (boardings) on the line during the period.                                                                       |
| `Cancelled_Trips__c`    | Number     | Count of scheduled trips that were cancelled during the period.                                                                                  |
| `Delay_Cause__c`        | Text       | Primary reason for delays during the period, such as Weather, Track Maintenance, Signal Failure, or Mechanical Issue.                            |
| `Satisfaction_Score__c` | Number     | Rider satisfaction score for the line during the period, on a 0–100 scale. Higher indicates more satisfied riders.                               |
| `Incidents__c`          | Number     | Number of reported safety or service incidents on the line during the period.                                                                    |

## System fields (Data Cloud metadata — consider EXCLUDING from the semantic model)

These add noise to the agent's field selection and a rider will never ask about them. Prefer  
excluding them; if they must stay, use these descriptions.

| Field                     | Type | Description                                                                                                 |     |
| ------------------------- | ---- | ----------------------------------------------------------------------------------------------------------- | --- |
| `KQ_Record_Id__c`         | Text | Data Cloud internal surrogate key for the record. System-generated; not for analysis.                       |     |
| `InternalOrganization__c` | Text | Data Cloud internal organization partition identifier. System field.                                        |     |
| `DataSource__c`           | Text | Origin of the ingested data (e.g., "UploadedFiles"). System lineage field.                                  |     |
| `DataSourceObject__c`     | Text | Source file or object the record was ingested from (e.g., "transit_performance.csv"). System lineage field. |     |

## Sample data (for reference)

```
Record_Id            Ridership  Satisfaction  Line        Delay_Cause       Cancelled  Month     Year  Line_Type   Avg_Delay  Incidents  On_Time_Pct
Blue_Line_July_2025  341000     85            Blue Line   Track Maintenance  8          July      2025  Subway      1.4        2          92.9
Blue_Line_Nov_2025   301000     79            Blue Line   Weather            22         November  2025  Subway      2.6        5          87.9
Green_Line_Mar_2025  179000     78            Green Line  Signal Failure     16         March     2025  Light Rail  2.4        4          87.4
```
