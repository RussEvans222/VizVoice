# Tableau Embedding Technical Notes

**Date:** July 16, 2026  
**Status:** RESOLVED July 18, 2026 — `/vizvoice/frontdoor` now returns a working frontdoor URL. See
[Update: July 18, 2026 — Frontdoor Generation Fixed](#update-july-18-2026--frontdoor-generation-fixed)
at the bottom for the fix and what it unblocks.

**Update — July 17, 2026:** Added a second fallback tier (Tableau Next REST
API) and confirmed the exact scope gap. See
[Update: July 17, 2026 — REST API Fallback + Mock Dashboard](#update-july-17-2026--rest-api-fallback--mock-dashboard)
below for that interim work (superseded by the July 18 fix, but kept for
history).

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
3. **Fallback of the fallback — plain status message.** If the REST call
   also fails (currently: yes, see Root Cause below), the component shows a
   simple `role="status"` message instead of chart content — no mock data.
   (Removed `Mahathi`'s `TransitDashboardMock` component on 2026-07-17: it
   was a useful stand-in for the test-pass recording, but the team decided
   not to ship placeholder/mock visualization content in the actual app —
   an honest "unavailable" status is preferred over data that looks real but
   isn't.)
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

---

## Update: July 18, 2026 — Frontdoor Generation Fixed

### Root cause, finally confirmed

Approach 3/4 above (Named Credential + `web` scope) kept failing with
`Invalid_Scope` no matter how the External Credential's Scope field or the
External Client App's Selected OAuth Scopes were configured. The real cause
was structural, not a config typo:

**Client Credentials Flow cannot carry the `web` scope, full stop.** `web`
implies a browser/user-session context; Client Credentials Flow is
machine-to-machine with no session concept, so Salesforce rejects `web` for
that grant type regardless of what's selected on the app or External
Credential. This was masked for a while by an unrelated `Invalid_Scope` error
caused by `refresh_token` being present in the External Credential's Scope
field (also invalid for Client Credentials Flow, but a red herring for the
`web`-specific problem — see below).

Debugging path that isolated it: called `/vizvoice/dashboards` (needs only
`api`) and `/vizvoice/frontdoor` (needs `web`) independently via anonymous
Apex against the deployed class. `dashboards` succeeded once `refresh_token`
was removed from the External Credential's Scope field; `frontdoor` kept
failing with `Invalid_Scope` even after `web`/`full` were confirmed present
and selected on both the External Credential and the External Client App —
pointing at the grant type itself, not the scope list.

### The fix

`generateFrontdoorUrl()` in `VizVoiceAgentProxy.cls` no longer calls
`/services/oauth2/singleaccess` through the Named Credential
(`callout:VizVoice`, Client Credentials Flow). It now does its own JWT Bearer
Flow exchange first — the same proven pattern already used by the sibling
`tableau-next-embed-app` project's `TableauEmbedAuthProxy.cls`:

1. Build and sign a JWT (`Auth.JWT` + `Auth.JWS`) asserting as
   `epic.0d666f471e01@orgfarm.salesforce.com`, using the `VizVoice_JWT`
   certificate already configured on the `VizVoice_Agent_API` External Client
   App.
2. POST it directly to `{org}/services/oauth2/token` (bypassing
   `Auth.JWTBearerTokenExchange`, which resolves to a generic HTML login page
   in this org rather than the token endpoint — same issue documented in the
   sibling project).
3. Use the resulting **real user session** access token to call
   `/services/oauth2/singleaccess` — a user session, unlike Client
   Credentials, can carry `web` scope, so this succeeds.

`/dashboards`, `/visualizations`, `/session`, `/message` are untouched and
still go through the Named Credential's Client Credentials Flow — that grant
type is fine for the `api` scope those endpoints need.

### Verified (anonymous Apex against `vizvoice-dev`)

```
/vizvoice/dashboards → STATUS 200, returns the TransitData dashboard
/vizvoice/frontdoor  → STATUS 200, HAS_FRONTDOORURL=true, HAS_ERROR=false
```

### What this unblocks

`TableauEmbed.tsx`'s tier-1 live embed (Analytics Embedding SDK,
Approach 3/4 above) can now be retried — the frontdoor URL it needs is
being generated correctly. Tiers 2–4 (REST API data view, status message,
"Open in Tableau" link) remain in place as fallbacks and don't need to be
removed; whether to keep them as safety nets or simplify back to embed-only
is a product call, not a technical blocker anymore.

The Tableau Next REST API 401 documented in the July 17 update above
(`INVALID_SESSION_ID`, missing `api` scope on the External Client App behind
`VizVoice_Org_API`) is a **separate, still-open issue** — unaffected by this
fix, since `/vizvoice/visualizations` still goes through the Named
Credential's Client Credentials Flow, not the new JWT path.

---

## Update: July 18, 2026 — Live Embed Fully Working (Second Fix: Data Cloud Query Access)

### The last blocker

With the frontdoor fix above in place, the dashboard shell, header, tabs, and
filter dropdown rendered correctly — but every individual visualization tile
failed with "Can't show visualization," and the console showed:

```
AnalyticsError: postCdpQuerySql failed with message:
  at executeSemanticSqlWithFallback / executeSqlQuery (analytics_embedding/dashboard3p)
orgfarm-....my.salesforce.app/services/data/v67.0/ssot/query-sql?...
  Failed to load resource: the server responded with a status of 403 ()
```

Initial hypothesis (from Slack research) was that this matched a known,
unresolved Salesforce-side Semantic Layer bug (W-23265605, malformed date-field
aliasing in generated SQL, 500 error). **That hypothesis was wrong for this
case** — the actual error, captured from the Network tab Response body, was:

```json
[{"message":"This feature is not currently enabled for this user.","errorCode":"FUNCTIONALITY_NOT_ENABLED"}]
```

`FUNCTIONALITY_NOT_ENABLED` on `ssot/query-sql` is a 403 authz/entitlement
rejection, not a 500 SQL-generation error — a completely different failure
mode than W-23265605. This confirmed the problem was on our org's side: the
identity running the live dashboard query (the JWT run-as user,
`epic.orgfarm@salesforce.com`) lacked a Data Cloud query permission, distinct
from the `api`/`web` OAuth scopes already fixed above. Listing dashboards and
Tableau asset metadata go through a lighter API surface than actually
*executing* a live semantic-layer query (`ssot/query-sql`) — so it's
consistent that the shell/metadata calls worked while only live query
execution 403'd.

### The fix

Two Setup-only changes, no code:
1. Assigned the **"VizVoice Access"** permission set (already built for this
   project's Apex/agent access) to the JWT run-as user
   (`epic.orgfarm@salesforce.com`).
2. Added **Data Space access for the `default` dataspace** to that same
   permission set — this is the specific grant that maps to the
   `dataspace=default` param on the failing `ssot/query-sql` call, and was
   the missing piece behind `FUNCTIONALITY_NOT_ENABLED`.

### Verified

Live embed now renders the full `TransitData` dashboard end-to-end for
`epic.orgfarm@salesforce.com`: heatmap (cancelled trips by line/month), delay
cause bar chart, ridership-vs-satisfaction scatter plot, and on-time
percentage bar chart — all backed by real Data Cloud semantic-layer queries,
no fallback tiers needed.

### Takeaway

Two independent blockers had to be cleared for the live embed, and they looked
similar (both surfaced as failures inside the same iframe) but had unrelated
root causes and fixes:
1. **Auth/OAuth scope** (frontdoor generation) — fixed with the JWT Bearer
   Flow rewrite in `generateFrontdoorUrl()`, above.
2. **Data Cloud query entitlement** (query execution) — fixed with a
   permission set assignment in Setup, not code.

Tiers 2–4 of the fallback chain (`TableauEmbed.tsx`) are no longer needed to
ship a working demo, but can stay in place as safety nets — that's a product
call, not a technical requirement.

---

## Update: July 18, 2026 — Recurrence: `/dashboards` broke again (scope drift, not expiration)

### Symptom

The next morning, `/vizvoice/dashboards` started failing with a 500:

```json
[{"errorCode":"APEX_ERROR","message":"System.UnexpectedException: Unable to fetch the OAuth token. Error: invalid_request. Error description: scope parameter not supported.\n\nClass.VizVoiceAgentProxy.listDashboards..."}]
```

Same error shape as the original frontdoor `Invalid_Scope` issue, but now hitting
`listDashboards` (Client Credentials Flow via `callout:VizVoice`), not
`generateFrontdoorUrl` (JWT Bearer Flow) — a different code path than the one
already fixed above.

### Root cause: not an expiration, not an automated job — a manual Setup edit

Confirmed via **Setup Audit Trail** (6-month CSV export). The External
Credential's Scope parameter for `VizVoice_Org_API` was hand-edited three times
in a 4-minute window the prior night while debugging something else:

```
10:15:03 PM — Deleted the Scope parameter for VizVoice_Org_API
10:16:11 PM — Created Scope = "api web full sfap_api"
10:19:37 PM — Updated Scope to "api web full"
```

`web`/`full`/`sfap_api` are not valid for **Client Credentials Flow** — Salesforce
rejects the token request outright with `invalid_request` /
"scope parameter not supported" the next time anything using that Named
Credential runs. This is the same structural rule already documented above
(Client Credentials Flow cannot carry `web`), just tripped again on the *other*
endpoint that shares this Named Credential.

### The fix (again) — and a correction to the first fix

Setting the Scope parameter to `api` (documented above) was **not enough** —
`/dashboards` kept failing with the identical `invalid_request` /
"scope parameter not supported" error even after that field was confirmed
saved. Retrieving the actual org metadata via `sf project retrieve` (not the
Setup UI, which can lag or fail to reflect a save) surfaced the real, complete
picture — **two separate places** define OAuth scope for this app, and both
have to be right:

1. **External Credential (`VizVoice_Org_API`) → Scope AuthParameter.** For
   Client Credentials Flow, this must have **no value at all** — not `api`,
   not anything else. Any explicit `Scope` parameter here causes Salesforce to
   send a `scope=...` value on the token request, and this org's Client
   Credentials Flow token endpoint rejects *any* explicit scope parameter with
   `invalid_request` / "scope parameter not supported" — including `api` by
   itself. Deleting the parameter entirely (not just clearing its value) is
   what fixed `/dashboards`.
2. **External Client App (`VizVoice Agent API`) → `ExtlClntAppOauthSettings`
   → `commaSeparatedOauthScopes`.** This is a *separate* scope list, used by
   the JWT Bearer Flow (`/frontdoor`'s `generateFrontdoorUrl()`), not by
   Client Credentials Flow. It must be `Api, Web, RefreshToken` — `Web` is
   required here (JWT Bearer Flow *can* carry it, unlike Client Credentials
   Flow), and `RefreshToken` is required for the `frontdoor.jsp` exchange to
   succeed. Stripping this down to `Api` only (which looked like the fix,
   since it matched the External Credential's old `api`-only value) broke
   `/frontdoor` with `Invalid_Scope` even though `/dashboards` worked.

Verified via direct calls, bypassing the browser/UI entirely:
```bash
sf project retrieve start -m "ExternalCredential:VizVoice_Org_API" -o vizvoice-dev -r retrieve_tmp
sf project retrieve start -m "ExtlClntAppOauthSettings" -o vizvoice-dev -r retrieve_tmp
sf api request rest /services/apexrest/vizvoice/dashboards -o vizvoice-dev
sf api request rest /services/apexrest/vizvoice/frontdoor -o vizvoice-dev
```

### The actual rule going forward

These are **two independent scope settings for two independent OAuth flows on
the same External Client App** — fixing one by copying the other's value is
what caused this to break twice in one night:

- **`VizVoice_Org_API`'s Scope AuthParameter → leave unset (no parameter at
  all).** Used only by Client Credentials Flow (`/dashboards`,
  `/visualizations`, `/visualization`, anything through `callout:VizVoice`).
- **`VizVoice_Agent_API_oauth`'s `commaSeparatedOauthScopes` → `Api, Web,
  RefreshToken`.** Used only by JWT Bearer Flow (`/frontdoor`).

If either endpoint starts failing with a scope-shaped error again, **retrieve
the actual metadata with `sf project retrieve` and test with `sf api request
rest` before touching Setup UI** — the UI can show a scope list that looks
saved (list-transfer arrows clicked, Save button pressed) while the org's
live metadata still holds the old value, which is what cost hours here. CLI
retrieval is the source of truth; screenshots of the Setup page are not.

---

## Reference: known-good live configuration (verified July 18, 2026, via `sf project retrieve` + `sf api request rest` — not Setup UI screenshots)

This is the full working state, captured directly from org metadata, for every
piece involved in `/dashboards` and `/frontdoor`. If either endpoint breaks
again, retrieve the same metadata types and diff against this.

### 1. External Credential — `VizVoice_Org_API`

```xml
<ExternalCredential>
    <authenticationProtocol>Oauth</authenticationProtocol>
    <!-- Oauth AuthProtocolVariant -->
    <parameterValue>ClientCredentialsClientSecretBasic</parameterValue>
    <!-- AuthProviderUrl -->
    <parameterValue>https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com/services/oauth2/token</parameterValue>
    <!-- NamedPrincipal -->
    <parameterGroup>VizVoice_Client</parameterGroup>
    <!-- NO Scope parameter present at all -->
</ExternalCredential>
```
No `Scope` AuthParameter exists. This is deliberate — see the incident above.

### 2. Named Credential — `VizVoice`

```xml
<NamedCredential>
    <calloutStatus>Enabled</calloutStatus>
    <generateAuthorizationHeader>true</generateAuthorizationHeader>
    <!-- Url -->
    <parameterValue>https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com</parameterValue>
    <!-- Authentication -->
    <externalCredential>VizVoice_Org_API</externalCredential>
    <namedCredentialType>SecuredEndpoint</namedCredentialType>
</NamedCredential>
```
Points at the real org host and links to the External Credential above.
Referenced in Apex as `callout:VizVoice`.

### 3. External Client App OAuth scopes — `VizVoice_Agent_API_oauth` (`ExtlClntAppOauthSettings`)

```xml
<ExtlClntAppOauthSettings>
    <commaSeparatedOauthScopes>Api, Web, RefreshToken</commaSeparatedOauthScopes>
    <externalClientApplication>VizVoice_Agent_API</externalClientApplication>
    <isFirstPartyAppEnabled>false</isFirstPartyAppEnabled>
</ExtlClntAppOauthSettings>
```
`Web` + `RefreshToken` are required for the JWT Bearer Flow → `frontdoor.jsp`
exchange in `generateFrontdoorUrl()`. This list is unrelated to (and does not
need to match) the External Credential's Scope setting in section 1.

### 4. External Client App OAuth policy — `VizVoice_Agent_API_oauthPlcy` (`ExtlClntAppOauthConfigurablePolicies`)

```xml
<ExtlClntAppOauthConfigurablePolicies>
    <clientCredentialsFlowUser>epic.0d666f471e01@orgfarm.salesforce.com</clientCredentialsFlowUser>
    <isClientCredentialsFlowEnabled>true</isClientCredentialsFlowEnabled>
    <permittedUsersPolicyType>AdminApprovedPreAuthorized</permittedUsersPolicyType>
    <commaSeparatedPermissionSet>
        ...,VizVoice_Access,VizVoice_Named_Cred_Access,...
    </commaSeparatedPermissionSet>
</ExtlClntAppOauthConfigurablePolicies>
```
`clientCredentialsFlowUser` is the identity every Client Credentials Flow
callout (`/dashboards`, `/visualizations`, `/visualization`) actually runs as
— **not** the logged-in UI Bundle user. `VizVoice_Access` and
`VizVoice_Named_Cred_Access` are both listed as permitted permission sets
here, and both are also directly assigned to that user (see section 6) —
this is what grants that run-as identity access to the proxy's Apex classes
and to the Named Credential's principal.

### 5. External Client App global OAuth settings — `VizVoice_Agent_API_glbloauth` (`ExtlClntAppGlobalOauthSettings`)

```xml
<ExtlClntAppGlobalOauthSettings>
    <callbackUrl>https://orgfarm-aac260ab62-dev-ed--c.develop.my.salesforce.app/app/c__vizvoice</callbackUrl>
    <consumerKey>3MVG9rZjd7MXFdLhw0u0...</consumerKey>
    <isClientCredentialsFlowEnabled>true</isClientCredentialsFlowEnabled>
    <isCodeCredFlowEnabled>true</isCodeCredFlowEnabled>
</ExtlClntAppGlobalOauthSettings>
```
Callback URL points at the real VizVoice UI Bundle app (`c__vizvoice`), not a
scratch/test app — this had drifted to a test app's URL during debugging and
was corrected. `consumerKey` here matches `JWT_CONSUMER_KEY` in
`VizVoiceAgentProxy.cls`.

### 6. Permission sets — `VizVoice_Access` and `VizVoice_Named_Cred_Access`

**`VizVoice_Access`** grants Apex class access:
```xml
<classAccesses><apexClass>TableauDashboardController</apexClass><enabled>true</enabled></classAccesses>
<classAccesses><apexClass>TableauEmbedAuthProxy</apexClass><enabled>true</enabled></classAccesses>
<classAccesses><apexClass>VizVoiceAgentController</apexClass><enabled>true</enabled></classAccesses>
<classAccesses><apexClass>VizVoiceAgentProxy</apexClass><enabled>true</enabled></classAccesses>
```
Plus `AccessCustomerDataCloudSetup`, `AccessGeniePlatform`, `ApiEnabled` user
permissions, and `dataspaceScope: default` with `dataAccessLevel: ALL` (the
Data Cloud query-access grant from the July 18 recurrence fix, above).

**`VizVoice_Named_Cred_Access`** grants External Credential principal access:
```xml
<externalCredentialPrincipalAccesses>
    <enabled>true</enabled>
    <externalCredentialPrincipal>VizVoice_Org_API-VizVoice_Client</externalCredentialPrincipal>
</externalCredentialPrincipalAccesses>
```
This is what lets a running user actually use the `VizVoice_Client` Named
Principal on the External Credential — without it, the callout has an
authenticated flow but no permission to invoke it.

**Both permission sets are assigned to `epic.0d666f471e01@orgfarm.salesforce.com`**
(confirmed via `SELECT PermissionSet.Name FROM PermissionSetAssignment WHERE
Assignee.Username='epic.0d666f471e01@orgfarm.salesforce.com'`) — the same
identity that `clientCredentialsFlowUser` in section 4 designates as the
Client Credentials Flow run-as user. This assignment was already correct
during the July 18 scope-drift incident above; it was not the cause of that
regression, but it's included here because it's a real, necessary part of
why the whole chain works, and a natural thing to suspect/re-check if a
future regression looks permission-shaped rather than scope-shaped.

### Why this all fits together

```
Browser (UI Bundle "vizvoice")
  → GET /services/apexrest/vizvoice/dashboards
    → VizVoiceAgentProxy.listDashboards() (Apex, "without sharing")
      → HTTP callout to "callout:VizVoice"           [Named Credential, section 2]
        → auto-attaches OAuth token via               [External Credential, section 1]
          Client Credentials Flow, NO scope param
          → token request runs as                     [clientCredentialsFlowUser, section 4]
            epic.0d666f471e01@orgfarm.salesforce.com
            → needs VizVoice_Named_Cred_Access         [section 6]
              to use the VizVoice_Client principal
            → needs VizVoice_Access                    [section 6]
              to have class access to VizVoiceAgentProxy
        → real GET to /services/data/v66.0/tableau/dashboards
          on orgfarm-aac260ab62-dev-ed...my.salesforce.com

  → GET /services/apexrest/vizvoice/frontdoor
    → VizVoiceAgentProxy.generateFrontdoorUrl() (Apex)
      → builds its own JWT, signs with VizVoice_JWT cert
      → POSTs directly to /services/oauth2/token (JWT Bearer Flow,
        bypasses the Named Credential entirely)
        → scope comes from                             [ECA OAuth scopes, section 3]
          Api, Web, RefreshToken — NOT from the
          External Credential's (nonexistent) Scope param
      → POSTs to /services/oauth2/singleaccess with that session token
        → returns frontdoor_uri
```

Verification commands (safe to re-run any time to confirm live state matches
this doc):
```bash
sf project retrieve start \
  -m "ExternalCredential:VizVoice_Org_API" \
  -m "NamedCredential:VizVoice" \
  -m "ExtlClntAppOauthSettings" \
  -m "ExtlClntAppOauthConfigurablePolicies" \
  -m "ExtlClntAppGlobalOauthSettings" \
  -m "PermissionSet:VizVoice_Access" \
  -m "PermissionSet:VizVoice_Named_Cred_Access" \
  -o vizvoice-dev -r /tmp/vv_verify

sf api request rest /services/apexrest/vizvoice/dashboards -o vizvoice-dev
sf api request rest /services/apexrest/vizvoice/frontdoor -o vizvoice-dev
```
