global with sharing class HolidayGreetingGenerator {
    @InvocableMethod(label='Generate Holiday Greeting Image' description='Calls external service to create an Image and returns the URL')
    global static List<ImageResponse> generateImage(List<ImageRequest> requests) {
        List<ImageResponse> responses = new List<ImageResponse>();

        for (ImageRequest req : requests) {
            // Logic to call your existing service
            String templateId = (req.templateData != null && String.isNotBlank(req.templateData.templateId)) 
                ? req.templateData.templateId 
                : 'template1';
            ImageResponse response = callExternalImageService(req.recipientName, req.holidayMessage, templateId, req.fromName);
            responses.add(response);
        }
        return responses;
    }

    @JsonAccess(serializable='always' deserializable='always')
    global class ImageRequest {
        @InvocableVariable(label='Recipient Name' description='Name of the recipient for the holiday greeting' required=true)
        global String recipientName;
        
        @InvocableVariable(label='Generated Message' description='The holiday greeting message to be included in the Image. Always confirm the message with the user.' required=true)
        global String holidayMessage;
        
        
        @InvocableVariable(label='Template ID' description='Template ID to use for Image generation. Always ask to choose the template' required=true)
        global TemplateData templateData;
        
        @InvocableVariable(label='From Name' description='Name of the sender for the holiday greeting' required=true)
        global String fromName;
    }

    @JsonAccess(serializable='always' deserializable='always')
    global class ImageResponse {
        @InvocableVariable(label='Download URL' description='URL to download the generated Image')
        global String downloadUrl;
    }

    private static ImageResponse callExternalImageService(String name, String message, String templateId, String fromName) {
        ImageResponse ImageResponse = new ImageResponse();
        
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:Holiday_Greeting_Service/api/greeting/generate');
        request.setMethod('POST');
        request.setTimeout(120000);

        // Construct JSON body matching the HTTP callout structure
        Map<String, String> bodyMap = new Map<String, String>{
            'templateId' => templateId,
            'message' => message,
            'to' => name,
            'from' => fromName
        };
        request.setHeader('Content-Type', 'application/json');
        request.setBody(JSON.serialize(bodyMap));

        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            // Parse the JSON response
            // Expected format: {"success": true, "downloadUrl": "...", "templateId": "...", "messageLength": ...}
            String responseBody = response.getBody();
            try {
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
                
                // Check if the operation was successful
                Boolean success = (Boolean) responseMap.get('success');
                if (success == null || !success) {
                    throw new ImageGenerationException('Image generation failed: API returned success=false');
                }
                
                // Extract the downloadUrl
                if (responseMap.containsKey('downloadUrl')) {
                    ImageResponse.downloadUrl = (String) responseMap.get('downloadUrl');
                } else {
                    throw new ImageGenerationException('Image generation failed: downloadUrl not found in response');
                }
            } catch (ImageGenerationException e) {
                // Re-throw our custom exceptions
                throw e;
            } catch (Exception e) {
                // Handle JSON parsing errors
                throw new ImageGenerationException('Error parsing response: ' + e.getMessage() + ' - Response: ' + responseBody);
            }
        } else {
            throw new ImageGenerationException('Error generating Image: HTTP ' + response.getStatusCode() + ' - ' + response.getStatus() + ' - Response: ' + response.getBody());
        }
        
        return ImageResponse;
    }
}