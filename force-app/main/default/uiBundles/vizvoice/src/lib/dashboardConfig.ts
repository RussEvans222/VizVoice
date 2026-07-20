/**
 * Dashboard Configuration
 * Maps dashboards to their corresponding Data 360 semantic models
 *
 * ⚠️  POC WORKAROUND: This is a manual config file for the hackathon.
 * In production, this mapping should be:
 * 1. Stored in Salesforce metadata (Custom Setting or Custom Metadata Type)
 * 2. Retrieved via Tableau Embedding API when a dashboard loads
 * 3. Passed automatically to the agent without manual config
 */

export interface DashboardConfig {
  id: string;
  label: string;
  tableauDashboardId: string; // Tableau dashboard UUID (placeholder for now)
  semanticModelId: string;    // Data 360 semantic model API name
  semanticModelType: 'dashboard' | 'sdm';
  agentContext: string;       // System prompt addition for this dataset
  description?: string;       // User-facing description
}

export const DASHBOARDS: DashboardConfig[] = [
  {
    id: 'transit',
    label: 'Transit Performance',
    tableauDashboardId: 'transit_dashboard_placeholder',
    semanticModelId: 'Transit_Performance__dlm',
    semanticModelType: 'sdm',
    agentContext: `You are analyzing transit performance data covering 5 transit lines (Blue, Green, Red, Orange, Purple) across 12 months of 2025.

The dataset includes on-time performance, ridership, delays, cancellations, satisfaction scores, and incidents.

Focus areas:
- On-time percentage and delay causes (Weather, Track Maintenance, Signal Failure, Mechanical Issue, Traffic)
- Ridership trends by line and month
- Seasonal patterns (summer peaks, winter weather impacts)
- Line type comparisons (Subway vs. Light Rail vs. Bus vs. Commuter Rail)
- Satisfaction scores correlated with performance metrics

Use ordinal language (highest, best, leading) instead of visual metaphors. State numbers with context.`,
    description: 'Metro transit system performance metrics for 2025, including on-time rates, ridership, and delay analysis.',
  },
  {
    id: 'tourism',
    label: 'DC Accessible Tourism',
    tableauDashboardId: 'dc_tourism_dashboard_placeholder',
    semanticModelId: 'New_Semantic_Model_0ba',
    semanticModelType: 'sdm',
    agentContext: `DATASET: DC accessible tourism (2022-2024), Hotels (daily) + Restaurants (weekly)

RELATIONAL STRUCTURE:
- TWO tables joined on Venue_ID
- "venues"/"places" = query BOTH tables, distinguish in results: "The Watergate Hotel (hotel), Founding Farmers (restaurant)"
- "hotels"/"restaurants" = query that specific table only

NEIGHBORHOODS (no Georgetown in data):
- Both tables: Foggy Bottom, Penn Quarter
- Hotels only: Thomas Circle, Dupont Circle, Lafayette Square, Capitol Hill, Adams Morgan, The Wharf
- Restaurants only: U Street, 14th Street, Downtown

STORY ARC:
- Hotels: 65→97 rating (+32 points), 30%→70% accessible room availability
- Restaurants: 55→72 rating (+17 points), slower due to historic building constraints
- 2023 DC Accessible Capital Initiative drove improvements

CROSS-TABLE QUERIES:
- Comparisons ("Did X or Y improve faster?"): Calculate 2024 avg - 2022 avg for each, state both deltas
- Geographic ("venues in [neighborhood]"): Query both tables if neighborhood exists in both
- NULL handling: Hotels lack wait_time/noise_level, restaurants lack daily_rate/occupancy

ACCESSIBILITY LANGUAGE:
- Ordinal terms ("highest-rated", "nearest") NOT visual ("as you can see", "the chart shows")
- Lead with numbers: "Hotels improved 32 points, restaurants 17 points, nearly double"
- State units: "92 accessibility rating out of 100, above the average"
- Keep concise: 2-3 sentences for simple queries`,
    description: 'Washington DC hotels and restaurants with accessibility features, pricing trends, and the 2022-2024 transformation story.',
  },
];

/**
 * Get dashboard config by ID
 */
export function getDashboardById(id: string): DashboardConfig | undefined {
  return DASHBOARDS.find(d => d.id === id);
}

/**
 * Get default dashboard (first in list)
 */
export function getDefaultDashboard(): DashboardConfig {
  return DASHBOARDS[0];
}
