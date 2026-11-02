@JsonAccess(serializable='always' deserializable='always')
global class de_YesNoDealerInfo {
    @AuraEnabled
    global String questionLabel;

    @AuraEnabled
    global String yesMessage;

    @AuraEnabled
    global String noMessage;

    public de_YesNoDealerInfo() {}
}
