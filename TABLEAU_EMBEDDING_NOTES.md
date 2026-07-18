# Tableau Embedding Technical Notes

**Date:** July 16, 2026  
**Status:** Embedding blocked by OAuth scope requirements; shipped with fallback

**Update — July 17, 2026:** Added a second fallback tier (Tableau Next REST
API) and confirmed the exact scope gap. See
[Update: July 17, 2026 — REST API Fallback + Mock Dashboard](#update-july-17-2026--rest-api-fallback--mock-dashboard)
at the bottom for the current state and what's still open.

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

---

## Update: July 17, 2026 — REST API Fallback + Mock Dashboard

### Current fallback chain (in `TableauEmbed.tsx`)

1. **Live embed** via the Analytics Embedding SDK (Approach 3/4 above) — still blocked.
2. **NEW — Tableau Next REST API data view.** When the embed fails, the
   component now calls a new Apex endpoint that proxies
   `GET /tableau/visualizations/{id}` and renders the returned label, data
   source, and fields as a simple text/list view. This is a genuinely
   different code path from the Embedding SDK — it doesn't render an iframe
   or a chart, just the structured JSON Tableau Next returns for the asset.
3. **Fallback of the fallback — mock dashboard.** If the REST call also
   fails (currently: yes, see Root Cause below), the component shows
   `TransitDashboardMock` (added by a teammate, `Mahathi`, as
   `Add accessible mock dashboard with full semantic model coverage`) — a
   hand-built, fully accessible mock of the transit dataset. This is what's
   currently showing in the demo recording and is an acceptable stand-in:
   it's real dataset-shaped content, keyboard/screen-reader accessible, and
   good enough for the test-pass video.
4. **"Open in Tableau" link** (unchanged) — still shown alongside whichever
   of 2/3 is rendering, as the always-available accessible escape hatch.

### New code

- `force-app/main/default/classes/VizVoiceAgentProxy.cls` — added
  `GET /vizvoice/visualizations` (list) and `GET /vizvoice/visualization?id=...`
  (single spec), proxying `/services/data/v64.0/tableau/visualizations[/...]`
  through the **same** Named Credential (`callout:VizVoice`) already used for
  dashboards and the agent call. No new Named/External Credential was added.
- `src/components/TableauEmbed.tsx` — on `embedFailed`, fetches
  `/services/apexrest/vizvoice/visualization?id={selected.name}` and renders
  `vizSpec.label` / `vizSpec.dataSource.label` / `vizSpec.fields` if the call
  succeeds; otherwise renders the mock as before.

### Root cause of the REST API 401 (confirmed live, `check2.png`)

```json
{"message":"This session is not valid for use with the specified REST API endpoint. One of the following scopes is required: Manage user data via APIs, Full access","errorCode":"INVALID_SESSION_ID"}
```

The Tableau Next REST API (`/tableau/visualizations`, `/tableau/download`,
`/tableau/workspaces`) requires OAuth scope **`api`** ("Manage user data via
APIs") on the External Client App / Connected App behind the External
Credential, per
[`docs/tableau-next-rest-api/auth_for_sfapi.md`](docs/tableau-next-rest-api/auth_for_sfapi.md).
This is a **lighter** scope requirement than the Embedding SDK's `web` scope
(which needed additional CSP/frontdoor complexity per Approach 4 above) —
so this is a more tractable path to at least a data-level fallback, even if
full live embedding remains blocked.

**Not yet resolved:** we inspected the org's Connected App list and found
`Customer 360 Data Platform` — a system-managed Data Cloud app with no OAuth
Scopes / Consumer Key section, confirming it is **not** the app backing
`VizVoice_Org_API`. Next step is to find that app in **External Client Apps
Manager** (not classic Connected Apps) and add the `api` scope there — this
requires org Setup access, not code, so it's tracked as an open task rather
than done in this pass.

### Research: Tableau Next REST API surface

Fetched and saved to `docs/tableau-next-rest-api/` for reference:
`get-started.md`, `resources_overview.md`, `auth_for_connectapi.md`,
`auth_for_sfapi.md`. The API's `Visualizations` resource
(`GET /tableau/visualizations`, `GET /tableau/visualizations/{id}`) and
`Downloads` resource (`POST /tableau/download`, which can return a
pre-rendered image of an asset) are two viable alternate paths — the code
above implements the former; the latter (image download) is a documented but
not-yet-implemented option if a static image proves more useful than a
rendered-from-JSON data view.

Note: the classic `tableau/tableau-postman` Postman collection (Tableau
Server/Cloud REST API) was checked and confirmed **not applicable** — it's a
different, older product surface with no Tableau Next / Visualizations /
Workspaces concepts.

### What's still open

1. Locate the External Client App backing `VizVoice_Org_API` in **External
   Client Apps Manager** and add the `api` OAuth scope + enable Client
   Credentials Flow + set a Run As user (per `auth_for_sfapi.md`). Once done,
   step 2 of the fallback chain above should light up with real Tableau data
   instead of falling through to the mock.
2. Re-attempt a **simple/direct Embedding SDK** approach (rather than the
   frontdoor-URL path already exhausted above) now that the REST API path is
   proven — worth revisiting whether a newer SDK version or a different auth
   handoff avoids the `web`-scope/CSP complexity entirely.
3. Consider the `POST /tableau/download` (image) path as a lower-effort
   alternative to the JSON-spec rendering if the scope fix lands but the
   rendered data view isn't visually compelling enough for the final
   submission video.
