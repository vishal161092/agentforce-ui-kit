global class de_DealerAddressAction {

    global class Input {
        @InvocableVariable(required=false description='Optional heading text')
        global String heading;
    }

    @InvocableMethod(
        label='Get Dealer Address'
        description='Returns nearby dealer addresses with map links for de_dealer_address lightning type.'
    )
    global static List<de_DealerAddressResponse> getDealerAddress(List<Input> inputs) {
        List<de_DealerAddressResponse> outputList = new List<de_DealerAddressResponse>();
        if (inputs == null || inputs.isEmpty()) {
            outputList.add(buildResponse(null));
            return outputList;
        }

        for (Input inp : inputs) {
            outputList.add(buildResponse(inp));
        }

        return outputList;
    }

    private static de_DealerAddressResponse buildResponse(Input inp) {
        de_DealerAddressInfo info = new de_DealerAddressInfo();
        info.heading = (inp != null && !String.isBlank(inp.heading))
            ? inp.heading
            : 'Dealers Near You';

        info.dealers = new List<de_DealerAddressItem>();

        de_DealerAddressItem dealer1 = new de_DealerAddressItem();
        dealer1.name = 'Harbor Tyre Centre';
        dealer1.category = '2 Wheeler';
        dealer1.address = '12 Example Street, Springfield, 00001';
        dealer1.mapsUrl = 'https://maps.example.com/?q=harbor-tyre-centre';
        info.dealers.add(dealer1);

        de_DealerAddressItem dealer2 = new de_DealerAddressItem();
        dealer2.name = 'Summit Wheels';
        dealer2.category = '2 Wheeler';
        dealer2.address = '48 Sample Avenue, Riverton, 00002';
        dealer2.mapsUrl = 'https://maps.example.com/?q=summit-wheels';
        info.dealers.add(dealer2);

        de_DealerAddressResponse resp = new de_DealerAddressResponse();
        resp.result = info;
        return resp;
    }
}
