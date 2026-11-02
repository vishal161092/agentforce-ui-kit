@JsonAccess(serializable='always' deserializable='always')
global class de_CustomerQueryInfo {

    @AuraEnabled
    global String queryJSON;

    global de_CustomerQueryInfo(String queryJSON) {
        this.queryJSON = queryJSON;
    }

    global de_CustomerQueryInfo() {
        this.queryJSON = '';
    }
}
