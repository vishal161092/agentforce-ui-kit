/**
 * @description Lightning Type backing class for DE ASA Carousel
 * Holds product carousel data as JSON string
 */
@JsonAccess(serializable='always' deserializable='always')
global class de_AsaCarouselData {

    @AuraEnabled
    global String productCarouselJSON;

    global de_AsaCarouselData(String productCarouselJSON) {
        this.productCarouselJSON = productCarouselJSON;
    }

    global de_AsaCarouselData() {
        this.productCarouselJSON = '';
    }
}
