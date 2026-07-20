# VizVoice Accessibility Review (WCAG 2.2)

**Date:** 2026-07-17
**Scope:** `force-app/main/default/uiBundles/vizvoice/src/**` (React UI Bundle)
**Method:** Manual WCAG 2.2 review (SC 1.1.1, 4.1.2 i/ii/iii) of every component in the app, screen-reader-focused (ARIA live regions, labels, roles, keyboard nav).

## Files Reviewed

- `appLayout.tsx`
- `pages/VizVoicePage.tsx`
- `components/VoiceAssistant.tsx` (active — used by `VizVoicePage`)
- `components/TableauEmbed.tsx`
- `components/AgentforceConversationClient.tsx` (wraps a Salesforce Lightning Out base component — accessible by assumption)
- `components/VoiceController.tsx`, `components/LiveTranscript.tsx` (present in the tree but not currently imported by any page)
- `hooks/useSpeechInput.ts`, `hooks/useSpeechOutput.ts`, `hooks/useAgentSession.ts`

## Findings & Fixes Applied

### 1. Decorative debug banner announced to screen readers — Fixed
**File:** `appLayout.tsx`
**Issue:** A hardcoded "VizVoice loaded" debug banner sat absolutely positioned over every page with no `aria-hidden` and no semantic role. Screen readers would announce this meaningless string on every page load, ahead of real content — SC 1.1.1 (non-text/no-purpose content exposed to AT without being marked decorative).
**Fix:** Removed the leftover debug element entirely.

### 2. Un-hidden decorative icons in the mic button — Fixed
**File:** `components/VoiceAssistant.tsx`
**Issue:** The mic/stop/spinner SVG icons inside the voice control button had no `aria-hidden="true"`, unlike the header icon in the same file which correctly hides its SVG. The button already has an explicit `aria-label` (so the accessible *name* wasn't broken — this is not a 4.1.2 issue), but the un-hidden icon paths are non-text content with no independent meaning and should be excluded from the accessibility tree per SC 1.1.1 to avoid redundant/confusing output in some AT/browser combinations.
**Fix:** Added `aria-hidden="true"` to all three button SVGs, matching the pattern already used elsewhere in the file.

## Reviewed, No Violation Found

- **`TableauEmbed.tsx`** — Already follows strong accessible patterns: labeled `<select>` via `useId()`, `role="status"`/`role="alert"` with matching `aria-live`, decorative emoji fallback marked `aria-hidden`, descriptive `aria-label` on the "open in new tab" link with its icon hidden.
- **`VoiceAssistant.tsx` (remainder)** — `role="log"` + `aria-live="assertive"` on the conversation history, `aria-live="polite"` status text, `aria-pressed`/`aria-label` on the mic button, keyboard shortcut (Alt+V) with no mouse dependency, dismiss button on the error banner has an `aria-label` covering its "×" glyph.
- **`AgentforceConversationClient.tsx`** — Wraps a Salesforce base Lightning Out component; per the review skill's component-library rule, base components are assumed accessible out of the box.
- **`useSpeechInput.ts` / `useSpeechOutput.ts` / `useAgentSession.ts`** — Non-visual logic hooks; no DOM/ARIA surface to review.
- **`VoiceController.tsx` / `LiveTranscript.tsx`** — Not currently wired into any page (superseded by the inline logic in `VoiceAssistant.tsx`). Both already have solid ARIA patterns (dynamic `aria-label`, `aria-pressed`, `role="log"` with `sr-only` role-prefixed messages) if reintroduced later — no action needed since they're unused, but worth reusing instead of duplicating logic in a future cleanup pass.

## Summary

Two real screen-reader issues found and fixed directly in code: a meaningless debug banner exposed to assistive technology, and un-hidden decorative icons in the primary voice control. The rest of the app — the mic button's `aria-label`/`aria-pressed`, the conversation log's live region, the dashboard picker, and the keyboard shortcut — already followed correct WCAG patterns from prior work.
