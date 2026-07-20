# VizVoice Demo — Manual Clips to Record in Camtasia

**Total clips needed:** 2 live app recordings  
**Where they go:** Drop into the automated demo at the marked timestamps  
**Recording setup:** Screen capture at 1920x1080, include system audio to capture voice responses

---

## 🎬 CLIP 1: "First Voice Interaction" (30-45 seconds)

**Timeline position:** After slide "Live Demo: Voice Interaction" (~2:00 mark)  
**What the narration says before this clip:**  
> "Let me show you VizVoice in action. I'll open the app, activate voice mode with Alt+V, and ask a few questions about our transit data."

### What to record:

1. **Open the VizVoice app** in your browser  
   URL: `https://orgfarm-aac260ab62-dev-ed--c.develop.my.salesforce.app/app/c__vizvoice`

2. **Press Alt+V** (or click the mic button) to activate listening  
   → Mic button should turn blue/show listening state

3. **Say aloud:** "What line had the most cancellations?"  
   → Wait for agent to respond  
   → Agent should say something like: "Green Line had 37 cancellations, the highest of all lines in December."

4. **Say aloud (follow-up):** "How does that compare to November?"  
   → Wait for agent response  
   → Agent should say: "November had 29 cancellations on Green Line — that's 8 more in December, up 27%."

5. **Stop recording** after the second response completes

### Recording tips:
- Speak clearly and at normal pace
- Let the agent fully finish speaking before asking the next question
- If the agent gives a wrong/slow answer, just re-record this clip (it's short)
- Make sure the conversation history shows both exchanges in the UI

### Expected duration: 30-45 seconds

✅ **CLIP 1 RECORDED SUCCESSFULLY** — These prompts worked:
1. "What line had the most cancellations?"
2. "How does that compare to November?"

---

## 🎬 CLIP 2: "Full Voice Conversation" (45-60 seconds)

**Timeline position:** After slide "Live Demo: Full Interaction" (~4:15 mark)  
**What the narration says before this clip:**  
> "Here's a full voice conversation showing the natural flow. Watch how follow-up questions work without re-stating context."

### What to record:

1. **Make sure mic is active** (Alt+V if needed)

2. **Say aloud:** "What was the total number of cancellations?"  
   → Agent responds with total count

3. **Say aloud:** "How many total trips were there in December?"  
   → Agent responds with trip count

4. **Say aloud:** "Show me the trend over time for cancellations"  
   → Agent responds with month-by-month summary or trend explanation

5. **Stop recording** after the third response completes

### Recording tips:
- This shows conversational flow — the agent should understand "the" and "December" from prior context
- If one question fails, you can re-record just this clip without affecting Clip 1
- Aim for 3 distinct questions that build on each other

### Expected duration: 45-60 seconds

---

## 📋 Pre-Recording Checklist

Before you start recording these clips:

- [ ] **Test your questions** — run through them once to make sure the agent responds correctly
- [ ] **Set screen resolution** to 1920x1080 (or at least 1920 width)
- [ ] **Clear browser cache** if the UI looks stale (purple colors instead of blue/teal)
- [ ] **Check system audio** — Camtasia should capture both your voice AND the TTS responses
- [ ] **Close unnecessary tabs/windows** — clean desktop for recording
- [ ] **Turn off notifications** (Slack, calendar popups, etc.)

---

## 🎞️ Camtasia Editing Workflow

Once you have both clips recorded:

1. **Export automated demo** from `demo-recorder` (the narrated slides + diagram)
2. **Open in Camtasia**
3. **Import Clip 1** and drop it at ~2:00 mark (after "Live Demo: Voice Interaction" slide)
4. **Import Clip 2** and drop it at ~4:15 mark (after "Live Demo: Full Interaction" slide)
5. **Trim/fade** each clip as needed to match the timing
6. **Export final video** as MP4

---

## 🚨 Troubleshooting

**If the agent doesn't respond:**
- Check that you're logged into the org (`epic.0d666f471e01@orgfarm.salesforce.com`)
- Verify the agent is active in Agentforce Builder
- Try clicking the mic button manually instead of Alt+V
- Check browser console for errors (F12)

**If the agent gives a wrong answer:**
- Make sure you're using one of the tested questions from `AGENT_TEST_RESULTS.md`
- The semantic model might be stale — check that Data Cloud is still connected
- If a question consistently fails, swap it for a working one from the test results

**If audio doesn't record:**
- Check Camtasia's audio input settings (capture system audio)
- Test TTS playback separately (does the browser speak when the agent responds?)
- Make sure your mic is working for the input questions

---

## ✅ Clip Approval Checklist

Before you consider a clip "done":

- [ ] Question is clearly audible
- [ ] Agent response is clearly audible
- [ ] UI is visible (not covered by other windows)
- [ ] No dead air longer than 2-3 seconds
- [ ] Conversation history shows both exchanges
- [ ] No visible errors or broken UI elements
- [ ] Clip duration is reasonable (under 60 seconds)

---

**Questions?** Post in #a4g-hackathon-support or ping your teammates for a second opinion on the recorded clips before final edit.
