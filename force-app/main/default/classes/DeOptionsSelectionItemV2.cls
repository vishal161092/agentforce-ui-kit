@JsonAccess(serializable='always' deserializable='always')
global class DeOptionsSelectionItemV2 {
    @AuraEnabled
    global String value;

    @AuraEnabled
    global String title;

    @AuraEnabled
    global String subtitle;

    @AuraEnabled
    global String iconName;

    // Optional. When set, the card renders as a clickable link that opens this
    // URL in a new tab instead of sending its value back into the conversation.
    @AuraEnabled
    global String url;

    public DeOptionsSelectionItemV2() {}
}
