/**
 * Apex controller for VizVoice UI Bundle to access Tableau Next dashboards.
 *
 * UI Bundles have restricted session permissions and cannot directly call
 * /services/data/vXX.0/tableau/* endpoints (get 401 Unauthorized). This
 * controller runs server-side with full API access and proxies the requests.
 */
public with sharing class TableauDashboardController {

    /**
     * List all Tableau Next dashboards accessible to the current user.
     * Called from UI Bundle via wire adapter or imperative Apex.
     */
    @AuraEnabled(cacheable=true)
    public static String listDashboards() {
        try {
            HttpRequest req = new HttpRequest();
            req.setMethod('GET');
            // Call via Named Credential to inherit current user's session
            req.setEndpoint('callout:VizVoice/services/data/v67.0/tableau/dashboards');
            req.setHeader('Content-Type', 'application/json');

            HttpResponse res = new Http().send(req);

            if (res.getStatusCode() != 200) {
                throw new AuraHandledException(
                    'Tableau API returned ' + res.getStatusCode() + ': ' + res.getBody()
                );
            }

            return res.getBody();
        } catch (Exception e) {
            throw new AuraHandledException('Failed to fetch dashboards: ' + e.getMessage());
        }
    }

    /**
     * Generate a frontdoor URL for Tableau Next embedding SDK authentication.
     *
     * The Analytics Embedding SDK requires a frontdoor URL as the authCredential.
     * This method calls /services/oauth2/singleaccess to generate a short-lived
     * frontdoor URL that bridges the UI Bundle session to the embedded dashboard.
     *
     * Per Salesforce docs: https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-access-token.md
     */
    @AuraEnabled
    public static String getFrontdoorUrl() {
        try {
            String accessToken = UserInfo.getSessionId();
            String instanceUrl = URL.getOrgDomainUrl().toExternalForm();

            HttpRequest req = new HttpRequest();
            req.setMethod('POST');
            req.setEndpoint(instanceUrl + '/services/oauth2/singleaccess');
            req.setHeader('Authorization', 'Bearer ' + accessToken);
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.setHeader('Accept', 'application/json');
            req.setBody(''); // Empty body required
            req.setTimeout(30000);

            HttpResponse res = new Http().send(req);

            if (res.getStatusCode() != 200) {
                throw new AuraHandledException(
                    'Frontdoor URL generation failed (' + res.getStatusCode() + '): ' + res.getBody()
                );
            }

            Map<String, Object> responseData =
                (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            String frontdoorUrl = (String) responseData.get('frontdoor_uri');

            if (String.isBlank(frontdoorUrl)) {
                throw new AuraHandledException('No frontdoor_uri in response');
            }

            return frontdoorUrl;
        } catch (Exception e) {
            throw new AuraHandledException('Failed to generate frontdoor URL: ' + e.getMessage());
        }
    }
}
