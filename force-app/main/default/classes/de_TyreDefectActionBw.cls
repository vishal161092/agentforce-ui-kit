global class de_TyreDefectActionBw {

    global class Input {
        @InvocableVariable(required=true description='The Case record Id to attach the voucher to')
        global String caseId;
    }

    @InvocableMethod(
        label='Get Tyre Defect Analysis Bw'
        description='Analyzes tyre defect images, attaches a warranty voucher PDF to the Case, and returns the result card.'
    )
    global static List<de_TyreDefectResponseBw> getTyreDefectAnalysis(List<Input> inputs) {
        List<de_TyreDefectResponseBw> outputList = new List<de_TyreDefectResponseBw>();
        if (inputs == null || inputs.isEmpty()) {
            outputList.add(buildResponse(null));
            return outputList;
        }

        for (Input inp : inputs) {
            outputList.add(buildResponse(inp));
        }

        return outputList;
    }

    private static de_TyreDefectResponseBw buildResponse(Input inp) {
        de_TyreDefectInfoBw info = new de_TyreDefectInfoBw();

        info.caseId = (inp != null && !String.isBlank(inp.caseId)) ? inp.caseId : '';

        if (inp != null && !String.isBlank(inp.caseId)) {
            try {
                attachVoucherToCase(inp.caseId);
            } catch (Exception e) {
                System.debug('Error attaching voucher: ' + e.getMessage());
            }
        }

        de_TyreDefectResponseBw resp = new de_TyreDefectResponseBw();
        resp.result = info;
        return resp;
    }

    @AuraEnabled
    public static String getVoucherUrl(String caseId) {
        return new VoucherUrlHelper().query(caseId);
    }

    without sharing class VoucherUrlHelper {
        public String query(String caseId) {
            List<ContentDocumentLink> links = [
                SELECT ContentDocumentId FROM ContentDocumentLink
                WHERE LinkedEntityId = :caseId
                AND ContentDocument.Title = 'Brightwave_Warranty_Voucher'
                ORDER BY SystemModstamp DESC
                LIMIT 1
            ];
            if (links.isEmpty()) return null;

            Id docId = links[0].ContentDocumentId;
            List<ContentVersion> versions = [
                SELECT Id FROM ContentVersion
                WHERE ContentDocumentId = :docId
                ORDER BY SystemModstamp DESC
                LIMIT 1
            ];
            if (versions.isEmpty()) return null;

            List<ContentDistribution> dists = [
                SELECT DistributionPublicUrl FROM ContentDistribution
                WHERE ContentVersionId = :versions[0].Id
                ORDER BY SystemModstamp DESC
                LIMIT 1
            ];
            if (dists.isEmpty()) return null;

            return dists[0].DistributionPublicUrl;
        }
    }

    private static String attachVoucherToCase(String caseId) {
        StaticResource sr = [
            SELECT Body FROM StaticResource WHERE Name = 'bwWarrantyVoucher' LIMIT 1
        ];

        ContentVersion cv = new ContentVersion();
        cv.Title = 'Brightwave_Warranty_Voucher';
        cv.PathOnClient = 'Brightwave_Warranty_Voucher.pdf';
        cv.VersionData = sr.Body;
        cv.Origin = 'C';
        insert cv;

        Id contentDocId = [
            SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1
        ].ContentDocumentId;

        // Remove existing links of this document to other Cases
        List<ContentDocumentLink> existingLinks = [
            SELECT Id FROM ContentDocumentLink
            WHERE ContentDocumentId = :contentDocId
            AND LinkedEntityId != :cv.Id
        ];
        if (!existingLinks.isEmpty()) {
            delete existingLinks;
        }

        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = contentDocId;
        cdl.LinkedEntityId = caseId;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        insert cdl;

        ContentDistribution dist = new ContentDistribution();
        dist.Name = 'Brightwave_Warranty_Voucher';
        dist.ContentVersionId = cv.Id;
        dist.PreferencesAllowViewInBrowser = true;
        dist.PreferencesAllowOriginalDownload = true;
        insert dist;

        ContentDistribution createdDist = [
            SELECT DistributionPublicUrl FROM ContentDistribution WHERE Id = :dist.Id LIMIT 1
        ];

        String publicUrl = createdDist.DistributionPublicUrl;
        return EncodingUtil.base64Encode(Blob.valueOf(publicUrl));
    }
}
