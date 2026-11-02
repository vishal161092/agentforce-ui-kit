global class de_EmployeeActionSelectorInvocable {
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
    }

    global class Output {
        @InvocableVariable(label='Action Selector' description='Payload for the de_employeeActionSelector Lightning Type renderer')
        global de_EmployeeActionSelectorInfo actionSelector;
    }

    @InvocableMethod(
        label='Get DE Employee Action Selector'
        description='Returns employee action selector payload for the de_employeeActionSelector Lightning Type'
    )
    global static List<Output> getEmployeeActions(List<Input> inputs) {
        List<Output> outputList = new List<Output>();

        for (Input inp : inputs) {
            de_EmployeeActionSelectorInfo info = new de_EmployeeActionSelectorInfo();
            info.promptLabel = 'Please select the type of service request you want to raise.';
            info.options = DEFAULT_OPTIONS;

            Output out = new Output();
            out.actionSelector = info;
            outputList.add(out);
        }

        return outputList;
    }
}
