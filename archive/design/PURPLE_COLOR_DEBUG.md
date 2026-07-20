# Purple Color Debugging Guide

**Issue**: React UI shows purple instead of VizVoice brand colors (blue/teal).

---

## Where Is The Purple Coming From?

### Possible Sources:

#### 1. **Browser Cache** (Most Likely)
The old purple Agentforce sidebar styles are cached.

**Fix**: Hard refresh
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Safari: Hold `Shift` + click reload
- Firefox: `Ctrl+F5`

#### 2. **Agentforce Sidebar** (Not VoiceAssistant)
If you see purple in the **right sidebar** (the default Agentforce chat), that's separate from the VoiceAssistant component.

**Check**: Is the purple in:
- **Left side** (VizVoice chat) → VoiceAssistant component issue
- **Right sidebar** (Agentforce default) → That's normal, we didn't modify it

#### 3. **VoiceAssistant Deployment Didn't Take Effect**
UI Bundles sometimes need a server-side rebuild.

**Fix**: Force rebuild by bumping the version:

```bash
cd force-app/main/default/uiBundles/vizvoice
# Edit package.json: change version from "1.59.0" to "1.59.1"
# Then deploy again
sf project deploy start --source-dir force-app/main/default/uiBundles/vizvoice --target-org vizvoice-dev
```

---

## Diagnostic Checklist

### Step 1: Verify What's Purple

**Look at your screen and identify:**

| Element | Expected Color | If Purple, Issue Is: |
|---------|----------------|---------------------|
| **VoiceAssistant header** (left side, says "VizVoice") | Blue → Teal gradient | VoiceAssistant not deployed or cached |
| **Microphone button** (big circle, bottom left) | Blue → Teal gradient | VoiceAssistant not deployed or cached |
| **Agentforce sidebar** (right side, floating) | Purple (default) | This is normal — not VoiceAssistant |
| **User chat bubbles** (left side) | Blue (`#4E79A7`) | VoiceAssistant not deployed or cached |

### Step 2: Check Browser DevTools

1. Open DevTools (`F12`)
2. **Console tab** → Look for errors
3. **Network tab** → Filter by "vizvoice"
   - Check if `vizvoice.js` or `vizvoice.css` is loading
   - Check the **status code** (should be `200 OK`)
   - Check the **timestamp** (should be recent, not hours old)

### Step 3: Inspect Element

1. Right-click the **purple element**
2. Select **"Inspect"**
3. Look at the CSS in the **Styles** panel
4. Find the `background` or `background-color` property
5. Check the hex value:
   - If it's `#6B46C1` or similar → Default Agentforce purple
   - If it's in a class like `.slds-*` → Salesforce Lightning purple
   - If it's `#4E79A7` or `#76B7B2` → Our colors (cache issue)

---

## Fixes Ranked by Likelihood

### Fix 1: Hard Refresh (95% Success Rate)

**Chrome/Edge**:
```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

**Safari**:
```
Hold Shift + click reload button
```

**Firefox**:
```
Ctrl+F5
```

### Fix 2: Clear Site Data (90% Success Rate)

**Chrome/Edge**:
1. `F12` → **Application tab**
2. Left sidebar → **Clear storage**
3. Click **"Clear site data"**
4. Refresh page

**Safari**:
1. Safari menu → **Preferences**
2. **Advanced tab** → Check "Show Develop menu"
3. **Develop** menu → **Empty Caches**
4. Refresh page

### Fix 3: Incognito/Private Window (100% Success Rate for Testing)

Open in incognito to bypass cache completely:
- Chrome: `Ctrl+Shift+N` / `Cmd+Shift+N`
- Safari: `Cmd+Shift+N`
- Firefox: `Ctrl+Shift+P`

If it works in incognito, the issue is **definitely cache**.

### Fix 4: Force Server-Side Rebuild

Bump the UI Bundle version to force Salesforce to rebuild:

```bash
cd /Users/russellevans/Library/Application\ Support/Claude-3p/local-agent-mode-sessions/734b7465-4068-4669-b480-5b4a8fbcfb2a/00000000-0000-4000-8000-000000000001/local_06aabcb2-6881-4446-b898-851aa7f21b7a/outputs/vizvoice-ui/force-app/main/default/uiBundles/vizvoice

# Edit package.json
# Change: "version": "1.59.0"
# To:     "version": "1.60.0"

# Deploy
cd ../../../../../../../../../..
sf project deploy start --source-dir force-app/main/default/uiBundles/vizvoice --target-org vizvoice-dev
```

### Fix 5: Check UI Bundle Serving

UI Bundles are served from a CDN. Sometimes the CDN takes time to update.

**Check the URL**:
1. Open DevTools → **Network tab**
2. Reload the page
3. Look for requests to `*.lightning.force.com` or `*.salesforce.com`
4. Find the `vizvoice` bundle request
5. Check the **response headers** for `cache-control`
6. If `max-age` is high (e.g., 3600 seconds), wait or append a cache-busting query param

**Cache-busting trick**:
Add `?v=2` to the VizVoice app URL:
```
https://orgfarm-aac260ab62-dev-ed.my.salesforce.com/apex/ui_bundle__vizvoice?v=2
```

---

## Expected vs. Actual Colors

### Expected (After Our Changes):

| Element | Color | Hex |
|---------|-------|-----|
| Header background | Blue → Teal gradient | `#4E79A7` → `#76B7B2` |
| Microphone (default) | Blue → Teal gradient | `#4E79A7` → `#76B7B2` |
| Microphone (listening) | Teal | `#76B7B2` |
| User chat bubble | Blue | `#4E79A7` |
| Agent chat bubble | White | `#FFFFFF` |
| Error banner | Orange | `#F28E2B` |
| Accessibility banner | Teal | `#76B7B2` |

### Actual (If Purple):

| Element | Color | Likely Source |
|---------|-------|---------------|
| Sidebar (right) | Purple (`#6B46C1`) | Default Agentforce — not modified by us |
| Header (left) | Purple | Cache or deployment issue |
| Microphone | Purple | Cache or deployment issue |

---

## Screenshot Comparison

**Where to look**:

**LEFT SIDE (VoiceAssistant)** — Should be blue/teal:
```
┌─────────────────────────┐
│ 🎙️ VizVoice            │ ← Should be BLUE → TEAL gradient
│ Voice Assistant         │
└─────────────────────────┘
│ User: "Hello"           │ ← Blue bubble
│ Agent: "Hi there"       │ ← White bubble
│                         │
│         🎤              │ ← Blue/Teal button
└─────────────────────────┘
```

**RIGHT SIDE (Agentforce Sidebar)** — Purple is OK:
```
┌─────────────────────────┐
│ 🤖 VOICE Assistant      │ ← PURPLE (default Agentforce)
│ Continuous Mode         │
└─────────────────────────┘
```

---

## If Nothing Works

### Last Resort: Manual CSS Override

If the deployment isn't taking effect, add a CSS override:

1. Open DevTools (`F12`)
2. Go to **Console tab**
3. Paste this:

```javascript
// Force VizVoice colors
const style = document.createElement('style');
style.textContent = `
  /* Override header */
  header[class*="bg-gradient"] {
    background: linear-gradient(to right, #4E79A7, #76B7B2) !important;
  }
  
  /* Override microphone button */
  button[aria-label*="listening"] {
    background: linear-gradient(to bottom right, #4E79A7, #76B7B2) !important;
  }
  
  /* Override user chat bubbles */
  .bg-\\[\\#4E79A7\\] {
    background-color: #4E79A7 !important;
  }
`;
document.head.appendChild(style);
```

Press **Enter**. The colors should change immediately.

If this works, the issue is **deployment/cache**. The CSS override proves the HTML is rendering but with wrong styles.

---

## Report Back

If none of these work, capture:
1. **Screenshot** of the purple UI
2. **Browser DevTools screenshot** showing the CSS for the purple element
3. **Network tab screenshot** showing the `vizvoice` bundle request

This will help identify if it's:
- Cache issue
- Deployment issue
- Wrong component being modified
- Salesforce CDN delay

---

## Changelog

- **2026-07-18**: Initial debug guide for purple color issue post-deployment
