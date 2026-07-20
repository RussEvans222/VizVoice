# VizVoice Agent Configuration Deployment Guide

## 📋 Summary of Changes

You now have **3 configuration files** in your project:

| File | Purpose |
|------|---------|
| `agent-config-original.yaml` | Your current configuration (backup) |
| `agent-config-optimized.yaml` | ✅ **NEW** - Accessibility-optimized version (DEPLOY THIS) |
| `AGENT_CONFIG_ANALYSIS.md` | Detailed explanation of all changes |

---

## 🔄 What Changed (Quick Summary)

### ✅ **Change #1: System Prompt (MAJOR UPGRADE)**

**Before:**
```yaml
instructions: "You are an AI Agent."
```

**After:**
```yaml
instructions: |
    You are VizVoice, a voice-first accessibility agent for Tableau Next dashboards.
    
    ACCESSIBILITY RULES (NON-NEGOTIABLE):
    1. NEVER use visual metaphors ("as you can see", "the chart shows")
    2. ALWAYS use ordinal language ("the largest segment")
    3. ALWAYS lead with numbers ("Traffic caused 312 delays...")
    4. ALWAYS state BOTH values in comparisons with percentage
    5. KEEP responses concise (under 3 sentences)
    6. ALWAYS include units ("312 trips" not "312")
    7. IF UNCERTAIN, admit it
```

**Impact:** 🔴 **CRITICAL** - This is the core accessibility fix. Prevents all visual metaphors.

---

### ✅ **Change #2: Welcome Message**

**Before:**
```yaml
welcome: |
    Hi! I'm an AI agent for analytics. You can ask me questions about your data 
    and I'll answer with insights and relevant visualizations. I'll also show 
    you how I arrived at those results.
```

**After:**
```yaml
welcome: |
    Hello! I'm VizVoice, your voice assistant for exploring dashboard analytics.
    I'll help you understand the data through conversation - no need to see the charts.
    Ask me questions like "What's the leading cause of delays?" or "Tell me about Blue Line performance."
```

**Changes:**
- ❌ Removed: "visualizations", "I'll show you"
- ✅ Added: Voice-optimized examples, "no need to see the charts"

**Impact:** 🔴 **CRITICAL** - First impression for users. Sets accessibility expectations.

---

### ✅ **Change #3: SemanticDataAnalysis Topic Instructions**

**Before:**
```yaml
instructions: ->
    | Your job is to answer analytical questions about visualizations, dashboards, and metrics
```

**After:**
```yaml
instructions: ->
    | Your job is to answer analytical questions about data in dashboards and semantic models.

      VOICE-FIRST ACCESSIBILITY RULES:
      - NEVER use visual metaphors ("as you can see", "the chart shows")
      - ALWAYS use ordinal language ("the largest segment")
      - ALWAYS lead with numbers and include units
      - For comparisons, state BOTH values with percentage change
      - Keep responses under 3 sentences unless user asks for more detail
```

**Impact:** 🔴 **CRITICAL** - Reinforces accessibility rules at the topic level.

---

### ✅ **Change #4: Agent Description**

**Before:**
```yaml
description: "Help people see and understand data with conversational analytics..."
```

**After:**
```yaml
description: "Voice-first accessibility agent for Tableau Next dashboards. Makes data visualizations accessible to blind and low-vision users through natural, spoken conversation."
```

**Impact:** 🔴 **CRITICAL** - Clarifies VizVoice's mission. Visible in Agentforce Builder.

---

## 🚀 How to Deploy

### **Option A: Via Agentforce Builder UI (EASIEST)**

1. **Open Agentforce Builder** in your org:
   ```
   https://orgfarm-aac260ab62-dev-ed.my.salesforce.com
   ```

2. **Navigate to VizVoice project**

3. **Open the agent configuration editor:**
   - Click **"Advanced"** or **"Settings"**
   - Look for **"Edit Agent Script"** or **"View/Edit YAML"**

4. **Copy the entire contents** of `agent-config-optimized.yaml`:
   ```bash
   # Copy to clipboard
   cat agent-config-optimized.yaml | pbcopy
   ```

5. **Paste** into the editor (replace ALL existing content)

6. **Save** the configuration

7. **Publish** the agent (if required by your org)

8. **Test** immediately (see test scenarios below)

---

### **Option B: Via Salesforce CLI (ADVANCED)**

If your agent is stored as metadata:

```bash
# 1. Backup current config
sf project retrieve start \
  --metadata Bot:VizVoice \
  --target-org vizvoice-dev

# 2. Find the bot metadata file
ls force-app/main/default/bots/VizVoice*

# 3. Replace with optimized config
# (Manual: convert YAML → XML if needed, or use Agentforce Builder)

# 4. Deploy updated config
sf project deploy start \
  --metadata Bot:VizVoice \
  --target-org vizvoice-dev

# 5. Verify deployment
sf project deploy report
```

**Note:** Agentforce agents may not always be deployable via CLI. **Option A (UI) is recommended.**

---

## 🧪 Testing After Deployment

### **Test 1: Voice Greeting**

**Action:** Open VizVoice in your React app

**Expected:**
- ✅ Hears: "Hello! I'm VizVoice, your voice assistant..."
- ✅ No mention of "visualizations" or "I'll show you"

**Fail Condition:**
- ❌ Still says "I'll show you how I arrived at those results"

---

### **Test 2: Simple Data Query**

**Say:** "What's the leading cause of delays?"

**Expected Response:**
```
"Traffic caused 312 delays in 2025, the highest category. 
Mechanical issues were second at 148 delays."
```

**Check for:**
- ✅ Leads with number (312)
- ✅ Uses ordinal language ("highest", "second")
- ✅ Includes units ("delays")
- ✅ NO visual metaphors ("as you can see", "the chart shows")

**Fail Condition:**
- ❌ Says "as you can see" or "the chart shows"
- ❌ Says "the red bar" or "on the left"
- ❌ Doesn't lead with the number

---

### **Test 3: Comparison Query**

**Say:** "How does this month compare to last month for cancelled trips?"

**Expected Response:**
```
"This month had 487 cancelled trips, compared to last month's 523, 
a decrease of 6.9%."
```

**Check for:**
- ✅ States BOTH values (487 and 523)
- ✅ Includes percentage change (6.9%)
- ✅ Includes units ("trips")
- ✅ Concise (1-2 sentences)

**Fail Condition:**
- ❌ Only says "this month is lower"
- ❌ Missing percentage or one of the values

---

### **Test 4: Ambiguous Query**

**Say:** "Tell me about performance."

**Expected Response:**
```
"I can help with that! Are you asking about ridership numbers, 
delay rates, or on-time performance?"
```

**Check for:**
- ✅ Asks for clarification
- ✅ Offers specific options
- ✅ Conversational tone

**Fail Condition:**
- ❌ Says "I need more information" without specifics

---

### **Test 5: Check for Visual Metaphors (CRITICAL)**

**Try to trigger visual language with these queries:**

1. "What do you see in the dashboard?"
2. "Show me the trends."
3. "What does the chart look like?"

**Expected Behavior:**
- ✅ Agent responds WITHOUT using visual metaphors
- ✅ Answers the intent (trends, data) using accessible language
- ✅ Example: "Traffic delays increased from 280 in January to 320 in December, a 14% rise."

**Fail Condition:**
- ❌ Agent says "I see...", "the chart shows...", "as displayed..."

---

## 🔍 Verification Checklist

After deployment, verify these changes took effect:

- [ ] Welcome message no longer mentions "visualizations" or "show you"
- [ ] Agent leads with numbers in responses ("Traffic: 312 delays...")
- [ ] Agent uses ordinal language ("highest", "second-largest")
- [ ] Agent includes units in all numeric responses ("312 trips", not "312")
- [ ] Agent states BOTH values in comparisons + percentage
- [ ] Agent responses are concise (under 3 sentences for simple queries)
- [ ] NO visual metaphors appear ("as you can see", "the chart", "on the left")

---

## 🐛 Troubleshooting

### **Issue:** Changes don't appear in voice responses

**Fix:**
1. Check agent was **saved** in Agentforce Builder
2. Check agent was **published** (if required)
3. Clear browser cache and reload React app
4. Check agent session is using correct `agentId` in React code

---

### **Issue:** Agent still uses visual metaphors

**Fix:**
1. Verify you pasted the ENTIRE `agent-config-optimized.yaml` (not just part of it)
2. Check the system prompt section copied correctly (it's long, ~50 lines)
3. Try **re-deploying** the config
4. Check for any **cached sessions** - start a fresh conversation

---

### **Issue:** Agent gives errors or doesn't respond

**Fix:**
1. Check YAML syntax is valid (no tabs, proper indentation)
2. Verify all required fields are present (variables, actions, etc.)
3. Check Salesforce logs for errors:
   ```bash
   sf apex tail log --target-org vizvoice-dev
   ```
4. If errors persist, **restore original config** from `agent-config-original.yaml` and try again

---

### **Issue:** Want to revert to original config

**Fix:**
1. Open `agent-config-original.yaml` (your backup)
2. Copy entire contents
3. Paste into Agentforce Builder (replace optimized version)
4. Save and publish

---

## 📊 Before/After Comparison (Live Testing)

Once deployed, record these examples:

### **Before Deployment:**
| Query | Response |
|-------|----------|
| "What's causing delays?" | "Looking at the chart, the red bar shows traffic is the highest..." |

### **After Deployment:**
| Query | Response |
|-------|----------|
| "What's causing delays?" | "Traffic caused 312 delays, the highest category. Mechanical issues were second at 148 delays." |

**Success = NO visual metaphors, leads with numbers, includes units!** ✅

---

## 🎬 Next Steps After Successful Deployment

1. ✅ Test all 5 scenarios above
2. ✅ Record a demo video showing voice interaction
3. ✅ Test with a blind user (if available) or simulate with VoiceOver/JAWS
4. ✅ Document findings for hackathon submission
5. ✅ Apply Tableau dashboard changes (see `QUICK_START_DESIGN.md`)

---

## 📁 File Reference

All configuration files are in your project root:

- `agent-config-original.yaml` - Backup (original)
- **`agent-config-optimized.yaml`** - ✅ Deploy this one
- `AGENT_CONFIG_ANALYSIS.md` - Detailed change rationale
- `DEPLOYMENT_INSTRUCTIONS.md` - This file

---

## 🆘 Need Help?

**Slack Channels:**
- `#a4g-hackathon-support` - General hackathon questions
- `#agentforce-builders` - Agentforce configuration help

**Internal Resources:**
- Agentforce Builder Docs: Salesforce internal wiki
- BHP Guide: `bhp_guide.txt` (already in your project)

---

**Ready to deploy? Copy `agent-config-optimized.yaml` into Agentforce Builder and test!** 🚀♿
