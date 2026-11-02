@JsonAccess(serializable='always' deserializable='always')
global class de_CardWithDataInfo {
    @AuraEnabled
    global String productName;

    @AuraEnabled
    global String productDescription;

    @AuraEnabled
    global String imageUrl;

    @AuraEnabled
    global String tyreSize;

    @AuraEnabled
    global List<String> features;

    @AuraEnabled
    global String ctaLabel;

    @AuraEnabled
    global String ctaUrl;

    public de_CardWithDataInfo() {}
}
