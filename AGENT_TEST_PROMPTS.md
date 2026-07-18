# VizVoice Agent Test Prompts

**Purpose:** Verify accessibility-optimized agent configuration  
**Version:** v4 (Accessibility-First)  
**Use Case:** Voice-first interaction with Tableau Next TransitData dashboard

---

## 🎯 Test Categories

1. **Simple Data Queries** - Basic analytics questions
2. **Comparison Queries** - Month-over-month, year-over-year
3. **Ambiguous Queries** - Vague questions requiring clarification
4. **Off-Topic Queries** - Non-analytics questions
5. **Visual Metaphor Traps** - Prompts designed to trigger visual language
6. **Complex Multi-Part Queries** - Compound questions

---

## ✅ **Category 1: Simple Data Queries**

### **Test 1.1: Leading Cause Query**
**Prompt:**
```
What's the leading cause of delays?
```

**Expected Response:**
```
Traffic caused 312 delays in 2025, the highest category. Mechanical issues 
were second at 148 delays.
```

**Check For:**
- ✅ Leads with number (312)
- ✅ Uses ordinal language ("highest", "second")
- ✅ Includes units ("delays")
- ❌ NO "as you can see", "the chart shows", "the red bar"

---

### **Test 1.2: Specific Line Performance**
**Prompt:**
```
Tell me about Blue Line performance.
```

**Expected Response:**
```
Blue Line had 2.1 million riders this year, with 34 cancelled trips. 
Would you like to know about delays or on-time performance?
```

**Check For:**
- ✅ Leads with ridership number
- ✅ Includes units ("million riders", "trips")
- ✅ Offers follow-up options
- ❌ NO "the blue line on the chart"

---

### **Test 1.3: Total Cancelled Trips**
**Prompt:**
```
How many trips were cancelled in 2025?
```

**Expected Response:**
```
487 trips were cancelled in 2025 across all lines.
```

**Check For:**
- ✅ Direct answer with number first
- ✅ Includes units ("trips")
- ✅ Provides context ("across all lines")
- ❌ NO visual references

---

### **Test 1.4: Highest Ridership Line**
**Prompt:**
```
Which line has the most riders?
```

**Expected Response:**
```
Green Line has the highest ridership at 2.7 million riders, followed by 
Blue Line at 2.1 million.
```

**Check For:**
- ✅ Uses ordinal language ("highest", "followed by")
- ✅ States both top values
- ✅ Includes units
- ❌ NO "the green line at the top"

---

## 📊 **Category 2: Comparison Queries**

### **Test 2.1: Month-Over-Month Comparison**
**Prompt:**
```
How does November compare to October for cancelled trips?
```

**Expected Response:**
```
November had 45 cancelled trips, compared to October's 38 trips, 
an increase of 18%.
```

**Check For:**
- ✅ States BOTH values (45 and 38)
- ✅ Includes percentage change (18%)
- ✅ Includes units ("trips")
- ✅ Clear comparison structure
- ❌ NO "higher than"/"lower than" without values

---

### **Test 2.2: Year-Over-Year Trend**
**Prompt:**
```
Are delays increasing or decreasing this year?
```

**Expected Response:**
```
Delays increased from 280 in January to 320 in December, a 14% rise 
over the year.
```

**Check For:**
- ✅ States start and end values
- ✅ Includes percentage change
- ✅ Provides timeframe context
- ❌ NO "the trend line shows"

---

### **Test 2.3: Route Comparison**
**Prompt:**
```
Compare Blue Line and Green Line cancellations.
```

**Expected Response:**
```
Blue Line had 34 cancelled trips, compared to Green Line's 28 trips. 
Blue Line had 21% more cancellations.
```

**Check For:**
- ✅ States both values
- ✅ Includes percentage difference
- ✅ Clear comparison
- ❌ NO "as shown in the chart"

---

## ❓ **Category 3: Ambiguous Queries**

### **Test 3.1: Vague "Performance" Query**
**Prompt:**
```
Tell me about performance.
```

**Expected Response:**
```
I can help with that! Are you asking about ridership numbers, delay rates, 
or on-time performance?
```

**Check For:**
- ✅ Asks for clarification
- ✅ Offers 2-3 specific options
- ✅ Conversational tone
- ❌ NO generic "I need more information"

---

### **Test 3.2: Ambiguous "Best" Query**
**Prompt:**
```
Which line is performing best?
```

**Expected Response:**
```
Are you asking about which line has the highest ridership, fewest delays, 
or best on-time performance?
```

**Check For:**
- ✅ Clarifies multiple interpretations
- ✅ Specific metric options
- ✅ Question format
- ❌ NO assumptions about "best"

---

### **Test 3.3: Vague Time Period**
**Prompt:**
```
Show me the delays.
```

**Expected Response:**
```
Would you like to know about delays by cause, by month, or by line?
```

**Check For:**
- ✅ Clarifies dimension of interest
- ✅ Offers concrete options
- ❌ NO "I'll show you the chart"

---

## 🚫 **Category 4: Off-Topic Queries**

### **Test 4.1: Weather Question**
**Prompt:**
```
What's the weather today?
```

**Expected Response:**
```
I'm specialized in answering questions about your dashboard data. 
What would you like to know about the transit analytics?
```

**Check For:**
- ✅ Politely declines
- ✅ Redirects to analytics
- ✅ Brief (1-2 sentences)
- ❌ NO attempts to answer weather

---

### **Test 4.2: General Knowledge**
**Prompt:**
```
Who invented the subway?
```

**Expected Response:**
```
I can help with questions about this dashboard's transit data. 
Would you like to know about ridership, delays, or line performance?
```

**Check For:**
- ✅ Declines general knowledge
- ✅ Offers analytics alternatives
- ❌ NO historical facts

---

### **Test 4.3: Greeting**
**Prompt:**
```
Hello!
```

**Expected Response:**
```
Hello! How can I help with your dashboard data today?
```

**Check For:**
- ✅ Acknowledges greeting
- ✅ Redirects to analytics
- ✅ Friendly tone
- ✅ Short response

---

## 🎨 **Category 5: Visual Metaphor Traps**

**These prompts are DESIGNED to trigger visual language. The agent should resist!**

### **Test 5.1: "What Do You See" Trap**
**Prompt:**
```
What do you see in the dashboard?
```

**Expected Response:**
```
The dashboard shows transit data for 2025 across five lines. 
Traffic caused 312 delays, the highest category. Ridership totaled 
9.2 million across all lines.
```

**Check For:**
- ✅ Avoids "I see..."
- ✅ Describes data content, not visuals
- ✅ Leads with key metrics
- ❌ NO "I see a chart", "the visualization displays"

---

### **Test 5.2: "Show Me" Trap**
**Prompt:**
```
Show me the trends for Blue Line.
```

**Expected Response:**
```
Blue Line ridership started at 160,000 in January and reached 
190,000 in December, a 19% increase over the year.
```

**Check For:**
- ✅ Describes trend with numbers
- ✅ No visual references
- ✅ Clear start/end values
- ❌ NO "the line shows", "the graph displays"

---

### **Test 5.3: "Chart" Reference Trap**
**Prompt:**
```
What does the chart tell us about delays?
```

**Expected Response:**
```
Traffic caused 312 delays, the highest category. Mechanical issues 
were second at 148 delays. These two causes account for 68% of 
all delays.
```

**Check For:**
- ✅ Avoids "the chart tells us"
- ✅ States data directly ("Traffic caused...")
- ✅ Includes percentage context
- ❌ NO chart references

---

### **Test 5.4: "Color" Reference Trap**
**Prompt:**
```
What's the red line showing?
```

**Expected Response:**
```
Red Line had 1.8 million riders this year with 42 cancelled trips.
```

OR (if user meant delay cause line):
```
Are you asking about the Red Line route, or would you like to know 
about a specific delay cause?
```

**Check For:**
- ✅ Interprets "red line" as route name (not color)
- ✅ Clarifies if ambiguous
- ❌ NO "the red colored line on the chart"

---

### **Test 5.5: "On The Left" Spatial Trap**
**Prompt:**
```
What's on the left side of the dashboard?
```

**Expected Response:**
```
I can describe the dashboard's data instead. Would you like to know 
about delay causes, ridership by line, or monthly trends?
```

**Check For:**
- ✅ Redirects from spatial language
- ✅ Offers data-based alternatives
- ❌ NO attempts to describe layout

---

## 🔗 **Category 6: Complex Multi-Part Queries**

### **Test 6.1: Two-Part Question**
**Prompt:**
```
What caused the most delays and which line had the most cancellations?
```

**Expected Response:**
```
Traffic caused 312 delays, the highest category. Route 28 had the most 
cancellations at 47 trips.
```

**Check For:**
- ✅ Answers both parts
- ✅ Leads each answer with number
- ✅ Clear separation between parts
- ✅ Concise (under 3 sentences)

---

### **Test 6.2: Comparison + Trend**
**Prompt:**
```
How do Blue Line and Green Line compare, and are they improving?
```

**Expected Response:**
```
Green Line has higher ridership at 2.7 million versus Blue Line's 2.1 million. 
Both improved this year: Green Line up 12%, Blue Line up 19%.
```

**Check For:**
- ✅ States comparison first
- ✅ Includes trend data
- ✅ Both values with percentages
- ✅ Under 3 sentences

---

### **Test 6.3: Drill-Down Follow-Up**
**Prompt:**
```
Tell me more about traffic delays.
```

**Expected Response:**
```
Traffic caused 312 delays across all lines. Route 28 had the most 
traffic delays at 82 incidents, followed by Green Line at 67.
```

**Check For:**
- ✅ Provides breakdown
- ✅ Uses ordinal language
- ✅ Includes specific numbers
- ❌ NO "as shown in the breakdown"

---

## 🧪 **Special Test Cases**

### **Test 7.1: Missing/Incomplete Data**
**Prompt:**
```
What's the on-time percentage for Route 12?
```

**Expected Response (if data unavailable):**
```
Based on the data I can access, on-time performance for Route 12 
doesn't appear to be available. Please verify this metric is included 
in the dashboard.
```

**Check For:**
- ✅ Admits limitation explicitly
- ✅ Suggests verification
- ✅ No made-up data
- ❌ NO assumptions or guesses

---

### **Test 7.2: Dashboard Not Loaded**
**Prompt:**
```
What's the total ridership?
```

**Expected Response (if dashboard not ready):**
```
The dashboard isn't fully loaded yet. Please wait a moment and 
try again.
```

**Check For:**
- ✅ Clear error message
- ✅ Actionable next step
- ✅ Brief explanation
- ❌ NO technical jargon

---

### **Test 7.3: Voice Greeting (First Interaction)**
**Prompt:**
```
[User opens VizVoice]
```

**Expected Response (Auto-greeting):**
```
Hello! I'm VizVoice, your voice assistant for exploring dashboard analytics.
I'll help you understand the data through conversation - no need to see the charts.
Ask me questions like "What's the leading cause of delays?" or "Tell me about Blue Line performance."
```

**Check For:**
- ✅ Spoken automatically on load
- ✅ No visual metaphors
- ✅ Provides example queries
- ✅ Sets accessibility expectation

---

## 📋 Test Execution Checklist

When testing each prompt, verify:

- [ ] **Response starts with number/finding** (not preamble)
- [ ] **No visual metaphors used** ("see", "chart", "on the left")
- [ ] **Ordinal language present** ("highest", "second-largest")
- [ ] **Units included in all numbers** ("312 trips", not "312")
- [ ] **Comparisons state both values** + percentage
- [ ] **Response is concise** (under 3 sentences for simple queries)
- [ ] **Offers follow-up** for complex topics
- [ ] **Admits uncertainty** when data unavailable

---

## 🎯 Success Criteria

**Agent PASSES if:**
- ✅ 90%+ of responses avoid ALL visual metaphors
- ✅ 100% of responses lead with numbers/findings
- ✅ 100% of responses include units
- ✅ 90%+ of comparisons state both values + percentage
- ✅ All ambiguous queries get clarification (not assumptions)
- ✅ All off-topic queries get polite redirects

**Agent FAILS if:**
- ❌ Any response uses "as you can see", "the chart shows", "on the left"
- ❌ Any response makes up data or guesses
- ❌ Comparisons say "higher/lower" without stating values
- ❌ Responses are overly verbose (5+ sentences for simple queries)

---

## 🔄 Testing Workflow

1. **Deploy** `agent-config-optimized.yaml` to Agentforce Builder
2. **Load** VizVoice in React app with TransitData dashboard
3. **Test** each prompt category in order
4. **Document** any failures (note exact prompt + response)
5. **Iterate** if needed (adjust system prompt)
6. **Record** passing examples for demo video

---

## 📊 Test Results Template

```markdown
## Test Results - VizVoice v4

**Date:** [Date]
**Tester:** [Name]
**Dashboard:** TransitData (2025 data)

### Category 1: Simple Data Queries
- Test 1.1: ✅ PASS / ❌ FAIL - [Notes]
- Test 1.2: ✅ PASS / ❌ FAIL - [Notes]
- Test 1.3: ✅ PASS / ❌ FAIL - [Notes]
- Test 1.4: ✅ PASS / ❌ FAIL - [Notes]

### Category 2: Comparison Queries
- Test 2.1: ✅ PASS / ❌ FAIL - [Notes]
- Test 2.2: ✅ PASS / ❌ FAIL - [Notes]
- Test 2.3: ✅ PASS / ❌ FAIL - [Notes]

[Continue for all categories...]

### Overall Score: X/27 tests passed (XX%)

### Critical Issues Found:
1. [Issue description]
2. [Issue description]

### Recommendations:
1. [Recommendation]
2. [Recommendation]
```

---

## 🚀 Quick Test (5 Minutes)

If you only have 5 minutes, test these **critical prompts**:

1. **Test 1.1** - "What's the leading cause of delays?" (Simple query)
2. **Test 2.1** - "How does November compare to October?" (Comparison)
3. **Test 5.1** - "What do you see in the dashboard?" (Visual metaphor trap)
4. **Test 3.1** - "Tell me about performance." (Ambiguous query)
5. **Test 4.1** - "What's the weather today?" (Off-topic)

**If all 5 pass → Agent is ready for demo!** 🎉

---

**Ready to test? Copy these prompts and paste them into VizVoice!** 🎤
