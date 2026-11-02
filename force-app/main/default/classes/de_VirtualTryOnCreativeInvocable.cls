public with sharing class de_VirtualTryOnCreativeInvocable {

    public class Request {
        @InvocableVariable(
            label='Prompt'
            description='Creative prompt for environment, styling, and ambience'
        )
        public String prompt;

        @InvocableVariable(
            label='Product Image URL'
            description='URL of the necklace/jewelry product image'
        )
        public String productImageUrl;
    }

    public class Response {
        @InvocableVariable(
            label='Virtual Try-On UI Payload'
            description='Payload for the DE Virtual Try-On Creative custom Lightning type renderer.'
        )
        public de_VirtualTryOnCreativeInfo virtualTryOnPayload;
    }

    @InvocableMethod(
        label='DE Virtual Try-On Creative'
        description='Returns payload for DE Virtual Try-On Creative Lightning type so UI can collect inputs and generate images.'
    )
    public static List<Response> run(List<Request> requests) {
        List<Response> outputs = new List<Response>();
        if (requests == null || requests.isEmpty()) {
            outputs.add(wrap(buildPayload(null)));
            return outputs;
        }

        for (Request req : requests) {
            outputs.add(wrap(buildPayload(req)));
        }

        return outputs;
    }

    private static Response wrap(de_VirtualTryOnCreativeInfo info) {
        Response res = new Response();
        res.virtualTryOnPayload = info;
        return res;
    }

    private static de_VirtualTryOnCreativeInfo buildPayload(Request req) {
        de_VirtualTryOnCreativeInfo info = new de_VirtualTryOnCreativeInfo();
        info.prompt = req != null ? req.prompt : null;
        info.productImageUrl = req != null ? req.productImageUrl : null;
        info.personImageBase64 = null;
        info.productImageBase64 = null;
        return info;
    }
}
