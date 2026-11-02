public class de_GoogleAuthService {

    private static final String TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
    private static final String SCOPE = 'https://www.googleapis.com/auth/cloud-platform';

    public static String getAccessToken() {
        Map<String, Object> saKey = getServiceAccountKey();
        String clientEmail = (String) saKey.get('client_email');
        String privateKeyPem = (String) saKey.get('private_key');
        String jwt = buildJwt(clientEmail, privateKeyPem);
        return exchangeJwtForToken(jwt);
    }

    public static String getProjectId() {
        Map<String, Object> saKey = getServiceAccountKey();
        return (String) saKey.get('project_id');
    }

    /**
     * Service-account credentials come from the protected custom metadata record
     * Google_Service_Account__mdt.Default (fields Client_Email__c, Private_Key__c, Project_Id__c).
     * Nothing is committed to source control: fill the record in Setup after deploying.
     */
    private static Map<String, Object> getServiceAccountKey() {
        Google_Service_Account__mdt cfg = Google_Service_Account__mdt.getInstance('Default');
        if (cfg == null || String.isBlank(cfg.Private_Key__c) || cfg.Private_Key__c == 'REPLACE_ME') {
            throw new CalloutException(
                'Google service account is not configured. Edit Custom Metadata "Google Service Account" > Default.'
            );
        }
        return new Map<String, Object>{
            'client_email' => cfg.Client_Email__c,
            'private_key' => cfg.Private_Key__c,
            'project_id' => cfg.Project_Id__c
        };
    }

    private static String buildJwt(String clientEmail, String privateKeyPem) {
        Long now = DateTime.now().getTime() / 1000;
        Long exp = now + 3600;

        String header = base64UrlEncode(Blob.valueOf('{"alg":"RS256","typ":"JWT"}'));

        JSONGenerator claimsGen = JSON.createGenerator(false);
        claimsGen.writeStartObject();
        claimsGen.writeStringField('iss', clientEmail);
        claimsGen.writeStringField('scope', SCOPE);
        claimsGen.writeStringField('aud', TOKEN_ENDPOINT);
        claimsGen.writeNumberField('iat', now);
        claimsGen.writeNumberField('exp', exp);
        claimsGen.writeEndObject();
        String claims = base64UrlEncode(Blob.valueOf(claimsGen.getAsString()));

        String signingInput = header + '.' + claims;
        String signature = base64UrlEncode(
            Crypto.sign('RSA-SHA256', Blob.valueOf(signingInput), decodePemKey(privateKeyPem))
        );

        return signingInput + '.' + signature;
    }

    private static String exchangeJwtForToken(String jwt) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(TOKEN_ENDPOINT);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.setBody('grant_type=' + EncodingUtil.urlEncode('urn:ietf:params:oauth:grant-type:jwt-bearer', 'UTF-8')
            + '&assertion=' + jwt);

        HttpResponse res = new Http().send(req);
        if (res.getStatusCode() != 200) {
            throw new CalloutException('Google OAuth failed: ' + res.getBody());
        }

        Map<String, Object> tokenResponse = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        return (String) tokenResponse.get('access_token');
    }

    private static Blob decodePemKey(String pemKey) {
        pemKey = pemKey.replace('-----BEGIN PRIVATE KEY-----', '')
                       .replace('-----END PRIVATE KEY-----', '')
                       .replace('\\n', '')
                       .replace('\n', '')
                       .replace('\r', '')
                       .replace(' ', '')
                       .trim();
        return EncodingUtil.base64Decode(pemKey);
    }

    private static String base64UrlEncode(Blob input) {
        return EncodingUtil.base64Encode(input)
            .replace('+', '-')
            .replace('/', '_')
            .replace('=', '');
    }
}