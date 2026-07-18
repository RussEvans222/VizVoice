# VizVoice

**Voice-First Accessibility Agent for Tableau Next Dashboards**

VizVoice is a voice-first Agentforce agent built on top of Salesforce's Analytics and Visualization V2 template, extended with a real-time voice interaction layer to make Tableau analytics accessible through natural voice conversation. Grounded in a synthetic sample transit dataset for this demo. Code-level accessibility (WCAG 2.2 review, ARIA live regions, keyboard-only control, no-visual-metaphor response language) has been validated; testing with blind and low-vision users is the planned next step, not yet completed.

Built for the **Salesforce "Agentforce for Good" Hackathon** — Accessibility Track

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

- ✅ Voice assistant end-to-end (speech-to-text, agent call, text-to-speech)
- ✅ Agent authentication via Apex REST proxy
- ✅ Semantic model integration (Data Cloud)
- ✅ ARIA accessibility features
- ✅ Keyboard-only navigation (Alt+V)
- ✅ Screen reader instructions on page
- ✅ **VizVoice brand colors** — Blue (#4E79A7) to Teal (#76B7B2) gradient
- ✅ **No red colors** — Error states use orange (#F28E2B)
- ✅ **Branding support** — Ready for Agentforce robot + Tableau Next logos

### ⚠️ Known Issues:

- ⚠️ Tableau dashboard embedding blocked by OAuth scope complexity
  - **Workaround:** "Open in new tab" fallback button (actually better for accessibility!)
  - Native Tableau has better ARIA support than iframes

### 🎯 Next Steps (Pre-Demo):

1. ⚠️ **Optimize agent responses** — ensure no visual language, concise answers
2. ⚠️ **Screen reader testing** — test with NVDA/JAWS/VoiceOver
3. ⚠️ **Record demo video** — 5-minute walkthrough with blind user
4. ⚠️ **Run Accessibility Expert Skill** — document findings
5. ⚠️ **Run RAI Self Check Skill** — document findings

---

## 📝 Documentation

### Core Setup
- **[TEAM_STATUS.md](TEAM_STATUS.md)** — Current progress, what's working, next steps
- **[NEXT_STEPS.md](NEXT_STEPS.md)** — Detailed action plan and testing protocol
- **[CALL_PREP.md](CALL_PREP.md)** — Team briefing for non-technical members
- **[DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md)** — How to build and deploy UI Bundle

### Agent & Data
- **[AGENT_PROMPT_UPDATES.md](AGENT_PROMPT_UPDATES.md)** — Accessibility rules for agent system prompt
- **[AGENT_CONFIG_GUIDE.md](AGENT_CONFIG_GUIDE.md)** — Agent configuration details
- **[AGENT_TEST_PROMPTS.md](AGENT_TEST_PROMPTS.md)** — Test questions for agent validation
- **[DATASET_CURRENT_CAPABILITIES.md](DATASET_CURRENT_CAPABILITIES.md)** — What questions work with current data
- **[DATASET_ACCESSIBILITY_PROPOSAL.md](DATASET_ACCESSIBILITY_PROPOSAL.md)** — Enhanced dataset design for accessibility

### UI & Branding
- **[VIZVOICE_COLOR_PALETTE.md](VIZVOICE_COLOR_PALETTE.md)** — Complete brand color reference (blue/teal/orange)
- **[COLOR_UPDATES_APPLIED.md](COLOR_UPDATES_APPLIED.md)** — Detailed changelog of color updates
- **[ADD_BRANDING_IMAGES.md](ADD_BRANDING_IMAGES.md)** — Guide for adding Agentforce/Tableau logos
- **[DESIGN_UNIFICATION_GUIDE.md](DESIGN_UNIFICATION_GUIDE.md)** — Dashboard and app color coordination

### Accessibility
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** — WCAG 2.2 compliance review and findings
- **[README_ACCESSIBILITY_UPDATES.md](README_ACCESSIBILITY_UPDATES.md)** — Accessibility feature documentation

### Technical Deep-Dives
- **[TABLEAU_EMBEDDING_NOTES.md](TABLEAU_EMBEDDING_NOTES.md)** — Technical deep-dive on embedding attempts
- **[TABLEAU_LAYOUT_FIX.md](TABLEAU_LAYOUT_FIX.md)** — Making dashboard charts full-width
- **[PURPLE_COLOR_DEBUG.md](PURPLE_COLOR_DEBUG.md)** — Troubleshooting cache issues after color updates

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
