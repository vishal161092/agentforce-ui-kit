@JsonAccess(serializable='always' deserializable='always')
global class FileUploadInfo {
    @AuraEnabled
    global String targetRecordId;

    // Default Constructor
    public FileUploadInfo() {}
}