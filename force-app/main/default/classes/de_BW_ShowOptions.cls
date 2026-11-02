/**
 * Echo-style invocable for the "Brightwave Option Selector" Lightning type (de_bwOptionSelector).
 * `options` is a delimited string (pipe, comma or newline) or a JSON array of strings.
 */
public with sharing class de_BW_ShowOptions {

    public class Request {
        @InvocableVariable(label='Options' description='Options as a JSON array, or a pipe/comma/newline separated string' required=true)
        public String options;
        @InvocableVariable(label='Prompt Message' description='Text shown above the options')
        public String prompt_message;
    }

    @JsonAccess(serializable='always' deserializable='always')
    public class OptionsResponse {
        @InvocableVariable @AuraEnabled public String options;
        @InvocableVariable @AuraEnabled public String promptMessage;
    }

    @InvocableMethod(
        label='Show Options'
        description='Returns selectable options for the de_bwOptionSelector Lightning type.'
    )
    public static List<OptionsResponse> showOptions(List<Request> requests) {
        List<OptionsResponse> out = new List<OptionsResponse>();
        if (requests == null) {
            return out;
        }
        for (Request r : requests) {
            OptionsResponse resp = new OptionsResponse();
            resp.options = r.options;
            resp.promptMessage = r.prompt_message;
            out.add(resp);
        }
        return out;
    }
}
