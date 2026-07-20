# VizVoice Agent Configuration Guide

## Overview

The VizVoice Agentforce agent configuration lives in Salesforce as JSON metadata. To optimize it for voice-first accessibility, we'll work together to:

1. **Extract** the current agent configuration from the org
2. **Optimize** system prompt for accessibility (no visual metaphors)
3. **Tune** action parameters and subagent routing
4. **Test** changes incrementally
5. **Deploy** back to the org

---

## How to Provide Your Agent Config

### Option 1: Export via Agentforce Builder UI

1. Open Agentforce Builder in your org:
   ```
   https://orgfarm-aac260ab62-dev-ed.my.salesforce.com
   ```

2. Navigate to **VizVoice** project

3. Click **Settings** or **Advanced** → **View JSON**

4. Copy the entire JSON configuration

5. Paste it here in the chat or save to a file:
   ```bash
   # Save to local file
   pbpaste > /tmp/vizvoice-agent-config.json
   ```

---

### Option 2: Export via Salesforce CLI

```bash
# Query for the BotDefinition
sf data query \
  --query "SELECT Id, DeveloperName, Description, BotType FROM BotDefinition WHERE DeveloperName = 'VizVoice'" \
  --target-org vizvoice-dev \
  --use-tooling-api

# Get the full agent metadata (requires API access)
sf project retrieve start \
  --metadata Bot:VizVoice \
  --target-org vizvoice-dev

# Find the exported file
cat force-app/main/default/bots/VizVoice.bot-meta.xml
```

---

### Option 3: Manual Copy-Paste

Just paste the JSON structure here. It typically looks like:

```json
{
  "label": "VizVoice",
  "description": "Voice-first accessibility agent for Tableau Next dashboards",
  "type": "einstein_gpt",
  "mlDomain": "einsteinGPT",
  "systemPrompt": {
    "staticSystemPrompt": "You are VizVoice, a voice assistant..."
  },
  "planningConfig": {
    "orchestrationType": "agent_orchestrator"
  },
  "subAgents": [
    {
      "name": "Semantic Data Analysis",
      "actions": [...]
    }
  ]
}
```

---

## What We'll Optimize Together

### 1. **System Prompt (Accessibility Language)**

**Current Issues to Fix:**
- May contain visual metaphors ("as you can see", "the chart shows")
- May not specify ordinal language ("the largest segment" vs "the red bar")
- May not lead with numbers ("Traffic caused 312 delays" vs "Delays are shown")

**We'll Add:**
```
ACCESSIBILITY RULES FOR VOICE OUTPUT:

1. NEVER use visual metaphors:
   ❌ "as you can see", "the chart shows", "on the left"
   ✅ "the data indicates", "the largest segment", "the first metric"

2. USE ordinal/positional language:
   ❌ "the red bar"
   ✅ "the leading metric" or "the second-largest value"

3. LEAD WITH the most important number:
   ❌ "Traffic delays are shown in the chart, they're the highest"
   ✅ "Traffic caused 312 delays, the highest of all categories"

4. STATE BOTH values in comparisons:
   ❌ "This week is higher than last week"
   ✅ "This week: 149 trips, last week: 137 trips, an increase of 8.8%"

5. KEEP responses concise (under 3 sentences for simple queries)
   - Offer "Would you like more detail?" for complex topics

6. IF UNCERTAIN about a value, say so explicitly:
   "Based on the data I can access, X appears to be Y. Please verify this is correct."
```

---

### 2. **Action Input Defaults**

**AnalyzeSemanticData Inputs:**
```json
{
  "targetEntityType": "sdm",  // Default to semantic data model
  "conversationContext": {
    "messages": [],
    "maxHistoryLength": 10  // Keep last 10 exchanges
  }
}
```

**CreateUpdateVisualization Inputs:**
```json
{
  "targetEntityState": "",  // Will be populated from dashboard context
  "analyticsTabId": ""      // Will be populated from embedding API
}
```

---

### 3. **Subagent Routing Logic**

**Topic Selector Rules:**

```yaml
# Route voice queries correctly
"Tell me about delays" → Semantic Data Analysis
"Filter to Q3 only" → Visualization Management
"Show me the golden retriever segment" → Semantic Data Analysis
"What's the trend for Blue Line?" → Semantic Data Analysis
"Drill down into November" → Visualization Management Commands
```

**Optimization:**
- Prioritize Semantic Data Analysis (most common voice queries)
- Only route to Visualization Management when user explicitly says "filter", "show", "hide", "drill"

---

### 4. **Conversation Memory Settings**

```json
{
  "conversationMemory": {
    "enabled": true,
    "maxTurns": 10,  // Remember last 10 exchanges
    "summarizationThreshold": 5  // Summarize after 5 turns
  }
}
```

**Why?**
- Voice conversations tend to be multi-turn ("Tell me more about that")
- Agent needs context from previous questions
- Summarization keeps context manageable

---

### 5. **Tone and Voice Settings**

```json
{
  "tone": "professional_friendly",
  "verbosity": "concise",
  "responseStyle": {
    "maxSentences": 3,  // Keep voice responses short
    "includeUnits": true,  // "312 trips" not just "312"
    "avoidJargon": true,
    "explainAcronyms": true  // First use: "Key Performance Indicator (KPI)"
  }
}
```

---

### 6. **Error Handling**

```json
{
  "errorMessages": {
    "noDataAccess": "I don't have access to that data. Please check the dashboard filters or permissions.",
    "ambiguousQuery": "I need more context. Could you specify which metric or time period you're asking about?",
    "dashboardNotLoaded": "The dashboard isn't fully loaded yet. Please wait a moment and try again.",
    "permissionDenied": "I don't have permission to access that data. Please contact your administrator."
  }
}
```

**Voice-Friendly Error Messages:**
- Clear explanation of the problem
- Actionable next step
- No technical jargon

---

## Workflow: Config Optimization Session

### Step 1: You Provide Config

Paste your agent JSON configuration in the chat:

```
Here's my VizVoice agent config:

{
  "label": "VizVoice",
  ...
}
```

---

### Step 2: I'll Analyze & Propose Changes

I'll review:
- ✅ System prompt for visual metaphors
- ✅ Action parameter defaults
- ✅ Subagent routing logic
- ✅ Conversation memory settings
- ✅ Error message clarity

Then provide:
- 📝 Annotated version with suggested changes highlighted
- 🎯 Priority ranking (critical vs. nice-to-have)
- 🧪 Test scenarios for each change

---

### Step 3: We Iterate Together

You can:
- ✏️ Request modifications to my suggestions
- ❓ Ask questions about why I recommended something
- 🔀 Mix and match changes (take some, skip others)
- 📊 Request specific optimizations ("make responses even shorter")

---

### Step 4: I'll Generate Final Config

Once you approve changes, I'll:
- ✅ Output the complete updated JSON
- ✅ Provide a diff view (before/after)
- ✅ Include deployment instructions

---

### Step 5: You Deploy Back to Org

**Via Agentforce Builder UI:**
1. Copy the updated JSON
2. Agentforce Builder → VizVoice → Settings → Import JSON
3. Save and publish

**Via Salesforce CLI:**
```bash
# Update the bot metadata file
vim force-app/main/default/bots/VizVoice.bot-meta.xml

# Deploy changes
sf project deploy start \
  --metadata Bot:VizVoice \
  --target-org vizvoice-dev
```

---

## Example: Before & After System Prompt

### ❌ BEFORE (Contains Visual Metaphors)

```
You are VizVoice, an intelligent assistant for Tableau dashboards.
Help users understand their data by analyzing charts and visualizations.

When users ask about data, look at the chart and describe what you see.
Point out trends, outliers, and patterns visible in the visualization.

Example responses:
- "As you can see in the chart, the red line shows higher values."
- "Looking at the graph, the trend is upward."
- "The bar on the left indicates the highest value."
```

---

### ✅ AFTER (Accessibility-First)

```
You are VizVoice, a voice assistant for exploring Tableau Next dashboards.
You help blind and low-vision users access dashboard data through natural
conversation, providing clear, descriptive answers without visual references.

ACCESSIBILITY RULES:
1. NEVER use visual metaphors ("as you can see", "the chart shows", "on the left")
2. USE ordinal language ("the largest segment", "the second metric")
3. LEAD WITH numbers ("Traffic caused 312 delays, the highest category")
4. STATE BOTH values in comparisons ("This week: 149, last week: 137, up 8.8%")
5. KEEP responses under 3 sentences; offer "Would you like more detail?"

RESPONSE STRUCTURE:
- Lead with the most important number or finding
- Provide context (what it represents)
- Include units ("312 trips", not "312")
- For comparisons, state both values with percentage change
- If uncertain, say so explicitly

Example responses:
- "Traffic caused 312 delays, the leading cause. Mechanical issues were second at 148."
- "Blue Line ridership is 2.1 million, down 5% from last month's 2.2 million."
- "The largest segment represents Golden Retrievers at 34% of total adoptions."
```

**Key Changes:**
- Removed all visual metaphors
- Added explicit accessibility rules
- Defined response structure (lead with numbers)
- Provided voice-optimized examples

---

## Testing Your Updated Config

### Test Scenario 1: Simple Data Question

**User:** "What's the leading cause of delays?"

**Expected Response:**
```
Traffic caused 312 delays, the highest of all categories.
Mechanical issues were second at 148 delays.
```

**Check for:**
- ✅ Leads with the number (312)
- ✅ Uses ordinal language ("highest", "second")
- ✅ No visual metaphors
- ✅ Includes units ("delays")

---

### Test Scenario 2: Comparison Question

**User:** "How does this month compare to last month?"

**Expected Response:**
```
This month had 487 cancelled trips, compared to last month's 523,
a decrease of 6.9%.
```

**Check for:**
- ✅ States both values (487 and 523)
- ✅ Includes percentage change (6.9%)
- ✅ Clear comparison structure

---

### Test Scenario 3: Ambiguous Question

**User:** "Tell me about the performance."

**Expected Response:**
```
I need more context. Are you asking about ridership performance,
delay rates, or on-time performance? Please specify which metric
you'd like to know about.
```

**Check for:**
- ✅ Admits ambiguity
- ✅ Offers specific alternatives
- ✅ Actionable next step

---

## Ready When You Are!

Paste your VizVoice agent configuration here, and I'll:
1. 🔍 Analyze it for accessibility issues
2. ✏️ Propose specific improvements
3. 🎯 Prioritize changes (must-have vs. nice-to-have)
4. 🧪 Provide test scenarios
5. ✅ Generate the final updated JSON for you to deploy

Just say **"Here's my agent config:"** and paste the JSON! 🚀
