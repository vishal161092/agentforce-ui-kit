@JsonAccess(serializable='always' deserializable='always')
global class DeHtmlEmployeeAgentInfo {
    @AuraEnabled
    global String aiRecommendationTitle;
    @AuraEnabled
    global String aiRecommendationBody;

    @AuraEnabled
    global String leftProductName;
    @AuraEnabled
    global Decimal leftConversionPercent;
    @AuraEnabled
    global Integer leftDealCycleDays;

    @AuraEnabled
    global String rightProductName;
    @AuraEnabled
    global Decimal rightConversionPercent;
    @AuraEnabled
    global Integer rightDealCycleDays;

    @AuraEnabled
    global String insightLeftTitle;
    @AuraEnabled
    global String insightLeftBody;
    @AuraEnabled
    global String insightRightTitle;
    @AuraEnabled
    global String insightRightBody;

    @AuraEnabled
    global String footerTitle;
    @AuraEnabled
    global String footerBody;
    @AuraEnabled
    global String footerButtonLabel;

    public DeHtmlEmployeeAgentInfo() {}
}
