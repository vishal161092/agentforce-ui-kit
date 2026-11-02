public with sharing class de_VirtualTryOnDressInvocable {

    public class Request {
        @InvocableVariable(
            label='Product Image URL'
            description='URL of the dress/product image selected from carousel'
            required=true
        )
        public String productImageUrl;
    }

    public class Response {
        @InvocableVariable(
            label='Virtual Try-On Dress UI Payload'
            description='Payload for DE Virtual Try-On Dress Lightning type renderer.'
        )
        public de_VirtualTryOnDressInfo dressTryOnPayload;
    }

    @InvocableMethod(
        label='DE Virtual Try-On Dress'
        description='Returns payload for DE Virtual Try-On Dress so UI can collect person image and run try-on.'
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

    private static Response wrap(de_VirtualTryOnDressInfo info) {
        Response res = new Response();
        res.dressTryOnPayload = info;
        return res;
    }

    private static de_VirtualTryOnDressInfo buildPayload(Request req) {
        de_VirtualTryOnDressInfo info = new de_VirtualTryOnDressInfo();
        info.productImageUrl = req != null ? req.productImageUrl : null;
        info.personImageBase64 = null;
        return info;
    }
}
