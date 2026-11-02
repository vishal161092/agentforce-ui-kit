public class de_GoogleImagenService {

    // NOTE: The Imagen generate/capability models (imagen-3.0-generate-001,
    // imagen-3.0-capability-001, etc.) are retired after the Vertex -> Gemini
    // Enterprise rebrand and now 404 in every project. Image generation/editing
    // is served by gemini-2.5-flash-image via the :generateContent API instead.
    // virtual-try-on-001 is unaffected (GA) and still uses the :predict shape.
    private static final String VERTEX_TRYON = 'https://us-central1-aiplatform.googleapis.com/v1/projects/{0}/locations/us-central1/publishers/google/models/virtual-try-on-001:predict';
    private static final String GEMINI_IMAGE = 'https://us-central1-aiplatform.googleapis.com/v1/projects/{0}/locations/us-central1/publishers/google/models/gemini-2.5-flash-image:generateContent';

    @AuraEnabled
    public static ImagenResponse generateImage(String prompt) {
        // Text -> image. No input image parts.
        return sendGeminiRequest(prompt, new List<String>());
    }

    @AuraEnabled
    public static ImagenResponse creativeGenerate(String prompt, String personImageBase64, String productImageBase64) {
        // Person + product reference images guided by prompt.
        String guided = 'Using the person in the first image and the product in the second image, '
            + 'generate a single photorealistic image. ' + prompt;
        return sendGeminiRequest(guided, new List<String>{ personImageBase64, productImageBase64 });
    }

    @AuraEnabled
    public static ImagenResponse editWithPrompt(String prompt, String personImageBase64, String productImageBase64) {
        String guided = 'Edit the first image (the person) using the product shown in the second image. ' + prompt;
        return sendGeminiRequest(guided, new List<String>{ personImageBase64, productImageBase64 });
    }

    @AuraEnabled
    public static ImagenResponse inpaintImage(String prompt, String personImageBase64) {
        return sendGeminiRequest(prompt, new List<String>{ personImageBase64 });
    }

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
    public static ImagenResponse enhanceWithCreative(String prompt, String tryOnImageBase64) {
        String enhancedPrompt = 'Edit this image. '
            + 'CRITICAL: Keep the person EXACTLY as they are — same face, same skin, same body, same posture, same expression, same hair. '
            + 'CRITICAL: Keep ALL jewelry, necklaces, earrings, bangles, ornaments, and accessories EXACTLY as they appear — do not remove, change, or obscure any of them. '
            + 'ONLY change the background scenery and lighting behind the person. '
            + prompt;

        return sendGeminiRequest(enhancedPrompt, new List<String>{ tryOnImageBase64 });
    }

    // Gemini image generation/editing via :generateContent. Accepts an optional
    // list of base64 JPEG/PNG input images that are attached as inlineData parts.
    private static ImagenResponse sendGeminiRequest(String prompt, List<String> inputImagesBase64) {
        String accessToken = de_GoogleAuthService.getAccessToken();
        String projectId = de_GoogleAuthService.getProjectId();
        String endpoint = String.format(GEMINI_IMAGE, new List<String>{ projectId });

        List<Object> parts = new List<Object>();
        parts.add(new Map<String, Object>{ 'text' => prompt });
        if (inputImagesBase64 != null) {
            for (String img : inputImagesBase64) {
                if (String.isBlank(img)) {
                    continue;
                }
                parts.add(new Map<String, Object>{
                    'inlineData' => new Map<String, Object>{ 'mimeType' => 'image/jpeg', 'data' => img }
                });
            }
        }

        Map<String, Object> payload = new Map<String, Object>{
            'contents' => new List<Object>{
                new Map<String, Object>{ 'role' => 'user', 'parts' => parts }
            },
            'generationConfig' => new Map<String, Object>{
                'responseModalities' => new List<String>{ 'IMAGE' }
            }
        };

        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(payload));
        req.setTimeout(120000);

        HttpResponse res = new Http().send(req);
        if (res.getStatusCode() != 200) {
            throw new CalloutException('Gemini image API failed (' + res.getStatusCode() + '): ' + res.getBody());
        }

        Map<String, Object> body = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        List<Object> candidates = (List<Object>) body.get('candidates');
        if (candidates == null || candidates.isEmpty()) {
            throw new CalloutException('Gemini image API returned no candidates: ' + res.getBody());
        }
        Map<String, Object> content = (Map<String, Object>) ((Map<String, Object>) candidates[0]).get('content');
        List<Object> respParts = (List<Object>) content.get('parts');

        ImagenResponse result = new ImagenResponse();
        for (Object po : respParts) {
            Map<String, Object> part = (Map<String, Object>) po;
            Map<String, Object> inline = (Map<String, Object>) part.get('inlineData');
            if (inline == null) {
                inline = (Map<String, Object>) part.get('inline_data');
            }
            if (inline != null) {
                result.base64Image = (String) inline.get('data');
                result.mimeType = (String) inline.get('mimeType');
                if (result.mimeType == null) {
                    result.mimeType = (String) inline.get('mime_type');
                }
                break;
            }
        }
        if (result.base64Image == null) {
            throw new CalloutException('Gemini image API returned no image part: ' + res.getBody());
        }
        return result;
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