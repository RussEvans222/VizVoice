/**
 * Apex REST proxy for the in-org Agentforce runtime.
 *
 * IMPORTANT — architecture note (2026-07):
 * The headless Agentforce Agent API (api.salesforce.com/einstein/ai-agent/v1) is NOT
 * provisioned on this developer org. Confirmed three ways: the gateway returns a bare
 * headerless 404, there is no ai-agent resource in the org's Connect catalog, and the
 * agent exposes no "API" channel. That path is abandoned.
 *
 * Instead we invoke the agent through the standard REST-invocable action
 * `generateAiAgentResponse`, which runs the agent entirely inside the authenticated
 * org session via Named Credential "VizVoice" — no external gateway, no provisioning.
 * Verified working end-to-end: POST returns { agentResponse, sessionId } with 200.
 *
 * Endpoints:
 *   GET    /services/apexrest/vizvoice/dashboards           → list Tableau dashboards
 *   GET    /services/apexrest/vizvoice/frontdoor            → generate frontdoor URL for embedding
 *   GET    /services/apexrest/vizvoice/visualizations       → list Tableau Next visualizations (REST API fallback)
 *   GET    /services/apexrest/vizvoice/visualization?id=... → get one visualization's spec/data by id or API name
 *   POST   /services/apexrest/vizvoice/session              → open a conversation (first turn)
 *   POST   /services/apexrest/vizvoice/message              → send a message (subsequent turns)
 *   DELETE /services/apexrest/vizvoice/session/{id}         → (no-op; session is stateless here)
 *
 * Tableau Next REST API fallback (2026-07): the Embedding SDK's live inline
 * render is blocked by an OAuth "web" scope gap on this org's connected app.
 * The Tableau Next REST API (/tableau/visualizations) needs only the lighter
 * "api" scope, which the same Named Credential "VizVoice" can carry once that
 * scope is added to the connected app in Setup — no new auth plumbing needed.
 * These endpoints proxy that API so the frontend can render the visualization's
 * data/spec directly when the SDK embed fails, instead of only an "open in
 * new tab" link.
 */
@RestResource(urlMapping='/vizvoice/*')
global without sharing class VizVoiceAgentProxy {

    // v66.0+ required — the Tableau Next visualization detail endpoint throws
    // DOWNGRADE_VERSION_ERROR on v64.0 for visualizations using newer features.
    private static final String API_VERSION = 'v66.0';
    // All callouts use the org's My Domain host via Named Credential "VizVoice".
    private static final String NAMED_CRED = 'callout:VizVoice';

    // Client Credentials Flow (used by NAMED_CRED for /dashboards etc.) cannot
    // carry the "web" scope frontdoor generation needs — Salesforce rejects it
    // with Invalid_Scope regardless of app config, since Client Credentials has
    // no browser/session concept. generateFrontdoorUrl() bypasses the Named
    // Credential and uses JWT Bearer Flow instead (same proven approach as
    // TableauEmbedAuthProxy.cls), which impersonates a real user session and
    // can carry "web" scope.
    private static final String JWT_CONSUMER_KEY = '3MVG9rZjd7MXFdLhw0u0.NMDEnbjlQ8ZqkgBpVOMZ6Jbt6lC4Ni3T0xPw0lSM9qFjqhloEuwPi84ypJNOwF4X';
    private static final String JWT_RUN_AS_USERNAME = 'epic.0d666f471e01@orgfarm.salesforce.com';
    private static final String JWT_CERT_DEVELOPER_NAME = 'VizVoice_JWT';
    private static final String JWT_LOGIN_HOST = 'https://orgfarm-aac260ab62-dev-ed.develop.my.salesforce.com';
    // The invocable-action agent bridge. AGENT_ACTION is the activated agent's
    // action API name under generateAiAgentResponse. The VizVoice agent is
    // published & active (verified: it responds 200 with analytics answers).
    private static final String AGENT_ACTION = 'VizVoice';
    private static final String AGENT_ACTION_PATH =
        '/services/data/' + API_VERSION + '/actions/custom/generateAiAgentResponse/' + AGENT_ACTION;
    // Prepended to every utterance to keep spoken answers short (voice/TTS UX).
    private static final String BREVITY_DIRECTIVE =
        '[Answer for a voice assistant: lead with the single most important number, ' +
        'keep it to at most 2 short sentences, no lists or markdown, and never use ' +
        'visual phrases like "as you can see" or "the chart shows".]';

    @HttpGet
    global static void doGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        String path = req.requestURI.removeStart('/vizvoice/');
        res.addHeader('Content-Type', 'application/json');

        try {
            if (path == 'dashboards') {
                listDashboards(res);
            } else if (path == 'frontdoor') {
                generateFrontdoorUrl(res);
            } else if (path == 'visualizations') {
                listVisualizations(res);
            } else if (path == 'visualization') {
                getVisualization(req, res);
            } else {
                res.statusCode = 404;
                res.responseBody = Blob.valueOf('{"error":"Unknown GET path: ' + path + '"}');
            }
        } catch (Exception e) {
            res.statusCode = 500;
            res.responseBody = Blob.valueOf('{"error":' + JSON.serialize(e.getMessage()) + '}');
        }
    }

    @HttpPost
    global static void doPost() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        String path = req.requestURI.removeStart('/vizvoice/');

        try {
            if (path == 'session') {
                // First turn — no prior sessionId.
                invokeAgent(req, res, null);
            } else if (path.startsWith('message')) {
                String sessionId = req.params.get('sessionId');
                invokeAgent(req, res, sessionId);
            } else {
                res.statusCode = 404;
                res.responseBody = Blob.valueOf('{"error":"Unknown path: ' + path + '"}');
            }
        } catch (Exception e) {
            res.statusCode = 500;
            res.responseBody = Blob.valueOf('{"error":' + JSON.serialize(e.getMessage()) + '}');
        }
    }

    @HttpDelete
    global static void doDelete() {
        // The invocable-action bridge is stateless from the client's view — the
        // agent session lives server-side and is keyed only by the sessionId echoed
        // back on each turn. There is nothing to tear down, so acknowledge and return.
        RestContext.response.statusCode = 204;
    }

    private static void listDashboards(RestResponse res) {
        HttpRequest hr = new HttpRequest();
        hr.setMethod('GET');
        hr.setEndpoint(NAMED_CRED + '/services/data/' + API_VERSION + '/tableau/dashboards');
        hr.setHeader('Content-Type', 'application/json');

        HttpResponse hr2 = new Http().send(hr);
        res.statusCode = hr2.getStatusCode();
        // Relay the body directly — it's already {"dashboards":[...]}
        res.responseBody = hr2.getBodyAsBlob();
    }

    /**
     * Generate a frontdoor URL for Tableau Next embedding SDK authentication.
     *
     * Per Salesforce docs (https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-access-token.md),
     * the Analytics Embedding SDK requires a frontdoor URL as the authCredential.
     *
     * This calls /services/oauth2/singleaccess via the Named Credential, which uses
     * the External Credential's OAuth token (not UserInfo.getSessionId(), which doesn't
     * work for UI Bundles).
     */
    private static void generateFrontdoorUrl(RestResponse res) {
        // Step 1 — JWT Bearer Flow: exchange a signed JWT for a real user
        // session access token (can carry "web" scope, unlike Client
        // Credentials Flow). Auth.JWT has no setValidFor in this org's Apex
        // version — it defaults to a short validity window on its own.
        Auth.JWT jwt = new Auth.JWT();
        jwt.setSub(JWT_RUN_AS_USERNAME);
        jwt.setAud(JWT_LOGIN_HOST);
        jwt.setIss(JWT_CONSUMER_KEY);

        Auth.JWS jws = new Auth.JWS(jwt, JWT_CERT_DEVELOPER_NAME);
        String assertion = jws.getCompactSerialization();

        // Auth.JWTBearerTokenExchange resolves its own login endpoint
        // internally and lands on a generic login page instead of
        // /services/oauth2/token in this org — POST directly instead.
        HttpRequest tokenReq = new HttpRequest();
        tokenReq.setMethod('POST');
        tokenReq.setEndpoint(JWT_LOGIN_HOST + '/services/oauth2/token');
        tokenReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        tokenReq.setBody(
            'grant_type=' + EncodingUtil.urlEncode('urn:ietf:params:oauth:grant-type:jwt-bearer', 'UTF-8') +
            '&assertion=' + EncodingUtil.urlEncode(assertion, 'UTF-8'));
        tokenReq.setTimeout(30000);

        HttpResponse tokenRes = new Http().send(tokenReq);
        if (tokenRes.getStatusCode() != 200) {
            res.statusCode = tokenRes.getStatusCode();
            res.responseBody = tokenRes.getBodyAsBlob();
            return;
        }

        Map<String, Object> tokenBody =
            (Map<String, Object>) JSON.deserializeUntyped(tokenRes.getBody());
        String sessionAccessToken = (String) tokenBody.get('access_token');
        String instanceUrl = (String) tokenBody.get('instance_url');

        // Step 2 — mint a frontdoor URL from that session token.
        HttpRequest hr = new HttpRequest();
        hr.setMethod('POST');
        hr.setEndpoint(instanceUrl + '/services/oauth2/singleaccess');
        hr.setHeader('Authorization', 'Bearer ' + sessionAccessToken);
        hr.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        hr.setHeader('Accept', 'application/json');
        hr.setBody('');
        hr.setTimeout(30000);

        HttpResponse hr2 = new Http().send(hr);
        res.statusCode = hr2.getStatusCode();

        if (hr2.getStatusCode() != 200) {
            res.responseBody = Blob.valueOf('{"error":"Frontdoor generation failed: ' + hr2.getBody() + '"}');
            return;
        }

        try {
            Map<String, Object> responseData =
                (Map<String, Object>) JSON.deserializeUntyped(hr2.getBody());
            String frontdoorUrl = (String) responseData.get('frontdoor_uri');
            res.responseBody = Blob.valueOf(JSON.serialize(new Map<String, String>{
                'frontdoorUrl' => frontdoorUrl,
                'instanceUrl' => instanceUrl
            }));
        } catch (Exception e) {
            res.statusCode = 500;
            res.responseBody = Blob.valueOf('{"error":"Failed to parse frontdoor response: ' + e.getMessage() + '"}');
        }
    }

    /**
     * List Tableau Next visualizations available to the running user.
     * GET /tableau/visualizations -> { "visualizations": [ {...}, ... ] }
     * Relayed as-is so the frontend can pick one and call getVisualization.
     */
    private static void listVisualizations(RestResponse res) {
        HttpRequest hr = new HttpRequest();
        hr.setMethod('GET');
        hr.setEndpoint(NAMED_CRED + '/services/data/' + API_VERSION + '/tableau/visualizations');
        hr.setHeader('Content-Type', 'application/json');
        hr.setTimeout(30000);

        HttpResponse hr2 = new Http().send(hr);
        res.statusCode = hr2.getStatusCode();
        res.responseBody = hr2.getBodyAsBlob();
    }

    /**
     * Get a single visualization's spec/data by id or API name.
     * GET /tableau/visualizations/{visualizationIdOrApiName}
     * Relayed as-is — includes dataSource, fields, and visualSpecification,
     * which the frontend can render directly as a fallback for the blocked
     * live embed.
     */
    private static void getVisualization(RestRequest req, RestResponse res) {
        String vizId = req.params.get('id');
        if (String.isBlank(vizId)) {
            res.statusCode = 400;
            res.responseBody = Blob.valueOf('{"error":"Missing required query param: id"}');
            return;
        }

        HttpRequest hr = new HttpRequest();
        hr.setMethod('GET');
        hr.setEndpoint(NAMED_CRED + '/services/data/' + API_VERSION
            + '/tableau/visualizations/' + EncodingUtil.urlEncode(vizId, 'UTF-8'));
        hr.setHeader('Content-Type', 'application/json');
        hr.setTimeout(30000);

        HttpResponse hr2 = new Http().send(hr);
        res.statusCode = hr2.getStatusCode();
        res.responseBody = hr2.getBodyAsBlob();
    }

    /**
     * Invoke the agent via the generateAiAgentResponse standard action.
     * Frontend sends { message: { role, content }, variables: {...} }.
     * We forward the utterance (and, on later turns, the sessionId) and normalize
     * the action envelope down to { message: { role:'Agent', content }, sessionId }.
     */
    private static void invokeAgent(RestRequest req, RestResponse res, String sessionId) {
        String utterance = '';
        Map<String, Object> variables = new Map<String, Object>();
        if (req.requestBody != null) {
            Map<String, Object> inbound =
                (Map<String, Object>) JSON.deserializeUntyped(req.requestBody.toString());
            Object msgObj = inbound.get('message');
            if (msgObj instanceof Map<String, Object>) {
                Object content = ((Map<String, Object>) msgObj).get('content');
                if (content != null) utterance = String.valueOf(content);
            }
            Object varsObj = inbound.get('variables');
            if (varsObj instanceof Map<String, Object>) {
                variables = (Map<String, Object>) varsObj;
            }
            // Allow the sessionId to arrive in the body as well as the query param.
            if (String.isBlank(sessionId) && inbound.get('sessionId') != null) {
                sessionId = String.valueOf(inbound.get('sessionId'));
            }
        }

        // Dashboard context (targetEntityId, analyticsTabId, filters) is folded into
        // the utterance as a preamble so the agent's AnalyzeSemanticData action can
        // ground on it — the invocable bridge takes a single userMessage string.
        String contextPreamble = buildContextPreamble(variables);
        String userMessage = String.isBlank(contextPreamble)
            ? utterance
            : contextPreamble + '\n\n' + utterance;
        // Brevity directive: this is a voice/TTS experience, so long answers cost
        // both generation time AND read-back time. Instruct the agent to lead with
        // the key number and keep it to ~2 sentences. Prepended to every turn.
        userMessage = BREVITY_DIRECTIVE + '\n\n' + userMessage;

        Map<String, Object> input = new Map<String, Object>{ 'userMessage' => userMessage };
        if (String.isNotBlank(sessionId)) {
            input.put('sessionId', sessionId);
        }
        Map<String, Object> payload = new Map<String, Object>{
            'inputs' => new List<Object>{ input }
        };

        HttpRequest hr = new HttpRequest();
        hr.setMethod('POST');
        hr.setEndpoint(NAMED_CRED + AGENT_ACTION_PATH);
        hr.setHeader('Content-Type', 'application/json');
        hr.setBody(JSON.serialize(payload));
        // Agent reasoning + AnalyzeSemanticData (Data 360 query) routinely exceeds
        // the default 10s callout timeout, which surfaced to the client as a 500
        // "Read timed out". Give the agent the full 120s Apex ceiling.
        hr.setTimeout(120000);

        HttpResponse hr2 = new Http().send(hr);
        res.addHeader('Content-Type', 'application/json');
        res.statusCode = hr2.getStatusCode();

        if (hr2.getStatusCode() != 200) {
            // Relay the raw error so the client (and logs) can see it.
            res.responseBody = hr2.getBodyAsBlob();
            return;
        }

        res.responseBody = Blob.valueOf(JSON.serialize(normalizeResponse(hr2.getBody())));
    }

    /**
     * The action returns a list envelope; the agentResponse is itself a JSON string
     * like {"type":"Text","value":"..."}. Unwrap both layers to a clean shape the
     * frontend can render and speak.
     */
    private static Map<String, Object> normalizeResponse(String body) {
        String answer = '';
        String sessionId = '';
        try {
            List<Object> results = (List<Object>) JSON.deserializeUntyped(body);
            if (!results.isEmpty()) {
                Map<String, Object> first = (Map<String, Object>) results[0];
                Object outObj = first.get('outputValues');
                if (outObj instanceof Map<String, Object>) {
                    Map<String, Object> out = (Map<String, Object>) outObj;
                    if (out.get('sessionId') != null) sessionId = String.valueOf(out.get('sessionId'));
                    Object ar = out.get('agentResponse');
                    if (ar != null) {
                        answer = String.valueOf(ar);
                        // agentResponse is a nested JSON string — pull out .value.
                        try {
                            Object parsed = JSON.deserializeUntyped(answer);
                            if (parsed instanceof Map<String, Object>) {
                                Object v = ((Map<String, Object>) parsed).get('value');
                                if (v != null) answer = String.valueOf(v);
                            }
                        } catch (Exception ignore) {
                            // agentResponse was plain text — keep as-is.
                        }
                    }
                }
            }
        } catch (Exception e) {
            answer = 'Sorry, I could not parse the agent response.';
        }

        return new Map<String, Object>{
            'sessionId' => sessionId,
            'message' => new Map<String, Object>{
                'role' => 'Agent',
                'content' => answer
            }
        };
    }

    /**
     * Fold dashboard context variables into a short natural-language preamble.
     * Keeps the agent grounded on the active dashboard without a formal variables
     * channel (which the invocable bridge does not expose).
     */
    private static String buildContextPreamble(Map<String, Object> variables) {
        if (variables == null || variables.isEmpty()) return '';
        List<String> parts = new List<String>();
        if (variables.get('targetEntityId') != null) {
            parts.add('Dashboard: ' + variables.get('targetEntityId'));
        }
        if (variables.get('analyticsTabId') != null) {
            parts.add('Tab: ' + variables.get('analyticsTabId'));
        }
        if (variables.get('targetEntityState') != null) {
            parts.add('Current filters: ' + variables.get('targetEntityState'));
        }
        if (parts.isEmpty()) return '';
        return '[Context — ' + String.join(parts, '; ') + ']';
    }
}
