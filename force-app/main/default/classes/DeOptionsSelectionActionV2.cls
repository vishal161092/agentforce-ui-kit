global class DeOptionsSelectionActionV2 {

    global class Input {
        @InvocableVariable(required=false)
        global String questionLabel;

        @InvocableVariable(required=false)
        global List<String> options;
    }

    @InvocableMethod(
        label='Get Options Selection V2'
        description='Returns card-style selectable options for de_OptionsSelection_v2 LightningType'
    )
    global static List<DeOptionsSelectionResponseV2> getOptionsSelection(List<Input> inputs) {
        List<DeOptionsSelectionResponseV2> outputList = new List<DeOptionsSelectionResponseV2>();
        if (inputs == null || inputs.isEmpty()) {
            outputList.add(buildResponse(null));
            return outputList;
        }

        for (Input inp : inputs) {
            outputList.add(buildResponse(inp));
        }

        return outputList;
    }

    private static DeOptionsSelectionResponseV2 buildResponse(Input inp) {
        DeOptionsSelectionInfoV2 info = new DeOptionsSelectionInfoV2();
        info.questionLabel = (inp != null && !String.isBlank(inp.questionLabel))
            ? inp.questionLabel
            : 'When is the celebration?';

        // Gift-card topic options are fixed for this demo so the rendered choices and
        // their icons are deterministic regardless of any options passed by the planner.
        List<String> sourceOptions = new List<String>{
            'I\'m looking to buy a gift card',
            'I placed an order and need assistance',
            'I received a gift card and I need help'
        };

        info.options = sourceOptions;
        info.optionCards = buildCards(sourceOptions);

        DeOptionsSelectionResponseV2 resp = new DeOptionsSelectionResponseV2();
        resp.result = info;
        return resp;
    }

    private static List<DeOptionsSelectionItemV2> buildCards(List<String> sourceOptions) {
        List<DeOptionsSelectionItemV2> cards = new List<DeOptionsSelectionItemV2>();
        for (String option : sourceOptions) {
            String normalized = option != null ? option.trim().toLowerCase() : '';
            DeOptionsSelectionItemV2 card = new DeOptionsSelectionItemV2();
            card.value = option;
            card.title = option;
            card.subtitle = '';
            card.iconName = 'utility:choice';

            if (normalized == 'morning vows') {
                card.subtitle = 'Pastels, polki, and ethereal elegance';
            } else if (normalized == 'sundowner ceremony') {
                card.subtitle = 'Golden hues and champagne diamonds';
            } else if (normalized == 'evening reception') {
                card.subtitle = 'Majestic gold and deep rubies';
            } else if (normalized == 'i\'m looking to buy a gift card') {
                card.iconName = 'utility:card_details';
            } else if (normalized == 'i placed an order and need assistance') {
                card.iconName = 'utility:fulfillment_order';
            } else if (normalized == 'i received a gift card and i need help') {
                card.iconName = 'utility:workforce_engagement';
            }

            cards.add(card);
        }
        return cards;
    }
}
