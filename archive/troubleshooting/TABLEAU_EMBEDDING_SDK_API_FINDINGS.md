# Tableau Next Embedding SDK - API Findings from Slack

Extracted from internal Slack search results in #help-tableau-next channel (18 messages analyzed).

---

## 1. Programmatic Filter APIs

### Filter Methods

**Setting filters on a dashboard:**
```javascript
dashboard.filters = [filterArray];
await dashboard.render();
```

The `filters` property is **set before** calling `render()`. Filters are applied as an array.

### Filter Syntax - Field Value Filter (In Operator)

```javascript
const filters = [
  {
    dataSource: 'DataSourceName',      // Name of the data source
    fieldName:  'field_api_name',      // API name of the field
    values:     ['value1', 'value2'],  // Array of filter values
    operator:   FilterOperator.In      // or string 'In' if FilterOperator unavailable
  }
];

dashboard.filters = filters;
```

**Real example from production LWC code:**
```javascript
const filters = [
  {
    dataSource: this.sourceName,
    fieldName:  this.fieldName,
    values:     [this.taxId],
    operator:   FilterOperator ? FilterOperator.In : 'In'
  }
];

// Add additional filter conditionally
if (this.state && this.stateSourceName && this.stateFieldName) {
  filters.push({
    dataSource: this.stateSourceName,
    fieldName:  this.stateFieldName,
    values:     [this.state],
    operator:   FilterOperator ? FilterOperator.In : 'In'
  });
}

console.log('Applying filters:', JSON.stringify(filters));
this.analyticsDashboard.filters = filters;
```

### Filter Syntax - Relative Date Filter

```javascript
dashboard.filters = [
  {
    type: "relativeDate",
    fieldId: {
      fieldName: "E360_Agents_RequestMetrics1_requested_at",
      objectName: "Agent_Metrics_lv",
    },
    options: {
      min: {
        periodType: "day",      // "day", "week", "month", etc.
        rangeType: "lastN",      // "lastN", "current", etc.
        rangeN: 90,              // number of periods (for lastN)
      },
      max: {
        periodType: "day",
        rangeType: "current",    // current period
      },
    },
  },
];
```

### FilterOperator Enum

Available from the SDK:
```javascript
const { FilterOperator } = window.embeddedSDK;
// or
import { FilterOperator } from 'sdk-bundle.module.js';
```

Known operators:
- `FilterOperator.In` - matches any value in the array

---

## 2. Event Listeners

### Available Events

**Two events confirmed from code examples:**

1. **FIRST_INTERACTIVE** - Dashboard has loaded and is ready for interaction
2. **ERROR** - An error occurred

### Event Listener Syntax

```javascript
dashboard.addEventListener("FIRST_INTERACTIVE", (event) => {
  console.log("Dashboard is interactive!", event);
});

dashboard.addEventListener("ERROR", (event) => {
  console.error("Dashboard error:", event);
});
```

### Usage Pattern

Event listeners are added **after** creating the dashboard object but **after** calling `render()`:

```javascript
const dashboard = new AnalyticsDashboard({
  parentIdOrElement: "analytics-container",
  idOrApiName: "Agent_Analytics",
  height: "500",
});

dashboard.filters = [...];
await dashboard.render();

// Add event listeners
dashboard.addEventListener("FIRST_INTERACTIVE", (event) => {
  console.log("Dashboard is interactive!", event);
});

dashboard.addEventListener("ERROR", (event) => {
  console.error("Dashboard error:", event);
});
```

---

## 3. Dashboard Initialization & Configuration

### SDK Import

**ES6 Module:**
```javascript
import { initializeAnalyticsSdk, AnalyticsDashboard, FilterOperator } 
  from './sdk-bundle.module.js';
```

**Window global (LWC pattern):**
```javascript
const { initializeAnalyticsSdk, AnalyticsDashboard, FilterOperator } = window.embeddedSDK;
```

### Complete Initialization Pattern

```javascript
// 1. Initialize SDK with auth
await initializeAnalyticsSdk({
  authCredential: access_token,  // OAuth access token
  orgUrl: "https://yourorg.lightning.force.com",
});

// 2. Create dashboard instance
const dashboard = new AnalyticsDashboard({
  parentIdOrElement: "analytics-container",  // DOM element ID or reference
  idOrApiName: "Dashboard_API_Name",         // Dashboard API name
  height: "500",                             // Height in pixels (string or number)
});

// 3. Set filters (optional)
dashboard.filters = [...];

// 4. Render
await dashboard.render();

// 5. Add event listeners
dashboard.addEventListener("FIRST_INTERACTIVE", (event) => {
  // Dashboard ready
});
```

### Dashboard Configuration Properties

```javascript
const dashboardProps = {
  parentIdOrElement: container,   // Required: DOM element or ID string
  idOrApiName: 'Dashboard_Name',  // Required: Dashboard API name
  height: "500",                  // Optional: height in pixels
  // Note: width not shown in examples - may inherit from container
};

const dashboard = new AnalyticsDashboard(dashboardProps);
```

---

## 4. Dashboard State Capture

### Current State

**No direct API found for reading dashboard state programmatically** in the code examples.

The pattern shown is **unidirectional** - you **set** filters via `dashboard.filters`, but no examples show:
- Reading current filter state
- Getting visualization state
- Querying what filters are active

### Workaround Pattern

The LWC example shows maintaining state externally:
```javascript
// Track filter state in component properties
@api state = '';
@api stateFieldName = '';
@api stateSourceName = '';

// Apply filters from component state
this.analyticsDashboard.filters = [/* build from properties */];
```

**Implication for VizVoice:** You'll need to:
1. Track filter state in your React component state
2. When applying a voice-driven filter change, update both:
   - Your local state
   - `dashboard.filters`

---

## 5. Lifecycle Methods

### Cleanup

```javascript
// Commented-out example suggests this exists:
// dashboard.destroy();
```

React pattern:
```javascript
useEffect(() => {
  // ... initialize dashboard ...
  
  return () => {
    if (dashboard) dashboard.destroy();
  };
}, []);
```

---

## 6. Accessibility Features

**No explicit ARIA, keyboard navigation, or screen reader APIs found** in the Slack search results.

### Gap Identified

One message mentions:
> "the gap here is that we initially blocked exposing viz actions for 3P embedding - this currently not in our immediate plans"

This suggests **visualization interactions** (drill-down, tooltips, etc.) are not exposed to embedding apps.

### Recommendations for VizVoice

Since the SDK doesn't expose accessibility features:

1. **Wrap the dashboard with custom ARIA annotations:**
   ```jsx
   <div role="img" aria-label={dashboardDescription}>
     <div id="analytics-container" aria-hidden="true" />
   </div>
   <div role="region" aria-live="polite" aria-atomic="true">
     {/* Mirror agent responses here for screen readers */}
   </div>
   ```

2. **Use FIRST_INTERACTIVE event to trigger voice greeting:**
   ```javascript
   dashboard.addEventListener("FIRST_INTERACTIVE", () => {
     // Fire voice greeting: "Dashboard loaded: Q3 Sales Performance"
     announceToScreenReader("Dashboard loaded");
   });
   ```

3. **Provide keyboard shortcuts externally** (SDK doesn't expose keyboard nav)

---

## 7. Key Documentation Links

### Official SDK Docs (External)
- **Beta Guide (PDF):** https://resources.docs.salesforce.com/rel1/doc/en-us/static/pdf/TableauEinsteinEmbeddingSDKGuideBeta.pdf
- **Public SDK Overview:** https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-overview.html
- **Public API Reference:** https://developer.salesforce.com/docs/analytics/sdk/overview

### Internal Resources
- **Internal API Reference:** http://review-app-sdanalcrm-pr-44.herokuapp.com/docs/analytics/te-sdk/references/te-sdk-markdown-ref/README.html
- **Embedded Analytics Resource Hub:** Slack canvas (internal only)
- **Demo Playground:** https://tabnext-ext-embedding-demo-9747780ddb4b.herokuapp.com/

---

## 8. Known Limitations & Gaps

### Portal Users Not Supported (as of June 2026)
> "Today, Tableau next does not work for Portal users. we're actively working on opening up the platform for them."
> "Even with the SDK, portal users won't still be able to access tableau next"

**Workaround:** Full Salesforce user licenses required for embedded access.

### Experience Cloud Native Support
> "Tableau Next isn't natively supported in Experience Cloud today and the Embedding SDK is the workaround"

**Timeline:** "Our plan is to come up with an embedding friendly licensing model + OOTB support for embedding tab next in experience cloud. At this point, this work could pull into end of this year" (2026)

### Viz Actions / Interactions
> "we initially blocked exposing viz actions for 3P embedding - this currently not in our immediate plans"

**Impact:** Drill-downs, tooltips, and interactive chart actions not accessible via SDK.

---

## 9. Code Example Summary for VizVoice

### Recommended Pattern

```javascript
import { useEffect, useRef } from 'react';

export default function VizVoiceDashboard({ dashboardApiName, onDashboardReady }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    let dashboard;
    
    (async () => {
      try {
        // 1. Import SDK
        const { initializeAnalyticsSdk, AnalyticsDashboard, FilterOperator } = 
          await import('/sdk-bundle.module.js');
        
        // 2. Get auth token from backend
        const res = await fetch('/api/salesforce/auth');
        const { access_token } = await res.json();
        
        // 3. Initialize SDK
        await initializeAnalyticsSdk({
          authCredential: access_token,
          orgUrl: 'https://orgfarm-aac260ab62-dev-ed.my.salesforce.com',
        });
        
        // 4. Create dashboard
        dashboard = new AnalyticsDashboard({
          parentIdOrElement: 'analytics-container',
          idOrApiName: dashboardApiName,
          height: '600',
        });
        
        // 5. Apply initial filters (if any)
        // dashboard.filters = [...];
        
        // 6. Render
        await dashboard.render();
        
        // 7. Listen for ready event
        dashboard.addEventListener('FIRST_INTERACTIVE', (event) => {
          console.log('Dashboard interactive', event);
          // CRITICAL: Fire voice greeting ONLY after this event
          onDashboardReady(dashboard);
        });
        
        dashboard.addEventListener('ERROR', (event) => {
          console.error('Dashboard error', event);
        });
        
      } catch (e) {
        console.error('Dashboard embed error', e);
      }
    })();
    
    return () => {
      if (dashboard) dashboard.destroy();
    };
  }, [dashboardApiName]);
  
  return (
    <div role="img" aria-label="Tableau dashboard - use voice to query">
      <div 
        id="analytics-container" 
        ref={containerRef}
        aria-hidden="true"
        style={{ minHeight: 600 }}
      />
    </div>
  );
}
```

---

## 10. Filter Application for Voice Commands

### Pattern for Voice-Driven Filter Changes

```javascript
// User says: "Filter to Q3 only"

// 1. Update local state
setCurrentFilters([
  {
    dataSource: 'Sales_Data',
    fieldName: 'Quarter',
    values: ['Q3'],
    operator: FilterOperator.In,
  }
]);

// 2. Apply to dashboard
dashboard.filters = currentFilters;

// 3. Re-render (may not be needed - test this)
// await dashboard.render();

// 4. Announce change
announceToUser("Filtered to Q3 data");
```

**Note:** It's unclear from examples whether `dashboard.render()` must be called again after changing filters, or if setting `dashboard.filters` triggers an automatic update. Test both approaches.

---

## Summary

### What We Know
- Filter API works via `dashboard.filters = [...]` with field-value and relative-date filter types
- Two event listeners: `FIRST_INTERACTIVE` and `ERROR`
- Basic dashboard config: `parentIdOrElement`, `idOrApiName`, `height`
- SDK modules: `initializeAnalyticsSdk`, `AnalyticsDashboard`, `FilterOperator`
- Cleanup: `dashboard.destroy()`

### What We Don't Know
- How to **read** current dashboard state programmatically
- Whether filter changes require re-calling `render()`
- Full list of available events (only 2 confirmed)
- Whether viz interactions (drill-downs, tooltips) fire events
- ARIA/accessibility support built into SDK
- Whether dashboard width can be set (only height shown)

### Critical Gaps for VizVoice
1. **No state capture API** - must track filters externally
2. **No accessibility APIs** - must wrap with custom ARIA
3. **No keyboard navigation exposed** - must implement externally
4. **Limited event types** - may not get notifications of user interactions with charts

### Next Steps
1. Test the SDK directly in the VizVoice org to confirm undocumented features
2. Check the internal API reference for additional methods/events
3. Implement external state tracking for voice-driven filter changes
4. Add custom ARIA live regions for screen reader support
