/**
 * Echo-style invocable for the "Brightwave Dealer Card" Lightning type (de_bwDealerCard).
 * The agent (or a flow) passes the dealer details; this action returns them in the shape the
 * renderer LWC expects.
 */
public with sharing class de_BW_ShowDealerCards {

    public class Request {
        @InvocableVariable(label='Dealer Name' required=true)
        public String dealer_name;
        @InvocableVariable(label='Dealer Type' description='e.g. 2 Wheeler, Car, Truck')
        public String dealer_type;
        @InvocableVariable(label='Address')
        public String address;
        @InvocableVariable(label='Maps Link' description='URL that opens the dealer location in a map')
        public String maps_link;
        @InvocableVariable(label='Phone')
        public String phone;
    }

    @JsonAccess(serializable='always' deserializable='always')
    public class DealerCardResponse {
        @InvocableVariable @AuraEnabled public String dealerName;
        @InvocableVariable @AuraEnabled public String dealerType;
        @InvocableVariable @AuraEnabled public String address;
        @InvocableVariable @AuraEnabled public String mapsLink;
        @InvocableVariable @AuraEnabled public String phone;
    }

    @InvocableMethod(
        label='Show Dealer Card'
        description='Returns dealer details for the de_bwDealerCard Lightning type.'
    )
    public static List<DealerCardResponse> showDealerCards(List<Request> requests) {
        List<DealerCardResponse> out = new List<DealerCardResponse>();
        if (requests == null) {
            return out;
        }
        for (Request r : requests) {
            DealerCardResponse resp = new DealerCardResponse();
            resp.dealerName = r.dealer_name;
            resp.dealerType = r.dealer_type;
            resp.address = r.address;
            resp.mapsLink = r.maps_link;
            resp.phone = r.phone;
            out.add(resp);
        }
        return out;
    }
}
