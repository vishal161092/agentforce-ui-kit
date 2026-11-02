@JsonAccess(serializable='always' deserializable='always')
global class DeOptionsSelectionItemV3 {
    @AuraEnabled
    global String value;

    @AuraEnabled
    global String title;

    @AuraEnabled
    global String subtitle;

    @AuraEnabled
    global String imageUrl;

    public DeOptionsSelectionItemV3() {}
}
