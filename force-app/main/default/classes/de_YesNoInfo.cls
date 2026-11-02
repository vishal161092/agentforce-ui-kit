@JsonAccess(serializable='always' deserializable='always')
global class de_YesNoInfo {
    @AuraEnabled
    global String questionLabel;

    @AuraEnabled
    global String yesMessage;

    @AuraEnabled
    global String noMessage;

    public de_YesNoInfo() {}
}
