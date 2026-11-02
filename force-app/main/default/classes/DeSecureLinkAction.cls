global class DeSecureLinkAction {

    global class Input {
        // Optional gift-card name (e.g. "Ember Gift Card") so the card
        // header reads naturally. Defaults to a generic label when blank.
        @InvocableVariable(required=false)
        global String cardName;
    }

    @InvocableMethod(
        label='Generate Secure Gift Card Link'
        description='Returns a displayable secure one-time gift-card link as a clickable card (de_OptionsSelection_v2 Lightning Type)'
    )
    global static List<DeOptionsSelectionResponseV2> generateSecureLink(List<Input> inputs) {
        Input inp = (inputs != null && !inputs.isEmpty()) ? inputs[0] : null;

        String cardName = (inp != null && !String.isBlank(inp.cardName))
            ? inp.cardName.trim()
            : 'Gift Card';

        // Mock secure one-time link for the demo. Delivered as a displayable
        // card whose url opens directly; your link host must be a Trusted URL,
        // so it is not redacted and renders as a real clickable link.
        String link = 'https://example.com/redeem/ot/SAMPLE-LINK';

        DeOptionsSelectionItemV2 card = new DeOptionsSelectionItemV2();
        card.value = 'Open Gift Card';
        card.title = 'Open your ' + cardName;
        card.subtitle = link;
        card.iconName = 'utility:link';
        card.url = link;

        DeOptionsSelectionInfoV2 info = new DeOptionsSelectionInfoV2();
        info.questionLabel = 'Your secure, one-time link to the ' + cardName;
        info.optionCards = new List<DeOptionsSelectionItemV2>{ card };

        DeOptionsSelectionResponseV2 resp = new DeOptionsSelectionResponseV2();
        resp.result = info;

        return new List<DeOptionsSelectionResponseV2>{ resp };
    }
}
