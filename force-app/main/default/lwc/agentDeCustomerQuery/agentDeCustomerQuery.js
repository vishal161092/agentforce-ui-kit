import { LightningElement, api, track } from 'lwc';

export default class AgentDeCustomerQuery extends LightningElement {
    @api value;
    @track question = '';
    @track errorMessage = '';

    connectedCallback() {
        console.log('#### AgentDeCustomerQuery input:', this.value);
        try {
            if (!this.value || !this.value.queryJSON) {
                this.errorMessage = 'No query data provided.';
                return;
            }
            const raw = this.value.queryJSON;
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

            if (data?.error) {
                this.errorMessage = data.error;
                return;
            }
            this.question = data?.question || '';
        } catch (e) {
            console.error('AgentDeCustomerQuery parse error:', e);
            this.errorMessage = 'Error loading query card.';
        }
    }

    get hasData() {
        return !this.errorMessage && !!this.question;
    }
}
