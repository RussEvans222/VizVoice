# VizVoice Design Unification - Quick Start

## ✅ What We Just Fixed

### 1. **Unified Color Palette (Tableau Blue)**
- Changed header from purple/indigo → **Tableau Blue (#4E79A7)**
- User message bubbles now use Tableau Blue
- Microphone button uses Tableau Blue (idle) and Tableau Red (listening)
- Success badges use Tableau Green (#59A14F)
- Error states use Tableau Red (#E15759)

### 2. **Fixed Critical Accessibility Bug**
- ❌ **BEFORE:** Entire message container had `aria-live="assertive"` → spam screen readers
- ✅ **AFTER:** Dedicated sr-only live region announces ONLY new messages

### 3. **Added Design Token System**
- Created `/src/styles/design-tokens.css` with:
  - Tableau 10 colorblind-safe palette
  - WCAG AA compliant color combinations
  - Typography scale, spacing system, shadows
  - Reduced motion support
  - Screen reader utilities

---

## 🎯 Next Steps for You (Tableau Dashboard)

### In Tableau Desktop/Cloud:

1. **Apply Tableau 10 Color Palette**
   - Open your TransitData workbook
   - Preferences → Color Palette → **Tableau 10**
   - Apply to all sheets

2. **Set Dashboard Background to White**
   - Dashboard → Format → Shading
   - Background: `#FFFFFF`

3. **Add Dashboard Alt Text**
   - Dashboard → Dashboard → Alt Text
   - Write a 200-300 word description of what's on screen
   - Example template in `ACCESSIBILITY.md`

4. **Improve Chart Titles**
   - Replace generic titles ("Sheet 1") with descriptive ones
   - ❌ "Viz"
   - ✅ "Cancelled Trips by Delay Cause"

5. **Customize Tooltips for Voice**
   - Edit tooltips to use complete sentences
   - Include context: "Total Cancelled Trips: 41 (Top Cause: Traffic)"

---

## 📁 Documentation Files

| File | Purpose |
|------|---------|
| `ACCESSIBILITY.md` | Full WCAG 2.1 AA compliance guide, screen reader instructions, language design rules |
| `DESIGN_UNIFICATION_GUIDE.md` | Deep dive on color palette, typography, responsive layout, Tableau embedding |
| `QUICK_START_DESIGN.md` | This file - quick summary of changes |
| `/src/styles/design-tokens.css` | CSS variables for unified design system |

---

## 🧪 Testing Your Changes

### Visual Check:
```bash
npm run dev
# Open http://localhost:5173
# Look at:
# - Header should be BLUE (not purple)
# - Message bubbles should be BLUE (user) / WHITE (agent)
# - Mic button should be BLUE (idle) / RED (listening)
```

### Screen Reader Test (macOS):
```bash
# Enable VoiceOver
Cmd+F5

# Navigate to VizVoice
Tab through interface

# Activate voice assistant
Alt+V

# Speak a test question
"What's the leading cause of delays?"

# Listen for announcement
# Should hear BOTH TTS voice AND screen reader announcing response
```

### Color Contrast Check:
```bash
# Use Chrome DevTools
Right-click → Inspect → Elements
# Click any text element
# Look for contrast ratio in Styles panel
# Should see: "Contrast ratio: 4.5:1 ✅"
```

---

## 🎨 Tableau Next Integration

### Embedding the Dashboard:

```typescript
import { TableauViz } from '@tableau/embedding-api';

// Wait for dashboard to load
const viz = document.getElementById('tableau-viz') as TableauViz;

viz.addEventListener('firstinteractive', () => {
  console.log('Dashboard ready!');
  // NOW fire the voice greeting
  speak(WELCOME_MESSAGE);
});
```

### Side-by-Side Layout:

```tsx
<div className="flex h-screen">
  {/* Tableau Dashboard */}
  <div className="flex-1 p-4">
    <tableau-viz
      src="https://your-org.salesforce.com/analytics/wave/..."
      width="100%"
      height="100%"
      toolbar="hidden"
    />
  </div>

  {/* VizVoice Voice Panel */}
  <div className="w-[420px] border-l border-gray-200">
    <VoiceAssistant />
  </div>
</div>
```

---

## 🏆 Hackathon Readiness Checklist

### Design Unification:
- [x] React UI uses Tableau Blue palette
- [ ] Tableau dashboard uses Tableau 10 colors
- [ ] Dashboard background is white
- [ ] Font sizes are consistent (±2pt is fine)

### Accessibility:
- [x] Screen reader live regions implemented correctly
- [x] Keyboard navigation (Alt+V shortcut)
- [x] Color contrast meets WCAG AA (4.5:1)
- [ ] Dashboard alt text added in Tableau
- [ ] Agent system prompt includes accessibility rules

### Testing:
- [ ] Tested with VoiceOver (Mac) or JAWS (Windows)
- [ ] Tested keyboard-only navigation
- [ ] Tested with Color Oracle (colorblind simulator)
- [ ] Lighthouse accessibility score 95+

### Before Demo Recording:
- [ ] Test voice greeting fires AFTER dashboard loads
- [ ] Test asking questions about actual dashboard data
- [ ] Test continuous mode (hands-free conversation)
- [ ] Have a blind tester use VizVoice and provide feedback

---

## 🚨 Common Issues

**Issue:** Voice greeting fires before dashboard loads
**Fix:** Use `firstinteractive` event listener (see embedding code above)

**Issue:** Screen reader reads every message twice
**Fix:** Already fixed! Live region is now sr-only and separate from visual chat.

**Issue:** Colors don't match between React and Tableau
**Fix:** Use Tableau 10 palette in Tableau Desktop (see Step 1 above)

**Issue:** Microphone permission denied
**Fix:** Already handled! Permission prompt shows helpful troubleshooting banner.

---

## 📊 Design Token Reference

### Colors (use these everywhere):
```css
--tableau-blue: #4E79A7       /* Primary */
--tableau-teal: #76B7B2       /* Accent */
--tableau-red: #E15759        /* Error */
--tableau-green: #59A14F      /* Success */
--tableau-orange: #F28E2B     /* Highlight */
```

### Typography:
```css
--font-size-xs: 12px    /* Captions */
--font-size-sm: 14px    /* Body */
--font-size-base: 16px  /* Body, buttons */
--font-size-lg: 18px    /* Headers */
```

### Spacing:
```css
--space-2: 8px     /* Tight gaps */
--space-4: 16px    /* Standard padding */
--space-6: 24px    /* Section spacing */
```

---

## 💡 Pro Tips

1. **Don't fight Tableau's look** - Accept its default UI, focus on color harmony
2. **Test with real users** - Especially blind testers for accessibility validation
3. **Record demo in stages** - Show dashboard → activate voice → ask questions → get answers
4. **Emphasize the gap** - Tableau charts = unlabeled SVG (screen readers see nothing) → VizVoice fills this

---

## 🔗 Resources

- Tableau 10 Color Palette: https://www.tableau.com/about/blog/2016/4/examining-data-viz-rules-dont-use-red-green-together-53463
- WCAG Contrast Checker: https://webaim.org/resources/contrastchecker/
- ARIA Live Regions: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
- Tableau Embedding API V3: https://help.tableau.com/current/api/embedding_api/en-us/

---

## 🎬 Ready to Test!

Run your app and see the unified blue design:
```bash
npm run dev
```

Then work on the Tableau dashboard side (Steps 1-5 above) to complete the visual harmony.
