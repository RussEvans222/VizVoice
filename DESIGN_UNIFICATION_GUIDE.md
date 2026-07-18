# VizVoice Design Unification Guide

## Goal: Create Visual Harmony Between Tableau Dashboard + React UI

**Challenge:** Tableau Next does not expose programmatic styling APIs. We cannot extract its colors or inject custom CSS.

**Solution:** Match React UI to Tableau's standard palette rather than fighting the dashboard's default appearance.

---

## Color Palette Strategy

### Unified Color System (Tableau 10 + WCAG AA)

**Primary Palette:**
```css
--tableau-blue: #4E79A7       /* Primary brand color */
--tableau-teal: #76B7B2       /* Accent color */
--tableau-orange: #F28E2B     /* Highlight/CTA */
--tableau-red: #E15759        /* Error states */
--tableau-green: #59A14F      /* Success states */
```

**Why Tableau 10?**
1. ✅ Colorblind-safe (tested with deuteranopia)
2. ✅ WCAG AA compliant when used correctly
3. ✅ Matches Tableau's default chart colors
4. ✅ Professional, data-focused aesthetic
5. ✅ Works in grayscale (print/accessibility)

---

## React UI Component Styling

### Header (Voice Assistant Panel)

**Current:** Gradient purple/indigo (doesn't match Tableau)
**Recommendation:** Use Tableau blue as primary

```tsx
// BEFORE (mismatched)
<header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">

// AFTER (unified)
<header className="bg-gradient-to-r from-[#4E79A7] to-[#3A5A7F]">
  {/* Subtle gradient within same hue family */}
</header>
```

**Typography:**
- Font: System sans-serif stack (matches Tableau's UI font)
- Header: 18px bold (--font-size-lg)
- Body: 14px regular (--font-size-sm)
- Captions: 12px regular (--font-size-xs)

---

### Message Bubbles

**User Messages (Speech Input):**
```tsx
// Use Tableau blue
className="bg-[#4E79A7] text-white rounded-2xl px-4 py-3"
```

**Agent Messages (Responses):**
```tsx
// Clean white with subtle border
className="bg-white text-gray-800 border border-gray-200 rounded-2xl px-4 py-3"
```

**Timestamp:**
```tsx
// Low contrast for hierarchy
className="text-xs text-gray-400 mt-1"
```

---

### Microphone Button

**Idle State:**
```tsx
className="bg-gradient-to-br from-[#4E79A7] to-[#3A5A7F] 
           hover:from-[#3A5A7F] hover:to-[#2A4A6F]"
```

**Listening State:**
```tsx
className="bg-gradient-to-br from-[#E15759] to-[#C62828] animate-pulse"
```

**Disabled State:**
```tsx
className="bg-gray-300 cursor-not-allowed"
```

---

### Status Badges

**Continuous Mode Active:**
```tsx
className="bg-[#59A14F] text-white border-[#4A8C42]"
```

**Error State:**
```tsx
className="bg-[#E15759] text-white"
```

**Info State:**
```tsx
className="bg-[#4E79A7] text-white"
```

---

## Tableau Dashboard Customization

**What YOU CAN control in Tableau Desktop/Cloud:**

### 1. Color Palette Selection

**In Tableau Desktop:**
1. Open your TransitData workbook
2. **Preferences → Color Palette → Tableau 10**
3. Apply to all sheets

**Why Tableau 10?**
- Already our React UI palette
- Ensures visual consistency
- Accessible by default

---

### 2. Dashboard Background

**Current:** Default white background (good!)

**Recommendation:** Keep white or very light gray (#FAFAFA)

**Why?**
- Maximum contrast for text (WCAG AA)
- Matches React UI background
- Professional appearance

**To change:**
1. Dashboard → Format → Shading
2. Background: `#FFFFFF` or `#FAFAFA`

---

### 3. Font Consistency

**Tableau Default Font:** Tableau (proprietary)

**React UI Font:** System sans-serif stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...
```

**Can't match exactly, but close enough:**
- Tableau's font is clean, modern, sans-serif
- System fonts are similar enough that mismatch is subtle
- **Do NOT try to override Tableau fonts** (unsupported)

**Font Sizes in Tableau:**
1. Select text elements
2. Format → Font → Size
3. Use consistent sizes:
   - Title: 18pt
   - Headers: 14pt
   - Body: 12pt
   - Captions: 10pt

---

### 4. Chart Titles and Labels

**Add Clear, Descriptive Titles:**
```
❌ "Sheet 1"
❌ "Viz"
✅ "Cancelled Trips by Delay Cause"
✅ "Monthly Ridership Trends by Line"
```

**Why?**
- Screen reader users hear titles
- Provides context without visual inspection
- Professional presentation

---

### 5. Tooltip Formatting

**Customize Tooltips for Voice Readability:**

**Current Tooltip (default):**
```
Line: Blue Line
Cancelled Trips: 41
```

**Enhanced Tooltip (voice-friendly):**
```
Line: Blue Line
Total Cancelled Trips: 41
Top Cause: Traffic (18 trips)
```

**To edit:**
1. Select mark type
2. Tooltip → Insert → Field Values
3. Write complete sentences for voice narration

---

### 6. Color Legend Placement

**Best Practice:** Place legends at **top or left** (not right/bottom)

**Why?**
- Screen reader users navigate left-to-right, top-to-bottom
- Encounter legend BEFORE chart (provides context)

**To move:**
1. Drag legend container
2. Dashboard → Layout → Floating → Position: Top

---

### 7. Alt Text for Dashboards (Tableau 2021.1+)

**Tableau DOES support alt text for entire dashboards:**

1. Dashboard → Dashboard → Alt Text
2. **DO NOT auto-generate** (Tableau's auto-alt is poor)
3. Write custom alt text:

**Example:**
```
This dashboard shows transit system performance across five lines 
(Blue, Green, Red, Route 12, Route 28) for the year 2025. 
The top heatmap displays cancelled trips by month and line, 
with darker red indicating more cancellations. November shows 
the highest cancellations for Route 28 at 41 trips. 
The bar chart at bottom left shows delay causes, with Traffic 
being the leading cause at 312 trips. The scatter plot at 
bottom right compares ridership (x-axis) to delays (y-axis) 
by line, showing Green Line has the highest ridership at 
2.7 million.
```

**Character Limit:** 1000 characters (be concise)

---

## Layout Considerations

### Side-by-Side vs. Stacked Layout

**Option A: Side-by-Side (Desktop)**
```
┌─────────────────┬──────────────────┐
│                 │   VizVoice       │
│   Tableau       │   Voice Panel    │
│   Dashboard     │   (420px wide)   │
│                 │                  │
└─────────────────┴──────────────────┘
```

**Pros:**
- Dashboard always visible while chatting
- Easy to reference specific charts by voice
- Natural workflow: see data → ask questions

**Cons:**
- Reduces dashboard width (less space for charts)

---

**Option B: Stacked (Mobile-First)**
```
┌──────────────────────────────────┐
│   VizVoice Voice Panel           │
│   (Sticky header)                │
├──────────────────────────────────┤
│                                  │
│   Tableau Dashboard              │
│   (Full width)                   │
│                                  │
└──────────────────────────────────┘
```

**Pros:**
- Dashboard gets full width (better for mobile)
- Collapsible voice panel for more space

**Cons:**
- Can't see charts while reading chat history

---

**Recommendation: Responsive Hybrid**
```typescript
// Desktop (> 1024px): Side-by-side
<div className="flex">
  <div className="flex-1">{/* Tableau */}</div>
  <div className="w-[420px]">{/* Voice Panel */}</div>
</div>

// Mobile (< 1024px): Stacked
<div className="flex flex-col">
  <div className="h-[60vh]">{/* Tableau */}</div>
  <div className="h-[40vh]">{/* Voice Panel */}</div>
</div>
```

---

## Embedding Tableau Next Dashboard

### Tableau Embedding API V3

**HTML Structure:**
```html
<div id="tableau-container" class="tableau-wrapper">
  <tableau-viz
    id="tableau-viz"
    src="https://orgfarm-aac260ab62-dev-ed.my.salesforce.com/analytics/wave/visualization/..."
    width="100%"
    height="100%"
    toolbar="hidden"
    mobile="yes"
  ></tableau-viz>
</div>
```

**CSS Styling:**
```css
.tableau-wrapper {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* Ensure responsive */
tableau-viz {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 600px;
}
```

---

### Wait for Dashboard Load Before Firing Voice Greeting

**CRITICAL:** VizVoice greeting should only fire AFTER dashboard is loaded.

```typescript
import { TableauViz } from '@tableau/embedding-api';

const viz = document.getElementById('tableau-viz') as TableauViz;

viz.addEventListener('firstinteractive', () => {
  console.log('Dashboard loaded, ready for voice interaction');
  // Fire welcome message
  speak(WELCOME_MESSAGE);
});
```

**Why?**
- Agent needs `targetEntityId` and `analyticsTabId` from dashboard context
- Without dashboard, agent returns: "I need more context to understand your question"

---

## Typography Scale

**Unified Type System:**

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Page title) | 24px | 700 | 1.25 |
| H2 (Section header) | 20px | 600 | 1.25 |
| H3 (Subsection) | 18px | 600 | 1.25 |
| Body | 16px | 400 | 1.5 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.5 |
| Button | 14px | 500 | 1 |

**In Tableau:**
- Match these sizes where possible (within ±2pt is fine)

---

## Spacing System

**8px Base Grid:**
```css
--space-1: 4px
--space-2: 8px    /* Base unit */
--space-3: 12px
--space-4: 16px   /* Common padding */
--space-6: 24px   /* Section spacing */
--space-8: 32px   /* Large gaps */
```

**Apply Consistently:**
- Card padding: `var(--space-4)` (16px)
- Section gaps: `var(--space-6)` (24px)
- Page margins: `var(--space-8)` (32px)

---

## Border Radius

**Unified Rounding:**
```css
--radius-sm: 4px    /* Badges, chips */
--radius-md: 8px    /* Buttons, inputs */
--radius-lg: 12px   /* Cards */
--radius-xl: 16px   /* Message bubbles */
--radius-full: 9999px  /* Circular buttons */
```

**In Tableau:**
- Dashboard border radius: Not configurable (accept default)
- Floating containers: Keep rectangular (Tableau default)

---

## Shadow System

**Elevation Hierarchy:**
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)      /* Subtle depth */
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)       /* Cards */
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)     /* Modals */
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1)     /* Popovers */
```

**Usage:**
- Voice panel: `shadow-lg`
- Message bubbles: `shadow-sm`
- Microphone button: `shadow-lg`

---

## Responsive Breakpoints

**Match Tableau's Device-Specific Dashboard (DSD) breakpoints:**

```css
/* Phone */
@media (max-width: 767px) {
  /* Stack layout, full-width panels */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Side-by-side if space allows */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Optimal side-by-side layout */
}
```

**Tableau DSD Setup:**
1. Dashboard → Device Preview
2. Create layouts for: Phone (320px), Tablet (768px), Desktop (1440px)
3. Simplify charts for mobile (fewer metrics, larger touch targets)

---

## Testing Checklist

### Visual Consistency
- [ ] Colors match between React UI and Tableau charts
- [ ] Typography sizes are similar (within 2pt)
- [ ] Spacing feels consistent (no jarring gaps)
- [ ] Border radius matches (rounded corners vs. sharp edges)
- [ ] Shadows create unified depth hierarchy

### Accessibility
- [ ] All text meets WCAG AA contrast (4.5:1)
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader announces dashboard load
- [ ] Keyboard navigation works throughout
- [ ] Reduced motion preference respected

### Responsive Design
- [ ] Layout works on phone (320px)
- [ ] Layout works on tablet (768px)
- [ ] Layout works on desktop (1440px+)
- [ ] Voice panel doesn't crush dashboard
- [ ] Touch targets are 48×48px minimum on mobile

---

## Tools for Validation

**Color Contrast:**
```bash
# Install axe DevTools Chrome extension
# Right-click → Inspect → axe DevTools → Scan
```

**Responsive Testing:**
```bash
# Chrome DevTools Device Mode
# Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)
# Test: iPhone SE (375px), iPad (768px), Laptop (1440px)
```

**Screen Reader Testing:**
- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA (free download)

---

## Quick Wins for Today

1. **Update VoiceAssistant header** to use Tableau blue instead of purple
2. **Import design tokens** into your component
3. **Set Tableau dashboard background** to white (#FFFFFF)
4. **Apply Tableau 10 color palette** to all charts
5. **Add dashboard alt text** in Tableau Desktop
6. **Test side-by-side layout** at 1440px width

---

## Future Enhancements

**Theme Switching:**
- Add light/dark mode toggle
- Detect `prefers-color-scheme: dark`
- Store preference in localStorage

**Custom Voice:**
- Let users choose TTS voice (AWS Polly offers 16+ voices)
- Adjust speech rate (0.5× to 2× speed)
- Adjust pitch (-10 to +10 semitones)

**Branding:**
- Allow org admins to override color palette
- Upload custom logo
- Match org's Salesforce theme
