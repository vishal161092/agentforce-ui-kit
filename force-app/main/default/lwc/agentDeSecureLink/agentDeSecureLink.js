import { LightningElement, api } from 'lwc';

export default class AgentDeSecureLink extends LightningElement {
    _value;

    constructor() {
        super();
        // eslint-disable-next-line no-console
        console.log('[SecureLink] constructor v4-diagnostic');
    }

    @api
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
        try {
            // eslint-disable-next-line no-console
            console.log('[SecureLink] value set =', JSON.stringify(v));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log('[SecureLink] value set (non-serializable) =', v);
        }
    }

    connectedCallback() {
        // eslint-disable-next-line no-console
        console.log('[SecureLink] connectedCallback');
    }

    renderedCallback() {
        // eslint-disable-next-line no-console
        console.log('[SecureLink] renderedCallback (static v5)');
    }

    errorCallback(error, stack) {
        // eslint-disable-next-line no-console
        console.error('[SecureLink] errorCallback', error, stack);
    }

    get title() {
        return this._value?.title || 'Your secure, one-time gift card link';
    }

    get url() {
        return this._value?.url || '';
    }

    get note() {
        return this._value?.note || '';
    }
}
