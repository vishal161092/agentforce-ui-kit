global class DeOptionsSelectionActionV3 {

    global class Input {
        @InvocableVariable(required=false)
        global String questionLabel;
    }

    @InvocableMethod(
        label='Get Options Selection V3'
        description='Returns north/south necklace selection cards and recommended look for de_OptionsSelection_v3'
    )
    global static List<DeOptionsSelectionResponseV3> getOptionsSelection(List<Input> inputs) {
        List<DeOptionsSelectionResponseV3> outputList = new List<DeOptionsSelectionResponseV3>();
        if (inputs == null || inputs.isEmpty()) {
            outputList.add(buildResponse(null));
            return outputList;
        }

        for (Input inp : inputs) {
            outputList.add(buildResponse(inp));
        }

        return outputList;
    }

    private static DeOptionsSelectionResponseV3 buildResponse(Input inp) {
        DeOptionsSelectionInfoV3 info = new DeOptionsSelectionInfoV3();
        info.questionLabel = (inp != null && !String.isBlank(inp.questionLabel))
            ? inp.questionLabel
            : 'Cultural Heritage Roots';

        info.selectedForLabel = 'Selected for:';
        info.ctaLabel = 'Shop This Look';
        info.optionCards = new List<DeOptionsSelectionItemV3>();

        info.optionCards.add(buildItem(
            'north',
            'North Indian',
            'Majestic Kundan',
            'https://YOUR-SITE-DOMAIN.my.site.com/resource/North_Indian_Necklace'
        ));
        info.optionCards.add(buildItem(
            'south',
            'South Indian',
            'Temple Craft',
            'https://YOUR-SITE-DOMAIN.my.site.com/resource/South_Indian_Necklace'
        ));

        info.recommendedCard = buildItem(
            'recommended',
            'The Mangala Kalasha Set',
            '22KT Hallmarked Yellow Gold',
            'https://YOUR-SITE-DOMAIN.my.site.com/resource/Final_Necklace_Image'
        );

        DeOptionsSelectionResponseV3 resp = new DeOptionsSelectionResponseV3();
        resp.result = info;
        return resp;
    }

    private static DeOptionsSelectionItemV3 buildItem(
        String value,
        String title,
        String subtitle,
        String imageUrl
    ) {
        DeOptionsSelectionItemV3 item = new DeOptionsSelectionItemV3();
        item.value = value;
        item.title = title;
        item.subtitle = subtitle;
        item.imageUrl = imageUrl;
        return item;
    }
}
