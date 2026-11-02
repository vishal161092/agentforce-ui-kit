public with sharing class VideoMessageInvocable {
    public class Request {
        @InvocableVariable(
            label='Caption'
            description='Optional caption passed to the Video Message Lightning type (shown when you extend the LWC).'
        )
        public String caption;
    }

    public class Response {
        @InvocableVariable(
            label='Video Message'
            description='Output for the Video Message custom Lightning type renderer.'
        )
        public VideoMessageInfo videoMessage;
    }

    @InvocableMethod(
        label='Emit Video Message'
        description='Returns a VideoMessageInfo payload for the Video Message custom Lightning type.'
    )
    public static List<Response> emitVideoMessage(List<Request> requests) {
        List<Response> results = new List<Response>();
        if (requests == null || requests.isEmpty()) {
            return results;
        }
        for (Request req : requests) {
            Response res = new Response();
            VideoMessageInfo info = new VideoMessageInfo();
            info.caption = (req != null && req.caption != null) ? req.caption : '';
            res.videoMessage = info;
            results.add(res);
        }
        return results;
    }
}
