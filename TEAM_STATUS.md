# VizVoice — Team Status Update
**Last Updated:** July 16, 2026  
**Project Progress:** 70% Complete  
**Hackathon:** Agentforce for Good — Accessibility Track  

---

## 🎯 What We're Building

**VizVoice** is a voice-first accessibility agent that makes Tableau dashboards fully accessible to blind and low-vision users. Instead of inaccessible chart visuals, users ask questions by voice and get spoken answers powered by Agentforce + Data Cloud analytics.

---

## ✅ What's Working Now (The Good News!)

### 1. **Agent is Live & Responding** ✅
- Agent "VizVoice" is deployed, active, and answering questions
- **Example response**: "There were 37 cancelled trips on the Green Line in December. Would you like to know how this compares to other months or lines?"
- Connected to Data Cloud semantic model: `C360_Semantic_Model_Extended_0ba`

### 2. **Voice Interface Works** ✅
- User presses **Alt+V** or taps microphone button
- Speaks their question → gets voice answer back
- Uses Web Speech API (built into Chrome/Edge)

### 3. **Authentication Fixed** ✅
- UI Bundle now routes through Apex REST proxy (`VizVoiceAgentProxy.cls`)
- Uses Named Credential for secure org-to-org authentication
- No more "session expired" errors

### 4. **Tableau Dashboard Loading** ✅
- Dashboard list API works
- Dashboard "TransitData" is available
- Dashboard frame appears in UI

---

## 🚧 What Still Needs Work (30% Remaining)

### Issue 1: Dashboard Visuals Not Rendering
**Status:** Dashboard frame loads but charts inside are blank/empty  
**Likely Cause:** iframe CSP restrictions or Tableau Embedding SDK configuration  
**Impact:** Medium — voice assistant works independently of the visual  
**Next Steps:**
- Debug Tableau Embedding SDK initialization
- Verify CSP Trusted Sites include all required Tableau domains
- May need to use Tableau Embedding SDK V3 instead of analytics-embedding-sdk

### Issue 2: Agent Responses Not Optimized for Voice
**Status:** Agent gives helpful answers but uses visual language  
**Example:** "Would you like to know..." is screen-reader friendly but could be more concise  
**Impact:** Low — responses are clear but could be more accessible  
**Next Steps:**
- Update agent system prompt to avoid ALL visual metaphors ("the chart shows", "as you can see", "on the left")
- Use ordinal language: "the largest value", "the second-highest metric"
- Keep responses to 1-2 sentences max for voice (TTS reads slower than humans read text)

### Issue 3: Missing Screen Reader Enhancements
**Status:** Page lacks ARIA landmarks and descriptive alt text  
**Impact:** High — hackathon judges will test with screen readers  
**Next Steps:**
- Add ARIA live regions so screen reader announces agent responses
- Add descriptive page instructions for screen reader users
- Add audio earcons (subtle sounds) for "listening started" and "response ready"
- Ensure keyboard shortcuts are documented visually on page

---

## 🏗️ Technical Architecture (Simple Explanation)

```
User speaks
  ↓
[Browser captures audio]
  ↓
[Web Speech API transcribes to text]
  ↓
[React UI sends text to Apex endpoint: /services/apexrest/vizvoice/session]
  ↓
[Apex proxy calls Named Credential "VizVoice"]
  ↓
[Named Credential authenticates to org via OAuth]
  ↓
[Apex invokes agent action: generateAiAgentResponse/VizVoice]
  ↓
[Agent queries Data Cloud semantic model: C360_Semantic_Model_Extended_0ba]
  ↓
[Agent returns answer as JSON]
  ↓
[Apex normalizes response → sends back to UI]
  ↓
[Browser speaks answer via Web Speech API TTS]
  ↓
User hears answer!
```

---

## 📂 Key Files (What Each Does)

### Frontend (React UI Bundle)
- **`src/components/VoiceAssistant.tsx`** — Main voice UI (mic button, chat history, keyboard shortcuts)
- **`src/hooks/useAgentSession.ts`** — Handles sending messages to agent via Apex proxy
- **`src/lib/constants.ts`** — Configuration (agent ID, semantic model name)
- **`src/components/TableauEmbed.tsx`** — Tableau dashboard embedding (needs debugging)

### Backend (Salesforce Org)
- **`force-app/main/default/classes/VizVoiceAgentProxy.cls`** — Apex REST endpoint that routes UI → Agent
- **`force-app/main/default/namedCredentials/VizVoice.namedCredential-meta.xml`** — OAuth authentication to org
- **Agent "VizVoice"** — Lives in Agentforce Builder (not in git repo)

---

## 🎤 How to Test Right Now

1. **Open the UI:**  
   https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice

2. **Press Alt+V** (or click the microphone button)

3. **Say a question:**
   - "How many trips were cancelled in December?"
   - "Show me the Green Line data"
   - "What's the busiest transit line?"

4. **Listen to the answer** — should speak back immediately

---

## 🔧 Quick Fixes We Can Make Before Demo

### Priority 1: Make Agent Responses Screen-Reader Friendly
**Where:** Agent system prompt in Agentforce Builder  
**Change:** Add this instruction at the top of agent instructions:

```
ACCESSIBILITY RULES:
- Never use visual metaphors: no "as you can see", "the chart shows", "on the left/right"
- Use ordinal language: "the largest value", "the second metric", "the top result"
- Lead with the most important number first
- Keep answers to 1-2 sentences maximum
- For comparisons: state both values ("December: 37 trips, November: 29 trips")
- Never reference colors or positions
```

### Priority 2: Add ARIA Live Region for Screen Readers
**Where:** `VoiceAssistant.tsx` (line 241)  
**Change:** Add `aria-live="assertive"` to the messages container so screen readers announce new responses immediately

### Priority 3: Add Visual Instructions on Page
**Where:** Header of UI Bundle  
**Change:** Add prominent text:
> "Welcome to VizVoice. Press Alt+V to activate voice assistant. Ask questions about the dashboard data and listen for spoken answers. Optimized for screen readers."

---

## 📊 Demo Script for Hackathon Judges

**Setup:**
1. Open UI with screen reader running (NVDA/JAWS/VoiceOver)
2. Have demo questions ready

**Demo Flow:**
1. **Introduce:** "VizVoice makes Tableau dashboards accessible through voice"
2. **Show problem:** "Traditional dashboards are SVG charts — invisible to screen readers"
3. **Demo solution:**
   - Press Alt+V
   - Ask: "What transit line had the most cancellations?"
   - Listen to response
   - Ask follow-up: "How does that compare to last month?"
4. **Highlight accessibility:**
   - No visual metaphors in responses
   - Keyboard-only navigation
   - ARIA live regions announce responses
   - Works with screen reader on/off

---

## 🚀 What We Need to Finish (Next 2-3 Hours)

### Must-Have for Demo:
1. ✅ Fix agent response prompt (add accessibility rules)
2. ✅ Add ARIA live regions to VoiceAssistant component
3. ✅ Add on-page instructions for screen reader users
4. ⚠️ Test with actual screen reader (NVDA/JAWS/VoiceOver)

### Nice-to-Have:
5. ⚠️ Fix Tableau visual rendering (or remove if not critical)
6. ⚠️ Add audio earcons (beep when listening starts/stops)
7. ⚠️ Add visual loading indicators

### Required for Submission:
8. ⚠️ Run **Accessibility Expert Skill** from AI Expert Suite
9. ⚠️ Run **RAI Self Check Skill** from AI Expert Suite
10. ⚠️ Document findings + our responses in submission doc

---

## 🎬 Demo Video Outline (5 minutes max)

**Minute 1:** Problem statement + show inaccessible dashboard  
**Minute 2:** Introduce VizVoice + show voice activation  
**Minute 3:** Demo 3-4 voice questions with responses  
**Minute 4:** Show screen reader compatibility  
**Minute 5:** Wrap-up + impact statement

---

## 📞 Questions for the Team

1. **Who will record the demo video?** (Need screen recorder + voice narration)
2. **Who has access to NVDA/JAWS for screen reader testing?** (Free NVDA download: nvaccess.org)
3. **Do we want to keep the Tableau visual or focus 100% on voice?** (Voice works now; visual is optional)
4. **Who will write the 300-500 word project description?** (Template in this doc)

---

## 📝 Project Description Template (for Submission)

**VizVoice: Voice-First Analytics for Accessibility**

VizVoice is an Agentforce-powered voice assistant that makes Tableau Next dashboards fully accessible to blind and low-vision users. Traditional data visualizations render as unlabeled SVG graphics, effectively invisible to screen readers. VizVoice solves this by enabling users to ask questions about dashboard data using natural voice commands and receive spoken answers powered by Salesforce Data Cloud's semantic layer.

**Technical Implementation:**  
VizVoice combines Agentforce's Analytics Agent template with a React UI Bundle frontend and browser-native Web Speech APIs. Users activate the assistant with a keyboard shortcut (Alt+V), speak their question, and receive an immediate voice response. Behind the scenes, the agent queries Data Cloud semantic models using the AnalyzeSemanticData action, ensuring responses are grounded in real-time dashboard data.

**Accessibility-First Design:**  
All agent responses are crafted without visual metaphors—no references to colors, chart positions, or phrases like "as you can see." Instead, responses use ordinal language ("the largest value", "the second-highest metric") and lead with the most important number first. The interface is fully keyboard-navigable, includes ARIA live regions for screen reader compatibility, and requires zero visual interpretation.

**Impact:**  
VizVoice demonstrates that data visualization accessibility isn't just about alt text—it's about fundamentally reimagining how users interact with data. By leveraging Agentforce's reasoning capabilities and Data Cloud's semantic intelligence, VizVoice makes analytics truly inclusive.

**Technologies:** Agentforce, Data Cloud, Tableau Next, React UI Bundles, Web Speech API, Apex REST

---

## 🔗 Quick Links

- **UI Bundle:** https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice
- **Agentforce Builder:** https://orgfarm-aac260ab62-dev-ed.develop.lightning.force.com/lightning/setup/EinsteinAgents/home
- **Named Credentials:** https://orgfarm-aac260ab62-dev-ed.develop.lightning.force.com/lightning/setup/NamedCredential/home
- **Hackathon Channel:** #a4g-hackathon-support

---

## ✨ Final Thoughts

We're **70% done** and the core functionality works. The agent answers questions, authentication is stable, and voice I/O works. The remaining 30% is polish: screen reader optimization, visual fixes, and hackathon submission requirements.

**Biggest win:** The agent is LIVE and responding accurately to analytics questions!  
**Biggest remaining task:** Optimize for screen reader users (ARIA, instructions, prompt tuning)

Let's finish strong! 💪
