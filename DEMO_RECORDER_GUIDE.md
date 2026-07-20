# Using Demo Recorder Skill for VizVoice

**For:** Demo recording partner  
**Skill:** `/demo-recorder:demo-setup`  
**Purpose:** Automated demo recording setup and execution

---

## 🎬 What is Demo Recorder?

The demo-recorder skill is a Salesforce-specific tool that helps you:
- Set up a working demo environment
- Record demos with browser automation
- Capture screenshots and video clips
- Generate captions and transcripts

**Perfect for hackathon demo videos!**

---

## 🚀 How to Use It

### Step 1: Clone the Repository First

```bash
git clone https://github.com/RussEvans222/VizVoice.git
cd VizVoice
```

### Step 2: Open Claude Code in This Directory

Make sure you're in the VizVoice project directory when you start Claude Code.

### Step 3: Run the Demo Setup Skill

In Claude Code, type:

```
/demo-recorder:demo-setup
```

### Step 4: Follow Claude's Prompts

The skill will ask you questions like:
- **Org URL:** `https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com`
- **Demo type:** Voice assistant / Accessibility demo
- **Key features to showcase:** Voice interaction, WCAG compliance, Data Cloud integration
- **Target recording length:** 5 minutes

---

## 📋 What the Skill Will Do

The `/demo-recorder:demo-setup` skill will:

1. ✅ **Authenticate to the org**
   - Opens browser for Salesforce login
   - Sets up org alias

2. ✅ **Deploy the application**
   - Builds the UI Bundle
   - Deploys metadata to org
   - Verifies deployment success

3. ✅ **Set up demo script**
   - Creates/updates demo script based on your inputs
   - Defines key talking points
   - Sets up timing for each section

4. ✅ **Prepare recording environment**
   - Identifies UI to record
   - Sets up browser automation if needed
   - Configures recording settings

5. ✅ **Generate test data (if needed)**
   - Already have test data in Data Cloud
   - Skill will verify data is accessible

---

## 🎤 VizVoice-Specific Setup Info

When the skill asks for details, provide:

### Org Information
- **Instance URL:** `https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com`
- **Org Alias:** `vizvoice-dev`
- **UI Bundle URL:** `/apex/ui_bundle__vizvoice`

### Demo Features to Highlight
1. **Voice-first accessibility** — Alt+V shortcut, microphone button
2. **WCAG 2.2 AA compliance** — 21/21 criteria passing
3. **Data Cloud integration** — Grounded analytics from semantic model
4. **Natural conversation** — Follow-up questions, context awareness
5. **Browser-native speech** — Zero cloud compute (Web Speech API)

### Key Demo Questions
1. "How many trips were cancelled in December?"
2. "Compare December to November"
3. "What line had the most delays?"
4. "Tell me more about the Green Line"

### Target Audience
- Hackathon judges (technical + impact-focused)
- Accessibility advocates
- Salesforce Agentforce users

### Success Metrics
- Demo length: 4:30-5:00 minutes
- Shows 3-4 voice interactions
- Demonstrates accessibility features
- Clear impact statement (253M people)

---

## 🎯 After Demo Setup Completes

The skill will provide:

1. **✅ Deployed application** ready to use
2. **✅ Demo script** with timing and talking points
3. **✅ Test questions** pre-loaded
4. **✅ Recording checklist** to verify before recording
5. **✅ Browser automation** (if configured) for consistent demos

---

## 📹 Recording the Demo

After setup, you can either:

### Option A: Manual Recording (Recommended for Hackathon)
- Use OBS Studio, QuickTime, or Camtasia
- Follow the generated demo script
- More natural and authentic feel
- Better for showcasing real voice interaction

### Option B: Automated Recording (Using Demo Recorder)
- Run `/demo-recorder:demo-capture` after setup
- Browser automation drives the demo
- Consistent, repeatable recordings
- Good for multiple takes

**For this hackathon, Option A (manual) is recommended** because:
- Voice interaction is more authentic
- Shows real-time agent responses
- Judges can see genuine accessibility features
- More engaging storytelling

---

## 🔧 Alternative: Simple Manual Setup

If the demo-recorder skill doesn't work or you prefer manual setup:

### Quick Manual Setup (5 minutes)

```bash
# 1. Clone repo
git clone https://github.com/RussEvans222/VizVoice.git
cd VizVoice

# 2. Authenticate
sf org login web \
  --alias vizvoice-dev \
  --instance-url https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com

# 3. Build and deploy
cd force-app/main/default/uiBundles/vizvoice
npm install
npm run build
cd -
sf project deploy start --source-dir force-app --target-org vizvoice-dev

# 4. Open the UI
# Visit: https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice

# 5. Follow DEMO_SCRIPT.md for recording
```

---

## 📊 Comparison: Demo Recorder vs Manual Setup

| Feature | Demo Recorder Skill | Manual Setup |
|---------|-------------------|--------------|
| **Setup time** | 10-15 min (automated) | 5-10 min (manual commands) |
| **Recording** | Can automate | Manual recording |
| **Flexibility** | Structured workflow | Full control |
| **Best for** | Repeatable demos | One-time recordings |
| **Hackathon fit** | Good for setup | Good for authentic demo |

---

## 🎬 Recommended Approach for Your Partner

**Best workflow:**

1. **Use `/demo-recorder:demo-setup`** to:
   - Deploy the application automatically
   - Generate/verify demo script
   - Set up org and verify data

2. **Then record manually** with:
   - OBS Studio / QuickTime / Camtasia
   - Follow the demo script
   - Real voice interaction (Alt+V)
   - Natural, authentic feel

This gives you the **automation benefits of demo-recorder** for setup, plus the **authenticity of manual recording** for the actual demo.

---

## 🚨 Troubleshooting

### Problem: Skill not found
**Solution:** Make sure you're in the VizVoice project directory and have the latest Claude Code version.

### Problem: Skill asks for info you don't have
**Solution:** Use these defaults:
- Org: `https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com`
- Alias: `vizvoice-dev`
- UI: `/apex/ui_bundle__vizvoice`

### Problem: Deployment fails
**Solution:** Try manual deployment:
```bash
cd force-app/main/default/uiBundles/vizvoice
npm install
npm run build
cd -
sf project deploy start --source-dir force-app --target-org vizvoice-dev
```

### Problem: Voice assistant not responding
**Solution:**
1. Check browser console (F12)
2. Verify microphone permissions
3. Use Chrome or Edge (best Web Speech API support)
4. Check you're on HTTPS (required for microphone)

---

## 📝 Demo Script Reference

After setup, refer to:
- **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)** — Full 5-minute demo script with timing
- **[QUICK_START_DEMO.md](QUICK_START_DEMO.md)** — Sample questions and tips

---

## ✅ Success Checklist

Before recording:
- [ ] Application deployed and accessible
- [ ] Voice assistant responding to test questions
- [ ] Microphone permissions granted
- [ ] Browser in full screen (F11)
- [ ] Demo script printed or on second screen
- [ ] Screen recording software tested (30-second test)
- [ ] Notifications disabled (Do Not Disturb)
- [ ] Clean desktop (close unnecessary apps/tabs)

---

## 🎯 Final Recommendation

**For VizVoice hackathon demo:**

```
1. Run: /demo-recorder:demo-setup
   → Let skill handle deployment and setup

2. Test voice assistant manually
   → Verify all sample questions work

3. Record with OBS/QuickTime
   → Follow DEMO_SCRIPT.md
   → Natural voice interaction
   → Show real accessibility features

4. Upload to YouTube/Vimeo
   → Add to Devpost submission
```

This approach gives you the best of both worlds: **automated setup** + **authentic recording**.

---

## 📞 Need Help?

**In the repo:**
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md) — Full demo script
- [QUICK_START_DEMO.md](QUICK_START_DEMO.md) — Manual setup guide
- [PARTNER_PROMPT.md](PARTNER_PROMPT.md) — Simple Claude prompt

**Slack:**
- `#a4g-hackathon-support` — Hackathon questions

**GitHub:**
- [github.com/RussEvans222/VizVoice/issues](https://github.com/RussEvans222/VizVoice/issues)

---

Good luck with the demo! 🎉🎬
