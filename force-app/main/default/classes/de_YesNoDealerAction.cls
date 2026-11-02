global class de_YesNoDealerAction {

    global class Input {
        @InvocableVariable(required=false description='Optional question label')
        global String questionLabel;
    }

    @InvocableMethod(
        label='Get Yes No Dealer'
        description='Returns a Yes/No prompt asking if user wants to find a dealer nearby.'
    )
    global static List<de_YesNoDealerResponse> getYesNoDealer(List<Input> inputs) {
        List<de_YesNoDealerResponse> outputList = new List<de_YesNoDealerResponse>();
        if (inputs == null || inputs.isEmpty()) {
            outputList.add(buildResponse(null));
            return outputList;
        }

        for (Input inp : inputs) {
            outputList.add(buildResponse(inp));
        }

        return outputList;
    }

    private static de_YesNoDealerResponse buildResponse(Input inp) {
        de_YesNoDealerInfo info = new de_YesNoDealerInfo();
        info.questionLabel = (inp != null && !String.isBlank(inp.questionLabel))
            ? inp.questionLabel
            : 'Would you like to find a dealer near you?';
        info.yesMessage = 'Yes find a Dealer near me';
        info.noMessage = 'No I don\'t need a Dealer at the moment';

        de_YesNoDealerResponse resp = new de_YesNoDealerResponse();
        resp.result = info;
        return resp;
    }
}
