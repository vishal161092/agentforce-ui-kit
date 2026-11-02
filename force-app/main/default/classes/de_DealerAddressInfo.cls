@JsonAccess(serializable='always' deserializable='always')
global class de_DealerAddressInfo {
    @AuraEnabled
    global String heading;

    @AuraEnabled
    global List<de_DealerAddressItem> dealers;

    public de_DealerAddressInfo() {}
}
