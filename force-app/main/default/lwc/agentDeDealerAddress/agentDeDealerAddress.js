import { LightningElement, api } from 'lwc';

export default class AgentDeDealerAddress extends LightningElement {
    @api value;

    showFeedback = false;
    feedbackSent = false;
    selectedFeedback = null;
    feedbackTimer;

    get heading() {
        return this.value?.heading || 'Dealers Near You';
    }

    get dealers() {
        const items = this.value?.dealers;
        if (items && items.length) {
            return items.map((d, i) => ({
                id: `dealer-${i}`,
                name: d.name || '',
                category: d.category || '',
                address: d.address || '',
                mapsUrl: d.mapsUrl || '',
                hasMapsUrl: !!d.mapsUrl
            }));
        }
        return [];
    }

    get hasDealers() {
        return this.dealers.length > 0;
    }

    get yesBtnClass() {
        return this.selectedFeedback === 'Yes'
            ? 'de-da-feedback-btn de-da-feedback-btn-selected'
            : 'de-da-feedback-btn';
    }

    get noBtnClass() {
        return this.selectedFeedback === 'No'
            ? 'de-da-feedback-btn de-da-feedback-btn-no-selected'
            : 'de-da-feedback-btn';
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

    handleMapsClick(event) {
        const url = event.currentTarget.dataset.url;
        if (url) {
            try {
                window.top.open(url, '_blank');
            } catch (e) {
                window.open(url, '_blank');
            }
        }
    }

    handleFeedbackClick(event) {
        if (this.feedbackSent) return;
        const val = event.currentTarget.dataset.value;
        this.selectedFeedback = val;
        this.feedbackSent = true;
        const message = val === 'Yes' ? 'Yes this helps' : 'No it didn\'t help';
        this.sendMessageToChat(message);
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
