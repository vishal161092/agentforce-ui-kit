/**
 * @description Lightning Type backing class for DE ASA Carousel Saree
 * Holds product carousel data as JSON string
 */
@JsonAccess(serializable='always' deserializable='always')
global class de_ASACarouselSareeData {

    @AuraEnabled
    global String productCarouselJSON;

    global de_ASACarouselSareeData(String productCarouselJSON) {
        this.productCarouselJSON = productCarouselJSON;
    }

    global de_ASACarouselSareeData() {
        this.productCarouselJSON = '';
    }
}
