global class DeDeliveryResolutionAction {

    global class Input {
        @InvocableVariable(required=false)
        global String questionLabel;
    }

    @InvocableMethod(
        label='Get Delivery Resolution Options'
        description='Returns the two fixed resolution options (resend / secure link) as de_OptionsSelection_v2 cards'
    )
    global static List<DeOptionsSelectionResponseV2> getResolutionOptions(List<Input> inputs) {
        List<DeOptionsSelectionResponseV2> outputList = new List<DeOptionsSelectionResponseV2>();
        Input inp = (inputs != null && !inputs.isEmpty()) ? inputs[0] : null;
        outputList.add(buildResponse(inp));
        return outputList;
    }

    private static DeOptionsSelectionResponseV2 buildResponse(Input inp) {
        DeOptionsSelectionInfoV2 info = new DeOptionsSelectionInfoV2();
        info.questionLabel = (inp != null && !String.isBlank(inp.questionLabel))
            ? inp.questionLabel
            : 'Which option would you prefer?';

        // The two delivery-resolution options are fixed for this demo so the
        // rendered choices and icons stay deterministic. The card value IS the
        // text sent back to the agent when the customer selects it.
        DeOptionsSelectionItemV2 resend = new DeOptionsSelectionItemV2();
        resend.value = 'Resend to a corrected email address';
        resend.title = 'Resend to a corrected email address';
        resend.subtitle = 'Send the gift card to a different email';
        resend.iconName = 'utility:email';

        DeOptionsSelectionItemV2 link = new DeOptionsSelectionItemV2();
        link.value = 'Generate a secure one-time link';
        link.title = 'Generate a secure one-time link';
        link.subtitle = 'Get a link to share with the recipient directly';
        link.iconName = 'utility:link';

        info.optionCards = new List<DeOptionsSelectionItemV2>{ resend, link };
        info.options = new List<String>{ resend.value, link.value };

        DeOptionsSelectionResponseV2 resp = new DeOptionsSelectionResponseV2();
        resp.result = info;
        return resp;
    }
}
