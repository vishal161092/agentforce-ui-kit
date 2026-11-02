@JsonAccess(serializable='always' deserializable='always')
global class de_VirtualTryOnCreativeInfo {
    @AuraEnabled
    global String prompt;

    @AuraEnabled
    global String personImageBase64;

    @AuraEnabled
    global String productImageBase64;

    @AuraEnabled
    global String productImageUrl;

    global de_VirtualTryOnCreativeInfo() {}
}
