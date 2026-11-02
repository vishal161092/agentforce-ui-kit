public with sharing class de_ScriptOptionSelectionController {

    @InvocableMethod(label='Get Script Option Selection' description='Returns selectable options for the de_script_option_selection LWC')
    public static List<OptionEnvelope> getOptions(List<String> inputs) {
        String input = (inputs != null && !inputs.isEmpty()) ? inputs[0] : '';

        List<String> optionsList;
        if (String.isNotBlank(input)) {
            optionsList = input.split(',');
            for (Integer i = 0; i < optionsList.size(); i++) {
                optionsList[i] = optionsList[i].trim();
            }
        } else {
            optionsList = new List<String>{
                'Within 3 Months',
                '6 - 12 Months',
                'Next Year',
                'Dates Pending'
            };
        }

        String htmlOptions = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">';
        for (String opt : optionsList) {
            htmlOptions += '<button style="padding:12px;border:2px solid #d8d8d8;border-radius:6px;background:#fff;font-weight:600;font-size:1rem;cursor:pointer;">' + opt + '</button>';
        }
        htmlOptions += '</div>';

        OptionData data = new OptionData();
        data.status = 'COMPLETED';
        data.questionLabel = 'When is the celebration?';
        data.htmlContent = htmlOptions;

        OptionEnvelope env = new OptionEnvelope();
        env.response = data;

        return new List<OptionEnvelope>{ env };
    }

    public class OptionEnvelope {
        @InvocableVariable
        public OptionData response;
    }

    @JsonAccess(serializable='always' deserializable='always')
    public class OptionData {
        @AuraEnabled public String status;
        @AuraEnabled public String questionLabel;
        @AuraEnabled public String htmlContent;
    }
}
