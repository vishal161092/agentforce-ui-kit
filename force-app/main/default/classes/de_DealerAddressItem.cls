@JsonAccess(serializable='always' deserializable='always')
global class de_DealerAddressItem {
    @AuraEnabled
    global String name;

    @AuraEnabled
    global String category;

    @AuraEnabled
    global String address;

    @AuraEnabled
    global String mapsUrl;

    public de_DealerAddressItem() {}
}
