public with sharing class de_ASACarouselSareeInvocable {
    public class Request {
        @InvocableVariable(
            label='Product Carousel JSON'
            description='Optional JSON payload for de_ASACarousel_Saree. If empty, renderer fallback shows default saree options.'
        )
        public String productCarouselJSON;
    }

    public class Response {
        @InvocableVariable(
            label='DE ASA Carousel Saree'
            description='Output payload for the de_ASACarousel_Saree custom Lightning type renderer.'
        )
        public de_ASACarouselSareeData deAsaCarouselSaree;
    }

    @InvocableMethod(
        label='Get DE ASA Carousel Saree'
        description='Returns de_ASACarouselSareeData payload for de_ASACarousel_Saree custom Lightning type.'
    )
    public static List<Response> getDeAsaCarouselSaree(List<Request> requests) {
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
        Response res = new Response();
        de_ASACarouselSareeData data = new de_ASACarouselSareeData();
        data.productCarouselJSON = payload;
        res.deAsaCarouselSaree = data;
        return res;
    }
}
