global class de_YesNoAction {

    global class Input {
        @InvocableVariable(required=false description='Optional question label')
        global String questionLabel;
    }

    @InvocableMethod(
        label='Get Yes No'
        description='Returns a simple Yes/No prompt. Sends "Yes" or "No" as the chat message.'
    )
    global static List<de_YesNoResponse> getYesNo(List<Input> inputs) {
        List<de_YesNoResponse> outputList = new List<de_YesNoResponse>();
        if (inputs == null || inputs.isEmpty()) {
            outputList.add(buildResponse(null));
            return outputList;
        }

        for (Input inp : inputs) {
            outputList.add(buildResponse(inp));
        }

        return outputList;
    }

    private static de_YesNoResponse buildResponse(Input inp) {
        de_YesNoInfo info = new de_YesNoInfo();
        info.questionLabel = (inp != null && !String.isBlank(inp.questionLabel))
            ? inp.questionLabel
            : 'Please select an option';
        info.yesMessage = 'Yes';
        info.noMessage = 'No';

        de_YesNoResponse resp = new de_YesNoResponse();
        resp.result = info;
        return resp;
    }
}
