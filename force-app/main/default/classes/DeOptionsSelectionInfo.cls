@JsonAccess(serializable='always' deserializable='always')
global class DeOptionsSelectionInfo {
    @AuraEnabled
    global String questionLabel;

    @AuraEnabled
    global List<String> options;

    // Default Constructor
    public DeOptionsSelectionInfo() {}
}