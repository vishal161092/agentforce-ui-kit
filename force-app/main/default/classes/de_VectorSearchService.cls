public class de_VectorSearchService {

    @InvocableMethod(label='Search Knowledge Base')
    public static List<Response> getPrompt(List<Request> requests) {

        Request input = requests[0];
        String firstQues = input.inputQuery;
        String context = '';
        Integer maxContextLength = 4000;

        ConnectApi.CdpQueryInput queryInput = new ConnectApi.CdpQueryInput();
        queryInput.sql = 'SELECT cc.Chunk__c FROM vector_search(' +
            'table(Brightwave_Web_Crawler_v2_index__dlm), ' +
            '\'' + String.escapeSingleQuotes(firstQues) + '\', ' +
            '\'\', 20) v ' +
            'JOIN Brightwave_Web_Crawler_v2_chunk__dlm cc ON v.SourceRecordId__c = cc.RecordId__c ' +
            'JOIN Brightwave_Web_Crawler__dlm c ON cc.SourceRecordId__c = c.ExternalSourceId__c ' +
            'WHERE cc.Chunk__c != \'\' AND LENGTH(cc.Chunk__c) > 50 ' +
            'ORDER BY score__c DESC LIMIT 50';

        ConnectApi.CdpQueryOutput response = ConnectApi.CdpQuery.queryAnsiSql(queryInput);

        List<Object> data = response.data;
        for (Object record : data) {
            String recordStr = JSON.serialize(record);
            Map<String, Object> row = (Map<String, Object>) JSON.deserializeUntyped(recordStr);
            String chunk = (String) row.get('Chunk__c');
            if (String.isNotBlank(chunk) && chunk.length() > 50) {
                if (context.length() + chunk.length() > maxContextLength) {
                    break;
                }
                context = context + '\n\n' + chunk;
            }
        }

        List<Response> responses = new List<Response>();
        Response res = new Response();
        res.Prompt = context;
        responses.add(res);
        return responses;
    }

    public class Request {
        @InvocableVariable(required=true)
        public String inputQuery;
    }

    public class Response {
        @InvocableVariable
        public String Prompt;
    }
}
