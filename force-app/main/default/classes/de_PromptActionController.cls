public with sharing class de_PromptActionController {

    @InvocableMethod(label='Get Answers from Prompt' description='Accepts a question and returns the answer from Brightwave_Web_Crawler_Prompt for display in the de_prompt_action LWC')
    public static List<PromptEnvelope> getPromptResponse(List<String> questions) {
        String question = (questions != null && !questions.isEmpty()) ? questions[0] : 'No question provided';

        PromptData pd = new PromptData();
        pd.question = question;
        pd.status = 'COMPLETED';

        try {
            ConnectApi.EinsteinPromptTemplateGenerationsInput input = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
            input.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
            input.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';
            input.isPreview = false;

            Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();
            ConnectApi.WrappedValue questionVal = new ConnectApi.WrappedValue();
            questionVal.value = question;
            inputParams.put('Input:inputQuery', questionVal);
            input.inputParams = inputParams;

            ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result =
                ConnectApi.EinsteinLlm.generateMessagesForPromptTemplate(
                    'Brightwave_Web_Crawler_Prompt', input
                );

            if (result != null && result.generations != null && !result.generations.isEmpty()) {
                ConnectApi.EinsteinLlmGenerationItemOutput gen = result.generations[0];
                pd.answer = gen.text;
            } else {
                pd.answer = 'No response generated.';
                pd.status = 'ERROR';
            }
        } catch (Exception e) {
            pd.answer = 'Error: ' + e.getMessage();
            pd.status = 'ERROR';
        }

        PromptEnvelope env = new PromptEnvelope();
        env.response = pd;

        return new List<PromptEnvelope>{ env };
    }

    public class PromptEnvelope {
        @InvocableVariable
        public PromptData response;
    }

    @JsonAccess(serializable='always' deserializable='always')
    public class PromptData {
        @AuraEnabled public String question;
        @AuraEnabled public String answer;
        @AuraEnabled public String status;
    }
}
