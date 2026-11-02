import { LightningElement, api } from 'lwc';
import getVoucherUrl from '@salesforce/apex/de_TyreDefectActionBw.getVoucherUrl';

export default class AgentDeTyreDefectBw extends LightningElement {
    @api value;

    currentStep = 'upload'; // upload | loading | result
    uploadedFileCount = 0;
    uploadedFileNames = [];
    uploadDisabled = false;
    showFollowUp = false;
    selectedOption = null;
    messageSent = false;

    acceptedFormats = ['.jpg', '.jpeg', '.png', '.heic', '.webp'];

    connectedCallback() {
        console.log('agentDeTyreDefectBw connectedCallback, value:', JSON.stringify(this.value));
    }

    get caseId() {
        return this.value?.caseId || '';
    }

    get isUploadStep() {
        return this.currentStep === 'upload';
    }

    get isLoadingStep() {
        return this.currentStep === 'loading';
    }

    get isResultStep() {
        return this.currentStep === 'result';
    }

    get hasFiles() {
        return this.uploadedFileCount > 0;
    }

    get fileCountLabel() {
        return `${this.uploadedFileCount} file(s) uploaded`;
    }

    get canSubmit() {
        return this.uploadedFileCount >= 3;
    }

    analysisMessage = 'I have reviewed the images.';
    policyResult = 'As per Brightwave policy, this qualifies for a 100% Free of Charge (F.O.C.) replacement!';
    disclaimer = 'Note: Local workshop fitting charges and taxes may apply at the shop.';
    voucherMessage = "Here's your voucher that you can show to the store manager, and they will swap your tyre.";
    followUpMessage = 'I hope this helps!';

    _voucherUrl = '';

    get hasVoucher() {
        return !!this._voucherUrl;
    }

    fetchVoucherUrl() {
        console.log('fetchVoucherUrl called, caseId:', this.caseId);
        if (!this.caseId) return;
        getVoucherUrl({ caseId: this.caseId })
            .then(url => {
                console.log('getVoucherUrl returned:', url);
                if (url) this._voucherUrl = url;
            })
            .catch(err => {
                console.log('getVoucherUrl error:', err);
            });
    }

    get yesBtnClass() {
        return this.selectedOption === 'Yes'
            ? 'de-bw-yn-btn de-bw-yn-btn-yes de-bw-yn-btn-selected'
            : 'de-bw-yn-btn de-bw-yn-btn-yes';
    }

    get noBtnClass() {
        return this.selectedOption === 'No'
            ? 'de-bw-yn-btn de-bw-yn-btn-no de-bw-yn-btn-no-selected'
            : 'de-bw-yn-btn de-bw-yn-btn-no';
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.uploadedFileCount += uploadedFiles.length;
        this.uploadedFileNames = [
            ...this.uploadedFileNames,
            ...uploadedFiles.map(f => f.name)
        ];
    }

    handleSubmit() {
        this.uploadDisabled = true;
        this.currentStep = 'loading';

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this.currentStep = 'result';
            this.fetchVoucherUrl();
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                this.showFollowUp = true;
            }, 10000);
        }, 15000);
    }

    handleDownloadVoucher() {
        if (this._voucherUrl) {
            window.open(this._voucherUrl, '_blank');
        }
    }

    handleYesClick() {
        if (this.messageSent) return;
        this.selectedOption = 'Yes';
        this.messageSent = true;
        this.sendMessageToChat('Yes this helps');
    }

    handleNoClick() {
        if (this.messageSent) return;
        this.selectedOption = 'No';
        this.messageSent = true;
        this.sendMessageToChat('No this doesn\'t help');
    }

    sendMessageToChat(message) {
        if (!message) return;
        try {
            if (typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage) {
                embeddedservice_configuration.util.sendTextMessage(message).catch(() => {});
            }
        } catch (error) {
            // silent
        }
    }
}