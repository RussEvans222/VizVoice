# Devpost Submission Answers — Builder Track AI Agent Review

Both required tools were run against the VizVoice codebase. Full outputs: `ACCESSIBILITY_REVIEW.md`
and `RAI_SELF_CHECK.md` in this repo.

---

## Q1: What did the Accessibility Expert Skill find? Walk us through what you fixed, what you kept, and why.

We ran a WCAG 2.2 accessibility review (using the `a11y_expert:accessibility-code-review` skill,
covering SC 1.1.1 and SC 4.1.2 i/ii/iii) across every component in the VizVoice React UI Bundle —
the voice assistant, the Tableau embed, the agent client wrapper, and supporting hooks.

**What we fixed:**
- A leftover "VizVoice loaded" debug banner was absolutely positioned over every page with no
  `aria-hidden` and no real purpose. A screen reader would announce it ahead of actual content on
  every load. We removed it entirely rather than hiding it, since it served no purpose at all.
- The mic/stop/spinner icons inside the primary voice control button had no `aria-hidden="true"`,
  unlike the header icon in the same file which already followed the correct pattern. The button's
  accessible name wasn't broken (it has an explicit `aria-label`), but the un-hidden icon paths are
  non-text content with no independent meaning, so we added `aria-hidden="true"` to match the
  existing pattern and avoid redundant output in some AT/browser combinations.

**What we kept, and why:**
- The conversation log uses `role="log"` with `aria-live="assertive"` so every spoken exchange is
  also announced to screen readers in real time — this is core to VizVoice's whole premise (a
  voice interface has to mirror to text/ARIA, not just audio).
- The mic button's `aria-pressed` state and `aria-label`, and the Alt+V keyboard shortcut, were
  already correct — no mouse dependency, clear state communication.
- We assumed the wrapped Salesforce Lightning Out base component (`AgentforceConversationClient`)
  is accessible out of the box, per the skill's component-library rule, and didn't re-review its
  internals.
- Two unused components (`VoiceController.tsx`, `LiveTranscript.tsx`) already have solid ARIA
  patterns but aren't wired into any page — we left them as-is since there was nothing broken to
  fix, and flagged them for reuse instead of duplication in a future cleanup.

The bigger design decision, driven by accessibility rather than code review, was the agent's
response language itself: no visual metaphors ("as you can see," "the bar on the left"), ordinal
language instead ("the second-largest line"), and leading every answer with the number before
context — verified against real test queries in `AGENT_TEST_RESULTS.md`.

---

## Q2: What did the RAI Self Check find? Walk us through how you addressed bias, fairness, and transparency.

The self-check returned **POLISH** — no high-risk category (VizVoice isn't employment, healthcare,
legal, benefits, financial, biometric, minors, or coworker-surveillance related) and no PII/consent
issue, but three disclosure gaps worth tightening:

1. **Accessibility claim vs. evidence.** Our framing leaned on "fully accessible" for blind and
   low-vision users, but what we've actually validated is a WCAG 2.2 code review — ARIA live
   regions, keyboard-only control, no-visual-metaphor response language — not testing with an
   actual blind or low-vision user. We're being explicit about that distinction in this submission:
   the code-level accessibility work is done and verified; user testing with the target group is
   the honest next step, not something we're claiming already happened.

2. **Originality disclosure.** VizVoice builds on Salesforce's pre-installed Analytics and
   Visualization V2 Agentforce template — the `AnalyzeSemanticData` and `CreateUpdateVisualization`
   subagents came with the org. What's novel is the voice-first interaction layer wrapped around
   it: real Web Speech API STT/TTS, the ARIA-live mirroring of every spoken exchange, the Alt+V
   keyboard-first control, and the accessibility-specific instruction set we added to the agent
   (no visual metaphors, ordinal language, number-first answers). We're naming the reused template
   directly rather than implying the whole agent was built from scratch.

3. **Data transparency.** The demo and all test queries in `AGENT_TEST_RESULTS.md` run against a
   sample/synthetic transit dataset (`C360_Semantic_Model_Extended`), not real transit-agency data.
   We're stating that plainly rather than leaving it ambiguous.

On bias and fairness specifically: VizVoice doesn't make judgments about people, so there's no
demographic scoring or disparate-impact surface to test. The fairness-relevant design choice we
did make is in output consistency — the agent's response rules (lead with the number, no visual
metaphors, state uncertainty rather than guess) apply identically regardless of who's asking,
which keeps the accessibility experience consistent rather than adapting invisibly per user.
Transparency-wise, when the agent can't answer (e.g., "this year" queries with no matching data),
it says so rather than guessing — verified directly in test cases 5–7 of `AGENT_TEST_RESULTS.md`.
