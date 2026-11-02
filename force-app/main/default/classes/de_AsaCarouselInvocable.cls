public with sharing class de_AsaCarouselInvocable {
    public class Request {
        @InvocableVariable(
            label='Product Carousel JSON'
            description='Optional JSON payload for de_asaCarousel. If empty, renderer fallback shows default 4 sherwani options.'
        )
        public String productCarouselJSON;
    }

    public class Response {
        @InvocableVariable(
            label='DE ASA Carousel'
            description='Output payload for the de_asaCarousel custom Lightning type renderer.'
        )
        public de_AsaCarouselData deAsaCarousel;
    }

    @InvocableMethod(
        label='Get DE ASA Carousel'
        description='Returns de_AsaCarouselData payload for de_asaCarousel custom Lightning type.'
    )
    public static List<Response> getDeAsaCarousel(List<Request> requests) {
        List<Response> results = new List<Response>();
        if (requests == null || requests.isEmpty()) {
            results.add(wrap(''));
            return results;
        }

        for (Request req : requests) {
            String payload = (req != null && req.productCarouselJSON != null) ? req.productCarouselJSON : '';
            results.add(wrap(payload));
        }
        return results;
    }

    private static Response wrap(String payload) {
        // Default to the Brightwave gift-card preset when the planner passes no value.
        String effectivePayload = String.isBlank(payload) ? 'Brightwave' : payload;
        Response res = new Response();
        de_AsaCarouselData data = new de_AsaCarouselData();
        data.productCarouselJSON = effectivePayload;
        res.deAsaCarousel = data;
        return res;
    }
}
