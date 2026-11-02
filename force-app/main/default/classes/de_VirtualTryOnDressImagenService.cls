public without sharing class de_VirtualTryOnDressImagenService {

    private static final String VERTEX_TRYON = 'https://us-central1-aiplatform.googleapis.com/v1/projects/{0}/locations/us-central1/publishers/google/models/virtual-try-on-001:predict';

    @AuraEnabled
    public static ImagenResponse virtualTryOn(String personImageBase64, String productImageBase64) {
        String accessToken = de_GoogleAuthService.getAccessToken();
        String projectId = de_GoogleAuthService.getProjectId();
        String endpoint = String.format(VERTEX_TRYON, new List<String>{ projectId });

        Map<String, Object> instance = new Map<String, Object>{
            'personImage' => new Map<String, Object>{
                'image' => new Map<String, Object>{ 'bytesBase64Encoded' => personImageBase64 }
            },
            'productImages' => new List<Map<String, Object>>{
                new Map<String, Object>{
                    'image' => new Map<String, Object>{ 'bytesBase64Encoded' => productImageBase64 }
                }
            }
        };

        return sendRequest(endpoint, accessToken, instance);
    }

    @AuraEnabled
    public static String fetchImageAsBase64(String imageUrl) {
        if (imageUrl != null && imageUrl.contains('/resource/')) {
            String cleanUrl = imageUrl.contains('?') ? imageUrl.substringBefore('?') : imageUrl;
            String afterResource = cleanUrl.substringAfter('/resource/');
            List<String> segments = afterResource != null ? afterResource.split('/') : new List<String>();

            String staticResourceName;
            if (segments.size() >= 2 && String.isNotBlank(segments[0]) && String.isNotBlank(segments[1])) {
                staticResourceName = segments[1];
            } else if (segments.size() == 1) {
                staticResourceName = segments[0];
            }

            // Only read StaticResource.Body directly when URL points to the resource itself.
            // If URL points to a file inside a zipped static resource (e.g. .../deSherwanis/Sherwani2.png),
            // StaticResource.Body is a ZIP blob and not a PNG image.
            Boolean pointsToNestedFile = segments.size() > 2 || (segments.size() == 2 && segments[1].contains('.'));
            if (!pointsToNestedFile && String.isNotBlank(staticResourceName) && !staticResourceName.contains('.')) {
                List<StaticResource> resources = [SELECT Body FROM StaticResource WHERE Name = :staticResourceName LIMIT 1];
                if (!resources.isEmpty()) {
                    return EncodingUtil.base64Encode(resources[0].Body);
                }
            }
            // Fallback to HTTP fetch for zipped-resource file URLs and unmatched resource paths.
        }

        String url = imageUrl;
        Integer maxRedirects = 5;
        for (Integer i = 0; i < maxRedirects; i++) {
            HttpRequest req = new HttpRequest();
            req.setEndpoint(url);
            req.setMethod('GET');
            req.setTimeout(30000);
            HttpResponse res = new Http().send(req);
            Integer status = res.getStatusCode();
            if (status == 200) {
                return EncodingUtil.base64Encode(res.getBodyAsBlob());
            } else if (status == 301 || status == 302 || status == 303 || status == 307 || status == 308) {
                url = res.getHeader('Location');
                if (String.isBlank(url)) {
                    throw new CalloutException('Redirect with no Location header');
                }
            } else {
                throw new CalloutException('Failed to fetch image from URL (' + status + ')');
            }
        }
        throw new CalloutException('Too many redirects fetching image');
    }

    private static ImagenResponse sendRequest(String endpoint, String accessToken, Map<String, Object> instance) {
        Map<String, Object> payload = new Map<String, Object>();
        payload.put('instances', new List<Map<String, Object>>{ instance });
        payload.put('parameters', new Map<String, Object>{ 'sampleCount' => 1 });

        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(payload));
        req.setTimeout(120000);

        HttpResponse res = new Http().send(req);
        if (res.getStatusCode() != 200) {
            throw new CalloutException('Imagen API failed (' + res.getStatusCode() + '): ' + res.getBody());
        }

        Map<String, Object> body = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        List<Object> predictions = (List<Object>) body.get('predictions');
        Map<String, Object> prediction = (Map<String, Object>) predictions[0];

        ImagenResponse result = new ImagenResponse();
        result.base64Image = (String) prediction.get('bytesBase64Encoded');
        result.mimeType = (String) prediction.get('mimeType');
        return result;
    }

    public class ImagenResponse {
        @AuraEnabled public String base64Image;
        @AuraEnabled public String mimeType;
    }
}
