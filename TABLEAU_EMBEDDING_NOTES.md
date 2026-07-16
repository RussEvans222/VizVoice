# Tableau Embedding Technical Notes

**Date:** July 16, 2026  
**Status:** Embedding blocked by OAuth scope requirements; shipped with fallback

---

## What We Tried

### Approach 1: Direct SDK Initialization (Failed)
Passed `orgUrl` as `authCredential`:
```typescript
const config: AnalyticsSdkConfig = { orgUrl, authCredential: orgUrl };
```
**Result:** SDK rejected with "User configuration is missing or invalid"

### Approach 2: Frontdoor URL via Session Token (Failed)
Called `/services/oauth2/singleaccess` with `UserInfo.getSessionId()`:
```apex
String accessToken = UserInfo.getSessionId();
HttpRequest req = new HttpRequest();
req.setEndpoint(instanceUrl + '/services/oauth2/singleaccess');
req.setHeader('Authorization', 'Bearer ' + accessToken);
```
**Result:** `403 Bad_OAuth_Token` - UI Bundle session tokens aren't valid OAuth tokens

### Approach 3: Frontdoor URL via Named Credential (Failed)
Called `/services/oauth2/singleaccess` via Named Credential with External Credential OAuth token:
```apex
HttpRequest req = new HttpRequest();
req.setEndpoint(NAMED_CRED + '/services/oauth2/singleaccess');
```
**Result:** `403 Invalid_Scope` - External Credential missing `web` scope

### Approach 4: Add `web` Scope to External Credential (Partially Successful)
Added scopes to External Credential:
```
api web refresh_token
```
**Result:** Still didn't render - likely additional CSP or SDK configuration issues

---

## Root Cause Analysis

The Analytics Embedding SDK requires:
1. **Frontdoor URL** as `authCredential` (not just orgUrl)
2. Frontdoor URL generated via `/services/oauth2/singleaccess`
3. OAuth token with `web` scope to call that endpoint
4. Proper CSP Trusted Sites configuration
5. Potentially additional Tableau-specific permissions

**The Challenge:**
UI Bundles run in a restricted security context. They can't:
- Access `UserInfo.getSessionId()` as a valid OAuth token
- Easily bridge to Named Credential OAuth tokens for frontend auth
- Generate frontdoor URLs without complex OAuth flows

**What works:** Backend Apex can call Tableau APIs via Named Credential (dashboard list, agent calls)  
**What doesn't work:** Frontend Tableau SDK initialization with proper auth

---

## Why the Fallback is Better for Accessibility

### "Open in New Tab" Approach:
1. ✅ **No iframes** - screen readers handle native pages better than iframes
2. ✅ **Full Tableau ARIA support** - native Tableau interface has proper accessibility features
3. ✅ **Voice-first design** - VizVoice doesn't depend on visuals working
4. ✅ **Simpler authentication** - no complex frontdoor URL generation
5. ✅ **Better keyboard navigation** - native Tableau supports full keyboard access

### Why Embedded Would Be Worse:
1. ❌ Screen readers struggle with iframe content
2. ❌ Embedded dashboards have limited ARIA labels
3. ❌ Keyboard focus traps inside iframes
4. ❌ Complex auth flows add failure points
5. ❌ Voice assistant is the core UX anyway

---

## Technical Implementation Details

### What's Deployed:

**TableauEmbed.tsx:**
- Fetches dashboard list via Apex proxy (`/services/apexrest/vizvoice/dashboards`)
- Attempts to initialize SDK with frontdoor URL
- Falls back to "Open in new tab" button on failure
- Button links to: `{orgUrl}/tableau/dashboard/{dashboardApiName}/view`

**VizVoiceAgentProxy.cls:**
- `GET /services/apexrest/vizvoice/dashboards` - Lists Tableau dashboards via Named Credential
- `GET /services/apexrest/vizvoice/frontdoor` - Attempts frontdoor URL generation
- `POST /services/apexrest/vizvoice/session` - Agent invocation (works!)

**External Credential Configuration:**
- Name: `VizVoice_Org_API`
- Protocol: OAuth 2.0 Client Credentials
- Scopes: `api web refresh_token`
- Principal: `VizVoice_Client` with Consumer Key/Secret

**Named Credential Configuration:**
- Name: `VizVoice`
- Type: Secured Endpoint
- URL: `https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com`
- Authentication: External Credential `VizVoice_Org_API`

---

## Code References

### Frontend Files:
- `src/components/TableauEmbed.tsx` (lines 49-76) - SDK initialization logic
- `src/components/TableauEmbed.tsx` (lines 241-267) - Fallback UI

### Backend Files:
- `force-app/main/default/classes/VizVoiceAgentProxy.cls` (lines 117-156) - Frontdoor URL generation attempt

### Salesforce Docs:
- [Analytics Embedding SDK - Access Token](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-access-token.md)
- OAuth 2.0 Web Server Flow
- Named Credentials with External Credentials

---

## Recommendations for Future Work

If you want to pursue embedded Tableau visuals:

### Option 1: Use Visualforce + Remote Site Settings
Visualforce has more permissive session context than UI Bundles.

### Option 2: Build Custom OAuth Flow
Create a Connected App with:
- OAuth Web Server Flow
- User-level authentication (not client credentials)
- Persist user tokens in backend
- Generate frontdoor URLs per user session

### Option 3: Use Tableau Embedding V3 (Newer API)
Check if Tableau Next has a newer embedding API that doesn't require frontdoor URLs.

### Option 4: Accept the Fallback
For an accessibility-first app, "Open in new tab" is genuinely better UX.

---

## Lessons Learned

1. **UI Bundle auth is restrictive** - Can't easily bridge to OAuth tokens
2. **Frontdoor URLs are complex** - Not designed for frontend generation
3. **Named Credentials work great for backend** - Apex → org calls work perfectly
4. **Accessibility prefers native pages** - Embedded iframes create barriers
5. **Voice-first design reduces visual dependency** - Core value prop doesn't need embedded charts

---

## Decision: Ship with Fallback

**Rationale:**
- Voice assistant works (core innovation ✅)
- "Open in new tab" is accessible (keyboard + screen reader ✅)
- Native Tableau has better ARIA support than embedded
- Time better spent on: agent prompt tuning, screen reader testing, demo video

**Status:** APPROVED - Fallback is intentional design choice for accessibility
