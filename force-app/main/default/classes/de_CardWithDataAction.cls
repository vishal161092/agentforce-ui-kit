global class de_CardWithDataAction {

    global class Input {
        @InvocableVariable(required=false description='Product key e.g. "zenova_street_z1"')
        global String productKey;
    }

    @InvocableMethod(
        label='Get Card With Data'
        description='Returns a product detail card with image, description, size, and features for de_card_with_data lightning type.'
    )
    global static List<de_CardWithDataResponse> getCardWithData(List<Input> inputs) {
        List<de_CardWithDataResponse> outputList = new List<de_CardWithDataResponse>();
        if (inputs == null || inputs.isEmpty()) {
            outputList.add(buildResponse(null));
            return outputList;
        }

        for (Input inp : inputs) {
            outputList.add(buildResponse(inp));
        }

        return outputList;
    }

    private static de_CardWithDataResponse buildResponse(Input inp) {
        de_CardWithDataInfo info = new de_CardWithDataInfo();

        info.productName = 'Zenova Street Z1';
        info.productDescription = 'Built for durability, the Zenova Street Z1 provides strong traction over long distances while maintaining consistent performance. Its comfort-focused construction smooths out bumps and vibrations, ensuring a more comfortable and enjoyable ride every day.';
        info.imageUrl = 'bwWheelImg';
        info.tyreSize = '90/90 - 12';
        info.features = new List<String>{
            'Long tread life',
            'Optimized traction and mileage',
            'Balanced wet and dry braking during cornering'
        };
        info.ctaLabel = 'View Product Details';
        info.ctaUrl = 'https://example.com/products/zenova-street-z1/';

        de_CardWithDataResponse resp = new de_CardWithDataResponse();
        resp.result = info;
        return resp;
    }
}
