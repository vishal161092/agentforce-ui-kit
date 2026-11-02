public with sharing class de_ProductComparisonInvocable {
    private static final String MODEL_NAME = 'llmgateway__OpenAIGPT4Omni';

    public class Request {
        @InvocableVariable(
            label='Product IDs'
            description='JSON string input. Example: ["Harrier","Safari"] or {"product_ids":["Harrier","Safari"]}.'
        )
        public String product_ids;
    }

    public class Response {
        @InvocableVariable(
            label='DE Product Comparison'
            description='Output payload for de_product_comparison custom Lightning type renderer.'
        )
        public de_ProductComparisonData deProductComparison;
    }

    @InvocableMethod(
        label='Get DE Product Comparison'
        description='Returns selected product comparison payload for de_product_comparison Lightning type.'
    )
    public static List<Response> getProductComparison(List<Request> requests) {
        List<Response> results = new List<Response>();
        if (requests == null || requests.isEmpty()) {
            results.add(wrap(buildPayloadFromAI(new List<String>())));
            return results;
        }

        for (Request req : requests) {
            List<String> productIds = parseProductIds(req == null ? null : req.product_ids);
            results.add(wrap(buildPayloadFromAI(productIds)));
        }
        return results;
    }

    private static Response wrap(String payload) {
        Response res = new Response();
        de_ProductComparisonData data = new de_ProductComparisonData();
        data.comparisonResultJSON = payload;
        res.deProductComparison = data;
        return res;
    }

    private static String buildPayloadFromAI(List<String> requestedProductIds) {
        List<String> effectiveIds = new List<String>();
        for (String name : requestedProductIds) {
            if (String.isNotBlank(name)) {
                effectiveIds.add(name.trim());
            }
        }
        if (effectiveIds.isEmpty()) {
            effectiveIds.add('Brightwave Aero');
            effectiveIds.add('Brightwave Curve');
        }

        String prompt = buildPrompt(effectiveIds);
        String aiText = callLLMApi(prompt);
        String normalized = normalizeModelOutput(aiText);
        String validJson = ensureValidComparisonJson(normalized, effectiveIds);
        if (validJson != null) {
            return validJson;
        }
        return buildFallbackPayload(effectiveIds);
    }

    private static List<String> parseProductIds(String rawInput) {
        if (String.isBlank(rawInput)) {
            return new List<String>();
        }

        String input = rawInput.trim();
        try {
            if (input.startsWith('{')) {
                Map<String, Object> root = (Map<String, Object>) JSON.deserializeUntyped(input);
                Object arr = root.get('product_ids');
                return toStringList(arr);
            }
            if (input.startsWith('[')) {
                Object arr = JSON.deserializeUntyped(input);
                return toStringList(arr);
            }
        } catch (Exception ignoreParseException) {
            // Fallback below handles comma-separated values.
        }

        List<String> csv = new List<String>();
        for (String token : input.split(',')) {
            if (String.isNotBlank(token)) {
                csv.add(token.trim());
            }
        }
        return csv;
    }

    private static List<String> toStringList(Object value) {
        List<String> out = new List<String>();
        if (!(value instanceof List<Object>)) {
            return out;
        }

        for (Object item : (List<Object>) value) {
            if (item != null) {
                out.add(String.valueOf(item));
            }
        }
        return out;
    }

    private static String buildPrompt(List<String> productNames) {
        Date today = Date.today();
        String requestedCars = String.join(productNames, ', ');
        return 'You are a car product comparison engine for Brightwave Motors use cases.\n\n'
            + 'Generate ONLY valid JSON using this exact shape:\n'
            + '{'
            + '"comparison_result": {'
            + '"products": ['
            + '{'
            + '"id": "short-id",'
            + '"name": "Full product name",'
            + '"engine": "text",'
            + '"power": "text",'
            + '"torque": "text",'
            + '"transmission": "text",'
            + '"fuel_efficiency": "text",'
            + '"seating_capacity": 5,'
            + '"launch_date": "YYYY-MM-DD",'
            + '"safety_features": ["feature1", "feature2", "feature3"]'
            + '}'
            + ']'
            + '}'
            + '}\n\n'
            + 'Requested car products to compare: ' + requestedCars + '.\n'
            + 'Rules:\n'
            + '- Include one product object for each requested car.\n'
            + '- Keep values realistic and coherent for the specified models.\n'
            + '- Keep launch_date reasonable around and after ' + String.valueOf(today) + '.\n'
            + '- Never add markdown, code fences, explanations, or extra keys.\n'
            + '- Output must be parseable JSON only.';
    }

    private static String callLLMApi(String prompt) {
        aiplatform.ModelsAPI.createGenerations_Request request = new aiplatform.ModelsAPI.createGenerations_Request();
        request.modelName = MODEL_NAME;

        aiplatform.ModelsAPI_GenerationRequest requestBody = new aiplatform.ModelsAPI_GenerationRequest();
        requestBody.prompt = prompt;
        request.body = requestBody;

        try {
            aiplatform.ModelsAPI modelsAPI = new aiplatform.ModelsAPI();
            aiplatform.ModelsAPI.createGenerations_Response response = modelsAPI.createGenerations(request);
            return response.Code200.generation.generatedText;
        } catch (Exception e) {
            System.debug('de_ProductComparisonInvocable AI call failed: ' + e.getMessage());
            return null;
        }
    }

    private static String normalizeModelOutput(String rawText) {
        if (String.isBlank(rawText)) {
            return null;
        }

        String output = rawText.trim();
        output = output.replace('```json', '');
        output = output.replace('```', '');
        output = output.trim();
        return output;
    }

    private static String ensureValidComparisonJson(String candidateJson, List<String> fallbackNames) {
        if (String.isBlank(candidateJson)) {
            return null;
        }

        try {
            Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(candidateJson);
            if (!parsed.containsKey('comparison_result')) {
                return null;
            }
            Map<String, Object> result = (Map<String, Object>) parsed.get('comparison_result');
            if (result == null || !(result.get('products') instanceof List<Object>)) {
                return null;
            }

            List<Object> products = (List<Object>) result.get('products');
            if (products.isEmpty()) {
                return null;
            }

            return JSON.serialize(parsed);
        } catch (Exception e) {
            System.debug('de_ProductComparisonInvocable JSON validation failed: ' + e.getMessage());
            return null;
        }
    }

    private static String buildFallbackPayload(List<String> names) {
        List<Map<String, Object>> products = new List<Map<String, Object>>();
        for (String rawName : names) {
            String cleanName = String.isBlank(rawName) ? 'Unknown Product' : rawName.trim();
            String id = cleanName.replace('Brightwave ', '').replace('brightwave ', '').replace(' ', '');
            products.add(new Map<String, Object>{
                'id' => id,
                'name' => cleanName,
                'engine' => 'Data unavailable',
                'power' => 'Data unavailable',
                'torque' => 'Data unavailable',
                'transmission' => 'Data unavailable',
                'fuel_efficiency' => 'Data unavailable',
                'seating_capacity' => 0,
                'launch_date' => String.valueOf(Date.today()),
                'safety_features' => new List<String>{
                    'Information unavailable from model response'
                }
            });
        }

        return JSON.serialize(new Map<String, Object>{
            'comparison_result' => new Map<String, Object>{
                'products' => products
            }
        });
    }
}
