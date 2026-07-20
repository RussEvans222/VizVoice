# Partner Demo Setup Prompt

**Instructions:** Copy the prompt below and paste it into Claude Code. Claude will set everything up automatically.

---

## 📋 Prompt for Your Partner

```
I need to set up and test the VizVoice project for demo recording.

Please:
1. Clone the repository from https://github.com/RussEvans222/VizVoice
2. Authenticate to the Salesforce org at https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com
3. Install all dependencies
4. Build the UI Bundle
5. Deploy to the org
6. Give me the URL to test the voice assistant
7. Show me 3-5 sample questions I can ask to test it

After setup, help me verify everything works by testing the voice assistant with a few sample questions.
```

---

## ✅ What Claude Will Do

Claude Code will automatically:
1. ✅ Clone the VizVoice repository
2. ✅ Set up Salesforce CLI authentication
3. ✅ Install Node.js dependencies
4. ✅ Build the React UI Bundle
5. ✅ Deploy to the Salesforce org
6. ✅ Provide the voice assistant URL
7. ✅ Give you sample test questions

**Estimated time:** 5-10 minutes (mostly build/deploy time)

---

## 🎤 After Setup

Claude will give you:
- **URL to open:** `https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/apex/ui_bundle__vizvoice`
- **Sample questions** like:
  - "How many trips were cancelled in December?"
  - "Compare December to November"
  - "What line had the most delays?"

---

## 📹 Demo Recording

Once you verify it works, you can record your demo following the script in **DEMO_SCRIPT.md**

**Demo length:** 4:30-5:00 minutes  
**Key sections:**
1. Problem statement (30 sec)
2. Introduce VizVoice (30 sec)
3. Live voice demo (2 min)
4. Show accessibility features (1 min)
5. Impact statement (30 sec)

Good luck! 🎉
