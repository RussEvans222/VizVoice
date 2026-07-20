# Hackathon RAI Self-Check — VizVoice

**Skill used:** `hackathon-rai-self-check` (v0.1, owner @OLugo) — retrieved from Jayesh Tejwani's
post in #a4g-hackathon-support (thread `1784063127.090949`), since the official EMU-gated doc
link wasn't reachable without Salesforce EMU access. Skill + references stored at
`~/.claude/skills/hackathon-rai-self-check/`.

**Input reviewed:** VizVoice project description (problem, architecture, and accessibility
design from `CLAUDE.md`), `ACCESSIBILITY_REVIEW.md`, `AGENT_TEST_RESULTS.md`.

---

**Self-check: POLISH**

You're on track. A few things to tighten before you submit.

1. **Accessibility claim outruns the evidence** — the submission describes VizVoice as making
   dashboards "fully accessible" to blind and low-vision users, but the accessibility work done
   so far is a team-run WCAG 2.2 code review (`ACCESSIBILITY_REVIEW.md`), not testing with an
   actual blind or low-vision user. Add: soften "fully accessible" to describe what was actually
   validated (WCAG 2.2 SC 1.1.1 / 4.1.2 code review, ARIA live regions, keyboard-only control),
   and state that testing with target users is the next step, not yet done. Why: an accessibility
   claim for a specific affected group needs evidence or an explicit testing plan — a code review
   alone doesn't confirm real-world usability for that group.

2. **Reused template not disclosed** — VizVoice is built on top of Salesforce's pre-installed
   Analytics and Visualization V2 Agentforce template (the `AnalyzeSemanticData` and
   `CreateUpdateVisualization` subagents came with the org, not built from scratch). Add: one
   sentence naming the template as the starting point, then be specific about what's novel —
   the voice-first interaction layer, the ARIA-live mirroring, and the "no visual metaphors"
   accessibility language rules added to the agent's instructions. Why: Builder Track originality
   disclosure asks directly whether the build is a pre-existing Salesforce solution.

3. **Data source not stated** — the live demo and `AGENT_TEST_RESULTS.md` run against a sample
   transit dataset (`C360_Semantic_Model_Extended`), not a real transit agency's data. Add: a
   one-line disclosure that the grounding data is a synthetic/sample dataset used for the demo.
   Why: judges and the disclosure checklist expect an explicit synthetic-vs-real statement, and
   this is an easy one to state plainly.

_PASS means no Responsible AI gaps to address before submitting. It does not mean a winning
submission. Judges still apply their own Responsible AI judgment when scoring._
