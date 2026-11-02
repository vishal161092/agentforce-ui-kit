@JsonAccess(serializable='always' deserializable='always')
global class DeStringOutputInfo {
    @AuraEnabled
    global String outputString;

    // Default Constructor
    public DeStringOutputInfo() {}
}
