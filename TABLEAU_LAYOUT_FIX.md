# Tableau Dashboard Layout Fix

**Issue**: Heatmap and bottom bar chart don't span the full width of the dashboard.

**Solution**: Adjust the dashboard layout in Tableau to make these charts extend across the entire width.

---

## Manual Fix in Tableau Desktop/Tableau Next

### Option 1: Drag to Resize (Quickest)

1. **Open the dashboard** in edit mode
2. **Click on the heatmap** (Cancelled Trips by Line & Month)
3. **Drag the right edge** all the way to the right side of the dashboard canvas
4. **Click on the bottom chart** (On-Time Performance)
5. **Drag the right edge** all the way to the right side

### Option 2: Container Layout (More Control)

#### Step 1: Check Current Layout

1. Open dashboard in edit mode
2. Click **Layout** tab (right sidebar)
3. Select the heatmap worksheet
4. Look at the container structure

#### Step 2: Make Full-Width

**If the charts are in a horizontal container with other elements:**

1. Select the **heatmap worksheet**
2. In Layout tab:
   - **Width**: Set to "Automatic" or "Entire View"
   - **Height**: Keep as-is
3. Drag the heatmap to span the full width manually

**If the charts are in a tiled layout:**

1. Dashboard → **Layout** → Select "Tiled" objects
2. Click the heatmap
3. Drag to expand horizontally across the full width
4. Repeat for the bottom bar chart

#### Step 3: Fix Container Structure

**Ideal layout structure** (top to bottom):

```
Dashboard Container (Tiled)
├── Logo + Title Row (Tiled, horizontal container)
│   ├── Logo (Fixed width)
│   └── Title (Automatic width)
├── Heatmap (Full width, tiled)
├── Middle Row (Horizontal container)
│   ├── Delay Bar Chart (50% width)
│   └── Ridership Scatter (50% width)
└── Bottom Bar Chart (Full width, tiled)
```

**To restructure:**

1. **Dashboard menu** → **Actions** → **Clear Layout** (if needed to start fresh)
2. Drag worksheets in this order:
   - Logo/Title → Top
   - Heatmap → Below logo, **drag to full width**
   - Delay chart → Below heatmap, **left side**
   - Ridership chart → Next to delay chart, **right side**
   - On-Time chart → Bottom, **drag to full width**

---

## Specific Steps for Your Dashboard

### For the Heatmap (Cancelled Trips)

1. Click on the **heatmap worksheet** in the dashboard
2. Look at the **Dashboard** pane (left sidebar)
3. Check if there's a **"Delay Cause" filter** or other object next to it
4. If yes:
   - **Move the filter** to the top (near the logo)
   - **OR** delete it if not needed
5. Drag the heatmap's **right edge** all the way to the right
6. Set **Width** in Layout tab:
   - **Option A**: "Automatic" (fills available space)
   - **Option B**: "Entire View" (maximizes to dashboard width)

### For the Bottom Chart (On-Time Performance)

1. Click on the **bar chart** at the bottom
2. Check if there are any objects to the right of it
3. If yes, **move them above** or **delete** if not critical
4. Drag the chart's **right edge** to the right edge of the dashboard
5. Set **Width** in Layout tab:
   - "Automatic" or "Entire View"

---

## Programmatic Fix (If You Can Edit the .twb File)

If you have access to the Tableau workbook file (`.twb` or `.twbx`), you can edit the XML directly:

### Step 1: Download the Workbook

From Tableau Next:
1. Go to the workbook page
2. Click **...** (More Actions)
3. **Download** → Save as `.twbx`

### Step 2: Extract and Edit

```bash
# Extract the .twbx
unzip TransitData.twbx -d TransitData_extracted
cd TransitData_extracted

# Open the .twb file in a text editor
# Find the dashboard definition
```

### Step 3: Locate the Layout XML

Look for the dashboard zone definitions:

```xml
<dashboard name="TransitData">
  <zones>
    <zone name="heatmap-zone" width="800" height="300" ...>
      <!-- Heatmap worksheet -->
    </zone>
    <zone name="bottom-chart-zone" width="800" height="400" ...>
      <!-- On-Time chart -->
    </zone>
  </zones>
</dashboard>
```

### Step 4: Change Width to "100%"

Replace fixed widths with percentage-based or auto:

```xml
<!-- OLD -->
<zone name="heatmap-zone" width="800" height="300">

<!-- NEW -->
<zone name="heatmap-zone" width="100%" height="300">
```

OR use the `type="automatic"` attribute:

```xml
<zone name="heatmap-zone" type="automatic" height="300">
```

### Step 5: Repackage and Upload

```bash
# Zip it back up
cd TransitData_extracted
zip -r ../TransitData_fixed.twbx *

# Upload to Tableau Next via the UI
```

---

## Quick Visual Guide

**Current Layout** (from your screenshot):

```
┌──────────────────────────────────────────────┐
│ Logo + Title                    [Delay Filter]│
├──────────────────────────────────────────────┤
│ Heatmap (Cancelled Trips)      │ [Empty Space]│
│                                │              │
├──────────────┬───────────────────────────────┤
│ Delay Bars   │ Ridership Scatter             │
│              │                               │
├──────────────┴───────────────────────────────┤
│ On-Time Bars               │ [Empty Space]   │
└──────────────────────────────────────────────┘
```

**Target Layout** (full-width charts):

```
┌──────────────────────────────────────────────┐
│ Logo + Title                    [Delay Filter]│
├──────────────────────────────────────────────┤
│ Heatmap (Cancelled Trips) — FULL WIDTH       │
│                                              │
├──────────────┬───────────────────────────────┤
│ Delay Bars   │ Ridership Scatter             │
│              │                               │
├──────────────┴───────────────────────────────┤
│ On-Time Bars — FULL WIDTH                    │
└──────────────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: Charts won't resize past a certain point

**Cause**: There's a hidden object or container blocking the space.

**Fix**:
1. Dashboard → **Layout** tab
2. Select each object and check its **container parent**
3. Look for "Blank" objects in the dashboard pane (left sidebar)
4. Delete any blank/spacer objects
5. Try resizing again

### Issue: Charts resize but don't fill the space

**Cause**: The worksheet itself has a fixed size.

**Fix**:
1. Right-click the worksheet (in dashboard) → **Fit** → **Entire View**
2. Or go to the worksheet tab (bottom) → **Worksheet** menu → **Show Title** (hide if taking up space)
3. Check for legends/filters inside the worksheet taking up horizontal space

### Issue: Dashboard looks wrong after resizing

**Cause**: Tiled vs. Floating layout confusion.

**Fix**:
1. Dashboard → **Layout** tab → Select the chart
2. Check if it's **Tiled** or **Floating**
3. For full-width charts, use **Tiled** layout
4. If it's floating, right-click → **Floating** → Convert to **Tiled**

---

## Best Practices for Dashboard Layout

1. **Use Tiled layout** for main content areas (heatmap, bottom chart)
2. **Use Floating layout** for overlays (legends, filters, tooltips)
3. **Group related charts** in horizontal containers (delay bars + scatter plot)
4. **Set responsive sizing**: Use "Automatic" widths instead of fixed pixels
5. **Test on different screen sizes**: Dashboard → **Device Layouts** → Preview

---

## Alternative: Adjust Filter/Logo Placement

If you can't make the charts wider, consider moving elements:

### Move Delay Filter to Top Bar

1. **Drag the "Delay Cause" filter** from the right side
2. **Drop it next to the VizVoice logo** at the top
3. Now the heatmap and charts have full width available

### Shrink the Logo

1. Click on the **VizVoice logo** image
2. Layout tab → **Width**: Set to "Fixed" and reduce to 200px (from current ~300px)
3. This gives more horizontal space for charts

---

## Next Steps

1. **Open the dashboard** in Tableau Next editing mode
2. **Select the heatmap** → drag right edge to the right border
3. **Select the bottom chart** → drag right edge to the right border
4. **Save** the dashboard
5. **Refresh** the VizVoice app to see the changes

If you're editing in **Tableau Next (web UI)**, the process is the same — just use the dashboard editor's drag handles.

---

## Need Help?

If you can't edit the dashboard directly:
- Share a screenshot of the **Dashboard pane** (left sidebar showing all objects)
- Share a screenshot of the **Layout tab** (right sidebar) when heatmap is selected
- I can give more specific instructions based on the container structure

---

## Changelog

- **2026-07-18**: Initial guide for making heatmap and bottom chart full-width
