@JsonAccess(serializable='always' deserializable='always')
global class de_ServReqInfo {
    @AuraEnabled
    global String promptLabel;

    @AuraEnabled
    global List<String> options;

    public de_ServReqInfo() {}
}
