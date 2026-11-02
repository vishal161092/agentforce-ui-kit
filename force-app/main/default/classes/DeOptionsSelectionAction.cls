global class DeOptionsSelectionAction {
    
    global class Input {
        @InvocableVariable(required=false)
        global String questionLabel;

        @InvocableVariable(required=false)
        global List<String> options;
    }

    @InvocableMethod(label='Get Options Selection' description='Returns a UI component that displays selectable options')
    global static List<DeOptionsSelectionResponse> getOptionsSelection(List<Input> inputs) {
        List<DeOptionsSelectionResponse> outputList = new List<DeOptionsSelectionResponse>();

        for (Input inp : inputs) {
            // 1. Create the Data Object
            DeOptionsSelectionInfo info = new DeOptionsSelectionInfo();
            info.questionLabel = String.isBlank(inp.questionLabel) ? 'When is the celebration?' : inp.questionLabel;
            // Use provided options or default options from image
            if (inp.options != null && !inp.options.isEmpty()) {
                info.options = inp.options;
            } else {
                // Default options based on the updated UI reference
                info.options = new List<String>{
                    'Within 3 Months',
                    '6 - 12 Months',
                    'Next Year',
                    'Dates Pending'
                };
            }

            // 2. Put it inside the Envelope
            DeOptionsSelectionResponse resp = new DeOptionsSelectionResponse();
            resp.result = info;

            outputList.add(resp);
        }

        return outputList;
    }
}