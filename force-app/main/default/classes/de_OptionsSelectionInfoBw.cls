@JsonAccess(serializable='always' deserializable='always')
global class de_OptionsSelectionInfoBw {
    @AuraEnabled
    global String questionLabel;

    @AuraEnabled
    global List<de_OptionsSelectionItemBw> optionCards;

    @AuraEnabled
    global List<String> options;

    public de_OptionsSelectionInfoBw() {}
}
