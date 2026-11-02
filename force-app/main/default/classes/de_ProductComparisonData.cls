@JsonAccess(serializable='always' deserializable='always')
global class de_ProductComparisonData {
    @AuraEnabled
    global String comparisonResultJSON;

    global de_ProductComparisonData() {
        this.comparisonResultJSON = '';
    }

    global de_ProductComparisonData(String comparisonResultJSON) {
        this.comparisonResultJSON = comparisonResultJSON;
    }
}
