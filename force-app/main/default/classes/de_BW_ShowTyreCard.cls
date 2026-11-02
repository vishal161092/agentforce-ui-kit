/**
 * Echo-style invocable for the "Brightwave Tyre Recommendation Card" Lightning type
 * (de_bwTyreRecommendationCard). `features` is a delimited string (pipe, comma or newline).
 */
public with sharing class de_BW_ShowTyreCard {

    public class Request {
        @InvocableVariable(label='Tyre Name' required=true)
        public String tyre_name;
        @InvocableVariable(label='Tyre Size')
        public String tyre_size;
        @InvocableVariable(label='Description')
        public String tyre_description;
        @InvocableVariable(label='Features' description='Pipe, comma or newline separated list')
        public String features;
        @InvocableVariable(label='Image URL')
        public String image_url;
        @InvocableVariable(label='Product URL')
        public String product_url;
    }

    @JsonAccess(serializable='always' deserializable='always')
    public class TyreCardResponse {
        @InvocableVariable @AuraEnabled public String tyreName;
        @InvocableVariable @AuraEnabled public String tyreSize;
        @InvocableVariable @AuraEnabled public String tyreDescription;
        @InvocableVariable @AuraEnabled public String features;
        @InvocableVariable @AuraEnabled public String imageUrl;
        @InvocableVariable @AuraEnabled public String productUrl;
    }

    @InvocableMethod(
        label='Show Tyre Card'
        description='Returns a tyre recommendation for the de_bwTyreRecommendationCard Lightning type.'
    )
    public static List<TyreCardResponse> showTyreCard(List<Request> requests) {
        List<TyreCardResponse> out = new List<TyreCardResponse>();
        if (requests == null) {
            return out;
        }
        for (Request r : requests) {
            TyreCardResponse resp = new TyreCardResponse();
            resp.tyreName = r.tyre_name;
            resp.tyreSize = r.tyre_size;
            resp.tyreDescription = r.tyre_description;
            resp.features = r.features;
            resp.imageUrl = r.image_url;
            resp.productUrl = r.product_url;
            out.add(resp);
        }
        return out;
    }
}
