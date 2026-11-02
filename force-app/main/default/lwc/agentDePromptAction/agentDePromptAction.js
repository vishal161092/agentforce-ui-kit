import { LightningElement, api, track } from 'lwc';

export default class AgentDePromptAction extends LightningElement {
    @track _envelope = {};
    @track isLoading = true;

    @api
    get value() {
        return this._envelope;
    }

    set value(input) {
        if (input) {
            try {
                this._envelope = (typeof input === 'string') ? JSON.parse(input) : input;
            } catch (e) {
                this._envelope = input;
            }
        }
        this.isLoading = false;
    }

    get promptData() {
        return this._envelope?.response || this._envelope || {};
    }

    get hasData() {
        return this.promptData && Object.keys(this.promptData).length > 0;
    }

    get question() {
        return this.promptData?.question || '';
    }

    get answer() {
        return this.promptData?.answer || '';
    }

    get status() {
        return this.promptData?.status || '';
    }

    get isCompleted() {
        return this.status === 'COMPLETED';
    }
}
