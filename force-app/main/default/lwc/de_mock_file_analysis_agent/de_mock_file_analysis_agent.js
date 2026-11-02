import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";

/**
 * de_mock_file_analysis_agent
 *
 * A MOCK "AI File Analysis" component for a record page. It displays up to
 * three Salesforce Files (by ContentDocument Id) alongside pre-canned analysis
 * results, mimicking a Technical Support Specialist's incident dossier. All
 * analysis text is hardcoded demo data — nothing is actually computed.
 *
 * The three ContentDocument Ids are configurable from Lightning App Builder
 * (design attributes fileId1 / fileId2 / fileId3), so you can drop the
 * component on any record page and paste in the Ids without a redeploy.
 */

// Pre-canned analysis blocks, one per slot (index 0..2). Themed to match the
// declined-payment journey: checkout decline screenshot + customer account
// status + transaction network log — all pointing to a known Brightwave Backend
// systems issue (NOT fraud; account and funds are healthy).
const MOCK_ANALYSES = [
    {
        heading: "Payment Declined Screenshot",
        fileType: "Image • PNG",
        iconName: "doctype:image",
        status: "Analyzed",
        confidence: 98,
        verdict: "Confirms decline",
        verdictClass: "de-badge de-badge-warning",
        summary:
            "Customer-submitted screenshot of the ExampleShop checkout failure. OCR captured the on-screen decline notice, payment method, and cart.",
        findings: [
            { icon: "utility:check", type: "ok", text: "OCR text: “Payment Declined — unable to process your payment of $144.99”" },
            { icon: "utility:link", type: "info", text: "Merchant: exampleshop.test — Payment Details (Aurora ••••4321)" },
            { icon: "utility:moneybag", type: "info", text: "Cart: Mechanical Keyboard $89.99 + Gaming Mouse $55.00 = $144.99" },
            { icon: "utility:warning", type: "warn", text: "Root cause shown: “Error Code 91 — Issuer System Unavailable”" },
            { icon: "utility:check", type: "ok", text: "On-screen note: “Network Processing Error via Brightwave Backend”" }
        ],
        recommendation:
            "Screenshot confirms a network/issuer-side decline (Error 91) at exampleshop.test — not a card or funds problem. Consistent with the Brightwave Backend incident."
    },
    {
        heading: "Customer Profile & Account Status",
        fileType: "Text • TXT",
        iconName: "doctype:txt",
        status: "Analyzed",
        confidence: 99,
        verdict: "Account healthy",
        verdictClass: "de-badge de-badge-success",
        summary:
            "Account snapshot for the cardholder (Aurora ••••4321) captured at the time of the declined transaction.",
        findings: [
            { icon: "utility:check", type: "ok", text: "Account status: Active / Unblocked" },
            { icon: "utility:check", type: "ok", text: "Available balance: verified — sufficient funds for the $144.99 attempt" },
            { icon: "utility:check", type: "ok", text: "Fraud flags: None (clear)" },
            { icon: "utility:check", type: "ok", text: "Identity: verified via Agentforce Bot (chat)" },
            { icon: "utility:info", type: "info", text: "Account: Aurora ending 4321" }
        ],
        recommendation:
            "Account is active with sufficient funds and no fraud flags — rules out insufficient funds or an account block as the cause of the decline."
    },
    {
        heading: "Transaction Network Log",
        fileType: "Text • TXT",
        iconName: "doctype:txt",
        status: "Analyzed",
        confidence: 97,
        verdict: "Backend issue",
        verdictClass: "de-badge de-badge-warning",
        summary:
            "Automated payment-network capture for the declined authorization at exampleshop.test (Online Secure Checkout).",
        findings: [
            { icon: "utility:moneybag", type: "info", text: "exampleshop.test — $144.99 USD (Keyboard $89.99 + Mouse $55.00)" },
            { icon: "utility:warning", type: "warn", text: "Gateway response: Declined — ISO 8583 Code 91" },
            { icon: "utility:error", type: "warn", text: "System error detail: “Issuer System Unavailable”" },
            { icon: "utility:warning", type: "warn", text: "Routing node: Brightwave Backend Gateway (Node 4)" },
            { icon: "utility:info", type: "info", text: "Captured 2026-09-09T12:05:14Z" }
        ],
        recommendation:
            "Decline is a Brightwave Backend gateway failure (Node 4, Code 91: Issuer System Unavailable), not the card. Link to the master incident report and route to Technical Support."
    }
];

export default class DeMockFileAnalysisAgent extends NavigationMixin(LightningElement) {
    /** ContentDocument Id for the first file (Payment Declined screenshot). */
    @api fileId1 = "069Hu00000iVvm4IAC";
    /** ContentDocument Id for the second file (Customer Profile Account Status). */
    @api fileId2 = "069Hu00000iVvm9IAC";
    /** ContentDocument Id for the third file (Transaction Network Log). */
    @api fileId3 = "069Hu00000iVvmAIAS";

    /** Optional card title override. */
    @api cardTitle = "Backend Incident Dossier — AI Analysis";

    // Tracks which previews failed to load an <img> (non-image files), so we can
    // fall back to a doctype icon.
    imageFailed = {};

    // Tracks which file cards are expanded. Collapsed by default to stay compact.
    expandedKeys = {};

    /**
     * Build the display model by pairing each configured ContentDocument Id
     * with its pre-canned analysis block.
     * @returns {Array}
     */
    get files() {
        const ids = [this.fileId1, this.fileId2, this.fileId3];
        return ids.map((docId, index) => {
            const analysis = MOCK_ANALYSES[index];
            const cleanId = (docId || "").trim();
            const hasId = !!cleanId;
            const key = `file-${index}`;
            const isOpen = !!this.expandedKeys[key];
            return {
                key,
                docId: cleanId,
                hasId,
                isOpen,
                bodyClass: isOpen ? "de-body de-body-open" : "de-body",
                chevron: isOpen ? "utility:chevronup" : "utility:chevrondown",
                showImage: hasId && !this.imageFailed[cleanId],
                previewUrl: hasId
                    ? `/sfc/servlet.shepherd/document/download/${cleanId}`
                    : null,
                ...analysis,
                confidenceStyle: `width: ${analysis.confidence}%;`,
                findings: analysis.findings.map((f, fi) => ({
                    ...f,
                    key: `f-${index}-${fi}`,
                    iconVariant: f.type === "ok" ? "success" : f.type === "warn" ? "warning" : "",
                    itemClass: `de-finding de-finding-${f.type}`
                }))
            };
        });
    }

    /** Count of slots that actually have a file Id configured. */
    get analyzedCount() {
        return [this.fileId1, this.fileId2, this.fileId3].filter((id) => (id || "").trim()).length;
    }

    /** Sub-header status line. */
    get dossierStatus() {
        return `${this.analyzedCount} of 3 artifacts analyzed · Linked to master incident: Brightwave Backend`;
    }

    /** Whether no file Ids have been configured yet. */
    get isEmpty() {
        return this.analyzedCount === 0;
    }

    /**
     * When a preview <img> fails to load (e.g. the file isn't an image), fall
     * back to the doctype icon.
     */
    handleImageError(event) {
        const docId = event.currentTarget.dataset.id;
        if (docId) {
            this.imageFailed = { ...this.imageFailed, [docId]: true };
        }
    }

    /**
     * Expand/collapse a file card's analysis body.
     */
    handleToggle(event) {
        const key = event.currentTarget.dataset.key;
        if (key) {
            this.expandedKeys = { ...this.expandedKeys, [key]: !this.expandedKeys[key] };
        }
    }

    /**
     * Open the native Salesforce file-preview overlay for the file.
     */
    handlePreview(event) {
        event.stopPropagation();
        const docId = event.currentTarget.dataset.id;
        if (!docId) {
            return;
        }
        this[NavigationMixin.Navigate]({
            type: "standard__namedPage",
            attributes: { pageName: "filePreview" },
            state: {
                recordIds: docId,
                selectedRecordId: docId
            }
        });
    }
}
