/**
 * Controller for the de_custom_chat_header MIAW custom header LWC.
 *
 * Resolves the active MessagingSession for a given platform key and builds a
 * parameterized SurveyMonkey feedback URL keyed to the related Case Id and its
 * owner User Id. Called from the header when a human agent joins the
 * conversation (PARTICIPANT_JOINED with role=Agent).
 */
public with sharing class de_HeaderController {
    // Base feedback-survey URL. Replace with your own survey link before go-live.
    private static final String SURVEY_BASE_URL = 'https://example.com/survey';

    /**
     * Wrapper returned to the LWC.
     */
    public class SessionInfo {
        @AuraEnabled
        public String messagingSessionId { get; set; }
        @AuraEnabled
        public String caseId { get; set; }
        @AuraEnabled
        public String ownerId { get; set; }
        @AuraEnabled
        public String surveyUrl { get; set; }
    }

    /**
     * Resolve the active MessagingSession for a platform key and build the
     * SurveyMonkey feedback URL.
     *
     * @param platformKey The EndUser platform key captured from the
     *                    PARTICIPANT_JOINED payload.
     * @return SessionInfo with the survey URL, or null when no active session
     *         is found.
     */
    @AuraEnabled(cacheable=false)
    public static SessionInfo getSessionInfo(String platformKey) {
        if (String.isBlank(platformKey)) {
            return null;
        }

        List<MessagingSession> sessions = [
            SELECT Id, CaseId, OwnerId, Status
            FROM MessagingSession
            WHERE MessagingEndUser.MessagingPlatformKey = :platformKey
              AND Status IN ('Active', 'Waiting')
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];

        if (sessions.isEmpty()) {
            return null;
        }

        MessagingSession session = sessions[0];

        SessionInfo info = new SessionInfo();
        info.messagingSessionId = session.Id;
        info.caseId = session.CaseId;
        info.ownerId = session.OwnerId;
        info.surveyUrl = buildSurveyUrl(session.CaseId, session.OwnerId);
        return info;
    }

    /**
     * Build the parameterized SurveyMonkey URL keyed to the Case Id and owner
     * User Id.
     */
    private static String buildSurveyUrl(Id caseId, Id ownerId) {
        String url = SURVEY_BASE_URL;
        List<String> params = new List<String>();
        if (caseId != null) {
            params.add('case=' + EncodingUtil.urlEncode(String.valueOf(caseId), 'UTF-8'));
        }
        if (ownerId != null) {
            params.add('owner=' + EncodingUtil.urlEncode(String.valueOf(ownerId), 'UTF-8'));
        }
        if (!params.isEmpty()) {
            url += '?' + String.join(params, '&');
        }
        return url;
    }
}
