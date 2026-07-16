# VizVoice — How It Works (Current State)

**As of:** 2026-07-15
**Org:** `orgfarm-aac260ab62-dev-ed` (alias `vizvoice-dev`)
**App URL:** `https://orgfarm-aac260ab62-dev-ed--c.develop.my.salesforce.app/app/c__vizvoice`

VizVoice is a voice-first accessibility layer over a Tableau Next dashboard. It greets the
user, embeds the dashboard, and answers spoken questions about the data via an Agentforce
agent grounded on a Data 360 semantic model.

---

## High-level flow

```
Browser (React UI Bundle, *.salesforce.app)
  │
  ├─ Web Speech API (STT)  ── user speaks ──► transcript
  │
  ├─ Analytics Embedding SDK ──► embeds Tableau Next dashboard (left panel)
  │
  └─ sendMessage(utterance)
        │  Data SDK authenticated fetch (@salesforce/platform-sdk)
        ▼
     Apex REST proxy  /services/apexrest/vizvoice/*   (VizVoiceAgentProxy.cls)
        │  Named Credential "callout:VizVoice" (same-org, ambient session)
        ▼
     generateAiAgentResponse/VizVoice  (invocable action)
        │
        ▼
     VizVoice Agentforce agent (Atlas ConcurrentMultiAgentOrchestration)
        │  AnalyzeSemanticData action
        ▼
     Data 360 semantic model (Transit_Performance__dlm)
        │
        ▼ answer text bubbles back up
  Browser ── Web Speech API (TTS) ──► spoken answer
```

---

## Components

### 1. React UI Bundle (frontend)
Path: `force-app/main/default/uiBundles/vizvoice/`
- **Vite + React + Tailwind**, deployed as Salesforce `UIBundle` metadata.
- **`src/pages/VizVoicePage.tsx`** — layout: dashboard embed (left ~70%), voice panel (right ~30%).
  - **Instant greeting**: on load, speaks a *canned local* greeting (no agent call) so the app
    feels instant. The agent only engages on the first real question.
  - Alt+V global shortcut toggles the mic. Hands-free mode re-opens the mic after each answer.
  - "How to talk to VizVoice" instructions are `sr-only` (screen-reader only, not visible).
- **`src/components/TableauEmbed.tsx`** — embeds the dashboard via
  `@salesforce/analytics-embedding-sdk`. Init requires an `authCredential`; we use the
  established-session pattern `{ orgUrl, authCredential: orgUrl }` where `orgUrl` is rewritten
  to the `*.lightning.force.com` host. On embed failure it falls back to an accessible
  "open in new tab" link (`{lightning host}/tableau/dashboard/{apiName}/view`).
- **`src/hooks/useAgentSession.ts`** — `sendMessage()` posts to the Apex proxy via the Data SDK
  authenticated fetch. First turn → `/vizvoice/session`; later turns → `/vizvoice/message?sessionId=`.
  The server mints a `sessionId` on turn 1 and we reuse it for continuity.
- **`src/hooks/useSpeechInput.ts` / `useSpeechOutput.ts`** — Web Speech API STT/TTS with earcons
  and async voice loading (avoids the robotic default voice).

### 2. Apex REST proxy (backend bridge)
Path: `force-app/main/default/classes/VizVoiceAgentProxy.cls`
- Why it exists: the headless Agentforce Agent API gateway is **not provisioned** on this dev org.
  Instead we invoke the agent through the standard **`generateAiAgentResponse`** invocable action,
  entirely inside the authenticated org session (no external gateway).
- Endpoints:
  - `GET  /vizvoice/dashboards` — lists Tableau dashboards (relays `/tableau/dashboards`).
  - `POST /vizvoice/session` — first conversation turn (no sessionId).
  - `POST /vizvoice/message?sessionId=…` — subsequent turns.
  - `DELETE /vizvoice/session/{id}` — no-op (stateless from client's view).
- Key behaviors:
  - **120s callout timeout** (`hr.setTimeout(120000)`) — the default 10s was too short and
    surfaced to the client as a 500 "Read timed out". This was the root cause of the agent 500.
  - **Brevity directive** prepended to every utterance — keeps spoken answers to ~2 sentences,
    leading with the key number, no lists/markdown, no visual metaphors (accessibility rule).
  - **Context preamble** — folds dashboard context (targetEntityId, tab, filters) into the
    utterance since the invocable bridge takes only a single `userMessage` string.
  - **Response normalization** — unwraps the action's list envelope and the nested
    `{"type":"Text","value":"…"}` agentResponse down to `{ sessionId, message: { role, content } }`.

### 3. Agentforce agent
- Agent: **VizVoice** (`AgentID 0XxgK000001rUH7SAM`, planner bundle `VizVoice_v1`).
- Grounding variables (`targetEntityId`, `targetEntityType`, `sdmApiName`, `sdmIds`) are set as
  **defaults in the Agentforce Builder UI** — the invocable action cannot pass session variables,
  so grounding lives on the agent, not the client call.
- Uses the `AnalyzeSemanticData` action to query the Data 360 semantic model.

### 4. Data 360 semantic model
- Table: `Transit_Performance__dlm` — **60 rows**, transit performance by line and month.
- Data lives in `C360_Semantic_Model_Extended_0ba` (the base `C360SemanticModel_c360` is empty).
- See `docs/semantic-model-field-descriptions.md` for field descriptions to paste into the builder.

---

## Known issues / open items

- **Dashboard viz tiles show "Can't show visualization" / `postCdpQuerySql failed`.**
  The embed *frame* renders fine and the underlying data is present (60 rows confirmed). The
  tiles' **semantic SQL** query fails inside the embedded context. This is a **Tableau Next
  dashboard-authoring issue** — the tiles need to be rebound to `C360_Semantic_Model_Extended_0ba`
  in the dashboard builder. Not fixable from the UI bundle or CLI.
- **Latency.** The agent round-trip (reasoning + Data 360 query) is a few seconds of fixed
  platform cost. Mitigations applied: instant local greeting, brevity directive. Further gains
  would require agent-side tuning in Builder.
- **Field descriptions** not yet entered in the semantic model builder (see the descriptions doc).

---

## Build & deploy

From `force-app/main/default/uiBundles/vizvoice/`:
```bash
npm run build                       # tsc -b && vite build
```
From the project root:
```bash
# Deploy the UI bundle
sf project delete tracking --no-prompt --target-org vizvoice-dev
sf project deploy start --source-dir force-app/main/default/uiBundles/vizvoice \
  --ignore-conflicts --target-org vizvoice-dev

# Deploy the Apex proxy
sf project deploy start --metadata ApexClass:VizVoiceAgentProxy --target-org vizvoice-dev
```

### Verify the agent leg directly (bypasses the browser)
```bash
# Raw action (always fast — CLI has no callout timeout)
echo '{"inputs":[{"userMessage":"What is the on-time performance?"}]}' > /tmp/q.json
sf api request rest "/services/data/v64.0/actions/custom/generateAiAgentResponse/VizVoice" \
  --method POST --body @/tmp/q.json --target-org vizvoice-dev

# Through the proxy (exercises the 120s timeout + brevity + normalization)
echo '{"message":{"role":"user","content":"What is the on-time performance?"}}' > /tmp/p.json
sf api request rest "/services/apexrest/vizvoice/session" \
  --method POST --body @/tmp/p.json --target-org vizvoice-dev
```
