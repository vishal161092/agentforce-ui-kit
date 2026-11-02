import { LightningElement, api } from 'lwc';
import deLoanProducts from '@salesforce/resourceUrl/deLoanProducts';
import deApplyForLoan from '@salesforce/resourceUrl/deApplyForLoan';
import deLoanCase from '@salesforce/resourceUrl/deLoanCase';
import deLiveAgent from '@salesforce/resourceUrl/deLiveAgent';
import deTyping from '@salesforce/resourceUrl/deTyping';

export default class AgentDeOptionsSelectionV2 extends LightningElement {
    @api value;

    selectedOption = null;
    messageSent = false;

    get questionLabel() {
        return this.value?.questionLabel || 'When is the celebration?';
    }

    get listClass() {
        // Options are always shown directly (no collapse).
        return 'de-v2-list de-v2-list-open';
    }

    get normalizedOptions() {
        const cards = this.value?.optionCards;
        const fallback = [
            {
                value: 'Morning Vows',
                title: 'Morning Vows',
                subtitle: 'Pastels, polki, and ethereal elegance',
                iconName: 'utility:choice'
            },
            {
                value: 'Sundowner Ceremony',
                title: 'Sundowner Ceremony',
                subtitle: 'Golden hues and champagne diamonds',
                iconName: 'utility:choice'
            },
            {
                value: 'Evening Reception',
                title: 'Evening Reception',
                subtitle: 'Majestic gold and deep rubies',
                iconName: 'utility:choice'
            }
        ];

        const rawSource = cards?.length ? cards : fallback;
        // Skip the "Start Typing..." option for now.
        const source = rawSource.filter((item) => {
            const label = `${item.value || ''} ${item.title || ''}`.toLowerCase();
            return !label.includes('start typing') && !label.includes('type your');
        });
        return source.map((item, index) => {
            const value = item.value || item.title || `option-${index}`;
            const selected = value === this.selectedOption;
            const url = (item.url || '').trim();
            return {
                id: `${value}-${index}`,
                value,
                title: item.title || value,
                subtitle: item.subtitle || '',
                iconName: item.iconName || this.getOptionIcon(value, item.title),
                iconUrl: this.getOptionIconUrl(value, item.title),
                iconWrapClass: selected ? 'de-v2-icon-wrap de-v2-icon-wrap-selected' : 'de-v2-icon-wrap',
                // Keep full-color icons intact on selection (no maroon recolor filter).
                iconClass: 'de-v2-icon-image',
                cardClass: selected ? 'de-v2-card de-v2-card-selected' : 'de-v2-card',
                // When a url is present the card behaves as a link (opens in a new
                // tab) rather than sending its value back into the conversation.
                url,
                isLink: !!url,
            };
        });
    }

    getOptionIcon(value, title) {
        const key = `${value || ''} ${title || ''}`.toLowerCase();
        if (key.includes('explore') || key.includes('product')) {
            return 'utility:applied_amount';
        }
        if (key.includes('apply')) {
            return 'utility:add';
        }
        if (key.includes('case') || key.includes('status') || key.includes('check')) {
            return 'utility:record';
        }
        if (key.includes('agent') || key.includes('live') || key.includes('transfer')) {
            return 'utility:agent_session';
        }
        if (key.includes('typing') || key.includes('type') || key.includes('chat')) {
            return 'utility:chat';
        }
        return 'utility:choice';
    }

    getOptionIconUrl(value, title) {
        const key = `${value || ''} ${title || ''}`.toLowerCase();
        if (key.includes('explore') || key.includes('product')) {
            return deLoanProducts;
        }
        if (key.includes('apply')) {
            return deApplyForLoan;
        }
        if (key.includes('case') || key.includes('status') || key.includes('check')) {
            return deLoanCase;
        }
        if (key.includes('agent') || key.includes('live') || key.includes('transfer')) {
            return deLiveAgent;
        }
        if (key.includes('typing') || key.includes('type') || key.includes('chat')) {
            return deTyping;
        }
        return deLoanProducts;
    }

    get hasOptions() {
        return this.normalizedOptions.length > 0;
    }

    handleOptionClick(event) {
        if (this.messageSent) {
            return;
        }

        const selectedValue = event.currentTarget.dataset.value;
        this.selectedOption = selectedValue;

        this.dispatchEvent(
            new CustomEvent('optionselected', {
                detail: { selectedOption: selectedValue },
                bubbles: true
            })
        );

        this.sendMessageToChat(selectedValue);
    }

    sendMessageToChat(message) {
        if (this.messageSent || !message) {
            return;
        }

        try {
            if (typeof embeddedservice_configuration !== 'undefined' &&
                embeddedservice_configuration.util &&
                embeddedservice_configuration.util.sendTextMessage) {
                this.messageSent = true;
                embeddedservice_configuration.util.sendTextMessage(message).catch(() => {
                    this.messageSent = false;
                });
            }
        } catch (error) {
            this.messageSent = false;
            // eslint-disable-next-line no-console
            console.error('Error in sendMessageToChat:', error);
        }
    }
}
