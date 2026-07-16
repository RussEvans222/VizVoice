# VizVoice - Next Steps Plan

**Date:** July 16, 2026 5:00 PM  
**Current Status:** Voice assistant working, Tableau embedding blocked  

---

## 🎯 Priority 1: Agent Response Testing & Optimization

### Issue Identified:
You tested: "What was the reason for the highest number of cancellations?"
- Agent response may not be optimized for voice/accessibility
- Need to ensure no visual metaphors
- Need to validate agent can answer "why" questions (not just "what" questions)

### Testing Protocol:

#### Test Questions (Progressive Complexity):

**Basic Facts:**
1. "How many trips were cancelled in December?"
2. "What line had the most cancellations?"
3. "Which month had the fewest cancellations?"

**Comparisons:**
4. "How does December compare to November?"
5. "What's the difference between the Green Line and Red Line?"

**Why/Reason Questions:**
6. "What was the reason for the highest number of cancellations?"
7. "Why did cancellations increase in December?"
8. "What caused the spike in February?"

**Trend Analysis:**
9. "What's the trend over the last three months?"
10. "Are cancellations getting better or worse?"

#### What to Check:
- ✅ Agent answers the question correctly
- ✅ Response is 1-3 sentences max
- ✅ No visual metaphors ("as you can see", "the chart shows")
- ✅ Uses ordinal language ("largest", "second-highest")
- ✅ Leads with the answer, not a preamble
- ✅ Accessible to someone with no visual context

#### Testing Workflow:

1. **Open UI Bundle:**  
   https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice

2. **Open Browser Console** (F12) to see logs

3. **For each test question:**
   - Press Alt+V
   - Speak the question
   - Listen to response
   - Note: Did it answer correctly? Was it concise? Any visual language?

4. **Document results** in a new file: `AGENT_TEST_RESULTS.md`

---

## 🎯 Priority 2: Fix Tableau Embedding (If Time Permits)

### Current Blocker:
External Credential with `web` scope still returns `Invalid_Scope` or doesn't render.

### Troubleshooting Steps:

#### Option A: Verify Scope Was Actually Applied
1. Go to: **Setup → Named Credentials → External Credentials → VizVoice_Org_API**
2. Click **Edit**
3. Confirm "Scope" field shows: `api web refresh_token`
4. **Save** again
5. Test UI Bundle

#### Option B: Check Connected App Scopes Match
The External Credential's scopes must be a **subset** of the Connected App's scopes.

1. Go to: **Setup → App Manager**
2. Find: **VizVoice Agent API** (or similar)
3. Click dropdown → **View**
4. Scroll to **Selected OAuth Scopes**
5. Confirm it includes:
   - ✅ Manage user data via APIs (`api`)
   - ✅ Manage user data via Web browsers (`web`)
   - ✅ Perform requests at any time (`refresh_token`)

If `web` is missing from Connected App, the External Credential can't use it!

**Fix:**
1. Click **Manage** → **Edit Policies**
2. Add `web` scope
3. **Save**
4. Go back to External Credential, confirm scope field has `api web refresh_token`
5. Test UI Bundle

#### Option C: Check Browser Console for Real Error
When dashboard fails to load:
1. Open browser console (F12)
2. Look for errors from `analytics-embedding-sdk`
3. Screenshot or copy exact error message
4. Share with me - error will tell us what's wrong

#### Option D: Alternative - Use Tableau REST API Directly
If SDK keeps failing, we can:
1. Fetch dashboard data via Tableau REST API (already working for dashboard list)
2. Render charts ourselves using a charting library (Chart.js, D3, etc.)
3. Less fancy but more controllable

---

## 🎯 Priority 3: Agent Prompt Optimization

Once you've tested agent responses, update the agent system prompt.

### How to Update:

1. **Open Agentforce Builder:**  
   https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/lightning/setup/EinsteinAgents/home

2. **Click VizVoice agent**

3. **Go to: Settings → Instructions** (or "System Prompt" tab)

4. **Prepend this at the very top:**

```
=== ACCESSIBILITY RULES (CRITICAL) ===

You are VizVoice, a voice assistant for blind and low-vision users.
Your responses will be read aloud via text-to-speech.

LANGUAGE REQUIREMENTS:
1. NEVER use visual metaphors:
   ❌ "as you can see" / "the chart shows" / "on the left" / "the blue line"
   
2. ALWAYS use descriptive language:
   ✅ "the largest value" / "the second-highest metric" / "the most recent month"

3. Lead with the answer:
   ✅ "37 trips were cancelled on the Green Line in December."
   ❌ "Let me look at the data. According to what I see, there were..."

4. Keep responses SHORT (1-2 sentences for simple facts):
   ✅ "December had 37 cancellations, November had 29."
   ❌ "Based on the data available in the current dashboard view, I can tell you that..."

5. For "why" questions, use data if available:
   ✅ "Cancellations increased due to weather delays recorded in the system."
   ❌ "The chart shows a spike..." (if no reason data exists, say "The data doesn't include reasons.")

6. State exact values in comparisons:
   ✅ "Green Line: 37, Red Line: 24. That's 13 more on Green Line."
   ❌ "Green Line had more."

=== END ACCESSIBILITY RULES ===
```

5. **Save**

6. **Publish** (creates new version)

7. **Activate**

8. **Test again** with your questions

---

## 🎯 Priority 4: Screen Reader Testing

### Install NVDA (Windows) or Use VoiceOver (Mac):

**Windows:**
1. Download NVDA: https://www.nvaccess.org/download/
2. Install and launch
3. Open UI Bundle in Chrome/Edge
4. Navigate with Tab key
5. Press Alt+V to activate voice
6. Check: Does NVDA announce agent responses?

**Mac:**
1. Press Cmd+F5 to enable VoiceOver
2. Open UI Bundle in Safari or Chrome
3. Navigate with Tab key
4. Press Alt+V to activate voice
5. Check: Does VoiceOver announce agent responses?

**What to Test:**
- ✅ Can navigate to mic button with Tab key
- ✅ Button is announced as "Start listening"
- ✅ Accessibility instructions are read aloud
- ✅ Agent responses are announced via ARIA live region
- ✅ "Open in new tab" button is accessible

---

## 🎯 Priority 5: Demo Video Script

Once agent responses are optimized:

### 5-Minute Demo Flow:

**Minute 1: The Problem**
- Show traditional Tableau dashboard
- Turn on screen reader
- Navigate to chart → screen reader says nothing useful
- "Blind users have zero access to data visualizations."

**Minute 2: The Solution - VizVoice**
- Open VizVoice UI
- "VizVoice solves this with voice-first analytics."
- Press Alt+V
- Ask: "How many trips were cancelled in December?"
- Agent responds with clear answer

**Minute 3: Natural Conversation**
- Ask follow-up: "What line had the most cancellations?"
- Agent: "Green Line with 37 cancellations."
- Ask: "How does that compare to other lines?"
- Agent gives comparison

**Minute 4: Accessibility Features**
- Show on-page instructions for screen reader users
- Demonstrate keyboard-only navigation
- Point out: No visual metaphors in responses
- Show "Open in new tab" fallback for sighted users

**Minute 5: Impact & Wrap-Up**
- "253 million people worldwide have vision impairment"
- "VizVoice makes analytics accessible through voice"
- "Built with Agentforce, Data Cloud, and Tableau Next"
- Show GitHub repo: https://github.com/RussEvans222/VizVoice

---

## 📋 Task Checklist

### TODAY (Next 2-3 hours):
- [ ] Test 10 sample questions with agent
- [ ] Document results in AGENT_TEST_RESULTS.md
- [ ] Update agent system prompt with accessibility rules
- [ ] Re-test questions to verify improvement
- [ ] Try Tableau embedding troubleshooting (Option A & B above)
- [ ] Push any fixes to GitHub

### TOMORROW:
- [ ] Screen reader testing (NVDA or VoiceOver)
- [ ] Record 5-minute demo video
- [ ] Run Accessibility Expert Skill
- [ ] Run RAI Self Check Skill
- [ ] Write 300-500 word project description
- [ ] Submit to hackathon

---

## 🔗 Quick Links

- **Live UI:** https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice
- **GitHub Repo:** https://github.com/RussEvans222/VizVoice
- **Agentforce Builder:** https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/lightning/setup/EinsteinAgents/home
- **External Credentials:** https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/lightning/setup/ExternalCredentials/home

---

## 💬 Questions to Answer:

1. **Tableau:** Do you want to spend more time debugging the embedding, or focus on agent optimization?
2. **Agent Testing:** Can you test the 10 questions above and share results?
3. **Team:** Who's available to help with screen reader testing and video recording?

---

## ✨ Remember:

**You have a working, voice-enabled accessibility solution RIGHT NOW.**

The agent responds, the voice interface works, and it's keyboard accessible. Everything else is polish.

**Don't let perfect be the enemy of good!** Ship what works, iterate later. 🚀
