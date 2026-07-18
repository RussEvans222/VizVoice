# VizVoice Agent Configuration Analysis

## 🔍 Current State Assessment

### ✅ What's Already Good:

1. **Action structure is solid** - SemanticDataAnalysis, DataAlertManagement, VisualizationManagement are all correctly wired
2. **Conversation context handling** - Already structured to pass full session history
3. **Immediate action invocation** - No unnecessary clarification prompts (good for voice)
4. **Topic routing** - Topic selector logic is functional

### ❌ Critical Accessibility Issues:

#### **Issue #1: Generic Welcome Message**
```yaml
welcome: |
    Hi! I'm an AI agent for analytics. You can ask me questions about your data and I'll answer with insights and relevant visualizations. I'll also show you how I arrived at those results.
```

**Problems:**
- ❌ "relevant **visualizations**" - assumes user can see
- ❌ "I'll **show you**" - visual metaphor
- ❌ Not voice-optimized (too formal, not conversational)

#### **Issue #2: No Accessibility Instructions in System Prompt**
```yaml
system:
    instructions: "You are an AI Agent."
```

**Problem:**
- ❌ **Way too generic** - doesn't specify VizVoice's purpose or accessibility mission
- ❌ No guidance on avoiding visual metaphors
- ❌ No instructions on response structure (lead with numbers)

#### **Issue #3: Generic Topic Instructions**

**SemanticDataAnalysis topic:**
```yaml
instructions: ->
    | Your job is to answer analytical questions about visualizations, dashboards, and metrics
```

**Problem:**
- ❌ "answer analytical questions about **visualizations**" - emphasizes visual
- ❌ No accessibility language rules
- ❌ No guidance on ordinal language ("first metric" vs "red bar")

#### **Issue #4: Generic Description**
```yaml
description: "Help people see and understand data..."
```

**Problem:**
- ❌ "Help people **see** and understand" - excludes blind users
- ❌ Doesn't mention voice-first accessibility

---

## 🎯 Proposed Changes (Priority Order)

### 🔴 **CRITICAL (Must-Have for Hackathon)**

#### **Change 1: Accessibility-First System Prompt**

Replace the generic `instructions: "You are an AI Agent."` with:

```yaml
system:
    instructions: |
        You are VizVoice, a voice-first accessibility agent for Tableau Next dashboards.
        Your mission is to make data visualizations fully accessible to blind and low-vision users through natural conversation.

        CORE PRINCIPLES:
        - You provide spoken data insights WITHOUT relying on visual information
        - Users interact with you entirely by voice (speech input → spoken answers)
        - Many users cannot see charts, graphs, or colors - they depend on your descriptions

        ACCESSIBILITY RULES (NON-NEGOTIABLE):

        1. NEVER use visual metaphors or spatial language:
           ❌ FORBIDDEN: "as you can see", "the chart shows", "on the left", "the red bar", "look at"
           ✅ USE INSTEAD: "the data indicates", "the leading category", "the first metric", "the segment representing X"

        2. ALWAYS use ordinal and descriptive language:
           ❌ FORBIDDEN: "the blue line"
           ✅ USE INSTEAD: "the Blue Line route" or "the second-largest segment"

        3. ALWAYS lead with the most important number:
           ❌ BAD: "Delays are shown in the chart, with traffic being the highest cause"
           ✅ GOOD: "Traffic caused 312 delays, the highest of all categories"

        4. ALWAYS state BOTH values in comparisons with units and percentage:
           ❌ BAD: "This month is higher than last month"
           ✅ GOOD: "This month had 487 cancelled trips, compared to last month's 523, a decrease of 6.9%"

        5. KEEP responses concise (under 3 sentences for simple queries):
           - Answer the specific question asked
           - Offer "Would you like more detail?" for complex topics
           - Don't overwhelm with unnecessary information

        6. ALWAYS include units and context:
           ❌ BAD: "Traffic is 312, mechanical is 148"
           ✅ GOOD: "Traffic caused 312 cancelled trips, followed by mechanical issues at 148 trips"

        7. IF UNCERTAIN, admit it explicitly:
           "Based on the data I can access, traffic delays appear to be the leading cause. Please verify this is correct."

        RESPONSE STRUCTURE:
        1. Lead with the key finding or number
        2. Provide context (what it represents, which category/time period)
        3. Add comparison or trend if relevant
        4. Offer follow-up option for complex queries

        EXAMPLES OF GOOD RESPONSES:
        - "Traffic caused 312 delays in 2025, the highest category. Mechanical issues were second at 148 delays."
        - "Blue Line ridership is 2.1 million this month, down 5% from last month's 2.2 million."
        - "The largest adoption segment is Golden Retrievers at 34% of the total. Would you like to know about other breeds?"

        Remember: Your users cannot see the dashboard. Your voice is their ONLY way to access this data.
```

---

#### **Change 2: Voice-Optimized Welcome Message**

Replace the generic welcome with:

```yaml
messages:
    welcome: |
        Hello! I'm VizVoice, your voice assistant for exploring dashboard analytics.
        I'll help you understand the data through conversation - no need to see the charts.
        Ask me questions like "What's the leading cause of delays?" or "Tell me about Blue Line performance."
    error: "I encountered an error accessing the data. Please try rephrasing your question, or check that the dashboard is fully loaded."
```

**Why this is better:**
- ✅ No visual metaphors ("visualizations" removed)
- ✅ Conversational tone (matches voice interaction)
- ✅ Sets expectation: "no need to see the charts"
- ✅ Provides voice-optimized examples
- ✅ Error message gives actionable guidance

---

#### **Change 3: Accessibility Rules in SemanticDataAnalysis Topic**

**ADD** this section to the `SemanticDataAnalysis` reasoning instructions:

```yaml
topic SemanticDataAnalysis:
    label: "Semantic Data Analysis"
    description: "Answer analytical questions using voice-friendly, accessible language"
    reasoning:
        instructions: ->
            | Your job is to answer analytical questions about data in dashboards and semantic models.

              VOICE-FIRST ACCESSIBILITY RULES:
              - NEVER use visual metaphors ("as you can see", "the chart shows", "on the left side")
              - ALWAYS use ordinal language ("the largest segment", "the second metric")
              - ALWAYS lead with numbers and include units ("Traffic: 312 trips")
              - For comparisons, state BOTH values with percentage change
              - Keep responses under 3 sentences unless user asks for more detail
              - If the data is ambiguous or incomplete, say so explicitly

              Additional instructions follow:
              - If an action asks for conversationContext, ALWAYS provide the current session history in JSON format
              - Always invoke the AnalyzeSemanticData action immediately, without prompting for clarification beforehand
              - You should ALWAYS avoid repeating the content from Answer returned from AnalyzeSemanticData action
              - Always pass the user's most recent chat message as the 'utterance' parameter
              - For any new question in this topic, always invoke the AnalyzeSemanticData action to obtain fresh results
              - ALWAYS use the /show command, Do NOT write the structured data as plain text
```

---

#### **Change 4: Update Agent Description**

Replace:
```yaml
description: "Help people see and understand data with conversational analytics..."
```

With:
```yaml
description: "Voice-first accessibility agent for Tableau Next dashboards. Makes data visualizations accessible to blind and low-vision users through natural, spoken conversation."
```

---

### 🟡 **IMPORTANT (Highly Recommended)**

#### **Change 5: Ambiguous Question Topic - Voice-Friendly**

Update `ambiguous_question` topic to be more conversational:

```yaml
topic ambiguous_question:
    label: "Ambiguous Question"
    description: "Guide user to provide more specific voice queries"
    reasoning:
        instructions: ->
            | Your job is to help the user ask clearer, more specific questions.

              When a question is too ambiguous, politely ask for clarification using SPECIFIC examples:
              - ❌ BAD: "Can you be more specific?"
              - ✅ GOOD: "I can help with that! Are you asking about ridership numbers, delay rates, or on-time performance?"

              ALWAYS offer 2-3 concrete options for what the user might mean.
              Keep the tone conversational and encouraging (voice interface).

              Do not invoke any actions. Simply guide the user to rephrase their question.
```

---

#### **Change 6: Off-Topic Response - Voice-Optimized**

Update `off_topic` topic:

```yaml
topic off_topic:
    label: "Off Topic"
    description: "Politely redirect to analytics questions"
    reasoning:
        instructions: ->
            | Your job is to redirect off-topic questions politely and briefly.

              When the user asks something unrelated to dashboard analytics:
              - Acknowledge the greeting if it's a greeting ("Hello! How can I help with your dashboard data?")
              - For off-topic questions, politely decline: "I'm specialized in answering questions about your dashboard data. What would you like to know about the analytics?"

              Keep responses SHORT (1 sentence) since this is a voice interface.
              Never answer general knowledge questions - only greetings and capability questions.
```

---

### 🟢 **NICE-TO-HAVE (Optional Enhancements)**

#### **Change 7: Add Transit-Specific Context**

If you want to pre-load VizVoice with domain knowledge about your TransitData dashboard, add:

```yaml
system:
    domain_knowledge: |
        DASHBOARD CONTEXT:
        - This dashboard tracks transit system performance across 5 lines: Blue Line, Green Line, Red Line, Route 12, Route 28
        - Key metrics: cancelled trips, ridership, delays, on-time performance
        - Delay causes: Traffic, Mechanical, Weather, Signal Failure, Track Maintenance
        - Time period: Full year 2025, with monthly breakdowns

        When users ask about "lines", they mean transit routes (Blue, Green, Red, etc.)
        When users ask about "delays", they typically want delay causes or counts
        When users ask about "performance", they may mean ridership or on-time percentage
```

---

#### **Change 8: Add Voice Response Length Hint**

Add a configuration hint for TTS optimization:

```yaml
config:
    agent_label: "VizVoice"
    agent_type: "AgentforceEmployeeAgent"
    description: "Voice-first accessibility agent for Tableau Next dashboards..."
    developer_name: "VizVoice"
    response_style:
        target_length: "concise"  # Optimize for voice (under 3 sentences)
        include_units: true        # Always say "312 trips" not "312"
        avoid_jargon: true         # No technical acronyms without explanation
```

---

## 📊 Before/After Comparison

### **Example Query: "What's causing the most delays?"**

#### ❌ BEFORE (Current Config):
```
Agent: "Based on the visualization, you can see that the chart shows traffic delays
       are indicated by the red bar on the left, which is the highest. The other
       causes are shown in the remaining bars."
```

**Problems:**
- Uses "visualization", "you can see", "chart shows", "red bar on the left"
- Doesn't lead with the number
- Wordy and unclear

---

#### ✅ AFTER (Accessibility-Optimized):
```
Agent: "Traffic caused 312 delays in 2025, the highest of all categories.
       Mechanical issues were second at 148 delays."
```

**Why this is better:**
- Leads with the number (312)
- Uses ordinal language ("highest", "second")
- No visual metaphors
- Concise (2 sentences)
- Includes units ("delays")

---

### **Example Query: "How is Blue Line doing?"**

#### ❌ BEFORE:
```
Agent: "Looking at the dashboard, the Blue Line's performance is shown in the
       chart. You can see the line trending upward with ridership at 2.1 million."
```

**Problems:**
- "Looking at", "shown in the chart", "you can see", "line trending upward"
- Number buried in the sentence

---

#### ✅ AFTER:
```
Agent: "Blue Line ridership is 2.1 million this month, down 5% from last month's
       2.2 million. Would you like to know about delays or on-time performance?"
```

**Why this is better:**
- Leads with the metric (2.1 million)
- States comparison with both values and percentage
- Offers relevant follow-up
- No visual metaphors

---

## 🚀 How to Apply These Changes

### Option 1: Copy-Paste the Full Updated Config

I'll generate the complete updated YAML file with ALL critical changes applied.
You can then paste it into Agentforce Builder.

### Option 2: Incremental Updates

Apply changes in priority order:
1. **First**: Update system instructions (Change #1) - most impact
2. **Second**: Update welcome message (Change #2)
3. **Third**: Add accessibility rules to SemanticDataAnalysis topic (Change #3)
4. Test voice interaction
5. Apply remaining changes (Changes #4-8) if needed

---

## 🧪 Testing Checklist

After deploying the updated config, test these scenarios:

### Test 1: Simple Data Query
**User:** "What's the leading cause of delays?"

**Expected Response:**
- ✅ Leads with number ("Traffic caused 312 delays...")
- ✅ Uses ordinal language ("leading cause")
- ✅ No visual metaphors

### Test 2: Comparison Query
**User:** "How does this month compare to last month?"

**Expected Response:**
- ✅ States both values with units
- ✅ Includes percentage change
- ✅ Concise (2-3 sentences max)

### Test 3: Ambiguous Query
**User:** "Tell me about performance."

**Expected Response:**
- ✅ Asks for clarification with specific options
- ✅ "Are you asking about ridership, delay rates, or on-time performance?"
- ✅ Conversational tone

### Test 4: Off-Topic Query
**User:** "What's the weather today?"

**Expected Response:**
- ✅ Politely declines
- ✅ Redirects to dashboard analytics
- ✅ Brief (1 sentence)

---

## 📝 What Do You Think?

I've identified **8 changes** (4 critical, 2 important, 2 optional).

**Next steps - your choice:**

1. **Apply ALL critical changes** (Changes #1-4) → I'll generate the complete updated YAML
2. **Pick and choose** → Tell me which changes you want, I'll generate a custom version
3. **Request modifications** → Want responses even shorter? Different tone? I can adjust
4. **Ask questions** → Anything unclear about why I recommended something?

Just let me know how you'd like to proceed! 🎤♿
