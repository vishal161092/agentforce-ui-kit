global class de_ServReqAction {
    private static final List<String> DEFAULT_OPTIONS = new List<String>{
        'Create User',
        'Delete User',
        'Update User',
        'Initiate Incident Creation',
        'Perform User Activities',
        'Handle Data BackUp'
    };

    global class Input {
        @InvocableVariable(label='User Query' description='The user request text' required=false)
        global String userQuery;

        @InvocableVariable(label='Prompt Label' description='Label/question shown above the options' required=false)
        global String promptLabel;

        @InvocableVariable(label='Options CSV' description='Comma-separated option values to display (e.g. UAT, QA, SBX1, SBX2)' required=false)
        global String optionsCsv;
    }

    global class Output {
        @InvocableVariable(label='Service Request Selector' description='Payload for the de_ServReq Lightning Type renderer')
        global de_ServReqInfo serviceRequestSelector;
    }

    @InvocableMethod(
        label='Get DE Service Request Selector'
        description='Returns service request options for the de_ServReq Lightning Type'
    )
    global static List<Output> getServiceRequests(List<Input> inputs) {
        List<Output> outputList = new List<Output>();

        for (Input inp : inputs) {
            de_ServReqInfo info = new de_ServReqInfo();

            info.promptLabel = String.isNotBlank(inp.promptLabel)
                ? inp.promptLabel
                : 'Please select the type of service request you want to raise.';

            if (String.isNotBlank(inp.optionsCsv)) {
                List<String> parsed = new List<String>();
                for (String opt : inp.optionsCsv.split(',')) {
                    String trimmed = opt.trim();
                    if (String.isNotBlank(trimmed)) {
                        parsed.add(trimmed);
                    }
                }
                info.options = parsed;
            } else {
                info.options = DEFAULT_OPTIONS;
            }

            Output out = new Output();
            out.serviceRequestSelector = info;
            outputList.add(out);
        }

        return outputList;
    }
}
