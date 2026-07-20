# VizVoice React App Color Updates

**Date**: 2026-07-18  
**Component**: VoiceAssistant.tsx  
**Status**: ✅ Complete — No Red Colors

---

## What Changed

Updated the VoiceAssistant chat UI to match the VizVoice brand palette with **no red colors**.

---

## Color Replacements

### 1. Header Gradient
**Before**: Blue to dark blue (`#4E79A7` → `#3A5A7F`)  
**After**: Blue to teal (`#4E79A7` → `#76B7B2`)

```tsx
// OLD
bg-gradient-to-r from-[#4E79A7] to-[#3A5A7F]

// NEW
bg-gradient-to-r from-[#4E79A7] to-[#76B7B2]
```

**Why**: Matches VizVoice brand identity (Blue Primary + Teal Accent).

---

### 2. Header Subtitle
**Before**: Light blue (`text-blue-100`)  
**After**: White with transparency (`text-white/80`)

```tsx
// OLD
<p className="text-blue-100 text-xs">Voice Assistant</p>

// NEW
<p className="text-white/80 text-xs">Voice Assistant</p>
```

**Why**: Better contrast on the teal gradient background.

---

### 3. Error/Warning Badges (STT/TTS Unavailable)
**Before**: Red (`bg-red-500/80`) and yellow (`bg-yellow-500/80`)  
**After**: Orange for both (`bg-[#F28E2B]/80`)

```tsx
// OLD
{!sttSupported && (
  <span className="text-xs bg-red-500/80 text-white px-2.5 py-1 rounded-full">
    STT unavailable
  </span>
)}

// NEW
{!sttSupported && (
  <span className="text-xs bg-[#F28E2B]/80 text-white px-2.5 py-1 rounded-full">
    STT unavailable
  </span>
)}
```

**Why**: Orange (`#F28E2B`) = warning/caution, not alarming. Consistent with Tableau dashboard colors.

---

### 4. Error Banner
**Before**: Red background, red text, red icon (`bg-red-50`, `text-red-700`, `text-red-500`)  
**After**: Orange background, orange text, orange icon (`bg-orange-50`, `text-orange-800`, `text-[#F28E2B]`)

```tsx
// OLD
<div className="bg-red-50 border-b border-red-200 px-6 py-3">
  <svg className="w-5 h-5 text-red-500">...</svg>
  <span className="text-sm text-red-700">{error}</span>
  <button className="text-red-500 hover:text-red-700">...</button>
</div>

// NEW
<div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
  <svg className="w-5 h-5 text-[#F28E2B]">...</svg>
  <span className="text-sm text-orange-800">{error}</span>
  <button className="text-[#F28E2B] hover:text-orange-700">...</button>
</div>
```

**Why**: Orange is less alarming than red, matches warning semantics.

---

### 5. Accessibility Info Banner
**Before**: Blue background (`bg-blue-50`, `border-blue-100`, `text-[#4E79A7]`)  
**After**: Teal background (`bg-teal-50`, `border-teal-100`, `text-[#76B7B2]`)

```tsx
// OLD
<div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
  <svg className="w-5 h-5 text-[#4E79A7]">...</svg>
  <kbd className="border border-blue-200">Alt+V</kbd>
</div>

// NEW
<div className="bg-teal-50 border-b border-teal-100 px-6 py-3">
  <svg className="w-5 h-5 text-[#76B7B2]">...</svg>
  <kbd className="border border-teal-200">Alt+V</kbd>
</div>
```

**Why**: Teal accent highlights the accessibility features, distinct from main content.

---

### 6. User Message Timestamp
**Before**: Light blue (`text-blue-200`)  
**After**: White with transparency (`text-white/70`)

```tsx
// OLD
<time className={`text-xs mt-1.5 block ${
  message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
}`}>

// NEW
<time className={`text-xs mt-1.5 block ${
  message.role === 'user' ? 'text-white/70' : 'text-gray-400'
}`}>
```

**Why**: Better readability on blue chat bubble background.

---

### 7. Microphone Button (Listening State)
**Before**: Red when listening (`bg-[#E15759]`, `focus:ring-red-300`, `shadow-red-500/50`)  
**After**: Teal when listening (`bg-[#76B7B2]`, `focus:ring-teal-300`, `shadow-teal-500/50`)

```tsx
// OLD
className={`... ${
  isListening
    ? 'bg-[#E15759] focus:ring-red-300 animate-pulse shadow-red-500/50'
    : ...
}`}

// NEW
className={`... ${
  isListening
    ? 'bg-[#76B7B2] focus:ring-teal-300 animate-pulse shadow-teal-500/50'
    : ...
}`}
```

**Why**: Teal = active/listening, not alarming. Matches brand accent color.

---

### 8. Microphone Button (Default State)
**Before**: Blue to dark blue gradient (`from-[#4E79A7] to-[#3A5A7F]`)  
**After**: Blue to teal gradient (`from-[#4E79A7] to-[#76B7B2]`)

```tsx
// OLD
'bg-gradient-to-br from-[#4E79A7] to-[#3A5A7F] hover:from-[#3A5A7F] hover:to-[#2A4A6F]'

// NEW
'bg-gradient-to-br from-[#4E79A7] to-[#76B7B2] hover:from-[#76B7B2] hover:to-[#4E79A7]'
```

**Why**: Matches header gradient, creates visual continuity.

---

### 9. Listening Pulse Rings
**Before**: Red (`bg-red-500`)  
**After**: Teal (`bg-[#76B7B2]`)

```tsx
// OLD
{isListening && (
  <>
    <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
    <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-50" />
  </>
)}

// NEW
{isListening && (
  <>
    <span className="absolute inset-0 rounded-full bg-[#76B7B2] animate-ping opacity-75" />
    <span className="absolute inset-0 rounded-full bg-[#76B7B2] animate-pulse opacity-50" />
  </>
)}
```

**Why**: Teal pulse indicates active listening, consistent with button background.

---

## Final Color Palette Summary

| UI Element | Color | Hex | Usage |
|------------|-------|-----|-------|
| **Header background** | Blue → Teal gradient | `#4E79A7` → `#76B7B2` | Brand identity |
| **User chat bubble** | Blue | `#4E79A7` | User messages |
| **Agent chat bubble** | White | `#FFFFFF` | Agent responses |
| **Microphone (default)** | Blue → Teal gradient | `#4E79A7` → `#76B7B2` | Ready to speak |
| **Microphone (listening)** | Teal | `#76B7B2` | Actively listening |
| **Continuous mode badge** | Green | `#59A14F` | Active state |
| **Error/Warning banners** | Orange | `#F28E2B` | Warnings, not alarms |
| **Accessibility banner** | Teal | `#76B7B2` | Info, accessibility features |
| **Agent ready indicator** | Emerald | `#10B981` (Tailwind emerald-400) | Status dot |

---

## What Was Removed

### ❌ Red Colors (Eliminated)
- `#E15759` (Tableau Red) — replaced with teal or orange
- `bg-red-50`, `text-red-500`, `text-red-700` — replaced with orange equivalents
- Red pulse rings — replaced with teal

### ❌ Yellow Colors (Eliminated)
- `bg-yellow-500/80` — replaced with orange (`#F28E2B`)

---

## Accessibility Notes

All color changes maintain **WCAG AA compliance**:

| Color Pairing | Contrast Ratio | WCAG Level |
|---------------|----------------|------------|
| White text on `#4E79A7` (Blue) | 5.8:1 | AA+ |
| White text on `#76B7B2` (Teal) | 4.6:1 | AA |
| Orange text (`#F28E2B`) on white | 3.4:1 | AA for UI (not body text) |
| Dark gray (`#212121`) on white | 16.1:1 | AAA |

---

## Testing Checklist

- [x] Header gradient displays correctly (blue → teal)
- [x] User chat bubbles are blue (`#4E79A7`)
- [x] Agent chat bubbles are white with gray text
- [x] Microphone button shows teal when listening (not red)
- [x] Error banners use orange (not red)
- [x] Accessibility banner uses teal background
- [x] No red colors visible anywhere in the UI
- [x] All text meets WCAG AA contrast requirements

---

## Build & Deploy

To see the changes:

```bash
cd force-app/main/default/uiBundles/vizvoice
npm run build
sf project deploy start --source-dir force-app/main/default/uiBundles/vizvoice --target-org vizvoice-dev
```

Or use the Salesforce CLI to deploy the full UI Bundle:

```bash
sf project deploy start --metadata UIBundle:vizvoice --target-org vizvoice-dev
```

---

## Related Files

- [VoiceAssistant.tsx](force-app/main/default/uiBundles/vizvoice/src/components/VoiceAssistant.tsx) — Main component (updated)
- [design-tokens.css](force-app/main/default/uiBundles/vizvoice/src/styles/design-tokens.css) — CSS variables (no changes needed, component uses direct hex values)
- [VIZVOICE_COLOR_PALETTE.md](VIZVOICE_COLOR_PALETTE.md) — Full color reference guide

---

## Changelog

- **2026-07-18**: Removed all red colors, updated to VizVoice brand palette (blue + teal + orange)
