import { LightningElement, api, track } from 'lwc';

export default class AgentDeScriptOptionSelection extends LightningElement {
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

    get optionData() {
        return this._envelope?.response || this._envelope || {};
    }

    get hasData() {
        return this.optionData && Object.keys(this.optionData).length > 0;
    }

    get questionLabel() {
        return this.optionData?.questionLabel || '';
    }

    get htmlContent() {
        return this.optionData?.htmlContent || '';
    }

}
