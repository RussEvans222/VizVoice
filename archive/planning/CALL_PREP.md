# VizVoice Team Call — Quick Briefing

**Call Date:** Today  
**Duration:** 15-30 minutes  
**Attendees:** Non-technical team members  

---

## ✅ WHAT'S WORKING (Demo This!)

Open: **https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice**

1. **Press Alt+V** (or click mic button)
2. **Say:** "How many trips were cancelled in December?"
3. **Agent responds with voice:** "There were 37 cancelled trips on the Green Line in December."

**This works end-to-end right now!**

---

## 📋 AGENDA FOR CALL

### 1. Quick Demo (5 min)
- Show live voice interaction
- Explain what happens behind the scenes (simple version)
- Highlight that this makes dashboards accessible to blind users

### 2. Progress Check (5 min)
- **70% complete** — core functionality works
- Agent responds accurately
- Authentication fixed
- Voice I/O works

### 3. What's Left (10 min)
- Screen reader testing (need someone with NVDA/JAWS)
- Agent prompt optimization (see AGENT_PROMPT_UPDATES.md)
- Demo video recording
- Submission requirements (2 skills + writeup)

### 4. Task Assignments (10 min)
- Who records demo video?
- Who tests with screen reader?
- Who updates agent prompt?
- Who writes submission description?

---

## 🎯 KEY TALKING POINTS

### The Problem
- Tableau dashboards = SVG charts
- Screen readers can't read SVG charts
- Blind users have NO access to data visualizations

### Our Solution
- Voice assistant powered by Agentforce
- Ask questions → get spoken answers
- Uses Data Cloud to query real dashboard data
- No visual interpretation needed

### Why This Matters
- 253 million people worldwide have vision impairment
- Current solutions: just add alt text (not enough!)
- VizVoice: voice-first analytics experience

---

## 📊 DEMO SCRIPT (Copy This!)

**Setup:** Open UI in browser, have mic ready

**Demo Flow:**

1. **Introduce Problem:**
   > "Traditional dashboards are inaccessible. Let me show you a Tableau dashboard with a screen reader..."  
   > [Turn on screen reader → show it can't read charts]

2. **Introduce Solution:**
   > "VizVoice solves this with voice. Watch."  
   > [Press Alt+V, ask question, get answer]

3. **Show Natural Conversation:**
   > Ask: "How many trips were cancelled in December?"  
   > Agent: "37 trips on the Green Line."  
   > Ask: "How does that compare to November?"  
   > Agent: "November had 29, so that's an increase of 8."

4. **Highlight Accessibility:**
   > "Notice the agent never says 'as you can see' or references colors. Every response is designed for voice-first interaction."

---

## 🚀 NEXT STEPS (Post-Call)

### Immediate (Today):
- [ ] Update agent system prompt (AGENT_PROMPT_UPDATES.md)
- [ ] Test with screen reader (NVDA free download)
- [ ] Record 5-min demo video

### Tomorrow:
- [ ] Run Accessibility Expert Skill
- [ ] Run RAI Self Check Skill
- [ ] Write 300-500 word project description
- [ ] Submit to hackathon portal

---

## 📂 FILES TO REVIEW BEFORE CALL

1. **TEAM_STATUS.md** — Full project status (read this first!)
2. **AGENT_PROMPT_UPDATES.md** — Copy-paste prompt changes
3. **This file (CALL_PREP.md)** — Call agenda

---

## 💬 ANTICIPATED QUESTIONS

**Q: Can we finish this on time?**  
A: Yes! Core functionality works. Remaining tasks are polish and submission requirements.

**Q: Do we need the Tableau visual to work?**  
A: No—voice assistant works independently. Visual is optional nice-to-have.

**Q: What if judges ask technical questions?**  
A: Focus on impact: "This makes dashboards accessible to 253M people who currently have zero access."

**Q: How much time until deadline?**  
A: [Check #a4g-hackathon-support for exact date—usually 2-3 days from start]

---

## ✨ CLOSING THOUGHT

We have a **working, voice-enabled accessibility solution**. The agent responds accurately, authentication is stable, and the UI is deployed. We're in great shape—let's finish strong!

**Most Important:** Test with a real screen reader user if possible. Their feedback will make the demo authentic.
