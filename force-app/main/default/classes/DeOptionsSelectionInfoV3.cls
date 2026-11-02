@JsonAccess(serializable='always' deserializable='always')
global class DeOptionsSelectionInfoV3 {
    @AuraEnabled
    global String questionLabel;

    @AuraEnabled
    global List<DeOptionsSelectionItemV3> optionCards;

    @AuraEnabled
    global DeOptionsSelectionItemV3 recommendedCard;

    @AuraEnabled
    global String selectedForLabel;

    @AuraEnabled
    global String ctaLabel;

    public DeOptionsSelectionInfoV3() {}
}
