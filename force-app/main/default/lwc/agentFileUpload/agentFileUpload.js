import { LightningElement, api } from 'lwc';

export default class AgentFileUpload extends LightningElement {
    _value;

    // Agentforce sets @api value AFTER mount, so parse in the setter (with a
    // connectedCallback fallback) rather than relying on a plain @api getter.
    @api
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
        this.parseValue();
    }

    recordId;
    locked = false;

    connectedCallback() {
        this.parseValue();
    }

    parseValue() {
        let data = this._value;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = null;
            }
        }
        // Tolerate the Info shape ({targetRecordId}) or the envelope ({result:{...}}).
        this.recordId =
            data?.targetRecordId ||
            data?.result?.targetRecordId ||
            null;
    }

    get recordIdDisplay() {
        return this.recordId || '(empty — this is why upload is Unauthorized)';
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        // eslint-disable-next-line no-console
        console.log('No. of files uploaded : ' + uploadedFiles.length);

        try {
            if (typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage) {
                embeddedservice_configuration.util.sendTextMessage('The file has been successfully uploaded')
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error('Error sending upload confirmation', error);
                    });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error in handleUploadFinished', error);
        } finally {
            this.locked = true;
        }
    }
}
