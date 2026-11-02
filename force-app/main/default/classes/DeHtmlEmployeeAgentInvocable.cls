public with sharing class DeHtmlEmployeeAgentInvocable {
    /**
     * Optional inputs for future use (e.g. dynamic product names). Currently unused; defaults match the dashboard mockup.
     */
    public class Request {
        @InvocableVariable(
            label='User query'
            description='Optional utterance or context from the user (reserved for future dynamic comparisons).'
        )
        public String userQuery;
    }

    public class Response {
        @InvocableVariable(
            label='Product comparison'
            description='Payload for the DE HTML Employee Agent Lightning type (product comparison dashboard).'
        )
        public DeHtmlEmployeeAgentInfo productComparison;
    }

    @InvocableMethod(
        label='Get Product Comparison Dashboard'
        description='Returns 14T vs Tipper comparison data for the DE HTML Employee Agent custom Lightning type renderer.'
    )
    public static List<Response> getProductComparison(List<Request> requests) {
        List<Response> results = new List<Response>();
        if (requests == null || requests.isEmpty()) {
            results.add(wrap(buildDefaultComparison()));
            return results;
        }
        for (Integer i = 0; i < requests.size(); i++) {
            results.add(wrap(buildDefaultComparison()));
        }
        return results;
    }

    private static Response wrap(DeHtmlEmployeeAgentInfo info) {
        Response res = new Response();
        res.productComparison = info;
        return res;
    }

    private static DeHtmlEmployeeAgentInfo buildDefaultComparison() {
        DeHtmlEmployeeAgentInfo o = new DeHtmlEmployeeAgentInfo();
        o.aiRecommendationTitle = 'AI Recommendation';
        o.aiRecommendationBody =
            'Higher conversion observed in 14T segment – recommend increasing focus.';
        o.leftProductName = '14T';
        o.leftConversionPercent = 32;
        o.leftDealCycleDays = 12;
        o.rightProductName = 'Tipper';
        o.rightConversionPercent = 18;
        o.rightDealCycleDays = 21;
        o.insightLeftTitle = 'Faster Closure';
        o.insightLeftBody = '14T closes 9 days sooner';
        o.insightRightTitle = 'Higher ROI';
        o.insightRightBody = '89% more incentive for Tippers';
        o.footerTitle = 'Add 2 More 14T Visits This Week';
        o.footerBody =
            'Based on your 32% conversion rate in 14T (vs 18% in Tipper), prioritize high-intent 14T leads to maximize your time and impact.';
        o.footerButtonLabel = 'Add to my Beat Plan';
        return o;
    }
}
