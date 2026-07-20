# VizVoice Demo Quick Start Guide

**For:** Demo recording partner  
**Time:** ~5-10 minutes to get running  
**What you'll do:** Clone the repo, build, and run the voice assistant demo

---

## 📋 Prerequisites Check

Before you start, make sure you have:

- [ ] **Node.js v22+** — Check with: `node --version`
  - If not installed: [Download from nodejs.org](https://nodejs.org/)
- [ ] **Salesforce CLI v2+** — Check with: `sf --version`
  - If not installed: `npm install -g @salesforce/cli`
- [ ] **Git** — Check with: `git --version`
  - Usually pre-installed on Mac/Linux, [download for Windows](https://git-scm.com/)

---

## 🚀 One-Command Setup (Copy-Paste This!)

Open your terminal and paste this entire block:

```bash
# Clone the repository
git clone https://github.com/RussEvans222/VizVoice.git
cd VizVoice

# Authenticate to the Salesforce org
echo "🔑 Opening browser to authenticate..."
sf org login web \
  --alias vizvoice-dev \
  --instance-url https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com

# Wait for authentication, then continue...
echo "✅ Authentication complete! Building project..."

# Install root dependencies (optional, only if package.json exists)
[ -f package.json ] && npm install || echo "No root package.json, skipping..."

# Build the UI Bundle
cd force-app/main/default/uiBundles/vizvoice
echo "📦 Installing UI Bundle dependencies..."
npm install
echo "🔨 Building UI Bundle..."
npm run build
cd -

# Deploy to org
echo "🚀 Deploying to Salesforce org..."
sf project deploy start --source-dir force-app --target-org vizvoice-dev

# Success!
echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🎤 Open the voice assistant:"
echo "https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice"
echo ""
echo "💡 To test the voice assistant:"
echo "   1. Press Alt+V (or click the microphone button)"
echo "   2. Say: 'How many trips were cancelled in December?'"
echo "   3. Listen for the spoken answer!"
echo ""
echo "📹 For demo recording, see: DEMO_SCRIPT.md"
echo ""
```

---

## 🎤 Testing the Voice Assistant

Once setup is complete, follow these steps:

### 1. Open the UI
Visit: `https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice`

### 2. Grant Microphone Permission
When prompted, click **Allow** to grant microphone access.

### 3. Activate Voice Assistant
- **Keyboard:** Press `Alt+V`
- **Mouse:** Click the microphone button

### 4. Try These Sample Questions

**Simple Facts:**
- "How many trips were cancelled in December?"
- "What was the total ridership in Q4?"
- "How many on-time trips were there in November?"

**Comparisons:**
- "Compare December to November"
- "How does the Green Line compare to the Blue Line?"
- "Show me Red Line versus Orange Line cancellations"

**Rankings:**
- "What line had the most delays?"
- "Which month had the highest ridership?"
- "What was the best performing line?"

**Follow-ups:**
- "Tell me more about that"
- "What about delays?"
- "How does that compare to last month?"

---

## 📹 Demo Recording Tips

### What to Record (5 minutes max)

**Minute 1: Problem Statement (30 seconds)**
- Show a traditional dashboard with screen reader
- Demonstrate inaccessibility (unlabeled SVG graphics)

**Minute 2: Introduce VizVoice (30 seconds)**
- Open the VizVoice UI
- Show the clean interface
- Explain voice-first accessibility

**Minute 3-4: Live Demo (2 minutes)**
- Activate voice (Alt+V)
- Ask 3-4 questions naturally
- Show agent responding with grounded data
- Demonstrate follow-up questions

**Minute 5: Impact & Features (1 minute)**
- Show accessibility features (keyboard nav, ARIA)
- Impact statement (253M people)
- GitHub repo link

### Recording Checklist

- [ ] **Audio:** Clear microphone (no background noise)
- [ ] **Screen:** Full screen capture (1920x1080 recommended)
- [ ] **Browser:** Chrome/Edge (best Web Speech API support)
- [ ] **Captions:** Enable if possible (or add in post-production)
- [ ] **Pace:** Speak slowly and clearly
- [ ] **Pauses:** Brief pause after each question before agent responds

### Script Reference

Full demo script with exact timing: [DEMO_SCRIPT.md](DEMO_SCRIPT.md)

---

## 🔧 Troubleshooting

### Problem: "Command not found: sf"
**Solution:** Install Salesforce CLI
```bash
npm install -g @salesforce/cli
```

### Problem: "Command not found: npm"
**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

### Problem: Microphone not working
**Solution:**
1. Check browser permissions (should see microphone icon in address bar)
2. Try Chrome or Edge (best Web Speech API support)
3. Use HTTPS (required for Web Speech API)
4. Check System Preferences → Security & Privacy → Microphone

### Problem: Agent not responding
**Solution:**
1. Check browser console for errors (F12 → Console tab)
2. Verify you're authenticated: `sf org display --target-org vizvoice-dev`
3. Re-deploy: `sf project deploy start --source-dir force-app --target-org vizvoice-dev`

### Problem: Build fails
**Solution:**
```bash
# Clean install
cd force-app/main/default/uiBundles/vizvoice
rm -rf node_modules package-lock.json
npm install
npm run build
cd -
```

### Problem: Authentication expires
**Solution:**
```bash
# Re-authenticate
sf org login web \
  --alias vizvoice-dev \
  --instance-url https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com
```

---

## 📞 Need Help?

**Slack Channels:**
- `#a4g-hackathon-support` — Hackathon questions
- `#help-tableau-next` — Tableau questions
- `#ask-scct` — Data Cloud questions

**Documentation:**
- [README.md](README.md) — Project overview
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md) — Full demo script with timing
- [docs/ACCESSIBILITY_REVIEW.md](docs/ACCESSIBILITY_REVIEW.md) — Accessibility features
- [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md) — Submission requirements

**GitHub Issues:**
- [github.com/RussEvans222/VizVoice/issues](https://github.com/RussEvans222/VizVoice/issues)

---

## ✅ Pre-Recording Checklist

Before you hit record:

- [ ] Voice assistant responds to all sample questions
- [ ] Audio is clear (test recording 30 seconds first)
- [ ] Screen capture is working (1920x1080 recommended)
- [ ] Browser is in full screen mode (F11)
- [ ] Close unnecessary tabs and apps (clean desktop)
- [ ] Disable notifications (Do Not Disturb mode)
- [ ] Script printed or on second screen for reference
- [ ] Demo questions ready (sticky note or script)

---

## 🎬 Recording Tools (Recommendations)

**Mac:**
- QuickTime Player (built-in, free)
- ScreenFlow (professional, paid)
- OBS Studio (free, open source)

**Windows:**
- OBS Studio (free, open source)
- Camtasia (professional, paid)
- Xbox Game Bar (built-in, free)

**Online:**
- Loom (free tier available)
- Screencast-O-Matic (free tier available)

---

## 🎯 Success Criteria

Your demo is ready when:

- ✅ Voice assistant responds correctly to all sample questions
- ✅ Audio is clear and agent responses are audible
- ✅ Screen capture shows full UI (no cutoff)
- ✅ Demo flows naturally (4:30-5:00 minutes)
- ✅ Accessibility features are demonstrated
- ✅ Impact statement is clear and compelling

---

## 🚀 Let's Go!

You're all set! The VizVoice voice assistant is making analytics accessible to millions. Your demo will show judges how voice-first AI can eliminate barriers for blind and low-vision users.

**Good luck with the recording! 🎉**

---

## 📝 After Recording

1. **Upload to YouTube/Vimeo** (unlisted or public)
2. **Add to DEVPOST_SUBMISSION_ANSWERS.md** (paste video URL)
3. **Share link in Slack** (#a4g-hackathon-support)
4. **Submit to Devpost** before deadline

**Demo video URL will go here:**  
_[Paste YouTube/Vimeo link after upload]_
