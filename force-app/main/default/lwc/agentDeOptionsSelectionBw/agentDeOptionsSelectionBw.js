import { LightningElement, api } from 'lwc';
import bwIconTyre from '@salesforce/resourceUrl/bwIconTyre';
import bwIconDealer from '@salesforce/resourceUrl/bwIconDealer';
import bwIconWarranty from '@salesforce/resourceUrl/bwIconWarranty';
import bwIconOther from '@salesforce/resourceUrl/bwIconOther';
import bwIconCity from '@salesforce/resourceUrl/bwIconCity';
import bwIconHighway from '@salesforce/resourceUrl/bwIconHighway';
import bwIconMountain from '@salesforce/resourceUrl/bwIconMountain';
import bwIconScooter from '@salesforce/resourceUrl/bwIconScooter';
import bwIconMotorcycle from '@salesforce/resourceUrl/bwIconMotorcycle';

const ICON_MAP = {
    'bwIconTyre': bwIconTyre,
    'bwIconDealer': bwIconDealer,
    'bwIconWarranty': bwIconWarranty,
    'bwIconOther': bwIconOther,
    'bwIconCity': bwIconCity,
    'bwIconHighway': bwIconHighway,
    'bwIconMountain': bwIconMountain,
    'bwIconScooter': bwIconScooter,
    'bwIconMotorcycle': bwIconMotorcycle
};

export default class AgentDeOptionsSelectionBw extends LightningElement {
    @api value;

    selectedOption = null;
    messageSent = false;

    get questionLabel() {
        return this.value?.questionLabel || 'Please select an option';
    }

    get normalizedOptions() {
        const cards = this.value?.optionCards;
        const fallback = [
            { value: 'Option A', title: 'Option A', subtitle: '', iconName: 'bwIconOther' },
            { value: 'Option B', title: 'Option B', subtitle: '', iconName: 'bwIconOther' },
            { value: 'Option C', title: 'Option C', subtitle: '', iconName: 'bwIconOther' }
        ];

        const source = cards?.length ? cards : fallback;
        return source.map((item, index) => {
            const value = item.value || item.title || `option-${index}`;
            const selected = value === this.selectedOption;
            const iconKey = item.iconName || 'bwIconOther';
            return {
                id: `${value}-${index}`,
                value,
                title: item.title || value,
                subtitle: item.subtitle || '',
                iconUrl: ICON_MAP[iconKey] || bwIconOther,
                selected,
                notSelected: !selected,
                cardClass: selected ? 'de-bw-card de-bw-card-selected' : 'de-bw-card'
            };
        });
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
        }
    }
}
