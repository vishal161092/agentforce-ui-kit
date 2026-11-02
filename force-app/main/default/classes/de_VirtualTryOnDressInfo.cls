@JsonAccess(serializable='always' deserializable='always')
global class de_VirtualTryOnDressInfo {
    @AuraEnabled
    global String productImageUrl;

    @AuraEnabled
    global String personImageBase64;

    global de_VirtualTryOnDressInfo() {}
}
