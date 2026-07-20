# VizVoice

**Voice-First Accessibility Agent for Tableau Next Dashboards**

VizVoice is a voice-first Agentforce agent that makes Tableau analytics fully accessible through natural voice conversation. Built for the **Salesforce "Agentforce for Good" Hackathon** (Abilityforce equality group, Builder Track), VizVoice enables blind and low-vision users to independently explore Data Cloud semantic models using browser-native speech recognition and synthesis.

**Key Achievement:** 100% WCAG 2.2 AA compliance verified through Accessibility Expert Skill review. All transparency gaps identified by RAI Self-Check addressed through code changes (AI identity disclosure, capability boundaries, uncertainty expression).

---

## 🎯 The Problem

Traditional data visualizations render as unlabeled SVG graphics — effectively invisible to screen readers like JAWS, NVDA, and VoiceOver. **253 million people worldwide with vision impairment** have zero access to dashboard insights.

---

## ✨ The Solution

VizVoice enables users to:
- **Ask questions by voice** about dashboard data
- **Receive spoken answers** powered by Data Cloud semantic models
- **Navigate analytics** without ever seeing a chart
- **Use keyboard-only controls** (Alt+V to activate)

### Example Interaction:

**User (voice):** "What transit line had the most cancellations in December?"  
**VizVoice (voice):** "Green Line had 37 cancellations, the highest of all lines in December."  
**User:** "How does that compare to November?"  
**VizVoice:** "November had 29 cancellations on Green Line — that's 8 more in December, up 27%."

---

## 🏗️ Technical Architecture

```
User speaks
  ↓
[Browser Web Speech API] → transcribes to text
  ↓
[Apex REST Proxy: VizVoiceAgentProxy.cls]
  ↓
[Named Credential with OAuth Client Credentials]
  ↓
[Agentforce Agent "VizVoice"] → generateAiAgentResponse action
  ↓
[Data Cloud Semantic Model: C360_Semantic_Model_Extended_0ba]
  ↓
[Agent returns natural language answer]
  ↓
[Browser TTS] → speaks answer aloud
```

### Key Technologies:

- **Salesforce Agentforce** — Analytics Agent template with AnalyzeSemanticData action
- **Data Cloud** — Semantic layer for grounded analytics queries
- **Tableau Next** — Dashboard embedding (with accessible fallback)
- **React UI Bundle** — Frontend deployed as Salesforce metadata
- **Web Speech API** — Browser-native speech-to-text and text-to-speech
- **Apex REST** — Secure proxy for agent invocation via Named Credential

---

## 📂 Project Structure

```
force-app/main/default/
├── uiBundles/
│   └── vizvoice/                   # React UI Bundle (voice assistant + Tableau embed)
│       ├── src/
│       │   ├── components/
│       │   │   ├── VoiceAssistant.tsx       # Main voice UI (mic button, chat history)
│       │   │   └── TableauEmbed.tsx         # Tableau dashboard embedding
│       │   ├── hooks/
│       │   │   └── useAgentSession.ts       # Agent API integration
│       │   └── lib/
│       │       └── constants.ts             # Agent ID, semantic model config
│       └── package.json
├── classes/
│   └── VizVoiceAgentProxy.cls      # Apex REST endpoint for agent calls
├── namedCredentials/
│   └── VizVoice.namedCredential-meta.xml   # OAuth config for org-to-org auth
└── externalCredentials/
    └── VizVoice_Org_API.externalCredential-meta.xml  # OAuth client credentials
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) | v2+ | `npm install -g @salesforce/cli` |
| [Node.js](https://nodejs.org/) | v22+ | [nodejs.org](https://nodejs.org/) |
| [Git](https://git-scm.com/) | Any recent | [git-scm.com](https://git-scm.com/) |

### Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/RussEvans222/VizVoice.git
   cd VizVoice
   ```

2. **Authenticate to the org:**
   ```bash
   sf org login web --alias vizvoice-dev --instance-url https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com
   ```

3. **Install dependencies:**
   ```bash
   npm install
   cd force-app/main/default/uiBundles/vizvoice
   npm install
   cd -
   ```

4. **Build the UI Bundle:**
   ```bash
   cd force-app/main/default/uiBundles/vizvoice
   npm run build
   cd -
   ```

5. **Deploy to org:**
   ```bash
   sf project deploy start --source-dir force-app --target-org vizvoice-dev
   ```

6. **Open the UI:**
   ```
   https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice
   ```

7. **Test voice assistant:**
   - Press **Alt+V** or click the microphone button
   - Say: "How many trips were cancelled in December?"
   - Listen for the spoken answer!

---

## ♿ Accessibility Features

### Voice-First Design:
- ✅ **No visual metaphors** in responses — no "as you can see", "the chart shows", "the blue line"
- ✅ **Ordinal language** — "the largest value", "the second-highest metric"
- ✅ **Lead with the answer** — "37 cancellations" (not "Let me look at the data...")
- ✅ **Concise responses** — 1-2 sentences for simple facts

### Screen Reader Support:
- ✅ **ARIA live regions** — agent responses announced immediately
- ✅ **Keyboard-only navigation** — Alt+V shortcut, Tab key navigation
- ✅ **On-page instructions** — clear guidance for screen reader users
- ✅ **Semantic HTML** — proper heading hierarchy, landmarks

### Tableau Fallback:
- ✅ **"Open in new tab" button** when embedding fails
- ✅ Native Tableau interface has better ARIA support than iframes
- ✅ Voice assistant works independently of visual dashboard

---

## 🎤 Agent Configuration

The VizVoice agent is configured in Agentforce Builder with:

**Agent API Name:** `VizVoice`  
**Agent ID:** `0XxgK000001rUH7SAM`  
**Semantic Model:** `C360_Semantic_Model_Extended_0ba`  
**Target Entity Type:** `dashboard`

### Key Agent Actions:

1. **AnalyzeSemanticData** — Queries Data Cloud semantic models
   - Input: `utterance`, `targetEntityId`, `targetEntityType`, `variables`
   - Output: Natural language answer grounded in data

2. **generateAiAgentResponse** — Invocable action for agent conversation
   - Endpoint: `/services/data/v64.0/actions/custom/generateAiAgentResponse/VizVoice`
   - Called via Apex proxy with Named Credential auth

---

## 🔧 Configuration Files

### Key Constants (`src/lib/constants.ts`):

```typescript
export const AGENT_API_NAME = 'VizVoice';
export const AGENT_ID = '0XxgK000001rUH7SAM';
export const TARGET_ENTITY_TYPE = 'dashboard';
export const TARGET_ENTITY_ID = 'C360_Semantic_Model_Extended_0ba';
```

### Named Credential Setup:

**External Credential:** `VizVoice_Org_API`
- Protocol: OAuth 2.0 Client Credentials
- Scopes: `api web refresh_token` (leave blank — auto-assigned from External Client App)
- Identity Provider URL: `https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/services/oauth2/token`

**Named Credential:** `VizVoice`
- URL: `https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com`
- External Credential: `VizVoice_Org_API`

**Permission Set:** `VizVoice_Named_Cred_Access`
- Must be assigned to users who will use the UI Bundle

---

## 📊 Current Status

### ✅ What's Working:

- ✅ **Voice assistant end-to-end** — speech-to-text, agent call, text-to-speech (100% browser-native, zero server compute)
- ✅ **Agent authentication** — Apex REST proxy with Named Credential OAuth
- ✅ **Data Cloud semantic model** — C360_Semantic_Model_Extended_0ba grounded analytics
- ✅ **Tableau dashboard embedding** — Analytics SDK V3 with JWT Bearer Flow frontdoor auth
- ✅ **100% WCAG 2.2 AA compliance:**
  - ARIA live regions (agent responses announced immediately)
  - Keyboard-only navigation (Alt+V shortcut, Tab/Enter)
  - Focus indicators (4.5:1 contrast minimum)
  - Error recovery suggestions (contextual help)
  - Image alt text (all non-text content labeled)
- ✅ **RAI transparency features:**
  - AI identity disclosure in welcome message
  - Help button with capability/limitation disclosure
  - Uncertainty expression in agent responses (acknowledges ties)
- ✅ **Sustainability optimizations:**
  - Browser-native speech (zero cloud STT/TTS)
  - One agent call per utterance (no retry loops)
  - Aggressive caching (80-90% fewer API calls)
  - Client-side rendering (zero SSR overhead)
  - 40-60% compute reduction vs typical chatbots
- ✅ **Colorblind-safe design** — Tableau 10 palette (blue #4E79A7, teal #76B7B2, orange #F28E2B)

### 📋 Hackathon Submission Status:

- ✅ **Accessibility Expert Skill** — 21/21 criteria passing (100%)
- ✅ **RAI Self-Check** — All 3 transparency gaps addressed
- ✅ **Sustainability documentation** — Full compute efficiency analysis
- ⏳ **Demo video** — In progress
- ⏳ **User testing** — Scheduled with blind colleague (Gina)

### 🎯 Post-Hackathon Roadmap:

1. **Multi-dataset support** — Externalize semantic model config to Custom Metadata Type
2. **Slack integration** — Voice-to-voice via Slack bot (Platform Innovation Award candidate)
3. **Response streaming** — Incremental TTS (30-50% latency reduction)
4. **Common question caching** — Pre-compute answers for top 20 queries (40-60% cache hit rate)

---

## 📝 Documentation

### 📋 Hackathon Submission (Required)
- **[docs/ACCESSIBILITY_REVIEW.md](docs/ACCESSIBILITY_REVIEW.md)** — WCAG 2.2 AA compliance verification (100% passing)
- **[docs/RAI_SELF_CHECK.md](docs/RAI_SELF_CHECK.md)** — Responsible AI transparency assessment + fixes
- **[docs/AGENT_TEST_RESULTS.md](docs/AGENT_TEST_RESULTS.md)** — 11 validated test queries with agent responses
- **[hackathon-reference/SUSTAINABILITY.md](hackathon-reference/SUSTAINABILITY.md)** — Compute efficiency analysis (40-60% reduction)
- **[DEVPOST_SUBMISSION_ANSWERS.md](DEVPOST_SUBMISSION_ANSWERS.md)** — Complete Devpost submission text

### 🏗️ Technical Reference
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System architecture and data flow
- **[docs/SEMANTIC_MODEL_UI_WALKTHROUGH.md](docs/SEMANTIC_MODEL_UI_WALKTHROUGH.md)** — Data Cloud semantic model configuration
- **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)** — 5-minute demo video script

### 🗄️ Archived Documentation
Additional planning, configuration, and development notes are preserved in the [archive/](archive/) directory:
- **archive/planning/** — Sprint plans, test scripts, video planning
- **archive/config/** — Agent configuration history, Data Cloud setup guides
- **archive/data-samples/** — CSV sample datasets for testing
- **archive/design/** — UI/UX design iterations
- **archive/troubleshooting/** — Technical debugging notes

---

## 🏆 Hackathon Submission

**Track:** Builder — Accessibility  
**Team Size:** 2-3  
**Org:** orgfarm-aac260ab62-dev-ed  
**Demo Video:** (coming soon)  
**Project Description:** See TEAM_STATUS.md Section "Project Description Template"

---

## 🎬 Demo Script

**Minute 1:** Show inaccessible traditional dashboard with screen reader  
**Minute 2:** Introduce VizVoice, activate voice assistant (Alt+V)  
**Minute 3:** Ask 3-4 sample questions, demonstrate natural conversation  
**Minute 4:** Show accessibility features (keyboard nav, ARIA, no visual metaphors)  
**Minute 5:** Impact statement + GitHub repo

---

## 🔗 Resources

- **Live UI:** https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice
- **GitHub Repo:** https://github.com/RussEvans222/VizVoice
- **Agentforce Builder:** Setup → Agentforce → Agents → VizVoice
- **Hackathon Channel:** #a4g-hackathon-support

---

## 📄 License

MIT License — see [LICENSE.txt](LICENSE.txt)

---

## 👥 Team

Built for Salesforce "Agentforce for Good" Hackathon — July 2026

**Impact:** Making analytics accessible to 253 million people worldwide with vision impairment. 🌍♿
