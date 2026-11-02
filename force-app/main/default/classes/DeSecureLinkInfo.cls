@JsonAccess(serializable='always' deserializable='always')
global class DeSecureLinkInfo {
    @AuraEnabled
    global String title;

    @AuraEnabled
    global String url;

    @AuraEnabled
    global String buttonLabel;

    @AuraEnabled
    global String note;

    @AuraEnabled
    global String iconName;

    public DeSecureLinkInfo() {}
}
