@JsonAccess(serializable='always' deserializable='always')
global class de_OptionsSelectionItemBw {
    @AuraEnabled
    global String value;

    @AuraEnabled
    global String title;

    @AuraEnabled
    global String subtitle;

    @AuraEnabled
    global String iconName;

    public de_OptionsSelectionItemBw() {}
}
