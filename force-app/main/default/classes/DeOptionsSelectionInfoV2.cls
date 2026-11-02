@JsonAccess(serializable='always' deserializable='always')
global class DeOptionsSelectionInfoV2 {
    @AuraEnabled
    global String questionLabel;

    @AuraEnabled
    global List<DeOptionsSelectionItemV2> optionCards;

    @AuraEnabled
    global List<String> options;

    public DeOptionsSelectionInfoV2() {}
}
