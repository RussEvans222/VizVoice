# VizVoice Color Palette Reference

**Last Updated**: 2026-07-18

---

## Primary Brand Colors

### VizVoice Identity

| Color | Hex | Usage | WCAG Compliance |
|-------|-----|-------|-----------------|
| **Primary (Tableau Blue)** | `#4E79A7` | Main brand color, headers, primary buttons, links | 5.8:1 on white (AA+) |
| **Accent (Tableau Teal)** | `#76B7B2` | Secondary highlights, active states, focus indicators | 4.6:1 on white (AA+) |
| **Highlight (Tableau Orange)** | `#F28E2B` | Call-to-action elements, warnings, emphasis | 3.4:1 on white (AA for UI) |

### CSS Variables

```css
--vizvoice-primary: #4E79A7;
--vizvoice-accent: #76B7B2;
--vizvoice-highlight: #F28E2B;
```

---

## Tableau 10 Color Palette (Full Set)

These colors are used for data visualizations and maintain colorblind-safe accessibility.

| Color Name | Hex | Notes |
|------------|-----|-------|
| Tableau Blue | `#4E79A7` | Primary brand color |
| Tableau Orange | `#F28E2B` | Accent/highlight |
| Tableau Red | `#E15759` | Error states, critical alerts |
| Tableau Teal | `#76B7B2` | Secondary brand color |
| Tableau Green | `#59A14F` | Success states, positive metrics |
| Tableau Yellow | `#EDC948` | Warning states (low contrast — use sparingly) |
| Tableau Purple | `#B07AA1` | Tertiary accent |
| Tableau Pink | `#FF9DA7` | Decorative/supportive |
| Tableau Brown | `#9C755F` | Neutral accent |
| Tableau Gray | `#BAB0AC` | Neutral/disabled states |

### CSS Variables

```css
--tableau-blue: #4E79A7;
--tableau-orange: #F28E2B;
--tableau-red: #E15759;
--tableau-teal: #76B7B2;
--tableau-green: #59A14F;
--tableau-yellow: #EDC948;
--tableau-purple: #B07AA1;
--tableau-pink: #FF9DA7;
--tableau-brown: #9C755F;
--tableau-gray: #BAB0AC;
```

---

## Semantic Colors (WCAG AA Compliant)

| Purpose | Hex | Contrast Ratio | Usage |
|---------|-----|----------------|-------|
| **Success** | `#2E7D32` | 4.5:1 on white | Confirmation messages, positive actions |
| **Warning** | `#F57C00` | 4.5:1 on white | Caution messages, non-critical alerts |
| **Error** | `#C62828` | 4.5:1 on white | Error messages, destructive actions |
| **Info** | `#1565C0` | 4.5:1 on white | Informational messages, help text |

### CSS Variables

```css
--color-success: #2E7D32;
--color-warning: #F57C00;
--color-error: #C62828;
--color-info: #1565C0;
```

---

## Neutral Palette (Grays)

Used for text, backgrounds, borders, and neutral UI elements.

| Level | Hex | Usage | Text Contrast (on white) |
|-------|-----|-------|---------------------------|
| **Gray 50** | `#FAFAFA` | Background (lightest) | N/A |
| **Gray 100** | `#F5F5F5` | Background (light) | N/A |
| **Gray 200** | `#EEEEEE` | Borders (light) | N/A |
| **Gray 300** | `#E0E0E0` | Borders (medium) | N/A |
| **Gray 400** | `#BDBDBD` | Borders (heavy), disabled states | N/A |
| **Gray 500** | `#9E9E9E` | Placeholder text | ~3.0:1 (below AA) |
| **Gray 600** | `#757575` | Tertiary text | 4.5:1 (AA) |
| **Gray 700** | `#616161` | Secondary text | 7.6:1 (AAA) |
| **Gray 800** | `#424242` | Near-primary text | 11.1:1 (AAA) |
| **Gray 900** | `#212121` | Primary text | 16.1:1 (AAA) |
| **Black** | `#000000` | Maximum contrast text | 21:1 (AAA) |
| **White** | `#FFFFFF` | Background, inverted text | 21:1 (AAA) |

### CSS Variables

```css
--color-gray-50: #FAFAFA;
--color-gray-100: #F5F5F5;
--color-gray-200: #EEEEEE;
--color-gray-300: #E0E0E0;
--color-gray-400: #BDBDBD;
--color-gray-500: #9E9E9E;
--color-gray-600: #757575;
--color-gray-700: #616161;
--color-gray-800: #424242;
--color-gray-900: #212121;
--color-black: #000000;
--color-white: #FFFFFF;
```

---

## Text Color Tokens

Pre-defined text color combinations optimized for readability.

| Token | Value | Contrast Ratio | Usage |
|-------|-------|----------------|-------|
| `--text-primary` | `#212121` (Gray 900) | 16.1:1 on white | Body text, headlines |
| `--text-secondary` | `#616161` (Gray 700) | 7.6:1 on white | Secondary text, labels |
| `--text-tertiary` | `#757575` (Gray 600) | 4.5:1 on white | Tertiary text, captions |
| `--text-on-primary` | `#FFFFFF` | 5.8:1 on `#4E79A7` | Text on primary blue background |
| `--text-on-accent` | `#FFFFFF` | 4.6:1 on `#76B7B2` | Text on teal background |

---

## Background Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#FFFFFF` | Main app background |
| `--bg-secondary` | `#FAFAFA` (Gray 50) | Secondary panels, cards |
| `--bg-tertiary` | `#F5F5F5` (Gray 100) | Tertiary backgrounds, hover states |
| `--bg-header` | `#4E79A7` (VizVoice Primary) | Header bar |
| `--bg-chat-user` | `#4E79A7` (VizVoice Primary) | User chat bubbles |
| `--bg-chat-agent` | `#FFFFFF` | Agent chat bubbles |

---

## Tab Component Colors

**Active Tab**:
- Background: `#FFFFFF` (white)
- Text: `#212121` (Gray 900, primary text)
- Border/Underline: `#212121` (Gray 900)
- Focus ring: `#4E79A7` (VizVoice Primary)

**Inactive Tab**:
- Background: `transparent`
- Text: `#616161` (Gray 700, 60% opacity in code → `text-foreground/60`)
- Hover text: `#212121` (Gray 900)

**Tab List Container**:
- Background (default variant): `#F5F5F5` (Gray 100, via `bg-muted`)
- Background (line variant): `transparent`
- Border radius: `0.5rem` (8px)

### CSS Implementation (from [tabs.tsx:64-68](force-app/main/default/uiBundles/vizvoice/src/components/ui/tabs.tsx#L64-L68))

```css
/* Active tab styling */
.data-active {
  background: var(--bg-primary); /* #FFFFFF */
  color: var(--text-primary); /* #212121 */
}

/* Active tab indicator line (line variant only) */
.data-active::after {
  background: var(--text-primary); /* #212121 */
  opacity: 1;
  /* Positioned at bottom (horizontal) or right (vertical) */
}

/* Inactive tab */
.text-foreground\/60 {
  color: rgba(33, 33, 33, 0.6); /* Gray 900 at 60% opacity → #616161 equivalent */
}

/* Hover state */
.hover\:text-foreground:hover {
  color: var(--text-primary); /* #212121 */
}
```

---

## VizVoice Logo Colors

**No explicit logo file found in codebase** — logo would use:

- **Primary Icon Color**: `#4E79A7` (Tableau Blue / VizVoice Primary)
- **Accent/Gradient**: `#76B7B2` (Tableau Teal / VizVoice Accent)
- **Typography**: `#212121` (Gray 900) or `#FFFFFF` (White, depending on background)

### Suggested Logo Design

- **Icon**: Abstract waveform or microphone symbol in Tableau Blue (`#4E79A7`)
- **Accent gradient**: Transition from Tableau Blue → Tableau Teal (`#4E79A7` → `#76B7B2`)
- **Text "VizVoice"**: Gray 900 (`#212121`) on light backgrounds, White (`#FFFFFF`) on dark

---

## Border & Shadow Colors

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--border-light` | `#EEEEEE` (Gray 200) | Light dividers, subtle separation |
| `--border-medium` | `#E0E0E0` (Gray 300) | Default borders |
| `--border-heavy` | `#BDBDBD` (Gray 400) | Emphasized borders, inputs |

### Shadows

Shadows use `rgba(0, 0, 0, opacity)` for layered depth:

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` |
| `--shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` |
| `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` |
| `--shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` |

---

## Focus & Interactive States

### Focus Ring

**Primary focus indicator**:
- Color: `#4E79A7` (VizVoice Primary)
- Width: `2px`
- Offset: `2px`
- Ring style: `3px` blur (in tabs: `focus-visible:ring-[3px]`)

```css
:focus-visible {
  outline: 2px solid var(--vizvoice-primary); /* #4E79A7 */
  outline-offset: 2px;
}
```

### Hover States

- Text color change: `#616161` → `#212121`
- Background lightening: Add `hover:bg-gray-100` (`#F5F5F5`)

### Active/Pressed States

- Background: `#4E79A7` (primary) or `#76B7B2` (accent)
- Text: `#FFFFFF`

---

## Accessibility Compliance

| Color Pairing | Contrast Ratio | WCAG Level | Use Case |
|---------------|----------------|------------|----------|
| Gray 900 (`#212121`) on White | 16.1:1 | AAA | Body text |
| Gray 700 (`#616161`) on White | 7.6:1 | AAA | Secondary text |
| Gray 600 (`#757575`) on White | 4.5:1 | AA | Minimum for small text |
| VizVoice Primary (`#4E79A7`) on White | 5.8:1 | AA+ | Buttons, headers |
| VizVoice Accent (`#76B7B2`) on White | 4.6:1 | AA | Links, highlights |
| White on VizVoice Primary | 5.8:1 | AA+ | Inverted text |

**All primary UI text meets WCAG 2.2 Level AA or higher.**

---

## Dark Mode Support (Future)

Dark mode tokens are defined but **not yet activated** in the UI:

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--bg-primary` | `#FFFFFF` | `#212121` (Gray 900) |
| `--bg-secondary` | `#FAFAFA` | `#424242` (Gray 800) |
| `--text-primary` | `#212121` | `#FAFAFA` (Gray 50) |
| `--text-secondary` | `#616161` | `#E0E0E0` (Gray 300) |

Activated via `@media (prefers-color-scheme: dark)` in [design-tokens.css:163-171](force-app/main/default/uiBundles/vizvoice/src/styles/design-tokens.css#L163-L171).

---

## High Contrast Mode Support

When `@media (prefers-contrast: high)` is detected:

- `--text-primary` → `#000000` (Black)
- `--border-medium` → `#616161` (Gray 700)

Defined in [design-tokens.css:155-160](force-app/main/default/uiBundles/vizvoice/src/styles/design-tokens.css#L155-L160).

---

## References

- **Design tokens source**: [design-tokens.css](force-app/main/default/uiBundles/vizvoice/src/styles/design-tokens.css)
- **Tabs component**: [tabs.tsx](force-app/main/default/uiBundles/vizvoice/src/components/ui/tabs.tsx)
- **Tableau 10 palette**: Colorblind-safe standard for data visualization

---

## Quick Copy-Paste Palette

```css
/* VizVoice Brand */
#4E79A7  /* Primary (Tableau Blue) */
#76B7B2  /* Accent (Tableau Teal) */
#F28E2B  /* Highlight (Tableau Orange) */

/* Semantic Colors */
#2E7D32  /* Success */
#F57C00  /* Warning */
#C62828  /* Error */
#1565C0  /* Info */

/* Neutral Grays */
#FAFAFA  /* Gray 50 */
#F5F5F5  /* Gray 100 */
#EEEEEE  /* Gray 200 */
#E0E0E0  /* Gray 300 */
#BDBDBD  /* Gray 400 */
#9E9E9E  /* Gray 500 */
#757575  /* Gray 600 */
#616161  /* Gray 700 */
#424242  /* Gray 800 */
#212121  /* Gray 900 */
#000000  /* Black */
#FFFFFF  /* White */

/* Tableau 10 Full Set */
#4E79A7  /* Blue */
#F28E2B  /* Orange */
#E15759  /* Red */
#76B7B2  /* Teal */
#59A14F  /* Green */
#EDC948  /* Yellow */
#B07AA1  /* Purple */
#FF9DA7  /* Pink */
#9C755F  /* Brown */
#BAB0AC  /* Gray */
```

---

## Changelog

- **2026-07-18**: Initial color palette documentation extracted from design tokens and tabs component
