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
}
