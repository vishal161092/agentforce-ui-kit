public with sharing class de_CustomerQueryAction {

    public class Request {
        @InvocableVariable(required=true label='Customer Question')
        public String question;
    }

    public class Response {
        @InvocableVariable(label='Customer Query Card' description='Structured payload for the de_CustomerQuery LWC renderer.')
        public de_CustomerQueryInfo customerQuery;

        @InvocableVariable
        public String message;

        @InvocableVariable
        public Boolean success;
    }

    @InvocableMethod(
        label='Display Customer Query'
        description='Accepts a customer question and returns it for rendering via the de_CustomerQuery Lightning type.'
    )
    public static List<Response> displayCustomerQuery(List<Request> requests) {
        List<Response> responses = new List<Response>();
        for (Request request : requests) {
            Response response = new Response();
            try {
                Map<String, Object> payload = new Map<String, Object>();
                payload.put('question', request.question);
                response.customerQuery = new de_CustomerQueryInfo(JSON.serialize(payload));
                response.success = true;
                response.message = 'Query rendered successfully.';
            } catch (Exception e) {
                response.success = false;
                response.message = 'Error: ' + e.getMessage();
                response.customerQuery = new de_CustomerQueryInfo('{"error":"' + e.getMessage().replace('"', '\\"') + '"}');
            }
            responses.add(response);
        }
        return responses;
    }
}
