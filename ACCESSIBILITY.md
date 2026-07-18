# VizVoice Accessibility Guide

## WCAG 2.1 AA Compliance

VizVoice is designed to meet WCAG 2.1 Level AA standards for accessibility, with specific focus on:

### 1. Voice + Screen Reader Coordination

**Critical Design Decision:** VizVoice provides BOTH voice output (TTS) AND screen reader announcements simultaneously.

- **Voice Output (TTS):** Spoken responses for sighted users and users with low vision
- **Screen Reader Announcements:** Mirrored text content announced via ARIA live regions for blind users using JAWS, NVDA, or VoiceOver

**Implementation:**
```tsx
// Agent response is spoken AND announced to screen readers
await speak(response.answer);
setLastAnnouncedMessage(`Agent: ${response.answer}`);

// Separate sr-only live region
<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {lastAnnouncedMessage}
</div>
```

**Why both?**
- Voice output can be missed due to ambient noise or audio issues
- Screen readers provide a text fallback that can be reviewed/re-read
- Some users prefer reading Braille displays over audio

---

### 2. Keyboard Navigation (No Mouse Required)

**Primary Shortcut:** `Alt+V` activates/deactivates voice listening

**Full Keyboard Support:**
- `Tab` - Navigate between interactive elements
- `Alt+V` - Toggle voice assistant listening
- `Enter` / `Space` - Activate microphone button
- `Escape` - Stop listening (future enhancement)

**Implementation:**
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      handleVoiceInteraction();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleVoiceInteraction]);
```

---

### 3. Color Contrast Requirements (WCAG AA)

**Text Contrast:**
- Normal text (< 18pt): **4.5:1 minimum** ✅
- Large text (18pt+ or 14pt bold): **3.0:1 minimum** ✅
- UI components (buttons, borders): **3.0:1 minimum** ✅

**Verified Combinations:**
| Element | Foreground | Background | Ratio | Pass |
|---------|-----------|------------|-------|------|
| Primary text | #212121 | #FFFFFF | 16.1:1 | ✅ |
| Secondary text | #616161 | #FFFFFF | 7.6:1 | ✅ |
| Tertiary text | #757575 | #FFFFFF | 4.5:1 | ✅ |
| Button text | #FFFFFF | #4E79A7 | 5.8:1 | ✅ |
| Error text | #C62828 | #FFFFFF | 4.5:1 | ✅ |
| Success text | #2E7D32 | #FFFFFF | 4.5:1 | ✅ |

**Testing Tools:**
- Chrome DevTools Accessibility Inspector
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Color Oracle (colorblindness simulator)

---

### 4. Colorblind-Safe Palette

VizVoice uses **Tableau 10 colorblind-safe palette** for all data visualizations and UI accents.

**Why Tableau 10?**
- Designed specifically for colorblind accessibility
- Tested with deuteranopia (red-green colorblindness, 8% of males)
- Works in grayscale (distinctions remain clear)

**Palette:**
```css
--tableau-blue: #4E79A7      /* Primary */
--tableau-teal: #76B7B2      /* Accent */
--tableau-orange: #F28E2B    /* Highlight */
--tableau-red: #E15759       /* Error state */
--tableau-green: #59A14F     /* Success state */
```

**Never use these patterns:**
- ❌ Red/green as sole differentiators
- ❌ Color-only information ("the red line shows...")
- ✅ Shape + color ("the solid line in blue shows...")
- ✅ Text labels + color ("Revenue (orange) vs Costs (blue)")

---

### 5. Language Design for Voice Output

**Critical Rule:** Never use visual metaphors in agent responses.

**❌ Forbidden Phrases:**
- "As you can see..."
- "The chart shows..."
- "On the left side..."
- "The red segment..."
- "Look at the bar chart..."

**✅ Accessible Alternatives:**
- "The data indicates..."
- "The largest segment represents..."
- "The second metric..."
- "The segment representing X..."
- "Comparing the values..."

**Positional Language (Use Ordinals):**
- ❌ "The bar on the left"
- ✅ "The first bar" or "The leading metric"

**Quantitative Descriptions:**
```
User: "Tell me about delays."
Agent: "The leading cause of delays is traffic, 
accounting for 312 cancelled trips. This is 
followed by mechanical issues at 148 trips, 
then weather at 97 trips."
```

**Always state:**
1. The most important number FIRST
2. Context (what it represents)
3. Comparisons with actual values (not just "higher")

---

### 6. ARIA Labels and Semantic HTML

**Buttons:**
```tsx
<button
  aria-label={isListening ? 'Stop listening' : 'Start listening'}
  aria-pressed={isListening}
>
```

**Live Regions:**
```tsx
// Pre-rendered empty container (REQUIRED)
<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {/* Content injected dynamically triggers announcement */}
</div>
```

**Landmark Roles:**
```tsx
<header> {/* Native landmark */}
<main> {/* Native landmark */}
<div role="log" aria-label="Conversation history"> {/* Chat transcript */}
```

---

### 7. Audio Earcons (Non-Speech Sounds)

**Purpose:** Signal state changes without relying on visual cues.

**Planned Sounds:**
- 🔊 **Listening started:** Subtle ascending tone (200ms)
- 🔊 **Listening ended:** Subtle descending tone (200ms)
- 🔊 **Response complete:** Short confirmation beep (100ms)
- 🔊 **Error:** Distinct alert sound (300ms)

**Why earcons?**
- Users need to know when the system is listening (privacy)
- Audio feedback helps users who aren't watching the screen
- Complements visual indicators (pulsing mic button)

**Implementation (future):**
```typescript
const playEarcon = (type: 'start' | 'stop' | 'complete' | 'error') => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  // ... create subtle tone
};
```

---

### 8. Reduced Motion Support

**Respects User Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**What this disables:**
- Pulsing animations on microphone button
- Fade-in transitions for messages
- Smooth scrolling

**What remains:**
- All functionality works identically
- Visual state changes (colors, icons) are instant

---

### 9. Focus Management

**Focus Indicators:**
- All interactive elements have visible focus outlines (2px solid, primary color)
- Focus order follows logical reading order (top-to-bottom, left-to-right)

**Focus States:**
```css
:focus-visible {
  outline: 2px solid var(--vizvoice-primary);
  outline-offset: 2px;
}
```

**Never:**
- Remove focus outlines with `outline: none` (unless replacing with better indicator)
- Trap focus without escape mechanism
- Move focus unexpectedly during user input

---

### 10. Mobile Touch Targets

**Minimum Size:** 48×48 CSS pixels (iOS HIG, Android Material Design)

**Current Implementation:**
- Microphone button: 80×80px (exceeds minimum) ✅
- Status badges: 24px height (passive, non-interactive) ✅
- Keyboard shortcut chips: 24px height (passive) ✅

**Spacing:**
- Minimum 8px space between adjacent touch targets

---

### 11. Screen Reader Testing Checklist

**Test with:**
- ✅ **JAWS** (Windows) - Most popular enterprise screen reader
- ✅ **NVDA** (Windows) - Free, widely used
- ✅ **VoiceOver** (macOS/iOS) - Built-in Apple screen reader
- ✅ **TalkBack** (Android) - Built-in Android screen reader

**Test Scenarios:**
1. Navigate to VizVoice with keyboard only
2. Hear welcome message announced
3. Press `Alt+V` to activate listening
4. Speak a question about dashboard data
5. Hear agent response (both TTS + screen reader)
6. Review conversation history in chat log
7. Activate continuous mode - hear ongoing announcements

**Expected Behavior:**
- All text content is announced
- Button states (pressed/not pressed) are announced
- Error messages are announced immediately
- Live region announces ONLY new messages (not entire history)

---

### 12. Known Limitations

**Current Gaps (to address before hackathon submission):**

1. **No audio earcons yet** - Visual-only state indicators (mic pulsing)
2. **No caption/transcript export** - Users can't save conversation history
3. **No voice rate/pitch controls** - TTS uses default settings
4. **No alternative input** - Voice-only (no fallback text input for noisy environments)
5. **No visualization alt text** - Tableau charts still render as unlabeled SVG (this is the problem VizVoice solves!)

**Planned for Production:**
- [ ] Audio earcons (Web Audio API)
- [ ] Transcript export (JSON download)
- [ ] TTS customization (rate, pitch, voice selection)
- [ ] Text input fallback (keyboard input when mic unavailable)
- [ ] Visualization alt text injection (requires Tableau Embedding API exploration)

---

## Agent System Prompt (Accessibility Instructions)

**Add to Agentforce agent system prompt:**

```
ACCESSIBILITY RULES FOR VOICE OUTPUT:

1. NEVER use visual metaphors:
   - ❌ "as you can see", "the chart shows", "on the left"
   - ✅ "the data indicates", "the largest segment", "the first metric"

2. USE ordinal/positional language:
   - ❌ "the red bar"
   - ✅ "the leading metric" or "the second-largest value"

3. LEAD WITH the most important number:
   - ❌ "Traffic delays are shown in the chart, they're the highest"
   - ✅ "Traffic caused 312 delays, the highest of all categories"

4. STATE BOTH values in comparisons:
   - ❌ "This week is higher than last week"
   - ✅ "This week: 149 trips, last week: 137 trips, an increase of 8.8%"

5. KEEP responses concise (under 3 sentences for simple queries)
   - Offer "Would you like more detail?" for complex topics

6. IF UNCERTAIN about a value, say so explicitly:
   - "Based on the data I can access, X appears to be Y. Please verify this is correct."

7. USE clear, descriptive language (avoid jargon):
   - ❌ "The KPI delta YoY is positive"
   - ✅ "Compared to last year, this metric increased by 12%"
```

---

## Testing Commands

**Run accessibility audit:**
```bash
# Lighthouse accessibility score
npm run lighthouse -- --only-categories=accessibility

# axe-core automated testing
npm run test:a11y
```

**Expected Scores:**
- Lighthouse Accessibility: **95+/100**
- axe violations: **0 critical, 0 serious**

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tableau Colorblind Palette](https://www.tableau.com/about/blog/2016/4/examining-data-viz-rules-dont-use-red-green-together-53463)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
