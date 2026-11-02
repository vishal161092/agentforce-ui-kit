import { LightningElement, api } from 'lwc';
import bwWheelImg from '@salesforce/resourceUrl/bwWheelImg';

export default class AgentDeCardWithData extends LightningElement {
    @api value;

    showFeedback = false;
    feedbackSent = false;
    selectedFeedback = null;
    feedbackTimer;

    get productName() {
        return this.value?.productName || 'Zenova Street Z1';
    }

    get productDescription() {
        return this.value?.productDescription || '';
    }

    get productImageUrl() {
        const url = this.value?.imageUrl || '';
        if (url && url.startsWith('http')) {
            return url;
        }
        return bwWheelImg;
    }

    get tyreSize() {
        return this.value?.tyreSize || '';
    }

    get features() {
        const feats = this.value?.features;
        if (feats && feats.length) {
            return feats.map((f, i) => ({ id: `feat-${i}`, text: f }));
        }
        return [];
    }

    get hasFeatures() {
        return this.features.length > 0;
    }

    get ctaLabel() {
        return this.value?.ctaLabel || 'View Product Details';
    }

    get ctaUrl() {
        return this.value?.ctaUrl || 'https://example.com/products/zenova-street-z1/';
    }

    handleCtaClick() {
        const url = this.ctaUrl;
        try {
            window.top.open(url, '_blank');
        } catch (e) {
            window.open(url, '_blank');
        }
    }

    get yesBtnClass() {
        return this.selectedFeedback === 'Yes'
            ? 'de-card-feedback-btn de-card-feedback-btn-selected'
            : 'de-card-feedback-btn';
    }

    get noBtnClass() {
        return this.selectedFeedback === 'No'
            ? 'de-card-feedback-btn de-card-feedback-btn-no-selected'
            : 'de-card-feedback-btn';
    }

    connectedCallback() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.feedbackTimer = setTimeout(() => {
            this.showFeedback = true;
        }, 10000);
    }

    disconnectedCallback() {
        if (this.feedbackTimer) {
            clearTimeout(this.feedbackTimer);
        }
    }

    handleFeedbackClick(event) {
        if (this.feedbackSent) {
            return;
        }
        const val = event.currentTarget.dataset.value;
        this.selectedFeedback = val;
        this.feedbackSent = true;
        const message = val === 'Yes' ? 'Yes this helps' : 'No it didn\'t help';
        this.sendMessageToChat(message);
    }

    sendMessageToChat(message) {
        if (!message) {
            return;
        }
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
