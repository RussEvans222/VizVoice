<!-- output: vizvoice_demo.mp4 -->
<!-- engine: llmg -->
<!-- theme: salesforce -->

# VizVoice — Hackathon Demo (5 min, live voice capture)

This is a **live-capture** script for `/demo-capture` — Russell speaks and clicks for real;
this doc is the talking-point/beat guide, not a TTS narration script.

## 1. The Problem (0:00–1:00)

> "Traditional dashboards render as unlabeled SVG graphics. For the 253 million people
> worldwide with vision impairment, that means zero access to the insights inside them.
> Screen readers just see a blank chart."

Action: open a plain Tableau/dashboard view, briefly show/describe that a screen reader
gets nothing meaningful from the chart.

## 2. Introduce VizVoice (1:00–1:45)

> "VizVoice is a voice-first Agentforce agent that makes Tableau Next dashboards fully
> accessible. Instead of reading a chart, you just ask."

Action: open the VizVoice UI Bundle
(`https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice`).
Let the welcome message play. Point out the on-page screen-reader instructions banner.

## 3. Live Voice Q&A (1:45–3:30)

Press **Alt+V**, ask real questions — using verified working queries from
`AGENT_TEST_RESULTS.md` so every answer on camera is real, not scripted:

1. "What line had the most cancellations?"
2. "What was the total number of cancellations?"
3. "How many total trips were there in December?"
4. "Show me the trend over time for cancellations"

Let the agent's real spoken answer play each time — do not talk over it.

## 4. Accessibility Deep Dive (3:30–4:30)

> "Every response is designed for listening, not reading. No 'as you can see', no chart
> references — just the number, first."

Action:
- Show/point out `aria-live="assertive"` conversation log (mention screen reader would announce it)
- Demo keyboard-only control: press Alt+V again with no mouse
- Mention the mic button's `aria-hidden` icons and `aria-pressed` state (from ACCESSIBILITY_REVIEW.md)
- If Tableau embed fails, show the accessible fallback dashboard (`TransitDashboardMock`) with its sr-only table — call out that this is intentional, not a bug

## 5. Impact + Close (4:30–5:00)

> "VizVoice shows accessibility isn't just alt text — it's rethinking the entire
> interaction model. Built on Agentforce and Data Cloud, for the Agentforce for Good
> hackathon."

Action: show GitHub repo URL on screen, end.

---

## Notes for /demo-capture

- Login: use username/password when the browser reaches the Salesforce login screen.
- Speak your real questions into your real mic — this is the whole point, since this is
  an accessibility demo and synthetic narration over a screen recording would undercut it.
- If an answer comes back wrong or slow, it's fine to redo that one Q&A beat — capture is
  editable afterward.
