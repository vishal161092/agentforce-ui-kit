global class de_OptionsSelectionActionBw {

    global class Input {
        @InvocableVariable(required=false)
        global String questionLabel;

        @InvocableVariable(required=false description='Pass a preset key: "suggestions", "primary_use", "two_wheeler_option" — or a comma-separated list of custom options.')
        global String optionsCsv;
    }

    @InvocableMethod(
        label='Get Options Selection Bw'
        description='Returns card-style selectable options. Pass a preset key or comma-separated string.'
    )
    global static List<de_OptionsSelectionResponseBw> getOptionsSelection(List<Input> inputs) {
        List<de_OptionsSelectionResponseBw> outputList = new List<de_OptionsSelectionResponseBw>();
        if (inputs == null || inputs.isEmpty()) {
            outputList.add(buildResponse(null));
            return outputList;
        }

        for (Input inp : inputs) {
            outputList.add(buildResponse(inp));
        }

        return outputList;
    }

    private static de_OptionsSelectionResponseBw buildResponse(Input inp) {
        de_OptionsSelectionInfoBw info = new de_OptionsSelectionInfoBw();
        info.questionLabel = (inp != null && !String.isBlank(inp.questionLabel))
            ? inp.questionLabel
            : 'Please select an option';

        List<de_OptionsSelectionItemBw> cards = new List<de_OptionsSelectionItemBw>();

        String input = (inp != null && !String.isBlank(inp.optionsCsv)) ? inp.optionsCsv.trim().toLowerCase() : '';

        if (input == 'suggestions') {
            cards.add(buildCard('Find the Right Tyre for Me', 'bwIconTyre'));
            cards.add(buildCard('Find a Dealer Near Me', 'bwIconDealer'));
            cards.add(buildCard('Warranty Assistance', 'bwIconWarranty'));
            cards.add(buildCard('Other Options', 'bwIconOther'));
        } else if (input == 'primary_use') {
            cards.add(buildCard('City Driving', 'bwIconCity'));
            cards.add(buildCard('Highway Driving', 'bwIconHighway'));
            cards.add(buildCard('Off-Road', 'bwIconMountain'));
        } else if (input == 'two_wheeler_option') {
            cards.add(buildCard('Scooter', 'bwIconScooter'));
            cards.add(buildCard('Motorcycle', 'bwIconMotorcycle'));
        } else if (!String.isBlank(input)) {
            for (String opt : input.split(',')) {
                String trimmed = opt.trim();
                if (!String.isBlank(trimmed)) {
                    cards.add(buildCard(trimmed, matchIcon(trimmed)));
                }
            }
        }

        if (cards.isEmpty()) {
            cards.add(buildCard('Option A', 'utility:chevronright'));
            cards.add(buildCard('Option B', 'utility:chevronright'));
            cards.add(buildCard('Option C', 'utility:chevronright'));
        }

        info.optionCards = cards;

        List<String> options = new List<String>();
        for (de_OptionsSelectionItemBw card : cards) {
            options.add(card.value);
        }
        info.options = options;

        de_OptionsSelectionResponseBw resp = new de_OptionsSelectionResponseBw();
        resp.result = info;
        return resp;
    }

    private static String matchIcon(String title) {
        String lower = title.toLowerCase();
        if (lower.contains('tyre') || lower.contains('tire')) {
            return 'bwIconTyre';
        } else if (lower.contains('dealer') || lower.contains('store') || lower.contains('shop')) {
            return 'bwIconDealer';
        } else if (lower.contains('warranty') || lower.contains('guarantee')) {
            return 'bwIconWarranty';
        } else if (lower.contains('city') || lower.contains('commut') || lower.contains('urban')) {
            return 'bwIconCity';
        } else if (lower.contains('highway') || lower.contains('touring') || lower.contains('road')) {
            return 'bwIconHighway';
        } else if (lower.contains('off-road') || lower.contains('offroad') || lower.contains('mountain') || lower.contains('terrain')) {
            return 'bwIconMountain';
        } else if (lower.contains('scooter')) {
            return 'bwIconScooter';
        } else if (lower.contains('motorcycle') || lower.contains('bike') || lower.contains('racing')) {
            return 'bwIconMotorcycle';
        }
        return 'bwIconOther';
    }

    private static de_OptionsSelectionItemBw buildCard(String title, String iconName) {
        de_OptionsSelectionItemBw card = new de_OptionsSelectionItemBw();
        card.value = title;
        card.title = title;
        card.subtitle = '';
        card.iconName = iconName;
        return card;
    }
}
