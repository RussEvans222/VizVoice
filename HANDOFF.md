# VizVoice UI Bundle — Current State & Issues

**Date:** 2026-07-16  
**Org:** `https://orgfarm-aac260ab62-dev-ed.my.salesforce.com`  
**User:** `epic.0d666f471e01@orgfarm.salesforce.com`  
**Agent ID:** `0XxgK000001rUH7SAM`

---

## Current Problem

The VizVoice UI Bundle shows a **blank page** with this error in browser console:

```
Uncaught NotSupportedError: Failed to execute 'define' on 'CustomElementRegistry': 
the name "lightning-out-application" has already been used with this registry
```

**Error Location:** `index-7ygYFDGe.js:53` (bundled JavaScript)

---

## What We've Tried (All Failed)

### Attempt 1: Use High-Level Package Component
- **Action:** Import `AgentforceConversationClient` from `@salesforce/ui-bundle-template-feature-react-agentforce-conversation-client`
- **Result:** Same CustomElementRegistry error
- **Why it failed:** Package component still uses `embedAgentforceClient` internally, which tries to register the custom element

### Attempt 2: Create Local Wrapper Component with Singleton Pattern
- **Action:** Copied the wrapper pattern from `sf-skills/samples/ui-bundle-template-app-react-sample-b2e`
- **File:** `src/components/AgentforceConversationClient.tsx`
- **Pattern:** 
  - Global singleton flag (`__agentforceConversationClientSingleton`)
  - Checks for existing `lightning-out-application[data-lo="acc"]` element
  - Only calls `embedAgentforceClient` once per window
- **Result:** Same CustomElementRegistry error
- **Why it failed:** The singleton check happens in the wrapper, but the error occurs INSIDE the `embedAgentforceClient` SDK call before the wrapper's check can prevent the second call

### Attempt 3: Remove React StrictMode
- **Action:** Removed `<StrictMode>` wrapper from `src/app.tsx`
- **Hypothesis:** StrictMode causes components to mount twice in development, triggering double initialization
- **Deployed:** Yes (deploy ID: latest)
- **Status:** PENDING USER TEST

---

## Architecture

### Data Flow

```
VizVoicePage.tsx (main page)
  ├─ TableauEmbed.tsx (left panel)
  │   └─ Fetches dashboards via Apex REST proxy
  │       (Data SDK → /services/apexrest/vizvoice/dashboards → Tableau API via Named Credential)
  │
  └─ AgentforceConversationClient.tsx (right panel)
      └─ embedAgentforceClient() from @salesforce/agentforce-conversation-client
          └─ Tries to register "lightning-out-application" custom element
              └─ FAILS if already registered
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app.tsx` | Entry point - removed StrictMode (latest change) |
| `src/pages/VizVoicePage.tsx` | Main page - 70/30 split (Tableau/Agent) |
| `src/components/AgentforceConversationClient.tsx` | Local wrapper with singleton pattern |
| `src/components/TableauEmbed.tsx` | Tableau dashboard renderer via Analytics Embedding SDK |
| `VizVoiceAgentProxy.cls` | Apex REST proxy for Tableau API (uses Named Credential) |

### Access URL

```
https://orgfarm-aac260ab62-dev-ed--c.develop.my.salesforce.app/c__vizvoice
```

**DO NOT** access via App Launcher - go directly to this URL.

---

## Outstanding Questions

1. **What else is calling `embedAgentforceClient`?**
   - The singleton pattern should prevent double calls, but the error still happens
   - Is something in the Salesforce platform loading Lightning Out before our bundle initializes?

2. **Is the user session correct?**
   - Page shows "Logged in as epic.orgfarm@salesforce.com" (wrong user)
   - User claims they are logged in as the correct user and can't even access that other username
   - Is this just a UI display bug, or is the session actually wrong?

3. **Does removing StrictMode fix it?**
   - Latest deploy has StrictMode removed
   - User has NOT tested yet

---

## What the Agent Should Work (But Currently Doesn't)

When working, the VizVoice agent should:

1. User opens the UI Bundle page
2. Left panel: Tableau Next dashboard loads (currently working - uses Apex proxy)
3. Right panel: Agentforce agent chat widget loads inline
4. User can ask questions by voice about the dashboard data
5. Agent queries Data 360 semantic model via `AnalyzeSemanticData` action
6. Responses are spoken back via AWS Polly TTS

**Current state:** Dashboard panel works. Agent panel fails to load (blank page).

---

## Deployment Commands

```bash
# Build UI Bundle
cd force-app/main/default/uiBundles/vizvoice
npm run build

# Deploy to org
cd /path/to/vizvoice-ui
sf project deploy start --target-org vizvoice-dev --source-dir force-app/main/default/uiBundles/vizvoice
```

---

## Next Steps for New Agent

1. **Verify latest deploy worked:**
   - Check if removing StrictMode fixed the CustomElementRegistry error
   - Have user hard-refresh the page (Cmd+Shift+R) to bypass cache
   - Check browser console for errors

2. **If error persists:**
   - Check if something in the Salesforce platform is pre-loading Lightning Out
   - Inspect Network tab for any requests to Lightning Out endpoints before bundle JS loads
   - Try wrapping the component initialization in a `setTimeout` to delay it until after page load

3. **Debug the user session issue:**
   - Clarify whether the "epic.orgfarm@salesforce.com" login banner is cosmetic or a real session problem
   - Check if SFDC_ENV.orgUrl in browser console matches the correct org

4. **Alternative approach if all else fails:**
   - Use the lower-level `@salesforce/agentforce-conversation-client` SDK directly in a headless pattern (no Lightning Out component)
   - Build a custom chat UI that calls the Agentforce API directly via Data SDK

---

## Reference Files

- **Architecture doc:** `VizVoice_Hackathon_Architecture.docx`
- **BHP Best Practices Guide:** `bhp_guide.txt` (Tableau Next + Agentforce patterns)
- **sf-skills library:** `./sf-skills-latest/` (sample apps with working AgentforceConversationClient)

---

## Prompt for Next Agent

```
The VizVoice UI Bundle shows a blank page with this error:

"Uncaught NotSupportedError: Failed to execute 'define' on 'CustomElementRegistry': 
the name 'lightning-out-application' has already been used with this registry"

I've tried:
1. Using the high-level AgentforceConversationClient package component
2. Creating a local wrapper with singleton pattern (from sf-skills sample)
3. Removing React StrictMode (latest deploy - NOT TESTED YET)

The error happens inside the embedAgentforceClient SDK call, suggesting something else is 
registering the custom element before our component loads.

Please:
1. Verify the latest deploy fixed it (have user hard-refresh page)
2. If not, investigate what's pre-loading Lightning Out
3. Check Network tab for Lightning Out requests before bundle JS loads
4. Consider alternative approaches if the component pattern is fundamentally broken in this org

Reference: See HANDOFF.md for full context.
```
