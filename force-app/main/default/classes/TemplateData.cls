@JsonAccess(serializable='always' deserializable='always')
global class TemplateData {
    @AuraEnabled
    global String templateId;
}