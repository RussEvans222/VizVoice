/**
 * Aura-enabled controller for VizVoice UI Bundle.
 *
 * UI Bundles on *.salesforce.app cannot call Apex REST (@RestResource) because
 * their session context doesn't have REST API permissions. Instead, use
 * @AuraEnabled methods which UI Bundles CAN invoke via the Data SDK.
 */
public with sharing class VizVoiceAgentController {

    private static final String API_VERSION = 'v64.0';
    private static final String NAMED_CRED = 'callout:VizVoice';
    private static final String AGENT_ACTION = 'VizVoice';
    private static final String AGENT_ACTION_PATH =
        '/services/data/' + API_VERSION + '/actions/custom/generateAiAgentResponse/' + AGENT_ACTION;
    private static final String BREVITY_DIRECTIVE =
        '[Answer for a voice assistant: lead with the single most important number, ' +
        'keep it to at most 2 short sentences, no lists or markdown, and never use ' +
        'visual phrases like "as you can see" or "the chart shows".]';

    @AuraEnabled(cacheable=false)
    public static Map<String, Object> listDashboards() {
        try {
            HttpRequest hr = new HttpRequest();
            hr.setMethod('GET');
            hr.setEndpoint(NAMED_CRED + '/services/data/' + API_VERSION + '/tableau/dashboards');
            hr.setHeader('Content-Type', 'application/json');
            hr.setTimeout(30000);

            HttpResponse hr2 = new Http().send(hr);
            if (hr2.getStatusCode() != 200) {
                throw new AuraHandledException('Dashboard list failed: ' + hr2.getStatus());
            }
            return (Map<String, Object>) JSON.deserializeUntyped(hr2.getBody());
        } catch (Exception e) {
            throw new AuraHandledException('listDashboards error: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=false)
    public static Map<String, Object> sendMessage(
        String utterance,
        String sessionId,
        Map<String, String> variables
    ) {
        try {
            if (String.isBlank(utterance)) {
                throw new IllegalArgumentException('utterance is required');
            }

            String contextPreamble = buildContextPreamble(variables);
            String userMessage = String.isBlank(contextPreamble)
                ? utterance
                : contextPreamble + '\n\n' + utterance;
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
            hr.setTimeout(120000);

            HttpResponse hr2 = new Http().send(hr);
            if (hr2.getStatusCode() != 200) {
                throw new AuraHandledException(
                    'Agent invocation failed (' + hr2.getStatusCode() + '): ' + hr2.getBody()
                );
            }

            return normalizeResponse(hr2.getBody());
        } catch (Exception e) {
            throw new AuraHandledException('sendMessage error: ' + e.getMessage());
        }
    }

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
                        try {
                            Object parsed = JSON.deserializeUntyped(answer);
                            if (parsed instanceof Map<String, Object>) {
                                Object v = ((Map<String, Object>) parsed).get('value');
                                if (v != null) answer = String.valueOf(v);
                            }
                        } catch (Exception ignore) {
                            // agentResponse was plain text
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

    private static String buildContextPreamble(Map<String, String> variables) {
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
