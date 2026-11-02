@JsonAccess(serializable='always' deserializable='always')
global class de_EmployeeActionSelectorInfo {
    @AuraEnabled
    global String promptLabel;

    @AuraEnabled
    global List<String> options;

    @AuraEnabled
    global String selectedValue;

    public de_EmployeeActionSelectorInfo() {}
}
